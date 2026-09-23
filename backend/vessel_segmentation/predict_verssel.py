import os
import sys
import glob

import cv2
import numpy as np
import torch


# ============================================================
# IMPORTS
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

from backend.vessel_segmentation.model import VesselUNet
from backend.vessel_segmentation.skeletonize import (
    process_mask
)


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = r"D:\RETINA-FUSION-360"

DRIVE_ROOT = os.path.join(
    PROJECT_ROOT,
    "datasets",
    "Drive"
)

MODEL_PATH = os.path.join(
    PROJECT_ROOT,
    "models",
    "vessel_segmentation",
    "best_vessel_model.pth"
)

RESULT_ROOT = os.path.join(
    PROJECT_ROOT,
    "results",
    "vessel_segmentation"
)

PREDICTED_DIR = os.path.join(
    RESULT_ROOT,
    "predicted_masks"
)

CLEANED_DIR = os.path.join(
    RESULT_ROOT,
    "cleaned_masks"
)

SKELETON_DIR = os.path.join(
    RESULT_ROOT,
    "skeletons"
)

os.makedirs(
    PREDICTED_DIR,
    exist_ok=True
)

os.makedirs(
    CLEANED_DIR,
    exist_ok=True
)

os.makedirs(
    SKELETON_DIR,
    exist_ok=True
)


DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)

IMAGE_SIZE = 256


# ============================================================
# LOAD MODEL
# ============================================================

def load_model():

    model = VesselUNet().to(
        DEVICE
    )

    checkpoint = torch.load(
        MODEL_PATH,
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
# PROCESS IMAGE
# ============================================================

def predict_image(
    model,
    image_path
):

    image = cv2.imread(
        image_path,
        cv2.IMREAD_COLOR
    )

    if image is None:

        raise RuntimeError(
            f"Could not read:\n{image_path}"
        )

    original_height, original_width = (
        image.shape[:2]
    )

    image_rgb = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    resized = cv2.resize(
        image_rgb,
        (
            IMAGE_SIZE,
            IMAGE_SIZE
        ),
        interpolation=cv2.INTER_AREA
    )

    resized = (
        resized.astype(
            np.float32
        ) / 255.0
    )

    resized = np.transpose(
        resized,
        (2, 0, 1)
    )

    tensor = torch.tensor(
        resized,
        dtype=torch.float32
    ).unsqueeze(0).to(
        DEVICE
    )

    with torch.no_grad():

        logits = model(
            tensor
        )

        probability = torch.sigmoid(
            logits
        )[0, 0].cpu().numpy()

    mask = (
        probability > 0.5
    ).astype(
        np.uint8
    ) * 255

    # Restore original DRIVE resolution
    mask = cv2.resize(
        mask,
        (
            original_width,
            original_height
        ),
        interpolation=cv2.INTER_NEAREST
    )

    return mask


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("RETINA-FUSION 360")
    print("VESSEL MASK + SKELETON GENERATION")
    print("=" * 70)

    print(
        f"Device: {DEVICE}"
    )

    print(
        f"Model: {MODEL_PATH}"
    )

    model = load_model()

    # Use DRIVE test images
    image_dir = os.path.join(
        DRIVE_ROOT,
        "test",
        "test",
        "images"
    )

    image_paths = sorted(
        glob.glob(
            os.path.join(
                image_dir,
                "*.tif"
            )
        )
    )

    print()
    print(
        f"Test images found: "
        f"{len(image_paths)}"
    )

    for index, image_path in enumerate(
        image_paths,
        1
    ):

        filename = os.path.basename(
            image_path
        )

        stem = os.path.splitext(
            filename
        )[0]

        print(
            f"[{index}/{len(image_paths)}] "
            f"{filename}"
        )

        # ----------------------------------------------------
        # Prediction
        # ----------------------------------------------------

        mask = predict_image(
            model,
            image_path
        )

        predicted_path = os.path.join(
            PREDICTED_DIR,
            f"{stem}_vessel.png"
        )

        cv2.imwrite(
            predicted_path,
            mask
        )

        # ----------------------------------------------------
        # Skeletonization
        # ----------------------------------------------------

        cleaned_path = os.path.join(
            CLEANED_DIR,
            f"{stem}_cleaned.png"
        )

        skeleton_path = os.path.join(
            SKELETON_DIR,
            f"{stem}_skeleton.png"
        )

        process_mask(
            predicted_path,
            skeleton_path,
            cleaned_path
        )

    print()
    print("=" * 70)
    print("VESSEL PROCESSING COMPLETE")
    print("=" * 70)

    print(
        f"Predicted masks:\n{PREDICTED_DIR}"
    )

    print(
        f"Cleaned masks:\n{CLEANED_DIR}"
    )

    print(
        f"Skeletons:\n{SKELETON_DIR}"
    )


if __name__ == "__main__":
    main()