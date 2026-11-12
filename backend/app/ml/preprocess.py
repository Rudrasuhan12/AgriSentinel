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
    Splits samples using GroupShuffleSplit based on field/scene identifier.
    Guarantees that patches or frames from the same field never appear in both train and test splits,
    preventing spatial data leakage.
    """
    try:
        from sklearn.model_selection import GroupShuffleSplit
        if len(set(field_groups)) < 3:
            raise ValueError("Too few groups for multi-way GroupShuffleSplit")

        x_arr = np.array(sample_ids)
        groups_arr = np.array(field_groups)
        gss = GroupShuffleSplit(n_splits=1, train_size=train_size, random_state=random_state)
        train_idx, temp_idx = next(gss.split(x_arr, groups=groups_arr))

        # Split remaining into val and test
        val_ratio_in_temp = val_size / (1.0 - train_size)
        temp_ids = [sample_ids[i] for i in temp_idx]
        temp_groups = [field_groups[i] for i in temp_idx]
        if len(set(temp_groups)) < 2:
            raise ValueError("Too few groups in validation/test slice")

        gss_val = GroupShuffleSplit(n_splits=1, train_size=val_ratio_in_temp, random_state=random_state)
        temp_x_arr = np.array(temp_ids)
        temp_groups_arr = np.array(temp_groups)
        val_sub_idx, test_sub_idx = next(gss_val.split(temp_x_arr, groups=temp_groups_arr))

        val_idx = temp_idx[val_sub_idx]
        test_idx = temp_idx[test_sub_idx]

        return {
            "train": train_idx.tolist(),
            "val": val_idx.tolist(),
            "test": test_idx.tolist()
        }
    except (ImportError, ValueError, Exception):
        # Fallback to pure python/numpy group splitting if scikit-learn is not installed
        unique_groups = list(dict.fromkeys(field_groups))
        rng = np.random.default_rng(random_state)
        rng.shuffle(unique_groups)
        n_groups = len(unique_groups)
        n_train = max(1, int(n_groups * train_size))
        n_val = max(1, int(n_groups * val_size))
        
        train_groups = set(unique_groups[:n_train])
        val_groups = set(unique_groups[n_train:n_train + n_val])
        test_groups = set(unique_groups[n_train + n_val:])
        
        train_idx = [i for i, g in enumerate(field_groups) if g in train_groups]
        val_idx = [i for i, g in enumerate(field_groups) if g in val_groups]
        test_idx = [i for i, g in enumerate(field_groups) if g in test_groups]
        return {"train": train_idx, "val": val_idx, "test": test_idx}

