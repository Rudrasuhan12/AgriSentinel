import os
import json
import numpy as np
from datetime import datetime, timezone
from typing import Dict, Any

from app.ml.model import PaddySegmentationUNet
from app.ml.train import generate_benchmark_paddy_dataset, compute_dice_score, compute_iou_score, load_config
from app.ml.preprocess import split_dataset_by_field_group


def evaluate_model():
    print("=" * 70)
    print("AGRISENTINEL — MODEL EVALUATION ON HELD-OUT TEST DATASET")
    print("=" * 70)

    cfg = load_config()

    # Generate benchmark dataset with fixed seed
    images, masks, field_groups = generate_benchmark_paddy_dataset(num_fields=14, images_per_field=5)
    sample_ids = [f"sample_{i}" for i in range(len(images))]
    splits = split_dataset_by_field_group(sample_ids, field_groups, train_size=0.70, val_size=0.15, random_state=cfg["data"]["random_seed"])

    test_indices = splits["test"]
    X_test, y_test = images[test_indices], masks[test_indices]
    print(f"Evaluating {len(X_test)} strictly isolated test images from unseen field plots...")

    # Load trained model
    model = PaddySegmentationUNet(in_channels=3, base_filters=16)
    weights_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), cfg["paths"]["output_model_file"])
    model.load_weights(weights_path)

    precisions = []
    recalls = []
    f1s = []
    ious = []
    dices = []

    for i in range(len(X_test)):
        img = X_test[i]
        gt_mask = y_test[i]
        pred_prob = model.forward(img)
        pred_bin = (pred_prob > 0.5).astype(np.float32)

        # True Positives, False Positives, False Negatives
        tp = float(np.sum((pred_bin == 1.0) & (gt_mask == 1.0)))
        fp = float(np.sum((pred_bin == 1.0) & (gt_mask == 0.0)))
        fn = float(np.sum((pred_bin == 0.0) & (gt_mask == 1.0)))

        prec = tp / (tp + fp + 1e-6)
        rec = tp / (tp + fn + 1e-6)
        f1 = (2.0 * prec * rec) / (prec + rec + 1e-6)
        iou = compute_iou_score(pred_prob, gt_mask)
        dice = compute_dice_score(pred_prob, gt_mask)

        precisions.append(prec)
        recalls.append(rec)
        f1s.append(f1)
        ious.append(iou)
        dices.append(dice)

    mean_precision = float(np.mean(precisions))
    mean_recall = float(np.mean(recalls))
    mean_f1 = float(np.mean(f1s))
    mean_iou = float(np.mean(ious))
    mean_dice = float(np.mean(dices))

    report = {
        "pipeline_name": cfg["pipeline_name"],
        "model_architecture": "Paddy Canopy U-Net",
        "evaluation_timestamp": datetime.now(timezone.utc).isoformat(),
        "dataset_evaluated": cfg["data"]["dataset_id"],
        "evaluation_split": "Held-Out Test Set (Unseen Agricultural Fields)",
        "test_sample_count": len(X_test),
        "metrics": {
            "precision": round(mean_precision, 4),
            "recall": round(mean_recall, 4),
            "f1_score": round(mean_f1, 4),
            "intersection_over_union_iou": round(mean_iou, 4),
            "dice_coefficient": round(mean_dice, 4)
        },
        "performance_summary": (
            f"The U-Net model achieved an IoU of {mean_iou*100:.2f}% and Dice Coefficient of {mean_dice*100:.2f}% "
            f"on held-out paddy test plots, with Precision of {mean_precision*100:.2f}% and Recall of {mean_recall*100:.2f}%."
        ),
        "scientific_disclaimer": (
            "This segmentation model is strictly designed for paddy canopy coverage delineation and field stress segmentation. "
            "It does NOT estimate 3D heap volume or paddy mass; volume estimation is executed by the photogrammetry pipeline."
        )
    }

    report_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), cfg["paths"]["evaluation_report_file"])
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)

    print("\n" + "-" * 50)
    print("EVALUATION RESULTS SUMMARY:")
    print(f"  • Precision:         {mean_precision*100:.2f}%")
    print(f"  • Recall:            {mean_recall*100:.2f}%")
    print(f"  • F1 Score:          {mean_f1*100:.2f}%")
    print(f"  • Mean IoU:          {mean_iou*100:.2f}%")
    print(f"  • Dice Coefficient:  {mean_dice*100:.2f}%")
    print(f"Saved evaluation report to: {report_path}")
    print("-" * 50 + "\n")

    return report


if __name__ == "__main__":
    evaluate_model()

