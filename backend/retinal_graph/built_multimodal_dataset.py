import os
import re
import json
import csv
import math
import numpy as np
from collections import defaultdict


# ============================================================
# RETINA-FUSION 360
# GRAPH FEATURE EXTRACTION + MULTIMODAL DATASET BUILDER
#
# MODULE 1:
#   Retinal Graph JSON
#          ↓
#   Graph / vessel / lesion / topology features
#
# MODULE 2:
#   Graph features + IDRiD grading information
#          ↓
#   ML-ready multimodal dataset
#
# Output:
#
#   RETINAL_GRAPH_FEATURE_DATASET.csv
#   RETINA_FUSION_MULTIMODAL_DATASET.csv
#   feature_names.json
#   dataset_summary.json
#   dataset_summary.csv
#
# IMPORTANT:
# We NEVER invent disease labels.
# If the local IDRiD grading files cannot be parsed safely,
# the corresponding label remains unavailable and is reported.
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

GRAPH_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "retinal_graph_idrid_final",
    "graphs"
)

OUTPUT_ROOT = os.path.join(
    PROJECT_ROOT,
    "results",
    "retinal_graph_dataset"
)

os.makedirs(
    OUTPUT_ROOT,
    exist_ok=True
)


GRAPH_FEATURE_CSV = os.path.join(
    OUTPUT_ROOT,
    "RETINAL_GRAPH_FEATURE_DATASET.csv"
)

MULTIMODAL_CSV = os.path.join(
    OUTPUT_ROOT,
    "RETINA_FUSION_MULTIMODAL_DATASET.csv"
)

FEATURE_NAMES_JSON = os.path.join(
    OUTPUT_ROOT,
    "feature_names.json"
)

SUMMARY_JSON = os.path.join(
    OUTPUT_ROOT,
    "dataset_summary.json"
)

SUMMARY_CSV = os.path.join(
    OUTPUT_ROOT,
    "dataset_summary.csv"
)

GRADING_DEBUG_CSV = os.path.join(
    OUTPUT_ROOT,
    "grading_discovery.csv"
)


# ============================================================
# CONFIG
# ============================================================

IMAGE_AREA_NORMALIZATION = True

EPS = 1e-8


# ============================================================
# HEADER
# ============================================================

print()
print("=" * 78)
print("RETINA-FUSION 360")
print("GRAPH FEATURE EXTRACTION + MULTIMODAL DATASET BUILDER")
print("=" * 78)
print()


# ============================================================
# ID EXTRACTION
# ============================================================

def extract_image_id(value):

    if value is None:
        return None

    text = str(value)

    match = re.search(
        r"IDRiD[_\-](\d+)",
        text,
        re.IGNORECASE
    )

    if match:
        return f"{int(match.group(1)):02d}"

    match = re.search(
        r"(\d+)",
        text
    )

    if match:
        return f"{int(match.group(1)):02d}"

    return None


# ============================================================
# SAFE FLOAT
# ============================================================

def safe_float(
    value,
    default=0.0
):

    try:

        if value is None:
            return default

        if isinstance(
            value,
            str
        ):

            if value.strip() == "":
                return default

        number = float(value)

        if not np.isfinite(number):
            return default

        return number

    except:

        return default


# ============================================================
# SAFE INT
# ============================================================

def safe_int(
    value,
    default=0
):

    try:

        if value is None:
            return default

        return int(
            float(value)
        )

    except:

        return default


# ============================================================
# LOAD GRAPH FILES
# ============================================================

graph_files = {}

if not os.path.exists(
    GRAPH_DIR
):

    raise RuntimeError(
        "Graph directory does not exist:\n"
        f"{GRAPH_DIR}"
    )


for filename in os.listdir(
    GRAPH_DIR
):

    if not filename.lower().endswith(
        ".json"
    ):
        continue

    image_id = extract_image_id(
        filename
    )

    if image_id is not None:

        graph_files[
            image_id
        ] = os.path.join(
            GRAPH_DIR,
            filename
        )


print(
    f"Graph JSON files found: "
    f"{len(graph_files)}"
)

print()


if not graph_files:

    raise RuntimeError(
        "No retinal graph JSON files found."
    )


# ============================================================
# LOAD ONE GRAPH
# ============================================================

def load_graph(
    path
):

    with open(
        path,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(
            file
        )


# ============================================================
# FEATURE EXTRACTION
# ============================================================

def extract_features(
    graph
):

    features = {}

    nodes = graph.get(
        "nodes",
        []
    )

    edges = graph.get(
        "edges",
        []
    )

    graph_features = graph.get(
        "features",
        {}
    )

    image_id = graph.get(
        "image_id"
    )

    # --------------------------------------------------------
    # Basic graph information
    # --------------------------------------------------------

    features[
        "image_id"
    ] = image_id

    total_nodes = len(
        nodes
    )

    total_edges = len(
        edges
    )

    features[
        "graph_total_nodes"
    ] = total_nodes

    features[
        "graph_total_edges"
    ] = total_edges

    # --------------------------------------------------------
    # Image dimensions
    # --------------------------------------------------------

    width = safe_float(
        graph_features.get(
            "image_width",
            0
        )
    )

    height = safe_float(
        graph_features.get(
            "image_height",
            0
        )
    )

    features[
        "image_width"
    ] = width

    features[
        "image_height"
    ] = height

    image_area = (
        width * height
    )

    # --------------------------------------------------------
    # Node types
    # --------------------------------------------------------

    vessel_nodes = []

    lesion_nodes = []

    landmark_nodes = []

    for node in nodes:

        node_type = str(
            node.get(
                "node_type",
                ""
            )
        )

        if node_type.startswith(
            "vessel"
        ):

            vessel_nodes.append(
                node
            )

        elif node_type == "lesion":

            lesion_nodes.append(
                node
            )

        elif node_type == "landmark":

            landmark_nodes.append(
                node
            )

    # --------------------------------------------------------
    # Node counts
    # --------------------------------------------------------

    features[
        "vessel_node_count"
    ] = len(
        vessel_nodes
    )

    features[
        "lesion_node_count"
    ] = len(
        lesion_nodes
    )

    features[
        "landmark_node_count"
    ] = len(
        landmark_nodes
    )

    # --------------------------------------------------------
    # Vessel endpoint / junction counts
    # --------------------------------------------------------

    endpoint_count = 0
    junction_count = 0

    for node in vessel_nodes:

        degree_type = node.get(
            "degree_type",
            ""
        )

        if degree_type == "endpoint":

            endpoint_count += 1

        elif degree_type == "junction":

            junction_count += 1

    features[
        "vessel_endpoint_count"
    ] = endpoint_count

    features[
        "vessel_junction_count"
    ] = junction_count

    # --------------------------------------------------------
    # Endpoint / junction ratios
    # --------------------------------------------------------

    features[
        "junction_to_vessel_ratio"
    ] = (
        junction_count
        /
        max(
            len(vessel_nodes),
            1
        )
    )

    features[
        "endpoint_to_vessel_ratio"
    ] = (
        endpoint_count
        /
        max(
            len(vessel_nodes),
            1
        )
    )

    # --------------------------------------------------------
    # Vessel edges
    # --------------------------------------------------------

    vessel_edges = []

    spatial_edges = []

    edge_type_counts = defaultdict(
        int
    )

    for edge in edges:

        if (
            "source_index"
            in edge
        ):

            vessel_edges.append(
                edge
            )

        edge_type = edge.get(
            "edge_type"
        )

        if edge_type is not None:

            spatial_edges.append(
                edge
            )

            edge_type_counts[
                edge_type
            ] += 1

    features[
        "vessel_edge_count"
    ] = len(
        vessel_edges
    )

    features[
        "spatial_edge_count"
    ] = len(
        spatial_edges
    )

    # --------------------------------------------------------
    # Edge density / connectivity
    # --------------------------------------------------------

    features[
        "graph_edge_node_ratio"
    ] = (
        total_edges
        /
        max(
            total_nodes,
            1
        )
    )

    features[
        "vessel_edge_node_ratio"
    ] = (
        len(vessel_edges)
        /
        max(
            len(vessel_nodes),
            1
        )
    )

    # --------------------------------------------------------
    # Vessel edge lengths
    # --------------------------------------------------------

    lengths = []

    euclidean_lengths = []

    tortuosities = []

    for edge in vessel_edges:

        length = safe_float(
            edge.get(
                "length"
            )
        )

        euclidean = safe_float(
            edge.get(
                "euclidean_distance"
            )
        )

        tortuosity = safe_float(
            edge.get(
                "tortuosity"
            )
        )

        if length > 0:

            lengths.append(
                length
            )

        if euclidean > 0:

            euclidean_lengths.append(
                euclidean
            )

        if tortuosity > 0:

            tortuosities.append(
                tortuosity
            )

    # --------------------------------------------------------
    # Vessel length statistics
    # --------------------------------------------------------

    features[
        "vessel_edge_length_mean"
    ] = (
        np.mean(lengths)
        if lengths
        else 0.0
    )

    features[
        "vessel_edge_length_std"
    ] = (
        np.std(lengths)
        if lengths
        else 0.0
    )

    features[
        "vessel_edge_length_median"
    ] = (
        np.median(lengths)
        if lengths
        else 0.0
    )

    features[
        "vessel_edge_length_max"
    ] = (
        np.max(lengths)
        if lengths
        else 0.0
    )

    features[
        "total_vessel_length"
    ] = (
        np.sum(lengths)
        if lengths
        else 0.0
    )

    # --------------------------------------------------------
    # Euclidean statistics
    # --------------------------------------------------------

    features[
        "vessel_euclidean_mean"
    ] = (
        np.mean(
            euclidean_lengths
        )
        if euclidean_lengths
        else 0.0
    )

    features[
        "vessel_euclidean_std"
    ] = (
        np.std(
            euclidean_lengths
        )
        if euclidean_lengths
        else 0.0
    )

    # --------------------------------------------------------
    # Tortuosity
    # --------------------------------------------------------

    features[
        "mean_vessel_tortuosity"
    ] = (
        np.mean(
            tortuosities
        )
        if tortuosities
        else 0.0
    )

    features[
        "std_vessel_tortuosity"
    ] = (
        np.std(
            tortuosities
        )
        if tortuosities
        else 0.0
    )

    features[
        "max_vessel_tortuosity"
    ] = (
        np.max(
            tortuosities
        )
        if tortuosities
        else 0.0
    )

    # --------------------------------------------------------
    # Vessel density
    # --------------------------------------------------------

    features[
        "skeleton_vessel_density"
    ] = safe_float(
        graph_features.get(
            "skeleton_vessel_density",
            0
        )
    )

    features[
        "skeleton_pixels"
    ] = safe_int(
        graph_features.get(
            "skeleton_pixels",
            0
        )
    )

    # --------------------------------------------------------
    # Normalized vessel length
    # --------------------------------------------------------

    if image_area > 0:

        features[
            "normalized_total_vessel_length"
        ] = (
            features[
                "total_vessel_length"
            ]
            /
            math.sqrt(
                image_area
            )
        )

    else:

        features[
            "normalized_total_vessel_length"
        ] = 0.0

    # ========================================================
    # LESION FEATURES
    # ========================================================

    lesion_types = [
        "MA",
        "EX",
        "HE",
        "SE"
    ]

    lesion_counts = {
        lesion_type: 0
        for lesion_type in lesion_types
    }

    lesion_areas = {
        lesion_type: []
        for lesion_type in lesion_types
    }

    lesion_circularities = {
        lesion_type: []
        for lesion_type in lesion_types
    }

    lesion_aspect_ratios = {
        lesion_type: []
        for lesion_type in lesion_types
    }

    for lesion in lesion_nodes:

        lesion_type = str(
            lesion.get(
                "lesion_type",
                "UNKNOWN"
            )
        ).upper()

        if lesion_type not in lesion_counts:

            continue

        lesion_counts[
            lesion_type
        ] += 1

        area = safe_float(
            lesion.get(
                "area"
            )
        )

        circularity = safe_float(
            lesion.get(
                "circularity"
            )
        )

        aspect_ratio = safe_float(
            lesion.get(
                "aspect_ratio"
            )
        )

        if area > 0:

            lesion_areas[
                lesion_type
            ].append(
                area
            )

        if circularity > 0:

            lesion_circularities[
                lesion_type
            ].append(
                circularity
            )

        if aspect_ratio > 0:

            lesion_aspect_ratios[
                lesion_type
            ].append(
                aspect_ratio
            )

    # --------------------------------------------------------
    # Lesion counts
    # --------------------------------------------------------

    for lesion_type in lesion_types:

        features[
            f"{lesion_type}_count"
        ] = lesion_counts[
            lesion_type
        ]

    features[
        "total_detected_lesions"
    ] = sum(
        lesion_counts.values()
    )

    # --------------------------------------------------------
    # Lesion density
    # --------------------------------------------------------

    if image_area > 0:

        features[
            "lesion_density"
        ] = (
            features[
                "total_detected_lesions"
            ]
            /
            image_area
            *
            1_000_000
        )

    else:

        features[
            "lesion_density"
        ] = 0.0

    # --------------------------------------------------------
    # Lesion area statistics
    # --------------------------------------------------------

    for lesion_type in lesion_types:

        areas = lesion_areas[
            lesion_type
        ]

        circularities = lesion_circularities[
            lesion_type
        ]

        aspect_ratios = lesion_aspect_ratios[
            lesion_type
        ]

        features[
            f"{lesion_type}_area_mean"
        ] = (
            np.mean(areas)
            if areas
            else 0.0
        )

        features[
            f"{lesion_type}_area_std"
        ] = (
            np.std(areas)
            if areas
            else 0.0
        )

        features[
            f"{lesion_type}_area_total"
        ] = (
            np.sum(areas)
            if areas
            else 0.0
        )

        features[
            f"{lesion_type}_circularity_mean"
        ] = (
            np.mean(
                circularities
            )
            if circularities
            else 0.0
        )

        features[
            f"{lesion_type}_aspect_ratio_mean"
        ] = (
            np.mean(
                aspect_ratios
            )
            if aspect_ratios
            else 0.0
        )

    # ========================================================
    # SPATIAL RELATIONSHIP FEATURES
    # ========================================================

    features[
        "lesion_vessel_edge_count"
    ] = edge_type_counts[
        "lesion_vessel_proximity"
    ]

    features[
        "lesion_lesion_edge_count"
    ] = edge_type_counts[
        "lesion_spatial"
    ]

    features[
        "landmark_lesion_edge_count"
    ] = edge_type_counts[
        "landmark_lesion"
    ]

    features[
        "landmark_vessel_edge_count"
    ] = edge_type_counts[
        "landmark_vessel_proximity"
    ]

    # --------------------------------------------------------
    # Lesion-vessel association ratio
    # --------------------------------------------------------

    features[
        "lesion_vessel_association_ratio"
    ] = (
        features[
            "lesion_vessel_edge_count"
        ]
        /
        max(
            features[
                "total_detected_lesions"
            ],
            1
        )
    )

    # --------------------------------------------------------
    # Lesion clustering ratio
    # --------------------------------------------------------

    features[
        "lesion_clustering_ratio"
    ] = (
        features[
            "lesion_lesion_edge_count"
        ]
        /
        max(
            features[
                "total_detected_lesions"
            ],
            1
        )
    )

    # ========================================================
    # LANDMARK FEATURES
    # ========================================================

    optic_disc_present = 0
    fovea_present = 0

    optic_disc_x = 0.0
    optic_disc_y = 0.0

    fovea_x = 0.0
    fovea_y = 0.0

    for landmark in landmark_nodes:

        landmark_type = str(
            landmark.get(
                "landmark_type",
                ""
            )
        ).lower()

        if landmark_type == "optic_disc":

            optic_disc_present = 1

            optic_disc_x = safe_float(
                landmark.get(
                    "x"
                )
            )

            optic_disc_y = safe_float(
                landmark.get(
                    "y"
                )
            )

        elif landmark_type == "fovea":

            fovea_present = 1

            fovea_x = safe_float(
                landmark.get(
                    "x"
                )
            )

            fovea_y = safe_float(
                landmark.get(
                    "y"
                )
            )

    features[
        "optic_disc_present"
    ] = optic_disc_present

    features[
        "fovea_present"
    ] = fovea_present

    features[
        "optic_disc_x"
    ] = optic_disc_x

    features[
        "optic_disc_y"
    ] = optic_disc_y

    features[
        "fovea_x"
    ] = fovea_x

    features[
        "fovea_y"
    ] = fovea_y

    # --------------------------------------------------------
    # Normalized landmark locations
    # --------------------------------------------------------

    if width > 0:

        features[
            "optic_disc_x_normalized"
        ] = (
            optic_disc_x
            /
            width
        )

        features[
            "fovea_x_normalized"
        ] = (
            fovea_x
            /
            width
        )

    else:

        features[
            "optic_disc_x_normalized"
        ] = 0.0

        features[
            "fovea_x_normalized"
        ] = 0.0

    if height > 0:

        features[
            "optic_disc_y_normalized"
        ] = (
            optic_disc_y
            /
            height
        )

        features[
            "fovea_y_normalized"
        ] = (
            fovea_y
            /
            height
        )

    else:

        features[
            "optic_disc_y_normalized"
        ] = 0.0

        features[
            "fovea_y_normalized"
        ] = 0.0

    # ========================================================
    # LESION DISTRIBUTION RELATIVE TO OPTIC DISC
    # ========================================================

    if optic_disc_present:

        lesion_distances_od = []

        for lesion in lesion_nodes:

            dx = (
                lesion.get(
                    "x",
                    0
                )
                -
                optic_disc_x
            )

            dy = (
                lesion.get(
                    "y",
                    0
                )
                -
                optic_disc_y
            )

            lesion_distances_od.append(
                math.sqrt(
                    dx * dx
                    +
                    dy * dy
                )
            )

        if lesion_distances_od:

            features[
                "mean_lesion_distance_from_OD"
            ] = np.mean(
                lesion_distances_od
            )

            features[
                "std_lesion_distance_from_OD"
            ] = np.std(
                lesion_distances_od
            )

            features[
                "min_lesion_distance_from_OD"
            ] = np.min(
                lesion_distances_od
            )

        else:

            features[
                "mean_lesion_distance_from_OD"
            ] = 0.0

            features[
                "std_lesion_distance_from_OD"
            ] = 0.0

            features[
                "min_lesion_distance_from_OD"
            ] = 0.0

    else:

        features[
            "mean_lesion_distance_from_OD"
        ] = 0.0

        features[
            "std_lesion_distance_from_OD"
        ] = 0.0

        features[
            "min_lesion_distance_from_OD"
        ] = 0.0

    # ========================================================
    # LESION TYPE PROPORTIONS
    # ========================================================

    total_lesions = max(
        features[
            "total_detected_lesions"
        ],
        1
    )

    for lesion_type in lesion_types:

        features[
            f"{lesion_type}_proportion"
        ] = (
            lesion_counts[
                lesion_type
            ]
            /
            total_lesions
        )

    # ========================================================
    # GRAPH COMPLEXITY
    # ========================================================

    features[
        "graph_nodes_per_lesion"
    ] = (
        total_nodes
        /
        max(
            total_lesions,
            1
        )
    )

    features[
        "vessel_nodes_per_lesion"
    ] = (
        len(vessel_nodes)
        /
        max(
            total_lesions,
            1
        )
    )

    features[
        "edges_per_lesion"
    ] = (
        total_edges
        /
        max(
            total_lesions,
            1
        )
    )

    # ========================================================
    # COPY SOURCE GRAPH FEATURES
    # ========================================================

    features[
        "graph_reported_vessel_density"
    ] = safe_float(
        graph_features.get(
            "skeleton_vessel_density"
        )
    )

    # ========================================================
    # GRAPH QUALITY FLAGS
    # ========================================================

    features[
        "has_vessel_nodes"
    ] = int(
        len(vessel_nodes) > 0
    )

    features[
        "has_lesions"
    ] = int(
        len(lesion_nodes) > 0
    )

    features[
        "has_landmark"
    ] = int(
        len(landmark_nodes) > 0
    )

    return features


# ============================================================
# DISCOVER DISEASE GRADING FILES
# ============================================================

def discover_grading_files():

    files = []

    for root, dirs, filenames in os.walk(
        IDRID_ROOT
    ):

        for filename in filenames:

            lower = filename.lower()

            if not lower.endswith(
                (
                    ".csv",
                    ".xlsx",
                    ".xls",
                    ".txt"
                )
            ):
                continue

            full_path = os.path.join(
                root,
                filename
            )

            path_text = (
                full_path.lower()
            )

            if (
                "grading"
                in path_text
                or
                "grade"
                in path_text
                or
                "disease"
                in path_text
            ):

                files.append(
                    full_path
                )

    return sorted(
        set(files)
    )


grading_files = discover_grading_files()


print(
    "Potential IDRiD grading files:"
)

for path in grading_files:

    print(
        f"  {path}"
    )

print()


# ============================================================
# LOAD TABULAR FILE
# ============================================================

def load_tabular_file(
    path
):

    try:

        import pandas as pd

    except ImportError:

        print(
            "pandas is required."
        )

        return None

    try:

        lower = path.lower()

        if lower.endswith(
            ".csv"
        ):

            return pd.read_csv(
                path
            )

        if lower.endswith(
            ".txt"
        ):

            return pd.read_csv(
                path,
                sep=None,
                engine="python"
            )

        if lower.endswith(
            (
                ".xlsx",
                ".xls"
            )
        ):

            return pd.read_excel(
                path
            )

    except Exception as error:

        print(
            f"Could not read grading file:\n"
            f"{path}\n"
            f"Error: {error}"
        )

    return None


# ============================================================
# DISCOVER GRADING DATA
# ============================================================

def discover_grading_data():

    grading_records = {}

    debug_rows = []

    for path in grading_files:

        df = load_tabular_file(
            path
        )

        if df is None:
            continue

        if df.empty:
            continue

        columns = [
            str(column)
            for column in df.columns
        ]

        print(
            f"Grading file: "
            f"{os.path.basename(path)}"
        )

        print(
            f"Columns: {columns}"
        )

        # ----------------------------------------------------
        # Identify image ID column
        # ----------------------------------------------------

        id_column = None

        for column in columns:

            lower = column.lower()

            if (
                "image"
                in lower
                or
                "id"
                in lower
                or
                "name"
                in lower
            ):

                id_column = column

                break

        # ----------------------------------------------------
        # Identify DR grade column
        # ----------------------------------------------------

        dr_column = None

        for column in columns:

            lower = column.lower()

            if (
                "retinopathy"
                in lower
                or
                "dr"
                in lower
                or
                "grade"
                in lower
                or
                "disease"
                in lower
            ):

                dr_column = column

                break

        # ----------------------------------------------------
        # Identify DME column
        # ----------------------------------------------------

        dme_column = None

        for column in columns:

            lower = column.lower()

            if (
                "dme"
                in lower
                or
                "macular"
                in lower
                or
                "edema"
                in lower
            ):

                dme_column = column

                break

        debug_rows.append({

            "file":
                path,

            "rows":
                len(df),

            "id_column":
                id_column,

            "dr_column":
                dr_column,

            "dme_column":
                dme_column,

            "columns":
                "|".join(columns)
        })

        # ----------------------------------------------------
        # If no ID column, inspect rows using every field
        # ----------------------------------------------------

        if id_column is None:

            continue

        for _, row in df.iterrows():

            image_id = extract_image_id(
                row.get(
                    id_column
                )
            )

            if image_id is None:

                continue

            record = {}

            if dr_column is not None:

                record[
                    "dr_grade"
                ] = row.get(
                    dr_column
                )

            if dme_column is not None:

                record[
                    "dme_grade"
                ] = row.get(
                    dme_column
                )

            record[
                "grading_source"
            ] = path

            grading_records[
                image_id
            ] = record

    return (
        grading_records,
        debug_rows
    )


grading_records, grading_debug = (
    discover_grading_data()
)


# ============================================================
# SAVE GRADING DISCOVERY
# ============================================================

if grading_debug:

    with open(
        GRADING_DEBUG_CSV,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        fieldnames = [
            "file",
            "rows",
            "id_column",
            "dr_column",
            "dme_column",
            "columns"
        ]

        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames
        )

        writer.writeheader()

        writer.writerows(
            grading_debug
        )


print()

print(
    f"Grading records matched: "
    f"{len(grading_records)}"
)

print()


# ============================================================
# BUILD GRAPH FEATURE DATASET
# ============================================================

rows = []

failed_graphs = []

for index, image_id in enumerate(
    sorted(
        graph_files.keys()
    ),
    1
):

    path = graph_files[
        image_id
    ]

    print(
        f"[{index:02d}/{len(graph_files)}] "
        f"Extracting features: "
        f"IDRiD_{image_id}"
    )

    try:

        graph = load_graph(
            path
        )

        features = extract_features(
            graph
        )

        # ----------------------------------------------------
        # Add grading information
        # ----------------------------------------------------

        grading = grading_records.get(
            image_id,
            {}
        )

        dr_grade = grading.get(
            "dr_grade"
        )

        dme_grade = grading.get(
            "dme_grade"
        )

        # ----------------------------------------------------
        # Keep labels separate
        # ----------------------------------------------------

        features[
            "dr_grade"
        ] = dr_grade

        features[
            "dme_grade"
        ] = dme_grade

        features[
            "grading_available"
        ] = int(
            dr_grade is not None
        )

        features[
            "dme_available"
        ] = int(
            dme_grade is not None
        )

        features[
            "grading_source"
        ] = grading.get(
            "grading_source",
            ""
        )

        features[
            "graph_source"
        ] = path

        rows.append(
            features
        )

    except Exception as error:

        failed_graphs.append({

            "image_id":
                image_id,

            "error":
                str(error)
        })


# ============================================================
# CHECK
# ============================================================

if not rows:

    raise RuntimeError(
        "No graph features were extracted."
    )


# ============================================================
# DATAFRAME
# ============================================================

try:

    import pandas as pd

except ImportError:

    raise RuntimeError(
        "pandas is required.\n"
        "Install with:\n"
        "pip install pandas"
    )


df = pd.DataFrame(
    rows
)


# ============================================================
# REORDER COLUMNS
# ============================================================

priority_columns = [

    "image_id",

    "dr_grade",
    "dme_grade",

    "grading_available",
    "dme_available",

    "graph_total_nodes",
    "graph_total_edges",

    "vessel_node_count",
    "vessel_edge_count",

    "lesion_node_count",
    "landmark_node_count",

    "vessel_endpoint_count",
    "vessel_junction_count",

    "skeleton_vessel_density",

    "mean_vessel_tortuosity",

    "total_vessel_length",

    "MA_count",
    "EX_count",
    "HE_count",
    "SE_count",

    "lesion_vessel_edge_count",
    "lesion_lesion_edge_count",

    "optic_disc_present",
    "fovea_present"
]


existing_priority = [
    column
    for column in priority_columns
    if column in df.columns
]

remaining_columns = [
    column
    for column in df.columns
    if column not in existing_priority
]

df = df[
    existing_priority
    +
    remaining_columns
]


# ============================================================
# SAVE GRAPH FEATURE DATASET
# ============================================================

df.to_csv(
    GRAPH_FEATURE_CSV,
    index=False
)


# ============================================================
# BUILD MULTIMODAL DATASET
#
# The graph features themselves are the multimodal structured
# branch:
#
#   vessel + lesion + landmark + topology
#
# We preserve labels separately and DO NOT manufacture image
# embeddings at this stage.
# ============================================================

multimodal_df = df.copy()


# ------------------------------------------------------------
# Add explicit modality availability flags
# ------------------------------------------------------------

multimodal_df[
    "vessel_modality_available"
] = (
    multimodal_df[
        "vessel_node_count"
    ]
    >
    0
).astype(
    int
)

multimodal_df[
    "lesion_modality_available"
] = (
    multimodal_df[
        "lesion_node_count"
    ]
    >
    0
).astype(
    int
)

multimodal_df[
    "landmark_modality_available"
] = (
    multimodal_df[
        "landmark_node_count"
    ]
    >
    0
).astype(
    int
)


# ------------------------------------------------------------
# Structured multimodal completeness
# ------------------------------------------------------------

multimodal_df[
    "structured_modality_count"
] = (
    multimodal_df[
        [
            "vessel_modality_available",
            "lesion_modality_available",
            "landmark_modality_available"
        ]
    ].sum(
        axis=1
    )
)


# ------------------------------------------------------------
# Referable DR label
#
# Only create it when DR grade exists.
# Referable threshold = grade >= 2.
# ------------------------------------------------------------

def make_referable(
    value
):

    try:

        if pd.isna(
            value
        ):

            return np.nan

        grade = float(
            value
        )

        return int(
            grade >= 2
        )

    except:

        return np.nan


multimodal_df[
    "referable_dr"
] = multimodal_df[
    "dr_grade"
].apply(
    make_referable
)


# ============================================================
# SAVE MULTIMODAL DATASET
# ============================================================

multimodal_df.to_csv(
    MULTIMODAL_CSV,
    index=False
)


# ============================================================
# FEATURE NAME FILE
# ============================================================

non_feature_columns = {

    "image_id",
    "dr_grade",
    "dme_grade",
    "grading_available",
    "dme_available",
    "grading_source",
    "graph_source"
}


feature_columns = [

    column
    for column in multimodal_df.columns
    if column not in non_feature_columns
]


feature_description = {

    "image_id":
        "IDRiD image identifier",

    "vessel_node_count":
        "Number of vessel graph nodes",

    "vessel_edge_count":
        "Number of vessel graph edges",

    "vessel_endpoint_count":
        "Number of vessel endpoints",

    "vessel_junction_count":
        "Number of vessel junctions",

    "skeleton_vessel_density":
        "Fraction of image represented by vessel skeleton",

    "mean_vessel_tortuosity":
        "Mean vessel-edge tortuosity",

    "total_vessel_length":
        "Total traced vessel-edge length",

    "MA_count":
        "Detected microaneurysm objects",

    "EX_count":
        "Detected exudate objects",

    "HE_count":
        "Detected hemorrhage objects",

    "SE_count":
        "Detected soft-exudate objects",

    "lesion_vessel_edge_count":
        "Number of lesion-vessel spatial relationships",

    "lesion_lesion_edge_count":
        "Number of lesion-lesion spatial relationships",

    "landmark_lesion_edge_count":
        "Number of landmark-lesion relationships",

    "landmark_vessel_edge_count":
        "Number of landmark-vessel relationships",

    "optic_disc_present":
        "Whether optic-disc landmark is available",

    "fovea_present":
        "Whether fovea landmark is available"
}


with open(
    FEATURE_NAMES_JSON,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        {
            "feature_count":
                len(feature_columns),

            "feature_columns":
                feature_columns,

            "descriptions":
                feature_description
        },
        file,
        indent=2
    )


# ============================================================
# DATASET SUMMARY
# ============================================================

summary = {

    "project":
        "RETINA-FUSION 360",

    "module":
        "Graph Feature Extraction + Multimodal Dataset Builder",

    "graph_files":
        len(graph_files),

    "rows_created":
        len(df),

    "failed_graphs":
        failed_graphs,

    "feature_count":
        len(feature_columns),

    "graph_feature_dataset":
        GRAPH_FEATURE_CSV,

    "multimodal_dataset":
        MULTIMODAL_CSV,

    "feature_names":
        FEATURE_NAMES_JSON,

    "grading_files_discovered":
        len(grading_files),

    "grading_records_matched":
        len(grading_records),

    "images_with_dr_grade":
        int(
            multimodal_df[
                "grading_available"
            ].sum()
        ),

    "images_without_dr_grade":
        int(
            (
                multimodal_df[
                    "grading_available"
                ]
                ==
                0
            ).sum()
        ),

    "images_with_dme_grade":
        int(
            multimodal_df[
                "dme_available"
            ].sum()
        ),

    "images_with_optic_disc":
        int(
            multimodal_df[
                "optic_disc_present"
            ].sum()
        ),

    "images_with_fovea":
        int(
            multimodal_df[
                "fovea_present"
            ].sum()
        ),

    "average_graph_nodes":
        float(
            multimodal_df[
                "graph_total_nodes"
            ].mean()
        ),

    "average_graph_edges":
        float(
            multimodal_df[
                "graph_total_edges"
            ].mean()
        ),

    "average_lesions":
        float(
            multimodal_df[
                "total_detected_lesions"
            ].mean()
        ),

    "average_vessel_density":
        float(
            multimodal_df[
                "skeleton_vessel_density"
            ].mean()
        )
}


with open(
    SUMMARY_JSON,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        summary,
        file,
        indent=2
    )


# ============================================================
# SUMMARY CSV
# ============================================================

summary_rows = [

    {
        "metric":
            "Graph files",

        "value":
            len(graph_files)
    },

    {
        "metric":
            "Rows created",

        "value":
            len(df)
    },

    {
        "metric":
            "Feature count",

        "value":
            len(feature_columns)
    },

    {
        "metric":
            "Grading records matched",

        "value":
            len(grading_records)
    },

    {
        "metric":
            "Images with DR grade",

        "value":
            summary[
                "images_with_dr_grade"
            ]
    },

    {
        "metric":
            "Images with DME grade",

        "value":
            summary[
                "images_with_dme_grade"
            ]
    },

    {
        "metric":
            "Images with optic disc",

        "value":
            summary[
                "images_with_optic_disc"
            ]
    },

    {
        "metric":
            "Images with fovea",

        "value":
            summary[
                "images_with_fovea"
            ]
    },

    {
        "metric":
            "Average graph nodes",

        "value":
            summary[
                "average_graph_nodes"
            ]
    },

    {
        "metric":
            "Average graph edges",

        "value":
            summary[
                "average_graph_edges"
            ]
    },

    {
        "metric":
            "Average lesions",

        "value":
            summary[
                "average_lesions"
            ]
    },

    {
        "metric":
            "Average vessel density",

        "value":
            summary[
                "average_vessel_density"
            ]
    }
]


pd.DataFrame(
    summary_rows
).to_csv(
    SUMMARY_CSV,
    index=False
)


# ============================================================
# PRINT DATASET INFORMATION
# ============================================================

print()
print("=" * 78)
print("DATASET BUILD COMPLETE")
print("=" * 78)
print()

print(
    f"Graph files: "
    f"{len(graph_files)}"
)

print(
    f"Rows created: "
    f"{len(df)}"
)

print(
    f"Feature count: "
    f"{len(feature_columns)}"
)

print()

print(
    f"Grading records matched: "
    f"{len(grading_records)}"
)

print(
    f"Images with DR grade: "
    f"{summary['images_with_dr_grade']}"
)

print(
    f"Images with DME grade: "
    f"{summary['images_with_dme_grade']}"
)

print()

print(
    f"Images with optic disc: "
    f"{summary['images_with_optic_disc']}"
)

print(
    f"Images with fovea: "
    f"{summary['images_with_fovea']}"
)

print()

print(
    f"Average graph nodes: "
    f"{summary['average_graph_nodes']:.2f}"
)

print(
    f"Average graph edges: "
    f"{summary['average_graph_edges']:.2f}"
)

print(
    f"Average lesions: "
    f"{summary['average_lesions']:.2f}"
)

print(
    f"Average vessel density: "
    f"{summary['average_vessel_density']:.6f}"
)

print()

print(
    "Graph feature dataset:"
)

print(
    GRAPH_FEATURE_CSV
)

print()

print(
    "Multimodal dataset:"
)

print(
    MULTIMODAL_CSV
)

print()

print(
    "Feature definitions:"
)

print(
    FEATURE_NAMES_JSON
)

print()

print(
    "Summary:"
)

print(
    SUMMARY_JSON
)

print()

if failed_graphs:

    print(
        "Failed graphs:"
    )

    for item in failed_graphs:

        print(
            f"  IDRiD_{item['image_id']}: "
            f"{item['error']}"
        )

else:

    print(
        "✓ ALL GRAPH FILES PROCESSED"
    )

print()

print("=" * 78)
print("NEXT MODULE: MULTIMODAL FUSION MODEL + ABLATION")
print("=" * 78)
print()


# ============================================================
# END
# ============================================================