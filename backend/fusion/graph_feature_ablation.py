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
# GRAPH FEATURE ABLATION
#
# TASK:
#   Grade 0,1 -> Non-referable
#   Grade 2,3,4 -> Referable
#
# EXPERIMENTS:
#
#   1. IMAGE
#   2. IMAGE + TOPOLOGY
#   3. IMAGE + MORPHOLOGY
#   4. IMAGE + GEOMETRY
#   5. IMAGE + ALL GRAPH
#
# SAME 5 FOLDS FOR EVERY EXPERIMENT
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
    "graph_feature_ablation"
)

RESULT_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "graph_feature_ablation"
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

EPOCHS = 20

LEARNING_RATE = 1e-4

WEIGHT_DECAY = 1e-4

N_SPLITS = 5

EARLY_STOPPING_PATIENCE = 5

NUM_CLASSES = 2

DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


# ============================================================
# REPRODUCIBILITY
# ============================================================

def seed_everything(seed=42):

    random.seed(seed)

    np.random.seed(seed)

    torch.manual_seed(seed)

    if torch.cuda.is_available():

        torch.cuda.manual_seed_all(seed)


seed_everything(SEED)


# ============================================================
# GRAPH FEATURE GROUPS
# ============================================================

# ------------------------------------------------------------
# TOPOLOGY
# ------------------------------------------------------------

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


# ------------------------------------------------------------
# VASCULAR MORPHOLOGY
# ------------------------------------------------------------

MORPHOLOGY_FEATURES = [

    "vessel_node_count",

    "vessel_edge_count",

    "vessel_endpoint_count",

    "vessel_junction_count",

    "junction_to_vessel_ratio",

    "endpoint_to_vessel_ratio",

    "vessel_edge_length_mean",

    "vessel_edge_length_std",

    "total_vessel_length",

    "vessel_euclidean_mean",

    "skeleton_vessel_density",

    "skeleton_pixels",

    "normalized_total_vessel_length"
]


# ------------------------------------------------------------
# GEOMETRY / TORTUOSITY
# ------------------------------------------------------------

GEOMETRY_FEATURES = [

    "vessel_edge_length_mean",

    "vessel_edge_length_std",

    "vessel_edge_length_median",

    "vessel_edge_length_max",

    "vessel_euclidean_mean",

    "vessel_euclidean_std",

    "mean_vessel_tortuosity",

    "std_vessel_tortuosity",

    "max_vessel_tortuosity"
]


# ------------------------------------------------------------
# ALL GRAPH FEATURES
# ------------------------------------------------------------

ALL_GRAPH_FEATURES = [

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


# ============================================================
# EXPERIMENT CONFIGURATION
# ============================================================

EXPERIMENTS = {

    "image": [],

    "image_topology":
        TOPOLOGY_FEATURES,

    "image_morphology":
        MORPHOLOGY_FEATURES,

    "image_geometry":
        GEOMETRY_FEATURES,

    "image_all_graph":
        ALL_GRAPH_FEATURES
}


# ============================================================
# LOAD DATASET
# ============================================================

print()
print("=" * 78)
print("RETINA-FUSION 360")
print("RETINAL GRAPH FEATURE ABLATION")
print("=" * 78)
print()

print(
    f"Device: {DEVICE}"
)

print(
    f"Dataset: {DATASET_PATH}"
)

print()


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
        "Column 'dr_grade' not found."
    )


df[
    "dr_grade_numeric"
] = pd.to_numeric(
    df["dr_grade"],
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
# REFERABLE DR
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
# FIND IDRiD IMAGES
# ============================================================

def extract_id(value):

    text = str(value)

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
    "IDRiD image directory:"
)

print(
    ORIGINAL_DIR
)

print()


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


print(
    f"Images found: "
    f"{len(image_lookup)}"
)

print()


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
    f"Usable samples: "
    f"{len(df)}"
)

print()


# ============================================================
# VALIDATE GRAPH FEATURES
# ============================================================

all_requested_features = set(
    ALL_GRAPH_FEATURES
)


missing_features = [

    feature

    for feature
    in all_requested_features

    if feature not in df.columns
]


if missing_features:

    print(
        "WARNING: Missing graph features:"
    )

    for feature in missing_features:

        print(
            f"  - {feature}"
        )

    print()


# Keep only features actually available.

for name in EXPERIMENTS:

    EXPERIMENTS[name] = [

        feature

        for feature
        in EXPERIMENTS[name]

        if feature in df.columns
    ]


# ============================================================
# CLEAN GRAPH DATA
# ============================================================

for feature in ALL_GRAPH_FEATURES:

    if feature not in df.columns:

        continue

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

class RetinaDataset(
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

        if graph_features:

            self.graph_values = (

                self.df[
                    graph_features
                ]
                .values
                .astype(
                    np.float32
                )
            )

        else:

            self.graph_values = np.zeros(
                (
                    len(self.df),
                    1
                ),
                dtype=np.float32
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
        # Transfer APTOS weights
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
                    "✓ APTOS image "
                    "weights loaded"
                )


            except Exception as error:

                print(
                    "WARNING: Could not "
                    "load APTOS weights."
                )

                print(
                    error
                )

        else:

            print(
                "WARNING: APTOS checkpoint "
                "not found."
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
# MODEL
# ============================================================

class AblationModel(
    nn.Module
):

    def __init__(
        self,
        graph_dim
    ):

        super().__init__()


        # ----------------------------------------------------
        # IMAGE BRANCH
        # ----------------------------------------------------

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


        # ----------------------------------------------------
        # GRAPH BRANCH
        # ----------------------------------------------------

        self.use_graph = (
            graph_dim > 0
        )


        if self.use_graph:

            self.graph_encoder = nn.Sequential(

                nn.Linear(
                    graph_dim,
                    64
                ),

                nn.ReLU(),

                nn.LayerNorm(
                    64
                ),

                nn.Dropout(
                    0.20
                ),

                nn.Linear(
                    64,
                    64
                ),

                nn.ReLU(),

                nn.LayerNorm(
                    64
                )
            )


            graph_output_dim = 64

        else:

            graph_output_dim = 0


        # ----------------------------------------------------
        # CLASSIFIER
        # ----------------------------------------------------

        self.classifier = nn.Sequential(

            nn.Linear(
                256 + graph_output_dim,
                128
            ),

            nn.ReLU(),

            nn.Dropout(
                0.30
            ),

            nn.Linear(
                128,
                2
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


        if self.use_graph:

            graph_features = (
                self.graph_encoder(
                    graph
                )
            )


            fused = torch.cat(

                [
                    image_features,
                    graph_features
                ],

                dim=1
            )

        else:

            fused = (
                image_features
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

def compute_metrics(

    y_true,

    y_pred,

    y_prob
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

            y_prob
        )

    except Exception:

        auc = 0.0


    return {

        "accuracy":
            float(accuracy),

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
            float(auc),

        "confusion_matrix":
            cm.tolist()
    }


# ============================================================
# EVALUATION
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
                labels.cpu().numpy()
            )


            y_pred.extend(
                predictions.cpu().numpy()
            )


            y_prob.extend(

                probabilities[
                    :,
                    1
                ]
                .cpu()
                .numpy()
            )


    metrics = compute_metrics(

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
# TRAIN ONE EXPERIMENT / ONE FOLD
# ============================================================

def train_fold(

    train_df,

    val_df,

    feature_list,

    experiment_name,

    fold
):


    print()
    print(
        "-" * 78
    )

    print(
        f"{experiment_name.upper()} | FOLD {fold}"
    )

    print(
        "-" * 78
    )


    # ========================================================
    # STANDARDIZE GRAPH FEATURES
    #
    # IMPORTANT:
    # scaler is fitted ONLY on training data.
    # ========================================================

    train_data = (
        train_df.copy()
    )

    val_data = (
        val_df.copy()
    )


    if feature_list:

        scaler = StandardScaler()


        train_values = (

            train_data[
                feature_list
            ]
            .values
        )


        val_values = (

            val_data[
                feature_list
            ]
            .values
        )


        train_scaled = (
            scaler.fit_transform(
                train_values
            )
        )


        val_scaled = (
            scaler.transform(
                val_values
            )
        )


        train_data[
            feature_list
        ] = train_scaled


        val_data[
            feature_list
        ] = val_scaled


    # ========================================================
    # DATA
    # ========================================================

    train_dataset = RetinaDataset(

        train_data,

        feature_list,

        train_transform
    )


    val_dataset = RetinaDataset(

        val_data,

        feature_list,

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

    model = AblationModel(

        graph_dim=len(
            feature_list
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
    # TRAINING
    # ========================================================

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

            "train_loss":
                train_loss,

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

            f"Train: "
            f"{train_accuracy:.3f} | "

            f"Bal: "
            f"{val_metrics['balanced_accuracy']:.3f} | "

            f"Sens: "
            f"{val_metrics['sensitivity']:.3f} | "

            f"Spec: "
            f"{val_metrics['specificity']:.3f} | "

            f"AUC: "
            f"{val_metrics['auc']:.3f}"
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
    # RESTORE BEST MODEL
    # ========================================================

    if best_state is not None:

        model.load_state_dict(
            best_state
        )


    # ========================================================
    # FINAL FOLD EVALUATION
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

        f"{experiment_name}_fold_{fold}.pth"
    )


    torch.save(

        {

            "model_state_dict":
                model.state_dict(),

            "experiment":
                experiment_name,

            "fold":
                fold,

            "features":
                feature_list,

            "task":
                "referable_dr",

            "seed":
                SEED
        },

        model_path
    )


    # ========================================================
    # SAVE SCALER
    # ========================================================

    if feature_list:

        scaler_path = os.path.join(

            MODEL_DIR,

            f"{experiment_name}_fold_{fold}_scaler.json"
        )


        with open(

            scaler_path,

            "w"
        ) as file:

            json.dump(

                {

                    "features":
                        feature_list,

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

        f"{experiment_name}_fold_{fold}_history.json"
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
            experiment_name,

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


    print(
        "Experiments:"
    )

    for name, features in (
        EXPERIMENTS.items()
    ):

        print(
            f"\n{name}: "
            f"{len(features)} features"
        )

        if features:

            for feature in features:

                print(
                    f"   {feature}"
                )

    print()


    # ========================================================
    # LABELS
    # ========================================================

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
        "Class counts:"
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


    # ========================================================
    # STRATIFIED CV
    # ========================================================

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


    # ========================================================
    # CREATE EXACT SAME FOLDS
    # ========================================================

    folds = list(

        skf.split(
            df,
            labels
        )
    )


    print(
        f"Using {n_splits}-fold "
        "stratified cross-validation."
    )

    print()


    # ========================================================
    # RESULTS
    # ========================================================

    all_results = []


    # ========================================================
    # RUN EVERY EXPERIMENT
    # ========================================================

    for experiment_name, feature_list in (
        EXPERIMENTS.items()
    ):


        print()
        print(
            "#" * 78
        )

        print(
            f"EXPERIMENT: "
            f"{experiment_name}"
        )

        print(
            "#" * 78
        )


        for fold_number, (

            train_idx,

            val_idx

        ) in enumerate(

            folds,

            1
        ):


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


            result = train_fold(

                train_df,

                val_df,

                feature_list,

                experiment_name,

                fold_number
            )


            all_results.append(
                result
            )


    # ========================================================
    # SAVE FOLD RESULTS
    # ========================================================

    results_df = pd.DataFrame(
        all_results
    )


    fold_results_path = os.path.join(

        RESULT_DIR,

        "graph_feature_ablation_folds.csv"
    )


    results_df.to_csv(

        fold_results_path,

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


    summary_rows = []


    for experiment_name in (
        EXPERIMENTS.keys()
    ):


        subset = results_df[

            results_df[
                "experiment"
            ]
            ==
            experiment_name
        ]


        row = {

            "experiment":
                experiment_name,

            "folds":
                len(subset)
        }


        for metric in metric_names:

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

        "graph_feature_ablation_summary.csv"
    )


    summary_df.to_csv(

        summary_path,

        index=False
    )


    # ========================================================
    # FEATURE GROUP REPORT
    # ========================================================

    feature_report = {

        name: {

            "feature_count":
                len(features),

            "features":
                features

        }

        for name, features
        in EXPERIMENTS.items()
    }


    feature_report_path = os.path.join(

        RESULT_DIR,

        "feature_groups.json"
    )


    with open(

        feature_report_path,

        "w"
    ) as file:

        json.dump(

            feature_report,

            file,

            indent=2
        )


    # ========================================================
    # FINAL REPORT
    # ========================================================

    report = {

        "project":
            "RETINA-FUSION 360",

        "experiment":
            "Retinal Graph Feature Ablation",

        "task":
            "Referable DR: grade 0-1 vs grade 2-4",

        "dataset":
            DATASET_PATH,

        "samples":
            len(df),

        "cross_validation":
            f"{n_splits}-fold stratified",

        "same_folds_for_all_experiments":
            True,

        "experiments":
            feature_report,

        "results":
            summary_rows,

        "interpretation_note":
            "This is a development research experiment on the small IDRiD dataset and should not be interpreted as clinical validation."
    }


    report_path = os.path.join(

        RESULT_DIR,

        "graph_feature_ablation_report.json"
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
    # PRINT FINAL TABLE
    # ========================================================

    print()
    print()
    print(
        "=" * 110
    )

    print(
        "RETINAL GRAPH FEATURE ABLATION COMPLETE"
    )

    print(
        "=" * 110
    )

    print()


    display_columns = [

        "experiment",

        "accuracy_mean",

        "balanced_accuracy_mean",

        "macro_f1_mean",

        "sensitivity_mean",

        "specificity_mean",

        "auc_mean"
    ]


    print(

        summary_df[
            display_columns
        ].to_string(
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
        "Feature groups:"
    )

    print(
        feature_report_path
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
        "✓ GRAPH FEATURE ABLATION FINISHED"
    )

    print()


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    main()