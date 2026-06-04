import streamlit as st
import requests
from PIL import Image
import io
import json
from datetime import datetime
import time

# ========== CONFIGURATION ==========
st.set_page_config(
    page_title="Fish Freshness AI",
    layout="wide",
    initial_sidebar_state="collapsed",
    menu_items=None
)

# CSS for ocean blue color and responsive design
st.markdown("""
<style>
    :root {
        --ocean-blue: #0066cc;
        --ocean-dark: #004d99;
        --white: #ffffff;
        --light-gray: #f0f4f8;
    }
    
    * {
        margin: 0;
        padding: 0;
    }
    
    .main {
        background: linear-gradient(135deg, #e8f1f9 0%, #f5f8fc 100%);
        padding: 0;
    }
    
    .stButton>button {
        background-color: var(--ocean-blue);
        color: white;
        border: none;
        border-radius: 0.5rem;
        padding: 0.75rem 1.5rem;
        font-weight: 600;
        transition: all 0.3s ease;
        width: 100%;
    }
    
    .stButton>button:hover {
        background-color: var(--ocean-dark);
        box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
    }
    
    .big-button {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .freshness-box {
        border-radius: 1.5rem;
        padding: 2rem;
        text-align: center;
        margin: 1rem 0;
        color: white;
        font-size: 1.5rem;
        font-weight: 700;
    }
    
    .freshness-high {
        background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    }
    
    .freshness-medium {
        background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
    }
    
    .freshness-low {
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    }
    
    .confidence-bar {
        background: #ecf0f1;
        border-radius: 1rem;
        height: 2rem;
        margin: 1rem 0;
        position: relative;
        overflow: hidden;
    }
    
    .confidence-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--ocean-blue), #0099ff);
        border-radius: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        transition: width 0.5s ease;
    }
    
    .history-item {
        background: white;
        border-left: 4px solid var(--ocean-blue);
        padding: 1rem;
        margin: 0.5rem 0;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .scanning-frame {
        border: 3px solid var(--ocean-blue);
        border-radius: 1rem;
        box-shadow: 0 0 20px rgba(0, 102, 204, 0.4);
        padding: 1rem;
        position: relative;
        background: #f5f8fc;
    }
    
    @media (max-width: 768px) {
        .main {
            padding: 0.5rem;
        }
        .freshness-box {
            padding: 1.5rem;
            font-size: 1.2rem;
        }
        .stButton>button {
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
        }
    }
</style>
""", unsafe_allow_html=True)

# ========== INITIALIZE SESSION STATE ==========
if 'page' not in st.session_state:
    st.session_state.page = "home"

if 'history' not in st.session_state:
    st.session_state.history = []

if 'current_result' not in st.session_state:
    st.session_state.current_result = None

if 'uploaded_image' not in st.session_state:
    st.session_state.uploaded_image = None

# ========== API URL ==========
API_URL = "https://lucasclarke-fish-freshness-classification.hf.space/predict"

# ========== SUGGESTION DATA ==========
COOKING_SUGGESTIONS = {
    "Highly Fresh": [
        "🍡 Steam lightly with chicken broth",
        "🔥 Grill with mustard sauce",
        "🍲 Braised fish (1-2 days)",
        "🥄 Eat raw (sashimi) - safest option"
    ],
    "Fresh": [
        "🍲 Braised fish with ginger",
        "🔥 Deep fried whole",
        "🥘 Braised with pineapple or plum",
        "🍜 Sour fish soup"
    ],
    "Not Fresh": [
        "🍲 Braised fish (3-4 days)",
        "🔥 Deep fried (kills bacteria)",
        "🧂 Salted rice with fish",
        "⚠️ Check carefully before cooking"
    ]
}

SHOP_LOCATION = "Hanoi Central Market"  # Hardcoded location

# ========== HELPER FUNCTIONS ==========
def add_to_history(label, confidence, location):
    """Add to scan history"""
    history_item = {
        "timestamp": datetime.now().isoformat(),
        "label": label,
        "confidence": confidence,
        "location": location
    }
    st.session_state.history.insert(0, history_item)
    if len(st.session_state.history) > 50:  # Limit to 50 items
        st.session_state.history = st.session_state.history[:50]

def render_scanning_animation():
    """Radar scanning animation effect"""
    placeholder = st.empty()
    for i in range(3):
        with placeholder.container():
            st.markdown(f"""
            <div style="text-align: center; font-size: 2rem;">
                🔍 {'.' * (i + 1)} Scanning AI...
            </div>
            """, unsafe_allow_html=True)
            time.sleep(0.3)
    placeholder.empty()

def render_freshness_box(label, confidence):
    """Display freshness index box"""
    if label == "Highly Fresh":
        class_name = "freshness-high"
        emoji = "✨"
        en_label = "VERY FRESH"
    elif label == "Fresh":
        class_name = "freshness-medium"
        emoji = "👍"
        en_label = "FRESH"
    else:
        class_name = "freshness-low"
        emoji = "⚠️"
        en_label = "NOT FRESH"
    
    st.markdown(f"""
    <div class="freshness-box {class_name}">
        {emoji} {en_label} {emoji}
    </div>
    """, unsafe_allow_html=True)
    
    # Confidence bar
    st.markdown(f"""
    <div class="confidence-bar">
        <div class="confidence-fill" style="width: {confidence*100}%">
            {confidence:.1%}
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    return f"{en_label} - Confidence: {confidence:.1%}"

# ========== HOME PAGE ==========
def page_home():
    st.markdown("""
    <div style="text-align: center; padding: 3rem 1rem;">
        <h1 style="color: #0066cc; font-size: 2.5rem; margin-bottom: 1rem;">🐟 Fish Freshness AI</h1>
        <p style="color: #666; font-size: 1.1rem; margin-bottom: 2rem;">
            Check fish freshness in just 3 seconds
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Large Scan Now button
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        if st.button("📷 SCAN NOW", use_container_width=True, key="scan_btn"):
            st.session_state.page = "analysis"
            st.rerun()
    
    st.divider()
    
    # Recent scan history
    st.subheader("📜 Recent Scan History")
    
    if st.session_state.history:
        for idx, item in enumerate(st.session_state.history[:10]):
            dt = datetime.fromisoformat(item['timestamp'])
            time_str = dt.strftime("%H:%M %d/%m")
            
            freshness_color = {
                "Highly Fresh": "🟢",
                "Fresh": "🟡",
                "Not Fresh": "🔴"
            }.get(item['label'], "⚪")
            
            st.markdown(f"""
            <div class="history-item">
                <strong>{freshness_color} {item['label']}</strong> - 
                Confidence: {item['confidence']:.1%} | 
                {time_str} | 
                📍 {item['location']}
            </div>
            """, unsafe_allow_html=True)
    else:
        st.info("No scan history yet. Scan your first fish!")

# ========== ANALYSIS PAGE ==========
def page_analysis():
    st.markdown("""
    <div style="text-align: center; padding: 1rem;">
        <h2 style="color: #0066cc;">📸 Upload Fish Image</h2>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 3, 1])
    with col2:
        uploaded_file = st.file_uploader(
            "Select image file",
            type=["jpg", "jpeg", "png"],
            key="file_uploader"
        )
    
    if uploaded_file is not None:
        st.session_state.uploaded_image = uploaded_file
        
        image = Image.open(uploaded_file)
        # Resize to fit 224x224 (standard model input)
        image_resized = image.resize((224, 224), Image.Resampling.LANCZOS)
        
        # Display resized image
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            st.image(image_resized, use_column_width=True, caption='Image will be analyzed (224×224px)')
        
        st.divider()
        
        # Predict button
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            if st.button("🚀 PREDICT NOW", use_container_width=True):
                with st.spinner(''):
                    render_scanning_animation()
                    
                    try:
                        img_bytes = uploaded_file.getvalue()
                        files = {"file": ("image.jpg", img_bytes, "image/jpeg")}
                        response = requests.post(API_URL, files=files, timeout=30)
                        
                        if response.status_code == 200:
                            res = response.json()
                            st.session_state.current_result = res
                            st.session_state.page = "result"
                            st.rerun()
                        else:
                            st.error(f"❌ API Error (Code {response.status_code})")
                    except Exception as e:
                        st.error(f"❌ Connection Error: {str(e)}")
        
        # Go back button
        st.divider()
        if st.button("⬅️ Back", use_container_width=True):
            st.session_state.page = "home"
            st.rerun()

# ========== RESULT PAGE ==========
def page_result():
    if not st.session_state.current_result:
        st.session_state.page = "home"
        st.rerun()
        return
    
    result = st.session_state.current_result
    label = result['label']
    confidence = result['confidence']
    
    # Add to history
    add_to_history(label, confidence, SHOP_LOCATION)
    
    st.markdown("""
    <div style="text-align: center; padding: 1rem;">
        <h2 style="color: #0066cc;">📊 Analysis Results</h2>
    </div>
    """, unsafe_allow_html=True)
    
    # Display scanned image
    if st.session_state.uploaded_image:
        image = Image.open(st.session_state.uploaded_image)
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            st.image(image, use_column_width=True, caption="Image Analyzed")
    
    st.divider()
    
    # Freshness index
    st.markdown("### 🎯 Freshness Level")
    result_text = render_freshness_box(label, confidence)
    
    st.divider()
    
    # Cooking suggestions
    st.markdown("### 🍳 Cooking Suggestions")
    suggestions = COOKING_SUGGESTIONS.get(label, [])
    for suggestion in suggestions:
        st.markdown(f"- {suggestion}")
    
    st.divider()
    
    # Scan information
    st.markdown(f"""
    <div style="background: #f5f8fc; padding: 1rem; border-radius: 0.5rem; font-size: 0.9rem; color: #666;">
        📍 <strong>Location:</strong> {SHOP_LOCATION} | 
        🕐 <strong>Time:</strong> {datetime.now().strftime("%H:%M %d/%m/%Y")}
    </div>
    """, unsafe_allow_html=True)
    
    # Action buttons
    st.divider()
    col1, col2, col3 = st.columns(3)
    with col1:
        if st.button("🔄 Rescan", use_container_width=True):
            st.session_state.page = "analysis"
            st.session_state.uploaded_image = None
            st.session_state.current_result = None
            st.rerun()
    
    with col2:
        if st.button("🏠 Home", use_container_width=True):
            st.session_state.page = "home"
            st.rerun()
    
    with col3:
        if st.button("📤 Share", use_container_width=True):
            st.info(f"📱 {label} - Confidence {confidence:.1%}\n📍 {SHOP_LOCATION}")

# ========== NAVIGATION ==========
if st.session_state.page == "home":
    page_home()
elif st.session_state.page == "analysis":
    page_analysis()
elif st.session_state.page == "result":
    page_result()
