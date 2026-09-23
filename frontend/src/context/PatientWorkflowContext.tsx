import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserRole, LanguageCode } from '../types/auth';
import { createDefaultFundusDataUrl } from './RetinaContext';

export type PatientStatus =
  | 'Awaiting Screening'
  | 'Screening in Progress'
  | 'Report Awaiting Doctor'
  | 'Awaiting Doctor Verification'
  | 'Doctor Verified'
  | 'Requires Reassessment'
  | 'Follow-up Required'
  | 'Referral Recommended'
  | 'Completed';

export type HospitalStatus =
  | 'New Patient'
  | 'Image Required'
  | 'Image Quality Failed'
  | 'Screening Running'
  | 'Report Generated'
  | 'Awaiting Doctor'
  | 'Doctor Verified';

export type DoctorReportStatus =
  | 'Awaiting Review'
  | 'Under Review'
  | 'Doctor Verified'
  | 'Requires Reassessment';

export interface QualityCheckDetail {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'checking';
  metric: string;
  detail: string;
}

export interface ImageQualityAssessment {
  overall: 'GOOD' | 'POOR';
  score: number; // 0 to 100
  blurPassed: boolean;
  focusPassed: boolean;
  illuminationPassed: boolean;
  visibilityPassed: boolean;
  positioningPassed: boolean;
  artifactsPassed: boolean;
  reasons: string[];
  checks: QualityCheckDetail[];
}

export interface AIResult {
  drCategory: 'No DR' | 'Mild DR' | 'Moderate DR' | 'Severe DR' | 'Proliferative DR';
  gradeIndex: 0 | 1 | 2 | 3 | 4;
  confidence: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  detectedLesions: {
    microaneurysms: number;
    hemorrhages: number;
    hardExudates: number;
    cottonWoolSpots: number;
  };
  retinalVisualization: string;
  xaiHeatmapUrl: string;
  evidenceStrength: 'High (ETDRS Concordant)' | 'Moderate' | 'Indeterminate';
  errorRisk: number; // e.g. 0.038 (3.8%)
  trustDecision: 'Autonomous Safe Screen' | 'Clinical Triage Priority' | 'Specialist Consultation Required';
  isDemoSimulated: boolean; // Always true for mock/demo
}

export interface DoctorReviewRecord {
  verifiedBy: string;
  qualification: string;
  hospital: string;
  assessment: 'Agree with AI' | 'Disagree with AI' | 'Requires Further Review';
  doctorComments: string;
  aiAccuracyFeedback: 'Correct' | 'Partially Correct' | 'Incorrect';
  verifiedAt: string;
  signatureStamp: string;
}

export interface CarePlan {
  recommendedNextStep: string;
  referralInformation: string;
  followUpDate: string;
  importantReminders: string[];
}

export interface ScreeningRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientVillage: string;
  date: string;
  retinalImage: string;
  imageQuality: ImageQualityAssessment;
  aiResult: AIResult;
  reportStatus: 'Awaiting Doctor Verification' | 'Awaiting Doctor Review' | 'Doctor Verified' | 'Requires Reassessment';
  doctorReview?: DoctorReviewRecord;
  carePlan: CarePlan;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  mobile: string;
  village: string;
  talukaBlock: string;
  district: string;
  state: string;
  pinCode: string;
  bloodGroup: string;
  diabetesStatus: 'Yes' | 'No';
  diabetesDuration: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  languagePreference: LanguageCode;
  createdAt: string;
  status: PatientStatus;
  lastScreeningDate?: string;
  latestScreening?: ScreeningRecord;
}

export interface NewPatientInput {
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  mobile: string;
  village: string;
  talukaBlock: string;
  district: string;
  state: string;
  pinCode: string;
  bloodGroup: string;
  diabetesStatus: 'Yes' | 'No';
  diabetesDuration: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  languagePreference: LanguageCode;
  password?: string;
  confirmPassword?: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export interface DoctorVerificationInput {
  assessment: 'Agree with AI' | 'Disagree with AI' | 'Requires Further Review';
  doctorComments: string;
  aiAccuracyFeedback: 'Correct' | 'Partially Correct' | 'Incorrect';
  action: 'verify' | 'reassess';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  targetRole: UserRole;
  timestamp: string;
  read: boolean;
}

interface PatientWorkflowContextType {
  patients: Patient[];
  activePatient: Patient | null;
  setActivePatientId: (id: string | null) => void;
  registerPatient: (input: NewPatientInput) => Patient;
  // Image Quality Check
  qualityCheck: ImageQualityAssessment | null;
  isCheckingQuality: boolean;
  runQualityCheck: (imageSrc: string, forceOutcome?: 'GOOD' | 'POOR') => Promise<ImageQualityAssessment>;
  resetQualityCheck: () => void;
  // 11 Module Pipeline
  isPipelineRunning: boolean;
  pipelineProgress: number; // 0 to 100
  pipelineStage: number; // 1 to 11
  pipelineStageName: string;
  currentScreening: ScreeningRecord | null;
  run11ModulePipeline: (patientId: string, imageSrc: string) => Promise<ScreeningRecord>;
  // Doctor Verification
  sendToDoctor: (screeningId: string) => void;
  verifyByDoctor: (screeningId: string, input: DoctorVerificationInput) => void;
  doctorQueue: ScreeningRecord[];
  // Notifications
  notifications: NotificationItem[];
  dismissNotification: (id: string) => void;
  // Voice Explanation
  playVoiceExplanation: (report: ScreeningRecord, lang?: LanguageCode) => void;
  stopVoiceExplanation: () => void;
  isSpeakingVoice: boolean;
  voiceLangActive: LanguageCode;
  spokenTranscript: string;
}

const PatientWorkflowContext = createContext<PatientWorkflowContextType | undefined>(undefined);

const STORAGE_PATIENTS_KEY = 'retina_fusion_workflow_patients_v2';

export const PIPELINE_STAGE_NAMES = [
  'Module 1: Image Acquisition & Sensor Calibration',
  'Module 2: Quality Assessment & Dual CLAHE Retinal Denoising',
  'Module 3: Retinal Anatomy & Vessel Caliber Segmentation',
  'Module 4: Multi-Scale Lesion Detection (MA, Hemorrhages, Exudates)',
  'Module 5: Retinal Graph Topology & Relational GNN Construction',
  'Module 6: Multi-Task ICDR DR Classification (5-Tier)',
  'Module 7: Explainability (XAI) & Spatial Attention Heatmap',
  'Module 8: ETDRS Rule Concordance & Clinical Evidence Verification',
  'Module 9: Self-Aware Epistemic Uncertainty & OOD Error Prediction',
  'Module 10: Zero-Trust Autonomous Triage / Clinical Gate',
  'Module 11: Ayushman Bharat ABDM Referral & Care Pathway',
];

// Initial Seed Patient: Ramesh Patel
const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'PAT-MH-2024-001',
    name: 'Ramesh Patel',
    age: 52,
    gender: 'Male',
    mobile: '+91 98231 45678',
    village: 'Example Village',
    talukaBlock: 'Shirur Block',
    district: 'Pune District',
    state: 'Maharashtra',
    pinCode: '412210',
    bloodGroup: 'B+',
    diabetesStatus: 'Yes',
    diabetesDuration: '5 Years',
    emergencyContactName: 'Suman Patel',
    emergencyContactNumber: '+91 98231 99887',
    languagePreference: 'gu',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'Awaiting Doctor Verification',
    lastScreeningDate: 'Today',
    latestScreening: {
      id: 'SCR-2024-9941',
      patientId: 'PAT-MH-2024-001',
      patientName: 'Ramesh Patel',
      patientAge: 52,
      patientVillage: 'Example Village',
      date: 'Today',
      retinalImage: createDefaultFundusDataUrl('npdr'),
      imageQuality: {
        overall: 'GOOD',
        score: 96,
        blurPassed: true,
        focusPassed: true,
        illuminationPassed: true,
        visibilityPassed: true,
        positioningPassed: true,
        artifactsPassed: true,
        reasons: [],
        checks: [
          { id: '1', name: 'Focus & Sharpness', status: 'passed', metric: '0.94 / 1.0', detail: 'Vascular margins sharp' },
          { id: '2', name: 'Illumination Uniformity', status: 'passed', metric: '92% Even', detail: 'Zero over-saturation' },
          { id: '3', name: 'Retina Visibility', status: 'passed', metric: '98% FOV', detail: 'FAZ and Optic Disc visible' },
          { id: '4', name: 'Eye Centering', status: 'passed', metric: 'OD 45° Centered', detail: 'Macula aligned within 5%' },
          { id: '5', name: 'Artifact Detection', status: 'passed', metric: '0 Artifacts', detail: 'No eyelash/lens reflection' },
        ],
      },
      aiResult: {
        drCategory: 'Moderate DR',
        gradeIndex: 2,
        confidence: 96.8,
        riskLevel: 'Moderate',
        detectedLesions: {
          microaneurysms: 7,
          hemorrhages: 3,
          hardExudates: 12,
          cottonWoolSpots: 2,
        },
        retinalVisualization: createDefaultFundusDataUrl('npdr'),
        xaiHeatmapUrl: createDefaultFundusDataUrl('npdr'),
        evidenceStrength: 'High (ETDRS Concordant)',
        errorRisk: 0.038,
        trustDecision: 'Clinical Triage Priority',
        isDemoSimulated: true,
      },
      reportStatus: 'Awaiting Doctor Verification',
      doctorReview: undefined,
      carePlan: {
        recommendedNextStep: 'Awaiting doctor clinical review & prescription.',
        referralInformation: 'District Eye Hospital Pune — Tele-Retina OPD Slot Ref #DR-9941',
        followUpDate: 'Pending Verification',
        importantReminders: [
          'Screening completed at field center. Report undergoing specialist review.',
          'Maintain blood sugar and HbA1c strictly below 7.0%.',
          'Wear protective sunglasses and avoid looking directly at harsh sunlight.',
          'Contact the local Health Center immediately if new dark spots appear.',
        ],
      },
    },
  },
  {
    id: 'PAT-MH-2024-002',
    name: 'Savitri Bai Shinde',
    age: 64,
    gender: 'Female',
    mobile: '+91 94220 55112',
    village: 'Nimgaon Mhalungi',
    talukaBlock: 'Shirur Block',
    district: 'Pune District',
    state: 'Maharashtra',
    pinCode: '412209',
    bloodGroup: 'O+',
    diabetesStatus: 'Yes',
    diabetesDuration: '9 Years',
    emergencyContactName: 'Kailash Shinde',
    emergencyContactNumber: '+91 94220 55119',
    languagePreference: 'en',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'Report Awaiting Doctor',
    lastScreeningDate: 'Yesterday',
    latestScreening: {
      id: 'SCR-2024-9942',
      patientId: 'PAT-MH-2024-002',
      patientName: 'Savitri Bai Shinde',
      patientAge: 64,
      patientVillage: 'Nimgaon Mhalungi',
      date: 'Yesterday',
      retinalImage: createDefaultFundusDataUrl('severe'),
      imageQuality: {
        overall: 'GOOD',
        score: 91,
        blurPassed: true,
        focusPassed: true,
        illuminationPassed: true,
        visibilityPassed: true,
        positioningPassed: true,
        artifactsPassed: true,
        reasons: [],
        checks: [
          { id: '1', name: 'Focus & Sharpness', status: 'passed', metric: '0.88 / 1.0', detail: 'Clear foveal reflex' },
          { id: '2', name: 'Illumination Uniformity', status: 'passed', metric: '89% Even', detail: 'Minor peripheral vignetting' },
          { id: '3', name: 'Retina Visibility', status: 'passed', metric: '94% FOV', detail: 'All 4 quadrants visible' },
          { id: '4', name: 'Eye Centering', status: 'passed', metric: 'OS 45° Centered', detail: 'Good patient fixation' },
          { id: '5', name: 'Artifact Detection', status: 'passed', metric: '0 Artifacts', detail: 'Clear pupil alignment' },
        ],
      },
      aiResult: {
        drCategory: 'Severe DR',
        gradeIndex: 3,
        confidence: 97.4,
        riskLevel: 'Critical',
        detectedLesions: {
          microaneurysms: 18,
          hemorrhages: 8,
          hardExudates: 24,
          cottonWoolSpots: 4,
        },
        retinalVisualization: createDefaultFundusDataUrl('severe'),
        xaiHeatmapUrl: createDefaultFundusDataUrl('severe'),
        evidenceStrength: 'High (ETDRS Concordant)',
        errorRisk: 0.024,
        trustDecision: 'Specialist Consultation Required',
        isDemoSimulated: true,
      },
      reportStatus: 'Awaiting Doctor Review',
      carePlan: {
        recommendedNextStep: 'Urgent referral: Tertiary Eye Hospital Vitreo-Retinal unit within 7 days.',
        referralInformation: 'Sassoon General Hospital & BJ Medical College Tele-Ophthalmology Desk',
        followUpDate: 'Immediate / Within 7 Days',
        importantReminders: [
          'Immediate evaluation for anti-VEGF or pan-retinal photocoagulation.',
          'Check blood pressure and nephropathy markers urgently.',
        ],
      },
    },
  },
];

export const PatientWorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PATIENTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_PATIENTS;
  });

  const [activePatientId, setActivePatientId] = useState<string | null>('PAT-MH-2024-001');
  const [qualityCheck, setQualityCheck] = useState<ImageQualityAssessment | null>(null);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);

  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [pipelineStage, setPipelineStage] = useState(1);
  const [currentScreening, setCurrentScreening] = useState<ScreeningRecord | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'New Screening Report Generated',
      message: 'Patient Ramesh Patel report generated. Ready to send to Doctor for verification.',
      targetRole: 'hospital',
      timestamp: '10 mins ago',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Report Awaiting Review',
      message: 'Savitri Bai Shinde (Severe NPDR) awaiting specialist review.',
      targetRole: 'doctor',
      timestamp: '25 mins ago',
      read: false,
    },
  ]);

  // Voice playback state
  const [isSpeakingVoice, setIsSpeakingVoice] = useState(false);
  const [voiceLangActive, setVoiceLangActive] = useState<LanguageCode>('en');
  const [spokenTranscript, setSpokenTranscript] = useState('');

  // Persist patients
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PATIENTS_KEY, JSON.stringify(patients));
    } catch {
      // Ignore
    }
  }, [patients]);

  const activePatient = patients.find(p => p.id === activePatientId) || patients[0] || null;

  // Register New Patient (Section 7)
  const registerPatient = useCallback((input: NewPatientInput): Patient => {
    const newId = `PAT-MH-${new Date().getFullYear()}-${String(patients.length + 1).padStart(3, '0')}`;
    const newPatient: Patient = {
      id: newId,
      name: input.name.trim(),
      age: Number(input.age),
      gender: input.gender,
      mobile: input.mobile.trim(),
      village: input.village.trim(),
      talukaBlock: input.talukaBlock.trim(),
      district: input.district.trim(),
      state: input.state.trim(),
      pinCode: input.pinCode.trim(),
      bloodGroup: input.bloodGroup,
      diabetesStatus: input.diabetesStatus,
      diabetesDuration: input.diabetesDuration.trim(),
      emergencyContactName: input.emergencyContactName.trim(),
      emergencyContactNumber: input.emergencyContactNumber.trim(),
      languagePreference: input.languagePreference,
      createdAt: new Date().toISOString(),
      status: 'Awaiting Screening',
      lastScreeningDate: 'Never Screened',
    };

    setPatients(prev => [newPatient, ...prev]);
    setActivePatientId(newId);

    // Create notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Patient Registered',
        message: `${newPatient.name} (Age ${newPatient.age}, ${newPatient.village}) registered. Ready for image acquisition.`,
        targetRole: 'hospital',
        timestamp: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    return newPatient;
  }, [patients.length]);

  // Run Quality Assessment (Section 11)
  const runQualityCheck = useCallback(
    async (imageSrc: string, forceOutcome?: 'GOOD' | 'POOR'): Promise<ImageQualityAssessment> => {
      setIsCheckingQuality(true);
      await new Promise(r => setTimeout(r, 1100));

      const isGood = forceOutcome ? forceOutcome === 'GOOD' : true;

      const result: ImageQualityAssessment = isGood
        ? {
            overall: 'GOOD',
            score: 95,
            blurPassed: true,
            focusPassed: true,
            illuminationPassed: true,
            visibilityPassed: true,
            positioningPassed: true,
            artifactsPassed: true,
            reasons: [],
            checks: [
              { id: '1', name: 'Focus & Optical Sharpness', status: 'passed', metric: '0.95 / 1.00', detail: 'Sharp vessel bifurcation' },
              { id: '2', name: 'Illumination Uniformity', status: 'passed', metric: '94% Balanced', detail: 'No overexposure or deep shadows' },
              { id: '3', name: 'Retina Visibility', status: 'passed', metric: '98% Posterior Pole', detail: 'Macula and disc clearly observable' },
              { id: '4', name: 'Eye Centering & Fixation', status: 'passed', metric: '45° Centered', detail: 'Adequate field of view' },
              { id: '5', name: 'Artifact Detection', status: 'passed', metric: 'Clean Pass', detail: 'Zero dust or corneal reflection artifacts' },
            ],
          }
        : {
            overall: 'POOR',
            score: 42,
            blurPassed: false,
            focusPassed: false,
            illuminationPassed: false,
            visibilityPassed: false,
            positioningPassed: true,
            artifactsPassed: false,
            reasons: [
              'Image too blurry — motion artifact detected during capture',
              'Insufficient illumination — posterior retina not clearly illuminated',
              'Retina not clearly visible — pupil reflection obstructed fovea',
              'Image positioning issue — macula decentered beyond boundary',
              'Artifacts detected — lens flare and eyelash interference',
            ],
            checks: [
              { id: '1', name: 'Focus & Optical Sharpness', status: 'failed', metric: '0.42 / 1.00', detail: 'Excessive motion blur detected' },
              { id: '2', name: 'Illumination Uniformity', status: 'failed', metric: '48% Under-exposed', detail: 'Dark shadows over macula' },
              { id: '3', name: 'Retina Visibility', status: 'failed', metric: '51% Obscured', detail: 'Vessels not sharp enough for grading' },
              { id: '4', name: 'Eye Centering', status: 'passed', metric: 'Acceptable', detail: 'Eye centered but out of focus' },
              { id: '5', name: 'Artifact Detection', status: 'failed', metric: 'High Reflex', detail: 'Corneal flash reflex obscuring disc' },
            ],
          };

      setQualityCheck(result);
      setIsCheckingQuality(false);
      return result;
    },
    []
  );

  const resetQualityCheck = useCallback(() => {
    setQualityCheck(null);
  }, []);

  // Run 11-Module AI Pipeline (Sections 14 & 15)
  const run11ModulePipeline = useCallback(
    async (patientId: string, imageSrc: string): Promise<ScreeningRecord> => {
      setIsPipelineRunning(true);
      setPipelineProgress(0);
      setPipelineStage(1);

      const targetPatient = patients.find(p => p.id === patientId) || patients[0];

      // Progress through 11 stages with simulated timings
      for (let s = 1; s <= 11; s++) {
        setPipelineStage(s);
        setPipelineProgress(Math.round((s / 11) * 100));
        await new Promise(r => setTimeout(r, 420));
      }

      // Generate AI Result (Section 16)
      const isMild = targetPatient.age < 50;
      const drCat = isMild ? 'Mild DR' : 'Moderate DR';
      const gradeIdx = isMild ? 1 : 2;

      const newScreening: ScreeningRecord = {
        id: `SCR-${Date.now()}`,
        patientId: targetPatient.id,
        patientName: targetPatient.name,
        patientAge: targetPatient.age,
        patientVillage: targetPatient.village,
        date: 'Today (Just screened)',
        retinalImage: imageSrc || createDefaultFundusDataUrl('npdr'),
        imageQuality: {
          overall: 'GOOD',
          score: 95,
          blurPassed: true,
          focusPassed: true,
          illuminationPassed: true,
          visibilityPassed: true,
          positioningPassed: true,
          artifactsPassed: true,
          reasons: [],
          checks: [
            { id: '1', name: 'Focus', status: 'passed', metric: '0.94', detail: 'Sharp' },
            { id: '2', name: 'Illumination', status: 'passed', metric: '94%', detail: 'Optimal' },
            { id: '3', name: 'Visibility', status: 'passed', metric: '98%', detail: 'Clear' },
            { id: '4', name: 'Centering', status: 'passed', metric: '45°', detail: 'Centered' },
            { id: '5', name: 'Artifacts', status: 'passed', metric: 'None', detail: 'Clear' },
          ],
        },
        aiResult: {
          drCategory: drCat,
          gradeIndex: gradeIdx,
          confidence: 96.8,
          riskLevel: isMild ? 'Moderate' : 'High',
          detectedLesions: {
            microaneurysms: isMild ? 4 : 7,
            hemorrhages: isMild ? 1 : 3,
            hardExudates: isMild ? 2 : 12,
            cottonWoolSpots: isMild ? 0 : 2,
          },
          retinalVisualization: imageSrc || createDefaultFundusDataUrl('npdr'),
          xaiHeatmapUrl: imageSrc || createDefaultFundusDataUrl('npdr'),
          evidenceStrength: 'High (ETDRS Concordant)',
          errorRisk: 0.038,
          trustDecision: 'Clinical Triage Priority',
          isDemoSimulated: true, // Clearly marked DEMO/SIMULATED RESULT
        },
        reportStatus: 'Awaiting Doctor Verification',
        carePlan: {
          recommendedNextStep: 'Scheduled for tele-ophthalmologist review.',
          referralInformation: 'Ayushman Bharat Tele-Ophthalmology Network',
          followUpDate: 'Follow-up within 30 days',
          importantReminders: [
            'Maintain blood glucose levels within target range.',
            'Report any sudden vision drop or new dark floaters immediately.',
            'Awaiting doctor verification for final prescription and care slip.',
          ],
        },
      };

      // Update patient state
      setPatients(prev =>
        prev.map(p => {
          if (p.id === targetPatient.id) {
            return {
              ...p,
              status: 'Report Awaiting Doctor',
              lastScreeningDate: 'Today',
              latestScreening: newScreening,
            };
          }
          return p;
        })
      );

      setCurrentScreening(newScreening);
      setIsPipelineRunning(false);

      // Notification to hospital
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          title: 'AI Screening Complete',
          message: `Screening for ${targetPatient.name} completed. AI classified as ${newScreening.aiResult.drCategory}. Ready to send to Doctor.`,
          targetRole: 'hospital',
          timestamp: 'Just now',
          read: false,
        },
        ...prev,
      ]);

      return newScreening;
    },
    [patients]
  );

  // Send Report to Doctor (Section 18)
  const sendToDoctor = useCallback(
    (screeningId: string) => {
      setPatients(prev =>
        prev.map(p => {
          if (p.latestScreening && (p.latestScreening.id === screeningId || !screeningId)) {
            const updatedScreening: ScreeningRecord = {
              ...p.latestScreening,
              reportStatus: 'Awaiting Doctor Review',
            };
            return {
              ...p,
              status: 'Report Awaiting Doctor',
              latestScreening: updatedScreening,
            };
          }
          return p;
        })
      );

      if (currentScreening) {
        setCurrentScreening(prev => (prev ? { ...prev, reportStatus: 'Awaiting Doctor Review' } : null));
      }

      // Add doctor notification
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          title: 'New Screening Report Awaiting Review',
          message: `Health Center submitted a new retinal screening for verification. Patient: ${activePatient?.name || 'Ramesh Patel'}.`,
          targetRole: 'doctor',
          timestamp: 'Just now',
          read: false,
        },
        ...prev,
      ]);
    },
    [activePatient, currentScreening]
  );

  // Doctor Verifies Report (Section 22 & 23)
  const verifyByDoctor = useCallback(
    (screeningId: string, input: DoctorVerificationInput) => {
      const isVerified = input.action === 'verify';
      let patientName = activePatient?.name || 'Ramesh Patel';

      setPatients(prev =>
        prev.map(p => {
          if (p.latestScreening && (p.latestScreening.id === screeningId || !screeningId)) {
            patientName = p.name;
            const docReview: DoctorReviewRecord = {
              verifiedBy: 'Dr. Arvind Natarajan',
              qualification: 'MBBS, MS (Ophthalmology), DNB, FVR',
              hospital: 'District Hospital Pune & e-Sanjeevani Tele-Consultant',
              assessment: input.assessment,
              doctorComments:
                input.doctorComments ||
                (isVerified
                  ? 'Verified as Grade 2 Moderate NPDR. Regular glycemic check and 30-day tele-followup advised.'
                  : 'Image artifact and macula border require clinical reassessment. Please conduct repeat fundus examination.'),
              aiAccuracyFeedback: input.aiAccuracyFeedback,
              verifiedAt: new Date().toISOString(),
              signatureStamp: 'REG-MCI-2012-08492-NATARAJAN',
            };

            const updatedScreening: ScreeningRecord = {
              ...p.latestScreening,
              reportStatus: isVerified ? 'Doctor Verified' : 'Requires Reassessment',
              doctorReview: docReview,
              carePlan: {
                recommendedNextStep: isVerified
                  ? (input.assessment === 'Agree with AI'
                      ? 'In-person comprehensive evaluation at District Hospital Ophthalmology OPD within 30 days.'
                      : 'Repeat retinal imaging with pharmacological pupil dilation within 7 days.')
                  : 'Specialist requested repeat fundus screening with pupil dilation.',
                referralInformation: 'District Eye Hospital Pune (Ayushman Bharat Tele-Retina OPD Slot #DR-9941)',
                followUpDate: isVerified ? 'In 30 Days (20 October 2026)' : 'Immediate Reassessment',
                importantReminders: [
                  'Carry this verified digital or printed report to the consultation.',
                  'Maintain blood sugar and HbA1c strictly below 7.0%.',
                  'Wear protective sunglasses and avoid looking directly at harsh sunlight.',
                  'Contact the local Health Center immediately if new dark spots appear.',
                ],
              },
            };

            return {
              ...p,
              status: isVerified ? 'Doctor Verified' : 'Requires Reassessment',
              latestScreening: updatedScreening,
            };
          }
          return p;
        })
      );

      // Notify Patient and Hospital
      if (isVerified) {
        setNotifications(prev => [
          {
            id: `notif-${Date.now()}-pat`,
            title: 'Your Retinal Screening Report is Verified',
            message: 'Dr. Arvind Natarajan has verified your eye screening report. You can now view your report, visual explanation, and care plan.',
            targetRole: 'patient',
            timestamp: 'Just now',
            read: false,
          },
          {
            id: `notif-${Date.now()}-hsp`,
            title: 'Report Verified by Doctor',
            message: `Doctor has completed review for ${patientName}. Status: Doctor Verified.`,
            targetRole: 'hospital',
            timestamp: 'Just now',
            read: false,
          },
          ...prev,
        ]);
      } else {
        setNotifications(prev => [
          {
            id: `notif-${Date.now()}-reassess-hsp`,
            title: '⚠️ Case Reassessment Requested by Doctor',
            message: `Dr. Arvind Natarajan has reviewed the scan for ${patientName} and requested an immediate reassessment. Reason: ${input.doctorComments || 'Specialist requested repeat fundus examination.'}`,
            targetRole: 'hospital',
            timestamp: 'Just now',
            read: false,
          },
          {
            id: `notif-${Date.now()}-reassess-pat`,
            title: '⚠️ Case Under Clinical Reassessment',
            message: 'Your case has gone for reassessment, so please wait for a few minutes while our doctors review your case.',
            targetRole: 'patient',
            timestamp: 'Just now',
            read: false,
          },
          ...prev,
        ]);
      }
    },
    [activePatient]
  );

  // Doctor Queue
  const doctorQueue = patients
    .filter(p => p.latestScreening !== undefined)
    .map(p => p.latestScreening!)
    .filter(
      s =>
        s.reportStatus === 'Awaiting Doctor Review' ||
        s.reportStatus === 'Doctor Verified' ||
        s.reportStatus === 'Awaiting Doctor Verification' ||
        s.reportStatus === 'Requires Reassessment'
    );

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Robust Speech Synthesis Engine Refs
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const keepAliveTimerRef = useRef<any>(null);

  // Helper: map Gujarati Unicode (0x0A81-0x0AF1) to Devanagari (0x0901-0x0971) for perfect pronunciation on Indic voices
  const gujaratiToDevanagari = (text: string): string => {
    return text
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        if (code >= 0x0A81 && code <= 0x0AF1) {
          return String.fromCharCode(code - 0x0180);
        }
        return char;
      })
      .join('');
  };

  // Pre-load available system voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    return () => {
      if (keepAliveTimerRef.current) clearInterval(keepAliveTimerRef.current);
    };
  }, []);

  const stopVoiceExplanation = useCallback(() => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    activeUtteranceRef.current = null;
    setIsSpeakingVoice(false);
  }, []);

  const playVoiceExplanation = useCallback(
    (report: ScreeningRecord, lang: LanguageCode = 'en') => {
      stopVoiceExplanation();
      setVoiceLangActive(lang);

      const patientName = report.patientName || 'Patient';
      let script = '';

      if (lang === 'gu') {
        const guCategory =
          report.aiResult.gradeIndex === 0
            ? 'સામાન્ય આંખ, કોઈ ડાયાબિટીક રેટિનોપેથી નથી'
            : report.aiResult.gradeIndex === 1
            ? 'હળવી નોન-પ્રોલિફરેટિવ ડાયાબિટીક રેટિનોપેથી'
            : report.aiResult.gradeIndex === 2
            ? 'મધ્યમ ડાયાબિટીક રેટિનોપેથી'
            : report.aiResult.gradeIndex === 3
            ? 'ગંભીર નોન-પ્રોલિફરેટિવ ડાયાબિટીક રેટિનોપેથી'
            : 'પ્રોલિફરેટિવ ડાયાબિટીક રેટિનોપેથી';

        script = `નમસ્તે ${patientName}. તમારા આંખના સ્ક્રિનિંગ રિપોર્ટની ડૉક્ટર અરવિંદ નટરાજન દ્વારા ચકાસણી કરવામાં આવી છે. તમારું પરિણામ છે: ${guCategory}. ડૉક્ટરની સલાહ છે: આંખમાં ડાયાબિટીસની અસર છે, તેથી નિયમિત બ્લડ શુગર નિયંત્રણમાં રાખો અને ત્રીસ દિવસમાં આંખના નિષ્ણાત પાસે તપાસ કરાવો. ધન્યવાદ.`;
      } else if (lang === 'hi') {
        const hiCategory =
          report.aiResult.gradeIndex === 0
            ? 'सामान्य आंख, कोई डायबिटिक रेटिनोपैथी नहीं'
            : report.aiResult.gradeIndex === 1
            ? 'हल्की नॉन-प्रोलिफेरेटिव डायबिटिक रेटिनोपैथी'
            : report.aiResult.gradeIndex === 2
            ? 'मध्यम डायबिटिक रेटिनोपैथी'
            : report.aiResult.gradeIndex === 3
            ? 'गंभीर नॉन-प्रोलिफेरेटिव डायबिटिक रेटिनोपैथी'
            : 'प्रोलिफेरेटिव डायबिटिक रेटिनोपैथी';

        script = `नमस्ते ${patientName}. आपकी आंखों की स्क्रीनिंग रिपोर्ट की डॉक्टर अरविंद नटराजन द्वारा पुष्टि कर दी गई है। आपका परिणाम है: ${hiCategory}। डॉक्टर की सलाह है: अपनी ब्लड शुगर को नियंत्रित रखें और 30 दिनों के भीतर नेत्र रोग विशेषज्ञ से जांच कराएं। धन्यवाद।`;
      } else {
        const resultStr = report.aiResult.drCategory;
        const doctorNotes = report.doctorReview?.doctorComments || report.carePlan.recommendedNextStep;
        const nextStep = report.carePlan.recommendedNextStep;
        script = `Hello ${patientName}. Your retinal screening report has been officially reviewed and verified by Dr. Arvind Natarajan. Your verified result is ${resultStr}. The doctor notes: ${doctorNotes}. Your recommended next step is: ${nextStep}. Thank you.`;
      }

      setSpokenTranscript(script);

      // Play soft harmonic notification chime using Web Audio API
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch {
        // Ignore audio context block
      }

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        // Cancel any pending speech first
        window.speechSynthesis.cancel();

        const voices = window.speechSynthesis.getVoices();
        let textToSpeak = script;
        let selectedVoice: SpeechSynthesisVoice | undefined;
        let targetLang = 'en-IN';

        if (lang === 'gu') {
          // Look for direct Gujarati voice
          const guVoice = voices.find(
            v => v.lang.startsWith('gu') || v.name.toLowerCase().includes('gujarat')
          );
          if (guVoice) {
            selectedVoice = guVoice;
            targetLang = guVoice.lang || 'gu-IN';
            textToSpeak = script;
          } else {
            // Find Indic voice (Hindi or Indian English) and transliterate Gujarati script
            const indicVoice = voices.find(
              v =>
                v.lang.startsWith('hi') ||
                v.name.toLowerCase().includes('hindi') ||
                v.name.toLowerCase().includes('india')
            );
            if (indicVoice) {
              selectedVoice = indicVoice;
              targetLang = indicVoice.lang || 'hi-IN';
            } else {
              targetLang = 'hi-IN';
            }
            // Transliterate to Devanagari phonemes so standard Hindi TTS speaks Gujarati words properly!
            textToSpeak = gujaratiToDevanagari(script);
          }
        } else if (lang === 'hi') {
          const hiVoice = voices.find(
            v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')
          );
          if (hiVoice) selectedVoice = hiVoice;
          targetLang = 'hi-IN';
        } else {
          const enVoice = voices.find(
            v => v.lang.startsWith('en-IN') || v.name.toLowerCase().includes('india')
          );
          if (enVoice) selectedVoice = enVoice;
          targetLang = 'en-IN';
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = targetLang;
        utterance.rate = lang === 'gu' ? 0.88 : 0.92;
        utterance.pitch = 1.0;
        if (selectedVoice) utterance.voice = selectedVoice;

        // Prevent Chromium GC bug by saving utterance in refs
        activeUtteranceRef.current = utterance;
        (window as any).__activeSpeechUtterance = utterance;

        utterance.onstart = () => {
          setIsSpeakingVoice(true);
        };

        utterance.onend = () => {
          setIsSpeakingVoice(false);
          if (keepAliveTimerRef.current) {
            clearInterval(keepAliveTimerRef.current);
            keepAliveTimerRef.current = null;
          }
          activeUtteranceRef.current = null;
        };

        utterance.onerror = () => {
          setIsSpeakingVoice(false);
          if (keepAliveTimerRef.current) {
            clearInterval(keepAliveTimerRef.current);
            keepAliveTimerRef.current = null;
          }
          activeUtteranceRef.current = null;
        };

        // Chromium keep-alive interval to prevent 15-second speech pause
        keepAliveTimerRef.current = setInterval(() => {
          if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 10000);

        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeakingVoice(true);
        setTimeout(() => setIsSpeakingVoice(false), 8000);
      }
    },
    [stopVoiceExplanation]
  );

  return (
    <PatientWorkflowContext.Provider
      value={{
        patients,
        activePatient,
        setActivePatientId,
        registerPatient,
        qualityCheck,
        isCheckingQuality,
        runQualityCheck,
        resetQualityCheck,
        isPipelineRunning,
        pipelineProgress,
        pipelineStage,
        pipelineStageName: PIPELINE_STAGE_NAMES[pipelineStage - 1] || 'Pipeline Ready',
        currentScreening,
        run11ModulePipeline,
        sendToDoctor,
        verifyByDoctor,
        doctorQueue,
        notifications,
        dismissNotification,
        playVoiceExplanation,
        stopVoiceExplanation,
        isSpeakingVoice,
        voiceLangActive,
        spokenTranscript,
      }}
    >
      {children}
    </PatientWorkflowContext.Provider>
  );
};

export const usePatientWorkflow = (): PatientWorkflowContextType => {
  const context = useContext(PatientWorkflowContext);
  if (!context) {
    throw new Error('usePatientWorkflow must be used within a PatientWorkflowProvider');
  }
  return context;
};
