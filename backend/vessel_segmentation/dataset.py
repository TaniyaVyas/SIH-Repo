import os
import glob
import cv2
import numpy as np
import torch

from torch.utils.data import Dataset


class DRIVEDataset(Dataset):

    def __init__(
        self,
        root_dir,
        split="training",
        image_size=512
    ):

        self.root_dir = root_dir
        self.split = split
        self.image_size = image_size

        # --------------------------------------------------
        # Resolve DRIVE folder structure
        # --------------------------------------------------

        # Your current structure is:
        #
        # Drive/
        #   training/
        #       training/
        #           images/
        #           1st_manual/
        #           mask/
        #
        # Therefore we first check nested structure.

        nested_split_dir = os.path.join(
            root_dir,
            split,
            split
        )

        normal_split_dir = os.path.join(
            root_dir,
            split
        )

        if os.path.isdir(nested_split_dir):
            self.split_dir = nested_split_dir

        elif os.path.isdir(normal_split_dir):
            self.split_dir = normal_split_dir

        else:
            raise RuntimeError(
                f"Could not find DRIVE split folder.\n"
                f"Checked:\n"
                f"{nested_split_dir}\n"
                f"{normal_split_dir}"
            )

        # --------------------------------------------------
        # Directories
        # --------------------------------------------------

        self.image_dir = os.path.join(
            self.split_dir,
            "images"
        )

        self.mask_dir = os.path.join(
            self.split_dir,
            "1st_manual"
        )

        self.fov_dir = os.path.join(
            self.split_dir,
            "mask"
        )

        # --------------------------------------------------
        # Find images
        # --------------------------------------------------

        self.image_paths = sorted(
            glob.glob(
                os.path.join(
                    self.image_dir,
                    "*.tif"
                )
            )
        )

        if len(self.image_paths) == 0:

            raise RuntimeError(
                f"No DRIVE images found in:\n"
                f"{self.image_dir}"
            )

        print()
        print(
            f"DRIVE {split} images found: "
            f"{len(self.image_paths)}"
        )

        print(
            f"Using directory:\n"
            f"{self.split_dir}"
        )

    # ------------------------------------------------------
    # Length
    # ------------------------------------------------------

    def __len__(self):

        return len(self.image_paths)

    # ------------------------------------------------------
    # Get item
    # ------------------------------------------------------

    def __getitem__(self, idx):

        image_path = self.image_paths[idx]

        # --------------------------------------------------
        # Load image
        # --------------------------------------------------

        image = cv2.imread(
            image_path,
            cv2.IMREAD_COLOR
        )

        if image is None:

            raise RuntimeError(
                f"Could not read image:\n"
                f"{image_path}"
            )

        # BGR → RGB
        image = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2RGB
        )

        # --------------------------------------------------
        # Determine image number
        # --------------------------------------------------

        filename = os.path.basename(
            image_path
        )

        # Example:
        #
        # 21_training.tif
        #
        # image_number = 21

        image_number = filename.split(
            "_"
        )[0]

        # --------------------------------------------------
        # Vessel annotation
        # --------------------------------------------------

        manual_mask_path = os.path.join(
            self.mask_dir,
            f"{image_number}_manual1.gif"
        )

        if not os.path.exists(
            manual_mask_path
        ):

            raise RuntimeError(
                f"Vessel annotation not found.\n"
                f"Image: {image_path}\n"
                f"Expected: {manual_mask_path}"
            )

        vessel_mask = cv2.imread(
            manual_mask_path,
            cv2.IMREAD_GRAYSCALE
        )

        if vessel_mask is None:

            raise RuntimeError(
                f"Could not read vessel mask:\n"
                f"{manual_mask_path}"
            )

        # --------------------------------------------------
        # FOV mask
        # --------------------------------------------------

        fov_mask_path = os.path.join(
            self.fov_dir,
            f"{image_number}_training_mask.gif"
        )

        fov_mask = None

        if os.path.exists(
            fov_mask_path
        ):

            fov_mask = cv2.imread(
                fov_mask_path,
                cv2.IMREAD_GRAYSCALE
            )

        # --------------------------------------------------
        # Resize image
        # --------------------------------------------------

        image = cv2.resize(
            image,
            (
                self.image_size,
                self.image_size
            ),
            interpolation=cv2.INTER_AREA
        )

        # --------------------------------------------------
        # Resize vessel mask
        # --------------------------------------------------

        vessel_mask = cv2.resize(
            vessel_mask,
            (
                self.image_size,
                self.image_size
            ),
            interpolation=cv2.INTER_NEAREST
        )

        # --------------------------------------------------
        # Resize FOV mask
        # --------------------------------------------------

        if fov_mask is not None:

            fov_mask = cv2.resize(
                fov_mask,
                (
                    self.image_size,
                    self.image_size
                ),
                interpolation=cv2.INTER_NEAREST
            )

        # --------------------------------------------------
        # Normalize image
        # --------------------------------------------------

        image = (
            image.astype(
                np.float32
            ) / 255.0
        )

        # --------------------------------------------------
        # Binary vessel mask
        # --------------------------------------------------

        vessel_mask = (
            vessel_mask > 127
        ).astype(
            np.float32
        )

        # --------------------------------------------------
        # Apply FOV mask
        # --------------------------------------------------

        if fov_mask is not None:

            fov_binary = (
                fov_mask > 127
            ).astype(
                np.float32
            )

            vessel_mask = (
                vessel_mask * fov_binary
            )

        # --------------------------------------------------
        # HWC → CHW
        # --------------------------------------------------

        image = np.transpose(
            image,
            (2, 0, 1)
        )

        vessel_mask = np.expand_dims(
            vessel_mask,
            axis=0
        )

        # --------------------------------------------------
        # Convert to tensors
        # --------------------------------------------------

        image = torch.tensor(
            image,
            dtype=torch.float32
        )

        vessel_mask = torch.tensor(
            vessel_mask,
            dtype=torch.float32
        )

        return image, vessel_mask