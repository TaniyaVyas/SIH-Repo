import os
import cv2
import json
import math
import numpy as np
from collections import deque

# ============================================================
# RETINA-FUSION 360
# RETINAL GRAPH BUILDER v2
#
# Skeleton
#    ↓
# Nodes + Junctions
#    ↓
# Vessel path tracing
#    ↓
# Edges
#    ↓
# Length + Tortuosity + Connectivity
# ============================================================


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = r"D:\RETINA-FUSION-360"

SKELETON_DIR = os.path.join(
    PROJECT_ROOT,
    "results",
    "vessel_segmentation",
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
    "retinal_graph"
)

GRAPH_DIR = os.path.join(
    OUTPUT_DIR,
    "graphs"
)

VIS_DIR = os.path.join(
    OUTPUT_DIR,
    "visualizations"
)

os.makedirs(GRAPH_DIR, exist_ok=True)
os.makedirs(VIS_DIR, exist_ok=True)


# ============================================================
# PARAMETERS
# ============================================================

# Minimum vessel segment length.
# Very tiny fragments are usually skeleton noise.
MIN_EDGE_LENGTH = 5

# Distance used to merge nearby junction pixels.
NODE_CLUSTER_DISTANCE = 2


# ============================================================
# IMAGE LOADING
# ============================================================

def load_binary(path):
    """
    Load image as binary mask.
    """

    img = cv2.imread(
        path,
        cv2.IMREAD_GRAYSCALE
    )

    if img is None:
        raise FileNotFoundError(
            f"Could not read: {path}"
        )

    return (
        img > 127
    ).astype(np.uint8)


# ============================================================
# FOV APPLICATION
# ============================================================

def apply_fov(skeleton, fov):
    """
    Restrict skeleton to the retinal field of view.
    """

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
# 8-CONNECTED NEIGHBORS
# ============================================================

NEIGHBOR_OFFSETS = [
    (-1, -1),
    (-1,  0),
    (-1,  1),
    ( 0, -1),
    ( 0,  1),
    ( 1, -1),
    ( 1,  0),
    ( 1,  1)
]


def get_neighbors(y, x, skeleton):
    """
    Return 8-connected skeleton neighbors.
    """

    h, w = skeleton.shape

    neighbors = []

    for dy, dx in NEIGHBOR_OFFSETS:

        ny = y + dy
        nx = x + dx

        if (
            0 <= ny < h and
            0 <= nx < w and
            skeleton[ny, nx] > 0
        ):
            neighbors.append(
                (ny, nx)
            )

    return neighbors


# ============================================================
# SKELETON PIXEL DEGREE
# ============================================================

def calculate_degrees(skeleton):
    """
    Calculate degree for every skeleton pixel.

    degree = number of connected neighbors.

    1 -> endpoint
    2 -> normal vessel pixel
    >=3 -> junction
    """

    degrees = {}

    ys, xs = np.where(
        skeleton > 0
    )

    for y, x in zip(ys, xs):

        point = (int(y), int(x))

        neighbors = get_neighbors(
            y,
            x,
            skeleton
        )

        degrees[point] = len(
            neighbors
        )

    return degrees


# ============================================================
# FIND NODE PIXELS
# ============================================================

def find_node_pixels(skeleton):
    """
    Detect endpoint and junction pixels.
    """

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
    pixels,
    max_distance=2
):
    """
    Merge neighboring node pixels into
    one graph node.

    This prevents one physical junction
    from becoming many graph nodes.
    """

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
                -max_distance,
                max_distance + 1
            ):

                for dx in range(
                    -max_distance,
                    max_distance + 1
                ):

                    if (
                        dy == 0 and
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

def create_nodes(
    endpoint_pixels,
    junction_pixels
):
    """
    Create graph nodes and map every node pixel
    to its node ID.
    """

    endpoint_clusters = cluster_pixels(
        endpoint_pixels,
        NODE_CLUSTER_DISTANCE
    )

    junction_clusters = cluster_pixels(
        junction_pixels,
        NODE_CLUSTER_DISTANCE
    )

    nodes = []

    pixel_to_node = {}

    # --------------------------------------------------------
    # Endpoint nodes
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

        node = {
            "id": node_id,
            "type": "endpoint",
            "x": float(np.mean(xs)),
            "y": float(np.mean(ys)),
            "pixel_count": len(cluster)
        }

        nodes.append(
            node
        )

        for pixel in cluster:

            pixel_to_node[pixel] = node_id

    # --------------------------------------------------------
    # Junction nodes
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

        node = {
            "id": node_id,
            "type": "junction",
            "x": float(np.mean(xs)),
            "y": float(np.mean(ys)),
            "pixel_count": len(cluster)
        }

        nodes.append(
            node
        )

        for pixel in cluster:

            pixel_to_node[pixel] = node_id

    return (
        nodes,
        pixel_to_node
    )


# ============================================================
# DISTANCE BETWEEN PIXELS
# ============================================================

def pixel_distance(p1, p2):
    """
    Euclidean distance between two pixels.
    """

    y1, x1 = p1
    y2, x2 = p2

    return math.sqrt(
        (x2 - x1) ** 2 +
        (y2 - y1) ** 2
    )


# ============================================================
# TRACE VESSEL SEGMENTS
# ============================================================

def trace_edges(
    skeleton,
    nodes,
    pixel_to_node,
    degrees
):
    """
    Trace skeleton paths from graph nodes.

    A path starts at a node and continues until
    another node is reached.

    Each path becomes an edge.
    """

    node_pixels = set(
        pixel_to_node.keys()
    )

    visited_segments = set()

    edges = []

    # --------------------------------------------------------
    # Start tracing from every node pixel
    # --------------------------------------------------------

    for start_pixel, start_node in pixel_to_node.items():

        neighbors = get_neighbors(
            start_pixel[0],
            start_pixel[1],
            skeleton
        )

        for first_neighbor in neighbors:

            segment_key = tuple(
                sorted(
                    [
                        start_pixel,
                        first_neighbor
                    ]
                )
            )

            if segment_key in visited_segments:
                continue

            path = [
                start_pixel,
                first_neighbor
            ]

            visited_segments.add(
                segment_key
            )

            previous = start_pixel
            current = first_neighbor

            end_node = None

            while True:

                # ------------------------------------------------
                # Have we reached another graph node?
                # ------------------------------------------------

                if (
                    current in node_pixels
                    and
                    current != start_pixel
                ):

                    end_node = pixel_to_node[
                        current
                    ]

                    break

                # ------------------------------------------------
                # Continue along skeleton
                # ------------------------------------------------

                neighbors = get_neighbors(
                    current[0],
                    current[1],
                    skeleton
                )

                # Remove previous pixel
                next_pixels = [
                    p
                    for p in neighbors
                    if p != previous
                ]

                if not next_pixels:

                    break

                # ------------------------------------------------
                # Choose continuation
                #
                # Normally a skeleton vessel has
                # one continuation.
                # ------------------------------------------------

                if len(next_pixels) == 1:

                    next_pixel = next_pixels[0]

                else:

                    # At an unexpected branch, choose the
                    # first unvisited continuation.
                    next_pixel = None

                    for candidate in next_pixels:

                        key = tuple(
                            sorted(
                                [
                                    current,
                                    candidate
                                ]
                            )
                        )

                        if key not in visited_segments:

                            next_pixel = candidate

                            break

                    if next_pixel is None:
                        break

                # ------------------------------------------------
                # Mark segment as visited
                # ------------------------------------------------

                segment_key = tuple(
                    sorted(
                        [
                            current,
                            next_pixel
                        ]
                    )
                )

                if segment_key in visited_segments:
                    break

                visited_segments.add(
                    segment_key
                )

                path.append(
                    next_pixel
                )

                previous = current
                current = next_pixel

            # ----------------------------------------------------
            # Valid edge?
            # ----------------------------------------------------

            if (
                end_node is not None
                and
                end_node != start_node
                and
                len(path) >= 2
            ):

                edge = create_edge(
                    start_node,
                    end_node,
                    path,
                    len(edges)
                )

                if (
                    edge["length"] >=
                    MIN_EDGE_LENGTH
                ):

                    edges.append(
                        edge
                    )

    return edges


# ============================================================
# EDGE FEATURES
# ============================================================

def calculate_path_length(path):
    """
    Calculate length following the skeleton.
    """

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


def calculate_euclidean_distance(
    path
):
    """
    Straight-line distance between
    edge endpoints.
    """

    return pixel_distance(
        path[0],
        path[-1]
    )


def calculate_tortuosity(path):
    """
    Tortuosity = actual vessel path length /
                 straight-line distance.

    Straight vessel ≈ 1
    More curved vessel > 1
    """

    path_length = calculate_path_length(
        path
    )

    euclidean = calculate_euclidean_distance(
        path
    )

    if euclidean <= 0:
        return 1.0

    return path_length / euclidean


def create_edge(
    start_node,
    end_node,
    path,
    edge_id
):
    """
    Create graph edge.
    """

    length = calculate_path_length(
        path
    )

    euclidean = calculate_euclidean_distance(
        path
    )

    tortuosity = calculate_tortuosity(
        path
    )

    return {
        "id": edge_id,
        "source": start_node,
        "target": end_node,
        "pixel_count": len(path),
        "length": float(length),
        "euclidean_distance": float(euclidean),
        "tortuosity": float(tortuosity)
    }


# ============================================================
# CONNECTIVITY
# ============================================================

def calculate_connectivity(
    nodes,
    edges
):
    """
    Calculate node degree and graph connectivity.
    """

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

        node["graph_degree"] = degree_map[
            node["id"]
        ]

    connected_components = 0

    if nodes:

        adjacency = {
            node["id"]: []
            for node in nodes
        }

        for edge in edges:

            a = edge["source"]
            b = edge["target"]

            adjacency[a].append(b)
            adjacency[b].append(a)

        visited = set()

        for node in nodes:

            node_id = node["id"]

            if node_id in visited:
                continue

            connected_components += 1

            queue = deque(
                [node_id]
            )

            visited.add(
                node_id
            )

            while queue:

                current = queue.popleft()

                for neighbor in adjacency[current]:

                    if neighbor not in visited:

                        visited.add(
                            neighbor
                        )

                        queue.append(
                            neighbor
                        )

    return connected_components


# ============================================================
# GRAPH-LEVEL FEATURES
# ============================================================

def calculate_graph_features(
    skeleton,
    nodes,
    edges
):
    """
    Extract graph-level retinal features.
    """

    h, w = skeleton.shape

    total_pixels = h * w

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

    edge_lengths = [
        edge["length"]
        for edge in edges
    ]

    tortuosities = [
        edge["tortuosity"]
        for edge in edges
    ]

    if edge_lengths:

        mean_edge_length = float(
            np.mean(
                edge_lengths
            )
        )

        median_edge_length = float(
            np.median(
                edge_lengths
            )
        )

        max_edge_length = float(
            np.max(
                edge_lengths
            )
        )

    else:

        mean_edge_length = 0.0
        median_edge_length = 0.0
        max_edge_length = 0.0

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

        max_tortuosity = float(
            np.max(
                tortuosities
            )
        )

    else:

        mean_tortuosity = 0.0
        median_tortuosity = 0.0
        max_tortuosity = 0.0

    connected_components = calculate_connectivity(
        nodes,
        edges
    )

    total_graph_degree = sum(
        node.get(
            "graph_degree",
            0
        )
        for node in nodes
    )

    average_node_degree = (
        total_graph_degree /
        len(nodes)
        if nodes
        else 0.0
    )

    branching_ratio = (
        junction_count /
        max(endpoint_count, 1)
    )

    return {
        "image_height": int(h),
        "image_width": int(w),

        "vessel_pixels": vessel_pixels,

        "vessel_density": float(
            vessel_density
        ),

        "node_count": len(nodes),

        "endpoint_count": endpoint_count,

        "junction_count": junction_count,

        "edge_count": len(edges),

        "connected_components": int(
            connected_components
        ),

        "average_node_degree": float(
            average_node_degree
        ),

        "branching_ratio": float(
            branching_ratio
        ),

        "mean_edge_length": float(
            mean_edge_length
        ),

        "median_edge_length": float(
            median_edge_length
        ),

        "max_edge_length": float(
            max_edge_length
        ),

        "mean_tortuosity": float(
            mean_tortuosity
        ),

        "median_tortuosity": float(
            median_tortuosity
        ),

        "max_tortuosity": float(
            max_tortuosity
        )
    }


# ============================================================
# GRAPH VISUALIZATION
# ============================================================

def create_visualization(
    skeleton,
    nodes,
    edges,
    image_name
):
    """
    Draw graph over the skeleton.
    """

    h, w = skeleton.shape

    canvas = np.zeros(
        (
            h,
            w,
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

        source_id = edge["source"]
        target_id = edge["target"]

        source = nodes[
            source_id
        ]

        target = nodes[
            target_id
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

        if (
            0 <= x < w
            and
            0 <= y < h
        ):

            if node["type"] == "endpoint":

                radius = 3

            else:

                radius = 5

            cv2.circle(
                canvas,
                (x, y),
                radius,
                (0, 255, 0),
                -1
            )

            cv2.putText(
                canvas,
                str(node["id"]),
                (
                    x + 5,
                    y - 5
                ),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.35,
                (0, 255, 255),
                1,
                cv2.LINE_AA
            )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    output_name = (
        image_name.replace(
            ".png",
            "_graph.png"
        )
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
# BUILD SINGLE GRAPH
# ============================================================

def build_graph(
    skeleton_path
):

    image_name = os.path.basename(
        skeleton_path
    )

    print(
        f"    Loading skeleton: "
        f"{image_name}"
    )

    skeleton = load_binary(
        skeleton_path
    )

    # --------------------------------------------------------
    # Extract DRIVE image number
    # --------------------------------------------------------

    number = image_name.split("_")[0]

    fov_path = os.path.join(
        FOV_DIR,
        f"{number}_test_mask.gif"
    )

    # --------------------------------------------------------
    # Apply FOV
    # --------------------------------------------------------

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

    else:

        print(
            f"    WARNING: FOV mask not found:"
            f" {fov_path}"
        )

    # --------------------------------------------------------
    # Detect node pixels
    # --------------------------------------------------------

    (
        endpoint_pixels,
        junction_pixels,
        degrees
    ) = find_node_pixels(
        skeleton
    )

    # --------------------------------------------------------
    # Create nodes
    # --------------------------------------------------------

    (
        nodes,
        pixel_to_node
    ) = create_nodes(
        endpoint_pixels,
        junction_pixels
    )

    # --------------------------------------------------------
    # Trace edges
    # --------------------------------------------------------

    edges = trace_edges(
        skeleton,
        nodes,
        pixel_to_node,
        degrees
    )

    # --------------------------------------------------------
    # Connectivity
    # --------------------------------------------------------

    connected_components = calculate_connectivity(
        nodes,
        edges
    )

    # --------------------------------------------------------
    # Graph features
    # --------------------------------------------------------

    features = calculate_graph_features(
        skeleton,
        nodes,
        edges
    )

    # --------------------------------------------------------
    # Visualization
    # --------------------------------------------------------

    visualization = create_visualization(
        skeleton,
        nodes,
        edges,
        image_name
    )

    # --------------------------------------------------------
    # Final graph
    # --------------------------------------------------------

    graph = {

        "image_id": number,

        "source_dataset": "DRIVE",

        "graph_version": "2.0",

        "nodes": nodes,

        "edges": edges,

        "features": features,

        "visualization": visualization
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
        "RETINAL GRAPH CONSTRUCTION v2"
    )

    print("=" * 70)

    print()

    print(
        f"Skeleton directory:"
    )

    print(
        SKELETON_DIR
    )

    print()

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
        f"Skeletons found: "
        f"{len(skeleton_files)}"
    )

    print()

    if not skeleton_files:

        print(
            "ERROR: No skeleton files found."
        )

        return

    # --------------------------------------------------------
    # Process images
    # --------------------------------------------------------

    summary = []

    for i, filename in enumerate(
        skeleton_files,
        1
    ):

        print(
            f"[{i}/{len(skeleton_files)}] "
            f"{filename}"
        )

        skeleton_path = os.path.join(
            SKELETON_DIR,
            filename
        )

        try:

            graph = build_graph(
                skeleton_path
            )

            output_name = filename.replace(
                ".png",
                ".json"
            )

            output_path = os.path.join(
                GRAPH_DIR,
                output_name
            )

            with open(
                output_path,
                "w",
                encoding="utf-8"
            ) as f:

                json.dump(
                    graph,
                    f,
                    indent=2
                )

            features = graph[
                "features"
            ]

            summary.append({

                "image_id":
                    graph["image_id"],

                "nodes":
                    features["node_count"],

                "edges":
                    features["edge_count"],

                "endpoints":
                    features["endpoint_count"],

                "junctions":
                    features["junction_count"],

                "components":
                    features[
                        "connected_components"
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
                f"    Mean tortuosity: "
                f"{features['mean_tortuosity']:.3f}"
            )

            print(
                f"    Saved: "
                f"{output_path}"
            )

        except Exception as e:

            print(
                f"    ERROR: {e}"
            )

    # --------------------------------------------------------
    # Save summary
    # --------------------------------------------------------

    summary_path = os.path.join(
        OUTPUT_DIR,
        "graph_summary.json"
    )

    with open(
        summary_path,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            summary,
            f,
            indent=2
        )

    # --------------------------------------------------------
    # Final
    # --------------------------------------------------------

    print()

    print("=" * 70)

    print(
        "RETINAL GRAPH v2 COMPLETE"
    )

    print("=" * 70)

    print()

    print(
        f"Graphs:"
    )

    print(
        GRAPH_DIR
    )

    print()

    print(
        f"Visualizations:"
    )

    print(
        VIS_DIR
    )

    print()

    print(
        f"Summary:"
    )

    print(
        summary_path
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()