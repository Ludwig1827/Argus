# 🦅 Argus: Jesse Livermore Edition
**Institutional Futures Analysis Terminal powered by AI Agents.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![React](https://img.shields.io/badge/react-18-blue.svg)
![CrewAI](https://img.shields.io/badge/AI-CrewAI-red)
![Gemini](https://img.shields.io/badge/LLM-Gemini%202.5%20Flash-orange)

Argus is a full-stack AI financial platform that combines **Technical Analysis** (Price/Trend) with **Fundamental Analysis** (News/Sentiment) to generate trading strategies. 

It features a unique **"Persona Engine"** that styles all strategic output in the voice of legendary 1929 speculator **Jesse Livermore**, focusing on "lines of least resistance," "pivot points," and "sitting tight."

---

## ✨ Key Features

### 🧠 Multi-Agent AI Core
* **Market Data Analyst:** Fetches raw price, volume, and volatility data.
* **News Analyst:** Scrapes the web for real-time news, filters clickbait, and creates factual summaries.
* **The "Legendary Trader":** A specialized agent prompted to think, reason, and write exactly like Jesse Livermore.

### ⚡ Smart "News Wire"
* **Gemini-Powered:** Reads every headline using LLM analysis.
* **Sentiment Tagging:** Automatically classifies news as **Bullish** (Green) or **Bearish** (Red) based on asset context.
* **Clickbait Remover:** Rewrites sensational headlines into 12-word factual summaries.

### 📊 Professional UI
* **Lightweight Charts:** Real-time interactive candlestick charts.
* **20+ Futures Markets:** Pre-configured dropdowns for Oil (CL), Gold (GC), S&P 500 (ES), Bonds (ZB), and more.
* **Livermore Dashboard:** A dedicated, vintage-styled "Verdict" block that appears before the data.

---

## 🛠️ Tech Stack

* **Backend:** Python, FastAPI, Uvicorn
* **AI Orchestration:** CrewAI, LangChain
* **LLM Provider:** Google Gemini 2.5 Flash
* **Search Provider:** SerperDev (Google Search API)
* **Frontend:** React (Vite), TailwindCSS, Lightweight Charts

---

## 🚀 Installation & Setup

### 1. Prerequisites
You need API keys for the AI and Search tools.
* **Google Gemini API Key:** [Get it here](https://aistudio.google.com/)
* **Serper API Key:** [Get it here](https://serper.dev/)

### 2. Backend Setup
1. Open a terminal in the root `Argus` folder.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install -e .
   ```

4. Create your secrets file:
   * Create a file named `.env` in the root (or `backend/argus/`).
   * Add your keys:
   ```
   GOOGLE_API_KEY=your_actual_key_here
   SERPER_API_KEY=your_actual_key_here
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend:
   ```bash
   cd frontend
   ```

2. Install Node packages:
   ```bash
   npm install
   ```

---

## 🖥️ Running the Application

### Step 1: Start the Backend API
From the root `Argus` folder (with venv activated):
```bash
python -m backend.argus.main
```

Server will start at: `http://localhost:8000`

### Step 2: Start the Frontend UI
From the `frontend` folder:
```bash
npm run dev
```

UI will run at: `http://localhost:5173`

---

## 📂 Project Structure

```
Argus/
├── backend/
│   └── argus/
│       ├── config/           # Agent prompts & tasks (YAML)
│       ├── tools/            # Custom Tools (Market Data, News Scraper)
│       ├── crew.py           # CrewAI Orchestration Logic
│       └── main.py           # FastAPI Routes
├── frontend/
│   ├── src/
│   │   └── App.jsx           # Main React UI Dashboard
│   ├── tailwind.config.js    # Styling Config
│   └── package.json
├── .gitignore
├── pyproject.toml
└── README.md
```