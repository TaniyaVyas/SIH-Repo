import os
import json
import uuid
import base64
import warnings
import sys
from datetime import datetime

import cv2
import numpy as np
import pandas as pd
from PIL import Image

import torch
import torch.nn as nn
import torchvision.models as models
from torchvision import transforms

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

warnings.filterwarnings("ignore")


# ============================================================
# CENTRAL XAI ENGINE
# ============================================================

BACKEND_ROOT = r"D:\RETINA-FUSION-360\backend"

if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

try:
    from centeral_xai_engine import build_central_xai
    CENTRAL_XAI_AVAILABLE = True
    print("Central XAI engine: AVAILABLE")
except Exception as exc:
    build_central_xai = None
    CENTRAL_XAI_AVAILABLE = False
    print(f"WARNING: Central XAI engine unavailable: {exc}")


# ============================================================
# CONFIGURATION
# ============================================================

PROJECT_ROOT = r"D:\RETINA-FUSION-360"

DATASET_ROOT = os.path.join(
    PROJECT_ROOT,
    "datasets"
)

IDRID_ROOT = os.path.join(
    DATASET_ROOT,
    "IDrid"
)

RESULT_ROOT = os.path.join(
    PROJECT_ROOT,
    "results",
    "integrated_backend"
)

UPLOAD_DIR = os.path.join(
    RESULT_ROOT,
    "uploads"
)

REPORT_DIR = os.path.join(
    RESULT_ROOT,
    "reports"
)

XAI_DIR = os.path.join(
    RESULT_ROOT,
    "xai"
)

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(REPORT_DIR, exist_ok=True)
os.makedirs(XAI_DIR, exist_ok=True)


# ============================================================
# MODEL
# ============================================================

MODEL_PATH = os.path.join(
    PROJECT_ROOT,
    "models",
    "final_retina_fusion"
)

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ============================================================
# STRUCTURED FEATURES
# ============================================================

STRUCTURED_FEATURES = [

    # -------------------------
    # RETINAL TOPOLOGY
    # -------------------------

    "graph_total_nodes",
    "graph_total_edges",
    "vessel_node_count",
    "vessel_edge_count",

    "vessel_endpoint_count",
    "vessel_junction_count",

    "junction_to_vessel_ratio",
    "endpoint_to_vessel_ratio",

    "graph_edge_node_ratio",
    "vessel_edge_node_ratio",

    # -------------------------
    # LESION EVIDENCE
    # -------------------------

    "ma_count",
    "ex_count",
    "he_count",
    "se_count",

    "ma_area",
    "ex_area",
    "he_area",
    "se_area",

    "lesion_density",

    "lesion_vessel_edge_count",
    "lesion_lesion_edge_count",

    "lesion_vessel_association",
    "lesion_clustering"
]


# ============================================================
# MODEL ARCHITECTURE
# ============================================================

class ImageEncoder(nn.Module):

    def __init__(self):

        super().__init__()

        backbone = models.resnet18(
            weights=None
        )

        backbone.fc = nn.Identity()

        self.backbone = backbone

        self.projection = nn.Sequential(

            nn.Linear(512, 256),

            nn.ReLU(),

            nn.Dropout(0.2)
        )

    def forward(self, x):

        features = self.backbone(x)

        return self.projection(features)


class StructuredEncoder(nn.Module):

    def __init__(self, input_dim):

        super().__init__()

        self.net = nn.Sequential(

            nn.Linear(input_dim, 128),

            nn.LayerNorm(128),

            nn.ReLU(),

            nn.Dropout(0.2),

            nn.Linear(128, 64),

            nn.ReLU()
        )

    def forward(self, x):

        return self.net(x)


class RetinaFusionModel(nn.Module):

    def __init__(self, structured_dim):

        super().__init__()

        self.image_encoder = ImageEncoder()

        self.structured_encoder = StructuredEncoder(
            structured_dim
        )

        self.fusion = nn.Sequential(

            nn.Linear(256 + 64, 128),

            nn.LayerNorm(128),

            nn.ReLU(),

            nn.Dropout(0.25),

            nn.Linear(128, 64),

            nn.ReLU()
        )

        self.classifier = nn.Linear(
            64,
            2
        )

    def forward(
        self,
        image,
        structured
    ):

        image_features = self.image_encoder(
            image
        )

        structured_features = self.structured_encoder(
            structured
        )

        fused = torch.cat(
            [
                image_features,
                structured_features
            ],
            dim=1
        )

        fused = self.fusion(
            fused
        )

        return self.classifier(
            fused
        )


# ============================================================
# IMAGE PREPROCESSING
# ============================================================

def crop_black_border(image):

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    mask = np.where(
        gray > 10,
        255,
        0
    ).astype(np.uint8)

    coords = cv2.findNonZero(mask)

    if coords is None:

        return image

    x, y, w, h = cv2.boundingRect(
        coords
    )

    return image[
        y:y+h,
        x:x+w
    ]


def preprocess_image(
    image_path
):

    image = cv2.imread(
        image_path
    )

    if image is None:

        raise ValueError(
            "Unable to read image."
        )

    original = image.copy()

    image = crop_black_border(
        image
    )

    image = cv2.resize(
        image,
        (224, 224)
    )

    # Green channel enhancement
    green = image[:, :, 1]

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8)
    )

    green = clahe.apply(
        green
    )

    enhanced = cv2.merge(
        [
            green,
            green,
            green
        ]
    )

    rgb = cv2.cvtColor(
        enhanced,
        cv2.COLOR_BGR2RGB
    )

    return original, rgb


# ============================================================
# QUALITY ASSESSMENT
# ============================================================

def quality_assessment(
    image
):

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    sharpness = float(
        cv2.Laplacian(
            gray,
            cv2.CV_64F
        ).var()
    )

    brightness = float(
        np.mean(gray)
    )

    contrast = float(
        np.std(gray)
    )

    h, w = gray.shape

    # Simple development-time quality score
    sharp_score = min(
        sharpness / 300.0,
        1.0
    )

    brightness_score = 1.0 - min(
        abs(brightness - 110) / 110,
        1.0
    )

    contrast_score = min(
        contrast / 60.0,
        1.0
    )

    score = (

        0.45 * sharp_score
        +
        0.30 * brightness_score
        +
        0.25 * contrast_score
    )

    if score >= 0.65:

        quality = "Good"

    elif score >= 0.45:

        quality = "Acceptable"

    else:

        quality = "Poor"

    return {

        "quality_score": round(
            float(score),
            4
        ),

        "quality_status": quality,

        "sharpness": round(
            sharpness,
            2
        ),

        "brightness": round(
            brightness,
            2
        ),

        "contrast": round(
            contrast,
            2
        )
    }


# ============================================================
# GRAPH / LESION FEATURE DISCOVERY
# ============================================================

def find_feature_dataset():

    candidates = [

        os.path.join(
            PROJECT_ROOT,
            "results",
            "retinal_graph_dataset",
            "RETINA_FUSION_MULTIMODAL_DATASET.csv"
        ),

        os.path.join(
            PROJECT_ROOT,
            "results",
            "retinal_graph_dataset",
            "RETINA_FUSION_FEATURE_DATASET.csv"
        )
    ]

    for path in candidates:

        if os.path.exists(path):

            return path

    return None


FEATURE_DATASET = find_feature_dataset()


# ============================================================
# LOAD STRUCTURED DATA
# ============================================================

def load_structured_features():

    if FEATURE_DATASET is None:

        return None

    df = pd.read_csv(
        FEATURE_DATASET
    )

    return df


STRUCTURED_DF = load_structured_features()


# ============================================================
# FIND IMAGE ID
# ============================================================

def normalize_image_id(
    filename
):

    stem = os.path.splitext(
        os.path.basename(filename)
    )[0]

    digits = ""

    for char in stem:

        if char.isdigit():

            digits += char

    if digits:

        return f"{int(digits):02d}"

    return stem


# ============================================================
# FIND IDRiD IMAGE
# ============================================================

def find_idrid_image(
    image_id
):

    search_dirs = [

        os.path.join(
            IDRID_ROOT,
            "A. Segmentation",
            "A. Segmentation",
            "1. Original Images"
        ),

        os.path.join(
            IDRID_ROOT,
            "B. Disease Grading",
            "1. Original Images"
        )
    ]

    possible_names = [

        f"IDRiD_{image_id}.jpg",
        f"IDRiD_{image_id}.JPG",
        f"{image_id}.jpg",
        f"{image_id}.JPG"
    ]

    for directory in search_dirs:

        if not os.path.exists(directory):

            continue

        for name in possible_names:

            path = os.path.join(
                directory,
                name
            )

            if os.path.exists(path):

                return path

    # fallback recursive search

    for root, _, files in os.walk(
        IDRID_ROOT
    ):

        for file in files:

            if image_id in file:

                lower = file.lower()

                if lower.endswith(
                    (".jpg", ".jpeg", ".png")
                ):

                    return os.path.join(
                        root,
                        file
                    )

    return None


# ============================================================
# STRUCTURED FEATURE EXTRACTION
# ============================================================

def get_structured_features(
    image_id
):

    result = {}

    for feature in STRUCTURED_FEATURES:

        result[feature] = 0.0

    if STRUCTURED_DF is None:

        return result

    possible_id_columns = [

        "image_id",
        "id",
        "image"
    ]

    id_column = None

    for col in possible_id_columns:

        if col in STRUCTURED_DF.columns:

            id_column = col

            break

    if id_column is None:

        return result

    ids = (
        STRUCTURED_DF[id_column]
        .astype(str)
        .str.extract(r"(\d+)", expand=False)
    )

    ids = ids.fillna("")

    target = str(
        int(image_id)
    ).zfill(2)

    rows = STRUCTURED_DF[
        ids == target
    ]

    if len(rows) == 0:

        return result

    row = rows.iloc[0]

    for feature in STRUCTURED_FEATURES:

        if feature in row.index:

            value = row[feature]

            if pd.notna(value):

                try:

                    result[feature] = float(
                        value
                    )

                except:

                    result[feature] = 0.0

    return result


# ============================================================
# SCALER
# ============================================================

def load_scaler():

    scaler_path = os.path.join(
        MODEL_PATH,
        "scaler_fold_1.json"
    )

    if not os.path.exists(
        scaler_path
    ):

        return None

    with open(
        scaler_path,
        "r"
    ) as f:

        return json.load(f)


SCALER = load_scaler()


def scale_structured(
    values
):

    vector = np.array(
        [
            values[f]
            for f in STRUCTURED_FEATURES
        ],
        dtype=np.float32
    )

    if SCALER is None:

        return vector

    # Supports common scaler JSON formats

    if (
        "mean" in SCALER
        and "scale" in SCALER
    ):

        mean = np.array(
            SCALER["mean"],
            dtype=np.float32
        )

        scale = np.array(
            SCALER["scale"],
            dtype=np.float32
        )

        scale[
            scale == 0
        ] = 1

        vector = (
            vector - mean
        ) / scale

    return vector.astype(
        np.float32
    )


# ============================================================
# MODEL LOADING
# ============================================================

MODEL = None


def find_best_checkpoint():

    candidates = []

    for root, _, files in os.walk(
        MODEL_PATH
    ):

        for file in files:

            if file.endswith(
                ".pth"
            ):

                candidates.append(
                    os.path.join(
                        root,
                        file
                    )
                )

    if not candidates:

        return None

    # Prefer fold 1 if no explicit ranking file exists
    for path in candidates:

        if "fold_1" in path.lower():

            return path

    return candidates[0]


def load_model():

    global MODEL

    checkpoint = find_best_checkpoint()

    if checkpoint is None:

        print(
            "WARNING: final fusion checkpoint not found."
        )

        return

    MODEL = RetinaFusionModel(
        len(STRUCTURED_FEATURES)
    )

    state = torch.load(
        checkpoint,
        map_location=DEVICE
    )

    if isinstance(
        state,
        dict
    ) and "model_state_dict" in state:

        state = state[
            "model_state_dict"
        ]

    MODEL.load_state_dict(
        state,
        strict=False
    )

    MODEL.to(
        DEVICE
    )

    MODEL.eval()

    print(
        f"Loaded model: {checkpoint}"
    )


# ============================================================
# TRANSFORM
# ============================================================

IMAGE_TRANSFORM = transforms.Compose([

    transforms.ToPILImage(),

    transforms.Resize(
        (224, 224)
    ),

    transforms.ToTensor(),

    transforms.Normalize(

        mean=[
            0.485,
            0.456,
            0.406
        ],

        std=[
            0.229,
            0.224,
            0.225
        ]
    )
])


# ============================================================
# GRAD-CAM
# ============================================================

class GradCAM:

    def __init__(
        self,
        model,
        target_layer
    ):

        self.model = model

        self.target_layer = (
            target_layer
        )

        self.activations = None

        self.gradients = None

        self.forward_hook = (
            target_layer.register_forward_hook(
                self.save_activation
            )
        )

        self.backward_hook = (
            target_layer.register_full_backward_hook(
                self.save_gradient
            )
        )

    def save_activation(
        self,
        module,
        input,
        output
    ):

        self.activations = output

    def save_gradient(
        self,
        module,
        grad_input,
        grad_output
    ):

        self.gradients = grad_output[0]

    def generate(
        self,
        image,
        class_index
    ):

        self.model.zero_grad()

        output = self.model(
            image[0],
            image[1]
        )

        score = output[
            0,
            class_index
        ]

        score.backward()

        gradients = (
            self.gradients
        )

        activations = (
            self.activations
        )

        weights = gradients.mean(
            dim=(2, 3),
            keepdim=True
        )

        cam = (
            weights * activations
        ).sum(
            dim=1
        )

        cam = torch.relu(
            cam
        )

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


# ============================================================
# GRAD-CAM IMAGE
# ============================================================

def create_gradcam_image(
    original,
    cam,
    output_path
):

    cam = cv2.resize(
        cam,
        (
            original.shape[1],
            original.shape[0]
        )
    )

    heatmap = np.uint8(
        255 * cam
    )

    heatmap = cv2.applyColorMap(
        heatmap,
        cv2.COLORMAP_JET
    )

    overlay = cv2.addWeighted(
        original,
        0.55,
        heatmap,
        0.45,
        0
    )

    cv2.imwrite(
        output_path,
        overlay
    )

    return output_path


# ============================================================
# EVIDENCE INTERPRETATION
# ============================================================

def interpret_evidence(
    features,
    probability
):

    evidence = []

    # Lesions

    if features["ma_count"] > 0:

        evidence.append(
            "Microaneurysm evidence detected."
        )

    if features["ex_count"] > 0:

        evidence.append(
            "Exudate evidence detected."
        )

    if features["he_count"] > 0:

        evidence.append(
            "Hemorrhage evidence detected."
        )

    if features["se_count"] > 0:

        evidence.append(
            "Possible soft-exudate evidence detected."
        )

    # Topology

    if features[
        "vessel_junction_count"
    ] > 0:

        evidence.append(
            "Retinal vessel junction structure "
            "was incorporated into the prediction."
        )

    if features[
        "vessel_endpoint_count"
    ] > 0:

        evidence.append(
            "Retinal vessel topology was available "
            "for graph-based analysis."
        )

    # Prediction

    if probability >= 0.5:

        prediction_statement = (
            "The model predicts referable diabetic "
            "retinopathy."
        )

    else:

        prediction_statement = (
            "The model predicts non-referable "
            "diabetic retinopathy."
        )

    return (
        prediction_statement,
        evidence
    )


# ============================================================
# HTML REPORT
# ============================================================

def generate_html_report(
    report_data,
    gradcam_path,
    original_path
):

    report_id = report_data[
        "report_id"
    ]

    report_path = os.path.join(
        REPORT_DIR,
        f"{report_id}.html"
    )

    def image_to_base64(
        path
    ):

        if not os.path.exists(path):

            return ""

        with open(
            path,
            "rb"
        ) as f:

            return base64.b64encode(
                f.read()
            ).decode()

    original_b64 = image_to_base64(
        original_path
    )

    gradcam_b64 = image_to_base64(
        gradcam_path
    )

    prediction = report_data[
        "prediction"
    ]

    confidence = report_data[
        "probability"
    ]

    quality = report_data[
        "quality"
    ]

    evidence = report_data[
        "evidence"
    ]

    evidence_html = ""

    for item in evidence:

        evidence_html += (
            f"<li>{item}</li>"
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
    margin: 0;
    padding: 30px;
    background: #f4f7fb;
}}

.container {{
    max-width: 1100px;
    margin: auto;
}}

.header {{
    background: #111827;
    color: white;
    padding: 25px;
    border-radius: 15px;
}}

.grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 20px;
}}

.card {{
    background: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0,0,0,.08);
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
    margin-top: 20px;
    padding: 15px;
    background: #fff7ed;
    border-radius: 10px;
}}

</style>

</head>

<body>

<div class="container">

<div class="header">

<h1>RETINA-FUSION 360</h1>

<p>Explainable Diabetic Retinopathy Screening Report</p>

<p>
Report ID: {report_id}
</p>

<p>
Generated: {report_data["timestamp"]}
</p>

</div>


<div class="grid">

<div class="card">

<h2>Prediction</h2>

<div class="badge">

{prediction}

</div>

<p>

Model probability:
<strong>
{confidence * 100:.2f}%
</strong>

</p>

</div>


<div class="card">

<h2>Image Quality</h2>

<p>
Status:
<strong>
{quality["quality_status"]}
</strong>
</p>

<p>
Quality score:
{quality["quality_score"]:.3f}
</p>

<p>
Sharpness:
{quality["sharpness"]:.2f}
</p>

<p>
Brightness:
{quality["brightness"]:.2f}
</p>

<p>
Contrast:
{quality["contrast"]:.2f}
</p>

</div>

</div>


<div class="grid">

<div class="card">

<h2>Original Image</h2>

<img src="data:image/jpeg;base64,{original_b64}">

</div>


<div class="card">

<h2>Grad-CAM Explanation</h2>

<img src="data:image/jpeg;base64,{gradcam_b64}">

</div>

</div>


<div class="card" style="margin-top:20px;">

<h2>Evidence Summary</h2>

<p>
{report_data["prediction_statement"]}
</p>

<ul>

{evidence_html}

</ul>

</div>


<div class="card" style="margin-top:20px;">

<h2>Retinal Graph / Lesion Features</h2>

<table width="100%" cellpadding="8">

<tr>
<th align="left">Feature</th>
<th align="left">Value</th>
</tr>
"""

    for key, value in report_data[
        "structured_features"
    ].items():

        html += f"""
<tr>

<td>{key}</td>

<td>{value:.4f}</td>

</tr>
"""

    html += """

</table>

</div>


<div class="warning">

<strong>Important:</strong>

This report is an AI-assisted screening output.
Grad-CAM indicates regions that influenced the
model and should not be interpreted as proof of
disease. Clinical examination and qualified
medical review remain necessary.

</div>

</div>

</body>

</html>
"""

    with open(
        report_path,
        "w",
        encoding="utf-8"
    ) as f:

        f.write(
            html
        )

    return report_path


# ============================================================
# COMPLETE ANALYSIS
# ============================================================

def analyze_image(
    image_path
):

    if MODEL is None:

        load_model()

    if MODEL is None:

        raise RuntimeError(
            "Model checkpoint not available."
        )

    report_id = (
        "RF360_"
        + datetime.now().strftime(
            "%Y%m%d_%H%M%S"
        )
        + "_"
        + uuid.uuid4().hex[:6]
    )

    image_id = normalize_image_id(
        image_path
    )

    original, processed = preprocess_image(
        image_path
    )

    quality = quality_assessment(
        original
    )

    structured_features = (
        get_structured_features(
            image_id
        )
    )

    structured_vector = scale_structured(
        structured_features
    )

    image_tensor = IMAGE_TRANSFORM(
        processed
    ).unsqueeze(
        0
    ).to(
        DEVICE
    )

    structured_tensor = torch.tensor(
        structured_vector,
        dtype=torch.float32
    ).unsqueeze(
        0
    ).to(
        DEVICE
    )

    with torch.no_grad():

        logits = MODEL(
            image_tensor,
            structured_tensor
        )

        probabilities = torch.softmax(
            logits,
            dim=1
        )

        prediction_index = int(
            probabilities.argmax(
                dim=1
            ).item()
        )

        probability = float(
            probabilities[
                0,
                prediction_index
            ].item()
        )

    if prediction_index == 1:

        prediction = (
            "Referable DR"
        )

    else:

        prediction = (
            "Non-Referable DR"
        )

    # --------------------------------------------------------
    # GRAD CAM
    # --------------------------------------------------------

    target_layer = (
        MODEL
        .image_encoder
        .backbone
        .layer4[-1]
    )

    gradcam = GradCAM(
        MODEL,
        target_layer
    )

    cam = gradcam.generate(
        (
            image_tensor,
            structured_tensor
        ),
        prediction_index
    )

    gradcam.close()

    gradcam_path = os.path.join(
        XAI_DIR,
        f"{report_id}_gradcam.jpg"
    )

    original_path = os.path.join(
        XAI_DIR,
        f"{report_id}_original.jpg"
    )

    cv2.imwrite(
        original_path,
        original
    )

    create_gradcam_image(
        original,
        cam,
        gradcam_path
    )

    # --------------------------------------------------------
    # EVIDENCE
    # --------------------------------------------------------

    prediction_statement, evidence = (
        interpret_evidence(
            structured_features,
            probability
        )
    )

    # --------------------------------------------------------
    # REPORT
    # --------------------------------------------------------

    report_data = {

        "report_id": report_id,

        "timestamp":
            datetime.now().isoformat(),

        "image_id":
            image_id,

        "prediction":
            prediction,

        "prediction_class":
            prediction_index,

        "probability":
            probability,

        "probabilities": {

            "non_referable":
                float(
                    probabilities[
                        0,
                        0
                    ].item()
                ),

            "referable":
                float(
                    probabilities[
                        0,
                        1
                    ].item()
                )
        },

        "quality":
            quality,

        "prediction_statement":
            prediction_statement,

        "evidence":
            evidence,

        "structured_features":
            structured_features,

        "xai": {

            "gradcam":
                gradcam_path

        }
    }


    # ========================================================
    # CENTRAL XAI INTEGRATION
    # ========================================================
    #
    # The existing Grad-CAM, prediction, quality, evidence,
    # and structured features are passed to the central XAI
    # coordinator. This does NOT create another ML model.
    #

    if CENTRAL_XAI_AVAILABLE:

        try:

            central_xai = build_central_xai(
                report=report_data,
                run_dir=XAI_DIR
            )

            report_data["xai"] = central_xai

        except Exception as xai_error:

            print("WARNING: Central XAI execution failed:")
            print(xai_error)

            report_data["xai"] = {
                "status": "XAI_ERROR",
                "error": str(xai_error)
            }

    else:

        report_data["xai"] = {
            "status": "XAI_UNAVAILABLE",
            "error": "Central XAI engine could not be imported."
        }


    json_path = os.path.join(
        REPORT_DIR,
        f"{report_id}.json"
    )

    with open(
        json_path,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            report_data,
            f,
            indent=4
        )

    html_path = generate_html_report(
        report_data,
        gradcam_path,
        original_path
    )

    report_data[
        "report_path"
    ] = html_path

    report_data[
        "json_path"
    ] = json_path

    return report_data


# ============================================================
# FLASK API
# ============================================================

app = Flask(
    __name__
)

CORS(
    app
)


@app.route(
    "/",
    methods=["GET"]
)
def home():

    return jsonify({

        "system":
            "RETINA-FUSION 360",

        "status":
            "online",

        "service":
            "Explainable DR Screening API",

        "device":
            str(DEVICE)

    })


# ============================================================
# HEALTH
# ============================================================

@app.route(
    "/api/health",
    methods=["GET"]
)
def health():

    return jsonify({

        "status":
            "healthy",

        "model_loaded":
            MODEL is not None,

        "device":
            str(DEVICE)

    })


# ============================================================
# ANALYZE IMAGE
# ============================================================

@app.route(
    "/api/analyze",
    methods=["POST"]
)
def analyze():

    try:

        if "image" not in request.files:

            return jsonify({

                "success":
                    False,

                "error":
                    "No image uploaded. "
                    "Use field name 'image'."

            }), 400

        file = request.files[
            "image"
        ]

        if file.filename == "":

            return jsonify({

                "success":
                    False,

                "error":
                    "Empty filename."

            }), 400

        extension = os.path.splitext(
            file.filename
        )[1].lower()

        allowed = [
            ".jpg",
            ".jpeg",
            ".png",
            ".tif",
            ".tiff"
        ]

        if extension not in allowed:

            return jsonify({

                "success":
                    False,

                "error":
                    "Unsupported image format."

            }), 400

        filename = (
            uuid.uuid4().hex
            + extension
        )

        image_path = os.path.join(
            UPLOAD_DIR,
            filename
        )

        file.save(
            image_path
        )

        result = analyze_image(
            image_path
        )

        # Frontend-friendly response

        return jsonify({

            "success":
                True,

            "status":
                "SCREENED",

            "report_id":
                result["report_id"],

            "prediction":
                result["prediction"],

            "confidence":
                round(
                    result["probability"],
                    4
                ),

            "probabilities":
                result["probabilities"],

            "quality":
                result["quality"],

            "evidence":
                result["evidence"],

            "structured_features":
                result[
                    "structured_features"
                ],

            # Complete Central XAI result.
            # The frontend can consume response.xai
            # without calling individual AI modules.
            "xai":
                result.get(
                    "xai",
                    {}
                ),

            "report": {

                "json":
                    result["json_path"],

                "html":
                    result["report_path"],

                "gradcam":
                    result.get(
                        "xai",
                        {}
                    ).get(
                        "gradcam",
                        ""
                    )

            }

        })

    except Exception as e:

        import traceback

        traceback.print_exc()

        return jsonify({

            "success":
                False,

            "error":
                str(e)

        }), 500


# ============================================================
# SERVE GENERATED FILES
# ============================================================

@app.route(
    "/reports/<filename>"
)
def serve_report(
    filename
):

    return send_from_directory(
        REPORT_DIR,
        filename
    )


@app.route(
    "/xai/<filename>"
)
def serve_xai(
    filename
):

    return send_from_directory(
        XAI_DIR,
        filename
    )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    print()
    print("=" * 70)
    print(
        "RETINA-FUSION 360"
    )
    print(
        "Integrated Explainable DR Screening Backend"
    )
    print("=" * 70)

    load_model()

    print(
        f"Device: {DEVICE}"
    )

    print(
        "API:"
    )

    print(
        "http://127.0.0.1:5000"
    )

    print()

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )