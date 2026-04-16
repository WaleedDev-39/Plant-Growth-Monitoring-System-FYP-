import io
import numpy as np
from PIL import Image, ImageFilter

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False


def preprocess_image(image_bytes: bytes, target_size: tuple = (224, 224)) -> np.ndarray:
    """
    Preprocess image bytes into a numpy array suitable for model input.
    Applies resize, normalize to [0,1], and adds batch dimension.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(target_size, Image.LANCZOS)

    # Mild noise reduction
    img = img.filter(ImageFilter.SMOOTH_MORE)

    arr = np.array(img, dtype=np.float32) / 255.0  # Normalize to [0,1]
    arr = np.expand_dims(arr, axis=0)  # Add batch dimension
    return arr


def validate_image(image_bytes: bytes) -> bool:
    """Return True if image_bytes can be opened as a valid image."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
        return True
    except Exception:
        return False


def get_image_stats(image_bytes: bytes) -> dict:
    """Return basic statistics about the image."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    arr = np.array(img)
    return {
        "width": img.width,
        "height": img.height,
        "r_mean": float(arr[:, :, 0].mean()),
        "g_mean": float(arr[:, :, 1].mean()),
        "b_mean": float(arr[:, :, 2].mean()),
        "brightness": float(arr.mean()),
    }
