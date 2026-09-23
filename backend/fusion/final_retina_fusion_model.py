import os
import re
import json
import random
import warnings

import numpy as np
import pandas as pd

from PIL import Image

import torch
import torch.nn as nn

from torch.utils.data import Dataset, DataLoader

from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import StandardScaler

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    f1_score,
    confusion_matrix,
    roc_auc_score
)

from torchvision import transforms
from torchvision.models import resnet18


warnings.filterwarnings("ignore")


# ============================================================
# RETINA-FUSION 360
#
# FINAL MULTIMODAL RESEARCH MODEL
#
# IMAGE
#   +
# RETINAL GRAPH TOPOLOGY
#   +
# LESION EVIDENCE
#   ↓
# FUSION
#   ↓
# REFERABLE DR
#
# Grade 0-1 -> Non-referable
# Grade 2-4 -> Referable
#
# The same model can later be extended to 5-class DR.
# ============================================================


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = r"D:\RETINA-FUSION-360"

IDRID_ROOT = os.path.join(
    PROJECT_ROOT,
    "datasets",
    "IDrid"
)

DATASET_PATH = os.path.join(
    PROJECT_ROOT,
    "results",
    "retinal_graph_dataset",
    "RETINA_FUSION_MULTIMODAL_DATASET.csv"
)

APTOS_CHECKPOINT = os.path.join(
    PROJECT_ROOT,
    "models",
    "aptos_baseline",
    "best_model.pth"
)

MODEL_DIR = os.path.join(
    PROJECT_ROOT,
    "models",
    "final_retina_fusion"
)

RESULT_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "final_retina_fusion"
)


os.makedirs(
    MODEL_DIR,
    exist_ok=True
)

os.makedirs(
    RESULT_DIR,
    exist_ok=True
)


# ============================================================
# CONFIG
# ============================================================

SEED = 42

IMAGE_SIZE = 224

BATCH_SIZE = 4

EPOCHS = 25

LEARNING_RATE = 1e-4

WEIGHT_DECAY = 1e-4

N_SPLITS = 5

PATIENCE = 6

NUM_CLASSES = 2

DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


# ============================================================
# SEED
# ============================================================

def seed_everything(seed=42):

    random.seed(seed)

    np.random.seed(seed)

    torch.manual_seed(seed)

    if torch.cuda.is_available():

        torch.cuda.manual_seed_all(seed)


seed_everything(SEED)


# ============================================================
# FINAL FEATURE SET
# ============================================================

# Your topology experiment showed that topology was
# considerably more useful than morphology/geometry.
#
# Therefore we keep the topology representation compact.


TOPOLOGY_FEATURES = [

    "graph_total_nodes",

    "graph_total_edges",

    "vessel_node_count",

    "vessel_edge_count",

    "vessel_endpoint_count",

    "vessel_junction_count",

    "junction_to_vessel_ratio",

    "endpoint_to_vessel_ratio",

    "graph_edge_node_ratio",

    "vessel_edge_node_ratio"
]


# ============================================================
# LESION FEATURES
# ============================================================

LESION_FEATURES = [

    # lesion counts

    "ma_count",

    "ex_count",

    "he_count",

    "se_count",

    # lesion areas

    "ma_area",

    "ex_area",

    "he_area",

    "se_area",

    # lesion density

    "lesion_density",

    # lesion-vessel relationships

    "lesion_vessel_edge_count",

    "lesion_lesion_edge_count",

    "lesion_vessel_association",

    "lesion_clustering"
]


# ============================================================
# ALL STRUCTURED FEATURES
# ============================================================

STRUCTURED_FEATURES = (

    TOPOLOGY_FEATURES

    +

    LESION_FEATURES
)


# ============================================================
# HEADER
# ============================================================

print()
print("=" * 80)
print("RETINA-FUSION 360")
print("FINAL MULTIMODAL RESEARCH MODEL")
print("=" * 80)
print()

print(
    f"Device: {DEVICE}"
)

print(
    f"Dataset: {DATASET_PATH}"
)

print()

print(
    "Prediction:"
)

print(
    "Grade 0-1 -> Non-referable"
)

print(
    "Grade 2-4 -> Referable"
)

print()


# ============================================================
# LOAD DATA
# ============================================================

if not os.path.exists(
    DATASET_PATH
):

    raise FileNotFoundError(
        f"Dataset not found:\n{DATASET_PATH}"
    )


df = pd.read_csv(
    DATASET_PATH
)


print(
    f"Raw rows: {len(df)}"
)

print()


# ============================================================
# DR LABEL
# ============================================================

if "dr_grade" not in df.columns:

    raise RuntimeError(
        "dr_grade column missing."
    )


df[
    "dr_grade_numeric"
] = pd.to_numeric(

    df[
        "dr_grade"
    ],

    errors="coerce"
)


df = df[
    df[
        "dr_grade_numeric"
    ].notna()
].copy()


df[
    "dr_grade_numeric"
] = (

    df[
        "dr_grade_numeric"
    ]
    .astype(int)
)


df = df[
    df[
        "dr_grade_numeric"
    ].between(
        0,
        4
    )
].copy()


# ============================================================
# REFERABLE LABEL
# ============================================================

df[
    "referable_dr"
] = (

    df[
        "dr_grade_numeric"
    ]

    >=

    2

).astype(int)


print(
    "DR distribution:"
)

print(
    df[
        "dr_grade_numeric"
    ].value_counts()
    .sort_index()
)

print()


print(
    "Binary distribution:"
)

print(
    df[
        "referable_dr"
    ].value_counts()
    .sort_index()
)

print()


# ============================================================
# IMAGE ID
# ============================================================

def extract_id(
    value
):

    text = str(
        value
    )


    match = re.search(
        r"IDRiD[_\-](\d+)",
        text,
        re.IGNORECASE
    )


    if match:

        return (
            f"{int(match.group(1)):02d}"
        )


    match = re.search(
        r"(\d+)",
        text
    )


    if match:

        return (
            f"{int(match.group(1)):02d}"
        )


    return None


# ============================================================
# FIND ORIGINAL IMAGES
# ============================================================

def find_original_directory():

    candidates = []


    for root, dirs, files in os.walk(
        IDRID_ROOT
    ):

        for directory in dirs:

            if (
                directory.lower()
                ==
                "1. original images"
            ):

                candidates.append(
                    os.path.join(
                        root,
                        directory
                    )
                )


    if not candidates:

        return None


    candidates.sort(
        key=len
    )


    return candidates[0]


ORIGINAL_DIR = (
    find_original_directory()
)


if ORIGINAL_DIR is None:

    raise RuntimeError(
        "IDRiD original image directory "
        "not found."
    )


# ============================================================
# IMAGE LOOKUP
# ============================================================

image_lookup = {}


for root, dirs, files in os.walk(
    ORIGINAL_DIR
):

    for filename in files:

        if filename.lower().endswith(
            (
                ".jpg",
                ".jpeg",
                ".png",
                ".tif",
                ".tiff"
            )
        ):

            image_id = extract_id(
                filename
            )


            if image_id:

                image_lookup[
                    image_id
                ] = os.path.join(
                    root,
                    filename
                )


df[
    "image_id"
] = df[
    "image_id"
].astype(str).apply(
    extract_id
)


df[
    "image_path"
] = df[
    "image_id"
].map(
    image_lookup
)


df = df[
    df[
        "image_path"
    ].notna()
].copy()


df = df.reset_index(
    drop=True
)


print(
    f"Usable samples: {len(df)}"
)

print()


# ============================================================
# CHECK FEATURES
# ============================================================

missing = [

    feature

    for feature
    in STRUCTURED_FEATURES

    if feature not in df.columns
]


if missing:

    print(
        "WARNING: Some structured features "
        "are missing:"
    )

    for feature in missing:

        print(
            f"  {feature}"
        )

    print()

    # Keep only features actually available.

    TOPOLOGY_FEATURES = [

        x

        for x in TOPOLOGY_FEATURES

        if x in df.columns
    ]


    LESION_FEATURES = [

        x

        for x in LESION_FEATURES

        if x in df.columns
    ]


    STRUCTURED_FEATURES = (

        TOPOLOGY_FEATURES
        +
        LESION_FEATURES
    )


# ============================================================
# CLEAN FEATURES
# ============================================================

for feature in STRUCTURED_FEATURES:

    df[
        feature
    ] = pd.to_numeric(

        df[
            feature
        ],

        errors="coerce"
    )


    df[
        feature
    ] = df[
        feature
    ].replace(

        [
            np.inf,
            -np.inf
        ],

        np.nan
    )


    df[
        feature
    ] = df[
        feature
    ].fillna(
        0.0
    )


print(
    f"Topology features: "
    f"{len(TOPOLOGY_FEATURES)}"
)

print(
    f"Lesion features: "
    f"{len(LESION_FEATURES)}"
)

print()


# ============================================================
# TRANSFORMS
# ============================================================

train_transform = transforms.Compose([

    transforms.Resize(
        (
            IMAGE_SIZE,
            IMAGE_SIZE
        )
    ),

    transforms.RandomHorizontalFlip(
        p=0.5
    ),

    transforms.RandomVerticalFlip(
        p=0.2
    ),

    transforms.RandomRotation(
        10
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


val_transform = transforms.Compose([

    transforms.Resize(
        (
            IMAGE_SIZE,
            IMAGE_SIZE
        )
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
# DATASET
# ============================================================

class RetinaFusionDataset(
    Dataset
):

    def __init__(
        self,
        dataframe,
        features,
        transform
    ):

        self.df = (

            dataframe
            .reset_index(
                drop=True
            )
        )


        self.features = features


        self.transform = transform


        self.structured = (

            self.df[
                features
            ]
            .values
            .astype(
                np.float32
            )
        )


        self.labels = (

            self.df[
                "referable_dr"
            ]
            .values
            .astype(
                np.int64
            )
        )


    def __len__(
        self
    ):

        return len(
            self.df
        )


    def __getitem__(
        self,
        index
    ):

        row = (

            self.df.iloc[
                index
            ]
        )


        image = Image.open(

            row[
                "image_path"
            ]

        ).convert(
            "RGB"
        )


        image = self.transform(
            image
        )


        structured = torch.tensor(

            self.structured[
                index
            ],

            dtype=torch.float32
        )


        label = torch.tensor(

            self.labels[
                index
            ],

            dtype=torch.long
        )


        return (
            image,
            structured,
            label
        )


# ============================================================
# IMAGE ENCODER
# ============================================================

class ImageEncoder(
    nn.Module
):

    def __init__(
        self
    ):

        super().__init__()


        self.backbone = resnet18(
            weights=None
        )


        # ----------------------------------------------------
        # Transfer APTOS learned visual features.
        # ----------------------------------------------------

        if os.path.exists(
            APTOS_CHECKPOINT
        ):

            try:

                checkpoint = torch.load(

                    APTOS_CHECKPOINT,

                    map_location="cpu"
                )


                if (

                    isinstance(
                        checkpoint,
                        dict
                    )

                    and

                    "model_state_dict"
                    in checkpoint

                ):

                    state_dict = (

                        checkpoint[
                            "model_state_dict"
                        ]
                    )

                else:

                    state_dict = checkpoint


                cleaned = {}


                for key, value in (
                    state_dict.items()
                ):

                    if key.startswith(
                        "module."
                    ):

                        key = key[
                            7:
                        ]


                    if key.startswith(
                        "fc."
                    ):

                        continue


                    cleaned[
                        key
                    ] = value


                self.backbone.load_state_dict(

                    cleaned,

                    strict=False
                )


                print(
                    "✓ APTOS image "
                    "features transferred"
                )


            except Exception as error:

                print(
                    "WARNING: APTOS "
                    "transfer failed:"
                )

                print(
                    error
                )


        self.backbone.fc = (
            nn.Identity()
        )


    def forward(
        self,
        x
    ):

        return self.backbone(
            x
        )


# ============================================================
# FINAL FUSION MODEL
# ============================================================

class RetinaFusionModel(
    nn.Module
):

    def __init__(
        self,
        structured_dim
    ):

        super().__init__()


        # ====================================================
        # IMAGE BRANCH
        # ====================================================

        self.image_encoder = (
            ImageEncoder()
        )


        self.image_projection = nn.Sequential(

            nn.Linear(
                512,
                256
            ),

            nn.ReLU(),

            nn.LayerNorm(
                256
            ),

            nn.Dropout(
                0.25
            )
        )


        # ====================================================
        # STRUCTURED BRANCH
        #
        # Topology + lesion evidence
        # ====================================================

        self.structured_encoder = nn.Sequential(

            nn.Linear(
                structured_dim,
                128
            ),

            nn.ReLU(),

            nn.LayerNorm(
                128
            ),

            nn.Dropout(
                0.20
            ),

            nn.Linear(
                128,
                64
            ),

            nn.ReLU(),

            nn.LayerNorm(
                64
            )
        )


        # ====================================================
        # FUSION
        # ====================================================

        self.fusion = nn.Sequential(

            nn.Linear(
                256 + 64,
                128
            ),

            nn.ReLU(),

            nn.LayerNorm(
                128
            ),

            nn.Dropout(
                0.30
            ),

            nn.Linear(
                128,
                64
            ),

            nn.ReLU(),

            nn.Dropout(
                0.20
            )
        )


        # ====================================================
        # CLASSIFICATION
        # ====================================================

        self.classifier = nn.Linear(

            64,

            2
        )


    def forward(
        self,
        image,
        structured
    ):


        # ----------------------------------------------------
        # IMAGE
        # ----------------------------------------------------

        image_features = (

            self.image_encoder(
                image
            )
        )


        image_features = (

            self.image_projection(
                image_features
            )
        )


        # ----------------------------------------------------
        # STRUCTURED
        # ----------------------------------------------------

        structured_features = (

            self.structured_encoder(
                structured
            )
        )


        # ----------------------------------------------------
        # FUSION
        # ----------------------------------------------------

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
# CLASS WEIGHTS
# ============================================================

def get_class_weights(
    labels
):

    counts = np.bincount(

        labels,

        minlength=2
    )


    counts = np.maximum(
        counts,
        1
    )


    weights = (

        len(labels)
        /
        (
            2 * counts
        )
    )


    return torch.tensor(

        weights,

        dtype=torch.float32
    )


# ============================================================
# METRICS
# ============================================================

def calculate_metrics(

    y_true,

    y_pred,

    probabilities
):


    accuracy = accuracy_score(

        y_true,
        y_pred
    )


    balanced_accuracy = (
        balanced_accuracy_score(

            y_true,
            y_pred
        )
    )


    macro_f1 = f1_score(

        y_true,

        y_pred,

        average="macro",

        zero_division=0
    )


    cm = confusion_matrix(

        y_true,

        y_pred,

        labels=[
            0,
            1
        ]
    )


    tn = cm[0, 0]

    fp = cm[0, 1]

    fn = cm[1, 0]

    tp = cm[1, 1]


    sensitivity = (

        tp
        /
        max(
            tp + fn,
            1
        )
    )


    specificity = (

        tn
        /
        max(
            tn + fp,
            1
        )
    )


    try:

        auc = roc_auc_score(

            y_true,

            probabilities
        )

    except Exception:

        auc = 0.0


    return {

        "accuracy":
            float(
                accuracy
            ),

        "balanced_accuracy":
            float(
                balanced_accuracy
            ),

        "macro_f1":
            float(
                macro_f1
            ),

        "sensitivity":
            float(
                sensitivity
            ),

        "specificity":
            float(
                specificity
            ),

        "auc":
            float(
                auc
            ),

        "confusion_matrix":
            cm.tolist()
    }


# ============================================================
# EVALUATE
# ============================================================

def evaluate(

    model,

    loader,

    criterion
):


    model.eval()


    total_loss = 0.0

    total = 0


    y_true = []

    y_pred = []

    y_prob = []


    with torch.no_grad():


        for (

            images,

            structured,

            labels

        ) in loader:


            images = images.to(
                DEVICE
            )


            structured = structured.to(
                DEVICE
            )


            labels = labels.to(
                DEVICE
            )


            logits = model(

                images,

                structured
            )


            loss = criterion(

                logits,

                labels
            )


            total_loss += (

                loss.item()
                *
                labels.size(0)
            )


            total += (
                labels.size(0)
            )


            probabilities = (

                torch.softmax(

                    logits,

                    dim=1
                )
            )


            predictions = (

                torch.argmax(

                    probabilities,

                    dim=1
                )
            )


            y_true.extend(

                labels
                .cpu()
                .numpy()
            )


            y_pred.extend(

                predictions
                .cpu()
                .numpy()
            )


            y_prob.extend(

                probabilities[
                    :,
                    1
                ]
                .cpu()
                .numpy()
            )


    metrics = calculate_metrics(

        np.array(y_true),

        np.array(y_pred),

        np.array(y_prob)
    )


    metrics[
        "loss"
    ] = (

        total_loss
        /
        max(
            total,
            1
        )
    )


    return metrics


# ============================================================
# TRAIN ONE FOLD
# ============================================================

def train_fold(

    train_df,

    val_df,

    fold
):


    print()
    print(
        "=" * 80
    )

    print(
        f"FINAL MODEL | FOLD {fold}"
    )

    print(
        "=" * 80
    )


    train_data = (
        train_df.copy()
    )


    val_data = (
        val_df.copy()
    )


    # ========================================================
    # STANDARDIZE STRUCTURED FEATURES
    #
    # Fit ONLY on training data.
    # ========================================================

    scaler = StandardScaler()


    train_structured = (

        train_data[
            STRUCTURED_FEATURES
        ].values
    )


    val_structured = (

        val_data[
            STRUCTURED_FEATURES
        ].values
    )


    train_data[
        STRUCTURED_FEATURES
    ] = scaler.fit_transform(

        train_structured
    )


    val_data[
        STRUCTURED_FEATURES
    ] = scaler.transform(

        val_structured
    )


    # ========================================================
    # DATASETS
    # ========================================================

    train_dataset = RetinaFusionDataset(

        train_data,

        STRUCTURED_FEATURES,

        train_transform
    )


    val_dataset = RetinaFusionDataset(

        val_data,

        STRUCTURED_FEATURES,

        val_transform
    )


    train_loader = DataLoader(

        train_dataset,

        batch_size=BATCH_SIZE,

        shuffle=True,

        drop_last=True,

        num_workers=0
    )


    val_loader = DataLoader(

        val_dataset,

        batch_size=BATCH_SIZE,

        shuffle=False,

        drop_last=False,

        num_workers=0
    )


    # ========================================================
    # MODEL
    # ========================================================

    model = RetinaFusionModel(

        structured_dim=len(
            STRUCTURED_FEATURES
        )

    ).to(
        DEVICE
    )


    # ========================================================
    # LOSS
    # ========================================================

    weights = get_class_weights(

        train_data[
            "referable_dr"
        ].values
    ).to(
        DEVICE
    )


    criterion = nn.CrossEntropyLoss(

        weight=weights
    )


    # ========================================================
    # OPTIMIZER
    # ========================================================

    optimizer = torch.optim.AdamW(

        model.parameters(),

        lr=LEARNING_RATE,

        weight_decay=WEIGHT_DECAY
    )


    scheduler = (
        torch.optim.lr_scheduler.ReduceLROnPlateau(

            optimizer,

            mode="max",

            factor=0.5,

            patience=2
        )
    )


    # ========================================================
    # TRAIN
    # ========================================================

    best_score = -1

    best_state = None

    patience_counter = 0

    history = []


    for epoch in range(

        1,

        EPOCHS + 1
    ):


        model.train()


        running_loss = 0.0

        correct = 0

        total = 0


        for (

            images,

            structured,

            labels

        ) in train_loader:


            images = images.to(
                DEVICE
            )


            structured = structured.to(
                DEVICE
            )


            labels = labels.to(
                DEVICE
            )


            optimizer.zero_grad()


            logits = model(

                images,

                structured
            )


            loss = criterion(

                logits,

                labels
            )


            loss.backward()


            torch.nn.utils.clip_grad_norm_(

                model.parameters(),

                max_norm=2.0
            )


            optimizer.step()


            running_loss += (

                loss.item()
                *
                labels.size(0)
            )


            predictions = (

                torch.argmax(

                    logits,

                    dim=1
                )
            )


            correct += int(

                (
                    predictions
                    ==
                    labels
                )
                .sum()
                .item()
            )


            total += (
                labels.size(0)
            )


        train_accuracy = (

            correct
            /
            max(
                total,
                1
            )
        )


        val_metrics = evaluate(

            model,

            val_loader,

            criterion
        )


        scheduler.step(

            val_metrics[
                "balanced_accuracy"
            ]
        )


        score = (

            val_metrics[
                "balanced_accuracy"
            ]
        )


        if score > best_score:

            best_score = score


            best_state = {

                key:

                    value.detach()
                    .cpu()
                    .clone()

                for key, value
                in model.state_dict().items()
            }


            patience_counter = 0


        else:

            patience_counter += 1


        history.append({

            "epoch":
                epoch,

            "train_accuracy":
                train_accuracy,

            "val_accuracy":
                val_metrics[
                    "accuracy"
                ],

            "val_balanced_accuracy":
                val_metrics[
                    "balanced_accuracy"
                ],

            "val_macro_f1":
                val_metrics[
                    "macro_f1"
                ],

            "val_sensitivity":
                val_metrics[
                    "sensitivity"
                ],

            "val_specificity":
                val_metrics[
                    "specificity"
                ],

            "val_auc":
                val_metrics[
                    "auc"
                ]
        })


        print(

            f"Epoch {epoch:02d} | "

            f"Train "
            f"{train_accuracy:.3f} | "

            f"Bal "
            f"{val_metrics['balanced_accuracy']:.3f} | "

            f"Sens "
            f"{val_metrics['sensitivity']:.3f} | "

            f"Spec "
            f"{val_metrics['specificity']:.3f} | "

            f"AUC "
            f"{val_metrics['auc']:.3f}"
        )


        if patience_counter >= PATIENCE:

            print(
                "Early stopping."
            )

            break


    # ========================================================
    # RESTORE BEST
    # ========================================================

    if best_state is not None:

        model.load_state_dict(
            best_state
        )


    # ========================================================
    # FINAL FOLD RESULT
    # ========================================================

    final_metrics = evaluate(

        model,

        val_loader,

        criterion
    )


    # ========================================================
    # SAVE MODEL
    # ========================================================

    model_path = os.path.join(

        MODEL_DIR,

        f"final_retina_fusion_fold_{fold}.pth"
    )


    torch.save(

        {

            "model_state_dict":
                model.state_dict(),

            "structured_features":
                STRUCTURED_FEATURES,

            "topology_features":
                TOPOLOGY_FEATURES,

            "lesion_features":
                LESION_FEATURES,

            "task":
                "referable_dr",

            "fold":
                fold,

            "seed":
                SEED

        },

        model_path
    )


    # ========================================================
    # SAVE SCALER
    # ========================================================

    scaler_path = os.path.join(

        MODEL_DIR,

        f"scaler_fold_{fold}.json"
    )


    with open(

        scaler_path,

        "w"
    ) as file:

        json.dump(

            {

                "features":
                    STRUCTURED_FEATURES,

                "mean":
                    scaler.mean_.tolist(),

                "scale":
                    scaler.scale_.tolist()

            },

            file,

            indent=2
        )


    # ========================================================
    # HISTORY
    # ========================================================

    history_path = os.path.join(

        RESULT_DIR,

        f"fold_{fold}_history.json"
    )


    with open(

        history_path,

        "w"
    ) as file:

        json.dump(

            history,

            file,

            indent=2
        )


    return {

        "fold":
            fold,

        "accuracy":
            final_metrics[
                "accuracy"
            ],

        "balanced_accuracy":
            final_metrics[
                "balanced_accuracy"
            ],

        "macro_f1":
            final_metrics[
                "macro_f1"
            ],

        "sensitivity":
            final_metrics[
                "sensitivity"
            ],

        "specificity":
            final_metrics[
                "specificity"
            ],

        "auc":
            final_metrics[
                "auc"
            ],

        "confusion_matrix":
            final_metrics[
                "confusion_matrix"
            ]
    }


# ============================================================
# MAIN
# ============================================================

def main():


    labels = (

        df[
            "referable_dr"
        ]
        .values
    )


    class_counts = np.bincount(

        labels,

        minlength=2
    )


    print(
        "Class distribution:"
    )

    print(
        f"Non-referable: "
        f"{class_counts[0]}"
    )

    print(
        f"Referable: "
        f"{class_counts[1]}"
    )

    print()


    n_splits = min(

        N_SPLITS,

        int(
            class_counts.min()
        )
    )


    skf = StratifiedKFold(

        n_splits=n_splits,

        shuffle=True,

        random_state=SEED
    )


    results = []


    # ========================================================
    # 5-FOLD FINAL EVALUATION
    # ========================================================

    for fold, (

        train_idx,

        val_idx

    ) in enumerate(

        skf.split(
            df,
            labels
        ),

        1
    ):


        train_df = (

            df.iloc[
                train_idx
            ]
            .copy()
        )


        val_df = (

            df.iloc[
                val_idx
            ]
            .copy()
        )


        result = train_fold(

            train_df,

            val_df,

            fold
        )


        results.append(
            result
        )


    # ========================================================
    # RESULTS
    # ========================================================

    results_df = pd.DataFrame(
        results
    )


    results_path = os.path.join(

        RESULT_DIR,

        "final_model_fold_results.csv"
    )


    results_df.to_csv(

        results_path,

        index=False
    )


    # ========================================================
    # SUMMARY
    # ========================================================

    metric_names = [

        "accuracy",

        "balanced_accuracy",

        "macro_f1",

        "sensitivity",

        "specificity",

        "auc"
    ]


    summary = {}


    for metric in metric_names:

        summary[
            f"{metric}_mean"
        ] = float(

            results_df[
                metric
            ].mean()
        )


        summary[
            f"{metric}_std"
        ] = float(

            results_df[
                metric
            ].std(
                ddof=0
            )
        )


    # ========================================================
    # SAVE SUMMARY
    # ========================================================

    summary_df = pd.DataFrame(

        [summary]
    )


    summary_path = os.path.join(

        RESULT_DIR,

        "final_model_summary.csv"
    )


    summary_df.to_csv(

        summary_path,

        index=False
    )


    # ========================================================
    # FINAL REPORT
    # ========================================================

    report = {

        "project":
            "RETINA-FUSION 360",

        "model":
            "Image + Retinal Topology + Lesion Evidence",

        "task":
            "Referable DR",

        "definition":
            "Grade 0-1 non-referable; Grade 2-4 referable",

        "samples":
            len(df),

        "folds":
            n_splits,

        "image_encoder":
            "ResNet-18 with APTOS transfer",

        "topology_features":
            TOPOLOGY_FEATURES,

        "lesion_features":
            LESION_FEATURES,

        "results":
            summary,

        "warning":
            "Development research result on small IDRiD dataset; not clinical validation."
    }


    report_path = os.path.join(

        RESULT_DIR,

        "final_model_report.json"
    )


    with open(

        report_path,

        "w"
    ) as file:

        json.dump(

            report,

            file,

            indent=2
        )


    # ========================================================
    # PRINT
    # ========================================================

    print()
    print()
    print("=" * 100)
    print("RETINA-FUSION 360 FINAL MODEL COMPLETE")
    print("=" * 100)
    print()


    print(
        summary_df.to_string(
            index=False,
            float_format=lambda x:
                f"{x:.4f}"
        )
    )


    print()

    print(
        "Fold results:"
    )

    print(
        results_path
    )

    print()

    print(
        "Summary:"
    )

    print(
        summary_path
    )

    print()

    print(
        "Report:"
    )

    print(
        report_path
    )

    print()

    print(
        "✓ FINAL MULTIMODAL MODEL TRAINED"
    )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    main()