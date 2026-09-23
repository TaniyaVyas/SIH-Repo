import { ClinicalCase } from '../types';

export const CLINICAL_CASES: ClinicalCase[] = [
  {
    id: "case-normal",
    patientCode: "PAT-MH-2024-0812",
    age: 48,
    gender: "Female",
    location: "Rural Sub-Centre, Shirur, Pune Dist, Maharashtra",
    fundusType: "Macula-Centered 45°",
    icdrGrade: 0,
    gradeLabel: "Grade 0 — No Apparent Retinopathy",
    severityStage: "No DR",
    riskScore: 2, // 2%
    confidence: 99.4,
    uncertaintyScore: 0.018, // Very low epistemic uncertainty
    oodFlag: false,
    trustVerdict: "Autonomous Safe Screen",
    macularInvolvement: false,
    lesionsSummary: {
      microaneurysms: 0,
      hemorrhages: 0,
      hardExudates: 0,
      cottonWoolSpots: 0,
      neovascularization: false,
    },
    etdrsConcordance: [
      {
        rule: "ETDRS Rule 0: Absence of microaneurysms and hemorrhages in all 4 quadrants",
        status: "Matched",
        notes: "Zero micro-vascular anomalies detected; foveal avascular zone (FAZ) intact."
      },
      {
        rule: "Macular Edema Screen: Absence of hard exudates within 1 disc diameter",
        status: "Matched",
        notes: "Macular reflex clear with normal foveal contour."
      },
      {
        rule: "Vascular Integrity: Arteriolar-to-venular ratio (AVR) normal",
        status: "Matched",
        notes: "AVR measured at 0.68, no venous beading or caliber abnormalities."
      }
    ],
    triageUrgency: "Routine (12 Months)",
    teleConsultRequired: false,
    notes: "Fundus clear. Patient advised regular annual diabetic retinal screening and optimal glycemic control (HbA1c target < 7.0%).",
    abhaId: "91-4432-8819-2041",
    healthCentre: "Shirur Primary Health Centre (Ayushman Arogya Mandir)"
  },
  {
    id: "case-mild",
    patientCode: "PAT-TN-2024-1149",
    age: 56,
    gender: "Male",
    location: "Village Sub-Centre, Dharmapuri, Tamil Nadu",
    fundusType: "Macula-Centered 45°",
    icdrGrade: 1,
    gradeLabel: "Grade 1 — Mild Non-Proliferative Diabetic Retinopathy",
    severityStage: "Mild NPDR",
    riskScore: 24, // 24%
    confidence: 96.8,
    uncertaintyScore: 0.034,
    oodFlag: false,
    trustVerdict: "Autonomous Safe Screen",
    macularInvolvement: false,
    lesionsSummary: {
      microaneurysms: 4,
      hemorrhages: 0,
      hardExudates: 0,
      cottonWoolSpots: 0,
      neovascularization: false,
    },
    etdrsConcordance: [
      {
        rule: "ETDRS Rule 1: Microaneurysms only (isolated focal capillary out-pouchings)",
        status: "Matched",
        notes: "4 microaneurysms localized strictly in superior-temporal and inferior-nasal quadrants."
      },
      {
        rule: "ETDRS Rule 1b: Absence of blot hemorrhages, exudates, and IRMA",
        status: "Matched",
        notes: "Confirmed absence of larger flame/blot hemorrhages."
      },
      {
        rule: "Macular Safety Check: Distance to fovea > 1500 microns",
        status: "Matched",
        notes: "All microaneurysms situated > 2.2 disc diameters away from fovea centralis."
      }
    ],
    triageUrgency: "Elective (3-6 Months)",
    teleConsultRequired: false,
    notes: "Mild NPDR diagnosed. Microaneurysms monitored. Automated ASHA follow-up alert scheduled in 6 months. Blood pressure and fasting sugar counselled.",
    abhaId: "42-8801-4473-9920",
    healthCentre: "Dharmapuri District Tele-Ophthalmology Hub"
  },
  {
    id: "case-severe",
    patientCode: "PAT-UP-2024-4091",
    age: 63,
    gender: "Female",
    location: "Community Health Centre, Barabanki, Uttar Pradesh",
    fundusType: "Macula-Centered 45°",
    icdrGrade: 3,
    gradeLabel: "Grade 3 — Severe NPDR with Clinically Significant Macular Threat",
    severityStage: "Severe NPDR",
    riskScore: 89, // 89%
    confidence: 98.2,
    uncertaintyScore: 0.022,
    oodFlag: false,
    trustVerdict: "Human-in-the-Loop Referral",
    macularInvolvement: true,
    lesionsSummary: {
      microaneurysms: 28,
      hemorrhages: 42,
      hardExudates: 19,
      cottonWoolSpots: 5,
      neovascularization: false,
    },
    etdrsConcordance: [
      {
        rule: "ETDRS 4-2-1 Rule: Blot hemorrhages > 20 in all 4 retinal quadrants",
        status: "Matched",
        notes: "Extensive blot and flame hemorrhages confirmed across all four quadrants."
      },
      {
        rule: "ETDRS 4-2-1 Rule: Venous beading confirmed in >= 2 quadrants",
        status: "Matched",
        notes: "Venous caliber irregularities and beading present along superior temporal arcade."
      },
      {
        rule: "Clinically Significant Macular Edema (CSME) Threat",
        status: "Matched",
        notes: "Hard exudate circinate ring localized within 500 microns of fovea center. High risk of permanent central vision loss!"
      }
    ],
    triageUrgency: "Urgent (1-2 Weeks)",
    teleConsultRequired: true,
    notes: "High-risk Severe NPDR with threatening diabetic maculopathy. Immediate referral to District Eye Hospital for anti-VEGF / focal laser evaluation. Auto-e-Sanjeevani teleconsult booked.",
    abhaId: "19-7720-3312-8845",
    healthCentre: "Barabanki CHC / King George's Medical University Tele-OPD"
  },
  {
    id: "case-rejected",
    patientCode: "PAT-RJ-2024-0043",
    age: 71,
    gender: "Male",
    location: "Mobile Screening Van, Barmer, Rajasthan",
    fundusType: "Compromised Capture",
    icdrGrade: 0,
    gradeLabel: "Screening Aborted — Quality & Uncertainty Rejection Gate Triggered",
    severityStage: "Quality Rejected",
    riskScore: 0,
    confidence: 34.1,
    uncertaintyScore: 0.312, // High epistemic uncertainty!
    oodFlag: true, // Out of distribution
    trustVerdict: "Quality Rejection (Recapture)",
    macularInvolvement: false,
    lesionsSummary: {
      microaneurysms: 0,
      hemorrhages: 0,
      hardExudates: 0,
      cottonWoolSpots: 0,
      neovascularization: false,
    },
    etdrsConcordance: [
      {
        rule: "Quality Gate Q_score >= 0.72",
        status: "Violated",
        notes: "Q_score = 0.38. Dense cataract media opacity + severe pupil contraction (< 2.5mm)."
      },
      {
        rule: "Epistemic Uncertainty Gate U_epi <= 0.08",
        status: "Violated",
        notes: "U_epi = 0.312. Model uncertainty exceeds safety threshold for automated classification."
      },
      {
        rule: "Out-of-Distribution Manifold Distance",
        status: "Violated",
        notes: "Input features deviate by 4.8 sigma from validated fundus training distribution."
      }
    ],
    triageUrgency: "Immediate Recapture Required",
    teleConsultRequired: true,
    notes: "Self-Aware Safety Gate intercepted this scan! AI refused to guess on compromised imagery. ASHA worker instructed to darken room, dilate pupil if indicated, or refer for cataract surgery assessment.",
    abhaId: "77-9912-4402-1134",
    healthCentre: "Barmer Rural Health Mobile Unit"
  }
];
