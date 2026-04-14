!pip install grad-cam timm seaborn

import os
import time
import copy
import random
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from PIL import Image
import timm

from pytorch_grad_cam import EigenCAM
from pytorch_grad_cam.utils.image import show_cam_on_image

class Config:
    DATA_ROOT = '/kaggle/input/datasets/huytu2025/fish-freshness-images/fish'
    WEIGHTS_PATH = '/kaggle/working/single_swin_gapgmp_v10.pth' 
    
    LABEL_SMOOTHING = 0.05
    
    # Model Config
    MODEL_NAME = 'swin_tiny_patch4_window7_224'
    NUM_CLASSES = 3
    PRETRAINED = True 
    DROP_PATH_RATE = 0.1 
    
    # Training Config
    IMG_SIZE = 224
    BATCH_SIZE = 64
    LEARNING_RATE = 1e-4
    WEIGHT_DECAY = 1e-2
    EPOCHS = 100
    EARLY_STOPPING_PATIENCE = 30
    
    # System Config
    SEED = 42
    DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
    NUM_WORKERS = 2
    CLASS_NAMES = ['Highly Fresh', 'Fresh', 'Not Fresh']

def set_seed(seed=42):
    random.seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

set_seed(Config.SEED)

class FishDataset(Dataset):
    def __init__(self, file_paths, labels, transform=None):
        self.file_paths = file_paths
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.file_paths)

    def __getitem__(self, idx):
        path = self.file_paths[idx]
        label = self.labels[idx]
        try:
            image = Image.open(path).convert('RGB')
            if self.transform:
                image = self.transform(image)
            return image, label, path
        except Exception:
            return torch.zeros((3, Config.IMG_SIZE, Config.IMG_SIZE)), label, path

data_transforms = {
    'train': transforms.Compose([
        transforms.Resize((Config.IMG_SIZE, Config.IMG_SIZE)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.5),
        transforms.RandomAffine(degrees=30, translate=(0.05, 0.05)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        transforms.RandomErasing(p=0.5, scale=(0.02, 0.1), ratio=(0.3, 3.3))
    ]),
    'eval': transforms.Compose([
        transforms.Resize((Config.IMG_SIZE, Config.IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
}

def prepare_dataloaders(root_dir):
    all_image_paths, all_labels = [], []
    classes = sorted(os.listdir(root_dir))

    for cls_name in classes:
        cls_folder = os.path.join(root_dir, cls_name)
        if not os.path.isdir(cls_folder): continue
        if 'Highly' in cls_name: label = 0
        elif 'Not' in cls_name: label = 2
        else: label = 1
            
        for img_name in sorted(os.listdir(cls_folder)):
            if img_name.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp')):
                all_image_paths.append(os.path.join(cls_folder, img_name))
                all_labels.append(label)

    X_train_val, X_test, y_train_val, y_test = train_test_split(
        all_image_paths, all_labels, test_size=0.20, stratify=all_labels, random_state=Config.SEED
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val, test_size=0.20, stratify=y_train_val, random_state=Config.SEED
    )

    train_dataset = FishDataset(X_train, y_train, transform=data_transforms['train'])
    val_dataset = FishDataset(X_val, y_val, transform=data_transforms['eval'])
    test_dataset = FishDataset(X_test, y_test, transform=data_transforms['eval'])

    dataloaders = {
        'train': DataLoader(train_dataset, batch_size=Config.BATCH_SIZE, shuffle=True, num_workers=Config.NUM_WORKERS),
        'val': DataLoader(val_dataset, batch_size=Config.BATCH_SIZE, shuffle=False, num_workers=Config.NUM_WORKERS),
        'test': DataLoader(test_dataset, batch_size=Config.BATCH_SIZE, shuffle=False, num_workers=Config.NUM_WORKERS)
    }
    return dataloaders

class SingleSwinGAPGMP(nn.Module):
    def __init__(self, model_name, num_classes=3, pretrained=True, drop_path_rate=0.0):
        super(SingleSwinGAPGMP, self).__init__()
        self.backbone = timm.create_model(
            model_name, 
            pretrained=pretrained, 
            num_classes=0,
            drop_path_rate=drop_path_rate
        )
        self.num_features = self.backbone.num_features 
        self.head = nn.Linear(self.num_features * 2, num_classes)

    def extract_features(self, x):
        x = self.backbone.forward_features(x)
        if hasattr(self.backbone, 'norm'):
            x = self.backbone.norm(x)
            
        if x.dim() == 4: 
            gap = x.mean(dim=[1, 2])
            gmp = x.amax(dim=[1, 2])
        elif x.dim() == 3: 
            gap = x.mean(dim=1)
            gmp = x.amax(dim=1)
        else:
            gap = x.mean(dim=[-2, -1])
            gmp = x.amax(dim=[-2, -1])
            
        return torch.cat([gap, gmp], dim=1)

    def forward(self, x):
        features = self.extract_features(x)
        logits = self.head(features)
        return logits

def initialize_model(steps_per_epoch):
    model = SingleSwinGAPGMP(
        Config.MODEL_NAME, 
        num_classes=Config.NUM_CLASSES, 
        pretrained=Config.PRETRAINED,
        drop_path_rate=Config.DROP_PATH_RATE
    )
    model = model.to(Config.DEVICE)
    optimizer = optim.AdamW(model.parameters(), lr=Config.LEARNING_RATE, weight_decay=Config.WEIGHT_DECAY)  
    criterion = nn.CrossEntropyLoss(label_smoothing=Config.LABEL_SMOOTHING)  
    scheduler = optim.lr_scheduler.OneCycleLR(
        optimizer, 
        max_lr=Config.LEARNING_RATE, 
        steps_per_epoch=steps_per_epoch, 
        epochs=Config.EPOCHS,
        pct_start=0.1
    )
    return model, optimizer, criterion, scheduler

def train_model(model, dataloaders, criterion, optimizer, scheduler, save_path):
    best_model_wts = copy.deepcopy(model.state_dict())
    best_acc = 0.0
    epochs_no_improve = 0
    
    for epoch in range(Config.EPOCHS):
        print(f'\nEpoch {epoch+1}/{Config.EPOCHS}')
        for phase in ['train', 'val']:
            model.train() if phase == 'train' else model.eval()

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels, _ in dataloaders[phase]:
                inputs, labels = inputs.to(Config.DEVICE), labels.to(Config.DEVICE)
                optimizer.zero_grad()
                
                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == 'train':
                        loss.backward()
                        optimizer.step()
                        scheduler.step()  # OneCycleLR yêu cầu step sau mỗi batch

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_loss = running_loss / len(dataloaders[phase].dataset)
            epoch_acc = running_corrects.double() / len(dataloaders[phase].dataset)

            if phase == 'val':
                print(f'Val Loss: {epoch_loss:.4f} | Val Acc: {epoch_acc:.4f}')
                if epoch_acc > best_acc:
                    best_acc = epoch_acc
                    best_model_wts = copy.deepcopy(model.state_dict())
                    epochs_no_improve = 0
                else:
                    epochs_no_improve += 1
        
        if epochs_no_improve >= Config.EARLY_STOPPING_PATIENCE:
            print(f"Early stopping triggered at epoch {epoch+1}!")
            break

    model.load_state_dict(best_model_wts)
    torch.save(model.state_dict(), save_path)
    return model

def evaluate_deep_model_advanced_tta(model, dataloader, device):
    model.eval()
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for inputs, labels, _ in dataloader:
            inputs = inputs.to(device)
            
            outputs_orig = model(inputs)
            outputs_hflip = model(torch.flip(inputs, dims=[3]))
            outputs_vflip = model(torch.flip(inputs, dims=[2]))
            outputs_hvflip = model(torch.flip(inputs, dims=[2, 3]))
            
            outputs_avg = (outputs_orig + outputs_hflip + outputs_vflip + outputs_hvflip) / 4.0
            _, preds = torch.max(outputs_avg, 1)
            
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())
            
    return np.array(all_labels), np.array(all_preds)

def plot_confusion_matrix(y_true, y_pred, class_names, title="Confusion Matrix"):
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=class_names, yticklabels=class_names)
    plt.xlabel('Predicted Label')
    plt.ylabel('True Label')
    plt.title(title)
    plt.show()

def reshape_transform(tensor):
    return tensor.permute(0, 3, 1, 2)

def generate_eigen_cam(model, image_path, device):
    model.eval()
    target_layers = [model.backbone.layers[-1].blocks[-1].norm1]
    
    image = Image.open(image_path).convert('RGB')
    input_tensor = data_transforms['eval'](image).unsqueeze(0).to(device)
    
    cam = EigenCAM(model=model, target_layers=target_layers, reshape_transform=reshape_transform)
    grayscale_cam = cam(input_tensor=input_tensor)[0, :]
    rgb_img = np.array(image.resize((224, 224))) / 255.0
    cam_image = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)
    
    plt.figure(figsize=(10, 5))
    plt.subplot(1, 2, 1)
    plt.imshow(rgb_img)
    plt.title('Original Image')
    plt.axis('off')
    
    plt.subplot(1, 2, 2)
    plt.imshow(cam_image)
    plt.title('EigenCAM Visualization')
    plt.axis('off')
    plt.show()

# ============ MAIN EXECUTION ============
print("\n--- Phase 1: Data Preparation ---")
dataloaders = prepare_dataloaders(Config.DATA_ROOT)

print("\n--- Phase 2: Architecture Initialization ---")
steps_per_epoch = len(dataloaders['train'])
model, optimizer, criterion, scheduler = initialize_model(steps_per_epoch)

print("\n--- Phase 3: Training Process ---")
if os.path.exists(Config.WEIGHTS_PATH):
    print(f"Found existing weights at {Config.WEIGHTS_PATH}. Skipping training!")
    model.load_state_dict(torch.load(Config.WEIGHTS_PATH, map_location=Config.DEVICE))
    best_model = model
else:
    print("Starting training with Label Smoothing (0.05), Drop Path (0.1), and OneCycleLR")
    best_model = train_model(model, dataloaders, criterion, optimizer, scheduler, Config.WEIGHTS_PATH)
    print(f"Model successfully saved at: {Config.WEIGHTS_PATH}")

print("\n--- Phase 4: Final Strict Evaluation on Test Set ---")
y_test_true, y_test_pred = evaluate_deep_model_advanced_tta(best_model, dataloaders['test'], Config.DEVICE)

print("\n=======================================================")
print(f"--- FINAL OPTIMAL RESULTS (V10: SWIN-TINY + ADVANCED TTA) ---")
print(f"Test Accuracy   : {accuracy_score(y_test_true, y_test_pred)*100:.2f}%")
print(f"Test Precision  : {precision_score(y_test_true, y_test_pred, average='weighted')*100:.2f}%")
print(f"Test Recall     : {recall_score(y_test_true, y_test_pred, average='weighted')*100:.2f}%")
print(f"Test F1-Score   : {f1_score(y_test_true, y_test_pred, average='weighted')*100:.2f}%")
print("=======================================================\n")
print(classification_report(y_test_true, y_test_pred, target_names=Config.CLASS_NAMES))

plot_title = "V10 Evaluation"
plot_confusion_matrix(y_test_true, y_test_pred, Config.CLASS_NAMES, title=plot_title)

print("\n--- Feature Interpretability (EigenCAM) ---")
sample_img_path = dataloaders['test'].dataset.file_paths[0]
generate_eigen_cam(best_model, sample_img_path, Config.DEVICE)
