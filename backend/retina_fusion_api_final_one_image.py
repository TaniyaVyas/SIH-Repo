"""
RETINA-FUSION 360
FINAL ONE-IMAGE INTEGRATION API

Purpose:
    One upload -> full existing backend pipeline -> one JSON response.

Pipeline:
    Upload
      -> Quality / preprocessing
      -> Vessel segmentation
      -> Skeletonization
      -> Lesion segmentation
      -> Same-image retinal graph
      -> Image + graph + lesion fusion
      -> Grad-CAM
      -> Central XAI
      -> Trust / evidence
      -> JSON + HTML report

This file ORCHESTRATES the existing model modules.
It does not retrain models.
"""

import os
import sys
import json
import uuid
import base64
import traceback
from pathlib import Path
from datetime import datetime

import cv2
import numpy as np
import torch
import torch.nn as nn
from torchvision import transforms
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(r"D:\RETINA-FUSION-360")
BACKEND_ROOT = PROJECT_ROOT / "backend"

if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

RESULT_ROOT = PROJECT_ROOT / "results" / "integrated_backend_final"
UPLOAD_DIR = RESULT_ROOT / "uploads"
RUN_DIR = RESULT_ROOT / "runs"
REPORT_DIR = RESULT_ROOT / "reports"
XAI_DIR = RESULT_ROOT / "xai"
VESSEL_DIR = RESULT_ROOT / "vessels"
SKELETON_DIR = RESULT_ROOT / "skeletons"
LESION_DIR = RESULT_ROOT / "lesions"
GRAPH_DIR = RESULT_ROOT / "graphs"

for directory in [
    RESULT_ROOT,
    UPLOAD_DIR,
    RUN_DIR,
    REPORT_DIR,
    XAI_DIR,
    VESSEL_DIR,
    SKELETON_DIR,
    LESION_DIR,
    GRAPH_DIR,
]:
    directory.mkdir(parents=True, exist_ok=True)


# ============================================================
# EXISTING MODULE IMPORTS
# ============================================================

# Vessel model module: safe model definition.
from vessel_segmentation.final_model import create_model as create_vessel_model

# Existing skeletonization function.
from vessel_segmentation.final_skeletonise import (
    process_mask as process_vessel_mask
)

# Existing lesion model/pipeline components.
from lesion_segmentation.final_lesion_pipeline import (
    FinalLesionUNet,
    preprocess_image as preprocess_lesion_image,
    load_trained_model as load_lesion_model,
    extract_lesions,
    CLASS_NAMES as LESION_CLASS_NAMES,
    THRESHOLD as LESION_THRESHOLD,
    MIN_LESION_AREA,
)

# Existing fusion model definition and feature lists.
from fusion.final_retina_fusion_model import (
    RetinaFusionModel,
    STRUCTURED_FEATURES,
)

# Existing same-image graph builder.
# The module discovers the IDRiD dataset at import time, but the
# dictionaries used by build_graph() are patched per uploaded image.
import retinal_graph.final_idrid_multimodal_graph as graph_builder

# Existing central XAI coordinator.
from centeral_xai_engine import build_central_xai


# ============================================================
# MODEL PATHS
# ============================================================

VESSEL_MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "vessel_segmentation_final"
    / "best_vessel_model_final.pth"
)

LESION_MODEL_DIR = (
    PROJECT_ROOT
    / "models"
    / "lesion_segmentation_final"
)

FUSION_MODEL_DIR = (
    PROJECT_ROOT
    / "models"
    / "final_retina_fusion"
)


# ============================================================
# MODEL CACHE
# ============================================================

VESSEL_MODEL = None
LESION_MODEL = None
FUSION_MODEL = None
FUSION_SCALER = None
GRADCAM_MODEL = None


# ============================================================
# IMAGE TRANSFORM FOR FUSION
# ============================================================

FUSION_TRANSFORM = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


# ============================================================
# HELPERS
# ============================================================

def find_first_checkpoint(directory, preferred_tokens=()):
    directory = Path(directory)

    if not directory.exists():
        return None

    candidates = sorted(directory.rglob("*.pth"))

    if not candidates:
        return None

    for token in preferred_tokens:
        for path in candidates:
            if token.lower() in path.name.lower():
                return path

    return candidates[0]


def load_state_dict_safely(model, checkpoint_path):
    checkpoint = torch.load(
        str(checkpoint_path),
        map_location=DEVICE,
    )

    if isinstance(checkpoint, dict):
        if "model_state_dict" in checkpoint:
            state = checkpoint["model_state_dict"]
        elif "state_dict" in checkpoint:
            state = checkpoint["state_dict"]
        else:
            state = checkpoint
    else:
        state = checkpoint

    # Remove DataParallel prefix if present.
    cleaned = {}
    for key, value in state.items():
        new_key = key[7:] if key.startswith("module.") else key
        cleaned[new_key] = value

    missing, unexpected = model.load_state_dict(
        cleaned,
        strict=False,
    )

    return {
        "missing_keys": list(missing),
        "unexpected_keys": list(unexpected),
    }


def normalize_image_id(filename):
    stem = Path(filename).stem

    import re

    match = re.search(
        r"IDRiD[_\-](\d+)",
        stem,
        re.IGNORECASE,
    )

    if match:
        return f"{int(match.group(1)):02d}"

    digits = re.findall(r"\d+", stem)

    if digits:
        return f"{int(digits[-1]):02d}"

    return stem


def json_safe(value):
    if isinstance(value, dict):
        return {
            str(k): json_safe(v)
            for k, v in value.items()
        }

    if isinstance(value, list):
        return [json_safe(v) for v in value]

    if isinstance(value, tuple):
        return [json_safe(v) for v in value]

    if isinstance(value, np.integer):
        return int(value)

    if isinstance(value, np.floating):
        return float(value)

    if isinstance(value, np.ndarray):
        return value.tolist()

    if isinstance(value, Path):
        return str(value)

    return value


# ============================================================
# MODEL LOADING
# ============================================================

def load_all_models():
    global VESSEL_MODEL
    global LESION_MODEL
    global FUSION_MODEL
    global FUSION_SCALER
    global GRADCAM_MODEL

    # --------------------------------------------------------
    # Vessel
    # --------------------------------------------------------

    if VESSEL_MODEL is None:

        if not VESSEL_MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Vessel checkpoint not found:\n{VESSEL_MODEL_PATH}"
            )

        VESSEL_MODEL = create_vessel_model().to(DEVICE)

        load_state_dict_safely(
            VESSEL_MODEL,
            VESSEL_MODEL_PATH,
        )

        VESSEL_MODEL.eval()

    # --------------------------------------------------------
    # Lesion
    # --------------------------------------------------------

    if LESION_MODEL is None:

        lesion_checkpoint = find_first_checkpoint(
            LESION_MODEL_DIR,
            preferred_tokens=(
                "best",
                "final",
            ),
        )

        if lesion_checkpoint is None:
            raise FileNotFoundError(
                f"No lesion checkpoint found in:\n{LESION_MODEL_DIR}"
            )

        LESION_MODEL = load_lesion_model(
            str(lesion_checkpoint)
        )

        LESION_MODEL.eval()

    # --------------------------------------------------------
    # Fusion
    # --------------------------------------------------------

    if FUSION_MODEL is None:

        fusion_checkpoint = find_first_checkpoint(
            FUSION_MODEL_DIR,
            preferred_tokens=(
                "fold_1",
                "final_retina_fusion_fold_1",
            ),
        )

        if fusion_checkpoint is None:
            raise FileNotFoundError(
                f"No fusion checkpoint found in:\n{FUSION_MODEL_DIR}"
            )

        FUSION_MODEL = RetinaFusionModel(
            structured_dim=len(STRUCTURED_FEATURES)
        ).to(DEVICE)

        load_state_dict_safely(
            FUSION_MODEL,
            fusion_checkpoint,
        )

        FUSION_MODEL.eval()

        scaler_path = (
            FUSION_MODEL_DIR
            / "scaler_fold_1.json"
        )

        if scaler_path.exists():
            with open(
                scaler_path,
                "r",
                encoding="utf-8",
            ) as file:
                FUSION_SCALER = json.load(file)

    GRADCAM_MODEL = FUSION_MODEL

    return {
        "device": str(DEVICE),
        "vessel": str(VESSEL_MODEL_PATH),
        "lesion": "loaded",
        "fusion": "loaded",
    }


# ============================================================
# QUALITY ASSESSMENT
# ============================================================

def quality_assessment(image):
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY,
    )

    sharpness = float(
        cv2.Laplacian(
            gray,
            cv2.CV_64F,
        ).var()
    )

    brightness = float(
        np.mean(gray)
    )

    contrast = float(
        np.std(gray)
    )

    sharp_score = min(
        sharpness / 300.0,
        1.0,
    )

    brightness_score = 1.0 - min(
        abs(brightness - 110) / 110,
        1.0,
    )

    contrast_score = min(
        contrast / 60.0,
        1.0,
    )

    score = (
        0.45 * sharp_score
        + 0.30 * brightness_score
        + 0.25 * contrast_score
    )

    if score >= 0.65:
        status = "Good"
    elif score >= 0.45:
        status = "Acceptable"
    else:
        status = "Poor"

    return {
        "quality_score": round(float(score), 4),
        "quality_status": status,
        "sharpness": round(sharpness, 2),
        "brightness": round(brightness, 2),
        "contrast": round(contrast, 2),
        "gradable": status != "Poor",
    }


# ============================================================
# PREPROCESSING
# ============================================================

def crop_black_border(image):
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY,
    )

    mask = np.where(
        gray > 10,
        255,
        0,
    ).astype(np.uint8)

    coords = cv2.findNonZero(mask)

    if coords is None:
        return image

    x, y, w, h = cv2.boundingRect(coords)

    return image[
        y:y + h,
        x:x + w,
    ]


def preprocess_fusion_image(image):
    image = crop_black_border(image)

    image = cv2.resize(
        image,
        (224, 224),
        interpolation=cv2.INTER_AREA,
    )

    green = image[:, :, 1]

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8),
    )

    green = clahe.apply(green)

    enhanced = cv2.merge([
        green,
        green,
        green,
    ])

    return cv2.cvtColor(
        enhanced,
        cv2.COLOR_BGR2RGB,
    )


# ============================================================
# VESSEL PIPELINE
# ============================================================

def run_vessel_pipeline(image, run_dir):
    original_h, original_w = image.shape[:2]

    green = image[:, :, 1]

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8),
    )

    green = clahe.apply(green).astype(
        np.float32
    ) / 255.0

    green = np.power(
        green,
        0.9,
    )

    enhanced = np.stack(
        [green, green, green],
        axis=2,
    )

    enhanced = cv2.resize(
        enhanced,
        (256, 256),
        interpolation=cv2.INTER_AREA,
    )

    tensor = torch.from_numpy(
        enhanced.transpose(2, 0, 1)
    ).float().unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = VESSEL_MODEL(tensor)
        probability = torch.sigmoid(logits)[0, 0]
        probability = probability.cpu().numpy()

    mask = (
        probability >= 0.5
    ).astype(np.uint8) * 255

    mask = cv2.resize(
        mask,
        (original_w, original_h),
        interpolation=cv2.INTER_NEAREST,
    )

    # Morphological cleanup matching the existing final pipeline.
    kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE,
        (3, 3),
    )

    mask = cv2.morphologyEx(
        mask,
        cv2.MORPH_CLOSE,
        kernel,
    )

    mask_path = run_dir / "vessel_mask.png"

    cv2.imwrite(
        str(mask_path),
        mask,
    )

    skeleton_path = run_dir / "vessel_skeleton.png"

    process_vessel_mask(
        str(mask_path),
        str(skeleton_path),
    )

    skeleton = cv2.imread(
        str(skeleton_path),
        cv2.IMREAD_GRAYSCALE,
    )

    return {
        "mask_path": str(mask_path),
        "skeleton_path": str(skeleton_path),
        "mask": mask,
        "skeleton": skeleton,
        "skeleton_pixels": int(
            np.sum(skeleton > 0)
        ) if skeleton is not None else 0,
    }


# ============================================================
# LESION PIPELINE
# ============================================================

def run_lesion_pipeline(image, run_dir):
    rgb = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB,
    )

    processed = preprocess_lesion_image(
        rgb.copy()
    )

    tensor = torch.from_numpy(
        processed.transpose(2, 0, 1)
    ).float().unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = LESION_MODEL(tensor)
        probabilities = torch.sigmoid(
            logits
        )[0].cpu().numpy()

    # Resize probability maps to original resolution.
    original_h, original_w = image.shape[:2]

    lesion_objects = []
    mask_paths = {}

    for index, lesion_type in enumerate(
        LESION_CLASS_NAMES
    ):

        probability = probabilities[index]

        probability_full = cv2.resize(
            probability,
            (original_w, original_h),
            interpolation=cv2.INTER_LINEAR,
        )

        binary = (
            probability_full >= LESION_THRESHOLD
        ).astype(np.uint8)

        objects = extract_lesions(
            binary,
            lesion_type,
        )

        # Add image-relative coordinates.
        for obj in objects:
            obj["centroid_x_original"] = obj[
                "centroid_x"
            ]
            obj["centroid_y_original"] = obj[
                "centroid_y"
            ]

        lesion_objects.extend(objects)

        mask_path = (
            run_dir
            / f"{lesion_type}_mask.png"
        )

        cv2.imwrite(
            str(mask_path),
            binary * 255,
        )

        mask_paths[lesion_type] = str(
            mask_path
        )

    lesion_json_path = (
        run_dir / "lesions.json"
    )

    lesion_payload = {
        "image_id": run_dir.name,
        "lesions": lesion_objects,
        "counts": {
            lesion: sum(
                1
                for obj in lesion_objects
                if obj["type"] == lesion
            )
            for lesion in LESION_CLASS_NAMES
        },
        "mask_paths": mask_paths,
    }

    with open(
        lesion_json_path,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            json_safe(lesion_payload),
            file,
            indent=2,
        )

    return {
        "lesion_objects": lesion_objects,
        "mask_paths": mask_paths,
        "json_path": str(lesion_json_path),
        "counts": lesion_payload["counts"],
    }


# ============================================================
# GRAPH PIPELINE
# ============================================================

def patch_graph_builder(
    image_id,
    image_path,
    skeleton_path,
    lesion_json_path,
):
    # The existing graph builder is written as a dataset-level
    # program. We reuse its tested build_graph() function by
    # supplying the current upload as its one image.
    graph_builder.image_files = {
        image_id: str(image_path)
    }

    graph_builder.vessel_skeleton_files = {
        image_id: str(skeleton_path)
    }

    graph_builder.vessel_mask_files = {}

    graph_builder.lesion_json_files = {
        image_id: str(lesion_json_path)
    }

    # No fabricated fovea/OD. If the uploaded image corresponds
    # to a dataset with an available landmark, it can be supplied
    # by a future adapter.
    graph_builder.OD_MASK_FILES = {}
    graph_builder.LOCALIZATION_FILES = {}


def run_graph_pipeline(
    image_id,
    image_path,
    skeleton_path,
    lesion_json_path,
    run_dir,
):
    patch_graph_builder(
        image_id,
        image_path,
        skeleton_path,
        lesion_json_path,
    )

    result = graph_builder.build_graph(
        image_id
    )

    if result is None:
        raise RuntimeError(
            "Retinal graph construction failed."
        )

    graph, graph_image, skeleton = result

    graph_path = (
        run_dir / "retinal_graph.json"
    )

    visualization_path = (
        run_dir / "retinal_graph.png"
    )

    with open(
        graph_path,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            json_safe(graph),
            file,
            indent=2,
        )

    try:
        graph_builder.visualize_graph(
            graph_image,
            graph["nodes"],
            graph["edges"],
            str(visualization_path),
        )
    except Exception:
        visualization_path = None

    return {
        "graph": graph,
        "graph_path": str(graph_path),
        "visualization_path": (
            str(visualization_path)
            if visualization_path
            else None
        ),
    }


# ============================================================
# STRUCTURED FEATURE CREATION
# ============================================================

def build_structured_features(
    graph,
    lesion_result,
):
    features = {
        feature: 0.0
        for feature in STRUCTURED_FEATURES
    }

    graph_features = graph.get(
        "features",
        {},
    )

    nodes = graph.get(
        "nodes",
        [],
    )

    edges = graph.get(
        "edges",
        [],
    )

    vessel_nodes = [
        node
        for node in nodes
        if str(
            node.get("node_type", "")
        ).startswith("vessel")
    ]

    vessel_edges = [
        edge
        for edge in edges
        if "source_index" in edge
    ]

    endpoint_count = sum(
        1
        for node in vessel_nodes
        if node.get("degree_type") == "endpoint"
    )

    junction_count = sum(
        1
        for node in vessel_nodes
        if node.get("degree_type") == "junction"
    )

    vessel_node_count = len(vessel_nodes)
    vessel_edge_count = len(vessel_edges)

    total_nodes = len(nodes)
    total_edges = len(edges)

    features["graph_total_nodes"] = total_nodes
    features["graph_total_edges"] = total_edges
    features["vessel_node_count"] = vessel_node_count
    features["vessel_edge_count"] = vessel_edge_count
    features["vessel_endpoint_count"] = endpoint_count
    features["vessel_junction_count"] = junction_count

    features["junction_to_vessel_ratio"] = (
        junction_count / max(vessel_node_count, 1)
    )

    features["endpoint_to_vessel_ratio"] = (
        endpoint_count / max(vessel_node_count, 1)
    )

    features["graph_edge_node_ratio"] = (
        total_edges / max(total_nodes, 1)
    )

    features["vessel_edge_node_ratio"] = (
        vessel_edge_count / max(vessel_node_count, 1)
    )

    # --------------------------------------------------------
    # Lesion features
    # --------------------------------------------------------

    lesion_objects = lesion_result[
        "lesion_objects"
    ]

    type_map = {
        "MA": "ma",
        "EX": "ex",
        "HE": "he",
        "SE": "se",
    }

    for lesion_type, prefix in type_map.items():

        objects = [
            obj
            for obj in lesion_objects
            if obj.get("type") == lesion_type
        ]

        features[f"{prefix}_count"] = len(
            objects
        )

        # The trained multimodal feature set stores one area
        # statistic per lesion type. Use mean area for an
        # individual inference, matching the feature's scale.
        areas = [
            float(obj.get("area_pixels", 0))
            for obj in objects
        ]

        features[f"{prefix}_area"] = (
            float(np.mean(areas))
            if areas
            else 0.0
        )

    image_h = graph_features.get(
        "image_height",
        1,
    )

    image_w = graph_features.get(
        "image_width",
        1,
    )

    image_area = max(
        float(image_h) * float(image_w),
        1.0,
    )

    total_lesions = len(
        lesion_objects
    )

    features["lesion_density"] = (
        total_lesions
        / image_area
        * 1_000_000
    )

    lesion_vessel_edges = sum(
        1
        for edge in edges
        if edge.get("edge_type")
        == "lesion_vessel_proximity"
    )

    lesion_lesion_edges = sum(
        1
        for edge in edges
        if edge.get("edge_type")
        == "lesion_spatial"
    )

    features[
        "lesion_vessel_edge_count"
    ] = lesion_vessel_edges

    features[
        "lesion_lesion_edge_count"
    ] = lesion_lesion_edges

    features[
        "lesion_vessel_association"
    ] = (
        lesion_vessel_edges
        / max(total_lesions, 1)
    )

    features[
        "lesion_clustering"
    ] = (
        lesion_lesion_edges
        / max(total_lesions, 1)
    )

    return features


# ============================================================
# STRUCTURED SCALING
# ============================================================

def scale_structured_features(features):
    vector = np.array(
        [
            float(features.get(
                feature,
                0.0,
            ))
            for feature in STRUCTURED_FEATURES
        ],
        dtype=np.float32,
    )

    if not FUSION_SCALER:
        return vector

    scaler_features = FUSION_SCALER.get(
        "features"
    )

    if scaler_features:
        # Ensure the saved scaler ordering matches
        # the actual model's feature ordering.
        if list(scaler_features) != list(
            STRUCTURED_FEATURES
        ):
            mapping = {
                name: index
                for index, name in enumerate(
                    scaler_features
                )
            }

            vector = np.array(
                [
                    float(
                        features.get(
                            name,
                            0.0,
                        )
                    )
                    for name in scaler_features
                ],
                dtype=np.float32,
            )

    mean = np.asarray(
        FUSION_SCALER.get(
            "mean",
            np.zeros(len(vector)),
        ),
        dtype=np.float32,
    )

    scale = np.asarray(
        FUSION_SCALER.get(
            "scale",
            np.ones(len(vector)),
        ),
        dtype=np.float32,
    )

    scale[scale == 0] = 1.0

    return (
        (vector - mean)
        / scale
    ).astype(np.float32)


# ============================================================
# GRAD-CAM
# ============================================================

class FusionGradCAM:

    def __init__(
        self,
        model,
        target_layer,
    ):
        self.model = model
        self.target_layer = target_layer
        self.activations = None
        self.gradients = None

        self.forward_hook = (
            target_layer.register_forward_hook(
                self._save_activation
            )
        )

        self.backward_hook = (
            target_layer.register_full_backward_hook(
                self._save_gradient
            )
        )

    def _save_activation(
        self,
        module,
        inputs,
        output,
    ):
        self.activations = output

    def _save_gradient(
        self,
        module,
        grad_input,
        grad_output,
    ):
        self.gradients = grad_output[0]

    def generate(
        self,
        image,
        structured,
        class_index,
    ):
        self.model.zero_grad()

        logits = self.model(
            image,
            structured,
        )

        score = logits[
            0,
            class_index,
        ]

        score.backward()

        gradients = self.gradients
        activations = self.activations

        weights = gradients.mean(
            dim=(2, 3),
            keepdim=True,
        )

        cam = (
            weights * activations
        ).sum(dim=1)

        cam = torch.relu(cam)

        cam = cam[
            0
        ].detach().cpu().numpy()

        cam -= cam.min()

        if cam.max() > 0:
            cam /= cam.max()

        return cam

    def close(self):
        self.forward_hook.remove()
        self.backward_hook.remove()


def save_gradcam(
    original,
    cam,
    output_path,
):
    cam = cv2.resize(
        cam,
        (
            original.shape[1],
            original.shape[0],
        ),
    )

    heatmap = np.uint8(
        255 * cam
    )

    heatmap = cv2.applyColorMap(
        heatmap,
        cv2.COLORMAP_JET,
    )

    overlay = cv2.addWeighted(
        original,
        0.55,
        heatmap,
        0.45,
        0,
    )

    cv2.imwrite(
        str(output_path),
        overlay,
    )


# ============================================================
# FUSION INFERENCE
# ============================================================

def run_fusion(
    processed_rgb,
    structured_features,
):
    image_tensor = (
        FUSION_TRANSFORM(
            processed_rgb
        )
        .unsqueeze(0)
        .to(DEVICE)
    )

    scaled = scale_structured_features(
        structured_features
    )

    structured_tensor = torch.tensor(
        scaled,
        dtype=torch.float32,
    ).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = FUSION_MODEL(
            image_tensor,
            structured_tensor,
        )

        probabilities = torch.softmax(
            logits,
            dim=1,
        )[0]

    prediction_index = int(
        torch.argmax(
            probabilities
        ).item()
    )

    referable_probability = float(
        probabilities[1].item()
    )

    prediction = (
        "Referable DR"
        if prediction_index == 1
        else "Non-Referable DR"
    )

    return {
        "prediction": prediction,
        "prediction_class": prediction_index,
        "probability": float(
            probabilities[
                prediction_index
            ].item()
        ),
        "referable_probability": referable_probability,
        "probabilities": {
            "non_referable": float(
                probabilities[0].item()
            ),
            "referable": float(
                probabilities[1].item()
            ),
        },
        "image_tensor": image_tensor,
        "structured_tensor": structured_tensor,
    }


# ============================================================
# HUMAN-READABLE EVIDENCE
# ============================================================

def basic_evidence(
    prediction,
    quality,
    structured,
    lesion_result,
):
    evidence = []

    counts = lesion_result["counts"]

    for key, label in [
        ("MA", "Microaneurysm"),
        ("EX", "Exudate"),
        ("HE", "Hemorrhage"),
        ("SE", "Soft-exudate"),
    ]:
        if counts.get(key, 0) > 0:
            evidence.append(
                f"{label} evidence detected "
                f"({counts[key]} objects)."
            )

    if structured.get(
        "vessel_junction_count",
        0,
    ) > 0:
        evidence.append(
            "Retinal vessel junction topology "
            "was included in the fusion model."
        )

    if structured.get(
        "vessel_endpoint_count",
        0,
    ) > 0:
        evidence.append(
            "Retinal vessel topology was available "
            "for graph-based analysis."
        )

    if quality["quality_status"] == "Poor":
        evidence.append(
            "Image quality is poor; interpretation "
            "should be reviewed or the image recaptured."
        )

    evidence.append(
        f"Model output: {prediction}."
    )

    return evidence


# ============================================================
# HTML REPORT
# ============================================================

def image_to_base64(path):
    if not path or not os.path.exists(path):
        return ""

    with open(path, "rb") as file:
        return base64.b64encode(
            file.read()
        ).decode()


def generate_html_report(report):
    report_id = report["report_id"]

    html_path = (
        REPORT_DIR
        / f"{report_id}.html"
    )

    original_b64 = image_to_base64(
        report["artifacts"]["original"]
    )

    gradcam_b64 = image_to_base64(
        report["artifacts"].get("gradcam")
    )

    graph_b64 = image_to_base64(
        report["artifacts"].get("graph_visualization")
    )

    prediction = report["prediction"]
    confidence = report["confidence"]
    quality = report["quality"]

    evidence_items = "".join(
        f"<li>{item}</li>"
        for item in report["evidence"]
    )

    html = f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>RETINA-FUSION 360 Report</title>
<style>
body {{
    font-family: Arial, sans-serif;
    background: #f4f7fb;
    margin: 0;
    padding: 30px;
}}
.container {{
    max-width: 1200px;
    margin: auto;
}}
.card {{
    background: white;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 14px;
    box-shadow: 0 4px 18px rgba(0,0,0,.08);
}}
.grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}}
img {{
    width: 100%;
    border-radius: 10px;
}}
.badge {{
    display: inline-block;
    padding: 10px 16px;
    border-radius: 20px;
    background: #e5e7eb;
    font-weight: bold;
}}
.warning {{
    padding: 15px;
    background: #fff7ed;
    border-radius: 10px;
}}
</style>
</head>
<body>
<div class="container">

<div class="card">
<h1>RETINA-FUSION 360</h1>
<p>Explainable Diabetic Retinopathy Screening Report</p>
<p><b>Report:</b> {report_id}</p>
<p><b>Generated:</b> {report["timestamp"]}</p>
</div>

<div class="grid">

<div class="card">
<h2>Prediction</h2>
<div class="badge">{prediction}</div>
<p>Confidence: <b>{confidence * 100:.2f}%</b></p>
</div>

<div class="card">
<h2>Image Quality</h2>
<p>Status: <b>{quality["quality_status"]}</b></p>
<p>Score: {quality["quality_score"]:.3f}</p>
<p>Sharpness: {quality["sharpness"]:.2f}</p>
<p>Brightness: {quality["brightness"]:.2f}</p>
<p>Contrast: {quality["contrast"]:.2f}</p>
</div>

</div>

<div class="grid">

<div class="card">
<h2>Original Image</h2>
<img src="data:image/jpeg;base64,{original_b64}">
</div>

<div class="card">
<h2>Grad-CAM</h2>
<img src="data:image/jpeg;base64,{gradcam_b64}">
</div>

</div>

<div class="card">
<h2>Retinal Graph</h2>
{"<img src='data:image/png;base64," + graph_b64 + "'>" if graph_b64 else "<p>Graph visualization unavailable.</p>"}
</div>

<div class="card">
<h2>Evidence</h2>
<ul>
{evidence_items}
</ul>
</div>

<div class="card">
<h2>XAI Explanation</h2>
<p>{report["xai"].get("explanation", {}).get("summary", "See API XAI payload.")}</p>
</div>

<div class="warning">
<b>Important:</b> This is an AI-assisted research screening
system. Grad-CAM indicates image regions that influenced
the model and is not proof of disease. Clinical review
remains necessary.
</div>

</div>
</body>
</html>
"""

    html_path.write_text(
        html,
        encoding="utf-8",
    )

    return str(html_path)


# ============================================================
# COMPLETE ONE-IMAGE PIPELINE
# ============================================================

def analyze_image(image_path):
    load_all_models()

    report_id = (
        "RF360_"
        + datetime.now().strftime(
            "%Y%m%d_%H%M%S"
        )
        + "_"
        + uuid.uuid4().hex[:6]
    )

    run_dir = RUN_DIR / report_id
    run_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    image_path = Path(image_path)

    image = cv2.imread(
        str(image_path),
        cv2.IMREAD_COLOR,
    )

    if image is None:
        raise ValueError(
            "Unable to read uploaded fundus image."
        )

    original_path = run_dir / "original.jpg"

    cv2.imwrite(
        str(original_path),
        image,
    )

    # --------------------------------------------------------
    # 1. Quality
    # --------------------------------------------------------

    quality = quality_assessment(
        image
    )

    # --------------------------------------------------------
    # 2. Preprocessing
    # --------------------------------------------------------

    processed_rgb = preprocess_fusion_image(
        image
    )

    # --------------------------------------------------------
    # 3. Vessel
    # --------------------------------------------------------

    vessel = run_vessel_pipeline(
        image,
        run_dir,
    )

    # --------------------------------------------------------
    # 4. Lesions
    # --------------------------------------------------------

    lesion = run_lesion_pipeline(
        image,
        run_dir,
    )

    # --------------------------------------------------------
    # 5. Retinal graph
    # --------------------------------------------------------

    image_id = (
        "UPLOAD_"
        + uuid.uuid4().hex[:10]
    )

    graph_result = run_graph_pipeline(
        image_id,
        image_path,
        vessel["skeleton_path"],
        lesion["json_path"],
        run_dir,
    )

    graph = graph_result["graph"]

    # --------------------------------------------------------
    # 6. Structured features
    # --------------------------------------------------------

    structured = build_structured_features(
        graph,
        lesion,
    )

    # --------------------------------------------------------
    # 7. Fusion prediction
    # --------------------------------------------------------

    fusion = run_fusion(
        processed_rgb,
        structured,
    )

    # --------------------------------------------------------
    # 8. Grad-CAM
    # --------------------------------------------------------

    gradcam_path = (
        run_dir / "gradcam.jpg"
    )

    target_layer = (
        FUSION_MODEL
        .image_encoder
        .backbone
        .layer4[-1]
    )

    gradcam = FusionGradCAM(
        FUSION_MODEL,
        target_layer,
    )

    try:
        cam = gradcam.generate(
            fusion["image_tensor"],
            fusion["structured_tensor"],
            fusion["prediction_class"],
        )
    finally:
        gradcam.close()

    save_gradcam(
        image,
        cam,
        gradcam_path,
    )

    # --------------------------------------------------------
    # 9. Evidence
    # --------------------------------------------------------

    evidence = basic_evidence(
        fusion["prediction"],
        quality,
        structured,
        lesion,
    )

    # --------------------------------------------------------
    # 10. Report object for Central XAI
    # --------------------------------------------------------

    report = {
        "report_id": report_id,
        "timestamp": datetime.now().isoformat(),
        "image_id": image_id,

        "prediction": fusion["prediction"],
        "prediction_class": fusion["prediction_class"],
        "probability": fusion["probability"],
        "confidence": fusion["probability"],
        "referable_probability": fusion[
            "referable_probability"
        ],

        "probabilities": fusion[
            "probabilities"
        ],

        "quality": quality,

        "evidence": evidence,

        "structured_features": structured,

        "vessel_analysis": {
            "status": "COMPLETED",
            "mask_path": vessel["mask_path"],
            "skeleton_path": vessel["skeleton_path"],
            "skeleton_pixels": vessel[
                "skeleton_pixels"
            ],
        },

        "lesion_analysis": {
            "status": "COMPLETED",
            "counts": lesion["counts"],
            "lesions": lesion[
                "lesion_objects"
            ],
            "mask_paths": lesion[
                "mask_paths"
            ],
            "json_path": lesion[
                "json_path"
            ],
        },

        "graph_analysis": {
            "status": "COMPLETED",
            "features": graph.get(
                "features",
                {},
            ),
            "nodes": len(
                graph.get("nodes", [])
            ),
            "edges": len(
                graph.get("edges", [])
            ),
            "graph_path": graph_result[
                "graph_path"
            ],
            "visualization": graph_result[
                "visualization_path"
            ],
        },

        "artifacts": {
            "original": str(original_path),
            "vessel_mask": vessel[
                "mask_path"
            ],
            "vessel_skeleton": vessel[
                "skeleton_path"
            ],
            "gradcam": str(
                gradcam_path
            ),
            "graph": graph_result[
                "graph_path"
            ],
            "graph_visualization": graph_result[
                "visualization_path"
            ],
            "lesion_json": lesion[
                "json_path"
            ],
            "lesion_masks": lesion[
                "mask_paths"
            ],
        },

        "xai": {
            "gradcam": str(
                gradcam_path
            )
        },
    }

    # --------------------------------------------------------
    # 11. Central XAI
    # --------------------------------------------------------

    try:

        xai = build_central_xai(
            report=report,
            run_dir=run_dir,
        )

        report["xai"] = xai

    except Exception as error:

        report["xai"] = {
            "status": "XAI_ERROR",
            "error": str(error),
        }

    # --------------------------------------------------------
    # 12. Workflow decisions
    # --------------------------------------------------------

    xai_trust = report["xai"].get(
        "trust",
        {}
    )

    trust_verdict = str(
        xai_trust.get(
            "verdict",
            "HUMAN_REVIEW",
        )
    )

    human_review_required = (
        trust_verdict != "AUTONOMOUS_SCREEN"
        or quality["quality_status"] == "Poor"
    )

    referral_required = (
        fusion["prediction"] == "Referable DR"
    )

    report["workflow"] = {
        "quality": (
            "PASS"
            if quality["quality_status"] != "Poor"
            else "RECAPTURE_RECOMMENDED"
        ),
        "screening": "COMPLETED",
        "human_review": (
            "REQUIRED"
            if human_review_required
            else "NOT_REQUIRED"
        ),
        "referral": (
            "REQUIRED"
            if referral_required
            else "NOT_REQUIRED"
        ),
    }

    # --------------------------------------------------------
    # 13. Save JSON
    # --------------------------------------------------------

    json_path = (
        REPORT_DIR
        / f"{report_id}.json"
    )

    with open(
        json_path,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            json_safe(report),
            file,
            indent=2,
        )

    # --------------------------------------------------------
    # 14. HTML
    # --------------------------------------------------------

    html_path = generate_html_report(
        report
    )

    report["report_paths"] = {
        "json": str(json_path),
        "html": str(html_path),
    }

    # Save once more with report paths.
    with open(
        json_path,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            json_safe(report),
            file,
            indent=2,
        )

    # --------------------------------------------------------
    # 15. Frontend response
    # --------------------------------------------------------

    return json_safe({
        "success": True,
        "status": "SCREENED",

        "report_id": report_id,

        "prediction": fusion[
            "prediction"
        ],

        "confidence": fusion[
            "probability"
        ],

        "probabilities": fusion[
            "probabilities"
        ],

        "quality": quality,

        "vessels": report[
            "vessel_analysis"
        ],

        "lesions": report[
            "lesion_analysis"
        ],

        "retinal_graph": report[
            "graph_analysis"
        ],

        "xai": report[
            "xai"
        ],

        "workflow": report[
            "workflow"
        ],

        "artifacts": report[
            "artifacts"
        ],

        "reports": {
            "json": str(json_path),
            "html": str(html_path),
        },
    })


# ============================================================
# FLASK API
# ============================================================

app = Flask(
    __name__
)

CORS(app)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "system": "RETINA-FUSION 360",
        "status": "online",
        "service": (
            "One-Image Explainable "
            "Diabetic Retinopathy Screening API"
        ),
        "device": str(DEVICE),
        "endpoint": "/api/analyze",
    })


@app.route(
    "/api/health",
    methods=["GET"],
)
def health():
    try:
        load_all_models()

        return jsonify({
            "status": "healthy",
            "model_loaded": True,
            "device": str(DEVICE),
            "pipeline": {
                "quality": True,
                "vessel": True,
                "skeleton": True,
                "lesion": True,
                "retinal_graph": True,
                "fusion": True,
                "gradcam": True,
                "central_xai": True,
            },
        })

    except Exception as error:

        return jsonify({
            "status": "degraded",
            "model_loaded": False,
            "device": str(DEVICE),
            "error": str(error),
        }), 500


@app.route(
    "/api/analyze",
    methods=["POST"],
)
def analyze():

    try:

        if "image" not in request.files:

            return jsonify({
                "success": False,
                "error": (
                    "No image uploaded. "
                    "Use form field 'image'."
                ),
            }), 400

        file = request.files["image"]

        if not file.filename:

            return jsonify({
                "success": False,
                "error": "Empty filename.",
            }), 400

        allowed = {
            ".jpg",
            ".jpeg",
            ".png",
            ".tif",
            ".tiff",
        }

        extension = Path(
            file.filename
        ).suffix.lower()

        if extension not in allowed:

            return jsonify({
                "success": False,
                "error": (
                    "Unsupported image format. "
                    "Use JPG, JPEG, PNG, TIF or TIFF."
                ),
            }), 400

        filename = (
            uuid.uuid4().hex
            + extension
        )

        image_path = (
            UPLOAD_DIR / filename
        )

        file.save(
            str(image_path)
        )

        result = analyze_image(
            image_path
        )

        return jsonify(result)

    except Exception as error:

        traceback.print_exc()

        return jsonify({
            "success": False,
            "status": "FAILED",
            "error": str(error),
        }), 500


@app.route(
    "/reports/<path:filename>",
    methods=["GET"],
)
def serve_report(filename):
    return send_from_directory(
        str(REPORT_DIR),
        filename,
    )


@app.route(
    "/artifacts/<path:filename>",
    methods=["GET"],
)
def serve_artifact(filename):
    return send_from_directory(
        str(RESULT_ROOT),
        filename,
    )


# ============================================================
# START
# ============================================================

if __name__ == "__main__":

    print()
    print("=" * 75)
    print("RETINA-FUSION 360")
    print("FINAL ONE-IMAGE INTEGRATED BACKEND")
    print("=" * 75)
    print()
    print(f"Device: {DEVICE}")
    print()
    print("Pipeline:")
    print("  Upload")
    print("    -> Quality")
    print("    -> Vessel segmentation")
    print("    -> Skeletonization")
    print("    -> Lesion segmentation")
    print("    -> Retinal graph")
    print("    -> Image + graph + lesion fusion")
    print("    -> Grad-CAM")
    print("    -> Central XAI")
    print("    -> Trust / review / referral")
    print("    -> Final report")
    print()
    print("API: http://127.0.0.1:5000")
    print()

    load_all_models()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False,
    )
