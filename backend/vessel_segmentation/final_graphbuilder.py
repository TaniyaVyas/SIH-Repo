import os
import cv2
import json
import math
import numpy as np
from collections import deque


# ============================================================
# RETINA-FUSION 360
# FINAL RETINAL GRAPH BUILDER
#
# FINAL PIPELINE:
#
# Final Vessel Mask
#       ↓
# Final Skeleton
#       ↓
# FOV restriction
#       ↓
# Node detection
#       ↓
# Node clustering
#       ↓
# Vessel path tracing
#       ↓
# Graph edges
#       ↓
# Length + tortuosity + connectivity
#       ↓
# FINAL RETINAL GRAPH
#
# NOTE:
# This is a vessel-topology graph.
# Lesion nodes and anatomical landmarks will be added
# in the multimodal graph stage using IDRiD.
# ============================================================


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = r"D:\RETINA-FUSION-360"

SKELETON_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "vessel_segmentation_final",
    "skeletons"
)

FOV_DIR = os.path.join(
    PROJECT_ROOT,
    "datasets",
    "Drive",
    "test",
    "test",
    "mask"
)

OUTPUT_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "retinal_graph_final"
)

GRAPH_DIR = os.path.join(
    OUTPUT_DIR,
    "graphs"
)

VIS_DIR = os.path.join(
    OUTPUT_DIR,
    "visualizations"
)

os.makedirs(
    GRAPH_DIR,
    exist_ok=True
)

os.makedirs(
    VIS_DIR,
    exist_ok=True
)


# ============================================================
# PARAMETERS
# ============================================================

NODE_CLUSTER_DISTANCE = 3

MIN_EDGE_LENGTH = 8

MIN_COMPONENT_SIZE = 30

NEIGHBOR_OFFSETS = [
    (-1, -1),
    (-1, 0),
    (-1, 1),
    (0, -1),
    (0, 1),
    (1, -1),
    (1, 0),
    (1, 1)
]


# ============================================================
# LOAD BINARY IMAGE
# ============================================================

def load_binary(path):

    image = cv2.imread(
        path,
        cv2.IMREAD_GRAYSCALE
    )

    if image is None:

        raise FileNotFoundError(
            f"Could not read: {path}"
        )

    return (
        image > 127
    ).astype(np.uint8)


# ============================================================
# APPLY FOV
# ============================================================

def apply_fov(
    skeleton,
    fov
):

    if skeleton.shape != fov.shape:

        fov = cv2.resize(
            fov,
            (
                skeleton.shape[1],
                skeleton.shape[0]
            ),
            interpolation=cv2.INTER_NEAREST
        )

    return (
        skeleton *
        (fov > 0).astype(np.uint8)
    )


# ============================================================
# REMOVE SMALL COMPONENTS
# ============================================================

def remove_small_components(
    skeleton
):

    binary = (
        skeleton * 255
    ).astype(np.uint8)

    num_labels, labels, stats, _ = (
        cv2.connectedComponentsWithStats(
            binary,
            connectivity=8
        )
    )

    cleaned = np.zeros_like(
        skeleton,
        dtype=np.uint8
    )

    kept = 0

    for label in range(
        1,
        num_labels
    ):

        area = stats[
            label,
            cv2.CC_STAT_AREA
        ]

        if area >= MIN_COMPONENT_SIZE:

            cleaned[
                labels == label
            ] = 1

            kept += 1

    return cleaned, kept


# ============================================================
# GET 8-CONNECTED NEIGHBORS
# ============================================================

def get_neighbors(
    y,
    x,
    skeleton
):

    height, width = skeleton.shape

    neighbors = []

    for dy, dx in NEIGHBOR_OFFSETS:

        ny = y + dy
        nx = x + dx

        if (
            0 <= ny < height
            and
            0 <= nx < width
            and
            skeleton[ny, nx] > 0
        ):

            neighbors.append(
                (ny, nx)
            )

    return neighbors


# ============================================================
# CALCULATE DEGREES
# ============================================================

def calculate_degrees(
    skeleton
):

    degrees = {}

    ys, xs = np.where(
        skeleton > 0
    )

    for y, x in zip(
        ys,
        xs
    ):

        point = (
            int(y),
            int(x)
        )

        degrees[point] = len(
            get_neighbors(
                y,
                x,
                skeleton
            )
        )

    return degrees


# ============================================================
# FIND ENDPOINTS + JUNCTIONS
# ============================================================

def find_nodes(
    skeleton
):

    degrees = calculate_degrees(
        skeleton
    )

    endpoints = []

    junctions = []

    for point, degree in degrees.items():

        if degree == 1:

            endpoints.append(
                point
            )

        elif degree >= 3:

            junctions.append(
                point
            )

    return (
        endpoints,
        junctions,
        degrees
    )


# ============================================================
# CLUSTER NODE PIXELS
# ============================================================

def cluster_pixels(
    pixels
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

            for dy in range(
                -NODE_CLUSTER_DISTANCE,
                NODE_CLUSTER_DISTANCE + 1
            ):

                for dx in range(
                    -NODE_CLUSTER_DISTANCE,
                    NODE_CLUSTER_DISTANCE + 1
                ):

                    if (
                        dy == 0
                        and
                        dx == 0
                    ):

                        continue

                    candidate = (
                        cy + dy,
                        cx + dx
                    )

                    if (
                        candidate in pixel_set
                        and
                        candidate not in visited
                    ):

                        visited.add(
                            candidate
                        )

                        queue.append(
                            candidate
                        )

        clusters.append(
            cluster
        )

    return clusters


# ============================================================
# CREATE GRAPH NODES
# ============================================================

def create_graph_nodes(
    endpoints,
    junctions
):

    endpoint_clusters = cluster_pixels(
        endpoints
    )

    junction_clusters = cluster_pixels(
        junctions
    )

    nodes = []

    pixel_to_node = {}

    # --------------------------------------------------------
    # Endpoints
    # --------------------------------------------------------

    for cluster in endpoint_clusters:

        ys = [
            p[0]
            for p in cluster
        ]

        xs = [
            p[1]
            for p in cluster
        ]

        node_id = len(nodes)

        nodes.append({

            "id": node_id,

            "type": "endpoint",

            "x": float(
                np.mean(xs)
            ),

            "y": float(
                np.mean(ys)
            ),

            "pixel_count": len(
                cluster
            )
        })

        for pixel in cluster:

            pixel_to_node[
                pixel
            ] = node_id

    # --------------------------------------------------------
    # Junctions
    # --------------------------------------------------------

    for cluster in junction_clusters:

        ys = [
            p[0]
            for p in cluster
        ]

        xs = [
            p[1]
            for p in cluster
        ]

        node_id = len(nodes)

        nodes.append({

            "id": node_id,

            "type": "junction",

            "x": float(
                np.mean(xs)
            ),

            "y": float(
                np.mean(ys)
            ),

            "pixel_count": len(
                cluster
            )
        })

        for pixel in cluster:

            pixel_to_node[
                pixel
            ] = node_id

    return (
        nodes,
        pixel_to_node
    )


# ============================================================
# PIXEL DISTANCE
# ============================================================

def pixel_distance(
    p1,
    p2
):

    y1, x1 = p1

    y2, x2 = p2

    return math.sqrt(
        (x2 - x1) ** 2
        +
        (y2 - y1) ** 2
    )


# ============================================================
# PATH LENGTH
# ============================================================

def path_length(
    path
):

    length = 0.0

    for i in range(
        1,
        len(path)
    ):

        length += pixel_distance(
            path[i - 1],
            path[i]
        )

    return length


# ============================================================
# TORTUOSITY
# ============================================================

def path_tortuosity(
    path
):

    actual_length = path_length(
        path
    )

    straight_distance = pixel_distance(
        path[0],
        path[-1]
    )

    if straight_distance <= 0:

        return 1.0

    return (
        actual_length /
        straight_distance
    )


# ============================================================
# TRACE ONE VESSEL SEGMENT
# ============================================================

def trace_segment(
    start_pixel,
    next_pixel,
    start_node,
    skeleton,
    pixel_to_node,
    node_pixels,
    visited
):

    path = [
        start_pixel,
        next_pixel
    ]

    first_key = tuple(
        sorted(
            [
                start_pixel,
                next_pixel
            ]
        )
    )

    visited.add(
        first_key
    )

    previous = start_pixel

    current = next_pixel

    end_node = None

    while True:

        # ----------------------------------------------------
        # Another node reached
        # ----------------------------------------------------

        if (
            current in node_pixels
            and
            current != start_pixel
        ):

            end_node = pixel_to_node[
                current
            ]

            break

        neighbors = get_neighbors(
            current[0],
            current[1],
            skeleton
        )

        candidates = [
            p
            for p in neighbors
            if p != previous
        ]

        if not candidates:

            break

        next_point = None

        for candidate in candidates:

            key = tuple(
                sorted(
                    [
                        current,
                        candidate
                    ]
                )
            )

            if key not in visited:

                next_point = candidate

                break

        if next_point is None:

            break

        key = tuple(
            sorted(
                [
                    current,
                    next_point
                ]
            )
        )

        visited.add(
            key
        )

        path.append(
            next_point
        )

        previous = current

        current = next_point

    return (
        path,
        end_node
    )


# ============================================================
# TRACE ALL GRAPH EDGES
# ============================================================

def trace_edges(
    skeleton,
    nodes,
    pixel_to_node
):

    node_pixels = set(
        pixel_to_node.keys()
    )

    visited = set()

    edges = []

    for start_pixel, start_node in pixel_to_node.items():

        neighbors = get_neighbors(
            start_pixel[0],
            start_pixel[1],
            skeleton
        )

        for next_pixel in neighbors:

            key = tuple(
                sorted(
                    [
                        start_pixel,
                        next_pixel
                    ]
                )
            )

            if key in visited:

                continue

            (
                path,
                end_node
            ) = trace_segment(
                start_pixel,
                next_pixel,
                start_node,
                skeleton,
                pixel_to_node,
                node_pixels,
                visited
            )

            if end_node is None:

                continue

            if end_node == start_node:

                continue

            if len(path) < 2:

                continue

            length = path_length(
                path
            )

            if length < MIN_EDGE_LENGTH:

                continue

            euclidean = pixel_distance(
                path[0],
                path[-1]
            )

            tortuosity = path_tortuosity(
                path
            )

            edge_id = len(edges)

            edges.append({

                "id": edge_id,

                "source": int(
                    start_node
                ),

                "target": int(
                    end_node
                ),

                "pixel_count": len(
                    path
                ),

                "length": float(
                    length
                ),

                "euclidean_distance": float(
                    euclidean
                ),

                "tortuosity": float(
                    tortuosity
                )
            })

    return edges


# ============================================================
# NODE DEGREES
# ============================================================

def add_node_degrees(
    nodes,
    edges
):

    degree_map = {
        node["id"]: 0
        for node in nodes
    }

    for edge in edges:

        source = edge["source"]

        target = edge["target"]

        if source in degree_map:

            degree_map[source] += 1

        if target in degree_map:

            degree_map[target] += 1

    for node in nodes:

        node["graph_degree"] = int(
            degree_map[
                node["id"]
            ]
        )

    return degree_map


# ============================================================
# CONNECTED COMPONENTS
# ============================================================

def count_connected_components(
    nodes,
    edges
):

    if not nodes:

        return 0

    adjacency = {
        node["id"]: []
        for node in nodes
    }

    for edge in edges:

        a = edge["source"]

        b = edge["target"]

        if (
            a in adjacency
            and
            b in adjacency
        ):

            adjacency[a].append(
                b
            )

            adjacency[b].append(
                a
            )

    visited = set()

    components = 0

    for node in nodes:

        node_id = node["id"]

        if node_id in visited:

            continue

        components += 1

        queue = deque(
            [node_id]
        )

        visited.add(
            node_id
        )

        while queue:

            current = queue.popleft()

            for neighbor in adjacency[
                current
            ]:

                if neighbor not in visited:

                    visited.add(
                        neighbor
                    )

                    queue.append(
                        neighbor
                    )

    return components


# ============================================================
# GRAPH FEATURES
# ============================================================

def calculate_features(
    skeleton,
    nodes,
    edges,
    components,
    raw_components
):

    height, width = skeleton.shape

    total_pixels = (
        height *
        width
    )

    vessel_pixels = int(
        np.sum(
            skeleton > 0
        )
    )

    vessel_density = (
        vessel_pixels /
        total_pixels
        if total_pixels > 0
        else 0.0
    )

    endpoint_count = sum(
        1
        for node in nodes
        if node["type"] == "endpoint"
    )

    junction_count = sum(
        1
        for node in nodes
        if node["type"] == "junction"
    )

    lengths = [
        edge["length"]
        for edge in edges
    ]

    tortuosities = [
        edge["tortuosity"]
        for edge in edges
    ]

    degrees = [
        node.get(
            "graph_degree",
            0
        )
        for node in nodes
    ]

    if lengths:

        mean_length = float(
            np.mean(
                lengths
            )
        )

        median_length = float(
            np.median(
                lengths
            )
        )

        maximum_length = float(
            np.max(
                lengths
            )
        )

        total_length = float(
            np.sum(
                lengths
            )
        )

    else:

        mean_length = 0.0

        median_length = 0.0

        maximum_length = 0.0

        total_length = 0.0

    if tortuosities:

        mean_tortuosity = float(
            np.mean(
                tortuosities
            )
        )

        median_tortuosity = float(
            np.median(
                tortuosities
            )
        )

        maximum_tortuosity = float(
            np.max(
                tortuosities
            )
        )

        tortuosity_std = float(
            np.std(
                tortuosities
            )
        )

    else:

        mean_tortuosity = 0.0

        median_tortuosity = 0.0

        maximum_tortuosity = 0.0

        tortuosity_std = 0.0

    if degrees:

        mean_degree = float(
            np.mean(
                degrees
            )
        )

        maximum_degree = int(
            np.max(
                degrees
            )
        )

    else:

        mean_degree = 0.0

        maximum_degree = 0

    branching_ratio = (
        junction_count /
        max(
            endpoint_count,
            1
        )
    )

    junction_density = (
        junction_count /
        max(
            vessel_pixels,
            1
        )
    )

    endpoint_density = (
        endpoint_count /
        max(
            vessel_pixels,
            1
        )
    )

    return {

        "image_height":
            int(height),

        "image_width":
            int(width),

        "vessel_pixels":
            vessel_pixels,

        "vessel_density":
            float(
                vessel_density
            ),

        "node_count":
            int(
                len(nodes)
            ),

        "edge_count":
            int(
                len(edges)
            ),

        "endpoint_count":
            int(
                endpoint_count
            ),

        "junction_count":
            int(
                junction_count
            ),

        "raw_connected_components":
            int(
                raw_components
            ),

        "graph_connected_components":
            int(
                components
            ),

        "average_node_degree":
            float(
                mean_degree
            ),

        "maximum_node_degree":
            int(
                maximum_degree
            ),

        "branching_ratio":
            float(
                branching_ratio
            ),

        "junction_density":
            float(
                junction_density
            ),

        "endpoint_density":
            float(
                endpoint_density
            ),

        "mean_edge_length":
            float(
                mean_length
            ),

        "median_edge_length":
            float(
                median_length
            ),

        "maximum_edge_length":
            float(
                maximum_length
            ),

        "total_edge_length":
            float(
                total_length
            ),

        "mean_tortuosity":
            float(
                mean_tortuosity
            ),

        "median_tortuosity":
            float(
                median_tortuosity
            ),

        "maximum_tortuosity":
            float(
                maximum_tortuosity
            ),

        "tortuosity_std":
            float(
                tortuosity_std
            )
    }


# ============================================================
# VISUALIZATION
# ============================================================

def create_visualization(
    skeleton,
    nodes,
    edges,
    image_name
):

    height, width = skeleton.shape

    canvas = np.zeros(
        (
            height,
            width,
            3
        ),
        dtype=np.uint8
    )

    # --------------------------------------------------------
    # Skeleton
    # --------------------------------------------------------

    canvas[
        skeleton > 0
    ] = (
        255,
        255,
        255
    )

    # --------------------------------------------------------
    # Edges
    # --------------------------------------------------------

    for edge in edges:

        source = nodes[
            edge["source"]
        ]

        target = nodes[
            edge["target"]
        ]

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

        cv2.line(
            canvas,
            (x1, y1),
            (x2, y2),
            (255, 0, 0),
            1
        )

    # --------------------------------------------------------
    # Nodes
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

        if not (
            0 <= x < width
            and
            0 <= y < height
        ):

            continue

        if node["type"] == "junction":

            # Junction = green
            cv2.circle(
                canvas,
                (x, y),
                5,
                (0, 255, 0),
                -1
            )

        else:

            # Endpoint = red
            cv2.circle(
                canvas,
                (x, y),
                3,
                (0, 0, 255),
                -1
            )

    # --------------------------------------------------------
    # Header
    # --------------------------------------------------------

    cv2.rectangle(
        canvas,
        (0, 0),
        (width, 45),
        (0, 0, 0),
        -1
    )

    cv2.putText(
        canvas,
        "RETINA-FUSION 360 | FINAL RETINAL GRAPH",
        (15, 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (255, 255, 255),
        2,
        cv2.LINE_AA
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    output_name = image_name.replace(
        ".png",
        "_retinal_graph_final.png"
    )

    output_path = os.path.join(
        VIS_DIR,
        output_name
    )

    cv2.imwrite(
        output_path,
        canvas
    )

    return output_path


# ============================================================
# BUILD ONE GRAPH
# ============================================================

def build_graph(
    skeleton_path
):

    filename = os.path.basename(
        skeleton_path
    )

    image_number = filename.split(
        "_"
    )[0]

    # --------------------------------------------------------
    # Load skeleton
    # --------------------------------------------------------

    skeleton = load_binary(
        skeleton_path
    )

    # --------------------------------------------------------
    # FOV
    # --------------------------------------------------------

    fov_path = os.path.join(
        FOV_DIR,
        f"{image_number}_test_mask.gif"
    )

    fov_applied = False

    if os.path.exists(
        fov_path
    ):

        fov = load_binary(
            fov_path
        )

        skeleton = apply_fov(
            skeleton,
            fov
        )

        fov_applied = True

    # --------------------------------------------------------
    # Remove tiny components
    # --------------------------------------------------------

    (
        skeleton,
        raw_components
    ) = remove_small_components(
        skeleton
    )

    # --------------------------------------------------------
    # Detect nodes
    # --------------------------------------------------------

    (
        endpoints,
        junctions,
        degrees
    ) = find_nodes(
        skeleton
    )

    # --------------------------------------------------------
    # Graph nodes
    # --------------------------------------------------------

    (
        nodes,
        pixel_to_node
    ) = create_graph_nodes(
        endpoints,
        junctions
    )

    # --------------------------------------------------------
    # Graph edges
    # --------------------------------------------------------

    edges = trace_edges(
        skeleton,
        nodes,
        pixel_to_node
    )

    # --------------------------------------------------------
    # Node degrees
    # --------------------------------------------------------

    add_node_degrees(
        nodes,
        edges
    )

    # --------------------------------------------------------
    # Connected components
    # --------------------------------------------------------

    components = count_connected_components(
        nodes,
        edges
    )

    # --------------------------------------------------------
    # Features
    # --------------------------------------------------------

    features = calculate_features(
        skeleton,
        nodes,
        edges,
        components,
        raw_components
    )

    # --------------------------------------------------------
    # Visualization
    # --------------------------------------------------------

    visualization = create_visualization(
        skeleton,
        nodes,
        edges,
        filename
    )

    # --------------------------------------------------------
    # Final graph object
    # --------------------------------------------------------

    graph = {

        "image_id":
            image_number,

        "source_dataset":
            "DRIVE",

        "graph_version":
            "FINAL_1.0",

        "fov_applied":
            fov_applied,

        "nodes":
            nodes,

        "edges":
            edges,

        "features":
            features,

        "visualization":
            visualization
    }

    return graph


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)

    print(
        "RETINA-FUSION 360"
    )

    print(
        "FINAL RETINAL GRAPH CONSTRUCTION"
    )

    print("=" * 70)

    print()

    print(
        "Input skeleton directory:"
    )

    print(
        SKELETON_DIR
    )

    print()

    print(
        "Output directory:"
    )

    print(
        OUTPUT_DIR
    )

    print()

    # --------------------------------------------------------
    # Find skeletons
    # --------------------------------------------------------

    if not os.path.exists(
        SKELETON_DIR
    ):

        print(
            "ERROR: Skeleton directory does not exist."
        )

        return

    skeleton_files = sorted(
        [
            f
            for f in os.listdir(
                SKELETON_DIR
            )
            if f.lower().endswith(
                ".png"
            )
        ]
    )

    print(
        f"Final skeletons found: "
        f"{len(skeleton_files)}"
    )

    print()

    if not skeleton_files:

        print(
            "ERROR: No skeletons found."
        )

        return

    summary = []

    # --------------------------------------------------------
    # Process
    # --------------------------------------------------------

    for index, filename in enumerate(
        skeleton_files,
        1
    ):

        print(
            f"[{index}/{len(skeleton_files)}] "
            f"{filename}"
        )

        path = os.path.join(
            SKELETON_DIR,
            filename
        )

        try:

            graph = build_graph(
                path
            )

            output_name = filename.replace(
                ".png",
                "_retinal_graph_final.json"
            )

            graph_path = os.path.join(
                GRAPH_DIR,
                output_name
            )

            with open(
                graph_path,
                "w",
                encoding="utf-8"
            ) as file:

                json.dump(
                    graph,
                    file,
                    indent=2
                )

            features = graph[
                "features"
            ]

            summary.append({

                "image_id":
                    graph["image_id"],

                "nodes":
                    features[
                        "node_count"
                    ],

                "edges":
                    features[
                        "edge_count"
                    ],

                "endpoints":
                    features[
                        "endpoint_count"
                    ],

                "junctions":
                    features[
                        "junction_count"
                    ],

                "components":
                    features[
                        "graph_connected_components"
                    ],

                "vessel_density":
                    features[
                        "vessel_density"
                    ],

                "mean_edge_length":
                    features[
                        "mean_edge_length"
                    ],

                "mean_tortuosity":
                    features[
                        "mean_tortuosity"
                    ]
            })

            print(
                f"    Nodes: "
                f"{features['node_count']}"
            )

            print(
                f"    Edges: "
                f"{features['edge_count']}"
            )

            print(
                f"    Endpoints: "
                f"{features['endpoint_count']}"
            )

            print(
                f"    Junctions: "
                f"{features['junction_count']}"
            )

            print(
                f"    Components: "
                f"{features['graph_connected_components']}"
            )

            print(
                f"    Vessel density: "
                f"{features['vessel_density']:.6f}"
            )

            print(
                f"    Mean edge length: "
                f"{features['mean_edge_length']:.2f}"
            )

            print(
                f"    Mean tortuosity: "
                f"{features['mean_tortuosity']:.4f}"
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
    # Save summary
    # --------------------------------------------------------

    summary_path = os.path.join(
        OUTPUT_DIR,
        "retinal_graph_final_summary.json"
    )

    with open(
        summary_path,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            summary,
            file,
            indent=2
        )

    # --------------------------------------------------------
    # Dataset statistics
    # --------------------------------------------------------

    if summary:

        node_values = [
            x["nodes"]
            for x in summary
        ]

        edge_values = [
            x["edges"]
            for x in summary
        ]

        tortuosity_values = [
            x["mean_tortuosity"]
            for x in summary
        ]

        density_values = [
            x["vessel_density"]
            for x in summary
        ]

        print()

        print("-" * 70)

        print(
            "FINAL DATASET GRAPH SUMMARY"
        )

        print("-" * 70)

        print(
            f"Images processed: "
            f"{len(summary)}"
        )

        print(
            f"Average nodes/image: "
            f"{np.mean(node_values):.2f}"
        )

        print(
            f"Average edges/image: "
            f"{np.mean(edge_values):.2f}"
        )

        print(
            f"Average tortuosity: "
            f"{np.mean(tortuosity_values):.4f}"
        )

        print(
            f"Average vessel density: "
            f"{np.mean(density_values):.6f}"
        )

    # --------------------------------------------------------
    # Complete
    # --------------------------------------------------------

    print()

    print("=" * 70)

    print(
        "FINAL RETINAL GRAPH CONSTRUCTION COMPLETE"
    )

    print("=" * 70)

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
        "Summary:"
    )

    print(
        summary_path
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()