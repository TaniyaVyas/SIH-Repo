from pathlib import Path

import pandas as pd
from PIL import Image

import torch
from torch.utils.data import Dataset
from torchvision import transforms


class APTOSDataset(Dataset):
    """
    APTOS diabetic retinopathy dataset.

    Expected manifest columns:
        source_dataset
        split
        source_path
        dr_grade
    """

    def __init__(
        self,
        manifest_path,
        dataframe=None,
        transform=None,
    ):
        self.manifest_path = Path(manifest_path)

        if dataframe is None:
            df = pd.read_csv(self.manifest_path)
        else:
            df = dataframe.copy()

        # Only use labeled APTOS training images
        df = df[
            (df["source_dataset"].astype(str).str.upper() == "APTOS")
            & (df["split"].astype(str).str.lower() == "train")
            & (df["dr_grade"].notna())
        ].copy()

        df["dr_grade"] = df["dr_grade"].astype(int)

        # Keep only valid DR grades 0-4
        df = df[df["dr_grade"].between(0, 4)].reset_index(drop=True)

        self.df = df
        self.transform = transform

        if len(self.df) == 0:
            raise RuntimeError(
                "No labeled APTOS training images were found."
            )

    def __len__(self):
        return len(self.df)

    def __getitem__(self, index):
        row = self.df.iloc[index]

        image_path = Path(row["source_path"])
        label = int(row["dr_grade"])

        if not image_path.exists():
            raise FileNotFoundError(
                f"Image not found: {image_path}"
            )

        image = Image.open(image_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        return image, torch.tensor(label, dtype=torch.long)