import os
import cv2
import numpy as np
import torch

from final_model import create_model


# ============================================================
# RETINA-FUSION 360
# FINAL VESSEL PREDICTION
# ============================================================

PROJECT_ROOT = r"D:\RETINA-FUSION-360"

TEST_DIR = os.path.join(
    PROJECT_ROOT,
    "datasets",
    "Drive",
    "test",
    "test",
    "images"
)

FOV_DIR = os.path.join(
    PROJECT_ROOT,
    "datasets",
    "Drive",
    "test",
    "test",
    "mask"
)

MODEL_PATH = os.path.join(
    PROJECT_ROOT,
    "models",
    "vessel_segmentation_final",
    "best_vessel_model_final.pth"
)

OUTPUT_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "vessel_segmentation_final",
    "predicted_masks"
)

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)

IMAGE_SIZE = 256
THRESHOLD = 0.5

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ============================================================
# PREPROCESSING
# ============================================================

def preprocess_image(image):

    green = image[:, :, 1]

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )

    green = clahe.apply(green)

    green = green.astype(
        np.float32
    ) / 255.0

    green = np.power(
        green,
        0.9
    )

    enhanced = np.stack(
        [green, green, green],
        axis=2
    )

    return enhanced


# ============================================================
# LOAD MODEL
# ============================================================

print("=" * 70)
print("RETINA-FUSION 360")
print("FINAL VESSEL PREDICTION")
print("=" * 70)

print()
print(f"Device: {DEVICE}")
print(f"Model: {MODEL_PATH}")
print()

if not os.path.exists(MODEL_PATH):

    raise FileNotFoundError(
        f"Model not found:\n{MODEL_PATH}"
    )

checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE
)

model = create_model().to(
    DEVICE
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model.eval()

print("✓ Final vessel model loaded")


# ============================================================
# FIND TEST IMAGES
# ============================================================

if not os.path.exists(TEST_DIR):

    raise FileNotFoundError(
        f"Test directory not found:\n{TEST_DIR}"
    )

image_files = sorted(
    [
        file
        for file in os.listdir(TEST_DIR)
        if file.lower().endswith(".tif")
    ]
)

print()
print(
    f"Test images found: {len(image_files)}"
)
print()


# ============================================================
# PREDICTION
# ============================================================

for index, filename in enumerate(
    image_files,
    1
):

    print(
        f"[{index}/{len(image_files)}] {filename}"
    )

    image_path = os.path.join(
        TEST_DIR,
        filename
    )

    image = cv2.imread(
        image_path,
        cv2.IMREAD_COLOR
    )

    if image is None:

        print(
            "    ERROR: Could not load image"
        )

        continue

    original_h, original_w = image.shape[:2]

    # --------------------------------------------------------
    # Preprocess
    # --------------------------------------------------------

    processed = preprocess_image(
        image
    )

    processed = cv2.resize(
        processed,
        (
            IMAGE_SIZE,
            IMAGE_SIZE
        ),
        interpolation=cv2.INTER_AREA
    )

    tensor = torch.from_numpy(
        processed.transpose(2, 0, 1)
    ).float().unsqueeze(0)

    tensor = tensor.to(
        DEVICE
    )

    # --------------------------------------------------------
    # Model prediction
    # --------------------------------------------------------

    with torch.no_grad():

        logits = model(
            tensor
        )

        probabilities = torch.sigmoid(
            logits
        )

    probability_map = probabilities[
        0,
        0
    ].cpu().numpy()

    # --------------------------------------------------------
    # Threshold
    # --------------------------------------------------------

    mask = (
        probability_map >= THRESHOLD
    ).astype(
        np.uint8
    ) * 255

    # --------------------------------------------------------
    # Restore original resolution
    # --------------------------------------------------------

    mask = cv2.resize(
        mask,
        (
            original_w,
            original_h
        ),
        interpolation=cv2.INTER_NEAREST
    )

    # --------------------------------------------------------
    # Apply DRIVE FOV
    # --------------------------------------------------------

    image_number = filename.split(
        "_"
    )[0]

    fov_path = os.path.join(
        FOV_DIR,
        f"{image_number}_test_mask.gif"
    )

    if os.path.exists(fov_path):

        fov = cv2.imread(
            fov_path,
            cv2.IMREAD_GRAYSCALE
        )

        if fov is not None:

            if fov.shape != mask.shape:

                fov = cv2.resize(
                    fov,
                    (
                        original_w,
                        original_h
                    ),
                    interpolation=cv2.INTER_NEAREST
                )

            mask[
                fov == 0
            ] = 0

    # --------------------------------------------------------
    # Morphological cleanup
    # --------------------------------------------------------

    kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE,
        (3, 3)
    )

    mask = cv2.morphologyEx(
        mask,
        cv2.MORPH_CLOSE,
        kernel
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    output_name = filename.replace(
        ".tif",
        "_final_vessel.png"
    )

    output_path = os.path.join(
        OUTPUT_DIR,
        output_name
    )

    cv2.imwrite(
        output_path,
        mask
    )

print()
print("=" * 70)
print("FINAL VESSEL PREDICTION COMPLETE")
print("=" * 70)

print()
print("Predicted masks:")
print(OUTPUT_DIR)