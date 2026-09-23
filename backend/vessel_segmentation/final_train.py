import os
import random
import json

import cv2
import numpy as np

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

from final_model import create_model


# ============================================================
# RETINA-FUSION 360
# FINAL VESSEL SEGMENTATION TRAINING
# ============================================================


# ============================================================
# PATHS
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
    "vessel_segmentation_final"
)

RESULT_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "vessel_segmentation_final"
)

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)

os.makedirs(
    RESULT_DIR,
    exist_ok=True
)


# ============================================================
# CONFIGURATION
# ============================================================

IMAGE_SIZE = 256

BATCH_SIZE = 2

EPOCHS = 50

LEARNING_RATE = 1e-4

WEIGHT_DECAY = 1e-4

SEED = 42

PATIENCE = 10

THRESHOLD = 0.5


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


# ============================================================
# REPRODUCIBILITY
# ============================================================

def seed_everything(seed):

    random.seed(seed)

    np.random.seed(seed)

    torch.manual_seed(seed)

    if torch.cuda.is_available():

        torch.cuda.manual_seed_all(
            seed
        )


seed_everything(
    SEED
)


# ============================================================
# IMAGE PREPROCESSING
# ============================================================

def preprocess_image(
    image
):
    """
    Retinal vessel enhancement.

    Uses the green channel because retinal vessels
    generally have strong contrast in this channel.
    """

    green = image[:, :, 1]

    # CLAHE
    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )

    green = clahe.apply(
        green
    )

    # Normalize
    green = green.astype(
        np.float32
    ) / 255.0

    # Mild gamma correction
    gamma = 0.9

    green = np.power(
        green,
        gamma
    )

    # Convert enhanced single channel
    # back to 3 channels so model architecture
    # remains RGB-compatible.
    enhanced = np.stack(
        [
            green,
            green,
            green
        ],
        axis=2
    )

    return enhanced


# ============================================================
# DATASET
# ============================================================

class DRIVEDataset(Dataset):

    def __init__(
        self,
        image_files,
        training=True
    ):

        self.image_files = image_files

        self.training = training

    def __len__(self):

        return len(
            self.image_files
        )

    def __getitem__(
        self,
        index
    ):

        image_path = self.image_files[
            index
        ]

        filename = os.path.basename(
            image_path
        )

        number = filename.split(
            "_"
        )[0]

        # ----------------------------------------------------
        # Mask paths
        # ----------------------------------------------------

        mask_path = os.path.join(
            DRIVE_ROOT,
            "training",
            "training",
            "1st_manual",
            f"{number}_manual1.gif"
        )

        fov_path = os.path.join(
            DRIVE_ROOT,
            "training",
            "training",
            "mask",
            f"{number}_training_mask.gif"
        )

        # ----------------------------------------------------
        # Load image
        # ----------------------------------------------------

        image = cv2.imread(
            image_path,
            cv2.IMREAD_COLOR
        )

        if image is None:

            raise RuntimeError(
                f"Cannot read image: {image_path}"
            )

        # ----------------------------------------------------
        # Load vessel mask
        # ----------------------------------------------------

        vessel_mask = cv2.imread(
            mask_path,
            cv2.IMREAD_GRAYSCALE
        )

        if vessel_mask is None:

            raise RuntimeError(
                f"Cannot read vessel mask: {mask_path}"
            )

        # ----------------------------------------------------
        # Load FOV
        # ----------------------------------------------------

        fov = cv2.imread(
            fov_path,
            cv2.IMREAD_GRAYSCALE
        )

        if fov is None:

            raise RuntimeError(
                f"Cannot read FOV mask: {fov_path}"
            )

        # ----------------------------------------------------
        # Resize
        # ----------------------------------------------------

        image = cv2.resize(
            image,
            (
                IMAGE_SIZE,
                IMAGE_SIZE
            ),
            interpolation=cv2.INTER_AREA
        )

        vessel_mask = cv2.resize(
            vessel_mask,
            (
                IMAGE_SIZE,
                IMAGE_SIZE
            ),
            interpolation=cv2.INTER_NEAREST
        )

        fov = cv2.resize(
            fov,
            (
                IMAGE_SIZE,
                IMAGE_SIZE
            ),
            interpolation=cv2.INTER_NEAREST
        )

        # ----------------------------------------------------
        # Preprocess retinal image
        # ----------------------------------------------------

        image = preprocess_image(
            image
        )

        # ----------------------------------------------------
        # Binary vessel mask
        # ----------------------------------------------------

        vessel_mask = (
            vessel_mask > 127
        ).astype(
            np.float32
        )

        fov = (
            fov > 127
        ).astype(
            np.float32
        )

        # Restrict vessels to FOV
        vessel_mask *= fov

        # ----------------------------------------------------
        # Augmentation
        # ----------------------------------------------------

        if self.training:

            # Horizontal flip
            if random.random() < 0.5:

                image = np.fliplr(
                    image
                ).copy()

                vessel_mask = np.fliplr(
                    vessel_mask
                ).copy()

                fov = np.fliplr(
                    fov
                ).copy()

            # Vertical flip
            if random.random() < 0.5:

                image = np.flipud(
                    image
                ).copy()

                vessel_mask = np.flipud(
                    vessel_mask
                ).copy()

                fov = np.flipud(
                    fov
                ).copy()

            # Small rotation
            if random.random() < 0.5:

                angle = random.uniform(
                    -10,
                    10
                )

                matrix = cv2.getRotationMatrix2D(
                    (
                        IMAGE_SIZE // 2,
                        IMAGE_SIZE // 2
                    ),
                    angle,
                    1.0
                )

                image = cv2.warpAffine(
                    image,
                    matrix,
                    (
                        IMAGE_SIZE,
                        IMAGE_SIZE
                    ),
                    flags=cv2.INTER_LINEAR,
                    borderMode=cv2.BORDER_REFLECT
                )

                vessel_mask = cv2.warpAffine(
                    vessel_mask,
                    matrix,
                    (
                        IMAGE_SIZE,
                        IMAGE_SIZE
                    ),
                    flags=cv2.INTER_NEAREST,
                    borderMode=cv2.BORDER_CONSTANT
                )

                fov = cv2.warpAffine(
                    fov,
                    matrix,
                    (
                        IMAGE_SIZE,
                        IMAGE_SIZE
                    ),
                    flags=cv2.INTER_NEAREST,
                    borderMode=cv2.BORDER_CONSTANT
                )

                vessel_mask *= (
                    fov > 0.5
                )

        # ----------------------------------------------------
        # Tensor
        # ----------------------------------------------------

        image = torch.from_numpy(
            image.transpose(
                2,
                0,
                1
            )
        ).float()

        vessel_mask = torch.from_numpy(
            vessel_mask
        ).float().unsqueeze(
            0
        )

        return (
            image,
            vessel_mask
        )


# ============================================================
# DISCOVER DRIVE TRAINING DATA
# ============================================================

TRAIN_IMAGE_DIR = os.path.join(
    DRIVE_ROOT,
    "training",
    "training",
    "images"
)

all_images = sorted(
    [
        os.path.join(
            TRAIN_IMAGE_DIR,
            file
        )
        for file in os.listdir(
            TRAIN_IMAGE_DIR
        )
        if file.lower().endswith(
            ".tif"
        )
    ]
)


print("=" * 70)
print("RETINA-FUSION 360")
print("FINAL VESSEL SEGMENTATION TRAINING")
print("=" * 70)

print()
print(f"Device: {DEVICE}")
print(f"Image size: {IMAGE_SIZE}")
print(f"Batch size: {BATCH_SIZE}")
print(f"Epochs: {EPOCHS}")
print(f"Learning rate: {LEARNING_RATE}")
print()
print(
    f"DRIVE training images found: "
    f"{len(all_images)}"
)


# ============================================================
# TRAIN / VALIDATION SPLIT
# ============================================================

indices = list(
    range(
        len(all_images)
    )
)

random.Random(
    SEED
).shuffle(
    indices
)

validation_size = max(
    4,
    int(
        0.2 *
        len(indices)
    )
)

val_indices = indices[
    :validation_size
]

train_indices = indices[
    validation_size:
]

train_images = [
    all_images[i]
    for i in train_indices
]

val_images = [
    all_images[i]
    for i in val_indices
]


print(
    f"Training images: "
    f"{len(train_images)}"
)

print(
    f"Validation images: "
    f"{len(val_images)}"
)


# ============================================================
# DATASETS
# ============================================================

train_dataset = DRIVEDataset(
    train_images,
    training=True
)

val_dataset = DRIVEDataset(
    val_images,
    training=False
)


# ============================================================
# DATALOADERS
# ============================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)


# ============================================================
# MODEL
# ============================================================

model = create_model().to(
    DEVICE
)


# ============================================================
# LOSS FUNCTIONS
# ============================================================

class DiceLoss(nn.Module):

    def __init__(
        self,
        smooth=1.0
    ):

        super().__init__()

        self.smooth = smooth

    def forward(
        self,
        logits,
        targets
    ):

        probabilities = torch.sigmoid(
            logits
        )

        probabilities = probabilities.reshape(
            -1
        )

        targets = targets.reshape(
            -1
        )

        intersection = (
            probabilities *
            targets
        ).sum()

        dice = (
            2.0 *
            intersection +
            self.smooth
        ) / (
            probabilities.sum()
            +
            targets.sum()
            +
            self.smooth
        )

        return 1.0 - dice


dice_loss = DiceLoss()


# ============================================================
# POSITIVE CLASS WEIGHT
# ============================================================

# DRIVE vessels occupy a small portion of the image.
# A moderate positive weight helps preserve thin vessels.

POS_WEIGHT = torch.tensor(
    [3.0],
    device=DEVICE
)

bce_loss = nn.BCEWithLogitsLoss(
    pos_weight=POS_WEIGHT
)


def combined_loss(
    logits,
    targets
):

    dice = dice_loss(
        logits,
        targets
    )

    bce = bce_loss(
        logits,
        targets
    )

    return (
        0.6 * dice
        +
        0.4 * bce
    )


# ============================================================
# OPTIMIZER
# ============================================================

optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=LEARNING_RATE,
    weight_decay=WEIGHT_DECAY
)


# ============================================================
# LR SCHEDULER
# ============================================================

scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer,
    mode="max",
    factor=0.5,
    patience=4
)


# ============================================================
# METRICS
# ============================================================

def calculate_metrics(
    logits,
    targets
):

    probabilities = torch.sigmoid(
        logits
    )

    predictions = (
        probabilities >
        THRESHOLD
    ).float()

    targets = (
        targets >
        0.5
    ).float()

    tp = (
        predictions *
        targets
    ).sum().item()

    fp = (
        predictions *
        (1 - targets)
    ).sum().item()

    fn = (
        (1 - predictions) *
        targets
    ).sum().item()

    tn = (
        (1 - predictions) *
        (1 - targets)
    ).sum().item()

    dice = (
        2 * tp
        /
        (
            2 * tp +
            fp +
            fn +
            1e-8
        )
    )

    sensitivity = (
        tp /
        (
            tp +
            fn +
            1e-8
        )
    )

    specificity = (
        tn /
        (
            tn +
            fp +
            1e-8
        )
    )

    precision = (
        tp /
        (
            tp +
            fp +
            1e-8
        )
    )

    return {
        "dice": dice,
        "sensitivity": sensitivity,
        "specificity": specificity,
        "precision": precision
    }


# ============================================================
# TRAINING HISTORY
# ============================================================

history = []

best_dice = -1.0

epochs_without_improvement = 0


# ============================================================
# TRAINING LOOP
# ============================================================

for epoch in range(
    1,
    EPOCHS + 1
):

    # --------------------------------------------------------
    # TRAIN
    # --------------------------------------------------------

    model.train()

    train_loss = 0.0

    for images, masks in train_loader:

        images = images.to(
            DEVICE
        )

        masks = masks.to(
            DEVICE
        )

        optimizer.zero_grad()

        logits = model(
            images
        )

        loss = combined_loss(
            logits,
            masks
        )

        loss.backward()

        # Gradient clipping
        torch.nn.utils.clip_grad_norm_(
            model.parameters(),
            max_norm=1.0
        )

        optimizer.step()

        train_loss += (
            loss.item()
        )

    train_loss /= max(
        len(train_loader),
        1
    )

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    model.eval()

    val_loss = 0.0

    total_tp = 0.0
    total_fp = 0.0
    total_fn = 0.0
    total_tn = 0.0

    with torch.no_grad():

        for images, masks in val_loader:

            images = images.to(
                DEVICE
            )

            masks = masks.to(
                DEVICE
            )

            logits = model(
                images
            )

            loss = combined_loss(
                logits,
                masks
            )

            val_loss += (
                loss.item()
            )

            probabilities = torch.sigmoid(
                logits
            )

            predictions = (
                probabilities >
                THRESHOLD
            ).float()

            targets = (
                masks >
                0.5
            ).float()

            total_tp += (
                predictions *
                targets
            ).sum().item()

            total_fp += (
                predictions *
                (1 - targets)
            ).sum().item()

            total_fn += (
                (1 - predictions) *
                targets
            ).sum().item()

            total_tn += (
                (1 - predictions) *
                (1 - targets)
            ).sum().item()

    val_loss /= max(
        len(val_loader),
        1
    )

    val_dice = (
        2 * total_tp
        /
        (
            2 * total_tp
            +
            total_fp
            +
            total_fn
            +
            1e-8
        )
    )

    val_sensitivity = (
        total_tp
        /
        (
            total_tp
            +
            total_fn
            +
            1e-8
        )
    )

    val_specificity = (
        total_tn
        /
        (
            total_tn
            +
            total_fp
            +
            1e-8
        )
    )

    val_precision = (
        total_tp
        /
        (
            total_tp
            +
            total_fp
            +
            1e-8
        )
    )

    # --------------------------------------------------------
    # Scheduler
    # --------------------------------------------------------

    scheduler.step(
        val_dice
    )

    current_lr = optimizer.param_groups[
        0
    ]["lr"]

    # --------------------------------------------------------
    # History
    # --------------------------------------------------------

    epoch_result = {

        "epoch": epoch,

        "train_loss":
            float(train_loss),

        "val_loss":
            float(val_loss),

        "val_dice":
            float(val_dice),

        "val_sensitivity":
            float(val_sensitivity),

        "val_specificity":
            float(val_specificity),

        "val_precision":
            float(val_precision),

        "learning_rate":
            float(current_lr)
    }

    history.append(
        epoch_result
    )

    # --------------------------------------------------------
    # Print
    # --------------------------------------------------------

    print()

    print(
        f"Epoch {epoch}/{EPOCHS}"
    )

    print(
        f"Train Loss: "
        f"{train_loss:.4f}"
    )

    print(
        f"Val Loss: "
        f"{val_loss:.4f}"
    )

    print(
        f"Val Dice: "
        f"{val_dice:.4f}"
    )

    print(
        f"Sensitivity: "
        f"{val_sensitivity:.4f}"
    )

    print(
        f"Specificity: "
        f"{val_specificity:.4f}"
    )

    print(
        f"Precision: "
        f"{val_precision:.4f}"
    )

    print(
        f"LR: "
        f"{current_lr:.7f}"
    )

    # --------------------------------------------------------
    # Best model
    # --------------------------------------------------------

    if val_dice > best_dice:

        best_dice = val_dice

        epochs_without_improvement = 0

        checkpoint_path = os.path.join(
            MODEL_DIR,
            "best_vessel_model_final.pth"
        )

        torch.save(
            {
                "model_state_dict":
                    model.state_dict(),

                "best_val_dice":
                    float(best_dice),

                "epoch":
                    epoch,

                "image_size":
                    IMAGE_SIZE,

                "threshold":
                    THRESHOLD
            },
            checkpoint_path
        )

        print(
            "✓ BEST MODEL SAVED"
        )

    else:

        epochs_without_improvement += 1

    # --------------------------------------------------------
    # Early stopping
    # --------------------------------------------------------

    if (
        epochs_without_improvement
        >=
        PATIENCE
    ):

        print()

        print(
            "Early stopping triggered."
        )

        break


# ============================================================
# SAVE HISTORY
# ============================================================

history_path = os.path.join(
    RESULT_DIR,
    "training_history_final.json"
)

with open(
    history_path,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        history,
        file,
        indent=2
    )


# ============================================================
# SAVE CONFIG
# ============================================================

config = {

    "image_size":
        IMAGE_SIZE,

    "batch_size":
        BATCH_SIZE,

    "epochs":
        EPOCHS,

    "learning_rate":
        LEARNING_RATE,

    "weight_decay":
        WEIGHT_DECAY,

    "positive_class_weight":
        3.0,

    "dice_weight":
        0.6,

    "bce_weight":
        0.4,

    "seed":
        SEED,

    "best_validation_dice":
        float(best_dice),

    "device":
        str(DEVICE)
}

config_path = os.path.join(
    RESULT_DIR,
    "config_final.json"
)

with open(
    config_path,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        config,
        file,
        indent=2
    )


# ============================================================
# COMPLETE
# ============================================================

print()

print("=" * 70)

print(
    "FINAL VESSEL TRAINING COMPLETE"
)

print("=" * 70)

print()

print(
    f"Best validation Dice: "
    f"{best_dice:.4f}"
)

print()

print(
    "Model:"
)

print(
    os.path.join(
        MODEL_DIR,
        "best_vessel_model_final.pth"
    )
)

print()

print(
    "Training history:"
)

print(
    history_path
)

print()

print(
    "Configuration:"
)

print(
    config_path
)