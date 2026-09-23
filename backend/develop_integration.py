
"""
RETINA-FUSION 360
DEPLOYMENT / WORKFLOW INTEGRATION LAYER

This file is intentionally NOT another AI/model implementation.

It sits on top of your EXISTING Flask/AI backend and adds the remaining
hackathon modules:

    Existing AI API
        |
        +--> Recapture / Reject workflow
        +--> Trust / Human-review workflow
        +--> Referral workflow + tracking
        +--> Deployment telemetry
        +--> Rural telemedicine capacity metrics
        +--> Simulink-ready export
        +--> Frontend-friendly unified API

DEFAULT:
    Existing AI backend: http://127.0.0.1:5000
    Integration backend: http://127.0.0.1:5001

Run:
    C:\Program Files\Python313\python.exe ^
        D:\RETINA-FUSION-360\backend\deployment_integration.py

Frontend talks ONLY to:
    http://127.0.0.1:5001

IMPORTANT:
- Start your existing AI Flask backend first.
- This layer forwards uploaded images to the existing /api/analyze endpoint.
- It does NOT duplicate your vessel, graph, lesion, fusion, Grad-CAM, or report
  models.
"""

from pathlib import Path
from datetime import datetime
import csv
import io
import json
import os
import time
import uuid

import requests
from flask import (
    Flask,
    request,
    jsonify,
    send_file,
)
from flask_cors import CORS


# ============================================================
# CONFIGURATION
# ============================================================

PROJECT_ROOT = Path(
    r"D:\RETINA-FUSION-360"
)

RESULT_ROOT = (
    PROJECT_ROOT
    / "results"
    / "deployment_integration"
)

REFERRAL_DIR = (
    RESULT_ROOT
    / "referrals"
)

REVIEW_DIR = (
    RESULT_ROOT
    / "reviews"
)

TELEMETRY_DIR = (
    RESULT_ROOT
    / "telemetry"
)

EXPORT_DIR = (
    RESULT_ROOT
    / "simulink_export"
)

for directory in (
    RESULT_ROOT,
    REFERRAL_DIR,
    REVIEW_DIR,
    TELEMETRY_DIR,
    EXPORT_DIR,
):
    directory.mkdir(
        parents=True,
        exist_ok=True,
    )


# ============================================================
# EXISTING BACKEND
# ============================================================

# Change this ONLY if your existing Flask backend runs elsewhere.
EXISTING_AI_BACKEND = os.environ.get(
    "RETINA_AI_BACKEND",
    "http://127.0.0.1:5000",
)

INTEGRATION_HOST = "0.0.0.0"
INTEGRATION_PORT = 5001

ANALYZE_TIMEOUT_SECONDS = 300


# ============================================================
# HACKATHON WORKFLOW THRESHOLDS
# ============================================================

# These are engineering/demo thresholds, NOT clinical thresholds.

RECAPTURE_SCORE = 0.38

REVIEW_LOW_PROBABILITY = 0.35
REVIEW_HIGH_PROBABILITY = 0.65

EVIDENCE_REVIEW_THRESHOLD = 0.34

HIGH_REFERRAL_PROBABILITY = 0.80
MODERATE_REFERRAL_PROBABILITY = 0.60


# ============================================================
# TELEMEDICINE DEPLOYMENT PARAMETERS
# ============================================================

# These can be changed from the deployment API or environment.

TELEMEDICINE_CONFIG = {
    "annual_patient_target": 100000,
    "working_days_per_year": 300,
    "working_hours_per_day": 8,

    # Example network assumption for simulation.
    "rural_bandwidth_kbps": 256,

    # Example specialist capacity.
    "specialist_review_capacity_per_hour": 30,

    # Number of screening stations.
    "screening_stations": 1,
}


# ============================================================
# IN-MEMORY TELEMETRY
# ============================================================

TELEMETRY = {
    "requests": 0,
    "successful": 0,
    "failed": 0,
    "recapture": 0,
    "human_review": 0,
    "referrals": 0,
    "total_latency_seconds": 0.0,
    "latencies": [],
}


# ============================================================
# GENERAL HELPERS
# ============================================================

def timestamp():
    return datetime.now().isoformat(
        timespec="seconds"
    )


def make_id(prefix):
    return (
        prefix
        + "_"
        + datetime.now().strftime(
            "%Y%m%d_%H%M%S"
        )
        + "_"
        + uuid.uuid4().hex[:6]
    )


def save_json(path, data):
    path = Path(path)

    with open(
        path,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            data,
            file,
            indent=2,
            default=str,
        )


def load_json(path):
    path = Path(path)

    if not path.exists():
        return None

    with open(
        path,
        "r",
        encoding="utf-8",
    ) as file:
        return json.load(file)


# ============================================================
# EXISTING AI BACKEND CONNECTOR
# ============================================================

class ExistingAIConnector:
    """
    Connector to your already-built AI backend.

    Expected existing endpoint:
        POST /api/analyze

    Multipart field:
        image

    The response is passed through and enhanced by this layer.
    """

    def __init__(self, base_url):
        self.base_url = base_url.rstrip("/")

    def health(self):

        response = requests.get(
            f"{self.base_url}/api/health",
            timeout=10,
        )

        response.raise_for_status()

        return response.json()

    def analyze(
        self,
        file_bytes,
        filename,
        content_type,
    ):

        files = {
            "image": (
                filename,
                file_bytes,
                content_type or "application/octet-stream",
            )
        }

        response = requests.post(
            f"{self.base_url}/api/analyze",
            files=files,
            timeout=ANALYZE_TIMEOUT_SECONDS,
        )

        response.raise_for_status()

        return response.json()


AI = ExistingAIConnector(
    EXISTING_AI_BACKEND
)


# ============================================================
# QUALITY / RECAPTURE WORKFLOW
# ============================================================

def extract_quality(result):
    """
    Supports several possible response structures from the
    existing quality module.
    """

    quality = result.get(
        "quality",
        {}
    )

    if not isinstance(
        quality,
        dict,
    ):
        quality = {}

    score = quality.get(
        "score",
        quality.get(
            "quality_score",
            quality.get(
                "quality",
                None,
            ),
        ),
    )

    try:
        score = (
            float(score)
            if score is not None
            else None
        )
    except Exception:
        score = None

    status = quality.get(
        "status",
        quality.get(
            "quality_status",
            "Unknown",
        ),
    )

    action = quality.get(
        "action",
        None,
    )

    if action is None:

        if (
            score is not None
            and score < RECAPTURE_SCORE
        ):
            action = "recapture"
        else:
            action = "continue"

    return {
        "score": score,
        "status": status,
        "action": action,
        "feedback": quality.get(
            "feedback",
            [],
        ),
        "raw": quality,
    }


def recapture_decision(result):

    quality = extract_quality(
        result
    )

    if (
        quality["action"]
        == "recapture"
    ):

        return {
            "required": True,
            "decision": "RECAPTURE",
            "reason": (
                quality["feedback"]
                or [
                    "Image quality is insufficient "
                    "for reliable screening."
                ]
            ),
            "quality": quality,
        }

    return {
        "required": False,
        "decision": "CONTINUE",
        "reason": [],
        "quality": quality,
    }


# ============================================================
# TRUST / HUMAN REVIEW
# ============================================================

def extract_probability(result):

    probabilities = result.get(
        "probabilities",
        {},
    )

    if isinstance(
        probabilities,
        dict,
    ):

        value = probabilities.get(
            "referable",
            probabilities.get(
                "referable_dr",
                None,
            ),
        )

        if value is not None:

            try:
                return float(value)
            except Exception:
                pass

    for key in (
        "referable_probability",
        "confidence",
        "probability",
    ):

        if key in result:

            try:
                return float(
                    result[key]
                )
            except Exception:
                pass

    return None


def extract_evidence_strength(result):

    evidence = result.get(
        "evidence",
        {},
    )

    if not isinstance(
        evidence,
        dict,
    ):
        return None

    value = evidence.get(
        "evidence_strength_heuristic",
        evidence.get(
            "evidence_strength",
            None,
        ),
    )

    try:
        return float(value)
    except Exception:
        return None


def human_review_decision(result):

    probability = extract_probability(
        result
    )

    evidence_strength = (
        extract_evidence_strength(
            result
        )
    )

    reasons = []

    if probability is not None:

        if (
            REVIEW_LOW_PROBABILITY
            <= probability
            <= REVIEW_HIGH_PROBABILITY
        ):
            reasons.append(
                "Prediction probability is "
                "near the decision boundary."
            )

    if (
        evidence_strength is not None
        and evidence_strength
        < EVIDENCE_REVIEW_THRESHOLD
    ):

        reasons.append(
            "Available model evidence is limited."
        )

    existing_evidence = result.get(
        "evidence",
        {},
    )

    if isinstance(
        existing_evidence,
        dict,
    ):

        if existing_evidence.get(
            "human_review_required",
            False,
        ):

            reasons.extend(
                existing_evidence.get(
                    "human_review_reasons",
                    [],
                )
            )

    return {
        "required": bool(reasons),
        "reasons": list(
            dict.fromkeys(reasons)
        ),
        "probability": probability,
        "evidence_strength": evidence_strength,
    }


# ============================================================
# REFERRAL WORKFLOW
# ============================================================

def referral_decision(result):

    prediction = str(
        result.get(
            "prediction",
            ""
        )
    ).lower()

    probability = (
        extract_probability(result)
        or 0.0
    )

    review = human_review_decision(
        result
    )

    referable = (
        "referable" in prediction
        and "non-referable"
        not in prediction
    )

    if referable:

        if probability >= HIGH_REFERRAL_PROBABILITY:
            priority = "High"

        elif probability >= MODERATE_REFERRAL_PROBABILITY:
            priority = "Moderate"

        else:
            priority = "Clinical Review"

        return {
            "required": True,
            "priority": priority,
            "destination":
                "Ophthalmology / Tele-ophthalmology",
            "reason":
                "Referable DR screening result.",
            "status": "Pending",
        }

    if review["required"]:

        return {
            "required": True,
            "priority": "Clinical Review",
            "destination":
                "Clinical Reviewer",
            "reason":
                "AI result requires human review.",
            "status": "Pending",
        }

    return {
        "required": False,
        "priority": "Routine",
        "destination": None,
        "reason": "No referral automatically triggered.",
        "status": "Not Initiated",
    }


# ============================================================
# REVIEW STORAGE
# ============================================================

def review_path(report_id):
    return (
        REVIEW_DIR
        / f"{report_id}.json"
    )


def create_review(
    report_id,
    decision,
    reviewer,
    notes,
):

    allowed = {
        "confirm",
        "override",
        "needs_review",
        "reject",
    }

    if decision not in allowed:
        raise ValueError(
            "Invalid review decision."
        )

    data = {
        "review_id":
            make_id("REVIEW"),
        "report_id":
            report_id,
        "reviewer":
            reviewer,
        "decision":
            decision,
        "notes":
            notes,
        "timestamp":
            timestamp(),
    }

    save_json(
        review_path(report_id),
        data,
    )

    return data


# ============================================================
# REFERRAL STORAGE
# ============================================================

def referral_path(report_id):
    return (
        REFERRAL_DIR
        / f"{report_id}.json"
    )


def create_referral_record(
    report_id,
    priority,
    destination,
    patient_reference="",
):

    existing = load_json(
        referral_path(report_id)
    )

    if existing:
        return existing

    data = {
        "referral_id":
            make_id("REF"),
        "report_id":
            report_id,
        "patient_reference":
            patient_reference,
        "priority":
            priority,
        "destination":
            destination,
        "status":
            "Pending",
        "created_at":
            timestamp(),
        "updated_at":
            timestamp(),
        "timeline": [
            {
                "status":
                    "Pending",
                "timestamp":
                    timestamp(),
            }
        ],
    }

    save_json(
        referral_path(report_id),
        data,
    )

    TELEMETRY[
        "referrals"
    ] += 1

    return data


def update_referral_record(
    report_id,
    status,
    note="",
):

    path = referral_path(
        report_id
    )

    data = load_json(path)

    if not data:
        raise FileNotFoundError(
            "Referral does not exist."
        )

    allowed = {
        "Pending",
        "Patient Notified",
        "Appointment Scheduled",
        "Specialist Reviewed",
        "Completed",
        "Cancelled",
    }

    if status not in allowed:
        raise ValueError(
            "Invalid referral status."
        )

    data["status"] = status
    data["updated_at"] = timestamp()

    data["timeline"].append({
        "status": status,
        "note": note,
        "timestamp": timestamp(),
    })

    save_json(
        path,
        data,
    )

    return data


# ============================================================
# DEPLOYMENT TELEMETRY
# ============================================================

def record_telemetry(
    latency,
    success,
    recapture=False,
    human_review=False,
):

    TELEMETRY[
        "requests"
    ] += 1

    if success:
        TELEMETRY[
            "successful"
        ] += 1
    else:
        TELEMETRY[
            "failed"
        ] += 1

    if recapture:
        TELEMETRY[
            "recapture"
        ] += 1

    if human_review:
        TELEMETRY[
            "human_review"
        ] += 1

    TELEMETRY[
        "total_latency_seconds"
    ] += latency

    TELEMETRY[
        "latencies"
    ].append(latency)

    persist_telemetry()


def telemetry_summary():

    requests = TELEMETRY[
        "requests"
    ]

    successful = TELEMETRY[
        "successful"
    ]

    average_latency = (
        TELEMETRY[
            "total_latency_seconds"
        ]
        / successful
        if successful
        else 0
    )

    throughput = (
        1.0 / average_latency
        if average_latency > 0
        else 0
    )

    return {
        "requests":
            requests,
        "successful":
            successful,
        "failed":
            TELEMETRY["failed"],
        "recapture_requests":
            TELEMETRY["recapture"],
        "human_review_requests":
            TELEMETRY["human_review"],
        "referrals":
            TELEMETRY["referrals"],
        "average_latency_ms":
            round(
                average_latency * 1000,
                2,
            ),
        "estimated_images_per_second":
            round(
                throughput,
                4,
            ),
        "estimated_images_per_hour":
            round(
                throughput * 3600,
                2,
            ),
    }


def persist_telemetry():

    summary = telemetry_summary()

    save_json(
        TELEMETRY_DIR
        / "summary.json",
        summary,
    )

    path = (
        TELEMETRY_DIR
        / "history.csv"
    )

    rows = []

    for index, latency in enumerate(
        TELEMETRY["latencies"],
        start=1,
    ):

        rows.append({
            "request":
                index,
            "latency_seconds":
                round(latency, 4),
            "latency_ms":
                round(
                    latency * 1000,
                    2,
                ),
        })

    if rows:

        with open(
            path,
            "w",
            newline="",
            encoding="utf-8",
        ) as file:

            writer = csv.DictWriter(
                file,
                fieldnames=list(
                    rows[0].keys()
                ),
            )

            writer.writeheader()
            writer.writerows(rows)


# ============================================================
# TELEMEDICINE CAPACITY MODEL
# ============================================================

def calculate_capacity():

    target = float(
        TELEMEDICINE_CONFIG[
            "annual_patient_target"
        ]
    )

    days = float(
        TELEMEDICINE_CONFIG[
            "working_days_per_year"
        ]
    )

    hours = float(
        TELEMEDICINE_CONFIG[
            "working_hours_per_day"
        ]
    )

    annual_screening_capacity = (
        telemetry_summary()[
            "estimated_images_per_hour"
        ]
        * hours
        * days
    )

    required_per_day = (
        target / days
    )

    required_per_hour = (
        required_per_day / hours
    )

    specialist_capacity = float(
        TELEMEDICINE_CONFIG[
            "specialist_review_capacity_per_hour"
        ]
    )

    referral_rate = (
        TELEMETRY["referrals"]
        / TELEMETRY["successful"]
        if TELEMETRY["successful"]
        else 0
    )

    estimated_review_load = (
        required_per_hour
        * referral_rate
    )

    return {
        "annual_target":
            target,
        "required_patients_per_day":
            round(required_per_day, 2),
        "required_patients_per_hour":
            round(required_per_hour, 2),
        "measured_ai_capacity_per_year":
            round(
                annual_screening_capacity,
                2,
            ),
        "specialist_capacity_per_hour":
            specialist_capacity,
        "observed_referral_rate":
            round(
                referral_rate,
                4,
            ),
        "estimated_specialist_load_per_hour":
            round(
                estimated_review_load,
                2,
            ),
        "rural_bandwidth_kbps":
            TELEMEDICINE_CONFIG[
                "rural_bandwidth_kbps"
            ],
    }


# ============================================================
# SIMULINK-READY EXPORT
# ============================================================

def build_simulink_payload():

    summary = telemetry_summary()
    capacity = calculate_capacity()

    payload = {
        "generated_at":
            timestamp(),

        "system":
            "RETINA-FUSION 360",

        "deployment_metrics":
            summary,

        "telemedicine_parameters":
            TELEMEDICINE_CONFIG,

        "capacity_model":
            capacity,

        "signals_for_simulink": {

            "patient_arrival_rate_per_hour":
                capacity[
                    "required_patients_per_hour"
                ],

            "ai_processing_time_seconds":
                summary[
                    "average_latency_ms"
                ] / 1000.0,

            "ai_throughput_per_hour":
                summary[
                    "estimated_images_per_hour"
                ],

            "specialist_capacity_per_hour":
                TELEMEDICINE_CONFIG[
                    "specialist_review_capacity_per_hour"
                ],

            "rural_bandwidth_kbps":
                TELEMEDICINE_CONFIG[
                    "rural_bandwidth_kbps"
                ],

            "referral_rate":
                capacity[
                    "observed_referral_rate"
                ],
        },
    }

    return payload


def export_simulink_files():

    payload = build_simulink_payload()

    json_path = (
        EXPORT_DIR
        / "retina_fusion_simulink_input.json"
    )

    csv_path = (
        EXPORT_DIR
        / "retina_fusion_simulink_input.csv"
    )

    save_json(
        json_path,
        payload,
    )

    signals = payload[
        "signals_for_simulink"
    ]

    with open(
        csv_path,
        "w",
        newline="",
        encoding="utf-8",
    ) as file:

        writer = csv.writer(file)

        writer.writerow([
            "signal",
            "value",
        ])

        for key, value in signals.items():

            writer.writerow([
                key,
                value,
            ])

    return {
        "json":
            str(json_path),
        "csv":
            str(csv_path),
        "payload":
            payload,
    }


# ============================================================
# DEPLOYMENT OPTIMIZATION REPORT
# ============================================================

def deployment_report():

    summary = telemetry_summary()

    capacity = calculate_capacity()

    bottlenecks = []

    if (
        summary["average_latency_ms"]
        > 5000
    ):

        bottlenecks.append(
            "Inference latency is high; "
            "consider edge optimization."
        )

    if (
        summary[
            "estimated_images_per_hour"
        ]
        < 100
    ):

        bottlenecks.append(
            "Low screening throughput."
        )

    if (
        capacity[
            "estimated_specialist_load_per_hour"
        ]
        >
        capacity[
            "specialist_capacity_per_hour"
        ]
    ):

        bottlenecks.append(
            "Specialist review capacity may "
            "become the deployment bottleneck."
        )

    if not bottlenecks:

        bottlenecks.append(
            "No obvious bottleneck detected "
            "from current demo telemetry."
        )

    return {
        "telemetry":
            summary,
        "capacity":
            capacity,
        "bottlenecks":
            bottlenecks,
        "optimization_options": [
            "Use smaller/quantized models for edge deployment.",
            "Resize/compress images before transmission where clinically appropriate.",
            "Use asynchronous referral queues.",
            "Prioritize high-risk referrals.",
            "Monitor inference latency and model drift.",
            "Scale specialist capacity when referral load exceeds review capacity.",
        ],
    }


# ============================================================
# FLASK APPLICATION
# ============================================================

app = Flask(
    __name__
)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": "*"
        }
    },
)


# ============================================================
# HEALTH
# ============================================================

@app.get("/")
def root():

    return jsonify({
        "system":
            "RETINA-FUSION 360",
        "layer":
            "Deployment & Workflow Integration",
        "status":
            "online",
        "existing_ai_backend":
            EXISTING_AI_BACKEND,
        "frontend_api":
            f"http://127.0.0.1:{INTEGRATION_PORT}",
    })


@app.get("/api/health")
def health():

    try:

        ai_health = AI.health()

        ai_status = "online"

    except Exception as exc:

        ai_health = {
            "error": str(exc)
        }

        ai_status = "offline"

    return jsonify({
        "integration":
            "online",
        "existing_ai_backend":
            ai_status,
        "ai_backend_health":
            ai_health,
        "telemetry":
            telemetry_summary(),
    })


# ============================================================
# MASTER ANALYZE ENDPOINT
# ============================================================

@app.post("/api/analyze")
def analyze():

    started = time.perf_counter()

    try:

        if "image" not in request.files:

            return jsonify({
                "success": False,
                "error":
                    "Upload an image using "
                    "multipart/form-data field 'image'.",
            }), 400

        uploaded = request.files[
            "image"
        ]

        filename = (
            uploaded.filename
            or "fundus_image.jpg"
        )

        content_type = (
            uploaded.content_type
            or "application/octet-stream"
        )

        file_bytes = uploaded.read()

        if not file_bytes:

            return jsonify({
                "success": False,
                "error":
                    "Uploaded image is empty.",
            }), 400

        # ----------------------------------------------------
        # CALL EXISTING AI PIPELINE
        # ----------------------------------------------------

        ai_result = AI.analyze(
            file_bytes=file_bytes,
            filename=filename,
            content_type=content_type,
        )

        # ----------------------------------------------------
        # RECAPTURE
        # ----------------------------------------------------

        recapture = recapture_decision(
            ai_result
        )

        if recapture["required"]:

            elapsed = (
                time.perf_counter()
                - started
            )

            record_telemetry(
                elapsed,
                True,
                recapture=True,
                human_review=False,
            )

            return jsonify({

                "success": True,

                "status":
                    "RECAPTURE_REQUIRED",

                "workflow":
                    "RECAPTURE",

                "ai_result":
                    ai_result,

                "recapture":
                    recapture,

                "human_review": {
                    "required": False
                },

                "referral": {
                    "required": False
                },

                "telemetry": {
                    "latency_ms":
                        round(
                            elapsed * 1000,
                            2,
                        )
                },
            })

        # ----------------------------------------------------
        # HUMAN REVIEW
        # ----------------------------------------------------

        review = (
            human_review_decision(
                ai_result
            )
        )

        # ----------------------------------------------------
        # REFERRAL
        # ----------------------------------------------------

        referral = referral_decision(
            ai_result
        )

        # ----------------------------------------------------
        # REPORT ID
        # ----------------------------------------------------

        report_id = (
            ai_result.get(
                "report_id"
            )
            or ai_result.get(
                "id"
            )
            or make_id("REPORT")
        )

        # ----------------------------------------------------
        # AUTO-CREATE REFERRAL RECORD
        # ----------------------------------------------------

        referral_record = None

        if referral["required"]:

            referral_record = (
                create_referral_record(
                    report_id=report_id,
                    priority=referral[
                        "priority"
                    ],
                    destination=referral[
                        "destination"
                    ],
                )
            )

        # ----------------------------------------------------
        # FINAL STATUS
        # ----------------------------------------------------

        if review["required"]:

            status = "HUMAN_REVIEW"

        elif referral["required"]:

            status = "REFERRAL_RECOMMENDED"

        else:

            status = "SCREENED"

        # ----------------------------------------------------
        # TELEMETRY
        # ----------------------------------------------------

        elapsed = (
            time.perf_counter()
            - started
        )

        record_telemetry(
            elapsed,
            True,
            recapture=False,
            human_review=review["required"],
        )

        # ----------------------------------------------------
        # UNIFIED RESPONSE
        # ----------------------------------------------------

        return jsonify({

            "success": True,

            "status":
                status,

            "report_id":
                report_id,

            "workflow": {

                "quality":
                    "PASS",

                "screening":
                    "COMPLETED",

                "human_review":
                    (
                        "REQUIRED"
                        if review["required"]
                        else "NOT_REQUIRED"
                    ),

                "referral":
                    (
                        "REQUIRED"
                        if referral["required"]
                        else "NOT_REQUIRED"
                    ),
            },

            # Existing AI output is preserved.
            "ai_result":
                ai_result,

            # New deployment layer.
            "human_review":
                review,

            "referral":
                referral_record
                or referral,

            "deployment":
                deployment_report(),

            "telemetry": {

                "latency_ms":
                    round(
                        elapsed * 1000,
                        2,
                    )
            },
        })

    except requests.RequestException as exc:

        elapsed = (
            time.perf_counter()
            - started
        )

        record_telemetry(
            elapsed,
            False,
        )

        return jsonify({

            "success": False,

            "status":
                "AI_BACKEND_UNAVAILABLE",

            "error":
                str(exc),

            "message":
                "The existing AI backend could not "
                "be reached. Start your existing "
                "Flask AI server first.",
        }), 503

    except Exception as exc:

        elapsed = (
            time.perf_counter()
            - started
        )

        record_telemetry(
            elapsed,
            False,
        )

        return jsonify({

            "success": False,

            "status":
                "INTEGRATION_ERROR",

            "error":
                str(exc),
        }), 500


# ============================================================
# HUMAN REVIEW
# ============================================================

@app.post("/api/review")
def review():

    try:

        data = request.get_json(
            force=True
        )

        report_id = data.get(
            "report_id"
        )

        if not report_id:

            return jsonify({
                "success": False,
                "error":
                    "report_id is required.",
            }), 400

        decision = data.get(
            "decision"
        )

        reviewer = data.get(
            "reviewer",
            "clinical_reviewer",
        )

        notes = data.get(
            "notes",
            "",
        )

        review_data = create_review(
            report_id,
            decision,
            reviewer,
            notes,
        )

        return jsonify({
            "success": True,
            "review":
                review_data,
        })

    except Exception as exc:

        return jsonify({
            "success": False,
            "error": str(exc),
        }), 400


@app.get("/api/review/<report_id>")
def get_review(report_id):

    data = load_json(
        review_path(report_id)
    )

    if data is None:

        return jsonify({
            "success": False,
            "error":
                "Review not found.",
        }), 404

    return jsonify({
        "success": True,
        "review": data,
    })


# ============================================================
# REFERRAL API
# ============================================================

@app.post("/api/referral")
def create_referral_api():

    try:

        data = request.get_json(
            force=True
        )

        report_id = data.get(
            "report_id"
        )

        if not report_id:

            return jsonify({
                "success": False,
                "error":
                    "report_id is required.",
            }), 400

        record = (
            create_referral_record(
                report_id=report_id,
                priority=data.get(
                    "priority",
                    "Clinical Review",
                ),
                destination=data.get(
                    "destination",
                    "Ophthalmology / Tele-ophthalmology",
                ),
                patient_reference=data.get(
                    "patient_reference",
                    "",
                ),
            )
        )

        return jsonify({
            "success": True,
            "referral":
                record,
        })

    except Exception as exc:

        return jsonify({
            "success": False,
            "error": str(exc),
        }), 400


@app.get("/api/referral/<report_id>")
def get_referral(report_id):

    data = load_json(
        referral_path(report_id)
    )

    if data is None:

        return jsonify({
            "success": False,
            "error":
                "Referral not found.",
        }), 404

    return jsonify({
        "success": True,
        "referral":
            data,
    })


@app.patch("/api/referral/<report_id>")
def update_referral(report_id):

    try:

        data = request.get_json(
            force=True
        )

        status = data.get(
            "status"
        )

        note = data.get(
            "note",
            "",
        )

        record = (
            update_referral_record(
                report_id,
                status,
                note,
            )
        )

        return jsonify({
            "success": True,
            "referral":
                record,
        })

    except Exception as exc:

        return jsonify({
            "success": False,
            "error": str(exc),
        }), 400


# ============================================================
# TELEMEDICINE / DEPLOYMENT API
# ============================================================

@app.get("/api/telemetry")
def telemetry():

    return jsonify({
        "success": True,
        "telemetry":
            telemetry_summary(),
        "capacity":
            calculate_capacity(),
    })


@app.get("/api/deployment")
def deployment():

    return jsonify({
        "success": True,
        "deployment":
            deployment_report(),
    })


@app.post("/api/deployment/config")
def deployment_config():

    try:

        data = request.get_json(
            force=True
        )

        allowed = {
            "annual_patient_target",
            "working_days_per_year",
            "working_hours_per_day",
            "rural_bandwidth_kbps",
            "specialist_review_capacity_per_hour",
            "screening_stations",
        }

        for key in allowed:

            if key in data:

                TELEMEDICINE_CONFIG[
                    key
                ] = data[key]

        save_json(
            TELEMETRY_DIR
            / "deployment_config.json",
            TELEMEDICINE_CONFIG,
        )

        return jsonify({
            "success": True,
            "config":
                TELEMEDICINE_CONFIG,
            "capacity":
                calculate_capacity(),
        })

    except Exception as exc:

        return jsonify({
            "success": False,
            "error": str(exc),
        }), 400


# ============================================================
# SIMULINK EXPORT
# ============================================================

@app.get("/api/simulink/export")
def simulink_export():

    result = (
        export_simulink_files()
    )

    return jsonify({
        "success": True,
        "json_path":
            result["json"],
        "csv_path":
            result["csv"],
        "payload":
            result["payload"],
    })


@app.get("/api/simulink/download/csv")
def download_simulink_csv():

    path = (
        EXPORT_DIR
        / "retina_fusion_simulink_input.csv"
    )

    if not path.exists():

        export_simulink_files()

    return send_file(
        path,
        as_attachment=True,
        download_name=(
            "retina_fusion_simulink_input.csv"
        ),
    )


@app.get("/api/simulink/download/json")
def download_simulink_json():

    path = (
        EXPORT_DIR
        / "retina_fusion_simulink_input.json"
    )

    if not path.exists():

        export_simulink_files()

    return send_file(
        path,
        as_attachment=True,
        download_name=(
            "retina_fusion_simulink_input.json"
        ),
    )


# ============================================================
# FRONTEND-FRIENDLY STATUS
# ============================================================

@app.get("/api/dashboard")
def dashboard():

    try:

        ai_health = AI.health()
        ai_online = True

    except Exception as exc:

        ai_health = {
            "error": str(exc)
        }

        ai_online = False

    return jsonify({

        "system":
            "RETINA-FUSION 360",

        "integration_layer":
            "online",

        "existing_ai_backend":
            (
                "online"
                if ai_online
                else "offline"
            ),

        "modules": {

            "quality":
                "existing",

            "preprocessing":
                "existing",

            "dr_classification":
                "existing",

            "vessel_segmentation":
                "existing",

            "retinal_graph":
                "existing",

            "lesion_detection":
                "existing",

            "fusion":
                "existing",

            "gradcam":
                "existing",

            "evidence":
                "existing",

            "report":
                "existing",

            "human_review":
                "integration",

            "recapture":
                "integration",

            "referral":
                "integration",

            "deployment_telemetry":
                "integration",

            "simulink_export":
                "integration",
        },

        "ai_health":
            ai_health,

        "telemetry":
            telemetry_summary(),

        "capacity":
            calculate_capacity(),
    })


# ============================================================
# START
# ============================================================

if __name__ == "__main__":

    print("=" * 76)
    print(
        "RETINA-FUSION 360"
    )
    print(
        "DEPLOYMENT / WORKFLOW INTEGRATION LAYER"
    )
    print("=" * 76)

    print(
        "Existing AI backend:"
    )

    print(
        EXISTING_AI_BACKEND
    )

    print()
    print(
        "Integration API:"
    )

    print(
        f"http://127.0.0.1:{INTEGRATION_PORT}"
    )

    print()
    print(
        "Checking existing AI backend..."
    )

    try:

        health_response = AI.health()

        print(
            json.dumps(
                health_response,
                indent=2,
            )
        )

    except Exception as exc:

        print(
            "WARNING: Existing AI backend "
            "is not reachable."
        )

        print(
            str(exc)
        )

        print()
        print(
            "Start your existing AI Flask "
            "backend on port 5000 first."
        )

    print("=" * 76)

    app.run(
        host=INTEGRATION_HOST,
        port=INTEGRATION_PORT,
        debug=False,
    )
