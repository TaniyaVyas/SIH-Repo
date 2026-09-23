from PIL import Image, ImageOps, ImageEnhance
import numpy as np
import cv2

import torch
from torchvision import transforms


IMAGE_SIZE = 320


def crop_black_border(image):
    """
    Crop black borders around retinal fundus images.

    OpenCV findNonZero requires an uint8 mask, not a boolean mask.
    """

    # Convert PIL image to NumPy array
    img = np.array(image)

    # Convert RGB/RGBA image to grayscale
    if img.ndim == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    else:
        gray = img

    # Create uint8 mask for non-black retinal area
    mask = np.where(gray > 10, 255, 0).astype(np.uint8)

    # Find non-zero pixels
    coords = cv2.findNonZero(mask)

    # If no valid pixels are found, return original image
    if coords is None:
        return image

    # Get bounding rectangle
    x, y, w, h = cv2.boundingRect(coords)

    # Safety check
    if w <= 0 or h <= 0:
        return image

    # Crop image
    cropped = img[y:y + h, x:x + w]

    # Convert back to PIL
    return Image.fromarray(cropped)

def enhance_retina(image):
    """
    Retinal image enhancement:
    - black border removal
    - LAB illumination normalization
    - CLAHE
    """

    image = crop_black_border(image)

    img = np.array(image)

    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)

    l_channel, a_channel, b_channel = cv2.split(lab)

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )

    l_channel = clahe.apply(l_channel)

    lab = cv2.merge(
        [l_channel, a_channel, b_channel]
    )

    enhanced = cv2.cvtColor(
        lab,
        cv2.COLOR_LAB2RGB
    )

    return Image.fromarray(enhanced)


class RetinaEnhancement:
    def __call__(self, image):
        return enhance_retina(image)


def get_train_transforms():

    return transforms.Compose([

        RetinaEnhancement(),

        transforms.Resize(
            (IMAGE_SIZE, IMAGE_SIZE)
        ),

        transforms.RandomHorizontalFlip(
            p=0.5
        ),

        transforms.RandomVerticalFlip(
            p=0.15
        ),

        transforms.RandomRotation(
            degrees=12
        ),

        transforms.RandomAffine(
            degrees=0,
            translate=(0.05, 0.05),
            scale=(0.90, 1.10)
        ),

        transforms.ColorJitter(
            brightness=0.15,
            contrast=0.15,
            saturation=0.10,
            hue=0.02
        ),

        transforms.ToTensor(),

        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
    ])


def get_validation_transforms():

    return transforms.Compose([

        RetinaEnhancement(),

        transforms.Resize(
            (IMAGE_SIZE, IMAGE_SIZE)
        ),

        transforms.ToTensor(),

        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
    ])