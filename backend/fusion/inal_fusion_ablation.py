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
# REFERABLE DR BASELINE
#
# TASK
#
# Grade 0,1 -> NON-REFERABLE
# Grade 2,3,4 -> REFERABLE
#
# EXPERIMENTS
#
# 1. IMAGE ONLY
# 2. IMAGE + RETINAL GRAPH
#
# Dataset:
# IDRiD same-image multimodal dataset
#
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
    "referable_baseline"
)

RESULT_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "referable_baseline"
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
# CONFIGURATION
# ============================================================

SEED = 42

IMAGE_SIZE = 224

BATCH_SIZE = 4

EPOCHS = 20

LEARNING_RATE = 1e-4

WEIGHT_DECAY = 1e-4

N_SPLITS = 5

NUM_CLASSES = 2

EARLY_STOPPING_PATIENCE = 5


DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


# ============================================================
# REPRODUCIBILITY
# ============================================================

def seed_everything(
    seed=42
):

    random.seed(
        seed
    )

    np.random.seed(
        seed
    )

    torch.manual_seed(
        seed
    )

    if torch.cuda.is_available():

        torch.cuda.manual_seed_all(
            seed
        )


seed_everything(
    SEED
)


# ============================================================
# HEADER
# ============================================================

print()
print("=" * 78)
print("RETINA-FUSION 360")
print("REFERABLE DR BINARY BASELINE")
print("=" * 78)
print()

print(
    f"Device: {DEVICE}"
)

print(
    f"Dataset: {DATASET_PATH}"
)

print()

print(
    "Target:"
)

print(
    "Grade 0-1 -> Non-referable"
)

print(
    "Grade 2-4 -> Referable"
)

print()


# ============================================================
# LOAD DATASET
# ============================================================

if not os.path.exists(
    DATASET_PATH
):

    raise FileNotFoundError(
        "\nDataset not found:\n"
        f"{DATASET_PATH}\n\n"
        "Run build_multimodal_dataset.py first."
    )


df = pd.read_csv(
    DATASET_PATH
)


print(
    f"Raw rows: {len(df)}"
)

print()


# ============================================================
# CHECK DR GRADE
# ============================================================

if "dr_grade" not in df.columns:

    raise RuntimeError(
        "Column 'dr_grade' not found."
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
# CREATE BINARY LABEL
# ============================================================

df[
    "referable_dr"
] = (
    df[
        "dr_grade_numeric"
    ]
    >= 2
).astype(
    int
)


print(
    "Original DR distribution:"
)

print(
    df[
        "dr_grade_numeric"
    ].value_counts().sort_index()
)

print()


print(
    "Referable DR distribution:"
)

print(
    df[
        "referable_dr"
    ]
    .value_counts()
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
# FIND IDRiD ORIGINAL IMAGE DIRECTORY
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


print(
    "Original image directory:"
)

print(
    ORIGINAL_DIR
)

print()


# ============================================================
# BUILD IMAGE LOOKUP
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


print(
    f"Images found: "
    f"{len(image_lookup)}"
)

print()


# ============================================================
# CONNECT IMAGES
# ============================================================

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


missing = df[
    df[
        "image_path"
    ].isna()
]


if len(missing) > 0:

    print(
        f"WARNING: "
        f"{len(missing)} rows "
        "have no image."
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
    f"Final usable samples: "
    f"{len(df)}"
)

print()


# ============================================================
# GRAPH FEATURES
#
# Retinal vascular structure only.
# ============================================================

GRAPH_FEATURES = [

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

    "vessel_edge_length_mean",

    "vessel_edge_length_std",

    "vessel_edge_length_median",

    "vessel_edge_length_max",

    "total_vessel_length",

    "vessel_euclidean_mean",

    "vessel_euclidean_std",

    "mean_vessel_tortuosity",

    "std_vessel_tortuosity",

    "max_vessel_tortuosity",

    "skeleton_vessel_density",

    "skeleton_pixels",

    "normalized_total_vessel_length"
]


GRAPH_FEATURES = [

    feature

    for feature in GRAPH_FEATURES

    if feature in df.columns
]


print(
    f"Graph features available: "
    f"{len(GRAPH_FEATURES)}"
)

print()


if len(GRAPH_FEATURES) == 0:

    raise RuntimeError(
        "No graph features were found."
    )


# ============================================================
# CLEAN GRAPH FEATURES
# ============================================================

for feature in GRAPH_FEATURES:

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


# ============================================================
# IMAGE TRANSFORMS
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
        degrees=10
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

class RetinaBinaryDataset(
    Dataset
):

    def __init__(
        self,
        dataframe,
        graph_features,
        transform
    ):

        self.df = (
            dataframe
            .reset_index(
                drop=True
            )
        )


        self.graph_features = (
            graph_features
        )


        self.transform = (
            transform
        )


        self.graph_values = (
            self.df[
                graph_features
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


        graph = torch.tensor(
            self.graph_values[
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
            graph,
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
        # Load APTOS pretrained baseline
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
                            len(
                                "module."
                            ):
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
                    "✓ APTOS ResNet-18 "
                    "weights transferred"
                )


            except Exception as error:

                print(
                    "WARNING: "
                    f"Could not load APTOS model: "
                    f"{error}"
                )

                print(
                    "Using random ResNet-18."
                )


        else:

            print(
                "WARNING: APTOS checkpoint "
                "not found."
            )

            print(
                "Using random ResNet-18."
            )


        self.backbone.fc = nn.Identity()


    def forward(
        self,
        x
    ):

        return self.backbone(
            x
        )


# ============================================================
# IMAGE-ONLY MODEL
# ============================================================

class ImageOnlyModel(
    nn.Module
):

    def __init__(
        self
    ):

        super().__init__()


        self.encoder = (
            ImageEncoder()
        )


        self.projection = nn.Sequential(

            nn.Linear(
                512,
                256
            ),

            nn.ReLU(),

            nn.LayerNorm(
                256
            ),

            nn.Dropout(
                0.30
            )
        )


        self.classifier = nn.Linear(

            256,

            NUM_CLASSES
        )


    def forward(
        self,
        image
    ):

        features = (
            self.encoder(
                image
            )
        )


        features = (
            self.projection(
                features
            )
        )


        return self.classifier(
            features
        )


# ============================================================
# GRAPH ENCODER
# ============================================================

class GraphEncoder(
    nn.Module
):

    def __init__(
        self,
        input_dim
    ):

        super().__init__()


        self.network = nn.Sequential(

            nn.Linear(
                input_dim,
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


    def forward(
        self,
        graph
    ):

        return self.network(
            graph
        )


# ============================================================
# IMAGE + GRAPH MODEL
# ============================================================

class ImageGraphModel(
    nn.Module
):

    def __init__(
        self,
        graph_dim
    ):

        super().__init__()


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
                0.20
            )
        )


        self.graph_encoder = (
            GraphEncoder(
                graph_dim
            )
        )


        self.graph_projection = nn.Sequential(

            nn.Linear(
                64,
                128
            ),

            nn.ReLU(),

            nn.LayerNorm(
                128
            )
        )


        # ----------------------------------------------------
        # Simple concatenation.
        #
        # This is intentionally a baseline.
        # No attention or complicated gating.
        # ----------------------------------------------------

        self.classifier = nn.Sequential(

            nn.Linear(
                256 + 128,
                128
            ),

            nn.ReLU(),

            nn.Dropout(
                0.30
            ),

            nn.Linear(
                128,
                NUM_CLASSES
            )
        )


    def forward(
        self,
        image,
        graph
    ):


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


        graph_features = (
            self.graph_encoder(
                graph
            )
        )


        graph_features = (
            self.graph_projection(
                graph_features
            )
        )


        fused = torch.cat(

            [
                image_features,
                graph_features
            ],

            dim=1
        )


        return self.classifier(
            fused
        )


# ============================================================
# CLASS WEIGHTS
# ============================================================

def calculate_class_weights(
    labels
):

    counts = np.bincount(

        labels,

        minlength=NUM_CLASSES
    )


    counts = np.maximum(
        counts,
        1
    )


    weights = (

        len(labels)

        /

        (
            NUM_CLASSES
            *
            counts
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


    accuracy = (
        accuracy_score(
            y_true,
            y_pred
        )
    )


    balanced_accuracy = (
        balanced_accuracy_score(
            y_true,
            y_pred
        )
    )


    macro_f1 = (
        f1_score(
            y_true,
            y_pred,
            average="macro",
            zero_division=0
        )
    )


    # --------------------------------------------------------
    # Binary confusion matrix
    #
    # [TN FP]
    # [FN TP]
    # --------------------------------------------------------

    cm = confusion_matrix(

        y_true,

        y_pred,

        labels=[
            0,
            1
        ]
    )


    tn = cm[
        0,
        0
    ]


    fp = cm[
        0,
        1
    ]


    fn = cm[
        1,
        0
    ]


    tp = cm[
        1,
        1
    ]


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


    # --------------------------------------------------------
    # AUC
    # --------------------------------------------------------

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
# EVALUATE IMAGE MODEL
# ============================================================

def evaluate_image_model(

    model,

    loader,

    criterion
):


    model.eval()


    total_loss = 0.0

    total_samples = 0


    labels_all = []

    predictions_all = []

    probabilities_all = []


    with torch.no_grad():


        for (

            images,

            graphs,

            labels

        ) in loader:


            images = images.to(
                DEVICE
            )


            labels = labels.to(
                DEVICE
            )


            logits = model(
                images
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


            total_samples += (
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


            labels_all.extend(
                labels.cpu().numpy()
            )


            predictions_all.extend(
                predictions.cpu().numpy()
            )


            probabilities_all.extend(
                probabilities[
                    :,
                    1
                ]
                .cpu()
                .numpy()
            )


    y_true = np.array(
        labels_all
    )


    y_pred = np.array(
        predictions_all
    )


    probabilities = np.array(
        probabilities_all
    )


    metrics = calculate_metrics(

        y_true,

        y_pred,

        probabilities
    )


    metrics[
        "loss"
    ] = (

        total_loss

        /

        max(
            total_samples,
            1
        )
    )


    return metrics


# ============================================================
# EVALUATE IMAGE + GRAPH
# ============================================================

def evaluate_image_graph_model(

    model,

    loader,

    criterion
):


    model.eval()


    total_loss = 0.0

    total_samples = 0


    labels_all = []

    predictions_all = []

    probabilities_all = []


    with torch.no_grad():


        for (

            images,

            graphs,

            labels

        ) in loader:


            images = images.to(
                DEVICE
            )


            graphs = graphs.to(
                DEVICE
            )


            labels = labels.to(
                DEVICE
            )


            logits = model(

                images,

                graphs
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


            total_samples += (
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


            labels_all.extend(
                labels.cpu().numpy()
            )


            predictions_all.extend(
                predictions.cpu().numpy()
            )


            probabilities_all.extend(
                probabilities[
                    :,
                    1
                ]
                .cpu()
                .numpy()
            )


    y_true = np.array(
        labels_all
    )


    y_pred = np.array(
        predictions_all
    )


    probabilities = np.array(
        probabilities_all
    )


    metrics = calculate_metrics(

        y_true,

        y_pred,

        probabilities
    )


    metrics[
        "loss"
    ] = (

        total_loss

        /

        max(
            total_samples,
            1
        )
    )


    return metrics


# ============================================================
# TRAIN IMAGE ONLY
# ============================================================

def train_image_only(

    train_df,

    val_df,

    fold
):


    print()
    print(
        "-" * 78
    )

    print(
        f"IMAGE-ONLY | FOLD {fold}"
    )

    print(
        "-" * 78
    )


    train_dataset = RetinaBinaryDataset(

        train_df,

        GRAPH_FEATURES,

        train_transform
    )


    val_dataset = RetinaBinaryDataset(

        val_df,

        GRAPH_FEATURES,

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


    model = ImageOnlyModel().to(
        DEVICE
    )


    class_weights = (
        calculate_class_weights(

            train_df[
                "referable_dr"
            ].values
        )
        .to(
            DEVICE
        )
    )


    criterion = nn.CrossEntropyLoss(

        weight=class_weights
    )


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


    best_score = -1.0

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

            graphs,

            labels

        ) in train_loader:


            images = images.to(
                DEVICE
            )


            labels = labels.to(
                DEVICE
            )


            optimizer.zero_grad()


            logits = model(
                images
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


        train_loss = (

            running_loss
            /
            max(
                total,
                1
            )
        )


        train_acc = (

            correct
            /
            max(
                total,
                1
            )
        )


        val_metrics = (
            evaluate_image_model(

                model,

                val_loader,

                criterion
            )
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

            "train_loss":
                train_loss,

            "train_accuracy":
                train_acc,

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

            f"Epoch {epoch:02d}/{EPOCHS} | "

            f"Train Acc: "
            f"{train_acc:.4f} | "

            f"Val Acc: "
            f"{val_metrics['accuracy']:.4f} | "

            f"Bal Acc: "
            f"{val_metrics['balanced_accuracy']:.4f} | "

            f"Sens: "
            f"{val_metrics['sensitivity']:.4f} | "

            f"Spec: "
            f"{val_metrics['specificity']:.4f} | "

            f"AUC: "
            f"{val_metrics['auc']:.4f}"
        )


        if (
            patience_counter
            >=
            EARLY_STOPPING_PATIENCE
        ):

            print(
                "Early stopping."
            )

            break


    if best_state is not None:

        model.load_state_dict(
            best_state
        )


    final_metrics = (
        evaluate_image_model(

            model,

            val_loader,

            criterion
        )
    )


    model_path = os.path.join(

        MODEL_DIR,

        f"image_only_fold_{fold}.pth"
    )


    torch.save(

        {

            "model_state_dict":
                model.state_dict(),

            "task":
                "referable_dr",

            "fold":
                fold,

            "seed":
                SEED
        },

        model_path
    )


    history_path = os.path.join(

        RESULT_DIR,

        f"image_only_fold_{fold}_history.json"
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

        "experiment":
            "image",

        "fold":
            fold,

        **{
            key: final_metrics[key]

            for key in [

                "accuracy",

                "balanced_accuracy",

                "macro_f1",

                "sensitivity",

                "specificity",

                "auc"
            ]
        },

        "confusion_matrix":
            final_metrics[
                "confusion_matrix"
            ]
    }


# ============================================================
# TRAIN IMAGE + GRAPH
# ============================================================

def train_image_graph(

    train_df,

    val_df,

    fold
):


    print()
    print(
        "-" * 78
    )

    print(
        f"IMAGE + GRAPH | FOLD {fold}"
    )

    print(
        "-" * 78
    )


    # ========================================================
    # STANDARDIZE GRAPH
    # ========================================================

    scaler = StandardScaler()


    train_graph = (
        train_df[
            GRAPH_FEATURES
        ].values
    )


    val_graph = (
        val_df[
            GRAPH_FEATURES
        ].values
    )


    train_scaled = (
        scaler.fit_transform(
            train_graph
        )
    )


    val_scaled = (
        scaler.transform(
            val_graph
        )
    )


    train_data = (
        train_df.copy()
    )


    val_data = (
        val_df.copy()
    )


    train_data[
        GRAPH_FEATURES
    ] = train_scaled


    val_data[
        GRAPH_FEATURES
    ] = val_scaled


    # ========================================================
    # DATASETS
    # ========================================================

    train_dataset = RetinaBinaryDataset(

        train_data,

        GRAPH_FEATURES,

        train_transform
    )


    val_dataset = RetinaBinaryDataset(

        val_data,

        GRAPH_FEATURES,

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

    model = ImageGraphModel(

        graph_dim=len(
            GRAPH_FEATURES
        )

    ).to(
        DEVICE
    )


    # ========================================================
    # LOSS
    # ========================================================

    class_weights = (
        calculate_class_weights(

            train_data[
                "referable_dr"
            ].values
        )
        .to(
            DEVICE
        )
    )


    criterion = nn.CrossEntropyLoss(

        weight=class_weights
    )


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


    best_score = -1.0

    best_state = None

    patience_counter = 0

    history = []


    # ========================================================
    # TRAIN
    # ========================================================

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

            graphs,

            labels

        ) in train_loader:


            images = images.to(
                DEVICE
            )


            graphs = graphs.to(
                DEVICE
            )


            labels = labels.to(
                DEVICE
            )


            optimizer.zero_grad()


            logits = model(

                images,

                graphs
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


        train_loss = (

            running_loss
            /
            max(
                total,
                1
            )
        )


        train_acc = (

            correct
            /
            max(
                total,
                1
            )
        )


        val_metrics = (
            evaluate_image_graph_model(

                model,

                val_loader,

                criterion
            )
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

            "train_loss":
                train_loss,

            "train_accuracy":
                train_acc,

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

            f"Epoch {epoch:02d}/{EPOCHS} | "

            f"Train Acc: "
            f"{train_acc:.4f} | "

            f"Val Acc: "
            f"{val_metrics['accuracy']:.4f} | "

            f"Bal Acc: "
            f"{val_metrics['balanced_accuracy']:.4f} | "

            f"Sens: "
            f"{val_metrics['sensitivity']:.4f} | "

            f"Spec: "
            f"{val_metrics['specificity']:.4f} | "

            f"AUC: "
            f"{val_metrics['auc']:.4f}"
        )


        if (
            patience_counter
            >=
            EARLY_STOPPING_PATIENCE
        ):

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
    # FINAL EVALUATION
    # ========================================================

    final_metrics = (
        evaluate_image_graph_model(

            model,

            val_loader,

            criterion
        )
    )


    # ========================================================
    # SAVE MODEL
    # ========================================================

    model_path = os.path.join(

        MODEL_DIR,

        f"image_graph_fold_{fold}.pth"
    )


    torch.save(

        {

            "model_state_dict":
                model.state_dict(),

            "task":
                "referable_dr",

            "graph_features":
                GRAPH_FEATURES,

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

        f"graph_scaler_fold_{fold}.json"
    )


    with open(

        scaler_path,

        "w"
    ) as file:

        json.dump(

            {

                "features":
                    GRAPH_FEATURES,

                "mean":
                    scaler.mean_.tolist(),

                "scale":
                    scaler.scale_.tolist()

            },

            file,

            indent=2
        )


    # ========================================================
    # SAVE HISTORY
    # ========================================================

    history_path = os.path.join(

        RESULT_DIR,

        f"image_graph_fold_{fold}_history.json"
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

        "experiment":
            "image_graph",

        "fold":
            fold,

        **{
            key: final_metrics[key]

            for key in [

                "accuracy",

                "balanced_accuracy",

                "macro_f1",

                "sensitivity",

                "specificity",

                "auc"
            ]
        },

        "confusion_matrix":
            final_metrics[
                "confusion_matrix"
            ]
    }


# ============================================================
# MAIN
# ============================================================

def main():


    # ========================================================
    # CLASS COUNTS
    # ========================================================

    labels = (
        df[
            "referable_dr"
        ]
        .values
    )


    counts = np.bincount(

        labels,

        minlength=2
    )


    print(
        "Binary class distribution:"
    )


    print(
        f"Non-referable (0-1): "
        f"{counts[0]}"
    )


    print(
        f"Referable (2-4): "
        f"{counts[1]}"
    )


    print()


    smallest_class = int(
        counts.min()
    )


    effective_splits = min(

        N_SPLITS,

        smallest_class
    )


    if effective_splits < 2:

        raise RuntimeError(
            "Not enough samples for "
            "stratified CV."
        )


    print(

        f"Using {effective_splits}-fold "
        "stratified cross-validation."
    )


    print()


    # ========================================================
    # SAME SPLITS FOR BOTH EXPERIMENTS
    # ========================================================

    skf = StratifiedKFold(

        n_splits=effective_splits,

        shuffle=True,

        random_state=SEED
    )


    image_results = []

    image_graph_results = []


    # ========================================================
    # CROSS VALIDATION
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


        print()
        print(
            "=" * 78
        )

        print(
            f"FOLD {fold}/{effective_splits}"
        )

        print(
            "=" * 78
        )


        train_df = (
            df.iloc[
                train_idx
            ].copy()
        )


        val_df = (
            df.iloc[
                val_idx
            ].copy()
        )


        # ----------------------------------------------------
        # IMAGE ONLY
        # ----------------------------------------------------

        result_image = (
            train_image_only(

                train_df,

                val_df,

                fold
            )
        )


        image_results.append(
            result_image
        )


        # ----------------------------------------------------
        # IMAGE + GRAPH
        # ----------------------------------------------------

        result_graph = (
            train_image_graph(

                train_df,

                val_df,

                fold
            )
        )


        image_graph_results.append(
            result_graph
        )


    # ========================================================
    # COMBINE RESULTS
    # ========================================================

    all_results = (

        image_results

        +

        image_graph_results
    )


    results_df = pd.DataFrame(
        all_results
    )


    fold_results_path = os.path.join(

        RESULT_DIR,

        "referable_fold_results.csv"
    )


    results_df.to_csv(

        fold_results_path,

        index=False
    )


    # ========================================================
    # AGGREGATE
    # ========================================================

    metrics = [

        "accuracy",

        "balanced_accuracy",

        "macro_f1",

        "sensitivity",

        "specificity",

        "auc"
    ]


    summary_rows = []


    for experiment in [

        "image",

        "image_graph"

    ]:


        subset = results_df[

            results_df[
                "experiment"
            ]
            ==
            experiment
        ]


        row = {

            "experiment":
                experiment,

            "folds":
                len(subset)
        }


        for metric in metrics:


            row[
                f"{metric}_mean"
            ] = float(

                subset[
                    metric
                ].mean()
            )


            row[
                f"{metric}_std"
            ] = float(

                subset[
                    metric
                ].std(
                    ddof=0
                )
            )


        summary_rows.append(
            row
        )


    summary_df = pd.DataFrame(
        summary_rows
    )


    summary_path = os.path.join(

        RESULT_DIR,

        "referable_baseline_summary.csv"
    )


    summary_df.to_csv(

        summary_path,

        index=False
    )


    # ========================================================
    # JSON REPORT
    # ========================================================

    report = {

        "project":
            "RETINA-FUSION 360",

        "experiment":
            "Referable DR Binary Baseline",

        "task":
            "Grade 0-1 vs Grade 2-4",

        "dataset":
            DATASET_PATH,

        "samples":
            len(df),

        "cross_validation_folds":
            effective_splits,

        "image_size":
            IMAGE_SIZE,

        "batch_size":
            BATCH_SIZE,

        "epochs":
            EPOCHS,

        "graph_features":
            GRAPH_FEATURES,

        "results":
            summary_rows,

        "notes": [

            "Referable DR is defined as grade >= 2.",

            "Both experiments use exactly the same stratified folds.",

            "Graph scaling is fitted only on the training fold.",

            "Image-only and image+graph models use the same image encoder architecture.",

            "LayerNorm is used for small-sample stability.",

            "Training uses drop_last=True.",

            "This experiment is a research/development baseline and is not clinical validation."
        ]
    }


    report_path = os.path.join(

        RESULT_DIR,

        "referable_baseline_report.json"
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
    # FINAL OUTPUT
    # ========================================================

    print()
    print(
        "=" * 78
    )

    print(
        "REFERABLE DR BASELINE COMPLETE"
    )

    print(
        "=" * 78
    )

    print()


    print(
        summary_df.to_string(
            index=False
        )
    )


    print()


    print(
        "Fold results:"
    )

    print(
        fold_results_path
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
        "✓ IMAGE-ONLY VS IMAGE+RETINAL-GRAPH COMPLETE"
    )

    print()


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()