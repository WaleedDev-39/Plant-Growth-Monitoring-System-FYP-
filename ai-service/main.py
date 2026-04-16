import sys
import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from model.predictor import predictor
from utils.image_processor import validate_image, get_image_stats

app = FastAPI(
    title="Plant Growth AI Service",
    description="AI-powered plant disease detection and growth stage analysis",
    version="1.0.0"
)

# CORS — allow backend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


# ── Response Models ──────────────────────────────────────────────────────────

class DiseaseResult(BaseModel):
    name: str
    confidence: float

class NutrientDeficiency(BaseModel):
    name: str
    severity: str

class WaterStress(BaseModel):
    detected: bool
    symptom: Optional[str]
    confidence: float

class PredictionResponse(BaseModel):
    growth_stage: str
    growth_stage_confidence: float
    diseases: List[DiseaseResult]
    nutrient_deficiencies: List[NutrientDeficiency]
    water_stress: WaterStress
    overall_health: str
    recommendations: List[str]


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "service": "Plant Growth AI Service",
        "version": "1.0.0",
        "status": "running",
        "model_mode": "real" if predictor.model is not None else "mock"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": predictor.model is not None}


@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    """
    Analyze a plant image and return growth stage, diseases,
    nutrient deficiencies, water stress, and recommendations.
    """
    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Only JPG and PNG are accepted."
        )

    # Read bytes
    image_bytes = await file.read()

    # File size guard
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit.")

    # Validate image integrity
    if not validate_image(image_bytes):
        raise HTTPException(status_code=400, detail="File could not be read as a valid image.")

    # Run prediction
    try:
        result = predictor.predict(image_bytes)
        return JSONResponse(content=result)
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/image-stats")
async def image_stats(file: UploadFile = File(...)):
    """Debug endpoint: returns basic image statistics."""
    image_bytes = await file.read()
    stats = get_image_stats(image_bytes)
    return stats


# ── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
