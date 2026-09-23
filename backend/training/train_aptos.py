import json
import random
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import torch

from sklearn.model_selection import train_test_split

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    f1_score,
    confusion_matrix,
    roc_auc_score,
)

from torch import nn, optim
from torch.utils.data import DataLoader


# ============================================================
# PROJECT ROOT
# ============================================================

ROOT = Path(
    __file__
).resolve().parents[2]

sys.path.append(
    str(ROOT)
)


from backend.datasets.aptos_dataset import (
    APTOSDataset
)

from backend.preprocessing.preprocessing import (
    get_train_transforms,
    get_validation_transforms
)

from backend.models.classifer import (
    create_model,
    ordinal_targets,
    ordinal_to_class
)


# ============================================================
# CONFIG
# ============================================================

SEED = 42

MANIFEST = (
    ROOT
    / "datasets"
    / "RETINA_FUSION_DATASET"
    / "manifests"
    / "01_classification.csv"
)

MODEL_DIR = (
    ROOT
    / "models"
    / "aptos_improved"
)

RESULT_DIR = (
    ROOT
    / "results"
    / "aptos_improved"
)

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

RESULT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


# CPU-friendly configuration
IMAGE_SIZE = 320
BATCH_SIZE = 16

MAX_EPOCHS = 3

LEARNING_RATE = 2e-4

WEIGHT_DECAY = 1e-4

VAL_SIZE = 0.20

PATIENCE = 3


# ============================================================
# REPRODUCIBILITY
# ============================================================

random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)


# ============================================================
# HEADER
# ============================================================

print("=" * 75)
print("RETINA-FUSION 360")
print("IMPROVED APTOS DR CLASSIFIER")
print("=" * 75)

print(f"Device: {DEVICE}")
print(f"Manifest: {MANIFEST}")


# ============================================================
# LOAD MANIFEST
# ============================================================

df = pd.read_csv(
    MANIFEST
)

df = df[
    (
        df["source_dataset"]
        .astype(str)
        .str.upper()
        == "APTOS"
    )
    &
    (
        df["split"]
        .astype(str)
        .str.lower()
        == "train"
    )
    &
    df["dr_grade"].notna()
].copy()


df["dr_grade"] = (
    df["dr_grade"]
    .astype(int)
)


df = df[
    df["dr_grade"].between(
        0,
        4
    )
].reset_index(
    drop=True
)


print()
print(
    f"Total labeled APTOS images: "
    f"{len(df)}"
)


print()
print("Class distribution:")

for grade in range(5):

    count = (
        df["dr_grade"]
        == grade
    ).sum()

    print(
        f"Grade {grade}: {count}"
    )


# ============================================================
# SAME VALIDATION SPLIT
# ============================================================

train_df, val_df = train_test_split(

    df,

    test_size=VAL_SIZE,

    random_state=SEED,

    stratify=df["dr_grade"]
)


train_df = train_df.reset_index(
    drop=True
)

val_df = val_df.reset_index(
    drop=True
)


print()
print(
    f"Training images:   {len(train_df)}"
)

print(
    f"Validation images: {len(val_df)}"
)


# ============================================================
# DATASETS
# ============================================================

train_dataset = APTOSDataset(

    MANIFEST,

    dataframe=train_df,

    transform=get_train_transforms()
)


val_dataset = APTOSDataset(

    MANIFEST,

    dataframe=val_df,

    transform=get_validation_transforms()
)


# ============================================================
# DATALOADERS
# ============================================================

train_loader = DataLoader(

    train_dataset,

    batch_size=BATCH_SIZE,

    shuffle=True,

    num_workers=0,

    pin_memory=False
)


val_loader = DataLoader(

    val_dataset,

    batch_size=BATCH_SIZE,

    shuffle=False,

    num_workers=0,

    pin_memory=False
)


# ============================================================
# MODEL
# ============================================================

model = create_model(
    num_classes=5,
    pretrained=True
)

model = model.to(
    DEVICE
)


# ============================================================
# CLASS WEIGHTS
# ============================================================

class_counts = np.bincount(
    train_df["dr_grade"].values,
    minlength=5
)


class_weights = (
    len(train_df)
    /
    (
        5
        *
        np.maximum(
            class_counts,
            1
        )
    )
)


class_weights = torch.tensor(
    class_weights,
    dtype=torch.float32,
    device=DEVICE
)


print()
print(
    "Class weights:"
)

print(
    class_weights.cpu().numpy()
)


# ============================================================
# LOSSES
# ============================================================

ordinal_loss_fn = (
    nn.BCEWithLogitsLoss()
)


classification_loss_fn = (
    nn.CrossEntropyLoss(
        weight=class_weights,
        label_smoothing=0.05
    )
)


# ============================================================
# OPTIMIZER
# ============================================================

optimizer = optim.AdamW(

    model.parameters(),

    lr=LEARNING_RATE,

    weight_decay=WEIGHT_DECAY
)


scheduler = optim.lr_scheduler.ReduceLROnPlateau(

    optimizer,

    mode="max",

    factor=0.5,

    patience=1
)


# ============================================================
# TRAINING
# ============================================================

best_score = -1

epochs_without_improvement = 0

history = []


for epoch in range(
    MAX_EPOCHS
):

    print()
    print(
        "=" * 75
    )

    print(
        f"Epoch {epoch + 1}/{MAX_EPOCHS}"
    )

    print(
        "=" * 75
    )


    # ========================================================
    # TRAIN
    # ========================================================

    model.train()

    running_loss = 0

    train_targets = []

    train_predictions = []


    for batch_idx, (
        images,
        labels
    ) in enumerate(
        train_loader
    ):

        images = images.to(
            DEVICE
        )

        labels = labels.to(
            DEVICE
        )


        optimizer.zero_grad()


        outputs = model(
            images
        )


        ordinal_y = ordinal_targets(
            labels,
            num_classes=5
        )


        ordinal_loss = ordinal_loss_fn(
            outputs["ordinal"],
            ordinal_y
        )


        classification_loss = (
            classification_loss_fn(
                outputs["classification"],
                labels
            )
        )


        # Combined objective
        loss = (
            0.65 * ordinal_loss
            +
            0.35 * classification_loss
        )


        loss.backward()


        torch.nn.utils.clip_grad_norm_(
            model.parameters(),
            max_norm=2.0
        )


        optimizer.step()


        running_loss += (
            loss.item()
        )


        preds = ordinal_to_class(
            outputs["ordinal"]
        )


        train_targets.extend(
            labels.detach()
            .cpu()
            .numpy()
        )


        train_predictions.extend(
            preds.detach()
            .cpu()
            .numpy()
        )


        if (
            (batch_idx + 1)
            % 50
            == 0
        ):

            print(
                f"Batch "
                f"{batch_idx + 1}/"
                f"{len(train_loader)}"
            )


    train_loss = (
        running_loss
        /
        len(train_loader)
    )


    train_accuracy = (
        accuracy_score(
            train_targets,
            train_predictions
        )
    )


    # ========================================================
    # VALIDATION
    # ========================================================

    model.eval()

    val_loss_total = 0

    val_targets = []

    val_predictions = []

    val_probabilities = []


    with torch.no_grad():

        for images, labels in (
            val_loader
        ):

            images = images.to(
                DEVICE
            )

            labels = labels.to(
                DEVICE
            )


            outputs = model(
                images
            )


            ordinal_y = ordinal_targets(
                labels,
                num_classes=5
            )


            ordinal_loss = (
                ordinal_loss_fn(
                    outputs["ordinal"],
                    ordinal_y
                )
            )


            classification_loss = (
                classification_loss_fn(
                    outputs["classification"],
                    labels
                )
            )


            loss = (
                0.65 * ordinal_loss
                +
                0.35 * classification_loss
            )


            val_loss_total += (
                loss.item()
            )


            ordinal_probs = torch.sigmoid(
                outputs["ordinal"]
            )


            preds = ordinal_to_class(
                outputs["ordinal"]
            )


            # Probability approximation for
            # referable DR.
            #
            # P(DR >= 2) = probability of
            # threshold > 1
            referable_probs = (
                ordinal_probs[:, 1]
            )


            val_targets.extend(
                labels.cpu().numpy()
            )


            val_predictions.extend(
                preds.cpu().numpy()
            )


            val_probabilities.extend(
                referable_probs.cpu().numpy()
            )


    val_loss = (
        val_loss_total
        /
        len(val_loader)
    )


    val_targets = np.array(
        val_targets
    )

    val_predictions = np.array(
        val_predictions
    )

    val_probabilities = np.array(
        val_probabilities
    )


    # ========================================================
    # METRICS
    # ========================================================

    val_accuracy = (
        accuracy_score(
            val_targets,
            val_predictions
        )
    )


    val_balanced_accuracy = (
        balanced_accuracy_score(
            val_targets,
            val_predictions
        )
    )


    val_macro_f1 = (
        f1_score(
            val_targets,
            val_predictions,
            average="macro",
            zero_division=0
        )
    )


    # ========================================================
    # REFERABLE DR
    # ========================================================

    binary_targets = (
        val_targets >= 2
    )


    binary_predictions = (
        val_predictions >= 2
    )


    binary_cm = confusion_matrix(
        binary_targets,
        binary_predictions,
        labels=[False, True]
    )


    tn, fp, fn, tp = (
        binary_cm.ravel()
    )


    sensitivity = (
        tp / (tp + fn)
        if (tp + fn) > 0
        else 0
    )


    specificity = (
        tn / (tn + fp)
        if (tn + fp) > 0
        else 0
    )


    try:

        auc = roc_auc_score(
            binary_targets,
            val_probabilities
        )

    except ValueError:

        auc = float("nan")


    # ========================================================
    # PRINT
    # ========================================================

    print()

    print(
        f"Train Loss: {train_loss:.4f}"
    )

    print(
        f"Train Accuracy: "
        f"{train_accuracy:.4f}"
    )

    print(
        f"Val Loss: {val_loss:.4f}"
    )

    print(
        f"Val Accuracy: "
        f"{val_accuracy:.4f}"
    )

    print(
        f"Balanced Accuracy: "
        f"{val_balanced_accuracy:.4f}"
    )

    print(
        f"Macro F1: "
        f"{val_macro_f1:.4f}"
    )

    print()

    print(
        "REFERABLE DR (>= 2)"
    )

    print(
        f"Sensitivity: "
        f"{sensitivity:.4f}"
    )

    print(
        f"Specificity: "
        f"{specificity:.4f}"
    )

    print(
        f"AUC: "
        f"{auc:.4f}"
    )


    # ========================================================
    # SAVE HISTORY
    # ========================================================

    result = {

        "epoch": epoch + 1,

        "train_loss": train_loss,

        "train_accuracy":
            train_accuracy,

        "val_loss": val_loss,

        "val_accuracy":
            val_accuracy,

        "balanced_accuracy":
            val_balanced_accuracy,

        "macro_f1":
            val_macro_f1,

        "referable_sensitivity":
            sensitivity,

        "referable_specificity":
            specificity,

        "referable_auc":
            auc
    }


    history.append(
        result
    )


    # ========================================================
    # SCHEDULER
    # ========================================================

    scheduler.step(
        val_balanced_accuracy
    )


    # ========================================================
    # MODEL SELECTION
    # ========================================================

    # Balanced accuracy is the primary
    # selection metric because of the
    # severe class imbalance.

    score = val_balanced_accuracy


    if score > best_score:

        best_score = score

        epochs_without_improvement = 0


        checkpoint = {

            "model_state_dict":
                model.state_dict(),

            "optimizer_state_dict":
                optimizer.state_dict(),

            "epoch":
                epoch + 1,

            "best_balanced_accuracy":
                best_score,

            "num_classes":
                5,

            "model":
                "EfficientNet-B0-Ordinal",

            "seed":
                SEED
        }


        torch.save(

            checkpoint,

            MODEL_DIR
            / "best_model.pth"
        )


        print()
        print(
            "✓ BEST MODEL SAVED"
        )


    else:

        epochs_without_improvement += 1


    # ========================================================
    # EARLY STOPPING
    # ========================================================

    if (
        epochs_without_improvement
        >= PATIENCE
    ):

        print()
        print(
            "Early stopping."
        )

        break


# ============================================================
# SAVE HISTORY
# ============================================================

history_df = pd.DataFrame(
    history
)

history_df.to_csv(

    MODEL_DIR
    / "training_history.csv",

    index=False
)


# ============================================================
# SAVE CONFIG
# ============================================================

config = {

    "dataset": "APTOS",

    "model":
        "EfficientNet-B0-Ordinal",

    "num_classes": 5,

    "image_size":
        IMAGE_SIZE,

    "batch_size":
        BATCH_SIZE,

    "max_epochs":
        MAX_EPOCHS,

    "learning_rate":
        LEARNING_RATE,

    "weight_decay":
        WEIGHT_DECAY,

    "validation_split":
        VAL_SIZE,

    "seed":
        SEED,

    "device":
        str(DEVICE),

    "referable_definition":
        "DR grade >= 2",

    "loss":
        "0.65 ordinal BCE + 0.35 weighted CE",

    "preprocessing": [
        "FOV crop",
        "LAB CLAHE",
        "retinal normalization",
        "augmentation"
    ]
}


with open(

    MODEL_DIR
    / "config.json",

    "w"
) as f:

    json.dump(
        config,
        f,
        indent=4
    )


print()
print("=" * 75)
print("IMPROVED TRAINING COMPLETE")
print("=" * 75)

print(
    f"Best balanced accuracy: "
    f"{best_score:.4f}"
)

print(
    f"Model saved to: "
    f"{MODEL_DIR / 'best_model.pth'}"
)