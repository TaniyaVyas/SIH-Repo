import os
import cv2
import numpy as np

# ============================================================
# RETINA-FUSION 360
# FINAL VESSEL SKELETONIZATION
# ============================================================

PROJECT_ROOT = r"D:\RETINA-FUSION-360"

INPUT_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "vessel_segmentation_final",
    "predicted_masks"
)

OUTPUT_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "vessel_segmentation_final",
    "skeletons"
)

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)


# ============================================================
# CHECK SKIMAGE
# ============================================================

try:

    from skimage.morphology import skeletonize

except ImportError:

    print()
    print("ERROR: scikit-image is not installed.")
    print()
    print("Install it using:")
    print()
    print(
        r'& "C:\Program Files\Python313\python.exe" -m pip install scikit-image'
    )
    print()

    raise


# ============================================================
# REMOVE SMALL COMPONENTS
# ============================================================

def remove_small_components(
    mask,
    min_size=30
):

    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(
        mask,
        connectivity=8
    )

    cleaned = np.zeros_like(
        mask,
        dtype=np.uint8
    )

    for label in range(
        1,
        num_labels
    ):

        area = stats[
            label,
            cv2.CC_STAT_AREA
        ]

        if area >= min_size:

            cleaned[
                labels == label
            ] = 1

    return cleaned


# ============================================================
# PROCESS ONE MASK
# ============================================================

def process_mask(
    input_path,
    output_path
):

    mask = cv2.imread(
        input_path,
        cv2.IMREAD_GRAYSCALE
    )

    if mask is None:

        raise RuntimeError(
            f"Could not read: {input_path}"
        )

    # Binary
    mask = (
        mask > 127
    ).astype(
        np.uint8
    )

    # --------------------------------------------------------
    # Morphological cleanup
    # --------------------------------------------------------

    kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE,
        (3, 3)
    )

    mask = cv2.morphologyEx(
        mask * 255,
        cv2.MORPH_CLOSE,
        kernel
    )

    mask = (
        mask > 127
    ).astype(
        np.uint8
    )

    # --------------------------------------------------------
    # Remove tiny components
    # --------------------------------------------------------

    mask = remove_small_components(
        mask,
        min_size=30
    )

    # --------------------------------------------------------
    # Skeletonize
    # --------------------------------------------------------

    skeleton = skeletonize(
        mask > 0
    )

    skeleton = (
        skeleton.astype(
            np.uint8
        )
        * 255
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    cv2.imwrite(
        output_path,
        skeleton
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)

    print(
        "RETINA-FUSION 360"
    )

    print(
        "FINAL VESSEL SKELETONIZATION"
    )

    print("=" * 70)

    print()

    print(
        f"Input:"
    )

    print(
        INPUT_DIR
    )

    print()

    print(
        f"Output:"
    )

    print(
        OUTPUT_DIR
    )

    print()

    files = sorted(
        [
            f
            for f in os.listdir(
                INPUT_DIR
            )
            if f.lower().endswith(
                ".png"
            )
        ]
    )

    print(
        f"Masks found: {len(files)}"
    )

    print()

    if not files:

        print(
            "ERROR: No predicted masks found."
        )

        return

    for index, filename in enumerate(
        files,
        1
    ):

        print(
            f"[{index}/{len(files)}] "
            f"{filename}"
        )

        input_path = os.path.join(
            INPUT_DIR,
            filename
        )

        output_name = filename.replace(
            "_final_vessel.png",
            "_final_skeleton.png"
        )

        output_path = os.path.join(
            OUTPUT_DIR,
            output_name
        )

        try:

            process_mask(
                input_path,
                output_path
            )

        except Exception as error:

            print(
                f"    ERROR: {error}"
            )

    print()

    print("=" * 70)

    print(
        "FINAL SKELETONIZATION COMPLETE"
    )

    print("=" * 70)

    print()

    print(
        "Skeletons:"
    )

    print(
        OUTPUT_DIR
    )


if __name__ == "__main__":

    main()