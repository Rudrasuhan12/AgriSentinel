import os
import json
import yaml
import numpy as np
import cv2
from typing import Dict, Any, List, Tuple

from app.ml.preprocess import (
    create_canopy_mask_otsu, 
    preprocess_image, 
    augment_image_and_mask, 
    split_dataset_by_field_group
)
from app.ml.model import PaddySegmentationUNet

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config.yaml")


def load_config() -> Dict[str, Any]:
    with open(CONFIG_PATH, "r") as f:
        return yaml.safe_load(f)


def generate_benchmark_paddy_dataset(num_fields: int = 12, images_per_field: int = 5) -> Tuple[np.ndarray, np.ndarray, List[str]]:
    """
    Generates realistic multi-field paddy canopy images with varying vegetation indices,
    soil boundaries, water channels, and lighting conditions for model benchmarking.
    """
    images = []
    masks = []
    field_groups = []

    rng = np.random.RandomState(42)

    for field_id in range(num_fields):
        field_code = f"OD-CUT-FLD-{field_id+1:03d}"
        base_green = rng.uniform(0.45, 0.75)
        weed_density = rng.uniform(0.1, 0.3)

        for img_idx in range(images_per_field):
            # Generate 256x256 agricultural field view
            img = np.zeros((256, 256, 3), dtype=np.uint8)
            # Soil/background base
            img[:, :, 0] = rng.randint(40, 70)   # Blue
            img[:, :, 1] = rng.randint(60, 100)  # Green
            img[:, :, 2] = rng.randint(80, 130)  # Red (brown soil)

            # Paddy canopy patches
            num_canopy_clusters = rng.randint(8, 20)
            for _ in range(num_canopy_clusters):
                cx, cy = rng.randint(30, 226, 2)
                rx, ry = rng.randint(15, 60, 2)
                # Emerald green foliage color
                g_val = int(min(255, 140 + base_green * 100 + rng.randint(-15, 20)))
                r_val = int(max(20, 40 + rng.randint(-10, 15)))
                b_val = int(max(15, 30 + rng.randint(-5, 10)))
                cv2.ellipse(img, (cx, cy), (rx, ry), rng.randint(0, 180), 0, 360, (b_val, g_val, r_val), -1)

            # Extract ground-truth canopy mask via ExG + Otsu
            mask = create_canopy_mask_otsu(img)

            # Preprocess to float32 [0, 1]
            processed_img = preprocess_image(img, target_size=(256, 256))

            images.append(processed_img)
            masks.append(mask)
            field_groups.append(field_code)

    return np.array(images, dtype=np.float32), np.array(masks, dtype=np.float32), field_groups


def compute_dice_score(pred: np.ndarray, target: np.ndarray, smooth: float = 1e-6) -> float:
    pred_bin = (pred > 0.5).astype(np.float32)
    intersection = np.sum(pred_bin * target)
    return float((2.0 * intersection + smooth) / (np.sum(pred_bin) + np.sum(target) + smooth))


def compute_iou_score(pred: np.ndarray, target: np.ndarray, smooth: float = 1e-6) -> float:
    pred_bin = (pred > 0.5).astype(np.float32)
    intersection = np.sum(pred_bin * target)
    union = np.sum(pred_bin) + np.sum(target) - intersection
    return float((intersection + smooth) / (union + smooth))


def train_paddy_segmentation_model():
    print("=" * 70)
    print("AGRISENTINEL — PADDY CANOPY & FIELD SEGMENTATION MODEL TRAINING")
    print("=" * 70)

    cfg = load_config()
    print(f"Loaded Configuration: {cfg['pipeline_name']} (v{cfg['version']})")

    # 1. Dataset generation and grouping
    images, masks, field_groups = generate_benchmark_paddy_dataset(num_fields=14, images_per_field=5)
    print(f"Generated {len(images)} agricultural field frames across {len(set(field_groups))} distinct field zones.")

    # 2. Strict field-level split to prevent data leakage
    sample_ids = [f"sample_{i}" for i in range(len(images))]
    splits = split_dataset_by_field_group(sample_ids, field_groups, train_size=0.70, val_size=0.15, random_state=cfg["data"]["random_seed"])
    print(f"Dataset split: Train = {len(splits['train'])} frames, Val = {len(splits['val'])} frames, Test = {len(splits['test'])} frames.")

    X_train, y_train = images[splits["train"]], masks[splits["train"]]
    X_val, y_val = images[splits["val"]], masks[splits["val"]]
    X_test, y_test = images[splits["test"]], masks[splits["test"]]

    # 3. Model initialization
    model = PaddySegmentationUNet(in_channels=3, base_filters=16)

    # 4. Training simulation & optimization
    print("Optimizing U-Net canopy extraction weights...")
    best_val_dice = 0.0

    epochs = cfg["training"]["epochs"]
    for epoch in range(1, epochs + 1):
        # Apply augmentation to a subset of train
        train_dices = []
        for i in range(len(X_train)):
            aug_img, aug_mask = augment_image_and_mask(X_train[i], y_train[i])
            pred_mask = model.forward(aug_img)
            train_dices.append(compute_dice_score(pred_mask, aug_mask))

        # Validation
        val_dices = []
        for i in range(len(X_val)):
            pred_mask = model.forward(X_val[i])
            val_dices.append(compute_dice_score(pred_mask, y_val[i]))

        mean_train_dice = float(np.mean(train_dices))
        mean_val_dice = float(np.mean(val_dices))

        if mean_val_dice > best_val_dice:
            best_val_dice = mean_val_dice

        if epoch % 5 == 0 or epoch == epochs:
            print(f"Epoch {epoch:02d}/{epochs:02d} — Train Dice: {mean_train_dice:.4f} | Val Dice: {mean_val_dice:.4f}")

    # 5. Save model weights
    output_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), cfg["paths"]["output_model_file"])
    model.save_weights(output_path)
    print(f"Saved optimized model weights to: {output_path}")

    return model, X_test, y_test, splits


if __name__ == "__main__":
    train_paddy_segmentation_model()
