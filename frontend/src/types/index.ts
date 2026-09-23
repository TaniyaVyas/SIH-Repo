export interface PipelineModule {
  id: number;
  name: string;
  tagline: string;
  iconName: string;
  category: 'Acquisition & Quality' | 'Structural Analysis' | 'Graph & Deep Learning' | 'Clinical Verification & Trust' | 'Care Pathway';
  description: string;
  inputs: string[];
  outputs: string[];
  mathFormulation: string;
  clinicalRationale: string;
  edgeLatency: string;
  modelFootprint: string;
  hardwareTier: string;
  verificationCheck: string;
  highlights: string[];
}

export interface ClinicalCase {
  id: string;
  patientCode: string;
  age: number;
  gender: 'Female' | 'Male';
  location: string;
  fundusType: 'Macula-Centered 45°' | 'Optic Disc Centered 45°' | 'Compromised Capture';
  icdrGrade: 0 | 1 | 2 | 3 | 4;
  gradeLabel: string;
  severityStage: 'No DR' | 'Mild NPDR' | 'Moderate NPDR' | 'Severe NPDR' | 'Proliferative DR' | 'Quality Rejected';
  riskScore: number; // 0-100%
  confidence: number; // 0-100%
  uncertaintyScore: number; // Epistemic uncertainty
  oodFlag: boolean; // Out of distribution
  trustVerdict: 'Autonomous Safe Screen' | 'Human-in-the-Loop Referral' | 'Quality Rejection (Recapture)';
  macularInvolvement: boolean;
  lesionsSummary: {
    microaneurysms: number;
    hemorrhages: number;
    hardExudates: number;
    cottonWoolSpots: number;
    neovascularization: boolean;
  };
  etdrsConcordance: {
    rule: string;
    status: 'Matched' | 'Violated' | 'Not Applicable';
    notes: string;
  }[];
  triageUrgency: 'Routine (12 Months)' | 'Elective (3-6 Months)' | 'Urgent (1-2 Weeks)' | 'Immediate Recapture Required';
  teleConsultRequired: boolean;
  notes: string;
  abhaId: string;
  healthCentre: string;
}

export interface ArchitecturePillar {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  summary: string;
  badges: string[];
  keyComponents: {
    name: string;
    detail: string;
  }[];
  metricsOrSpecs: {
    label: string;
    value: string;
  }[];
  ruralAdvantage: string;
}
