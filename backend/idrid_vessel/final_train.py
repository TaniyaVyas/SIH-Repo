import os
import re
import cv2
import json
import numpy as np

import torch
import torch.nn as nn


# ============================================================
# RETINA-FUSION 360
# IDRiD VESSEL INFERENCE
#
# Purpose:
#   Use the final DRIVE-trained vessel model to generate
#   vessel predictions for the SAME 81 IDRiD retinal images.
#
# Pipeline:
#
#   DRIVE-trained vessel model
#              ↓
#       IDRiD image inference
#              ↓
#       vessel probability map
#              ↓
#       binary vessel mask
#              ↓
#       morphological cleanup
#              ↓
#       skeletonization
#              ↓
#       vessel features
#              ↓
#       future multimodal retinal graph
#
# IMPORTANT:
# IDRiD does not contain vessel ground truth in the current
# local package, so this is inference only.
#
# The vessel model was trained on DRIVE.
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

MODEL_PATH = os.path.join(
    PROJECT_ROOT,
    "models",
    "vessel_segmentation_final",
    "best_vessel_model_final.pth"
)

OUTPUT_ROOT = os.path.join(
    PROJECT_ROOT,
    "results",
    "idrid_vessel_final"
)

MASK_DIR = os.path.join(
    OUTPUT_ROOT,
    "predicted_masks"
)

PROBABILITY_DIR = os.path.join(
    OUTPUT_ROOT,
    "probability_maps"
)

OVERLAY_DIR = os.path.join(
    OUTPUT_ROOT,
    "overlays"
)

SKELETON_DIR = os.path.join(
    OUTPUT_ROOT,
    "skeletons"
)

SUMMARY_DIR = os.path.join(
    OUTPUT_ROOT,
    "summary"
)

SUMMARY_JSON = os.path.join(
    SUMMARY_DIR,
    "idrid_vessel_inference_summary.json"
)


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_IMAGE_SIZE = 256

THRESHOLD = 0.45

MIN_COMPONENT_SIZE = 50

MORPH_KERNEL_SIZE = 3

DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


# ============================================================
# CREATE OUTPUT DIRECTORIES
# ============================================================

for directory in [

    OUTPUT_ROOT,

    MASK_DIR,

    PROBABILITY_DIR,

    OVERLAY_DIR,

    SKELETON_DIR,

    SUMMARY_DIR

]:

    os.makedirs(
        directory,
        exist_ok=True
    )


# ============================================================
# HEADER
# ============================================================

print()
print("=" * 72)
print("RETINA-FUSION 360")
print("IDRiD VESSEL INFERENCE")
print("=" * 72)
print()

print(
    f"Device: {DEVICE}"
)

print(
    f"Model: {MODEL_PATH}"
)

print(
    f"Threshold: {THRESHOLD}"
)

print()


# ============================================================
# MODEL ARCHITECTURE
#
# MUST MATCH THE MODEL USED DURING DRIVE TRAINING.
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
                kernel_size=3,
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
                kernel_size=3,
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


class UNetFinal(
    nn.Module
):

    def __init__(
        self
    ):

        super().__init__()

        # ----------------------------------------------------
        # Encoder
        # ----------------------------------------------------

        self.enc1 = DoubleConv(
            3,
            32
        )

        self.pool1 = nn.MaxPool2d(
            2
        )

        self.enc2 = DoubleConv(
            32,
            64
        )

        self.pool2 = nn.MaxPool2d(
            2
        )

        self.enc3 = DoubleConv(
            64,
            128
        )

        self.pool3 = nn.MaxPool2d(
            2
        )

        self.enc4 = DoubleConv(
            128,
            256
        )

        self.pool4 = nn.MaxPool2d(
            2
        )

        # ----------------------------------------------------
        # Bottleneck
        # ----------------------------------------------------

        self.bottleneck = DoubleConv(
            256,
            512
        )

        # ----------------------------------------------------
        # Decoder
        # ----------------------------------------------------

        self.up4 = nn.ConvTranspose2d(
            512,
            256,
            kernel_size=2,
            stride=2
        )

        self.dec4 = DoubleConv(
            512,
            256
        )

        self.up3 = nn.ConvTranspose2d(
            256,
            128,
            kernel_size=2,
            stride=2
        )

        self.dec3 = DoubleConv(
            256,
            128
        )

        self.up2 = nn.ConvTranspose2d(
            128,
            64,
            kernel_size=2,
            stride=2
        )

        self.dec2 = DoubleConv(
            128,
            64
        )

        self.up1 = nn.ConvTranspose2d(
            64,
            32,
            kernel_size=2,
            stride=2
        )

        self.dec1 = DoubleConv(
            64,
            32
        )

        # ----------------------------------------------------
        # IMPORTANT
        #
        # The original checkpoint uses:
        #     output.weight
        #     output.bias
        #
        # Therefore the layer is deliberately named
        # "output" here.
        # ----------------------------------------------------

        self.output = nn.Conv2d(
            32,
            1,
            kernel_size=1
        )


    def forward(
        self,
        x
    ):

        # ----------------------------------------------------
        # Encoder
        # ----------------------------------------------------

        e1 = self.enc1(
            x
        )

        e2 = self.enc2(
            self.pool1(
                e1
            )
        )

        e3 = self.enc3(
            self.pool2(
                e2
            )
        )

        e4 = self.enc4(
            self.pool3(
                e3
            )
        )

        # ----------------------------------------------------
        # Bottleneck
        # ----------------------------------------------------

        b = self.bottleneck(
            self.pool4(
                e4
            )
        )

        # ----------------------------------------------------
        # Decoder
        # ----------------------------------------------------

        d4 = self.up4(
            b
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


# ============================================================
# LOAD MODEL
# ============================================================

print(
    "Loading vessel model..."
)

if not os.path.exists(
    MODEL_PATH
):

    raise FileNotFoundError(
        "\nVessel model not found:\n"
        f"{MODEL_PATH}\n"
        "\nExpected model:\n"
        "best_vessel_model_final.pth"
    )


model = UNetFinal().to(
    DEVICE
)


checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE
)


# ============================================================
# CHECKPOINT FORMAT
# ============================================================

if isinstance(
    checkpoint,
    dict
) and "model_state_dict" in checkpoint:

    state_dict = checkpoint[
        "model_state_dict"
    ]

    checkpoint_epoch = checkpoint.get(
        "epoch",
        None
    )

    checkpoint_dice = checkpoint.get(
        "best_val_dice",
        None
    )

else:

    state_dict = checkpoint

    checkpoint_epoch = None

    checkpoint_dice = None


# ============================================================
# REMOVE POSSIBLE DataParallel PREFIX
# ============================================================

clean_state_dict = {}

for key, value in state_dict.items():

    if key.startswith(
        "module."
    ):

        new_key = key[
            len("module.") :
        ]

    else:

        new_key = key

    clean_state_dict[
        new_key
    ] = value


state_dict = clean_state_dict


# ============================================================
# CHECK FINAL LAYER NAME
#
# Supports both:
#
#     output.weight
#     output.bias
#
# AND:
#
#     out.weight
#     out.bias
#
# ============================================================

if (
    "out.weight" in state_dict
    and
    "output.weight" not in state_dict
):

    state_dict[
        "output.weight"
    ] = state_dict.pop(
        "out.weight"
    )

if (
    "out.bias" in state_dict
    and
    "output.bias" not in state_dict
):

    state_dict[
        "output.bias"
    ] = state_dict.pop(
        "out.bias"
    )


# ============================================================
# LOAD WEIGHTS
# ============================================================

try:

    model.load_state_dict(
        state_dict,
        strict=True
    )

except RuntimeError as error:

    print()
    print(
        "MODEL LOADING ERROR"
    )
    print(
        str(error)
    )
    print()

    print(
        "Checkpoint keys:"
    )

    for key in state_dict.keys():

        print(
            f"  {key}"
        )

    raise


model.eval()


print(
    "✓ Vessel model loaded successfully"
)

if checkpoint_epoch is not None:

    print(
        f"Checkpoint epoch: "
        f"{checkpoint_epoch}"
    )

if checkpoint_dice is not None:

    print(
        f"Checkpoint best validation Dice: "
        f"{float(checkpoint_dice):.4f}"
    )

print()


# ============================================================
# FIND IDRiD ORIGINAL IMAGE DIRECTORY
# ============================================================

def find_original_directory():

    candidates = []

    for root, dirs, files in os.walk(
        IDRID_ROOT
    ):

        for directory in dirs:

            if (
                directory.lower()
                ==
                "1. original images".lower()
            ):

                candidates.append(
                    os.path.join(
                        root,
                        directory
                    )
                )

    if not candidates:

        return None

    # Prefer the shortest path in case there
    # are duplicated extraction directories.

    candidates = sorted(
        candidates,
        key=len
    )

    return candidates[0]


ORIGINAL_DIR = find_original_directory()


if ORIGINAL_DIR is None:

    raise RuntimeError(
        "Could not find IDRiD "
        "'1. Original Images' directory."
    )


print(
    "Original images:"
)

print(
    ORIGINAL_DIR
)

print()


# ============================================================
# FIND ALL IMAGES
# ============================================================

image_files = []

for root, dirs, files in os.walk(
    ORIGINAL_DIR
):

    for filename in files:

        if filename.lower().endswith(
            (
                ".jpg",
                ".jpeg",
                ".png",
                ".tif",
                ".tiff"
            )
        ):

            image_files.append(
                os.path.join(
                    root,
                    filename
                )
            )


image_files = sorted(
    image_files
)


print(
    f"IDRiD images found: "
    f"{len(image_files)}"
)

print()


if not image_files:

    raise RuntimeError(
        "No IDRiD original images found."
    )


# ============================================================
# EXTRACT IDRiD IMAGE ID
# ============================================================

def extract_image_id(
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

        return (
            f"{int(match.group(1)):02d}"
        )

    match = re.search(
        r"(\d+)",
        stem
    )

    if match:

        return (
            f"{int(match.group(1)):02d}"
        )

    return stem


# ============================================================
# PREPROCESSING
# ============================================================

def preprocess_image(
    image
):

    # --------------------------------------------------------
    # BGR → RGB
    # --------------------------------------------------------

    rgb = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    # --------------------------------------------------------
    # Green channel
    # --------------------------------------------------------

    green = rgb[
        :,
        :,
        1
    ]

    # --------------------------------------------------------
    # CLAHE
    # --------------------------------------------------------

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(
            8,
            8
        )
    )

    green = clahe.apply(
        green
    )

    # --------------------------------------------------------
    # Gamma correction
    # --------------------------------------------------------

    gamma = 0.9

    green_float = (
        green.astype(
            np.float32
        )
        /
        255.0
    )

    green_float = np.power(
        green_float,
        gamma
    )

    green = (
        green_float
        *
        255.0
    ).astype(
        np.uint8
    )

    # --------------------------------------------------------
    # Convert to 3 channels
    # --------------------------------------------------------

    processed = cv2.cvtColor(
        green,
        cv2.COLOR_GRAY2RGB
    )

    # --------------------------------------------------------
    # Resize to model input
    # --------------------------------------------------------

    processed = cv2.resize(
        processed,
        (
            MODEL_IMAGE_SIZE,
            MODEL_IMAGE_SIZE
        ),
        interpolation=cv2.INTER_AREA
    )

    # --------------------------------------------------------
    # Normalize
    # --------------------------------------------------------

    processed = (
        processed.astype(
            np.float32
        )
        /
        255.0
    )

    # --------------------------------------------------------
    # HWC → CHW
    # --------------------------------------------------------

    processed = np.transpose(
        processed,
        (
            2,
            0,
            1
        )
    )

    tensor = torch.tensor(
        processed,
        dtype=torch.float32
    )

    tensor = tensor.unsqueeze(
        0
    )

    return tensor


# ============================================================
# ESTIMATE RETINAL FIELD OF VIEW
# ============================================================

def estimate_fov(
    image
):

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    # Remove obvious black background.

    mask = np.where(
        gray > 10,
        255,
        0
    ).astype(
        np.uint8
    )

    kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE,
        (
            15,
            15
        )
    )

    mask = cv2.morphologyEx(
        mask,
        cv2.MORPH_CLOSE,
        kernel
    )

    mask = cv2.morphologyEx(
        mask,
        cv2.MORPH_OPEN,
        kernel
    )

    return mask


# ============================================================
# CLEAN VESSEL MASK
# ============================================================

def clean_mask(
    mask
):

    binary = (
        mask > 0
    ).astype(
        np.uint8
    ) * 255

    # --------------------------------------------------------
    # Morphological closing
    # --------------------------------------------------------

    kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE,
        (
            MORPH_KERNEL_SIZE,
            MORPH_KERNEL_SIZE
        )
    )

    binary = cv2.morphologyEx(
        binary,
        cv2.MORPH_CLOSE,
        kernel
    )

    # --------------------------------------------------------
    # Remove tiny disconnected components
    # --------------------------------------------------------

    num_labels, labels, stats, centroids = (
        cv2.connectedComponentsWithStats(
            binary,
            connectivity=8
        )
    )

    cleaned = np.zeros_like(
        binary
    )

    for label in range(
        1,
        num_labels
    ):

        area = stats[
            label,
            cv2.CC_STAT_AREA
        ]

        if (
            area
            >=
            MIN_COMPONENT_SIZE
        ):

            cleaned[
                labels == label
            ] = 255

    return cleaned


# ============================================================
# SKELETONIZATION
# ============================================================

def create_skeleton(
    binary_mask
):

    try:

        from skimage.morphology import (
            skeletonize
        )

    except ImportError:

        raise RuntimeError(
            "\nscikit-image is required.\n"
            "Install with:\n"
            "pip install scikit-image"
        )

    binary = (
        binary_mask > 0
    )

    skeleton = skeletonize(
        binary
    )

    skeleton = (
        skeleton.astype(
            np.uint8
        )
        *
        255
    )

    return skeleton


# ============================================================
# VESSEL STATISTICS
# ============================================================

def calculate_statistics(
    mask,
    skeleton,
    fov
):

    fov_binary = (
        fov > 0
    )

    vessel_binary = (
        mask > 0
    )

    skeleton_binary = (
        skeleton > 0
    )

    retinal_area = np.sum(
        fov_binary
    )

    vessel_pixels = np.sum(
        vessel_binary
        &
        fov_binary
    )

    skeleton_pixels = np.sum(
        skeleton_binary
        &
        fov_binary
    )

    if retinal_area == 0:

        density = 0.0

    else:

        density = (
            vessel_pixels
            /
            retinal_area
        )

    return {

        "vessel_pixels":
            int(
                vessel_pixels
            ),

        "skeleton_pixels":
            int(
                skeleton_pixels
            ),

        "retinal_pixels":
            int(
                retinal_area
            ),

        "vessel_density":
            float(
                density
            )
    }


# ============================================================
# CREATE VESSEL OVERLAY
# ============================================================

def create_overlay(
    image,
    mask,
    skeleton
):

    overlay = image.copy()

    vessel_pixels = (
        mask > 0
    )

    # Green vessel regions

    overlay[
        vessel_pixels
    ] = (
        0,
        255,
        0
    )

    skeleton_pixels = (
        skeleton > 0
    )

    # Red skeleton

    overlay[
        skeleton_pixels
    ] = (
        0,
        0,
        255
    )

    result = cv2.addWeighted(
        image,
        0.70,
        overlay,
        0.30,
        0
    )

    return result


# ============================================================
# PROCESS ONE IMAGE
# ============================================================

@torch.no_grad()
def process_image(
    image_path,
    index,
    total
):

    image_id = extract_image_id(
        image_path
    )

    image = cv2.imread(
        image_path
    )

    if image is None:

        raise RuntimeError(
            f"Could not read image:\n"
            f"{image_path}"
        )

    original_height, original_width = (
        image.shape[:2]
    )

    # --------------------------------------------------------
    # FOV
    # --------------------------------------------------------

    fov = estimate_fov(
        image
    )

    # --------------------------------------------------------
    # Preprocess
    # --------------------------------------------------------

    tensor = preprocess_image(
        image
    )

    tensor = tensor.to(
        DEVICE
    )

    # --------------------------------------------------------
    # Neural network inference
    # --------------------------------------------------------

    logits = model(
        tensor
    )

    probability = torch.sigmoid(
        logits
    )

    probability = (
        probability
        .squeeze()
        .cpu()
        .numpy()
    )

    # --------------------------------------------------------
    # Restore to original resolution
    # --------------------------------------------------------

    probability_original = cv2.resize(
        probability,
        (
            original_width,
            original_height
        ),
        interpolation=cv2.INTER_LINEAR
    )

    # --------------------------------------------------------
    # Threshold
    # --------------------------------------------------------

    mask = (
        probability_original
        >=
        THRESHOLD
    ).astype(
        np.uint8
    ) * 255

    # --------------------------------------------------------
    # FOV restriction
    # --------------------------------------------------------

    mask[
        fov == 0
    ] = 0

    # --------------------------------------------------------
    # Morphological cleanup
    # --------------------------------------------------------

    mask = clean_mask(
        mask
    )

    # --------------------------------------------------------
    # Apply FOV again
    # --------------------------------------------------------

    mask[
        fov == 0
    ] = 0

    # --------------------------------------------------------
    # Skeleton
    # --------------------------------------------------------

    skeleton = create_skeleton(
        mask
    )

    skeleton[
        fov == 0
    ] = 0

    # --------------------------------------------------------
    # Statistics
    # --------------------------------------------------------

    statistics = calculate_statistics(
        mask,
        skeleton,
        fov
    )

    # --------------------------------------------------------
    # Save binary vessel mask
    # --------------------------------------------------------

    mask_path = os.path.join(
        MASK_DIR,
        f"IDRiD_{image_id}_vessel.png"
    )

    cv2.imwrite(
        mask_path,
        mask
    )

    # --------------------------------------------------------
    # Save probability map
    # --------------------------------------------------------

    probability_uint8 = (
        np.clip(
            probability_original,
            0,
            1
        )
        *
        255
    ).astype(
        np.uint8
    )

    probability_path = os.path.join(
        PROBABILITY_DIR,
        f"IDRiD_{image_id}_probability.png"
    )

    cv2.imwrite(
        probability_path,
        probability_uint8
    )

    # --------------------------------------------------------
    # Save skeleton
    # --------------------------------------------------------

    skeleton_path = os.path.join(
        SKELETON_DIR,
        f"IDRiD_{image_id}_skeleton.png"
    )

    cv2.imwrite(
        skeleton_path,
        skeleton
    )

    # --------------------------------------------------------
    # Save overlay
    # --------------------------------------------------------

    overlay = create_overlay(
        image,
        mask,
        skeleton
    )

    overlay_path = os.path.join(
        OVERLAY_DIR,
        f"IDRiD_{image_id}_vessel_overlay.png"
    )

    cv2.imwrite(
        overlay_path,
        overlay
    )

    # --------------------------------------------------------
    # Result
    # --------------------------------------------------------

    result = {

        "image_id":
            image_id,

        "source_dataset":
            "IDRiD",

        "source_image":
            image_path,

        "original_width":
            int(
                original_width
            ),

        "original_height":
            int(
                original_height
            ),

        "model_input_size":
            MODEL_IMAGE_SIZE,

        "threshold":
            THRESHOLD,

        "mask_path":
            mask_path,

        "probability_path":
            probability_path,

        "skeleton_path":
            skeleton_path,

        "overlay_path":
            overlay_path,

        "statistics":
            statistics
    }

    print(
        f"[{index:02d}/{total}] "
        f"IDRiD_{image_id} | "
        f"Density="
        f"{statistics['vessel_density']:.5f} | "
        f"VesselPixels="
        f"{statistics['vessel_pixels']}"
    )

    return result


# ============================================================
# MAIN
# ============================================================

def main():

    results = []

    failed = []

    total = len(
        image_files
    )

    print(
        "Starting IDRiD vessel inference..."
    )

    print()

    for index, image_path in enumerate(
        image_files,
        1
    ):

        try:

            result = process_image(
                image_path,
                index,
                total
            )

            results.append(
                result
            )

        except Exception as error:

            image_id = extract_image_id(
                image_path
            )

            print(
                f"[{index:02d}/{total}] "
                f"IDRiD_{image_id} "
                f"FAILED: {error}"
            )

            failed.append({

                "image_id":
                    image_id,

                "image_path":
                    image_path,

                "error":
                    str(error)
            })

    # ========================================================
    # DENSITY STATISTICS
    # ========================================================

    densities = [

        result[
            "statistics"
        ][
            "vessel_density"
        ]

        for result in results

    ]

    # ========================================================
    # SUMMARY
    # ========================================================

    summary = {

        "project":
            "RETINA-FUSION 360",

        "module":
            "IDRiD Vessel Inference",

        "source_dataset":
            "IDRiD",

        "vessel_model_training_source":
            "DRIVE",

        "model_path":
            MODEL_PATH,

        "device":
            str(
                DEVICE
            ),

        "images_found":
            total,

        "images_processed":
            len(
                results
            ),

        "images_failed":
            len(
                failed
            ),

        "threshold":
            THRESHOLD,

        "model_input_size":
            MODEL_IMAGE_SIZE,

        "average_vessel_density":
            float(
                np.mean(
                    densities
                )
            )
            if densities
            else 0.0,

        "minimum_vessel_density":
            float(
                np.min(
                    densities
                )
            )
            if densities
            else 0.0,

        "maximum_vessel_density":
            float(
                np.max(
                    densities
                )
            )
            if densities
            else 0.0,

        "results":
            results,

        "failed":
            failed,

        "scientific_note":
            "Vessel predictions on IDRiD are inference outputs from a model trained on DRIVE. The current local IDRiD package does not provide vessel ground-truth masks, so IDRiD vessel segmentation performance is not quantitatively validated here."
    }

    # ========================================================
    # SAVE SUMMARY
    # ========================================================

    with open(
        SUMMARY_JSON,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            summary,
            file,
            indent=2
        )

    # ========================================================
    # FINAL OUTPUT
    # ========================================================

    print()
    print("=" * 72)
    print("IDRiD VESSEL INFERENCE COMPLETE")
    print("=" * 72)
    print()

    print(
        f"Images found: "
        f"{total}"
    )

    print(
        f"Images processed: "
        f"{len(results)}"
    )

    print(
        f"Images failed: "
        f"{len(failed)}"
    )

    if densities:

        print(
            f"Average vessel density: "
            f"{np.mean(densities):.5f}"
        )

        print(
            f"Minimum vessel density: "
            f"{np.min(densities):.5f}"
        )

        print(
            f"Maximum vessel density: "
            f"{np.max(densities):.5f}"
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
        "Probability maps:"
    )

    print(
        PROBABILITY_DIR
    )

    print()

    print(
        "Skeletons:"
    )

    print(
        SKELETON_DIR
    )

    print()

    print(
        "Overlays:"
    )

    print(
        OVERLAY_DIR
    )

    print()

    print(
        "Summary:"
    )

    print(
        SUMMARY_JSON
    )

    print()

    if failed:

        print(
            "WARNING: Some images failed."
        )

        for item in failed:

            print(
                f"  IDRiD_{item['image_id']}: "
                f"{item['error']}"
            )

    else:

        print(
            "✓ ALL IDRiD IMAGES PROCESSED"
        )

    print()


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()