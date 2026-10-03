# Nguyen Le Minh Hoang — Portfolio Website 🚀

Interactive 3D Portfolio website of **Nguyen Le Minh Hoang (Nguyễn Lê Minh Hoàng)**, Computer Engineering undergraduate at Ho Chi Minh City University of Technology (HCMUT - VNU-HCM).

Specialized in **Edge AI**, **Computer Vision**, **Multimodal Video & Document Retrieval**, and **Embedded Systems**.

---

## 👨‍💻 About Me

- 🎓 **Education:** Ho Chi Minh City University of Technology (HCMUT - VNU-HCM) (2025–2029)
  - **Major:** Computer Engineering
  - **Cumulative GPA:** 4.00 / 4.00 (9.33 / 10.00)
  - **Scholarship:** Academic Encouragement Scholarship (Tier 1), Semester 1, AY 2025–2026
- 🏫 **High School:** High School for the Gifted (PTNK - Vietnam National University HCM) (2022–2025)
- 📍 **Location:** Ho Chi Minh City, Vietnam
- 📧 **Email:** [hoang.nguyen102@hcmut.edu.vn](mailto:hoang.nguyen102@hcmut.edu.vn)
- 🐙 **GitHub:** [@nlmhoagn](https://github.com/nlmhoagn)

---

## 🏆 Highlighted Projects & Competitions

1. **Solar-Powered Emergency-Lane Monitoring — ACLAB (2026)**
   - *Role:* Project Collaborator
   - Real-time stopped-vehicle detection in highway emergency lanes activating LED warning alerts.
   - Built on a Kendryte K230 edge AI board with YOLO detection, lane-region filtering, and multi-vehicle tracking.

2. **Multimodal Traffic-Video Search System — HCMC AI Challenge (Finalist 2026)**
   - Traffic video retrieval with natural language text query, visual question answering (VQA), and temporal keyframe alignment.
   - Stack: Python, CLIP/SigLIP, Milvus Vector Database, OCR/ASR, LLM-assisted query expansion.

3. **Legal Document Retrieval Pipeline — UIT Data Science Challenge (2026)**
   - Hybrid legal information retrieval pipeline combining structure-aware document chunking, BM25 sparse search, dense neural embeddings, and cross-encoder reranking.

4. **ESP32-S3 Smart Health Scale — Vietnam Electronics Design Contest (2026)**
   - Health scale proposal featuring force-sensitive resistors (FSR), local signal processing, foot-pressure heatmap bicubic interpolation, Kalman filtering, and fail-safe rollback OTA updates.

5. **Federated Learning for UAV Networks (Current Research Focus)**
   - Privacy-preserving decentralized learning across autonomous unmanned aerial vehicle (UAV) swarms with communication-efficient model aggregation.

6. **On-Device SLMs & Graph Reasoning (Research Interests)**
   - Quantized small language models (4-bit) and knowledge graph reasoning on constrained edge accelerators for autonomous decision-making.

---

## 🛠️ Tech Stack & Skills

- **Languages:** Python, C / C++, TypeScript, JavaScript, HTML5, CSS3
- **Deep Learning & CV:** PyTorch, Transformers, YOLO, CLIP / SigLIP, OpenCV, TinyML
- **Retrieval & Speech:** Milvus Vector DB, BM25, Cross-Encoder, ASR, OCR
- **Embedded & Hardware:** Kendryte K230 Edge AI, ESP32-S3, Kalman Filtering, OTA
- **Web & Graphics:** React 18, Three.js, React Three Fiber, React Three Rapier (Physics), GSAP, Vite

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn / pnpm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/nlmhoagn/Portfolio-Website.git
cd Portfolio-Website

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Building for Production

```bash
npm run build
```

The production assets will be generated in the `dist/` directory.

---

## 🌐 Deploying to GitHub Pages

This project is configured with relative base paths (`./`) in `vite.config.ts`, making it deployable directly to GitHub Pages or any static host.

### Option 1: Automated GitHub Actions (Recommended)
This repo includes `.github/workflows/deploy.yml` which automatically builds and publishes the website to GitHub Pages whenever you push to the `main` branch.

In your GitHub repository settings:
1. Go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, choose **GitHub Actions**.
3. Push to `main`, and your portfolio will be live at `https://nlmhoagn.github.io/Portfolio-Website/`!

### Option 2: Deploying via gh-pages
```bash
npm run build
npx gh-pages -d dist
```

---

## 📄 License & Credits
- Portfolio content and project achievements © 2026 **Nguyen Le Minh Hoang**.
- 3D Interactive WebGL template design inspired by Moncy Yohannan.
