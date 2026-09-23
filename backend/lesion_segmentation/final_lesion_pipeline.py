import os
import re
import json
import random
import warnings

import cv2
import numpy as np
import pandas as pd

import torch
import torch.nn as nn
import torch.nn.functional as F

from torch.utils.data import Dataset, DataLoader

warnings.filterwarnings("ignore")


# ============================================================
# RETINA-FUSION 360
# FINAL IDRiD LESION SEGMENTATION PIPELINE
#
# Lesions:
#   MA = Microaneurysms
#   EX = Exudates
#   HE = Hemorrhages
#   SE = Soft Exudates
#
# Architecture:
#
# IDRiD
#   ↓
# Original retinal images
#   ↓
# CLAHE / preprocessing
#   ↓
# Multi-label U-Net
#   ↓
# MA / EX / HE / SE masks
#   ↓
# Lesion object extraction
#   ↓
# Lesion features
#   ↓
# Graph-ready lesion nodes
#   ↓
# Future Retinal Graph integration
#
# IMPORTANT:
# This is a research/development pipeline.
# It is not a clinically validated diagnostic system.
# ============================================================


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = r"D:\RETINA-FUSION-360"

IDRID_ROOT = os.path.join(
    PROJECT_ROOT,
    "datasets",
    "IDrid"
)

MODEL_DIR = os.path.join(
    PROJECT_ROOT,
    "models",
    "lesion_segmentation_final"
)

RESULT_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "lesion_segmentation_final"
)

PREDICTION_DIR = os.path.join(
    RESULT_DIR,
    "predictions"
)

MASK_DIR = os.path.join(
    RESULT_DIR,
    "predicted_masks"
)

VIS_DIR = os.path.join(
    RESULT_DIR,
    "visualizations"
)

LESION_JSON_DIR = os.path.join(
    RESULT_DIR,
    "lesion_json"
)

for directory in [
    MODEL_DIR,
    RESULT_DIR,
    PREDICTION_DIR,
    MASK_DIR,
    VIS_DIR,
    LESION_JSON_DIR
]:

    os.makedirs(
        directory,
        exist_ok=True
    )


# ============================================================
# CONFIGURATION
# ============================================================

IMAGE_SIZE = 512

BATCH_SIZE = 1

EPOCHS = 30

LEARNING_RATE = 1e-4

WEIGHT_DECAY = 1e-4

VAL_RATIO = 0.20

SEED = 42

NUM_CLASSES = 4

CLASS_NAMES = [
    "MA",
    "EX",
    "HE",
    "SE"
]

THRESHOLD = 0.50

MIN_LESION_AREA = 3

NUM_WORKERS = 0

EARLY_STOPPING_PATIENCE = 7

DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


# ============================================================
# REPRODUCIBILITY
# ============================================================

def seed_everything(seed=42):

    random.seed(seed)

    np.random.seed(seed)

    torch.manual_seed(seed)

    if torch.cuda.is_available():

        torch.cuda.manual_seed_all(seed)


seed_everything(
    SEED
)


# ============================================================
# DIRECTORY DISCOVERY
# ============================================================

def find_directory(
    root,
    target_name
):

    matches = []

    for current_root, dirs, files in os.walk(root):

        for directory in dirs:

            if directory.lower() == target_name.lower():

                matches.append(
                    os.path.join(
                        current_root,
                        directory
                    )
                )

    return sorted(
        matches
    )


def discover_idrid():

    print()
    print("=" * 70)
    print("IDRiD DATASET DISCOVERY")
    print("=" * 70)

    if not os.path.exists(
        IDRID_ROOT
    ):

        raise FileNotFoundError(
            f"IDRiD directory not found:\n{IDRID_ROOT}"
        )

    original_dirs = find_directory(
        IDRID_ROOT,
        "1. Original Images"
    )

    groundtruth_dirs = find_directory(
        IDRID_ROOT,
        "2. All Segmentation Groundtruths"
    )

    if not original_dirs:

        raise FileNotFoundError(
            "Could not locate '1. Original Images'."
        )

    if not groundtruth_dirs:

        raise FileNotFoundError(
            "Could not locate "
            "'2. All Segmentation Groundtruths'."
        )

    original_dir = original_dirs[0]

    groundtruth_dir = groundtruth_dirs[0]

    print(
        "Original images:"
    )

    print(
        original_dir
    )

    print()

    print(
        "Groundtruth:"
    )

    print(
        groundtruth_dir
    )

    return (
        original_dir,
        groundtruth_dir
    )


# ============================================================
# IMAGE FILE DISCOVERY
# ============================================================

def find_image_files(
    directory
):

    extensions = (
        ".jpg",
        ".jpeg",
        ".png",
        ".tif",
        ".tiff",
        ".bmp"
    )

    files = []

    for root, dirs, filenames in os.walk(
        directory
    ):

        for filename in filenames:

            if filename.lower().endswith(
                extensions
            ):

                files.append(
                    os.path.join(
                        root,
                        filename
                    )
                )

    return sorted(
        files
    )


# ============================================================
# CORRECT IDRiD IMAGE ID EXTRACTION
#
# Examples:
#
# IDRiD_01.jpg
#       ↓
# 01
#
# IDRiD_01_MA.tif
#       ↓
# 01
#
# IDRiD_01_EX.tif
#       ↓
# 01
#
# IDRiD_01_HE.tif
#       ↓
# 01
#
# IDRiD_01_SE.tif
#       ↓
# 01
# ============================================================

def normalize_image_id(
    filename
):

    stem = os.path.splitext(
        os.path.basename(
            filename
        )
    )[0]

    match = re.search(
        r"IDRiD[_\-](\d+)",
        stem,
        re.IGNORECASE
    )

    if match:

        number = int(
            match.group(1)
        )

        return (
            f"{number:02d}"
        )

    # --------------------------------------------------------
    # Fallback
    # --------------------------------------------------------

    match = re.search(
        r"(\d+)",
        stem
    )

    if match:

        number = int(
            match.group(1)
        )

        return (
            f"{number:02d}"
        )

    return stem


# ============================================================
# LESION TYPE DETECTION
# ============================================================

def detect_lesion_type(
    filename
):

    name = os.path.basename(
        filename
    ).lower()

    # --------------------------------------------------------
    # Microaneurysms
    # --------------------------------------------------------

    if (
        "microaneurysm" in name
        or
        re.search(
            r"(^|[_\-])ma([_\-\.]|$)",
            name
        )
    ):

        return "MA"

    # --------------------------------------------------------
    # Exudates
    # --------------------------------------------------------

    if (
        "exudate" in name
        or
        re.search(
            r"(^|[_\-])ex([_\-\.]|$)",
            name
        )
    ):

        return "EX"

    # --------------------------------------------------------
    # Hemorrhages
    # --------------------------------------------------------

    if (
        "hemorrhage" in name
        or
        "haemorrhage" in name
        or
        re.search(
            r"(^|[_\-])he([_\-\.]|$)",
            name
        )
    ):

        return "HE"

    # --------------------------------------------------------
    # Soft Exudates
    # --------------------------------------------------------

    if (
        "soft" in name
        or
        "se" in name
        or
        "sed" in name
    ):

        return "SE"

    return None


# ============================================================
# BUILD DATASET INDEX
# ============================================================

def build_index(
    original_dir,
    groundtruth_dir
):

    print()
    print("=" * 70)
    print("BUILDING IDRiD LESION INDEX")
    print("=" * 70)

    image_files = find_image_files(
        original_dir
    )

    print(
        f"Original images found: "
        f"{len(image_files)}"
    )

    if not image_files:

        raise RuntimeError(
            "No original IDRiD images found."
        )

    gt_files = find_image_files(
        groundtruth_dir
    )

    print(
        f"Groundtruth files found: "
        f"{len(gt_files)}"
    )

    print()
    print(
        "Groundtruth files detected:"
    )

    for filename in gt_files[:30]:

        print(
            "  ",
            os.path.basename(
                filename
            )
        )

    if len(gt_files) > 30:

        print(
            f"  ... and "
            f"{len(gt_files) - 30} more"
        )

    # --------------------------------------------------------
    # Build lookup
    # --------------------------------------------------------

    gt_lookup = {}

    for gt_file in gt_files:

        lesion_type = detect_lesion_type(
            gt_file
        )

        if lesion_type is None:

            continue

        image_id = normalize_image_id(
            gt_file
        )

        if image_id not in gt_lookup:

            gt_lookup[
                image_id
            ] = {}

        gt_lookup[
            image_id
        ][
            lesion_type
        ] = gt_file

    # --------------------------------------------------------
    # Build records
    # --------------------------------------------------------

    records = []

    for image_file in image_files:

        image_id = normalize_image_id(
            image_file
        )

        lesion_paths = gt_lookup.get(
            image_id,
            {}
        )

        records.append({

            "image_id":
                image_id,

            "image_path":
                image_file,

            "MA":
                lesion_paths.get(
                    "MA"
                ),

            "EX":
                lesion_paths.get(
                    "EX"
                ),

            "HE":
                lesion_paths.get(
                    "HE"
                ),

            "SE":
                lesion_paths.get(
                    "SE"
                )
        })

    # --------------------------------------------------------
    # Annotation statistics
    # --------------------------------------------------------

    print()
    print(
        "Annotation availability:"
    )

    for lesion in CLASS_NAMES:

        count = sum(
            1
            for record in records
            if record[lesion] is not None
        )

        print(
            f"  {lesion}: {count}"
        )

    # --------------------------------------------------------
    # Sanity check
    # --------------------------------------------------------

    total_available = sum(
        1
        for record in records
        if any(
            record[c] is not None
            for c in CLASS_NAMES
        )
    )

    print()

    print(
        f"Images with at least one lesion annotation: "
        f"{total_available}"
    )

    if total_available == 0:

        raise RuntimeError(
            "No lesion masks were successfully mapped. "
            "Check IDRiD filename structure."
        )

    return records


# ============================================================
# LOAD IMAGE
# ============================================================

def load_image(
    path
):

    image = cv2.imread(
        path,
        cv2.IMREAD_COLOR
    )

    if image is None:

        raise FileNotFoundError(
            f"Could not read image:\n{path}"
        )

    image = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    return image


# ============================================================
# LOAD MASK
# ============================================================

def load_mask(
    path,
    target_size
):

    if path is None:

        return np.zeros(
            target_size,
            dtype=np.float32
        )

    mask = cv2.imread(
        path,
        cv2.IMREAD_GRAYSCALE
    )

    if mask is None:

        raise FileNotFoundError(
            f"Could not read mask:\n{path}"
        )

    mask = cv2.resize(
        mask,
        (
            target_size[1],
            target_size[0]
        ),
        interpolation=cv2.INTER_NEAREST
    )

    mask = (
        mask > 0
    ).astype(
        np.float32
    )

    return mask


# ============================================================
# IMAGE PREPROCESSING
# ============================================================

def preprocess_image(
    image
):

    image = cv2.resize(
        image,
        (
            IMAGE_SIZE,
            IMAGE_SIZE
        ),
        interpolation=cv2.INTER_AREA
    )

    # --------------------------------------------------------
    # CLAHE on green channel
    # --------------------------------------------------------

    green = image[:, :, 1]

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )

    image[:, :, 1] = clahe.apply(
        green
    )

    image = (
        image.astype(
            np.float32
        )
        /
        255.0
    )

    return image


# ============================================================
# AUGMENTATION
# ============================================================

def augment(
    image,
    masks
):

    # --------------------------------------------------------
    # Horizontal flip
    # --------------------------------------------------------

    if random.random() < 0.5:

        image = np.fliplr(
            image
        ).copy()

        masks = np.flip(
            masks,
            axis=2
        ).copy()

    # --------------------------------------------------------
    # Vertical flip
    # --------------------------------------------------------

    if random.random() < 0.5:

        image = np.flipud(
            image
        ).copy()

        masks = np.flip(
            masks,
            axis=1
        ).copy()

    # --------------------------------------------------------
    # 90° rotation
    # --------------------------------------------------------

    if random.random() < 0.25:

        k = random.randint(
            1,
            3
        )

        image = np.rot90(
            image,
            k
        ).copy()

        masks = np.rot90(
            masks,
            k,
            axes=(1, 2)
        ).copy()

    return (
        image,
        masks
    )


# ============================================================
# DATASET
# ============================================================

class IDRiDLesionDataset(
    Dataset
):

    def __init__(
        self,
        records,
        training=False
    ):

        self.records = records

        self.training = training

    def __len__(
        self
    ):

        return len(
            self.records
        )

    def __getitem__(
        self,
        index
    ):

        record = self.records[
            index
        ]

        image = load_image(
            record["image_path"]
        )

        image = preprocess_image(
            image
        )

        masks = []

        annotation_flags = []

        for lesion in CLASS_NAMES:

            mask = load_mask(
                record[lesion],
                (
                    IMAGE_SIZE,
                    IMAGE_SIZE
                )
            )

            masks.append(
                mask
            )

            annotation_flags.append(
                1.0
                if record[lesion]
                is not None
                else 0.0
            )

        masks = np.stack(
            masks,
            axis=0
        ).astype(
            np.float32
        )

        annotation_flags = np.array(
            annotation_flags,
            dtype=np.float32
        )

        if self.training:

            image, masks = augment(
                image,
                masks
            )

        image_tensor = torch.from_numpy(
            image.transpose(
                2,
                0,
                1
            )
        ).float()

        mask_tensor = torch.from_numpy(
            masks
        ).float()

        flags_tensor = torch.from_numpy(
            annotation_flags
        ).float()

        return (
            image_tensor,
            mask_tensor,
            flags_tensor
        )


# ============================================================
# DOUBLE CONV
# ============================================================

class DoubleConv(
    nn.Module
):

    def __init__(
        self,
        in_channels,
        out_channels
    ):

        super().__init__()

        self.block = nn.Sequential(

            nn.Conv2d(
                in_channels,
                out_channels,
                3,
                padding=1,
                bias=False
            ),

            nn.BatchNorm2d(
                out_channels
            ),

            nn.ReLU(
                inplace=True
            ),

            nn.Conv2d(
                out_channels,
                out_channels,
                3,
                padding=1,
                bias=False
            ),

            nn.BatchNorm2d(
                out_channels
            ),

            nn.ReLU(
                inplace=True
            )
        )

    def forward(
        self,
        x
    ):

        return self.block(
            x
        )


# ============================================================
# FINAL MULTI-LABEL U-NET
# ============================================================

class FinalLesionUNet(
    nn.Module
):

    def __init__(
        self,
        num_classes=4
    ):

        super().__init__()

        self.enc1 = DoubleConv(
            3,
            32
        )

        self.enc2 = DoubleConv(
            32,
            64
        )

        self.enc3 = DoubleConv(
            64,
            128
        )

        self.enc4 = DoubleConv(
            128,
            256
        )

        self.pool = nn.MaxPool2d(
            2
        )

        self.bottleneck = DoubleConv(
            256,
            512
        )

        self.up4 = nn.ConvTranspose2d(
            512,
            256,
            2,
            stride=2
        )

        self.dec4 = DoubleConv(
            512,
            256
        )

        self.up3 = nn.ConvTranspose2d(
            256,
            128,
            2,
            stride=2
        )

        self.dec3 = DoubleConv(
            256,
            128
        )

        self.up2 = nn.ConvTranspose2d(
            128,
            64,
            2,
            stride=2
        )

        self.dec2 = DoubleConv(
            128,
            64
        )

        self.up1 = nn.ConvTranspose2d(
            64,
            32,
            2,
            stride=2
        )

        self.dec1 = DoubleConv(
            64,
            32
        )

        self.output = nn.Conv2d(
            32,
            num_classes,
            1
        )

    def forward(
        self,
        x
    ):

        e1 = self.enc1(
            x
        )

        e2 = self.enc2(
            self.pool(e1)
        )

        e3 = self.enc3(
            self.pool(e2)
        )

        e4 = self.enc4(
            self.pool(e3)
        )

        b = self.bottleneck(
            self.pool(e4)
        )

        d4 = self.up4(
            b
        )

        d4 = self.match_size(
            d4,
            e4
        )

        d4 = torch.cat(
            [
                d4,
                e4
            ],
            dim=1
        )

        d4 = self.dec4(
            d4
        )

        d3 = self.up3(
            d4
        )

        d3 = self.match_size(
            d3,
            e3
        )

        d3 = torch.cat(
            [
                d3,
                e3
            ],
            dim=1
        )

        d3 = self.dec3(
            d3
        )

        d2 = self.up2(
            d3
        )

        d2 = self.match_size(
            d2,
            e2
        )

        d2 = torch.cat(
            [
                d2,
                e2
            ],
            dim=1
        )

        d2 = self.dec2(
            d2
        )

        d1 = self.up1(
            d2
        )

        d1 = self.match_size(
            d1,
            e1
        )

        d1 = torch.cat(
            [
                d1,
                e1
            ],
            dim=1
        )

        d1 = self.dec1(
            d1
        )

        return self.output(
            d1
        )

    @staticmethod
    def match_size(
        x,
        target
    ):

        if x.shape[2:] == target.shape[2:]:

            return x

        return F.interpolate(
            x,
            size=target.shape[2:],
            mode="bilinear",
            align_corners=False
        )


# ============================================================
# DICE LOSS
# ============================================================

def dice_loss(
    logits,
    targets,
    valid_flags
):

    probabilities = torch.sigmoid(
        logits
    )

    smooth = 1.0

    losses = []

    for c in range(
        NUM_CLASSES
    ):

        valid = (
            valid_flags[:, c]
            > 0.5
        )

        if valid.sum() == 0:

            continue

        pred = probabilities[
            valid,
            c
        ]

        target = targets[
            valid,
            c
        ]

        pred = pred.reshape(
            pred.shape[0],
            -1
        )

        target = target.reshape(
            target.shape[0],
            -1
        )

        intersection = (
            pred * target
        ).sum(
            dim=1
        )

        dice = (
            2.0 * intersection
            +
            smooth
        ) / (
            pred.sum(dim=1)
            +
            target.sum(dim=1)
            +
            smooth
        )

        losses.append(
            1.0 - dice.mean()
        )

    if not losses:

        return torch.tensor(
            0.0,
            device=logits.device
        )

    return torch.stack(
        losses
    ).mean()


# ============================================================
# MASKED BCE
# ============================================================

def masked_bce_loss(
    logits,
    targets,
    valid_flags
):

    losses = []

    for c in range(
        NUM_CLASSES
    ):

        valid = (
            valid_flags[:, c]
            > 0.5
        )

        if valid.sum() == 0:

            continue

        loss = F.binary_cross_entropy_with_logits(
            logits[
                valid,
                c
            ],
            targets[
                valid,
                c
            ]
        )

        losses.append(
            loss
        )

    if not losses:

        return torch.tensor(
            0.0,
            device=logits.device
        )

    return torch.stack(
        losses
    ).mean()


# ============================================================
# TOTAL LOSS
# ============================================================

def total_loss(
    logits,
    targets,
    valid_flags
):

    bce = masked_bce_loss(
        logits,
        targets,
        valid_flags
    )

    dice = dice_loss(
        logits,
        targets,
        valid_flags
    )

    return (
        0.4 * bce
        +
        0.6 * dice
    )


# ============================================================
# METRICS
# ============================================================

def calculate_metrics(
    logits,
    targets,
    valid_flags
):

    probabilities = torch.sigmoid(
        logits
    )

    predictions = (
        probabilities
        >= THRESHOLD
    ).float()

    results = {}

    dice_values = []

    iou_values = []

    precision_values = []

    recall_values = []

    for c, lesion in enumerate(
        CLASS_NAMES
    ):

        valid = (
            valid_flags[:, c]
            > 0.5
        )

        if valid.sum() == 0:

            continue

        pred = predictions[
            valid,
            c
        ].reshape(
            -1
        )

        target = targets[
            valid,
            c
        ].reshape(
            -1
        )

        tp = (
            (pred == 1)
            &
            (target == 1)
        ).sum().item()

        fp = (
            (pred == 1)
            &
            (target == 0)
        ).sum().item()

        fn = (
            (pred == 0)
            &
            (target == 1)
        ).sum().item()

        dice = (
            2.0 * tp
            /
            max(
                2.0 * tp + fp + fn,
                1
            )
        )

        iou = (
            tp
            /
            max(
                tp + fp + fn,
                1
            )
        )

        precision = (
            tp
            /
            max(
                tp + fp,
                1
            )
        )

        recall = (
            tp
            /
            max(
                tp + fn,
                1
            )
        )

        results[
            f"{lesion}_dice"
        ] = dice

        results[
            f"{lesion}_iou"
        ] = iou

        results[
            f"{lesion}_precision"
        ] = precision

        results[
            f"{lesion}_recall"
        ] = recall

        dice_values.append(
            dice
        )

        iou_values.append(
            iou
        )

        precision_values.append(
            precision
        )

        recall_values.append(
            recall
        )

    results[
        "mean_dice"
    ] = (
        float(
            np.mean(
                dice_values
            )
        )
        if dice_values
        else 0.0
    )

    results[
        "mean_iou"
    ] = (
        float(
            np.mean(
                iou_values
            )
        )
        if iou_values
        else 0.0
    )

    results[
        "mean_precision"
    ] = (
        float(
            np.mean(
                precision_values
            )
        )
        if precision_values
        else 0.0
    )

    results[
        "mean_recall"
    ] = (
        float(
            np.mean(
                recall_values
            )
        )
        if recall_values
        else 0.0
    )

    return results


# ============================================================
# TRAIN
# ============================================================

def train_one_epoch(
    model,
    loader,
    optimizer
):

    model.train()

    losses = []

    for images, masks, flags in loader:

        images = images.to(
            DEVICE
        )

        masks = masks.to(
            DEVICE
        )

        flags = flags.to(
            DEVICE
        )

        optimizer.zero_grad()

        logits = model(
            images
        )

        loss = total_loss(
            logits,
            masks,
            flags
        )

        loss.backward()

        torch.nn.utils.clip_grad_norm_(
            model.parameters(),
            1.0
        )

        optimizer.step()

        losses.append(
            loss.item()
        )

    return float(
        np.mean(
            losses
        )
    )


# ============================================================
# VALIDATION
# ============================================================

def validate(
    model,
    loader
):

    model.eval()

    losses = []

    logits_list = []

    masks_list = []

    flags_list = []

    with torch.no_grad():

        for images, masks, flags in loader:

            images = images.to(
                DEVICE
            )

            masks = masks.to(
                DEVICE
            )

            flags = flags.to(
                DEVICE
            )

            logits = model(
                images
            )

            loss = total_loss(
                logits,
                masks,
                flags
            )

            losses.append(
                loss.item()
            )

            logits_list.append(
                logits.cpu()
            )

            masks_list.append(
                masks.cpu()
            )

            flags_list.append(
                flags.cpu()
            )

    logits = torch.cat(
        logits_list
    )

    masks = torch.cat(
        masks_list
    )

    flags = torch.cat(
        flags_list
    )

    metrics = calculate_metrics(
        logits,
        masks,
        flags
    )

    metrics[
        "loss"
    ] = float(
        np.mean(
            losses
        )
    )

    return metrics


# ============================================================
# SAVE CONFIG
# ============================================================

def save_config():

    config = {

        "project":
            "RETINA-FUSION 360",

        "dataset":
            "IDRiD",

        "task":
            "multi-label lesion segmentation",

        "classes":
            CLASS_NAMES,

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

        "validation_ratio":
            VAL_RATIO,

        "seed":
            SEED,

        "threshold":
            THRESHOLD,

        "device":
            str(
                DEVICE
            ),

        "model":
            "FinalLesionUNet",

        "loss":
            "0.4 BCE + 0.6 Dice",

        "minimum_lesion_area":
            MIN_LESION_AREA
    }

    path = os.path.join(
        RESULT_DIR,
        "config_final.json"
    )

    with open(
        path,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            config,
            file,
            indent=2
        )


# ============================================================
# TRAIN FINAL MODEL
# ============================================================

def train_model(
    records
):

    annotated_records = [
        record
        for record in records
        if any(
            record[c] is not None
            for c in CLASS_NAMES
        )
    ]

    print()
    print(
        f"Images with lesion annotations: "
        f"{len(annotated_records)}"
    )

    if len(
        annotated_records
    ) < 5:

        raise RuntimeError(
            "Too few annotated images."
        )

    # --------------------------------------------------------
    # Deterministic split
    # --------------------------------------------------------

    shuffled = annotated_records.copy()

    random.Random(
        SEED
    ).shuffle(
        shuffled
    )

    validation_count = max(
        1,
        int(
            len(shuffled)
            *
            VAL_RATIO
        )
    )

    val_records = shuffled[
        :validation_count
    ]

    train_records = shuffled[
        validation_count:
    ]

    print(
        f"Training images: "
        f"{len(train_records)}"
    )

    print(
        f"Validation images: "
        f"{len(val_records)}"
    )

    # --------------------------------------------------------
    # Dataset
    # --------------------------------------------------------

    train_dataset = IDRiDLesionDataset(
        train_records,
        training=True
    )

    val_dataset = IDRiDLesionDataset(
        val_records,
        training=False
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=NUM_WORKERS
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS
    )

    # --------------------------------------------------------
    # Model
    # --------------------------------------------------------

    model = FinalLesionUNet(
        NUM_CLASSES
    ).to(
        DEVICE
    )

    # --------------------------------------------------------
    # Optimizer
    # --------------------------------------------------------

    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=LEARNING_RATE,
        weight_decay=WEIGHT_DECAY
    )

    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer,
        mode="max",
        factor=0.5,
        patience=3
    )

    best_dice = -1.0

    patience_counter = 0

    history = []

    checkpoint_path = os.path.join(
        MODEL_DIR,
        "best_lesion_model_final.pth"
    )

    print()
    print("=" * 70)
    print("TRAINING FINAL IDRiD LESION MODEL")
    print("=" * 70)

    print(
        f"Device: {DEVICE}"
    )

    print(
        f"Image size: {IMAGE_SIZE}"
    )

    print(
        f"Batch size: {BATCH_SIZE}"
    )

    print(
        f"Maximum epochs: {EPOCHS}"
    )

    print()

    # --------------------------------------------------------
    # Epoch loop
    # --------------------------------------------------------

    for epoch in range(
        1,
        EPOCHS + 1
    ):

        train_loss = train_one_epoch(
            model,
            train_loader,
            optimizer
        )

        validation = validate(
            model,
            val_loader
        )

        scheduler.step(
            validation[
                "mean_dice"
            ]
        )

        current_lr = optimizer.param_groups[
            0
        ][
            "lr"
        ]

        row = {

            "epoch":
                epoch,

            "train_loss":
                train_loss,

            "val_loss":
                validation[
                    "loss"
                ],

            "mean_dice":
                validation[
                    "mean_dice"
                ],

            "mean_iou":
                validation[
                    "mean_iou"
                ],

            "mean_precision":
                validation[
                    "mean_precision"
                ],

            "mean_recall":
                validation[
                    "mean_recall"
                ],

            "learning_rate":
                current_lr
        }

        for lesion in CLASS_NAMES:

            row[
                f"{lesion}_dice"
            ] = validation.get(
                f"{lesion}_dice",
                0.0
            )

            row[
                f"{lesion}_iou"
            ] = validation.get(
                f"{lesion}_iou",
                0.0
            )

            row[
                f"{lesion}_precision"
            ] = validation.get(
                f"{lesion}_precision",
                0.0
            )

            row[
                f"{lesion}_recall"
            ] = validation.get(
                f"{lesion}_recall",
                0.0
            )

        history.append(
            row
        )

        print(
            f"Epoch {epoch:02d}/{EPOCHS} | "
            f"Train Loss: {train_loss:.4f} | "
            f"Val Loss: {validation['loss']:.4f} | "
            f"Dice: {validation['mean_dice']:.4f} | "
            f"IoU: {validation['mean_iou']:.4f} | "
            f"Precision: {validation['mean_precision']:.4f} | "
            f"Recall: {validation['mean_recall']:.4f} | "
            f"LR: {current_lr:.2e}"
        )

        # ----------------------------------------------------
        # Best model
        # ----------------------------------------------------

        if (
            validation["mean_dice"]
            >
            best_dice
        ):

            best_dice = validation[
                "mean_dice"
            ]

            torch.save(
                {

                    "model_state_dict":
                        model.state_dict(),

                    "best_dice":
                        best_dice,

                    "class_names":
                        CLASS_NAMES,

                    "image_size":
                        IMAGE_SIZE,

                    "epoch":
                        epoch
                },
                checkpoint_path
            )

            print(
                "  ✓ Best lesion model saved"
            )

            patience_counter = 0

        else:

            patience_counter += 1

        # ----------------------------------------------------
        # Early stopping
        # ----------------------------------------------------

        if (
            patience_counter
            >=
            EARLY_STOPPING_PATIENCE
        ):

            print()

            print(
                "Early stopping triggered."
            )

            break

    # --------------------------------------------------------
    # Save history
    # --------------------------------------------------------

    history_path = os.path.join(
        RESULT_DIR,
        "training_history_final.csv"
    )

    pd.DataFrame(
        history
    ).to_csv(
        history_path,
        index=False
    )

    print()
    print(
        f"Best validation Dice: "
        f"{best_dice:.4f}"
    )

    print()
    print(
        "Best model:"
    )

    print(
        checkpoint_path
    )

    print()
    print(
        "Training history:"
    )

    print(
        history_path
    )

    return checkpoint_path


# ============================================================
# LOAD BEST MODEL
# ============================================================

def load_trained_model(
    checkpoint_path
):

    model = FinalLesionUNet(
        NUM_CLASSES
    ).to(
        DEVICE
    )

    checkpoint = torch.load(
        checkpoint_path,
        map_location=DEVICE
    )

    model.load_state_dict(
        checkpoint[
            "model_state_dict"
        ]
    )

    model.eval()

    return model


# ============================================================
# LESION OBJECT EXTRACTION
# ============================================================

def extract_lesions(
    binary_mask,
    lesion_type
):

    num_labels, labels, stats, centroids = (
        cv2.connectedComponentsWithStats(
            binary_mask.astype(
                np.uint8
            ),
            connectivity=8
        )
    )

    lesions = []

    for label in range(
        1,
        num_labels
    ):

        area = stats[
            label,
            cv2.CC_STAT_AREA
        ]

        if area < MIN_LESION_AREA:

            continue

        x = stats[
            label,
            cv2.CC_STAT_LEFT
        ]

        y = stats[
            label,
            cv2.CC_STAT_TOP
        ]

        width = stats[
            label,
            cv2.CC_STAT_WIDTH
        ]

        height = stats[
            label,
            cv2.CC_STAT_HEIGHT
        ]

        cx = centroids[
            label
        ][0]

        cy = centroids[
            label
        ][1]

        component_mask = (
            labels == label
        ).astype(
            np.uint8
        )

        contours, _ = cv2.findContours(
            component_mask,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )

        perimeter = 0.0

        if contours:

            perimeter = cv2.arcLength(
                contours[0],
                True
            )

        circularity = 0.0

        if perimeter > 0:

            circularity = (
                4.0
                *
                np.pi
                *
                area
                /
                (
                    perimeter
                    *
                    perimeter
                )
            )

        lesions.append({

            "lesion_id":
                f"{lesion_type}_{len(lesions) + 1}",

            "type":
                lesion_type,

            "centroid_x":
                float(
                    cx
                ),

            "centroid_y":
                float(
                    cy
                ),

            "area_pixels":
                int(
                    area
                ),

            "bbox_x":
                int(
                    x
                ),

            "bbox_y":
                int(
                    y
                ),

            "bbox_width":
                int(
                    width
                ),

            "bbox_height":
                int(
                    height
                ),

            "aspect_ratio":
                float(
                    width /
                    max(
                        height,
                        1
                    )
                ),

            "circularity":
                float(
                    circularity
                )
        })

    return lesions


# ============================================================
# SAVE PREDICTED MASKS
# ============================================================

def save_prediction_masks(
    image_id,
    probabilities
):

    paths = {}

    for index, lesion in enumerate(
        CLASS_NAMES
    ):

        probability = probabilities[
            index
        ]

        binary = (
            probability
            >= THRESHOLD
        ).astype(
            np.uint8
        )

        binary = (
            binary * 255
        ).astype(
            np.uint8
        )

        filename = (
            f"{image_id}_{lesion}_mask.png"
        )

        path = os.path.join(
            MASK_DIR,
            filename
        )

        cv2.imwrite(
            path,
            binary
        )

        paths[
            lesion
        ] = path

    return paths


# ============================================================
# CREATE VISUALIZATION
# ============================================================

def create_visualization(
    image,
    probabilities,
    image_id
):

    canvas = image.copy()

    height, width = image.shape[:2]

    # --------------------------------------------------------
    # Draw lesion contours
    # --------------------------------------------------------

    for index, lesion in enumerate(
        CLASS_NAMES
    ):

        probability = probabilities[
            index
        ]

        probability = cv2.resize(
            probability,
            (
                width,
                height
            ),
            interpolation=cv2.INTER_LINEAR
        )

        binary = (
            probability
            >= THRESHOLD
        ).astype(
            np.uint8
        )

        contours, _ = cv2.findContours(
            binary,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )

        for contour in contours:

            if cv2.contourArea(
                contour
            ) < MIN_LESION_AREA:

                continue

            cv2.drawContours(
                canvas,
                [contour],
                -1,
                (
                    255,
                    255,
                    255
                ),
                1
            )

    # --------------------------------------------------------
    # Header
    # --------------------------------------------------------

    cv2.rectangle(
        canvas,
        (0, 0),
        (width, 42),
        (0, 0, 0),
        -1
    )

    cv2.putText(
        canvas,
        "RETINA-FUSION 360 | IDRiD LESION SEGMENTATION",
        (10, 28),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        (255, 255, 255),
        1,
        cv2.LINE_AA
    )

    filename = (
        f"{image_id}_lesion_prediction.png"
    )

    path = os.path.join(
        VIS_DIR,
        filename
    )

    cv2.imwrite(
        path,
        cv2.cvtColor(
            canvas,
            cv2.COLOR_RGB2BGR
        )
    )

    return path


# ============================================================
# PREDICT ALL IDRiD IMAGES
# ============================================================

def predict_all(
    model,
    records
):

    print()
    print("=" * 70)
    print("FINAL IDRiD LESION PREDICTION")
    print("=" * 70)

    model.eval()

    all_results = []

    for index, record in enumerate(
        records,
        1
    ):

        image_id = record[
            "image_id"
        ]

        print(
            f"[{index}/{len(records)}] "
            f"IDRiD_{image_id}"
        )

        image = load_image(
            record["image_path"]
        )

        original_image = image.copy()

        processed = preprocess_image(
            image
        )

        tensor = torch.from_numpy(
            processed.transpose(
                2,
                0,
                1
            )
        ).float().unsqueeze(
            0
        ).to(
            DEVICE
        )

        with torch.no_grad():

            logits = model(
                tensor
            )

            probabilities = torch.sigmoid(
                logits
            )[0].cpu().numpy()

        # ----------------------------------------------------
        # Masks
        # ----------------------------------------------------

        mask_paths = save_prediction_masks(
            image_id,
            probabilities
        )

        # ----------------------------------------------------
        # Lesion extraction
        # ----------------------------------------------------

        lesion_objects = []

        for class_index, lesion in enumerate(
            CLASS_NAMES
        ):

            binary = (
                probabilities[
                    class_index
                ]
                >= THRESHOLD
            ).astype(
                np.uint8
            )

            objects = extract_lesions(
                binary,
                lesion
            )

            lesion_objects.extend(
                objects
            )

        # ----------------------------------------------------
        # Visualization
        # ----------------------------------------------------

        visualization_path = create_visualization(
            original_image,
            probabilities,
            image_id
        )

        # ----------------------------------------------------
        # Graph-ready nodes
        # ----------------------------------------------------

        graph_nodes = []

        for lesion in lesion_objects:

            graph_nodes.append({

                "node_type":
                    "lesion",

                "lesion_type":
                    lesion["type"],

                "lesion_id":
                    lesion["lesion_id"],

                "x":
                    lesion["centroid_x"],

                "y":
                    lesion["centroid_y"],

                "area":
                    lesion["area_pixels"],

                "aspect_ratio":
                    lesion["aspect_ratio"],

                "circularity":
                    lesion["circularity"]
            })

        result = {

            "image_id":
                image_id,

            "source_dataset":
                "IDRiD",

            "module":
                "lesion_segmentation",

            "model":
                "FinalLesionUNet",

            "threshold":
                THRESHOLD,

            "lesion_count":
                len(
                    lesion_objects
                ),

            "counts_by_type": {

                lesion:
                    sum(
                        1
                        for obj in lesion_objects
                        if obj["type"] == lesion
                    )

                for lesion in CLASS_NAMES
            },

            "lesions":
                lesion_objects,

            "graph_nodes":
                graph_nodes,

            "predicted_masks":
                mask_paths,

            "visualization":
                visualization_path
        }

        json_path = os.path.join(
            LESION_JSON_DIR,
            f"{image_id}_lesions.json"
        )

        with open(
            json_path,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                result,
                file,
                indent=2
            )

        all_results.append(
            result
        )

        print(
            f"    Lesions: "
            f"{len(lesion_objects)} | "
            f"MA={result['counts_by_type']['MA']} | "
            f"EX={result['counts_by_type']['EX']} | "
            f"HE={result['counts_by_type']['HE']} | "
            f"SE={result['counts_by_type']['SE']}"
        )

    # --------------------------------------------------------
    # Master JSON
    # --------------------------------------------------------

    master_path = os.path.join(
        RESULT_DIR,
        "all_idrid_lesions_final.json"
    )

    with open(
        master_path,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            all_results,
            file,
            indent=2
        )

    print()
    print(
        "Master lesion file:"
    )

    print(
        master_path
    )

    return all_results


# ============================================================
# SAVE MANIFEST
# ============================================================

def save_manifest(
    records
):

    rows = []

    for record in records:

        rows.append({

            "image_id":
                record["image_id"],

            "image_path":
                record["image_path"],

            "MA_mask":
                record["MA"],

            "EX_mask":
                record["EX"],

            "HE_mask":
                record["HE"],

            "SE_mask":
                record["SE"],

            "MA_available":
                record["MA"] is not None,

            "EX_available":
                record["EX"] is not None,

            "HE_available":
                record["HE"] is not None,

            "SE_available":
                record["SE"] is not None
        })

    dataframe = pd.DataFrame(
        rows
    )

    path = os.path.join(
        RESULT_DIR,
        "idrid_lesion_manifest.csv"
    )

    dataframe.to_csv(
        path,
        index=False
    )

    print()
    print(
        "Manifest:"
    )

    print(
        path
    )


# ============================================================
# SAVE FINAL SUMMARY
# ============================================================

def save_summary(
    results,
    checkpoint_path
):

    summary = {

        "project":
            "RETINA-FUSION 360",

        "dataset":
            "IDRiD",

        "images_processed":
            len(results),

        "total_predicted_lesions":
            sum(
                r["lesion_count"]
                for r in results
            ),

        "lesion_counts": {

            lesion:
                sum(
                    r[
                        "counts_by_type"
                    ][lesion]
                    for r in results
                )

            for lesion in CLASS_NAMES
        },

        "model":
            "FinalLesionUNet",

        "threshold":
            THRESHOLD,

        "checkpoint":
            checkpoint_path
    }

    path = os.path.join(
        RESULT_DIR,
        "lesion_pipeline_final_summary.json"
    )

    with open(
        path,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            summary,
            file,
            indent=2
        )

    return path


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 70)
    print("RETINA-FUSION 360")
    print("FINAL IDRiD LESION PIPELINE")
    print("=" * 70)

    print()

    print(
        f"Device: {DEVICE}"
    )

    print(
        f"IDRiD root: {IDRID_ROOT}"
    )

    print(
        f"Model output: {MODEL_DIR}"
    )

    print(
        f"Results output: {RESULT_DIR}"
    )

    save_config()

    # --------------------------------------------------------
    # Discover
    # --------------------------------------------------------

    (
        original_dir,
        groundtruth_dir
    ) = discover_idrid()

    # --------------------------------------------------------
    # Index
    # --------------------------------------------------------

    records = build_index(
        original_dir,
        groundtruth_dir
    )

    save_manifest(
        records
    )

    # --------------------------------------------------------
    # Train
    # --------------------------------------------------------

    checkpoint_path = train_model(
        records
    )

    # --------------------------------------------------------
    # Load best model
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print("LOADING BEST LESION MODEL")
    print("=" * 70)

    model = load_trained_model(
        checkpoint_path
    )

    print(
        "✓ Best lesion model loaded"
    )

    # --------------------------------------------------------
    # Predict
    # --------------------------------------------------------

    results = predict_all(
        model,
        records
    )

    # --------------------------------------------------------
    # Summary
    # --------------------------------------------------------

    summary_path = save_summary(
        results,
        checkpoint_path
    )

    print()
    print("=" * 70)
    print("FINAL IDRiD LESION PIPELINE COMPLETE")
    print("=" * 70)

    print()

    print(
        f"Images processed: "
        f"{len(results)}"
    )

    total_lesions = sum(
        r["lesion_count"]
        for r in results
    )

    print(
        f"Total predicted lesions: "
        f"{total_lesions}"
    )

    print()

    print(
        "Lesion counts:"
    )

    for lesion in CLASS_NAMES:

        count = sum(
            r[
                "counts_by_type"
            ][lesion]
            for r in results
        )

        print(
            f"  {lesion}: {count}"
        )

    print()

    print(
        "Best model:"
    )

    print(
        checkpoint_path
    )

    print()

    print(
        "Predicted masks:"
    )

    print(
        MASK_DIR
    )

    print()

    print(
        "Visualizations:"
    )

    print(
        VIS_DIR
    )

    print()

    print(
        "Lesion JSON:"
    )

    print(
        LESION_JSON_DIR
    )

    print()

    print(
        "Final summary:"
    )

    print(
        summary_path
    )

    print()


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()