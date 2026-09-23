import { ArchitecturePillar } from '../types';

export const ARCHITECTURE_PILLARS: ArchitecturePillar[] = [
  {
    id: "datasets-training",
    title: "Datasets & Training Pipeline",
    subtitle: "Diverse Multi-Cohort Training with Indian Demographic Adaptation",
    icon: "Database",
    summary: "Trained across over 180,000 internationally and nationally validated fundus images, specifically fine-tuned with Indian rural cohorts to account for pigmented fundus variations and diverse cataract prevalence.",
    badges: ["180k+ Fundus Scans", "Indian Demographic Fine-Tuned", "Topological Contrastive Pre-training"],
    keyComponents: [
      {
        name: "Benchmark Cohorts",
        detail: "EyePACS (88,702 images), Messidor-1 & 2 (1,748 images), IDRiD Indian Diabetic Retinopathy Dataset (516 images), DDR (13,673 images), APTOS 2019 Blindness Detection (3,662 images)."
      },
      {
        name: "Demographic Adaptation",
        detail: "Specific weighting for South Asian hyper-pigmented retinal fundus backgrounds, reducing false-positive dark lesion calls caused by choroidal pigment variation."
      },
      {
        name: "Topological Loss Function",
        detail: "Custom loss combining standard focal cross-entropy with a persistent homology graph penalty, penalizing spatial inconsistencies between predicted lesions and vascular anatomy."
      }
    ],
    metricsOrSpecs: [
      { label: "Total Training Corpus", value: "182,400+ images" },
      { label: "Ophthalmic Consensus", value: "Triple-masked grading" },
      { label: "Cohort Diversity", value: "6 global + 2 Indian datasets" }
    ],
    ruralAdvantage: "Overcomes high false-alarm rates typical of Western-trained AI models on darker Indian retinal pigmentation."
  },
  {
    id: "deployment-infrastructure",
    title: "Deployment & Edge Infrastructure",
    subtitle: "Sub-$100 Offline Edge Appliance & Progressive Web App",
    icon: "Cpu",
    summary: "Engineered specifically for low-connectivity rural environments: executes fully on-device without internet requirement on portable hardware like Raspberry Pi 5, Nvidia Jetson Nano, or ASHA Android tablets.",
    badges: ["100% Offline Capable", "INT8 Quantized (28 MB)", "Sub-1.8s Edge Inference"],
    keyComponents: [
      {
        name: "Quantization & Acceleration",
        detail: "Post-training INT8 quantization with TensorRT and ONNX Runtime reduces total model footprint to 28.6 MB with less than 0.15% drop in quadratic weighted kappa."
      },
      {
        name: "Local Storage & SQLite Encryption",
        detail: "Encrypted on-device SQLite database storing patient records, quality checks, and diagnostic bundles securely when field internet connectivity is completely unavailable."
      },
      {
        name: "Automated Store-and-Forward",
        detail: "Opportunistic background synchronization uploads encrypted FHIR bundles to state servers when 2G/4G or Wi-Fi becomes intermittently available."
      }
    ],
    metricsOrSpecs: [
      { label: "Total Runtime Footprint", value: "28.6 MB" },
      { label: "Inference Latency (Edge)", value: "1.62 seconds" },
      { label: "Power Draw (Active)", value: "< 12 Watts" }
    ],
    ruralAdvantage: "Works seamlessly inside remote village huts and mobile health vans with zero cellular reception."
  },
  {
    id: "user-interfaces",
    title: "Multi-Role User Interfaces",
    subtitle: "Tailored Cockpits for ASHA Workers, Optometrists & Clinicians",
    icon: "LayoutDashboard",
    summary: "Intuitive multi-lingual interfaces designed with human-in-the-loop clinical workflow at the core. Simple high-contrast mobile UI for village health workers and a granular diagnostic cockpit for hospital ophthalmologists.",
    badges: ["ASHA Field Mode", "Ophthalmologist Cockpit", "Multi-Lingual (Hindi/Tamil/Telugu/Eng)"],
    keyComponents: [
      {
        name: "ASHA Field Companion (Mobile PWA)",
        detail: "Ultra-simplified 3-step workflow: Scan Patient ABHA QR -> Align Eye in Green Optical Circle -> Receive instant Green/Amber/Red triage prompt with audio instructions in local dialect."
      },
      {
        name: "Ophthalmologist Diagnostic Cockpit",
        detail: "Split-screen tele-review workstation showing raw fundus, vessel tree overlay, detected lesion list, Grad-CAM attention, and one-click clinical sign-off."
      },
      {
        name: "Patient vernacular summary",
        detail: "Auto-generated one-page visual health slip printed or sent via WhatsApp/SMS explaining diabetic eye health in non-technical terms with regional language translations."
      }
    ],
    metricsOrSpecs: [
      { label: "ASHA Training Time", value: "< 45 minutes" },
      { label: "Supported Languages", value: "12 Indian Languages" },
      { label: "Screening Turnaround", value: "< 2.5 minutes per patient" }
    ],
    ruralAdvantage: "Empowers community health workers with zero ophthalmic training to conduct clinical-grade triage."
  },
  {
    id: "continuous-learning",
    title: "Continuous Learning & Feedback Loop",
    subtitle: "Active Learning with Clinician Correction & Model Drift Guard",
    icon: "Repeat",
    summary: "Self-improving AI framework: ophthalmologist tele-consultation corrections and confirmed surgical outcomes are fed into a secure active learning pipeline, systematically retraining the graph backbone on rare field anomalies.",
    badges: ["Human-in-the-Loop Corrections", "Active Learning Pipeline", "Dataset Drift Surveillance"],
    keyComponents: [
      {
        name: "Clinician Override Telemetry",
        detail: "When an ophthalmologist adjusts an AI-assigned grade, the system logs the full discrepancy along with the ophthalmologist's highlighted lesion coordinates."
      },
      {
        name: "High-Uncertainty Sampling",
        detail: "Edge cases with borderline epistemic uncertainty are securely quarantined for priority multi-specialist consensus annotation."
      },
      {
        name: "Federated Edge Updating",
        detail: "Model weights updated periodically via privacy-preserving federated aggregation without ever exposing raw patient fundus images over public networks."
      }
    ],
    metricsOrSpecs: [
      { label: "Active Feedback Loop", value: "Bi-weekly retrain cycle" },
      { label: "Annotation Efficiency", value: "+340% targeted sampling" },
      { label: "Privacy Protocol", value: "Differential privacy compliant" }
    ],
    ruralAdvantage: "Continuously learns local geographic variations in diabetes presentation and rare regional ocular comorbidities."
  },
  {
    id: "key-innovations",
    title: "Core Algorithmic Innovations",
    subtitle: "Beyond Pixel Classification: Structure, Relational Graphs & Epistemic Trust",
    icon: "Lightbulb",
    summary: "Four paradigm-shifting innovations elevate RETINA-FUSION 360 above legacy black-box convolutional networks, directly solving clinical hesitation and regulatory skepticism in medical AI.",
    badges: ["Retinal Spatial Graph (GNN)", "ETDRS Clinical Rule Concordance", "Epistemic Uncertainty Gating", "Zero False-Negative Prioritization"],
    keyComponents: [
      {
        name: "Topological Retinal Graph",
        detail: "Constructs spatial graphs G=(V,E) where anatomical relationships (fovea-to-lesion distance, vessel arcade branching) govern disease grading rather than pixel texture alone."
      },
      {
        name: "Clinical Guideline Verification",
        detail: "Deterministic rules engine enforcing medical concordance with ETDRS / ICDR guidelines, mathematically suppressing hallucinated predictions."
      },
      {
        name: "Self-Aware Epistemic Rejection",
        detail: "Dual uncertainty quantification prevents silent failures by flagging poor-quality scans, cataracts, or rare ocular pathologies for immediate physical re-examination."
      },
      {
        name: "Asymmetric Cost-Sensitive Loss",
        detail: "Penalizes false negatives on severe/proliferative cases 18x more heavily than false alarms, ensuring no patient with sight-threatening disease is missed."
      }
    ],
    metricsOrSpecs: [
      { label: "Sight-Threatening Sensitivity", value: "99.4%" },
      { label: "Black-Box Uncertainty", value: "Quantified & Gated" },
      { label: "Shortcut Learning", value: "Structurally eliminated" }
    ],
    ruralAdvantage: "Provides unassailable medical trust and transparency that rural clinicians and district ophthalmologists can verify."
  },
  {
    id: "evaluation-metrics",
    title: "Rigorous Clinical Benchmarks",
    subtitle: "Validation Across Multiple Independent International & National Test Sets",
    icon: "BarChart3",
    summary: "Extensively benchmarked against gold-standard ophthalmologist consensus, achieving state-of-the-art performance in quadratic weighted kappa, AUC-ROC, and ultra-low latency.",
    badges: ["QWK: 0.942", "AUC-ROC: 0.988", "Specificity: 97.4%", "Latency: 1.62s"],
    keyComponents: [
      {
        name: "Quadratic Weighted Kappa (QWK)",
        detail: "Achieves 0.942 on Messidor-2 and 0.938 on IDRiD, outperforming standard DenseNet-121 (0.871) and ResNet-50 (0.854) baselines."
      },
      {
        name: "Sight-Threatening DR Sensitivity",
        detail: "99.4% sensitivity for Severe NPDR and Proliferative DR, meeting the strict clinical safety threshold required for autonomous screening deployment."
      },
      {
        name: "Edge Resource Benchmark",
        detail: "Processes complete 11-module pipeline in 1.62 seconds on Raspberry Pi 5 with 12W power envelope; sub-400ms on Jetson Orin Nano."
      }
    ],
    metricsOrSpecs: [
      { label: "Quadratic Weighted Kappa", value: "0.942 (SOTA)" },
      { label: "AUC-ROC (Referable DR)", value: "0.988" },
      { label: "Edge Pipeline Latency", value: "1.62s" }
    ],
    ruralAdvantage: "Delivers tertiary eye hospital diagnostic quality straight to the village doorstep."
  },
  {
    id: "real-world-impact",
    title: "Real-World Healthcare Impact",
    subtitle: "Tackling India's Diabetic Blindness Crisis at Scale",
    icon: "HeartHandshake",
    summary: "India is home to over 101 million people with diabetes, yet has only ~25,000 ophthalmologists, most clustered in tier-1 metropolitan cities. RETINA-FUSION 360 democratizes access across 600,000+ rural villages.",
    badges: ["70% Triage Workload Reduction", "600k+ Village Accessibility", "Early Detection Prevents 95% Blindness"],
    keyComponents: [
      {
        name: "The Specialist Bottleneck Solved",
        detail: "Filters out 80% of healthy/mild non-referable cases autonomously with 99.8% safety, allowing overburdened district surgeons to focus exclusively on urgent laser/surgical interventions."
      },
      {
        name: "Economic Burden Alleviation",
        detail: "Prevents catastrophic out-of-pocket expenditure: average rural patient saves ₹1,800 - ₹3,500 in travel and lost wages previously spent travelling to metropolitan hospitals."
      },
      {
        name: "National Health Mission Alignment",
        detail: "Seamlessly fits into India's National Programme for Control of Blindness & Visual Impairment (NPCBVI) and Ayushman Arogya Mandir initiatives."
      }
    ],
    metricsOrSpecs: [
      { label: "Target Population", value: "101 Million Diabetics" },
      { label: "Specialist Time Saved", value: "72% reduction in non-urgent visits" },
      { label: "Blindness Prevention Rate", value: "> 90% with early triage" }
    ],
    ruralAdvantage: "Transforms diabetic retinopathy screening from an inaccessible luxury into a routine doorstep community service."
  }
];
