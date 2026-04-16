# Plant Growth Monitoring System

A complete full-stack IoT / Web application for monitoring plant health using pre-trained deep learning models. This project detects plant growth stages, identifies leaf diseases, pinpoints nutrient deficiencies, and issues health alerts.

## Project Structure

This is a 3-tier system:
- **`frontend/`**: React + Vite single-page application.
- **`backend/`**: Node.js + Express API acting as the central hub connecting the frontend, the AI service, and MongoDB.
- **`ai-service/`**: Python + FastAPI service running the machine learning models.

## Prerequisites

- **Node.js** (v18+)
- **Python** (v3.10+)
- **MongoDB** (Local or Atlas)
- **Docker** and **Docker Compose** (optional but recommended)

---

## 🚀 Setup via Docker (Recommended)

1. Ensure **Docker Desktop** is running.
2. Open a terminal at the root directory (`fyp 2.0`).
3. Run:
   ```bash
   docker-compose up --build
   ```
4. Access the services:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000](http://localhost:5000)
   - AI Service: [http://localhost:8000](http://localhost:8000)

---

## 🛠️ Manual Setup Instructions

If you prefer to run services manually on your host machine:

### 1. MongoDB Setup
Ensure MongoDB is running locally on port `27017` or update the `MONGODB_URI` environment variable in `backend/.env`.

### 2. AI Service (Port 8000)
Open a terminal in `ai-service`:
```bash
cd ai-service
python -m venv venv

# Activate venv:
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*Note: A mock AI response engine runs by default. To use a real model, place your `.h5` or `.pt` model file at `ai-service/model/plant_model.h5` and set `MODEL_PATH` in `.env` accordingly.*

### 3. Backend Service (Port 5000)
Open a new terminal in `backend`:
```bash
cd backend
npm install
npm run dev
```

### 4. Frontend Application (Port 5173)
Open a new terminal in `frontend`:
```bash
cd frontend
npm install
npm run dev
```

---

## Environmental Variables

You can find `.env.example` files in each related directory. When running manually, ensure you create `.env` files based on them.

## Features

- **JWT Authentication:** Secure user signup and login.
- **Image Processing & Drag-drop Upload:** Easy interface for plant health checks with a 10MB limit.
- **AI Diagnostics:** Returns:
  - Growth stage
  - Disease identification & confidence
  - Nutrient deficiencies 
  - Water stress detection
- **Historical Analysis:** Track plant health progression.
- **Real-Time Alert Banner:** Auto-alert generation for severe diseases and deficiencies.
- **Dynamic Charting:** Visualize health progression using Recharts.
- **Responsive Design:** A fully responsive interface using a customized Vanilla CSS theme.
