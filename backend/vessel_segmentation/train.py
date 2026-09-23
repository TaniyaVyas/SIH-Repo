import os
import sys
import random

import cv2
import numpy as np
import torch
import torch.nn as nn

from torch.utils.data import DataLoader, Subset


# ============================================================
# PROJECT IMPORTS
# ============================================================

sys.path.append(
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "..",
            ".."
        )
    )
)

from backend.vessel_segmentation.dataset import DRIVEDataset
from backend.vessel_segmentation.model import VesselUNet


# ============================================================
# CONFIGURATION
# ============================================================

PROJECT_ROOT = r"D:\RETINA-FUSION-360"

DRIVE_ROOT = os.path.join(
    PROJECT_ROOT,
    "datasets",
    "Drive"
)

MODEL_DIR = os.path.join(
    PROJECT_ROOT,
    "models",
    "vessel_segmentation"
)

RESULT_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "vessel_segmentation"
)

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(RESULT_DIR, exist_ok=True)


DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)

# CPU-friendly first experiment
IMAGE_SIZE = 256

BATCH_SIZE = 2

EPOCHS = 20

LEARNING_RATE = 1e-4

SEED = 42


# ============================================================
# REPRODUCIBILITY
# ============================================================

random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)


# ============================================================
# DICE LOSS
# ============================================================

def dice_loss(logits, targets):

    probabilities = torch.sigmoid(logits)

    smooth = 1.0

    probabilities = probabilities.reshape(-1)
    targets = targets.reshape(-1)

    intersection = (
        probabilities * targets
    ).sum()

    dice = (
        2.0 * intersection + smooth
    ) / (
        probabilities.sum()
        +
        targets.sum()
        +
        smooth
    )

    return 1.0 - dice


# ============================================================
# COMBINED LOSS
# ============================================================

def combined_loss(logits, targets):

    bce = nn.functional.binary_cross_entropy_with_logits(
        logits,
        targets
    )

    dice = dice_loss(
        logits,
        targets
    )

    return (
        0.5 * bce
        +
        0.5 * dice
    )


# ============================================================
# DICE METRIC
# ============================================================

def dice_score(logits, targets):

    predictions = (
        torch.sigmoid(logits) > 0.5
    ).float()

    smooth = 1.0

    predictions = predictions.reshape(-1)
    targets = targets.reshape(-1)

    intersection = (
        predictions * targets
    ).sum()

    dice = (
        2.0 * intersection + smooth
    ) / (
        predictions.sum()
        +
        targets.sum()
        +
        smooth
    )

    return dice.item()


# ============================================================
# SENSITIVITY
# ============================================================

def sensitivity_score(logits, targets):

    predictions = (
        torch.sigmoid(logits) > 0.5
    ).float()

    targets = targets.float()

    true_positive = (
        predictions * targets
    ).sum()

    false_negative = (
        (1.0 - predictions) * targets
    ).sum()

    return (
        true_positive /
        (true_positive + false_negative + 1e-8)
    ).item()


# ============================================================
# SPECIFICITY
# ============================================================

def specificity_score(logits, targets):

    predictions = (
        torch.sigmoid(logits) > 0.5
    ).float()

    targets = targets.float()

    true_negative = (
        (1.0 - predictions)
        *
        (1.0 - targets)
    ).sum()

    false_positive = (
        predictions
        *
        (1.0 - targets)
    ).sum()

    return (
        true_negative /
        (true_negative + false_positive + 1e-8)
    ).item()


# ============================================================
# EVALUATION
# ============================================================

def evaluate(model, loader):

    model.eval()

    total_loss = 0.0
    total_dice = 0.0
    total_sensitivity = 0.0
    total_specificity = 0.0

    with torch.no_grad():

        for images, masks in loader:

            images = images.to(DEVICE)
            masks = masks.to(DEVICE)

            logits = model(images)

            loss = combined_loss(
                logits,
                masks
            )

            dice = dice_score(
                logits,
                masks
            )

            sensitivity = sensitivity_score(
                logits,
                masks
            )

            specificity = specificity_score(
                logits,
                masks
            )

            total_loss += loss.item()
            total_dice += dice
            total_sensitivity += sensitivity
            total_specificity += specificity

    n = len(loader)

    return {
        "loss": total_loss / n,
        "dice": total_dice / n,
        "sensitivity": total_sensitivity / n,
        "specificity": total_specificity / n
    }


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 70)
    print("RETINA-FUSION 360")
    print("DRIVE VESSEL SEGMENTATION")
    print("=" * 70)

    print(f"Device: {DEVICE}")
    print(f"Dataset: {DRIVE_ROOT}")
    print(f"Image size: {IMAGE_SIZE}")
    print(f"Batch size: {BATCH_SIZE}")
    print(f"Epochs: {EPOCHS}")

    # --------------------------------------------------------
    # Full dataset
    # --------------------------------------------------------

    full_dataset = DRIVEDataset(
        DRIVE_ROOT,
        split="training",
        image_size=IMAGE_SIZE
    )

    total_images = len(full_dataset)

    print()
    print(
        f"Total DRIVE training images: "
        f"{total_images}"
    )

    # --------------------------------------------------------
    # Fixed reproducible split
    # --------------------------------------------------------

    indices = list(range(total_images))

    rng = random.Random(SEED)

    rng.shuffle(indices)

    validation_count = 4

    validation_indices = indices[
        :validation_count
    ]

    training_indices = indices[
        validation_count:
    ]

    print()
    print(
        f"Training images: "
        f"{len(training_indices)}"
    )

    print(
        f"Validation images: "
        f"{len(validation_indices)}"
    )

    print(
        f"Validation indices: "
        f"{validation_indices}"
    )

    # --------------------------------------------------------
    # Subsets
    # --------------------------------------------------------

    train_dataset = Subset(
        full_dataset,
        training_indices
    )

    validation_dataset = Subset(
        full_dataset,
        validation_indices
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=0
    )

    validation_loader = DataLoader(
        validation_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=0
    )

    # --------------------------------------------------------
    # Model
    # --------------------------------------------------------

    model = VesselUNet().to(DEVICE)

    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=LEARNING_RATE,
        weight_decay=1e-4
    )

    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer,
        mode="max",
        factor=0.5,
        patience=3
    )

    best_validation_dice = -1.0

    best_model_path = os.path.join(
        MODEL_DIR,
        "best_vessel_model.pth"
    )

    # --------------------------------------------------------
    # Training
    # --------------------------------------------------------

    for epoch in range(1, EPOCHS + 1):

        model.train()

        running_loss = 0.0
        running_dice = 0.0

        print()
        print("=" * 70)
        print(
            f"Epoch {epoch}/{EPOCHS}"
        )
        print("=" * 70)

        for batch_idx, (
            images,
            masks
        ) in enumerate(
            train_loader,
            1
        ):

            images = images.to(DEVICE)
            masks = masks.to(DEVICE)

            optimizer.zero_grad()

            logits = model(images)

            loss = combined_loss(
                logits,
                masks
            )

            loss.backward()

            torch.nn.utils.clip_grad_norm_(
                model.parameters(),
                max_norm=1.0
            )

            optimizer.step()

            dice = dice_score(
                logits.detach(),
                masks
            )

            running_loss += loss.item()
            running_dice += dice

            if batch_idx % 4 == 0:

                print(
                    f"Batch {batch_idx}/"
                    f"{len(train_loader)}"
                    f" | Loss: {loss.item():.4f}"
                    f" | Dice: {dice:.4f}"
                )

        train_loss = (
            running_loss /
            len(train_loader)
        )

        train_dice = (
            running_dice /
            len(train_loader)
        )

        # ----------------------------------------------------
        # Validation
        # ----------------------------------------------------

        validation_metrics = evaluate(
            model,
            validation_loader
        )

        validation_loss = (
            validation_metrics["loss"]
        )

        validation_dice = (
            validation_metrics["dice"]
        )

        validation_sensitivity = (
            validation_metrics["sensitivity"]
        )

        validation_specificity = (
            validation_metrics["specificity"]
        )

        scheduler.step(
            validation_dice
        )

        print()
        print(
            f"Train Loss: "
            f"{train_loss:.4f}"
        )

        print(
            f"Train Dice: "
            f"{train_dice:.4f}"
        )

        print(
            f"Validation Loss: "
            f"{validation_loss:.4f}"
        )

        print(
            f"Validation Dice: "
            f"{validation_dice:.4f}"
        )

        print(
            f"Validation Sensitivity: "
            f"{validation_sensitivity:.4f}"
        )

        print(
            f"Validation Specificity: "
            f"{validation_specificity:.4f}"
        )

        # ----------------------------------------------------
        # Save best model
        # ----------------------------------------------------

        if validation_dice > best_validation_dice:

            best_validation_dice = (
                validation_dice
            )

            torch.save(
                {
                    "epoch": epoch,
                    "model_state_dict":
                        model.state_dict(),
                    "optimizer_state_dict":
                        optimizer.state_dict(),
                    "validation_dice":
                        validation_dice,
                    "validation_sensitivity":
                        validation_sensitivity,
                    "validation_specificity":
                        validation_specificity,
                    "image_size":
                        IMAGE_SIZE,
                    "seed":
                        SEED,
                    "training_indices":
                        training_indices,
                    "validation_indices":
                        validation_indices
                },
                best_model_path
            )

            print()
            print(
                "✓ BEST MODEL SAVED"
            )

    # --------------------------------------------------------
    # Complete
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print("VESSEL SEGMENTATION TRAINING COMPLETE")
    print("=" * 70)

    print(
        f"Best Validation Dice: "
        f"{best_validation_dice:.4f}"
    )

    print(
        f"Model saved to:"
    )

    print(
        best_model_path
    )


if __name__ == "__main__":
    main()