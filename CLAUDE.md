# FreshScan AI — CLAUDE.md

> **Đọc file này trước khi bắt đầu bất kỳ tác vụ nào.**  
> Đây là nguồn sự thật duy nhất về architecture, design, và workflow của project.

---

## 1. Project Overview

**FreshScan AI** là một Single-Page Application (SPA) dùng mô hình Swin Transformer để phân tích độ tươi mắt cá qua ảnh. Người dùng upload ảnh → model trả về grade (1–5) kèm confidence score và probability distribution.

**Model accuracy:** 90.97%  
**Model architecture:** Swin Transformer + Conditional Ordinal Regression + Dual Pooling  
**Dataset:** FFE (Fish Freshness Eye)

---

## 2. Existing Backend (Đừng đụng vào)

Backend đã tồn tại và deploy rồi. Nhiệm vụ của task này là **chỉ build frontend**.

```
Streamlit (cũ, thô sơ)
     ↓ thay thế bằng
Next.js Frontend (Vercel)  →  FastAPI Backend (HF Space)  →  fish_model.pth
```

- **FastAPI backend**: Đang chạy trên Hugging Face Spaces với Dockerfile
- **Model file**: `fish_model.pth` (đã deploy, không cần load lại)
- **Existing files** (trong cùng repo, KHÔNG xóa hoặc sửa):
  - `streamlit_app.py` — frontend cũ
  - `app.py` — FastAPI app, đọc file này để biết API contract
  - `fish_model.pth` — trained model weights
  - `Dockerfile` — HF Space deployment
  - `requirements.txt` — Python deps
  - `complete_code_single_cell.py` — notebook export
  - `CONTEXT.md` — context cũ của project

**Bước đầu tiên:** Đọc `app.py` để hiểu chính xác:
1. Endpoint URL (`/predict` hay endpoint khác)
2. Request format (multipart/form-data với field name gì)
3. Response JSON schema (`label`, `confidence`, `probabilities`, v.v.)
4. Mapping từ grade number sang label tiếng Việt

---

## 3. Target Architecture

```
/freshscan-next/          ← thư mục Next.js (tạo mới, đặt trong repo)
├── app/
│   ├── layout.tsx        ← Google Fonts, global styles, metadata
│   ├── page.tsx          ← SPA chính: quản lý 3 states
│   ├── globals.css       ← Tailwind directives + custom CSS
│   └── api/
│       └── predict/
│           └── route.ts  ← Proxy đến HF Space, tránh CORS
├── components/
│   ├── UploadState.tsx   ← State 1: landing + upload zone
│   ├── ScanningState.tsx ← State 2: scan animation
│   └── ResultState.tsx   ← State 3: analysis result
├── public/
│   └── (không cần ảnh local, dùng background URL từ Stitch)
├── tailwind.config.ts    ← Exact colors từ Stitch design
├── next.config.ts
├── .env.local            ← HF_SPACE_URL (gitignore)
├── .env.example          ← Template, commit vào git
└── package.json
```

---

## 4. Tech Stack

| Layer | Choice | Lý do |
|-------|--------|-------|
| Framework | **Next.js 14 (App Router)** | Native Vercel support, API Routes |
| Styling | **Tailwind CSS** | Khớp 100% với Stitch output |
| Language | **TypeScript** | Type safety cho API response |
| Icons | **Material Symbols Outlined** | Đã có trong Stitch design |
| Fonts | **Google Fonts** (Playfair Display, JetBrains Mono, Inter) | Đã có trong Stitch |
| State | **useState + useReducer** | SPA đơn giản, không cần Redux |
| HTTP | **fetch (native)** | Không cần axios |
| Deploy | **Vercel** | `vercel --prod` hoặc GitHub integration |

**Không dùng:** Redux, Zustand, React Query, Axios, styled-components, emotion, ShadCN (vì Stitch đã có design hoàn chỉnh).

---

## 5. Design System (Exact từ Stitch)

### 5.1 Color Palette

```typescript
// tailwind.config.ts — copy EXACT từ Stitch HTML
colors: {
  "primary": "#44e4cf",
  "secondary": "#adc7ff",
  "tertiary": "#afd3e7",
  "surface": "#0f1419",
  "surface-dim": "#0f1419",
  "surface-container": "#1b2025",
  "surface-container-low": "#171c21",
  "surface-container-high": "#252a30",
  "surface-container-highest": "#30353b",
  "surface-variant": "#30353b",
  "on-surface": "#dee3ea",
  "on-surface-variant": "#bacac6",
  "on-background": "#dee3ea",
  "background": "#0f1419",
  "outline": "#859490",
  "outline-variant": "#3b4a47",
  "scientific-teal": "#00C8B4",     // ← màu chủ đạo
  "glacial-ice": "#A0C4D8",          // ← text secondary
  "hydro-blue": "#0057B8",
  "abyssal-black": "#05070A",        // ← overlay màu
  "surface-white": "#FFFFFF",
  "primary-fixed": "#60fae4",
  "primary-fixed-dim": "#39ddc8",
  "primary-container": "#00c8b4",
  "on-primary": "#003731",
  "on-primary-container": "#004e45",
  "secondary-container": "#0056b6",
  "on-secondary-container": "#bdd1ff",
  "tertiary-container": "#93b7cb",
  "on-tertiary-container": "#254959",
  "error": "#ffb4ab",
  "error-container": "#93000a",
  "inverse-surface": "#dee3ea",
  "inverse-on-surface": "#2c3137",
  "inverse-primary": "#006b5f",
}
```

### 5.2 Typography

```typescript
// tailwind.config.ts
fontFamily: {
  "display-lg": ["Playfair Display", "serif"],    // H1, grade result
  "headline-md": ["Playfair Display", "serif"],   // Brand name
  "body-lg": ["Inter", "sans-serif"],             // Descriptions
  "body-md": ["Inter", "sans-serif"],             // Body text
  "data-mono": ["JetBrains Mono", "monospace"],   // Numbers, labels
  "label-caps": ["JetBrains Mono", "monospace"],  // Uppercase labels, buttons
},
fontSize: {
  "display-lg": ["72px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
  "display-lg-mobile": ["48px", { lineHeight: "1.2", fontWeight: "700" }],
  "headline-md": ["40px", { lineHeight: "1.3", fontWeight: "600" }],
  "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
  "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
  "data-mono": ["14px", { lineHeight: "1.4", fontWeight: "400" }],
  "label-caps": ["12px", { lineHeight: "1.2", letterSpacing: "0.1em", fontWeight: "500" }],
},
```

### 5.3 Border Radius (Stitch dùng rất nhỏ)

```typescript
borderRadius: {
  DEFAULT: "0.125rem",
  lg: "0.25rem",
  xl: "0.5rem",
  full: "0.75rem",
},
```

### 5.4 Spacing

```typescript
spacing: {
  "margin-desktop": "4rem",
  "margin-mobile": "1.5rem",
  "gutter": "2rem",
  "container-max": "1440px",
},
```

### 5.5 Background Image

```
URL: https://lh3.googleusercontent.com/aida-public/AB6AXuBpJDkS4VuskvU_uQI4ozAvjdH1b4xMGmc5XODq2p3KXE1dJmCwrVND00CcRCs6pxrqSj9yxmRA50lhCMnnNRXk22BNDPhrL6bI9k6gGbx_3aJMFXL4CWqFU0pJ9K53yDkDX_MLxzgj_ElDhAwlpY7wBy3ATFu9ncsAbM5rthFppHftpGOXCHyjYzdf4OWfGFjdIDE2hhw_Ol3uaeypsXYUo_1PLNy5koVLQp6igCtry7Ql1cRGD_7KFx6zh9SenqiGCSY4eCPgUQDj
```

Nếu URL này die (Google AIDA image), thay bằng Unsplash:  
`https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1920&q=80`

Apply như sau trong `globals.css`:
```css
body {
  background-image: 
    linear-gradient(to bottom, rgba(5, 7, 10, 0.4), rgba(5, 7, 10, 0.9)),
    url('<URL>');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}
```

### 5.6 Glass Panel (dùng lại ở nhiều component)

```css
.glass-panel {
  background: rgba(10, 15, 20, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(160, 196, 216, 0.2);
}
```

Định nghĩa trong `globals.css` và dùng như Tailwind class.

---

## 6. App State Machine

`page.tsx` quản lý một state duy nhất:

```typescript
type AppState = "upload" | "scanning" | "result";
type FreshnessResult = {
  label_vi: string;          // "Rất tươi" | "Tươi" | "Tươi vừa" | "Kém tươi" | "Ươn"
  label_en: string;          // "Very Fresh" | "Fresh" | "Moderate" | "Not Fresh" | "Spoiled"
  grade: number;             // 1 | 2 | 3 | 4 | 5
  confidence: number;        // 0.0 – 1.0
  probabilities: number[];   // [p1, p2, p3, p4, p5] — sum = 1.0
};
```

State transitions:
```
upload  --[user uploads + clicks Analyze]--> scanning
scanning --[API returns success]--> result
scanning --[API returns error]--> upload (show error toast)
result  --[user clicks NEW SCAN]--> upload (reset state)
```

---

## 7. Component Specs

### 7.1 Layout (tất cả 3 states dùng chung)

```tsx
// app/page.tsx — shell
<body className="h-screen w-full overflow-hidden flex flex-col relative">
  {/* Background — fixed, dùng globals.css */}
  
  {/* Header — fixed top */}
  <header className="glass-panel fixed top-0 left-0 right-0 z-50 ...">
    <span>FreshScan AI</span>
    <span>Model accuracy: 90.97%</span>
  </header>

  {/* Main content — đổi theo state */}
  {state === "upload"   && <UploadState onAnalyze={handleAnalyze} />}
  {state === "scanning" && <ScanningState imageUrl={previewUrl} />}
  {state === "result"   && <ResultState result={result} onNewScan={resetState} />}

  {/* Footer — fixed bottom */}
  <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-glacial-ice/10 ...">
    <span>SWIN TRANSFORMER · CONDITIONAL ORDINAL REGRESSION · DUAL POOLING</span>
  </footer>
</body>
```

### 7.2 UploadState Component

Dựa trên **Stitch HTML #2** (upload landing page):
- Vertically centered trong `calc(100vh - header - footer)`
- H1: `"Phân tích độ tươi mắt cá tức thì"` — font-display-lg, text-white
- Subtitle: `"Powered by Swin Transformer · Upload a photo, get results in seconds"` — glacial-ice/80
- Upload zone: 480px wide, 200px tall, dashed border teal/50, glass-panel
  - Icon: `add_a_photo` Material Symbol
  - Text: `"Drop fish eye image here, or click to upload"`
  - `<input type="file" accept="image/*">` hidden, triggered on click
  - Hover: border solid teal, glow `box-shadow: 0 0 15px rgba(0,200,180,0.2)`
  - Drag-and-drop: handle `onDragOver` + `onDrop`
  - Khi có ảnh: hiển thị preview thumbnail nhỏ trong zone, text đổi thành tên file
- Button "ANALYZE NOW": teal bg, abyssal-black text, icon `analytics`
  - Disabled khi chưa có file
  - onClick → set state = "scanning" → call API

### 7.3 ScanningState Component

- Giữ nguyên layout của UploadState nhưng:
  - Upload zone bị disabled
  - Hiển thị preview ảnh đã upload trong zone
  - Scan line animation chạy trên ảnh preview:
    ```css
    @keyframes scan {
      0%   { top: 0%; opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }
    ```
  - Button đổi thành `"ANALYZING..."` + spinner, disabled
  - Optional: progress dots animation dưới button

### 7.4 ResultState Component

Dựa trên **Stitch HTML #1** (result page):

Layout: `grid grid-cols-12`, items-center, full height:
- **Col 1–5**: Image preview
  - glass-panel wrapping `<img>`
  - Scan line overlay (static, shimmer effect)
  - `filter brightness-90 contrast-125`
- **Col 6–12**: Analysis panel (glass-panel)
  - Header row:
    - Left: label "ANALYSIS RESULT" (label-caps, glacial-ice/70) + Grade label lớn (display-lg, Playfair, white) + description text
    - Right: label "CONFIDENCE" + badge teal với `90.97%` (data-mono 32px)
  - Divider: border-b glacial-ice/20
  - Freshness Index section:
    - Label + "Grade X (description)" right-aligned
    - 5 bars ngang: inactive = surface-container-high, active = scientific-teal với glow
    - Labels: "1 – Poor" ... "5 – Fresh"
  - Probability Distribution section:
    - Label "PROBABILITY DISTRIBUTION"
    - Bar chart dọc: 5 bars, active bar = scientific-teal, inactive = surface-container-high
    - Labels G1–G5 dưới bars, active label màu teal bold
  - Action buttons:
    - "SAVE RECORD" → teal bg, full border (stretch)
    - "NEW SCAN" → transparent bg, glacial-ice border (stretch) → gọi `onNewScan()`

**Grade mapping** (hỏi từ `app.py` nếu cần, đây là default):
```typescript
const GRADE_CONFIG = [
  { grade: 1, label_vi: "Rất tươi", label_en: "Very Fresh",  color: "#16a34a" },
  { grade: 2, label_vi: "Tươi",     label_en: "Fresh",       color: "#22c55e" },
  { grade: 3, label_vi: "Tươi vừa", label_en: "Moderate",    color: "#d97706" },
  { grade: 4, label_vi: "Kém tươi", label_en: "Not Fresh",   color: "#ea580c" },
  { grade: 5, label_vi: "Ươn",      label_en: "Spoiled",     color: "#dc2626" },
];
```
*Adjust nếu `app.py` dùng scale khác (có thể 1 = spoiled, 5 = fresh).*

---

## 8. API Route (Proxy)

### 8.1 `app/api/predict/route.ts`

```typescript
// Proxy request đến HF Space để tránh CORS
export async function POST(request: Request) {
  const formData = await request.formData();
  
  const response = await fetch(
    `${process.env.HF_SPACE_URL}/predict`,  // đọc từ .env.local
    { method: "POST", body: formData }
  );
  
  if (!response.ok) {
    return Response.json(
      { error: "Model inference failed" }, 
      { status: response.status }
    );
  }
  
  const data = await response.json();
  return Response.json(data);
}
```

**Quan trọng:** Đọc `app.py` để xác nhận:
- Endpoint path chính xác (`/predict`, `/analyze`, hay khác)
- Field name của file trong FormData (thường là `file` hay `image`)
- Response JSON schema

### 8.2 Client-side call

```typescript
// Trong UploadState hoặc page.tsx
const handleAnalyze = async (file: File) => {
  setState("scanning");
  
  const formData = new FormData();
  formData.append("file", file);  // ← kiểm tra field name từ app.py
  
  try {
    const res = await fetch("/api/predict", { method: "POST", body: formData });
    if (!res.ok) throw new Error("API error");
    const data: FreshnessResult = await res.json();
    setResult(data);
    setState("result");
  } catch (err) {
    console.error(err);
    setError("Phân tích thất bại. Vui lòng thử lại.");
    setState("upload");
  }
};
```

---

## 9. Environment Variables

### `.env.local` (gitignored)

```bash
# URL của HF Space FastAPI — KHÔNG có trailing slash
# Ví dụ: https://username-repo-name.hf.space
HF_SPACE_URL=https://<your-hf-space-url>
```

### `.env.example` (commit vào git)

```bash
# Copy thành .env.local và điền giá trị thực
HF_SPACE_URL=https://YOUR_HF_SPACE_URL_HERE
```

### Vercel Environment Variables

Khi deploy: thêm `HF_SPACE_URL` trong Vercel Dashboard → Project Settings → Environment Variables.  
`HF_SPACE_URL` chỉ cần ở server side (không cần prefix `NEXT_PUBLIC_`).

---

## 10. File: `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.hf.space" },
    ],
  },
};

export default nextConfig;
```

---

## 11. File: `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin", "vietnamese"], 
  variable: "--font-inter" 
});
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair" 
});
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-jetbrains" 
});

export const metadata: Metadata = {
  title: "FreshScan AI — Phân tích độ tươi mắt cá",
  description: "AI-powered fish eye freshness analysis using Swin Transformer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <body className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
```

---

## 12. Development Workflow

### Setup

```bash
# Từ thư mục repo root, tạo Next.js app
npx create-next-app@latest freshscan-next \
  --typescript --tailwind --app --no-src-dir --import-alias "@/*"

cd freshscan-next

# Copy .env.example rồi điền HF_SPACE_URL
cp .env.example .env.local
```

### Run locally

```bash
npm run dev
# → http://localhost:3000
```

### Build check trước khi deploy

```bash
npm run build
npm run start
```

---

## 13. Deployment (Vercel)

### Option A: CLI

```bash
npm install -g vercel
vercel                    # follow prompts, set env vars
vercel --prod             # production deploy
```

### Option B: GitHub Integration

1. Push `freshscan-next/` lên GitHub (cùng repo hoặc repo mới)
2. Vercel Dashboard → Import project → set Root Directory = `freshscan-next`
3. Add environment variable `HF_SPACE_URL`
4. Deploy tự động mỗi lần push to main

### `vercel.json` (optional, nếu cần custom config)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

---

## 14. Known Issues & Notes

### HF Space Cold Start
HF Space free tier sẽ sleep sau 15 phút idle. First request sẽ chậm (~30–60s).  
→ Trong ScanningState, hiển thị message: `"Đang khởi động model, lần đầu có thể mất 30s..."`  
→ Set timeout của fetch là 120 seconds.

### CORS
Backend FastAPI cần allow origins. Nếu chưa có, thêm vào `app.py`:
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],  # hoặc specific Vercel URL
  allow_methods=["*"],
  allow_headers=["*"],
)
```
Tuy nhiên vì dùng Next.js API route làm proxy, CORS chỉ cần cho HF Space domain, không cần cho frontend.

### Image Upload Size
Giới hạn file upload: chỉ chấp nhận `image/jpeg`, `image/png`, `image/webp`.  
Max size suggest: 10MB.  
Validate ở client trước khi gửi.

### Grade Scale Direction
Kiểm tra `app.py` xem Grade 1 = Fresh hay Grade 1 = Spoiled.  
Nếu ngược lại, adjust `GRADE_CONFIG` array và `ResultState` bars accordingly.

### Material Symbols
Load qua Google Fonts CDN, không cần npm package:
```tsx
// Trong layout.tsx, thêm vào <head>
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
/>
```

---

## 15. Checklist Before First Run

- [ ] `app.py` đã được đọc để xác nhận API contract
- [ ] `.env.local` có `HF_SPACE_URL` đúng
- [ ] Tailwind config đã copy đầy đủ custom colors
- [ ] Google Fonts đã load trong layout
- [ ] Background image URL hoạt động (test trực tiếp trong browser)
- [ ] API route proxy test với `curl` hoặc Postman
- [ ] 3 states (upload, scanning, result) transition đúng
- [ ] Error case khi API fail hiển thị message
- [ ] `npm run build` không có lỗi TypeScript

---

## 16. What NOT To Do

- ❌ Không sửa `streamlit_app.py`, `app.py`, `Dockerfile`, `requirements.txt`
- ❌ Không install thêm CSS framework khác (không dùng MUI, Ant Design, v.v.)
- ❌ Không dùng `any` type trong TypeScript cho API response
- ❌ Không hardcode HF Space URL — phải đọc từ env var
- ❌ Không để API key hay URL nhạy cảm trong client-side code
- ❌ Không dùng `<img>` tag thay cho Next.js `<Image>` nếu ảnh từ external URL
- ❌ Không bỏ `overflow-hidden` trên body — SPA phải full-screen không scroll

---

*Last updated: 2026-05-31 | FreshScan AI v2.0 — Next.js rewrite*
