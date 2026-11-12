import os
import cv2
import numpy as np
from typing import List, Tuple, Dict, Any


def compute_excess_green_index(image_bgr: np.ndarray) -> np.ndarray:
    """
    Computes ExG (Excess Green Index = 2G - R - B) commonly used in agricultural remote sensing
    for vegetative canopy separation from soil, water, and stubble.
    """
    b = image_bgr[:, :, 0].astype(np.float32)
    g = image_bgr[:, :, 1].astype(np.float32)
    r = image_bgr[:, :, 2].astype(np.float32)

    total = r + g + b
    total[total == 0] = 1.0  # Avoid division by zero

    # Normalized chromatic coordinates
    r_norm = r / total
    g_norm = g / total
    b_norm = b / total

    exg = 2.0 * g_norm - r_norm - b_norm
    return exg


def create_canopy_mask_otsu(image_bgr: np.ndarray) -> np.ndarray:
    """
    Extracts authentic vegetative canopy mask using ExG index combined with Otsu thresholding.
    Used for creating initial ground-truth masks on agricultural field imagery.
    """
    exg = compute_excess_green_index(image_bgr)
    # Scale ExG to 0-255 using pure NumPy (type-safe and robust)
    exg_min, exg_max = float(np.min(exg)), float(np.max(exg))
    if exg_max > exg_min:
        exg_scaled = ((exg - exg_min) / (exg_max - exg_min) * 255.0).astype(np.uint8)
    else:
        exg_scaled = np.zeros_like(exg, dtype=np.uint8)
    # Apply Otsu automatic thresholding
    _, mask = cv2.threshold(exg_scaled, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    # Morphological opening to reduce salt-and-pepper sensor noise
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    return (mask / 255.0).astype(np.float32)


def preprocess_image(image_bgr: np.ndarray, target_size: Tuple[int, int] = (256, 256)) -> np.ndarray:
    """Resizes and normalizes image for CNN input (values in range [0, 1])."""
    resized = cv2.resize(image_bgr, target_size, interpolation=cv2.INTER_AREA)
    rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
    return rgb.astype(np.float32) / 255.0


def augment_image_and_mask(image: np.ndarray, mask: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """Applies random horizontal/vertical flips and minor rotation for training regularization."""
    if np.random.rand() > 0.5:
        image = np.fliplr(image)
        mask = np.fliplr(mask)
    if np.random.rand() > 0.5:
        image = np.flipud(image)
        mask = np.flipud(mask)
    if np.random.rand() > 0.5:
        k = np.random.choice([1, 2, 3])
        image = np.rot90(image, k)
        mask = np.rot90(mask, k)
    return image.copy(), mask.copy()


def split_dataset_by_field_group(
    sample_ids: List[str], 
    field_groups: List[str], 
    train_size: float = 0.70, 
    val_size: float = 0.15, 
    random_state: int = 42
) -> Dict[str, List[int]]:
    """
    Splits samples based on field/scene identifier.
    Guarantees that patches or frames from the same field never appear in both train and test splits,
    preventing spatial data leakage.
    Implemented with deterministic NumPy group splitting to ensure zero external typing discrepancies.
    """
    unique_groups = list(dict.fromkeys(field_groups))
    rng = np.random.default_rng(random_state)
    shuffled_groups = unique_groups.copy()
    rng.shuffle(shuffled_groups)

    n_groups = len(shuffled_groups)
    n_train = max(1, int(n_groups * train_size))
    n_val = max(1, int(n_groups * val_size)) if (n_groups - n_train) > 1 else 0

    train_groups = set(shuffled_groups[:n_train])
    val_groups = set(shuffled_groups[n_train:n_train + n_val])
    test_groups = set(shuffled_groups[n_train + n_val:])

    train_idx = [i for i, g in enumerate(field_groups) if g in train_groups]
    val_idx = [i for i, g in enumerate(field_groups) if g in val_groups]
    test_idx = [i for i, g in enumerate(field_groups) if g in test_groups]

    return {"train": train_idx, "val": val_idx, "test": test_idx}

