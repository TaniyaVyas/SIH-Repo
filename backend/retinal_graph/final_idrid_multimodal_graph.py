import os
import re
import json
import math
import cv2
import numpy as np
from collections import defaultdict, deque


# ============================================================
# RETINA-FUSION 360
# FINAL IDRiD MULTIMODAL RETINAL GRAPH
#
# SAME-IMAGE GRAPH
#
# For every IDRiD image:
#
#   Vessel skeleton
#       ↓
#   Vessel nodes + vessel edges
#
#   Lesion masks / lesion JSON
#       ↓
#   Lesion nodes
#
#   IDRiD localization / OD information
#       ↓
#   Optic disc + fovea landmarks
#
#   Everything
#       ↓
#   Spatial / anatomical relationships
#       ↓
#   Retinal Graph
#
# This is NOT merging DRIVE image IDs with IDRiD IDs.
# All graph components belong to the SAME IDRiD image.
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

VESSEL_SKELETON_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "idrid_vessel_final",
    "skeletons"
)

VESSEL_MASK_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "idrid_vessel_final",
    "predicted_masks"
)

LESION_JSON_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "lesion_segmentation_final",
    "lesion_json"
)

OUTPUT_ROOT = os.path.join(
    PROJECT_ROOT,
    "results",
    "retinal_graph_idrid_final"
)

GRAPH_DIR = os.path.join(
    OUTPUT_ROOT,
    "graphs"
)

VISUALIZATION_DIR = os.path.join(
    OUTPUT_ROOT,
    "visualizations"
)

SUMMARY_DIR = os.path.join(
    OUTPUT_ROOT,
    "summary"
)

SUMMARY_JSON = os.path.join(
    SUMMARY_DIR,
    "idrid_multimodal_graph_summary.json"
)

SUMMARY_CSV = os.path.join(
    SUMMARY_DIR,
    "idrid_multimodal_graph_summary.csv"
)


# ============================================================
# GRAPH CONFIGURATION
# ============================================================

# Pixels within this distance are considered connected
# when tracing vessel skeleton paths.

VESSEL_NODE_RADIUS = 2

# Spatial relationship thresholds

LESION_VESSEL_DISTANCE = 40.0

LESION_LESION_DISTANCE = 80.0

LANDMARK_LESION_DISTANCE = 150.0

LANDMARK_VESSEL_DISTANCE = 100.0

# Minimum vessel edge length

MIN_EDGE_LENGTH = 3.0

# Remove extremely tiny vessel components

MIN_VESSEL_COMPONENT = 15

# Visualization node radius

VIS_NODE_RADIUS = 5


# ============================================================
# CREATE DIRECTORIES
# ============================================================

for directory in [

    OUTPUT_ROOT,
    GRAPH_DIR,
    VISUALIZATION_DIR,
    SUMMARY_DIR

]:

    os.makedirs(
        directory,
        exist_ok=True
    )


# ============================================================
# HEADER
# ============================================================

print()
print("=" * 75)
print("RETINA-FUSION 360")
print("FINAL IDRiD MULTIMODAL RETINAL GRAPH")
print("=" * 75)
print()

print(
    "This program builds SAME-IMAGE multimodal retinal graphs."
)

print()


# ============================================================
# UTILITY
# ============================================================

def extract_image_id(filename):

    stem = os.path.splitext(
        os.path.basename(filename)
    )[0]

    match = re.search(
        r"IDRiD[_\-](\d+)",
        stem,
        re.IGNORECASE
    )

    if match:

        return f"{int(match.group(1)):02d}"

    match = re.search(
        r"(\d+)",
        stem
    )

    if match:

        return f"{int(match.group(1)):02d}"

    return stem


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

    return sorted(
        candidates,
        key=len
    )[0]


ORIGINAL_DIR = find_original_directory()


if ORIGINAL_DIR is None:

    raise RuntimeError(
        "IDRiD Original Images directory "
        "could not be found."
    )


# ============================================================
# LOAD ORIGINAL IMAGE FILES
# ============================================================

image_files = {}

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

            image_id = extract_image_id(
                filename
            )

            image_files[
                image_id
            ] = os.path.join(
                root,
                filename
            )


print(
    f"IDRiD original images: "
    f"{len(image_files)}"
)


# ============================================================
# LOAD VESSEL SKELETON FILES
# ============================================================

vessel_skeleton_files = {}

if os.path.exists(
    VESSEL_SKELETON_DIR
):

    for filename in os.listdir(
        VESSEL_SKELETON_DIR
    ):

        if filename.lower().endswith(
            ".png"
        ):

            image_id = extract_image_id(
                filename
            )

            vessel_skeleton_files[
                image_id
            ] = os.path.join(
                VESSEL_SKELETON_DIR,
                filename
            )


print(
    f"Vessel skeletons: "
    f"{len(vessel_skeleton_files)}"
)


# ============================================================
# LOAD VESSEL MASK FILES
# ============================================================

vessel_mask_files = {}

if os.path.exists(
    VESSEL_MASK_DIR
):

    for filename in os.listdir(
        VESSEL_MASK_DIR
    ):

        if filename.lower().endswith(
            ".png"
        ):

            image_id = extract_image_id(
                filename
            )

            vessel_mask_files[
                image_id
            ] = os.path.join(
                VESSEL_MASK_DIR,
                filename
            )


print(
    f"Vessel masks: "
    f"{len(vessel_mask_files)}"
)


# ============================================================
# LOAD LESION JSON FILES
# ============================================================

lesion_json_files = {}

if os.path.exists(
    LESION_JSON_DIR
):

    for filename in os.listdir(
        LESION_JSON_DIR
    ):

        if filename.lower().endswith(
            ".json"
        ):

            image_id = extract_image_id(
                filename
            )

            lesion_json_files[
                image_id
            ] = os.path.join(
                LESION_JSON_DIR,
                filename
            )


print(
    f"Lesion JSON files: "
    f"{len(lesion_json_files)}"
)

print()


# ============================================================
# NEIGHBOURHOOD
# ============================================================

NEIGHBOURS = [

    (-1, -1),
    (-1,  0),
    (-1,  1),

    ( 0, -1),
    ( 0,  1),

    ( 1, -1),
    ( 1,  0),
    ( 1,  1)

]


# ============================================================
# VESSEL COMPONENT CLEANING
# ============================================================

def clean_skeleton(
    skeleton
):

    binary = (
        skeleton > 0
    ).astype(
        np.uint8
    )

    number, labels, stats, centroids = (
        cv2.connectedComponentsWithStats(
            binary,
            connectivity=8
        )
    )

    cleaned = np.zeros_like(
        binary
    )

    for component in range(
        1,
        number
    ):

        area = stats[
            component,
            cv2.CC_STAT_AREA
        ]

        if (
            area
            >=
            MIN_VESSEL_COMPONENT
        ):

            cleaned[
                labels == component
            ] = 1

    return cleaned


# ============================================================
# CALCULATE SKELETON DEGREE
# ============================================================

def pixel_degree(
    skeleton,
    y,
    x
):

    height, width = skeleton.shape

    degree = 0

    for dy, dx in NEIGHBOURS:

        ny = y + dy
        nx = x + dx

        if (
            0 <= ny < height
            and
            0 <= nx < width
            and
            skeleton[
                ny,
                nx
            ]
        ):

            degree += 1

    return degree


# ============================================================
# FIND VESSEL NODE PIXELS
# ============================================================

def find_vessel_node_pixels(
    skeleton
):

    ys, xs = np.where(
        skeleton > 0
    )

    endpoint_pixels = []
    junction_pixels = []

    for y, x in zip(
        ys,
        xs
    ):

        degree = pixel_degree(
            skeleton,
            int(y),
            int(x)
        )

        if degree == 1:

            endpoint_pixels.append(
                (
                    int(y),
                    int(x)
                )
            )

        elif degree >= 3:

            junction_pixels.append(
                (
                    int(y),
                    int(x)
                )
            )

    return (
        endpoint_pixels,
        junction_pixels
    )


# ============================================================
# CLUSTER NEARBY PIXELS
# ============================================================

def cluster_pixels(
    pixels,
    radius=2
):

    if not pixels:

        return []

    pixel_set = set(
        pixels
    )

    visited = set()

    clusters = []

    for pixel in pixels:

        if pixel in visited:

            continue

        queue = deque(
            [pixel]
        )

        visited.add(
            pixel
        )

        cluster = []

        while queue:

            current = queue.popleft()

            cluster.append(
                current
            )

            cy, cx = current

            for other in list(
                pixel_set
            ):

                if other in visited:

                    continue

                oy, ox = other

                distance = math.sqrt(
                    (cy - oy) ** 2
                    +
                    (cx - ox) ** 2
                )

                if (
                    distance
                    <=
                    radius
                ):

                    visited.add(
                        other
                    )

                    queue.append(
                        other
                    )

        clusters.append(
            cluster
        )

    return clusters


# ============================================================
# CLUSTER CENTROID
# ============================================================

def cluster_centroid(
    cluster
):

    ys = [
        point[0]
        for point in cluster
    ]

    xs = [
        point[1]
        for point in cluster
    ]

    return (

        float(
            np.mean(xs)
        ),

        float(
            np.mean(ys)
        )

    )


# ============================================================
# BUILD VESSEL NODES
# ============================================================

def build_vessel_nodes(
    skeleton
):

    endpoints, junctions = (
        find_vessel_node_pixels(
            skeleton
        )
    )

    endpoint_clusters = cluster_pixels(
        endpoints,
        VESSEL_NODE_RADIUS
    )

    junction_clusters = cluster_pixels(
        junctions,
        VESSEL_NODE_RADIUS
    )

    nodes = []

    node_pixel_map = {}

    node_id = 0

    # --------------------------------------------------------
    # Endpoints
    # --------------------------------------------------------

    for cluster in endpoint_clusters:

        x, y = cluster_centroid(
            cluster
        )

        node = {

            "node_id":
                f"V{node_id}",

            "node_type":
                "vessel_endpoint",

            "x":
                x,

            "y":
                y,

            "degree_type":
                "endpoint",

            "pixel_count":
                len(cluster)

        }

        nodes.append(
            node
        )

        for pixel in cluster:

            node_pixel_map[
                pixel
            ] = node_id

        node_id += 1

    # --------------------------------------------------------
    # Junctions
    # --------------------------------------------------------

    for cluster in junction_clusters:

        x, y = cluster_centroid(
            cluster
        )

        node = {

            "node_id":
                f"V{node_id}",

            "node_type":
                "vessel_junction",

            "x":
                x,

            "y":
                y,

            "degree_type":
                "junction",

            "pixel_count":
                len(cluster)

        }

        nodes.append(
            node
        )

        for pixel in cluster:

            node_pixel_map[
                pixel
            ] = node_id

        node_id += 1

    return (
        nodes,
        node_pixel_map
    )


# ============================================================
# FIND NEAREST VESSEL NODE
# ============================================================

def nearest_vessel_node(
    pixel,
    nodes,
    max_distance=3.0
):

    y, x = pixel

    best_id = None
    best_distance = float(
        "inf"
    )

    for index, node in enumerate(
        nodes
    ):

        distance = math.sqrt(
            (
                node["x"]
                -
                x
            ) ** 2
            +
            (
                node["y"]
                -
                y
            ) ** 2
        )

        if distance < best_distance:

            best_distance = distance
            best_id = index

    if (
        best_id is not None
        and
        best_distance <= max_distance
    ):

        return best_id

    return None


# ============================================================
# TRACE VESSEL EDGES
# ============================================================

def build_vessel_edges(
    skeleton,
    nodes
):

    if not nodes:

        return []

    # --------------------------------------------------------
    # Convert node coordinates into approximate pixels
    # --------------------------------------------------------

    node_pixels = []

    for index, node in enumerate(
        nodes
    ):

        node_pixels.append({

            "index":
                index,

            "x":
                int(
                    round(
                        node["x"]
                    )
                ),

            "y":
                int(
                    round(
                        node["y"]
                    )
                )
        })

    # --------------------------------------------------------
    # Map skeleton pixels to nearest graph node when close
    # --------------------------------------------------------

    skeleton_pixels = list(
        zip(
            *np.where(
                skeleton > 0
            )
        )
    )

    pixel_to_node = {}

    for y, x in skeleton_pixels:

        nearest = None
        distance_best = float(
            "inf"
        )

        for node in node_pixels:

            distance = math.sqrt(
                (
                    x -
                    node["x"]
                ) ** 2
                +
                (
                    y -
                    node["y"]
                ) ** 2
            )

            if distance < distance_best:

                distance_best = distance
                nearest = node["index"]

        if (
            nearest is not None
            and
            distance_best <=
            VESSEL_NODE_RADIUS + 1
        ):

            pixel_to_node[
                (
                    y,
                    x
                )
            ] = nearest

    # --------------------------------------------------------
    # Trace from every graph node
    # --------------------------------------------------------

    edges = []

    visited_segments = set()

    height, width = skeleton.shape

    for start_node in range(
        len(nodes)
    ):

        start_x = int(
            round(
                nodes[
                    start_node
                ]["x"]
            )
        )

        start_y = int(
            round(
                nodes[
                    start_node
                ]["y"]
            )
        )

        # Find skeleton pixels near node
        start_pixels = []

        for dy in range(
            -2,
            3
        ):

            for dx in range(
                -2,
                3
            ):

                ny = start_y + dy
                nx = start_x + dx

                if (
                    0 <= ny < height
                    and
                    0 <= nx < width
                    and
                    skeleton[
                        ny,
                        nx
                    ]
                ):

                    start_pixels.append(
                        (
                            ny,
                            nx
                        )
                    )

        for first_pixel in start_pixels:

            state = (
                start_node,
                first_pixel
            )

            if state in visited_segments:

                continue

            path = [
                (
                    start_y,
                    start_x
                ),
                first_pixel
            ]

            previous = (
                start_y,
                start_x
            )

            current = first_pixel

            current_node = start_node

            while True:

                visited_segments.add(
                    (
                        current_node,
                        current
                    )
                )

                y, x = current

                # ------------------------------------------------
                # Did we reach another node?
                # ------------------------------------------------

                reached_node = None

                for node_index, node in enumerate(
                    nodes
                ):

                    if (
                        node_index
                        ==
                        start_node
                    ):

                        continue

                    distance = math.sqrt(
                        (
                            node["x"]
                            -
                            x
                        ) ** 2
                        +
                        (
                            node["y"]
                            -
                            y
                        ) ** 2
                    )

                    if (
                        distance
                        <=
                        VESSEL_NODE_RADIUS + 1
                    ):

                        reached_node = node_index
                        break

                if reached_node is not None:

                    if (
                        reached_node
                        !=
                        start_node
                    ):

                        edge_pixels = path

                        length = 0.0

                        for i in range(
                            1,
                            len(
                                edge_pixels
                            )
                        ):

                            y1, x1 = (
                                edge_pixels[
                                    i - 1
                                ]
                            )

                            y2, x2 = (
                                edge_pixels[
                                    i
                                ]
                            )

                            length += math.sqrt(
                                (
                                    x2 - x1
                                ) ** 2
                                +
                                (
                                    y2 - y1
                                ) ** 2
                            )

                        if (
                            length
                            >=
                            MIN_EDGE_LENGTH
                        ):

                            sx = nodes[
                                start_node
                            ]["x"]

                            sy = nodes[
                                start_node
                            ]["y"]

                            ex = nodes[
                                reached_node
                            ]["x"]

                            ey = nodes[
                                reached_node
                            ]["y"]

                            euclidean = math.sqrt(
                                (
                                    ex - sx
                                ) ** 2
                                +
                                (
                                    ey - sy
                                ) ** 2
                            )

                            if euclidean > 0:

                                tortuosity = (
                                    length
                                    /
                                    euclidean
                                )

                            else:

                                tortuosity = 1.0

                            edge_key = tuple(
                                sorted(
                                    (
                                        start_node,
                                        reached_node
                                    )
                                )
                            )

                            if not any(
                                edge[
                                    "source_index"
                                ] == edge_key[0]
                                and
                                edge[
                                    "target_index"
                                ] == edge_key[1]
                                for edge in edges
                            ):

                                edges.append({

                                    "edge_id":
                                        f"E{len(edges)}",

                                    "source":
                                        nodes[
                                            start_node
                                        ][
                                            "node_id"
                                        ],

                                    "target":
                                        nodes[
                                            reached_node
                                        ][
                                            "node_id"
                                        ],

                                    "source_index":
                                        start_node,

                                    "target_index":
                                        reached_node,

                                    "length":
                                        float(
                                            length
                                        ),

                                    "euclidean_distance":
                                        float(
                                            euclidean
                                        ),

                                    "tortuosity":
                                        float(
                                            tortuosity
                                        )
                                })

                    break

                # ------------------------------------------------
                # Find next skeleton pixels
                # ------------------------------------------------

                neighbours = []

                for dy, dx in NEIGHBOURS:

                    ny = y + dy
                    nx = x + dx

                    if (
                        0 <= ny < height
                        and
                        0 <= nx < width
                        and
                        skeleton[
                            ny,
                            nx
                        ]
                    ):

                        candidate = (
                            ny,
                            nx
                        )

                        if candidate != previous:

                            neighbours.append(
                                candidate
                            )

                if not neighbours:

                    break

                # Prefer unvisited pixel

                next_pixel = None

                for candidate in neighbours:

                    if (
                        (
                            current_node,
                            candidate
                        )
                        not in
                        visited_segments
                    ):

                        next_pixel = candidate
                        break

                if next_pixel is None:

                    break

                previous = current
                current = next_pixel

                path.append(
                    current
                )

    return edges


# ============================================================
# LOAD LESION NODES
# ============================================================

def load_lesion_nodes(
    image_id
):

    path = lesion_json_files.get(
        image_id
    )

    if path is None:

        return []

    try:

        with open(
            path,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(
                file
            )

    except Exception as error:

        print(
            f"  Lesion JSON error "
            f"for {image_id}: "
            f"{error}"
        )

        return []

    lesions = []

    # --------------------------------------------------------
    # The lesion pipeline stores lesion information under
    # several possible structures. Handle them safely.
    # --------------------------------------------------------

    if isinstance(
        data,
        dict
    ):

        if isinstance(
            data.get(
                "lesions"
            ),
            list
        ):

            source = data[
                "lesions"
            ]

        elif isinstance(
            data.get(
                "lesion_objects"
            ),
            list
        ):

            source = data[
                "lesion_objects"
            ]

        elif isinstance(
            data.get(
                "objects"
            ),
            list
        ):

            source = data[
                "objects"
            ]

        else:

            source = []

    elif isinstance(
        data,
        list
    ):

        source = data

    else:

        source = []

    lesion_counter = defaultdict(
        int
    )

    for item in source:

        if not isinstance(
            item,
            dict
        ):

            continue

        lesion_type = str(
            item.get(
                "lesion_type",
                item.get(
                    "type",
                    "unknown"
                )
            )
        ).upper()

        x = item.get(
            "x",
            item.get(
                "centroid_x"
            )
        )

        y = item.get(
            "y",
            item.get(
                "centroid_y"
            )
        )

        # ----------------------------------------------------
        # Some formats may store centroid as [x,y]
        # ----------------------------------------------------

        if (
            x is None
            or
            y is None
        ):

            centroid = item.get(
                "centroid"
            )

            if (
                isinstance(
                    centroid,
                    (list, tuple)
                )
                and
                len(centroid) >= 2
            ):

                x = centroid[0]
                y = centroid[1]

        if (
            x is None
            or
            y is None
        ):

            continue

        try:

            x = float(x)
            y = float(y)

        except:

            continue

        lesion_counter[
            lesion_type
        ] += 1

        lesion_id = (
            f"L_"
            f"{lesion_type}_"
            f"{lesion_counter[lesion_type]}"
        )

        lesions.append({

            "node_id":
                lesion_id,

            "node_type":
                "lesion",

            "lesion_type":
                lesion_type,

            "x":
                x,

            "y":
                y,

            "area":
                float(
                    item.get(
                        "area",
                        0
                    )
                ),

            "aspect_ratio":
                float(
                    item.get(
                        "aspect_ratio",
                        0
                    )
                ),

            "circularity":
                float(
                    item.get(
                        "circularity",
                        0
                    )
                )
        })

    return lesions


# ============================================================
# SEARCH IDRiD LOCALIZATION FILES
# ============================================================

def find_localization_files():

    files = []

    localization_root = None

    for root, dirs, filenames in os.walk(
        IDRID_ROOT
    ):

        for directory in dirs:

            if (
                "localization"
                in
                directory.lower()
            ):

                localization_root = os.path.join(
                    root,
                    directory
                )

                break

        if localization_root:

            break

    if localization_root is None:

        return files

    for root, dirs, filenames in os.walk(
        localization_root
    ):

        for filename in filenames:

            if filename.lower().endswith(
                (
                    ".csv",
                    ".txt",
                    ".xlsx",
                    ".xls"
                )
            ):

                files.append(
                    os.path.join(
                        root,
                        filename
                    )

                )

    return files


LOCALIZATION_FILES = (
    find_localization_files()
)


print(
    f"Localization files found: "
    f"{len(LOCALIZATION_FILES)}"
)


# ============================================================
# FIND OPTIC DISC MASKS
# ============================================================

def find_od_masks():

    result = {}

    groundtruth_root = None

    for root, dirs, files in os.walk(
        IDRID_ROOT
    ):

        if (
            "2. all segmentation groundtruths"
            in
            root.lower()
        ):

            groundtruth_root = root

            break

    if groundtruth_root is None:

        return result

    for root, dirs, files in os.walk(
        groundtruth_root
    ):

        for filename in files:

            if (
                "_OD."
                in
                filename.upper()
            ):

                image_id = extract_image_id(
                    filename
                )

                result[
                    image_id
                ] = os.path.join(
                    root,
                    filename
                )

    return result


OD_MASK_FILES = find_od_masks()


print(
    f"Optic disc masks found: "
    f"{len(OD_MASK_FILES)}"
)

print()


# ============================================================
# OPTIC DISC FROM MASK
# ============================================================

def optic_disc_from_mask(
    mask_path
):

    mask = cv2.imread(
        mask_path,
        cv2.IMREAD_GRAYSCALE
    )

    if mask is None:

        return None

    binary = (
        mask > 0
    ).astype(
        np.uint8
    )

    number, labels, stats, centroids = (
        cv2.connectedComponentsWithStats(
            binary,
            connectivity=8
        )
    )

    if number <= 1:

        return None

    largest = 1

    largest_area = stats[
        1,
        cv2.CC_STAT_AREA
    ]

    for label in range(
        2,
        number
    ):

        area = stats[
            label,
            cv2.CC_STAT_AREA
        ]

        if area > largest_area:

            largest = label
            largest_area = area

    cx, cy = centroids[
        largest
    ]

    return {

        "node_id":
            "OD",

        "node_type":
            "landmark",

        "landmark_type":
            "optic_disc",

        "x":
            float(cx),

        "y":
            float(cy),

        "area":
            int(
                largest_area
            )
    }


# ============================================================
# LOCALIZATION PARSER
#
# We intentionally do NOT assume a fixed column name.
# This attempts to identify image IDs and x/y coordinate
# columns from actual files.
# ============================================================

def load_fovea_from_localization(
    image_id
):

    if not LOCALIZATION_FILES:

        return None

    # Pandas is used only if available.
    try:

        import pandas as pd

    except ImportError:

        return None

    for path in LOCALIZATION_FILES:

        try:

            if path.lower().endswith(
                ".csv"
            ):

                df = pd.read_csv(
                    path
                )

            elif path.lower().endswith(
                ".txt"
            ):

                try:

                    df = pd.read_csv(
                        path,
                        sep=None,
                        engine="python"
                    )

                except:

                    df = pd.read_csv(
                        path,
                        sep="\t"
                    )

            else:

                continue

        except:

            continue

        if df.empty:

            continue

        columns = [
            str(column)
            for column in df.columns
        ]

        lower_columns = {
            column.lower():
                column
            for column in columns
        }

        # ----------------------------------------------------
        # Find image ID column
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

        if id_column is None:

            continue

        # ----------------------------------------------------
        # Find possible x/y columns
        # ----------------------------------------------------

        x_column = None
        y_column = None

        for column in columns:

            lower = column.lower()

            if x_column is None and (
                lower in (
                    "x",
                    "fovea_x",
                    "foveax",
                    "fovea x",
                    "x_coordinate",
                    "x coordinate"
                )
                or
                (
                    "fovea"
                    in lower
                    and
                    "x"
                    in lower
                )
            ):

                x_column = column

            if y_column is None and (
                lower in (
                    "y",
                    "fovea_y",
                    "foveay",
                    "fovea y",
                    "y_coordinate",
                    "y coordinate"
                )
                or
                (
                    "fovea"
                    in lower
                    and
                    "y"
                    in lower
                )
            ):

                y_column = column

        if (
            x_column is None
            or
            y_column is None
        ):

            continue

        for _, row in df.iterrows():

            row_id = str(
                row[
                    id_column
                ]
            )

            row_id_normalized = (
                extract_image_id(
                    row_id
                )
            )

            if (
                row_id_normalized
                !=
                image_id
            ):

                continue

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

            except:

                continue

            return {

                "node_id":
                    "FOVEA",

                "node_type":
                    "landmark",

                "landmark_type":
                    "fovea",

                "x":
                    x,

                "y":
                    y
            }

    return None


# ============================================================
# DISTANCE
# ============================================================

def distance(
    a,
    b
):

    return math.sqrt(
        (
            a["x"]
            -
            b["x"]
        ) ** 2
        +
        (
            a["y"]
            -
            b["y"]
        ) ** 2
    )


# ============================================================
# ADD SPATIAL EDGES
# ============================================================

def add_spatial_edges(
    nodes,
    edges
):

    existing = set()

    for edge in edges:

        existing.add(
            (
                edge[
                    "source"
                ],
                edge[
                    "target"
                ]
            )
        )

        existing.add(
            (
                edge[
                    "target"
                ],
                edge[
                    "source"
                ]
            )
        )

    # --------------------------------------------------------
    # Vessel ↔ lesion
    # --------------------------------------------------------

    vessel_nodes = [
        node
        for node in nodes
        if node[
            "node_type"
        ].startswith(
            "vessel"
        )
    ]

    lesion_nodes = [
        node
        for node in nodes
        if node[
            "node_type"
        ]
        ==
        "lesion"
    ]

    landmark_nodes = [
        node
        for node in nodes
        if node[
            "node_type"
        ]
        ==
        "landmark"
    ]

    # --------------------------------------------------------
    # Lesion → nearest vessel node
    # --------------------------------------------------------

    for lesion in lesion_nodes:

        best_vessel = None
        best_distance = float(
            "inf"
        )

        for vessel in vessel_nodes:

            d = distance(
                lesion,
                vessel
            )

            if d < best_distance:

                best_distance = d
                best_vessel = vessel

        if (
            best_vessel is not None
            and
            best_distance
            <=
            LESION_VESSEL_DISTANCE
        ):

            key = (
                lesion["node_id"],
                best_vessel["node_id"]
            )

            if key not in existing:

                edges.append({

                    "edge_id":
                        f"X{len(edges)}",

                    "source":
                        lesion[
                            "node_id"
                        ],

                    "target":
                        best_vessel[
                            "node_id"
                        ],

                    "edge_type":
                        "lesion_vessel_proximity",

                    "distance":
                        float(
                            best_distance
                        )
                })

                existing.add(
                    key
                )

    # --------------------------------------------------------
    # Lesion ↔ lesion
    # --------------------------------------------------------

    for i in range(
        len(lesion_nodes)
    ):

        for j in range(
            i + 1,
            len(lesion_nodes)
        ):

            a = lesion_nodes[i]
            b = lesion_nodes[j]

            d = distance(
                a,
                b
            )

            if (
                d
                <=
                LESION_LESION_DISTANCE
            ):

                key = (
                    a["node_id"],
                    b["node_id"]
                )

                if key not in existing:

                    edges.append({

                        "edge_id":
                            f"X{len(edges)}",

                        "source":
                            a[
                                "node_id"
                            ],

                        "target":
                            b[
                                "node_id"
                            ],

                        "edge_type":
                            "lesion_spatial",

                        "distance":
                            float(
                                d
                            )
                    })

                    existing.add(
                        key
                    )

    # --------------------------------------------------------
    # Landmark ↔ lesion
    # --------------------------------------------------------

    for landmark in landmark_nodes:

        for lesion in lesion_nodes:

            d = distance(
                landmark,
                lesion
            )

            if (
                d
                <=
                LANDMARK_LESION_DISTANCE
            ):

                key = (
                    landmark[
                        "node_id"
                    ],
                    lesion[
                        "node_id"
                    ]
                )

                if key not in existing:

                    edges.append({

                        "edge_id":
                            f"X{len(edges)}",

                        "source":
                            landmark[
                                "node_id"
                            ],

                        "target":
                            lesion[
                                "node_id"
                            ],

                        "edge_type":
                            "landmark_lesion",

                        "distance":
                            float(
                                d
                            )
                    })

                    existing.add(
                        key
                    )

    # --------------------------------------------------------
    # Landmark ↔ vessel
    # --------------------------------------------------------

    for landmark in landmark_nodes:

        nearest = None
        nearest_distance = float(
            "inf"
        )

        for vessel in vessel_nodes:

            d = distance(
                landmark,
                vessel
            )

            if d < nearest_distance:

                nearest_distance = d
                nearest = vessel

        if (
            nearest is not None
            and
            nearest_distance
            <=
            LANDMARK_VESSEL_DISTANCE
        ):

            key = (
                landmark[
                    "node_id"
                ],
                nearest[
                    "node_id"
                ]
            )

            if key not in existing:

                edges.append({

                    "edge_id":
                        f"X{len(edges)}",

                    "source":
                        landmark[
                            "node_id"
                        ],

                    "target":
                        nearest[
                            "node_id"
                        ],

                    "edge_type":
                        "landmark_vessel_proximity",

                    "distance":
                        float(
                            nearest_distance
                        )
                })

                existing.add(
                    key
                )

    return edges


# ============================================================
# GRAPH FEATURES
# ============================================================

def calculate_graph_features(
    nodes,
    edges,
    skeleton,
    image_shape
):

    height, width = image_shape

    vessel_nodes = [
        node
        for node in nodes
        if node[
            "node_type"
        ].startswith(
            "vessel"
        )
    ]

    lesion_nodes = [
        node
        for node in nodes
        if node[
            "node_type"
        ]
        ==
        "lesion"
    ]

    landmark_nodes = [
        node
        for node in nodes
        if node[
            "node_type"
        ]
        ==
        "landmark"
    ]

    vessel_edges = [
        edge
        for edge in edges
        if "source_index"
        in edge
    ]

    spatial_edges = [
        edge
        for edge in edges
        if "edge_type"
        in edge
    ]

    endpoint_count = sum(
        1
        for node in vessel_nodes
        if node.get(
            "degree_type"
        )
        ==
        "endpoint"
    )

    junction_count = sum(
        1
        for node in vessel_nodes
        if node.get(
            "degree_type"
        )
        ==
        "junction"
    )

    tortuosities = [

        edge[
            "tortuosity"
        ]

        for edge in vessel_edges

        if "tortuosity"
        in edge
    ]

    lengths = [

        edge[
            "length"
        ]

        for edge in vessel_edges

        if "length"
        in edge
    ]

    skeleton_pixels = int(
        np.sum(
            skeleton > 0
        )
    )

    image_area = (
        height
        *
        width
    )

    vessel_density = (
        skeleton_pixels
        /
        image_area
        if image_area > 0
        else 0
    )

    lesion_counts = defaultdict(
        int
    )

    for lesion in lesion_nodes:

        lesion_counts[
            lesion.get(
                "lesion_type",
                "UNKNOWN"
            )
        ] += 1

    return {

        "image_width":
            int(width),

        "image_height":
            int(height),

        "total_nodes":
            len(nodes),

        "vessel_nodes":
            len(vessel_nodes),

        "lesion_nodes":
            len(lesion_nodes),

        "landmark_nodes":
            len(landmark_nodes),

        "vessel_edges":
            len(vessel_edges),

        "spatial_edges":
            len(spatial_edges),

        "total_edges":
            len(edges),

        "endpoint_count":
            endpoint_count,

        "junction_count":
            junction_count,

        "skeleton_pixels":
            skeleton_pixels,

        "skeleton_vessel_density":
            float(
                vessel_density
            ),

        "mean_vessel_edge_length":
            float(
                np.mean(
                    lengths
                )
            )
            if lengths
            else 0.0,

        "mean_vessel_tortuosity":
            float(
                np.mean(
                    tortuosities
                )
            )
            if tortuosities
            else 0.0,

        "max_vessel_tortuosity":
            float(
                np.max(
                    tortuosities
                )
            )
            if tortuosities
            else 0.0,

        "lesion_counts":
            dict(
                lesion_counts
            )
    }


# ============================================================
# VISUALIZATION
# ============================================================

def visualize_graph(
    image,
    nodes,
    edges,
    output_path
):

    canvas = image.copy()

    # --------------------------------------------------------
    # Draw edges
    # --------------------------------------------------------

    node_lookup = {
        node[
            "node_id"
        ]: node
        for node in nodes
    }

    for edge in edges:

        source = node_lookup.get(
            edge[
                "source"
            ]
        )

        target = node_lookup.get(
            edge[
                "target"
            ]
        )

        if (
            source is None
            or
            target is None
        ):

            continue

        x1 = int(
            round(
                source["x"]
            )
        )

        y1 = int(
            round(
                source["y"]
            )
        )

        x2 = int(
            round(
                target["x"]
            )
        )

        y2 = int(
            round(
                target["y"]
            )
        )

        edge_type = edge.get(
            "edge_type",
            "vessel"
        )

        if edge_type == "lesion_vessel_proximity":

            color = (
                255,
                0,
                255
            )

        elif edge_type == "lesion_spatial":

            color = (
                0,
                255,
                255
            )

        elif edge_type == "landmark_lesion":

            color = (
                255,
                255,
                0
            )

        elif edge_type == "landmark_vessel_proximity":

            color = (
                255,
                128,
                0
            )

        else:

            color = (
                0,
                180,
                0
            )

        cv2.line(
            canvas,
            (
                x1,
                y1
            ),
            (
                x2,
                y2
            ),
            color,
            1
        )

    # --------------------------------------------------------
    # Draw nodes
    # --------------------------------------------------------

    for node in nodes:

        x = int(
            round(
                node["x"]
            )
        )

        y = int(
            round(
                node["y"]
            )
        )

        node_type = node[
            "node_type"
        ]

        if node_type == "vessel_endpoint":

            color = (
                255,
                0,
                0
            )

        elif node_type == "vessel_junction":

            color = (
                0,
                255,
                0
            )

        elif node_type == "lesion":

            lesion_type = node.get(
                "lesion_type",
                ""
            )

            if lesion_type == "MA":

                color = (
                    0,
                    0,
                    255
                )

            elif lesion_type == "EX":

                color = (
                    0,
                    255,
                    255
                )

            elif lesion_type == "HE":

                color = (
                    255,
                    0,
                    255
                )

            elif lesion_type == "SE":

                color = (
                    255,
                    128,
                    0
                )

            else:

                color = (
                    128,
                    128,
                    255
                )

        elif node_type == "landmark":

            landmark_type = node.get(
                "landmark_type",
                ""
            )

            if landmark_type == "optic_disc":

                color = (
                    255,
                    255,
                    255
                )

            else:

                color = (
                    128,
                    0,
                    255
                )

        else:

            color = (
                255,
                255,
                255
            )

        cv2.circle(
            canvas,
            (
                x,
                y
            ),
            VIS_NODE_RADIUS,
            color,
            -1
        )

    cv2.imwrite(
        output_path,
        canvas
    )


# ============================================================
# BUILD ONE GRAPH
# ============================================================

def build_graph(
    image_id
):

    image_path = image_files.get(
        image_id
    )

    skeleton_path = vessel_skeleton_files.get(
        image_id
    )

    if image_path is None:

        return None

    if skeleton_path is None:

        return None

    image = cv2.imread(
        image_path
    )

    skeleton = cv2.imread(
        skeleton_path,
        cv2.IMREAD_GRAYSCALE
    )

    if image is None:

        return None

    if skeleton is None:

        return None

    # --------------------------------------------------------
    # Resize skeleton to original image if required
    # --------------------------------------------------------

    height, width = image.shape[:2]

    if skeleton.shape != (
        height,
        width
    ):

        skeleton = cv2.resize(
            skeleton,
            (
                width,
                height
            ),
            interpolation=cv2.INTER_NEAREST
        )

    skeleton = (
        skeleton > 0
    ).astype(
        np.uint8
    )

    # --------------------------------------------------------
    # Clean vessel skeleton
    # --------------------------------------------------------

    skeleton = clean_skeleton(
        skeleton
    )

    # --------------------------------------------------------
    # Vessel nodes
    # --------------------------------------------------------

    vessel_nodes, node_pixel_map = (
        build_vessel_nodes(
            skeleton
        )
    )

    # --------------------------------------------------------
    # Vessel edges
    # --------------------------------------------------------

    vessel_edges = build_vessel_edges(
        skeleton,
        vessel_nodes
    )

    # --------------------------------------------------------
    # Lesion nodes
    # --------------------------------------------------------

    lesion_nodes = load_lesion_nodes(
        image_id
    )

    # --------------------------------------------------------
    # Landmark nodes
    # --------------------------------------------------------

    landmark_nodes = []

    # Optic disc

    od_path = OD_MASK_FILES.get(
        image_id
    )

    if od_path is not None:

        od = optic_disc_from_mask(
            od_path
        )

        if od is not None:

            # Scale if mask resolution differs
            landmark_nodes.append(
                od
            )

    # Fovea

    fovea = load_fovea_from_localization(
        image_id
    )

    if fovea is not None:

        landmark_nodes.append(
            fovea
        )

    # --------------------------------------------------------
    # Combine nodes
    # --------------------------------------------------------

    nodes = (
        vessel_nodes
        +
        lesion_nodes
        +
        landmark_nodes
    )

    # --------------------------------------------------------
    # Add spatial edges
    # --------------------------------------------------------

    all_edges = list(
        vessel_edges
    )

    all_edges = add_spatial_edges(
        nodes,
        all_edges
    )

    # --------------------------------------------------------
    # Graph features
    # --------------------------------------------------------

    features = calculate_graph_features(
        nodes,
        all_edges,
        skeleton,
        image.shape[:2]
    )

    # --------------------------------------------------------
    # Graph object
    # --------------------------------------------------------

    graph = {

        "graph_id":
            f"IDRiD_{image_id}",

        "image_id":
            image_id,

        "source_dataset":
            "IDRiD",

        "image_path":
            image_path,

        "node_schema": {

            "vessel_endpoint":
                "Vessel skeleton endpoint",

            "vessel_junction":
                "Vessel skeleton junction",

            "lesion":
                "Detected retinal lesion",

            "landmark":
                "Optic disc or fovea landmark"
        },

        "edge_schema": {

            "vessel":
                "Anatomical vessel connection",

            "lesion_vessel_proximity":
                "Lesion spatially associated with vessel",

            "lesion_spatial":
                "Spatial relationship between lesions",

            "landmark_lesion":
                "Landmark to lesion relationship",

            "landmark_vessel_proximity":
                "Landmark to vessel relationship"
        },

        "nodes":
            nodes,

        "edges":
            all_edges,

        "features":
            features
    }

    return (
        graph,
        image,
        skeleton
    )


# ============================================================
# SAVE GRAPH
# ============================================================

def save_graph(
    graph,
    image_id
):

    path = os.path.join(
        GRAPH_DIR,
        f"IDRiD_{image_id}_graph.json"
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
# PROCESS ALL IMAGES
# ============================================================

def main():

    common_ids = sorted(
        set(
            image_files.keys()
        )
        &
        set(
            vessel_skeleton_files.keys()
        )
    )

    print(
        f"Same-image graph candidates: "
        f"{len(common_ids)}"
    )

    print()

    if not common_ids:

        raise RuntimeError(
            "No common IDRiD images were found "
            "between original images and vessel skeletons."
        )

    summaries = []

    successful = 0
    failed = 0

    total_vessel_nodes = 0
    total_lesion_nodes = 0
    total_landmark_nodes = 0
    total_vessel_edges = 0
    total_spatial_edges = 0

    for index, image_id in enumerate(
        common_ids,
        1
    ):

        print(
            f"[{index:02d}/{len(common_ids)}] "
            f"Building graph for IDRiD_{image_id}"
        )

        try:

            result = build_graph(
                image_id
            )

            if result is None:

                print(
                    "  ✗ Could not build graph"
                )

                failed += 1

                continue

            graph, image, skeleton = result

            graph_path = save_graph(
                graph,
                image_id
            )

            # ------------------------------------------------
            # Visualization
            # ------------------------------------------------

            visualization_path = os.path.join(
                VISUALIZATION_DIR,
                f"IDRiD_{image_id}_graph.png"
            )

            visualize_graph(
                image,
                graph[
                    "nodes"
                ],
                graph[
                    "edges"
                ],
                visualization_path
            )

            features = graph[
                "features"
            ]

            vessel_nodes = features[
                "vessel_nodes"
            ]

            lesion_nodes = features[
                "lesion_nodes"
            ]

            landmark_nodes = features[
                "landmark_nodes"
            ]

            vessel_edges = features[
                "vessel_edges"
            ]

            spatial_edges = features[
                "spatial_edges"
            ]

            total_vessel_nodes += (
                vessel_nodes
            )

            total_lesion_nodes += (
                lesion_nodes
            )

            total_landmark_nodes += (
                landmark_nodes
            )

            total_vessel_edges += (
                vessel_edges
            )

            total_spatial_edges += (
                spatial_edges
            )

            lesion_counts = features[
                "lesion_counts"
            ]

            print(
                f"  Nodes: "
                f"{features['total_nodes']} | "
                f"Edges: "
                f"{features['total_edges']} | "
                f"Vessel: "
                f"{vessel_nodes} | "
                f"Lesions: "
                f"{lesion_nodes} | "
                f"Landmarks: "
                f"{landmark_nodes}"
            )

            print(
                f"  Vessel edges: "
                f"{vessel_edges} | "
                f"Spatial edges: "
                f"{spatial_edges}"
            )

            print(
                f"  Lesions: "
                f"{lesion_counts}"
            )

            print(
                f"  Mean tortuosity: "
                f"{features['mean_vessel_tortuosity']:.4f}"
            )

            summaries.append({

                "image_id":
                    image_id,

                "total_nodes":
                    features[
                        "total_nodes"
                    ],

                "vessel_nodes":
                    vessel_nodes,

                "lesion_nodes":
                    lesion_nodes,

                "landmark_nodes":
                    landmark_nodes,

                "total_edges":
                    features[
                        "total_edges"
                    ],

                "vessel_edges":
                    vessel_edges,

                "spatial_edges":
                    spatial_edges,

                "endpoint_count":
                    features[
                        "endpoint_count"
                    ],

                "junction_count":
                    features[
                        "junction_count"
                    ],

                "vessel_density":
                    features[
                        "skeleton_vessel_density"
                    ],

                "mean_edge_length":
                    features[
                        "mean_vessel_edge_length"
                    ],

                "mean_tortuosity":
                    features[
                        "mean_vessel_tortuosity"
                    ],

                "optic_disc_present":
                    any(
                        node.get(
                            "landmark_type"
                        )
                        ==
                        "optic_disc"
                        for node in graph[
                            "nodes"
                        ]
                    ),

                "fovea_present":
                    any(
                        node.get(
                            "landmark_type"
                        )
                        ==
                        "fovea"
                        for node in graph[
                            "nodes"
                        ]
                    ),

                "MA":
                    lesion_counts.get(
                        "MA",
                        0
                    ),

                "EX":
                    lesion_counts.get(
                        "EX",
                        0
                    ),

                "HE":
                    lesion_counts.get(
                        "HE",
                        0
                    ),

                "SE":
                    lesion_counts.get(
                        "SE",
                        0
                    ),

                "graph_path":
                    graph_path,

                "visualization_path":
                    visualization_path
            })

            successful += 1

        except Exception as error:

            failed += 1

            print(
                f"  ✗ ERROR: {error}"
            )

        print()

    # ========================================================
    # SUMMARY STATISTICS
    # ========================================================

    if summaries:

        avg_nodes = np.mean(
            [
                x[
                    "total_nodes"
                ]
                for x in summaries
            ]
        )

        avg_edges = np.mean(
            [
                x[
                    "total_edges"
                ]
                for x in summaries
            ]
        )

        avg_vessel_nodes = np.mean(
            [
                x[
                    "vessel_nodes"
                ]
                for x in summaries
            ]
        )

        avg_lesions = np.mean(
            [
                x[
                    "lesion_nodes"
                ]
                for x in summaries
            ]
        )

        avg_landmarks = np.mean(
            [
                x[
                    "landmark_nodes"
                ]
                for x in summaries
            ]
        )

        avg_tortuosity = np.mean(
            [
                x[
                    "mean_tortuosity"
                ]
                for x in summaries
            ]
        )

        avg_density = np.mean(
            [
                x[
                    "vessel_density"
                ]
                for x in summaries
            ]
        )

    else:

        avg_nodes = 0
        avg_edges = 0
        avg_vessel_nodes = 0
        avg_lesions = 0
        avg_landmarks = 0
        avg_tortuosity = 0
        avg_density = 0

    # ========================================================
    # JSON SUMMARY
    # ========================================================

    final_summary = {

        "project":
            "RETINA-FUSION 360",

        "module":
            "Final IDRiD Multimodal Retinal Graph",

        "dataset":
            "IDRiD",

        "images_available":
            len(image_files),

        "same_image_graphs_attempted":
            len(common_ids),

        "graphs_successful":
            successful,

        "graphs_failed":
            failed,

        "average_total_nodes_per_image":
            float(
                avg_nodes
            ),

        "average_total_edges_per_image":
            float(
                avg_edges
            ),

        "average_vessel_nodes_per_image":
            float(
                avg_vessel_nodes
            ),

        "average_lesion_nodes_per_image":
            float(
                avg_lesions
            ),

        "average_landmark_nodes_per_image":
            float(
                avg_landmarks
            ),

        "average_vessel_tortuosity":
            float(
                avg_tortuosity
            ),

        "average_skeleton_vessel_density":
            float(
                avg_density
            ),

        "total_vessel_nodes":
            int(
                total_vessel_nodes
            ),

        "total_lesion_nodes":
            int(
                total_lesion_nodes
            ),

        "total_landmark_nodes":
            int(
                total_landmark_nodes
            ),

        "total_vessel_edges":
            int(
                total_vessel_edges
            ),

        "total_spatial_edges":
            int(
                total_spatial_edges
            ),

        "output_graph_directory":
            GRAPH_DIR,

        "output_visualization_directory":
            VISUALIZATION_DIR,

        "scientific_note":
            "This graph integrates vessel predictions, lesion detections, and available anatomical landmarks from the same IDRiD image. Vessel predictions are transferred from a DRIVE-trained model and are therefore not independently validated on IDRiD in this pipeline."
    }

    with open(
        SUMMARY_JSON,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            final_summary,
            file,
            indent=2
        )

    # ========================================================
    # CSV SUMMARY
    # ========================================================

    if summaries:

        import csv

        fieldnames = list(
            summaries[0].keys()
        )

        with open(
            SUMMARY_CSV,
            "w",
            newline="",
            encoding="utf-8"
        ) as file:

            writer = csv.DictWriter(
                file,
                fieldnames=fieldnames
            )

            writer.writeheader()

            writer.writerows(
                summaries
            )

    # ========================================================
    # FINAL REPORT
    # ========================================================

    print()
    print("=" * 75)
    print("FINAL IDRiD MULTIMODAL GRAPH COMPLETE")
    print("=" * 75)
    print()

    print(
        f"Graphs successful: "
        f"{successful}/{len(common_ids)}"
    )

    print(
        f"Graphs failed: "
        f"{failed}"
    )

    print()

    print(
        f"Average nodes/image: "
        f"{avg_nodes:.2f}"
    )

    print(
        f"Average edges/image: "
        f"{avg_edges:.2f}"
    )

    print(
        f"Average vessel nodes/image: "
        f"{avg_vessel_nodes:.2f}"
    )

    print(
        f"Average lesion nodes/image: "
        f"{avg_lesions:.2f}"
    )

    print(
        f"Average landmark nodes/image: "
        f"{avg_landmarks:.2f}"
    )

    print(
        f"Average vessel tortuosity: "
        f"{avg_tortuosity:.4f}"
    )

    print(
        f"Average vessel density: "
        f"{avg_density:.6f}"
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
        VISUALIZATION_DIR
    )

    print()

    print(
        "Summary:"
    )

    print(
        SUMMARY_JSON
    )

    print()

    print(
        "CSV:"
    )

    print(
        SUMMARY_CSV
    )

    print()

    print(
        "✓ RETINAL GRAPH MODULE READY"
    )

    print()


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()