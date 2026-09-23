import os
import cv2
import numpy as np


def skeletonize_vessel_mask(mask):
    """
    Convert a binary vessel mask into a 1-pixel-wide skeleton.
    Uses OpenCV morphological thinning.
    """

    mask = (mask > 0).astype(np.uint8) * 255

    skeleton = np.zeros_like(mask)

    element = cv2.getStructuringElement(
        cv2.MORPH_CROSS,
        (3, 3)
    )

    working = mask.copy()

    while True:

        eroded = cv2.erode(
            working,
            element
        )

        opened = cv2.dilate(
            eroded,
            element
        )

        difference = cv2.subtract(
            working,
            opened
        )

        skeleton = cv2.bitwise_or(
            skeleton,
            difference
        )

        working = eroded.copy()

        if cv2.countNonZero(
            working
        ) == 0:
            break

    return skeleton


def remove_small_components(
    mask,
    min_size=20
):
    """
    Remove tiny isolated components.
    """

    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(
        mask,
        connectivity=8
    )

    cleaned = np.zeros_like(mask)

    for label in range(1, num_labels):

        area = stats[
            label,
            cv2.CC_STAT_AREA
        ]

        if area >= min_size:

            cleaned[
                labels == label
            ] = 255

    return cleaned


def process_mask(
    input_path,
    skeleton_path,
    cleaned_path
):

    mask = cv2.imread(
        input_path,
        cv2.IMREAD_GRAYSCALE
    )

    if mask is None:

        raise RuntimeError(
            f"Could not read:\n{input_path}"
        )

    # Binary
    mask = (
        mask > 127
    ).astype(
        np.uint8
    ) * 255

    # Remove tiny noise
    cleaned = remove_small_components(
        mask,
        min_size=20
    )

    # Skeleton
    skeleton = skeletonize_vessel_mask(
        cleaned
    )

    cv2.imwrite(
        cleaned_path,
        cleaned
    )

    cv2.imwrite(
        skeleton_path,
        skeleton
    )


if __name__ == "__main__":

    print(
        "Skeletonization module loaded successfully."
    )