import sys
from pathlib import Path

import numpy as np
import pandas as pd
import torch

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    balanced_accuracy_score,
    f1_score,
    roc_auc_score,
)

from torch.utils.data import DataLoader

import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT))

from backend.datasets.aptos_dataset import APTOSDataset
from backend.preprocessing.preprocessing import get_validation_transforms
from backend.models.classifer import create_model


# ============================================================
# CONFIG
# ============================================================

MANIFEST = (
    ROOT
    / "datasets"
    / "RETINA_FUSION_DATASET"
    / "manifests"
    / "01_classification.csv"
)

MODEL_PATH = (
    ROOT
    / "models"
    / "aptos_baseline"
    / "best_model.pth"
)

RESULT_DIR = (
    ROOT
    / "results"
    / "aptos_baseline"
)

RESULT_DIR.mkdir(
    parents=True,
    exist_ok=True
)

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

BATCH_SIZE = 8
SEED = 42


# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv(MANIFEST)

df = df[
    (df["source_dataset"].astype(str).str.upper() == "APTOS")
    & (df["split"].astype(str).str.lower() == "train")
    & (df["dr_grade"].notna())
].copy()

df["dr_grade"] = df["dr_grade"].astype(int)

df = df[
    df["dr_grade"].between(0, 4)
].reset_index(drop=True)


# ============================================================
# RECREATE SAME VALIDATION SPLIT
# ============================================================

from sklearn.model_selection import train_test_split

_, val_df = train_test_split(
    df,
    test_size=0.20,
    random_state=SEED,
    stratify=df["dr_grade"],
)

val_df = val_df.reset_index(drop=True)


dataset = APTOSDataset(
    MANIFEST,
    dataframe=val_df,
    transform=get_validation_transforms(),
)

loader = DataLoader(
    dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0,
)


# ============================================================
# MODEL
# ============================================================

model = create_model(
    num_classes=5,
    pretrained=False,
)

checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE,
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model = model.to(DEVICE)
model.eval()


# ============================================================
# PREDICTION
# ============================================================

targets = []
predictions = []
probabilities = []

with torch.no_grad():

    for images, labels in loader:

        images = images.to(DEVICE)

        outputs = model(images)

        probs = torch.softmax(
            outputs,
            dim=1
        )

        preds = outputs.argmax(
            dim=1
        )

        targets.extend(
            labels.numpy()
        )

        predictions.extend(
            preds.cpu().numpy()
        )

        probabilities.extend(
            probs.cpu().numpy()
        )


targets = np.array(targets)
predictions = np.array(predictions)
probabilities = np.array(probabilities)


# ============================================================
# METRICS
# ============================================================

accuracy = accuracy_score(
    targets,
    predictions
)

balanced_accuracy = balanced_accuracy_score(
    targets,
    predictions
)

macro_f1 = f1_score(
    targets,
    predictions,
    average="macro",
    zero_division=0
)


# ============================================================
# REFERABLE DR
# ============================================================

binary_targets = targets >= 2
binary_predictions = predictions >= 2

cm_binary = confusion_matrix(
    binary_targets,
    binary_predictions,
    labels=[False, True]
)

tn, fp, fn, tp = cm_binary.ravel()

sensitivity = tp / (tp + fn)

specificity = tn / (tn + fp)

referable_probability = probabilities[:, 2:].sum(axis=1)

referable_auc = roc_auc_score(
    binary_targets,
    referable_probability
)


# ============================================================
# PRINT RESULTS
# ============================================================

print("=" * 70)
print("RETINA-FUSION 360 — APTOS BASELINE EVALUATION")
print("=" * 70)

print(f"Device: {DEVICE}")
print(f"Validation images: {len(targets)}")

print()
print("5-CLASS METRICS")

print(f"Accuracy:           {accuracy:.4f}")
print(f"Balanced Accuracy:  {balanced_accuracy:.4f}")
print(f"Macro F1:           {macro_f1:.4f}")

print()
print("REFERABLE DR (GRADE >= 2)")

print(f"Sensitivity: {sensitivity:.4f}")
print(f"Specificity: {specificity:.4f}")
print(f"AUC:         {referable_auc:.4f}")


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

report = classification_report(
    targets,
    predictions,
    labels=[0, 1, 2, 3, 4],
    target_names=[
        "Grade 0",
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
    ],
    zero_division=0
)

print()
print("CLASSIFICATION REPORT")
print(report)

with open(
    RESULT_DIR / "classification_report.txt",
    "w"
) as f:

    f.write(report)


# ============================================================
# CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(
    targets,
    predictions,
    labels=[0, 1, 2, 3, 4]
)

print()
print("CONFUSION MATRIX")
print(cm)

plt.figure(figsize=(7, 6))

plt.imshow(cm)

plt.title(
    "APTOS DR Classification Confusion Matrix"
)

plt.xlabel("Predicted Grade")
plt.ylabel("True Grade")

plt.xticks(
    range(5),
    ["0", "1", "2", "3", "4"]
)

plt.yticks(
    range(5),
    ["0", "1", "2", "3", "4"]
)

for i in range(5):
    for j in range(5):
        plt.text(
            j,
            i,
            cm[i, j],
            ha="center",
            va="center"
        )

plt.colorbar()

plt.tight_layout()

plt.savefig(
    RESULT_DIR / "confusion_matrix.png",
    dpi=200
)

plt.close()


# ============================================================
# SAVE METRICS
# ============================================================

metrics = {
    "dataset": "APTOS",
    "model": "ResNet18",
    "validation_samples": int(len(targets)),
    "accuracy": float(accuracy),
    "balanced_accuracy": float(balanced_accuracy),
    "macro_f1": float(macro_f1),
    "referable_dr_definition": "grade >= 2",
    "referable_sensitivity": float(sensitivity),
    "referable_specificity": float(specificity),
    "referable_auc": float(referable_auc),
}

import json

with open(
    RESULT_DIR / "metrics.json",
    "w"
) as f:

    json.dump(
        metrics,
        f,
        indent=4
    )


print()
print("=" * 70)
print("EVALUATION COMPLETE")
print("=" * 70)

print(
    f"Results saved to: {RESULT_DIR}"
)