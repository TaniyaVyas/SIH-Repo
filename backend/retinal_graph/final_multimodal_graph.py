import os
import json
import math
import cv2
import numpy as np
import pandas as pd

from collections import defaultdict


# ============================================================
# RETINA-FUSION 360
# FINAL MULTIMODAL RETINAL GRAPH BUILDER
#
# Components:
#
#   1. Vessel topology
#   2. Lesion nodes
#   3. Anatomical landmarks
#   4. Lesion spatial features
#   5. Lesion-vessel relationships
#   6. Lesion-lesion relationships
#
# IMPORTANT:
# DRIVE and IDRiD are different datasets.
# This script does NOT falsely match DRIVE image IDs to IDRiD IDs.
#
# The output is a graph-ready representation for research.
# ============================================================


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = r"D:\RETINA-FUSION-360"

IDRID_ROOT = os.path.join(
    PROJECT_ROOT,
    "datasets",
    "IDrid"
)

LESION_JSON_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "lesion_segmentation_final",
    "lesion_json"
)

LESION_MASK_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "lesion_segmentation_final",
    "predicted_masks"
)

VESSEL_GRAPH_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "retinal_graph_final",
    "graphs"
)

OUTPUT_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "retinal_graph_multimodal"
)

GRAPH_DIR = os.path.join(
    OUTPUT_DIR,
    "graphs"
)

VIS_DIR = os.path.join(
    OUTPUT_DIR,
    "visualizations"
)

SUMMARY_DIR = os.path.join(
    OUTPUT_DIR,
    "summary"
)

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)

os.makedirs(
    GRAPH_DIR,
    exist_ok=True
)

os.makedirs(
    VIS_DIR,
    exist_ok=True
)

os.makedirs(
    SUMMARY_DIR,
    exist_ok=True
)


# ============================================================
# CONFIGURATION
# ============================================================

LESION_TYPES = [
    "MA",
    "EX",
    "HE",
    "SE"
]

RELATION_DISTANCE = 80.0

MAX_NEAREST_VESSELS = 3

MIN_COMPONENT_AREA = 3


# ============================================================
# UTILITY
# ============================================================

def safe_float(
    value
):

    try:

        value = float(
            value
        )

        if np.isfinite(
            value
        ):

            return value

    except Exception:

        pass

    return 0.0


def distance(
    x1,
    y1,
    x2,
    y2
):

    return math.sqrt(
        (x2 - x1) ** 2
        +
        (y2 - y1) ** 2
    )


# ============================================================
# FIND IDRiD LOCALIZATION FILES
# ============================================================

def find_files(
    root,
    extensions
):

    results = []

    if not os.path.exists(
        root
    ):

        return results

    for current_root, dirs, files in os.walk(
        root
    ):

        for filename in files:

            if filename.lower().endswith(
                extensions
            ):

                results.append(
                    os.path.join(
                        current_root,
                        filename
                    )
                )

    return sorted(
        results
    )


# ============================================================
# LOAD LESION JSON
# ============================================================

def load_lesion_results():

    print()
    print("=" * 70)
    print("LOADING IDRiD LESION GRAPHS")
    print("=" * 70)

    if not os.path.exists(
        LESION_JSON_DIR
    ):

        raise FileNotFoundError(
            f"Lesion JSON directory not found:\n"
            f"{LESION_JSON_DIR}"
        )

    files = sorted(
        [
            f
            for f in os.listdir(
                LESION_JSON_DIR
            )
            if f.lower().endswith(
                ".json"
            )
        ]
    )

    print(
        f"Lesion JSON files found: "
        f"{len(files)}"
    )

    if not files:

        raise RuntimeError(
            "No lesion JSON files found."
        )

    results = {}

    for filename in files:

        path = os.path.join(
            LESION_JSON_DIR,
            filename
        )

        try:

            with open(
                path,
                "r",
                encoding="utf-8"
            ) as file:

                data = json.load(
                    file
                )

            image_id = str(
                data.get(
                    "image_id",
                    os.path.splitext(
                        filename
                    )[0]
                )
            )

            results[
                image_id
            ] = data

        except Exception as error:

            print(
                f"WARNING: Could not load "
                f"{filename}: {error}"
            )

    return results


# ============================================================
# LOAD IDRiD ORIGINAL IMAGE
# ============================================================

def find_original_image(
    image_id
):

    original_dirs = []

    for current_root, dirs, files in os.walk(
        IDRID_ROOT
    ):

        for directory in dirs:

            if (
                directory.lower()
                ==
                "1. original images".lower()
            ):

                original_dirs.append(
                    os.path.join(
                        current_root,
                        directory
                    )
                )

    if not original_dirs:

        return None

    original_dir = original_dirs[0]

    candidates = [
        f
        for f in find_files(
            original_dir,
            (
                ".jpg",
                ".jpeg",
                ".png",
                ".tif",
                ".tiff"
            )
        )
        if image_id in os.path.basename(
            f
        )
    ]

    if candidates:

        return candidates[0]

    return None


# ============================================================
# LOAD VESSEL GRAPH SCHEMA
#
# IMPORTANT:
# DRIVE and IDRiD are not matched.
#
# We use the DRIVE graph to establish the vascular
# feature schema and report its availability separately.
# ============================================================

def load_vessel_graph_schema():

    print()
    print("=" * 70)
    print("CHECKING VESSEL GRAPH BRANCH")
    print("=" * 70)

    if not os.path.exists(
        VESSEL_GRAPH_DIR
    ):

        print(
            "WARNING: DRIVE vessel graph directory not found."
        )

        return None

    files = sorted(
        [
            f
            for f in os.listdir(
                VESSEL_GRAPH_DIR
            )
            if f.lower().endswith(
                ".json"
            )
        ]
    )

    print(
        f"DRIVE vessel graphs available: "
        f"{len(files)}"
    )

    if not files:

        return None

    sample_path = os.path.join(
        VESSEL_GRAPH_DIR,
        files[0]
    )

    try:

        with open(
            sample_path,
            "r",
            encoding="utf-8"
        ) as file:

            sample = json.load(
                file
            )

        features = sample.get(
            "features",
            {}
        )

        print(
            "✓ Vessel graph schema loaded"
        )

        print(
            "  Example vessel features:"
        )

        for key in [
            "vessel_density",
            "node_count",
            "edge_count",
            "endpoint_count",
            "junction_count",
            "mean_edge_length",
            "mean_tortuosity"
        ]:

            if key in features:

                print(
                    f"    {key}: "
                    f"{features[key]}"
                )

        return {
            "available": True,
            "sample_features": features
        }

    except Exception as error:

        print(
            f"WARNING: Could not read vessel graph: "
            f"{error}"
        )

        return None


# ============================================================
# LESION NODE NORMALIZATION
# ============================================================

def normalize_lesion_nodes(
    lesion_data
):

    nodes = []

    lesions = lesion_data.get(
        "lesions",
        []
    )

    for index, lesion in enumerate(
        lesions
    ):

        lesion_type = lesion.get(
            "type",
            "UNKNOWN"
        )

        if lesion_type not in LESION_TYPES:

            continue

        x = safe_float(
            lesion.get(
                "centroid_x",
                0
            )
        )

        y = safe_float(
            lesion.get(
                "centroid_y",
                0
            )
        )

        area = safe_float(
            lesion.get(
                "area_pixels",
                0
            )
        )

        nodes.append({

            "id":
                f"lesion_{index + 1}",

            "node_type":
                "lesion",

            "lesion_type":
                lesion_type,

            "x":
                x,

            "y":
                y,

            "area":
                area,

            "aspect_ratio":
                safe_float(
                    lesion.get(
                        "aspect_ratio",
                        0
                    )
                ),

            "circularity":
                safe_float(
                    lesion.get(
                        "circularity",
                        0
                    )
                ),

            "source":
                "IDRiD"
        })

    return nodes


# ============================================================
# LESION DENSITY
# ============================================================

def calculate_lesion_density(
    lesions,
    width,
    height
):

    area = max(
        width * height,
        1
    )

    counts = defaultdict(
        int
    )

    areas = defaultdict(
        float
    )

    for lesion in lesions:

        lesion_type = lesion[
            "lesion_type"
        ]

        counts[
            lesion_type
        ] += 1

        areas[
            lesion_type
        ] += lesion[
            "area"
        ]

    result = {}

    for lesion_type in LESION_TYPES:

        result[
            f"{lesion_type}_count"
        ] = int(
            counts[
                lesion_type
            ]
        )

        result[
            f"{lesion_type}_density"
        ] = float(
            counts[
                lesion_type
            ] /
            area
        )

        result[
            f"{lesion_type}_area_ratio"
        ] = float(
            areas[
                lesion_type
            ] /
            area
        )

    result[
        "total_lesions"
    ] = len(
        lesions
    )

    result[
        "total_lesion_density"
    ] = float(
        len(lesions)
        /
        area
    )

    return result


# ============================================================
# LESION-LESION RELATIONSHIPS
# ============================================================

def build_lesion_edges(
    lesions
):

    edges = []

    for i in range(
        len(lesions)
    ):

        a = lesions[i]

        for j in range(
            i + 1,
            len(lesions)
        ):

            b = lesions[j]

            d = distance(
                a["x"],
                a["y"],
                b["x"],
                b["y"]
            )

            if d <= RELATION_DISTANCE:

                edges.append({

                    "id":
                        f"lesion_edge_{len(edges)+1}",

                    "source":
                        a["id"],

                    "target":
                        b["id"],

                    "edge_type":
                        "lesion_lesion",

                    "distance":
                        float(d),

                    "source_lesion_type":
                        a["lesion_type"],

                    "target_lesion_type":
                        b["lesion_type"]
                })

    return edges


# ============================================================
# CREATE ANATOMICAL LANDMARKS
#
# The exact OD/fovea coordinate files can vary in packaging.
# Therefore we discover coordinate files and parse known
# IDRiD patterns when possible.
# ============================================================

def discover_localization_files():

    localization_dirs = []

    for current_root, dirs, files in os.walk(
        IDRID_ROOT
    ):

        for directory in dirs:

            if (
                directory.lower()
                ==
                "c. localization".lower()
            ):

                localization_dirs.append(
                    os.path.join(
                        current_root,
                        directory
                    )

                )

    if not localization_dirs:

        return []

    return find_files(
        localization_dirs[0],
        (
            ".csv",
            ".xlsx",
            ".xls",
            ".txt"
        )
    )


# ============================================================
# PARSE LANDMARK FILE
# ============================================================

def parse_landmarks(
    image_id
):

    files = discover_localization_files()

    landmarks = []

    # --------------------------------------------------------
    # Search CSV files
    # --------------------------------------------------------

    for path in files:

        if not path.lower().endswith(
            ".csv"
        ):

            continue

        try:

            df = pd.read_csv(
                path
            )

        except Exception:

            continue

        columns = [
            str(c).lower()
            for c in df.columns
        ]

        # ----------------------------------------------------
        # Identify image column
        # ----------------------------------------------------

        image_column = None

        for original, lower in zip(
            df.columns,
            columns
        ):

            if (
                "image" in lower
                or
                "idrid" in lower
            ):

                image_column = original

                break

        if image_column is None:

            continue

        rows = df[
            df[
                image_column
            ].astype(str).str.contains(
                image_id,
                case=False,
                na=False
            )
        ]

        if rows.empty:

            continue

        # ----------------------------------------------------
        # Search coordinate columns
        # ----------------------------------------------------

        x_column = None
        y_column = None

        for original, lower in zip(
            df.columns,
            columns
        ):

            if (
                lower in [
                    "x",
                    "x_coordinate",
                    "x coordinate",
                    "od_x",
                    "fovea_x"
                ]
            ):

                x_column = original

            if (
                lower in [
                    "y",
                    "y_coordinate",
                    "y coordinate",
                    "od_y",
                    "fovea_y"
                ]
            ):

                y_column = original

        if (
            x_column is None
            or
            y_column is None
        ):

            continue

        for _, row in rows.iterrows():

            try:

                x = float(
                    row[
                        x_column
                    ]
                )

                y = float(
                    row[
                        y_column
                    ]
                )

            except Exception:

                continue

            landmarks.append({

                "node_type":
                    "landmark",

                "landmark_type":
                    "unknown",

                "x":
                    x,

                "y":
                    y,

                "source":
                    "IDRiD_localization"
            })

    # --------------------------------------------------------
    # Deduplicate
    # --------------------------------------------------------

    unique = []

    seen = set()

    for landmark in landmarks:

        key = (
            round(
                landmark["x"],
                2
            ),
            round(
                landmark["y"],
                2
            ),
            landmark[
                "landmark_type"
            ]
        )

        if key not in seen:

            seen.add(
                key
            )

            unique.append(
                landmark
            )

    return unique


# ============================================================
# FALLBACK ANATOMICAL REFERENCE
#
# If explicit localization parsing isn't available,
# create only a geometric retinal center reference.
#
# This is explicitly marked as a reference point,
# NOT as a clinically identified fovea/optic disc.
# ============================================================

def create_reference_landmark(
    width,
    height
):

    return {

        "node_type":
            "reference",

        "landmark_type":
            "retinal_center_reference",

        "x":
            float(
                width / 2
            ),

        "y":
            float(
                height / 2
            ),

        "source":
            "geometric_reference"
    }


# ============================================================
# LANDMARK EDGES
# ============================================================

def build_landmark_edges(
    lesions,
    landmarks
):

    edges = []

    for lesion in lesions:

        for landmark_index, landmark in enumerate(
            landmarks
        ):

            d = distance(
                lesion["x"],
                lesion["y"],
                landmark["x"],
                landmark["y"]
            )

            if d <= RELATION_DISTANCE * 3:

                edges.append({

                    "id":
                        f"lesion_landmark_{len(edges)+1}",

                    "source":
                        lesion["id"],

                    "target":
                        f"landmark_{landmark_index+1}",

                    "edge_type":
                        "lesion_landmark",

                    "distance":
                        float(d),

                    "landmark_type":
                        landmark[
                            "landmark_type"
                        ]
                })

    return edges


# ============================================================
# CREATE LOCAL LESION FEATURES
# ============================================================

def calculate_local_lesion_features(
    lesions,
    landmarks,
    width,
    height
):

    for lesion in lesions:

        x = lesion["x"]

        y = lesion["y"]

        # ----------------------------------------------------
        # Normalized location
        # ----------------------------------------------------

        lesion[
            "normalized_x"
        ] = float(
            x /
            max(
                width,
                1
            )
        )

        lesion[
            "normalized_y"
        ] = float(
            y /
            max(
                height,
                1
            )
        )

        # ----------------------------------------------------
        # Distance from retinal center
        # ----------------------------------------------------

        center_x = width / 2.0

        center_y = height / 2.0

        lesion[
            "distance_from_retinal_center"
        ] = float(
            distance(
                x,
                y,
                center_x,
                center_y
            )
        )

        # ----------------------------------------------------
        # Nearest landmark
        # ----------------------------------------------------

        if landmarks:

            distances = [
                distance(
                    x,
                    y,
                    landmark["x"],
                    landmark["y"]
                )
                for landmark in landmarks
            ]

            nearest_index = int(
                np.argmin(
                    distances
                )
            )

            lesion[
                "nearest_landmark_distance"
            ] = float(
                distances[
                    nearest_index
                ]
            )

            lesion[
                "nearest_landmark_type"
            ] = landmarks[
                nearest_index
            ][
                "landmark_type"
            ]

        else:

            lesion[
                "nearest_landmark_distance"
            ] = 0.0

            lesion[
                "nearest_landmark_type"
            ] = "none"

    return lesions


# ============================================================
# CREATE GRAPH FEATURES
# ============================================================

def graph_features(
    lesions,
    lesion_edges,
    landmark_edges,
    width,
    height
):

    lesion_count = len(
        lesions
    )

    counts = {
        lesion: 0
        for lesion in LESION_TYPES
    }

    total_area = 0.0

    for lesion in lesions:

        lesion_type = lesion[
            "lesion_type"
        ]

        if lesion_type in counts:

            counts[
                lesion_type
            ] += 1

        total_area += lesion[
            "area"
        ]

    image_area = max(
        width * height,
        1
    )

    return {

        "image_width":
            int(width),

        "image_height":
            int(height),

        "total_lesion_nodes":
            int(lesion_count),

        "MA_nodes":
            int(
                counts["MA"]
            ),

        "EX_nodes":
            int(
                counts["EX"]
            ),

        "HE_nodes":
            int(
                counts["HE"]
            ),

        "SE_nodes":
            int(
                counts["SE"]
            ),

        "lesion_area_ratio":
            float(
                total_area /
                image_area
            ),

        "lesion_lesion_edges":
            int(
                len(
                    lesion_edges
                )
            ),

        "lesion_landmark_edges":
            int(
                len(
                    landmark_edges
                )
            ),

        "lesion_node_density":
            float(
                lesion_count /
                image_area
            )
    }


# ============================================================
# VISUALIZATION
# ============================================================

def create_visualization(
    image_path,
    lesions,
    landmarks,
    lesion_edges,
    landmark_edges,
    image_id
):

    image = cv2.imread(
        image_path
    )

    if image is None:

        return None

    # --------------------------------------------------------
    # Resize for manageable output
    # --------------------------------------------------------

    height, width = image.shape[:2]

    scale = min(
        1.0,
        1400.0 /
        max(
            width,
            height
        )
    )

    if scale < 1.0:

        image = cv2.resize(
            image,
            (
                int(width * scale),
                int(height * scale)
            ),
            interpolation=cv2.INTER_AREA
        )

    canvas = image.copy()

    new_height, new_width = canvas.shape[:2]

    sx = new_width / width

    sy = new_height / height

    # --------------------------------------------------------
    # Lesion-lesion edges
    # --------------------------------------------------------

    for edge in lesion_edges:

        source = next(
            (
                node
                for node in lesions
                if node["id"]
                ==
                edge["source"]
            ),
            None
        )

        target = next(
            (
                node
                for node in lesions
                if node["id"]
                ==
                edge["target"]
            ),
            None
        )

        if (
            source is None
            or
            target is None
        ):

            continue

        p1 = (
            int(
                source["x"] * sx
            ),
            int(
                source["y"] * sy
            )
        )

        p2 = (
            int(
                target["x"] * sx
            ),
            int(
                target["y"] * sy
            )
        )

        cv2.line(
            canvas,
            p1,
            p2,
            (255, 255, 0),
            1
        )

    # --------------------------------------------------------
    # Lesion nodes
    # --------------------------------------------------------

    for lesion in lesions:

        x = int(
            lesion["x"] * sx
        )

        y = int(
            lesion["y"] * sy
        )

        cv2.circle(
            canvas,
            (x, y),
            4,
            (0, 0, 255),
            -1
        )

    # --------------------------------------------------------
    # Landmark nodes
    # --------------------------------------------------------

    for index, landmark in enumerate(
        landmarks
    ):

        x = int(
            landmark["x"] * sx
        )

        y = int(
            landmark["y"] * sy
        )

        cv2.circle(
            canvas,
            (x, y),
            7,
            (0, 255, 0),
            2
        )

        cv2.putText(
            canvas,
            landmark[
                "landmark_type"
            ],
            (
                x + 8,
                y
            ),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.4,
            (0, 255, 0),
            1,
            cv2.LINE_AA
        )

    # --------------------------------------------------------
    # Header
    # --------------------------------------------------------

    cv2.rectangle(
        canvas,
        (0, 0),
        (
            new_width,
            45
        ),
        (0, 0, 0),
        -1
    )

    cv2.putText(
        canvas,
        "RETINA-FUSION 360 | MULTIMODAL RETINAL GRAPH",
        (10, 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.55,
        (255, 255, 255),
        1,
        cv2.LINE_AA
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    filename = (
        f"IDRiD_{image_id}_multimodal_graph.png"
    )

    path = os.path.join(
        VIS_DIR,
        filename
    )

    cv2.imwrite(
        path,
        canvas
    )

    return path


# ============================================================
# BUILD ONE MULTIMODAL GRAPH
# ============================================================

def build_multimodal_graph(
    image_id,
    lesion_data,
    vessel_schema
):

    # --------------------------------------------------------
    # Find original image
    # --------------------------------------------------------

    image_path = find_original_image(
        image_id
    )

    if image_path is not None:

        image = cv2.imread(
            image_path
        )

    else:

        image = None

    if image is not None:

        height, width = image.shape[:2]

    else:

        # Fallback from lesion coordinates
        max_x = 0
        max_y = 0

        for lesion in lesion_data.get(
            "lesions",
            []
        ):

            max_x = max(
                max_x,
                safe_float(
                    lesion.get(
                        "centroid_x",
                        0
                    )
                )
            )

            max_y = max(
                max_y,
                safe_float(
                    lesion.get(
                        "centroid_y",
                        0
                    )
                )
            )

        width = max(
            int(max_x + 1),
            1
        )

        height = max(
            int(max_y + 1),
            1
        )

    # --------------------------------------------------------
    # Lesion nodes
    # --------------------------------------------------------

    lesions = normalize_lesion_nodes(
        lesion_data
    )

    # --------------------------------------------------------
    # Landmarks
    # --------------------------------------------------------

    landmarks = parse_landmarks(
        image_id
    )

    if not landmarks:

        landmarks = [
            create_reference_landmark(
                width,
                height
            )
        ]

    # Assign IDs
    for index, landmark in enumerate(
        landmarks
    ):

        landmark[
            "id"
        ] = (
            f"landmark_{index+1}"
        )

    # --------------------------------------------------------
    # Lesion local features
    # --------------------------------------------------------

    lesions = calculate_local_lesion_features(
        lesions,
        landmarks,
        width,
        height
    )

    # --------------------------------------------------------
    # Edges
    # --------------------------------------------------------

    lesion_edges = build_lesion_edges(
        lesions
    )

    landmark_edges = build_landmark_edges(
        lesions,
        landmarks
    )

    # --------------------------------------------------------
    # Graph features
    # --------------------------------------------------------

    features = graph_features(
        lesions,
        lesion_edges,
        landmark_edges,
        width,
        height
    )

    # --------------------------------------------------------
    # Vessel branch metadata
    #
    # NOT copied from DRIVE into IDRiD.
    # Only the schema status is recorded.
    # --------------------------------------------------------

    features[
        "vessel_graph_schema_available"
    ] = bool(
        vessel_schema is not None
    )

    features[
        "vessel_graph_source"
    ] = (
        "DRIVE"
        if vessel_schema is not None
        else "not_available"
    )

    # --------------------------------------------------------
    # Visualization
    # --------------------------------------------------------

    visualization = None

    if image_path is not None:

        visualization = create_visualization(
            image_path,
            lesions,
            landmarks,
            lesion_edges,
            landmark_edges,
            image_id
        )

    # --------------------------------------------------------
    # Final graph
    # --------------------------------------------------------

    graph = {

        "project":
            "RETINA-FUSION 360",

        "graph_version":
            "MULTIMODAL_1.0",

        "image_id":
            image_id,

        "source_dataset":
            "IDRiD",

        "image_path":
            image_path,

        "nodes": {

            "lesion_nodes":
                lesions,

            "landmark_nodes":
                landmarks
        },

        "edges": {

            "lesion_lesion":
                lesion_edges,

            "lesion_landmark":
                landmark_edges
        },

        "features":
            features,

        "vascular_schema": {

            "source_dataset":
                "DRIVE",

            "available":
                vessel_schema is not None,

            "description":
                "Vessel topology schema is maintained separately because DRIVE and IDRiD contain different retinal images."
        },

        "visualization":
            visualization
    }

    return graph


# ============================================================
# SAVE GRAPH
# ============================================================

def save_graph(
    graph
):

    image_id = graph[
        "image_id"
    ]

    path = os.path.join(
        GRAPH_DIR,
        f"IDRiD_{image_id}_multimodal_graph.json"
    )

    with open(
        path,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            graph,
            file,
            indent=2
        )

    return path


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 70)
    print("RETINA-FUSION 360")
    print("FINAL MULTIMODAL RETINAL GRAPH")
    print("=" * 70)

    print()

    print(
        "This module integrates:"
    )

    print(
        "  • IDRiD lesion nodes"
    )

    print(
        "  • lesion spatial relationships"
    )

    print(
        "  • anatomical/reference landmarks"
    )

    print(
        "  • vessel graph schema"
    )

    print()

    # --------------------------------------------------------
    # Load vessel schema
    # --------------------------------------------------------

    vessel_schema = load_vessel_graph_schema()

    # --------------------------------------------------------
    # Load lesion results
    # --------------------------------------------------------

    lesion_results = load_lesion_results()

    print()

    print(
        f"IDRiD images available: "
        f"{len(lesion_results)}"
    )

    # --------------------------------------------------------
    # Build graphs
    # --------------------------------------------------------

    summary = []

    for index, (
        image_id,
        lesion_data
    ) in enumerate(
        lesion_results.items(),
        1
    ):

        print()

        print(
            f"[{index}/{len(lesion_results)}] "
            f"IDRiD_{image_id}"
        )

        try:

            graph = build_multimodal_graph(
                image_id,
                lesion_data,
                vessel_schema
            )

            graph_path = save_graph(
                graph
            )

            features = graph[
                "features"
            ]

            summary.append({

                "image_id":
                    image_id,

                "lesion_nodes":
                    features[
                        "total_lesion_nodes"
                    ],

                "MA":
                    features[
                        "MA_nodes"
                    ],

                "EX":
                    features[
                        "EX_nodes"
                    ],

                "HE":
                    features[
                        "HE_nodes"
                    ],

                "SE":
                    features[
                        "SE_nodes"
                    ],

                "lesion_lesion_edges":
                    features[
                        "lesion_lesion_edges"
                    ],

                "lesion_landmark_edges":
                    features[
                        "lesion_landmark_edges"
                    ],

                "lesion_area_ratio":
                    features[
                        "lesion_area_ratio"
                    ]
            })

            print(
                f"    Lesion nodes: "
                f"{features['total_lesion_nodes']}"
            )

            print(
                f"    MA: "
                f"{features['MA_nodes']}"
            )

            print(
                f"    EX: "
                f"{features['EX_nodes']}"
            )

            print(
                f"    HE: "
                f"{features['HE_nodes']}"
            )

            print(
                f"    SE: "
                f"{features['SE_nodes']}"
            )

            print(
                f"    Lesion-lesion edges: "
                f"{features['lesion_lesion_edges']}"
            )

            print(
                f"    Lesion-landmark edges: "
                f"{features['lesion_landmark_edges']}"
            )

            print(
                f"    Saved: "
                f"{graph_path}"
            )

        except Exception as error:

            print(
                f"    ERROR: {error}"
            )

    # --------------------------------------------------------
    # Save CSV summary
    # --------------------------------------------------------

    summary_df = pd.DataFrame(
        summary
    )

    summary_csv = os.path.join(
        SUMMARY_DIR,
        "multimodal_graph_summary.csv"
    )

    summary_df.to_csv(
        summary_csv,
        index=False
    )

    # --------------------------------------------------------
    # Aggregate statistics
    # --------------------------------------------------------

    aggregate = {

        "project":
            "RETINA-FUSION 360",

        "graph_version":
            "MULTIMODAL_1.0",

        "source_dataset":
            "IDRiD",

        "images_processed":
            len(summary),

        "average_lesion_nodes":
            float(
                summary_df[
                    "lesion_nodes"
                ].mean()
            )
            if not summary_df.empty
            else 0.0,

        "average_MA_nodes":
            float(
                summary_df[
                    "MA"
                ].mean()
            )
            if not summary_df.empty
            else 0.0,

        "average_EX_nodes":
            float(
                summary_df[
                    "EX"
                ].mean()
            )
            if not summary_df.empty
            else 0.0,

        "average_HE_nodes":
            float(
                summary_df[
                    "HE"
                ].mean()
            )
            if not summary_df.empty
            else 0.0,

        "average_SE_nodes":
            float(
                summary_df[
                    "SE"
                ].mean()
            )
            if not summary_df.empty
            else 0.0,

        "average_lesion_lesion_edges":
            float(
                summary_df[
                    "lesion_lesion_edges"
                ].mean()
            )
            if not summary_df.empty
            else 0.0,

        "average_lesion_landmark_edges":
            float(
                summary_df[
                    "lesion_landmark_edges"
                ].mean()
            )
            if not summary_df.empty
            else 0.0,

        "vessel_schema_source":
            "DRIVE",

        "vessel_schema_available":
            vessel_schema is not None,

        "dataset_relationship_note":
            "DRIVE and IDRiD images are not directly matched. DRIVE supplies the vascular graph methodology/schema; IDRiD supplies lesion and localization information."
    }

    aggregate_json = os.path.join(
        SUMMARY_DIR,
        "multimodal_graph_final_summary.json"
    )

    with open(
        aggregate_json,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            aggregate,
            file,
            indent=2
        )

    # --------------------------------------------------------
    # COMPLETE
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print("FINAL MULTIMODAL RETINAL GRAPH COMPLETE")
    print("=" * 70)

    print()

    print(
        f"Images processed: "
        f"{len(summary)}"
    )

    if not summary_df.empty:

        print(
            f"Average lesion nodes/image: "
            f"{summary_df['lesion_nodes'].mean():.2f}"
        )

        print(
            f"Average lesion-lesion edges/image: "
            f"{summary_df['lesion_lesion_edges'].mean():.2f}"
        )

        print(
            f"Average lesion-landmark edges/image: "
            f"{summary_df['lesion_landmark_edges'].mean():.2f}"
        )

    print()

    print(
        "Graphs:"
    )

    print(
        GRAPH_DIR
    )

    print()

    print(
        "Visualizations:"
    )

    print(
        VIS_DIR
    )

    print()

    print(
        "Summary CSV:"
    )

    print(
        summary_csv
    )

    print()

    print(
        "Summary JSON:"
    )

    print(
        aggregate_json
    )

    print()


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()