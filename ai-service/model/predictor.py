import io
import os
import random
import hashlib
import numpy as np
from PIL import Image

# Try to import OpenCV; fall back gracefully if missing
try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False


def extract_image_features(image_bytes: bytes) -> dict:
    """
    Extract basic color/brightness features from image bytes.
    Used to produce deterministic-but-varied mock responses.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = img.resize((224, 224))
        arr = np.array(img, dtype=np.float32)

        # Mean R/G/B channels
        r_mean = float(arr[:, :, 0].mean())
        g_mean = float(arr[:, :, 1].mean())
        b_mean = float(arr[:, :, 2].mean())
        brightness = (r_mean + g_mean + b_mean) / 3.0
        greenness = g_mean - (r_mean + b_mean) / 2.0

        return {
            "r_mean": r_mean,
            "g_mean": g_mean,
            "b_mean": b_mean,
            "brightness": brightness,
            "greenness": greenness,
        }
    except Exception as e:
        print(f"Feature extraction error: {e}")
        return {"r_mean": 100, "g_mean": 130, "b_mean": 80, "brightness": 103, "greenness": 30}


def get_image_seed(image_bytes: bytes) -> int:
    """Create a stable integer seed from image content (MD5 hash)."""
    return int(hashlib.md5(image_bytes[:2048]).hexdigest(), 16) % (2 ** 31)


class PlantPredictor:
    """
    Prediction engine.
    - If a supported model file is found at MODEL_PATH, load and use it.
    - Otherwise, run the smart mock engine using image features.
    """

    GROWTH_STAGES = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Senescence"]

    DISEASE_POOL = [
        "Powdery Mildew",
        "Leaf Blight",
        "Root Rot",
        "Anthracnose",
        "Bacterial Speck",
        "Downy Mildew",
        "Fusarium Wilt",
    ]

    DEFICIENCY_POOL = [
        {"name": "Nitrogen", "severity": "moderate"},
        {"name": "Potassium", "severity": "mild"},
        {"name": "Iron", "severity": "severe"},
        {"name": "Magnesium", "severity": "mild"},
        {"name": "Calcium", "severity": "moderate"},
        {"name": "Phosphorus", "severity": "mild"},
    ]

    WATER_SYMPTOMS = ["wilting", "drooping", "crispy edges", "yellowing"]

    RECOMMENDATION_POOL = [
        "Increase watering frequency",
        "Reduce direct sun exposure",
        "Apply nitrogen-rich fertilizer",
        "Remove affected leaves immediately",
        "Improve soil drainage",
        "Apply fungicide spray",
        "Ensure 6–8 hours of indirect sunlight",
        "Repot into well-draining soil mix",
        "Water at soil level to avoid leaf wetness",
        "Add organic compost to enrich soil",
        "Check for pests on the undersides of leaves",
        "Maintain humidity above 50%",
    ]

    def __init__(self):
        self.model = None
        self.model_type = None
        self._try_load_model()

    def _try_load_model(self):
        model_path = os.getenv("MODEL_PATH", "./model/plant_model.h5")
        if not os.path.exists(model_path):
            print(f"ℹ️  No model file found at {model_path}. Running in mock mode.")
            return

        ext = os.path.splitext(model_path)[1].lower()
        try:
            if ext in [".h5", ".keras"]:
                import tensorflow as tf
                self.model = tf.keras.models.load_model(model_path)
                self.model_type = "tensorflow"
                print(f"✅ TensorFlow model loaded from {model_path}")
            elif ext in [".pt", ".pth"]:
                import torch
                self.model = torch.load(model_path, map_location="cpu")
                self.model.eval()
                self.model_type = "pytorch"
                print(f"✅ PyTorch model loaded from {model_path}")
        except Exception as e:
            print(f"⚠️  Failed to load model: {e}. Falling back to mock mode.")
            self.model = None

    def predict(self, image_bytes: bytes) -> dict:
        """Run prediction; use real model if loaded, otherwise mock."""
        if self.model is not None:
            return self._predict_real(image_bytes)
        return self._predict_mock(image_bytes)

    def _predict_real(self, image_bytes: bytes) -> dict:
        """
        Placeholder for real model inference.
        Swap in actual preprocessing + inference here.
        """
        # TODO: implement real inference
        return self._predict_mock(image_bytes)

    def _predict_mock(self, image_bytes: bytes) -> dict:
        """
        Smart mock: uses image pixel statistics to produce varied but stable results.
        Same image always returns the same result.
        """
        seed = get_image_seed(image_bytes)
        rng = random.Random(seed)
        features = extract_image_features(image_bytes)

        # Growth stage — greener images lean toward Vegetative/Flowering
        greenness_norm = max(0, min(features["greenness"] / 60.0, 1.0))
        stage_weights = [0.15, 0.30, 0.25, 0.20, 0.10]
        # Shift weight toward vegetative for greener images
        if greenness_norm > 0.5:
            stage_weights[1] += 0.2
            stage_weights[2] += 0.1
        growth_stage = rng.choices(self.GROWTH_STAGES, weights=stage_weights, k=1)[0]
        growth_confidence = round(rng.uniform(75.0, 97.0), 1)

        # Health — dimmer/yellower images more likely unhealthy
        health_score = greenness_norm * 0.6 + (features["brightness"] / 255.0) * 0.4
        if health_score > 0.55:
            overall_health = rng.choices(["Healthy", "At risk"], weights=[0.75, 0.25], k=1)[0]
        elif health_score > 0.30:
            overall_health = rng.choices(["Healthy", "At risk", "Unhealthy"], weights=[0.2, 0.55, 0.25], k=1)[0]
        else:
            overall_health = rng.choices(["At risk", "Unhealthy"], weights=[0.4, 0.6], k=1)[0]

        # Diseases — only present when health is not Healthy
        diseases = []
        if overall_health != "Healthy":
            n_diseases = rng.choices([0, 1, 2], weights=[0.4, 0.45, 0.15], k=1)[0]
            selected = rng.sample(self.DISEASE_POOL, min(n_diseases, len(self.DISEASE_POOL)))
            diseases = [{"name": d, "confidence": round(rng.uniform(60.0, 92.0), 1)} for d in selected]

        # Nutrient deficiencies
        n_deficiencies = rng.choices([0, 1, 2], weights=[0.55, 0.35, 0.10], k=1)[0]
        nutrient_deficiencies = rng.sample(self.DEFICIENCY_POOL, min(n_deficiencies, len(self.DEFICIENCY_POOL)))

        # Water stress
        stress_detected = rng.choices([True, False], weights=[0.25, 0.75], k=1)[0]
        water_stress = {
            "detected": stress_detected,
            "symptom": rng.choice(self.WATER_SYMPTOMS) if stress_detected else None,
            "confidence": round(rng.uniform(60.0, 88.0), 1) if stress_detected else 0.0
        }

        # Recommendations
        base_recs = rng.sample(self.RECOMMENDATION_POOL, k=rng.randint(2, 4))
        if diseases:
            base_recs.insert(0, "Remove affected leaves immediately")
            base_recs.insert(1, "Apply appropriate fungicide")
        if nutrient_deficiencies:
            names = [d["name"] for d in nutrient_deficiencies]
            base_recs.insert(0, f"Apply {', '.join(names)}-enriched fertilizer")
        if water_stress["detected"]:
            base_recs.insert(0, "Adjust watering schedule based on soil moisture")

        # Deduplicate while preserving order
        seen = set()
        recommendations = []
        for r in base_recs:
            if r not in seen:
                seen.add(r)
                recommendations.append(r)

        return {
            "growth_stage": growth_stage,
            "growth_stage_confidence": growth_confidence,
            "diseases": diseases,
            "nutrient_deficiencies": nutrient_deficiencies,
            "water_stress": water_stress,
            "overall_health": overall_health,
            "recommendations": recommendations[:5]
        }


# Singleton instance
predictor = PlantPredictor()
