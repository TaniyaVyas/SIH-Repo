
"""
RETINA-FUSION 360
CENTRAL EXPLAINABLE AI / EVIDENCE COORDINATOR

Purpose
-------
This module is the single XAI coordination layer for the existing
RETINA-FUSION 360 backend.

It DOES NOT train another model and does NOT replace:
    - DR classifier / fusion model
    - vessel segmentation
    - retinal graph
    - lesion segmentation
    - Grad-CAM generation
    - quality assessment

Instead it takes the outputs already produced by those modules and
creates ONE coherent explanation:

    prediction
        |
        +--> visual evidence (Grad-CAM)
        +--> lesion evidence
        +--> retinal graph / topology evidence
        +--> image quality evidence
        +--> uncertainty / OOD evidence when supplied
        +--> evidence concordance
        +--> contradiction detection
        +--> trust recommendation
        +--> human-review recommendation
        +--> plain-language explanation
        +--> frontend-ready JSON
        +--> report-ready JSON

Important
---------
This is a research / hackathon explanation coordinator.
It must not be presented as an autonomous clinical diagnosis engine.

The engine deliberately does NOT invent ETDRS/ICDR findings. If a real
clinical-rule engine supplies rule results, they are incorporated.
Otherwise the engine reports "not supplied".

Integration
-----------
In your existing backend:

    from central_xai_engine import build_central_xai

After your existing Grad-CAM + graph + lesion + fusion outputs are
available:

    xai = build_central_xai(
        report=report,
        run_dir=run,
    )

    report["xai"] = xai

Then expose:

    POST /api/xai/explain

or simply include "xai" in the existing /api/analyze response.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import json
import math
import re


# ============================================================
# CONFIG
# ============================================================

ENGINE_NAME = "RETINA-FUSION 360 Central Explainable AI"

# These are engineering thresholds for deciding whether evidence is
# sufficiently concordant for autonomous workflow. They are NOT
# clinical diagnostic thresholds.
BOUNDARY_LOW = 0.35
BOUNDARY_HIGH = 0.65

LOW_EVIDENCE = 0.34
MEDIUM_EVIDENCE = 0.67

OOD_REVIEW = True
QUALITY_REVIEW = True


# ============================================================
# SAFE UTILITIES
# ============================================================

def _num(value: Any, default: float = 0.0) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except Exception:
        return default


def _int(value: Any, default: int = 0) -> int:
    try:
        return int(round(float(value)))
    except Exception:
        return default


def _bool(value: Any, default: bool = False) -> bool:
    if value is None:
        return default

    if isinstance(value, bool):
        return value

    if isinstance(value, str):
        return value.strip().lower() in {
            "true",
            "1",
            "yes",
            "y",
        }

    return bool(value)


def _first(data: Dict[str, Any], *keys, default=None):
    for key in keys:
        if key in data and data[key] is not None:
            return data[key]
    return default


def _nested(data: Dict[str, Any], *path, default=None):
    current = data

    for key in path:
        if not isinstance(current, dict):
            return default

        if key not in current:
            return default

        current = current[key]

    return current


def _clip(value: float, low=0.0, high=1.0) -> float:
    return max(low, min(high, float(value)))


def _round(value, digits=3):
    if value is None:
        return None

    try:
        return round(float(value), digits)
    except Exception:
        return value


def _normalise_probability(value):
    value = _num(value, 0.0)

    # Accept either 0-1 or 0-100 input.
    if value > 1.0:
        value /= 100.0

    return _clip(value)


def _slug(text: str) -> str:
    return re.sub(
        r"[^a-z0-9]+",
        "_",
        str(text).lower(),
    ).strip("_")


# ============================================================
# DATA EXTRACTION
# ============================================================

@dataclass
class PredictionEvidence:
    prediction: str
    prediction_class: Optional[int]
    referable_probability: float
    confidence: float
    near_boundary: bool


@dataclass
class QualityEvidence:
    available: bool
    score: Optional[float]
    status: str
    action: str
    gradable: Optional[bool]


@dataclass
class LesionEvidence:
    available: bool
    microaneurysms: int
    hard_exudates: int
    hemorrhages: int
    soft_exudates: int
    macular_edema: Optional[bool]
    total_detected: int


@dataclass
class GraphEvidence:
    available: bool
    nodes: int
    edges: int
    junctions: int
    endpoints: int
    vessel_density: Optional[float]
    topology_signal: float


@dataclass
class TrustEvidence:
    uncertainty: Optional[float]
    ood: bool
    existing_review_required: bool


# ============================================================
# EXTRACTION
# ============================================================

def extract_prediction(report: Dict[str, Any]) -> PredictionEvidence:

    probabilities = report.get(
        "probabilities",
        {},
    )

    if not isinstance(probabilities, dict):
        probabilities = {}

    referable = _normalise_probability(
        _first(
            probabilities,
            "referable",
            "referable_probability",
            default=_first(
                report,
                "referable_probability",
                default=0.0,
            ),
        )
    )

    prediction_class = report.get(
        "prediction_class"
    )

    try:
        prediction_class = int(
            prediction_class
        )
    except Exception:
        prediction_class = None

    prediction = str(
        report.get(
            "prediction",
            "Unknown",
        )
    )

    confidence = max(
        referable,
        1.0 - referable,
    )

    near_boundary = (
        BOUNDARY_LOW
        <= referable
        <= BOUNDARY_HIGH
    )

    return PredictionEvidence(
        prediction=prediction,
        prediction_class=prediction_class,
        referable_probability=referable,
        confidence=confidence,
        near_boundary=near_boundary,
    )


def extract_quality(report):

    quality = report.get(
        "quality",
        {},
    )

    if not isinstance(quality, dict):
        quality = {}

    score = _first(
        quality,
        "score",
        "quality_score",
    )

    gradable = _first(
        quality,
        "is_gradable",
        "gradable",
    )

    return QualityEvidence(
        available=bool(quality),
        score=(
            _num(score)
            if score is not None
            else None
        ),
        status=str(
            quality.get(
                "status",
                "Not supplied",
            )
        ),
        action=str(
            quality.get(
                "action",
                "Not supplied",
            )
        ),
        gradable=(
            _bool(gradable)
            if gradable is not None
            else None
        ),
    )


def extract_lesions(report):

    data = report.get(
        "lesion_analysis",
        {},
    )

    if not isinstance(data, dict):
        data = {}

    ma = _int(
        _first(
            data,
            "MA",
            "ma",
            "microaneurysms",
            "ma_count",
            default=0,
        )
    )

    ex = _int(
        _first(
            data,
            "EX",
            "ex",
            "hard_exudates",
            "ex_count",
            default=0,
        )
    )

    he = _int(
        _first(
            data,
            "HE",
            "he",
            "hemorrhages",
            "he_count",
            default=0,
        )
    )

    se = _int(
        _first(
            data,
            "SE",
            "se",
            "soft_exudates",
            "cotton_wool_spots",
            "se_count",
            default=0,
        )
    )

    macular = _first(
        data,
        "macular_edema_present",
        "macularEdemaPresent",
        default=None,
    )

    return LesionEvidence(
        available=bool(data),
        microaneurysms=ma,
        hard_exudates=ex,
        hemorrhages=he,
        soft_exudates=se,
        macular_edema=(
            _bool(macular)
            if macular is not None
            else None
        ),
        total_detected=ma + ex + he + se,
    )


def extract_graph(report):

    vessel = report.get(
        "vessel_analysis",
        {},
    )

    if not isinstance(vessel, dict):
        vessel = {}

    structured = report.get(
        "structured_features",
        {},
    )

    if not isinstance(structured, dict):
        structured = {}

    nodes = _int(
        _first(
            vessel,
            "nodes",
            default=_first(
                structured,
                "graph_total_nodes",
                default=0,
            ),
        )
    )

    edges = _int(
        _first(
            vessel,
            "edges",
            default=_first(
                structured,
                "graph_total_edges",
                default=0,
            ),
        )
    )

    junctions = _int(
        _first(
            structured,
            "vessel_junction_count",
            "junction_count",
            default=0,
        )
    )

    endpoints = _int(
        _first(
            structured,
            "vessel_endpoint_count",
            "endpoint_count",
            default=0,
        )
    )

    density_value = _first(
        structured,
        "skeleton_vessel_density",
        "vessel_density",
        "graph_density",
        default=None,
    )

    # Presence of a graph is evidence availability, not evidence
    # that disease is present.
    available = (
        nodes > 0
        or edges > 0
    )

    # Structural signal is intentionally modest. It measures whether
    # graph evidence exists, not whether a particular pathology is
    # clinically proven.
    topology_signal = 0.0

    if available:
        topology_signal += 0.35

    if junctions > 0:
        topology_signal += 0.25

    if edges > 0:
        topology_signal += 0.20

    if density_value is not None:
        topology_signal += 0.20

    topology_signal = _clip(
        topology_signal
    )

    return GraphEvidence(
        available=available,
        nodes=nodes,
        edges=edges,
        junctions=junctions,
        endpoints=endpoints,
        vessel_density=(
            _num(density_value)
            if density_value is not None
            else None
        ),
        topology_signal=topology_signal,
    )


def extract_trust(report):

    trust = report.get(
        "trust",
        {},
    )

    evidence = report.get(
        "evidence",
        {},
    )

    if not isinstance(trust, dict):
        trust = {}

    if not isinstance(evidence, dict):
        evidence = {}

    uncertainty = _first(
        trust,
        "uncertainty_score",
        "uncertainty",
        default=_first(
            report,
            "uncertainty_score",
            default=None,
        ),
    )

    ood = _first(
        trust,
        "ood_flag",
        "ood",
        default=_first(
            report,
            "ood_flag",
            default=False,
        ),
    )

    existing_review = _first(
        evidence,
        "human_review_required",
        default=_first(
            trust,
            "human_review_required",
            default=False,
        ),
    )

    return TrustEvidence(
        uncertainty=(
            _num(uncertainty)
            if uncertainty is not None
            else None
        ),
        ood=_bool(ood),
        existing_review_required=_bool(
            existing_review
        ),
    )


# ============================================================
# EVIDENCE CHANNELS
# ============================================================

def build_visual_evidence(
    report: Dict[str, Any],
    run_dir: Optional[Path],
) -> Dict[str, Any]:

    gradcam_available = False
    gradcam_path = None

    artifacts = report.get(
        "artifacts",
        {},
    )

    if isinstance(artifacts, dict):

        gradcam_path = artifacts.get(
            "gradcam"
        )

    if gradcam_path:
        gradcam_available = Path(
            gradcam_path
        ).exists()

    if (
        not gradcam_available
        and run_dir is not None
    ):

        candidate = (
            Path(run_dir)
            / "gradcam.jpg"
        )

        if candidate.exists():
            gradcam_available = True
            gradcam_path = str(
                candidate
            )

    return {
        "available":
            gradcam_available,

        "method":
            "Grad-CAM",

        "artifact":
            gradcam_path,

        "interpretation":
            (
                "Grad-CAM identifies image regions "
                "that influenced the model prediction. "
                "It is an attribution signal, not proof "
                "of pathology."
                if gradcam_available
                else
                "Grad-CAM output was not supplied."
            ),
    }


def build_lesion_evidence(
    lesions: LesionEvidence,
) -> Dict[str, Any]:

    findings = []

    mapping = [
        (
            "microaneurysms",
            "Microaneurysms",
            lesions.microaneurysms,
        ),
        (
            "hard_exudates",
            "Hard exudates",
            lesions.hard_exudates,
        ),
        (
            "hemorrhages",
            "Hemorrhages",
            lesions.hemorrhages,
        ),
        (
            "soft_exudates",
            "Soft exudates",
            lesions.soft_exudates,
        ),
    ]

    for key, label, count in mapping:

        if count > 0:

            findings.append({
                "type":
                    key,
                "label":
                    label,
                "count":
                    count,
                "supports_prediction":
                    "potentially",
            })

    return {
        "available":
            lesions.available,

        "counts": {
            "microaneurysms":
                lesions.microaneurysms,
            "hard_exudates":
                lesions.hard_exudates,
            "hemorrhages":
                lesions.hemorrhages,
            "soft_exudates":
                lesions.soft_exudates,
        },

        "total_detected":
            lesions.total_detected,

        "macular_edema_signal":
            lesions.macular_edema,

        "findings":
            findings,

        "interpretation":
            (
                "Detected lesion outputs provide "
                "supporting evidence for the screening "
                "prediction. Their clinical meaning "
                "requires validation against the relevant "
                "clinical criteria."
                if findings
                else
                "No positive lesion detections were "
                "supplied by the lesion module."
            ),
    }


def build_graph_evidence(
    graph: GraphEvidence,
) -> Dict[str, Any]:

    return {
        "available":
            graph.available,

        "nodes":
            graph.nodes,

        "edges":
            graph.edges,

        "junctions":
            graph.junctions,

        "endpoints":
            graph.endpoints,

        "vessel_density":
            graph.vessel_density,

        "topology_signal":
            _round(
                graph.topology_signal
            ),

        "interpretation":
            (
                "The retinal graph provides structural "
                "and topological context for the screening "
                "prediction."
                if graph.available
                else
                "Retinal graph output was not supplied."
            ),

        "important_note":
            "Graph topology is supporting structural "
            "evidence; graph availability alone does not "
            "establish diabetic retinopathy.",
    }


def build_quality_evidence(
    quality: QualityEvidence,
) -> Dict[str, Any]:

    return {
        "available":
            quality.available,

        "score":
            quality.score,

        "status":
            quality.status,

        "action":
            quality.action,

        "gradable":
            quality.gradable,

        "interpretation":
            (
                "Image quality was considered before "
                "downstream interpretation."
                if quality.available
                else
                "Quality output was not supplied."
            ),
    }


# ============================================================
# CLINICAL-RULE INPUT
# ============================================================

def extract_clinical_rules(report):

    """
    The engine does not invent clinical rule results.

    It accepts actual results if the backend already supplies:
        report["clinical_rules"]
    or:
        report["etdrs_concordance"]
    """

    rules = report.get(
        "clinical_rules"
    )

    if rules is None:
        rules = report.get(
            "etdrs_concordance"
        )

    if rules is None:
        return {
            "available": False,
            "status": "NOT_SUPPLIED",
            "rules": [],
            "matched": 0,
            "violated": 0,
            "unknown": 0,
        }

    if not isinstance(rules, list):
        rules = [rules]

    normalized = []

    matched = 0
    violated = 0
    unknown = 0

    for item in rules:

        if not isinstance(item, dict):
            continue

        status = str(
            item.get(
                "status",
                "Unknown",
            )
        )

        normalized.append({
            "rule":
                item.get(
                    "rule",
                    "Unnamed rule",
                ),
            "status":
                status,
            "notes":
                item.get(
                    "notes",
                    "",
                ),
        })

        low = status.lower()

        if "match" in low or "confirm" in low:
            matched += 1

        elif (
            "violat" in low
            or "discord" in low
            or "fail" in low
        ):
            violated += 1

        else:
            unknown += 1

    if violated > 0:
        overall = "DISCORDANT"

    elif matched > 0 and unknown == 0:
        overall = "CONCORDANT"

    elif matched > 0:
        overall = "PARTIAL"

    else:
        overall = "NOT_SUPPLIED"

    return {
        "available":
            bool(normalized),

        "status":
            overall,

        "rules":
            normalized,

        "matched":
            matched,

        "violated":
            violated,

        "unknown":
            unknown,
    }


# ============================================================
# CONCORDANCE
# ============================================================

def calculate_concordance(
    prediction: PredictionEvidence,
    visual: Dict[str, Any],
    lesions: LesionEvidence,
    graph: GraphEvidence,
    quality: QualityEvidence,
    trust: TrustEvidence,
    clinical_rules: Dict[str, Any],
):

    """
    Produces an evidence-agreement score.

    This is a transparent engineering score, NOT a medical
    probability and NOT a clinical validation metric.
    """

    channels = {}

    # Visual channel
    channels["visual"] = (
        1.0
        if visual["available"]
        else 0.0
    )

    # Lesion channel
    if lesions.available:

        channels["lesion"] = (
            1.0
            if lesions.total_detected > 0
            else 0.35
        )

    else:

        channels["lesion"] = 0.0

    # Graph channel
    channels["graph"] = (
        graph.topology_signal
        if graph.available
        else 0.0
    )

    # Quality channel
    if quality.available:

        if quality.score is None:
            channels["quality"] = 0.5

        else:
            channels["quality"] = _clip(
                quality.score
            )

    else:

        channels["quality"] = 0.0

    # Clinical-rule channel only if supplied.
    if clinical_rules["available"]:

        total = (
            clinical_rules["matched"]
            + clinical_rules["violated"]
            + clinical_rules["unknown"]
        )

        if total:

            channels["clinical_rules"] = (
                clinical_rules["matched"]
                / total
            )

    # Prediction uncertainty penalty.
    if trust.uncertainty is not None:

        uncertainty_penalty = _clip(
            trust.uncertainty
        )

        channels["uncertainty_support"] = (
            1.0
            - uncertainty_penalty
        )

    weights = {
        "visual": 0.18,
        "lesion": 0.24,
        "graph": 0.18,
        "quality": 0.12,
        "clinical_rules": 0.18,
        "uncertainty_support": 0.10,
    }

    active = [
        key
        for key in channels
        if key in weights
    ]

    weight_sum = sum(
        weights[key]
        for key in active
    )

    score = (
        sum(
            channels[key]
            * weights[key]
            for key in active
        )
        / weight_sum
        if weight_sum
        else 0.0
    )

    return {
        "score":
            _round(score),

        "percent":
            round(
                score * 100,
                1,
            ),

        "channels": {
            key: _round(value)
            for key, value
            in channels.items()
        },

        "interpretation":
            (
                "High cross-modal agreement."
                if score >= MEDIUM_EVIDENCE
                else
                "Moderate cross-modal agreement."
                if score >= LOW_EVIDENCE
                else
                "Limited cross-modal agreement."
            ),

        "note":
            "This concordance score is an engineering "
            "evidence-coordination measure, not a clinical "
            "diagnostic confidence score.",
    }


# ============================================================
# CONTRADICTION ENGINE
# ============================================================

def detect_contradictions(
    prediction: PredictionEvidence,
    lesions: LesionEvidence,
    graph: GraphEvidence,
    quality: QualityEvidence,
    trust: TrustEvidence,
    clinical_rules: Dict[str, Any],
):

    contradictions = []

    # Prediction / quality contradiction
    if (
        quality.action == "recapture"
        and prediction.prediction
        not in {
            "",
            "Unknown",
            "Unable to screen reliably",
        }
    ):

        contradictions.append({
            "type":
                "QUALITY_PREDICTION",
            "severity":
                "HIGH",
            "message":
                "A prediction is present even though "
                "the quality module requested recapture.",
        })

    # Prediction / evidence limitation
    if (
        prediction.referable_probability >= 0.80
        and lesions.available
        and lesions.total_detected == 0
    ):

        contradictions.append({
            "type":
                "PREDICTION_LESION",
            "severity":
                "MEDIUM",
            "message":
                "The model assigns high referable "
                "probability, but the lesion module "
                "reported no positive lesion detections.",
        })

    # High prediction / no graph
    if (
        prediction.referable_probability >= 0.80
        and not graph.available
    ):

        contradictions.append({
            "type":
                "PREDICTION_GRAPH",
            "severity":
                "LOW",
            "message":
                "The model prediction is available, "
                "but retinal graph evidence was not supplied.",
        })

    # OOD
    if trust.ood:

        contradictions.append({
            "type":
                "OOD",
            "severity":
                "HIGH",
            "message":
                "The input was flagged as out-of-distribution.",
        })

    # Uncertainty
    if (
        trust.uncertainty is not None
        and trust.uncertainty > 0.18
    ):

        contradictions.append({
            "type":
                "UNCERTAINTY",
            "severity":
                "HIGH",
            "message":
                "Model uncertainty is elevated.",
        })

    # Clinical rules
    if clinical_rules["violated"] > 0:

        contradictions.append({
            "type":
                "CLINICAL_RULE",
            "severity":
                "HIGH",
            "message":
                "One or more supplied clinical-rule "
                "checks were marked violated/discordant.",
        })

    return contradictions


# ============================================================
# TRUST DECISION
# ============================================================

def build_trust(
    prediction: PredictionEvidence,
    concordance: Dict[str, Any],
    contradictions: List[Dict[str, Any]],
    quality: QualityEvidence,
    trust: TrustEvidence,
    clinical_rules: Dict[str, Any],
):

    reasons = []

    if (
        quality.action == "recapture"
        or quality.gradable is False
    ):

        reasons.append(
            "Image quality/gradability requires recapture."
        )

    if trust.ood:

        reasons.append(
            "Input flagged as out-of-distribution."
        )

    if (
        trust.uncertainty is not None
        and trust.uncertainty > 0.18
    ):

        reasons.append(
            "Elevated model uncertainty."
        )

    if prediction.near_boundary:

        reasons.append(
            "Prediction is near the referable/non-referable "
            "decision boundary."
        )

    if concordance["score"] < LOW_EVIDENCE:

        reasons.append(
            "Cross-modal evidence concordance is limited."
        )

    if clinical_rules["violated"] > 0:

        reasons.append(
            "Supplied clinical-rule checks contain discordance."
        )

    high_contradiction = any(
        item["severity"] == "HIGH"
        for item in contradictions
    )

    if high_contradiction:

        reasons.append(
            "At least one high-severity evidence conflict exists."
        )

    if quality.action == "recapture":

        verdict = "QUALITY_REJECTION"

    elif (
        reasons
        or high_contradiction
    ):

        verdict = "HUMAN_REVIEW"

    else:

        verdict = "AUTONOMOUS_SCREEN"

    if verdict == "AUTONOMOUS_SCREEN":

        level = "HIGH"

    elif verdict == "HUMAN_REVIEW":

        level = "MEDIUM"

    else:

        level = "LOW"

    return {
        "verdict":
            verdict,

        "level":
            level,

        "human_review_required":
            verdict == "HUMAN_REVIEW",

        "recapture_required":
            verdict == "QUALITY_REJECTION",

        "reasons":
            list(
                dict.fromkeys(reasons)
            ),

        "important_note":
            "Trust is a workflow safety decision based "
            "on supplied evidence; it is not a clinical "
            "diagnostic guarantee.",
    }


# ============================================================
# PLAIN-LANGUAGE EXPLANATION
# ============================================================

def build_explanation(
    prediction: PredictionEvidence,
    visual: Dict[str, Any],
    lesions: LesionEvidence,
    graph: GraphEvidence,
    quality: QualityEvidence,
    concordance: Dict[str, Any],
    contradictions: List[Dict[str, Any]],
    trust: Dict[str, Any],
    clinical_rules: Dict[str, Any],
):

    evidence_sentences = []

    if visual["available"]:

        evidence_sentences.append(
            "The image model produced a Grad-CAM "
            "attribution map showing which image regions "
            "influenced the prediction."
        )

    if lesions.total_detected > 0:

        evidence_sentences.append(
            f"The lesion module supplied "
            f"{lesions.total_detected} positive lesion detections "
            f"across its available lesion categories."
        )

    elif lesions.available:

        evidence_sentences.append(
            "The lesion module did not supply positive "
            "lesion detections for this image."
        )

    if graph.available:

        evidence_sentences.append(
            f"The retinal graph supplied structural context "
            f"with {graph.nodes} nodes and {graph.edges} edges."
        )

    if clinical_rules["available"]:

        if clinical_rules["status"] == "CONCORDANT":

            evidence_sentences.append(
                "The supplied clinical-rule checks were concordant."
            )

        elif clinical_rules["status"] == "DISCORDANT":

            evidence_sentences.append(
                "The supplied clinical-rule checks contained "
                "discordance."
            )

    if quality.available:

        evidence_sentences.append(
            f"Image quality status was "
            f"{quality.status}."
        )

    if contradictions:

        evidence_sentences.append(
            f"The coordinator detected "
            f"{len(contradictions)} evidence conflict(s), "
            f"so the result should not be interpreted without "
            f"the indicated safety workflow."
        )

    if trust["verdict"] == "QUALITY_REJECTION":

        summary = (
            "The system did not treat the image as reliably "
            "gradable and recommends recapture."
        )

    elif trust["verdict"] == "HUMAN_REVIEW":

        summary = (
            f"The model produced '{prediction.prediction}', "
            "but the available evidence or uncertainty "
            "requires human review before final workflow "
            "completion."
        )

    else:

        summary = (
            f"The model produced '{prediction.prediction}'. "
            "The available evidence channels were coordinated "
            "to assess whether the result is sufficiently "
            "supported for the configured screening workflow."
        )

    return {
        "summary":
            summary,

        "evidence_points":
            evidence_sentences,

        "plain_language":
            (
                "This explanation combines model attribution, "
                "detected lesions, retinal topology, image "
                "quality and any supplied clinical-rule results. "
                "It explains what the system used; it does not "
                "turn Grad-CAM or graph features into proof of disease."
            ),

        "clinical_safety":
            (
                "AI evidence is decision support. Clinical "
                "interpretation and referral decisions remain "
                "subject to appropriate human review."
            ),
    }


# ============================================================
# FRONTEND-READY STRUCTURE
# ============================================================

def build_frontend_payload(
    report,
    visual,
    lesions,
    graph,
    quality,
    concordance,
    trust,
    explanation,
    clinical_rules,
):

    prediction = extract_prediction(report)

    return {
        "prediction": {
            "label":
                prediction.prediction,

            "prediction_class":
                prediction.prediction_class,

            "referable_probability":
                _round(
                    prediction.referable_probability
                ),

            "confidence":
                _round(
                    prediction.confidence
                ),

            "confidence_percent":
                round(
                    prediction.confidence * 100,
                    1,
                ),
        },

        "visual": visual,

        "structural": {
            "graph":
                graph,

            "topology":
                {
                    "nodes":
                        graph["nodes"],
                    "edges":
                        graph["edges"],
                    "junctions":
                        graph["junctions"],
                    "endpoints":
                        graph["endpoints"],
                },
        },

        "lesions": lesions,

        "quality": quality,

        "clinical_rules":
            clinical_rules,

        "evidence": {
            "concordance":
                concordance,

            "contradictions":
                detect_contradictions(
                    prediction,
                    extract_lesions(report),
                    extract_graph(report),
                    extract_quality(report),
                    extract_trust(report),
                    clinical_rules,
                ),

            "strength":
                (
                    "HIGH"
                    if concordance["score"]
                    >= MEDIUM_EVIDENCE
                    else
                    "MEDIUM"
                    if concordance["score"]
                    >= LOW_EVIDENCE
                    else
                    "LOW"
                ),
        },

        "trust":
            trust,

        "explanation":
            explanation,

        "report": {
            "report_id":
                report.get(
                    "report_id"
                ),

            "timestamp":
                report.get(
                    "timestamp"
                ),

            "status":
                report.get(
                    "status"
                ),
        },
    }


# ============================================================
# MAIN COORDINATOR
# ============================================================

def build_central_xai(
    report: Dict[str, Any],
    run_dir: Optional[str | Path] = None,
) -> Dict[str, Any]:

    if not isinstance(report, dict):
        raise TypeError(
            "report must be a dictionary."
        )

    if run_dir is not None:
        run_dir = Path(run_dir)

    prediction = extract_prediction(
        report
    )

    quality = extract_quality(
        report
    )

    lesions = extract_lesions(
        report
    )

    graph = extract_graph(
        report
    )

    trust_input = extract_trust(
        report
    )

    visual = build_visual_evidence(
        report,
        run_dir,
    )

    lesion_payload = build_lesion_evidence(
        lesions
    )

    graph_payload = build_graph_evidence(
        graph
    )

    quality_payload = build_quality_evidence(
        quality
    )

    clinical_rules = extract_clinical_rules(
        report
    )

    concordance = calculate_concordance(
        prediction=prediction,
        visual=visual,
        lesions=lesions,
        graph=graph,
        quality=quality,
        trust=trust_input,
        clinical_rules=clinical_rules,
    )

    contradictions = detect_contradictions(
        prediction=prediction,
        lesions=lesions,
        graph=graph,
        quality=quality,
        trust=trust_input,
        clinical_rules=clinical_rules,
    )

    trust = build_trust(
        prediction=prediction,
        concordance=concordance,
        contradictions=contradictions,
        quality=quality,
        trust=trust_input,
        clinical_rules=clinical_rules,
    )

    explanation = build_explanation(
        prediction=prediction,
        visual=visual,
        lesions=lesions,
        graph=graph,
        quality=quality,
        concordance=concordance,
        contradictions=contradictions,
        trust=trust,
        clinical_rules=clinical_rules,
    )

    frontend = build_frontend_payload(
        report=report,
        visual=visual,
        lesions=lesion_payload,
        graph=graph_payload,
        quality=quality_payload,
        concordance=concordance,
        trust=trust,
        explanation=explanation,
        clinical_rules=clinical_rules,
    )

    return {
        "engine":
            ENGINE_NAME,

        "version":
            "1.0",

        "report_id":
            report.get(
                "report_id"
            ),

        "prediction":
            frontend["prediction"],

        "visual_evidence":
            visual,

        "lesion_evidence":
            lesion_payload,

        "structural_evidence":
            graph_payload,

        "quality_evidence":
            quality_payload,

        "clinical_rule_evidence":
            clinical_rules,

        "evidence_concordance":
            concordance,

        "contradictions":
            contradictions,

        "trust":
            trust,

        "explanation":
            explanation,

        "frontend":
            frontend,

        "safety_note":
            "This is an explainability and evidence "
            "coordination layer for a research/hackathon "
            "prototype. Attribution maps and structural "
            "signals should not be presented as independent "
            "proof of disease.",
    }


# ============================================================
# FILE HELPERS
# ============================================================

def save_xai(
    xai: Dict[str, Any],
    run_dir: str | Path,
):

    run_dir = Path(run_dir)

    run_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    path = (
        run_dir
        / "central_xai.json"
    )

    with open(
        path,
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            xai,
            file,
            indent=2,
            default=str,
        )

    return path


def load_report_and_explain(
    report_path: str | Path,
    run_dir: Optional[str | Path] = None,
):

    report_path = Path(
        report_path
    )

    with open(
        report_path,
        "r",
        encoding="utf-8",
    ) as file:

        report = json.load(file)

    if run_dir is None:
        run_dir = report_path.parent

    return build_central_xai(
        report,
        run_dir,
    )


# ============================================================
# OPTIONAL FLASK BLUEPRINT
# ============================================================

def create_xai_blueprint():

    from flask import Blueprint, jsonify, request

    bp = Blueprint(
        "central_xai",
        __name__,
        url_prefix="/api/xai",
    )

    @bp.post("/explain")
    def explain():

        payload = request.get_json(
            force=True,
            silent=True,
        ) or {}

        report = payload.get(
            "report",
            payload,
        )

        run_dir = payload.get(
            "run_dir"
        )

        try:

            result = build_central_xai(
                report=report,
                run_dir=run_dir,
            )

            return jsonify({
                "success": True,
                "xai": result,
            })

        except Exception as exc:

            return jsonify({
                "success": False,
                "error":
                    str(exc),
            }), 400

    return bp


# ============================================================
# COMMAND LINE TEST
# ============================================================

if __name__ == "__main__":

    import argparse

    parser = argparse.ArgumentParser(
        description=
        "RETINA-FUSION 360 Central XAI Engine"
    )

    parser.add_argument(
        "--report",
        required=True,
        help="Path to an existing report.json",
    )

    parser.add_argument(
        "--run-dir",
        default=None,
        help="Directory containing Grad-CAM and other artifacts.",
    )

    args = parser.parse_args()

    result = load_report_and_explain(
        args.report,
        args.run_dir,
    )

    print(
        json.dumps(
            result,
            indent=2,
            default=str,
        )
    )
