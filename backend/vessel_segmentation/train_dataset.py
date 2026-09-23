import os
import sys

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


DRIVE_ROOT = r"D:\RETINA-FUSION-360\datasets\Drive"


dataset = DRIVEDataset(
    DRIVE_ROOT,
    split="training",
    image_size=512
)


print()
print("=" * 60)
print("DRIVE DATASET TEST")
print("=" * 60)

print(
    "Dataset length:",
    len(dataset)
)


image, mask = dataset[0]


print(
    "Image shape:",
    image.shape
)

print(
    "Mask shape:",
    mask.shape
)

print(
    "Image range:",
    image.min().item(),
    image.max().item()
)

print(
    "Mask values:",
    mask.unique()
)

print()
print("✓ DATASET TEST PASSED")