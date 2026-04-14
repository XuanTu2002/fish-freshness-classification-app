import torch
import torch.nn as nn
import timm
from torchvision import transforms
from PIL import Image
from fastapi import FastAPI, UploadFile, File
import io
import numpy as np

app = FastAPI()

class SingleSwinGAPGMP(nn.Module):
    def __init__(self, model_name="swin_tiny_patch4_window7_224", num_classes=3, pretrained=False, drop_path_rate=0.0):
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

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL_NAME = "swin_tiny_patch4_window7_224" 
num_classes = 3
labels = ["Highly Fresh", "Fresh", "Not Fresh"]

model = SingleSwinGAPGMP(model_name=MODEL_NAME, num_classes=num_classes, pretrained=False)
model.load_state_dict(torch.load("fish_model.pth", map_location=device))
model.to(device)
model.eval()

preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    img_bytes = await file.read()
    image = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    input_tensor = preprocess(image).unsqueeze(0).to(device)
    
    with torch.no_grad():
        outputs_orig = model(input_tensor)
        outputs_hflip = model(torch.flip(input_tensor, dims=[3]))
        outputs_vflip = model(torch.flip(input_tensor, dims=[2]))
        outputs_hvflip = model(torch.flip(input_tensor, dims=[2, 3]))
        
        outputs_avg = (outputs_orig + outputs_hflip + outputs_vflip + outputs_hvflip) / 4.0
        probabilities = torch.nn.functional.softmax(outputs_avg[0], dim=0)
        conf, idx = torch.max(probabilities, 0)

    return {
        "label": labels[idx.item()],
        "confidence": float(conf.item()),
        "all_probs": {labels[i]: float(probabilities[i]) for i in range(len(labels))}
    }

@app.get("/")
def health_check():
    return {"status": "ready", "model": MODEL_NAME}