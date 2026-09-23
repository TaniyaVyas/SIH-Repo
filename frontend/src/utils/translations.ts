import { LanguageCode } from '../types/auth';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  subTagline: string;
  common: {
    welcome: string;
    online: string;
    offline: string;
    save: string;
    cancel: string;
    close: string;
    back: string;
    next: string;
    submit: string;
    loading: string;
    search: string;
    print: string;
    download: string;
    status: string;
    viewDetails: string;
    verified: string;
    pending: string;
    view: string;
    language: string;
    activeScan: string;
    ready: string;
    processing: string;
    runPipeline: string;
    screeningCockpit: string;
    clinicalSignIn: string;
    createAccount: string;
    signOut: string;
    patientId: string;
    age: string;
    gender: string;
    doctor: string;
    hospital: string;
  };
  roles: {
    patient: string;
    healthcareWorker: string;
    'healthcare-worker': string;
    doctor: string;
    hospital: string;
  };
  nav: {
    navigation: string;
    overview: string;
    screeningPipeline: string;
    trustExplainability: string;
    careReferral: string;
    clinicalAudit: string;
    connectivityImpact: string;
    home: string;
    dashboard: string;
    imageAcquisition: string;
    preprocessing: string;
    retinalAnatomy: string;
    lesionDetection: string;
    retinalGraph: string;
    drClassification: string;
    explainability: string;
    evidenceVerification: string;
    selfAwareAI: string;
    trustReject: string;
    referralCare: string;
    diagnosticReports: string;
    integrations: string;
    continuousLearning: string;
    impactCalculator: string;
    myProfile: string;
    fieldCampTriage: string;
    specialistQueue: string;
    hospitalOps: string;
    myEyeRecord: string;
  };
  hero: {
    badge: string;
    badgeSub: string;
    heading1: string;
    headingAccent: string;
    subheading: string;
    launchScreening: string;
    exploreJourney: string;
    offlineBadge: string;
    ruralBadge: string;
    etdrsBadge: string;
    metric1: string;
    metric1Label: string;
    metric1Sub: string;
    metric2: string;
    metric2Label: string;
    metric2Sub: string;
    metric3: string;
    metric3Label: string;
    metric3Sub: string;
    metric4: string;
    metric4Label: string;
    metric4Sub: string;
    pillarsHeader: string;
    pillarsBadge: string;
    pillar1Title: string;
    pillar1Name: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Name: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Name: string;
    pillar3Desc: string;
    pillar4Title: string;
    pillar4Name: string;
    pillar4Desc: string;
    pillar5Title: string;
    pillar5Name: string;
    pillar5Desc: string;
  };
  journey: {
    trackBadge: string;
    title: string;
    desc: string;
    exploreBtn: string;
    workstationBtn: string;
    stage1Title: string;
    stage1Sub: string;
    stage1Desc: string;
    stage2Title: string;
    stage2Sub: string;
    stage2Desc: string;
    stage3Title: string;
    stage3Sub: string;
    stage3Desc: string;
    stage4Title: string;
    stage4Sub: string;
    stage4Desc: string;
    stage5Title: string;
    stage5Sub: string;
    stage5Desc: string;
    stage6Title: string;
    stage6Sub: string;
    stage6Desc: string;
    stage7Title: string;
    stage7Sub: string;
    stage7Desc: string;
    stage8Title: string;
    stage8Sub: string;
    stage8Desc: string;
  };
  chatbot: {
    name: string;
    badge: string;
    subtitle: string;
    welcome: string;
    placeholder: string;
    suggestedTitle: string;
  };
  footer: {
    tagline: string;
    subTagline: string;
    missionBadge: string;
    modulesTitle: string;
    protocolsTitle: string;
    edgeTitle: string;
    copyright: string;
    clinicalNotice: string;
    disclaimer: string;
  };
  auth: {
    welcomeBack: string;
    loginTitle: string;
    signInTitle: string;
    identifierLabel: string;
    emailOrMobile: string;
    identifierPlaceholder: string;
    passwordLabel: string;
    password: string;
    rememberMe: string;
    loginButton: string;
    signIn: string;
    authenticating: string;
    verifying: string;
    loadingWorkspace: string;
    forgotPassword: string;
    noAccount: string;
    createAccount: string;
    alreadyAccount: string;
    logout: string;
    onlineStatus: string;
    offlineStatus: string;
    secureAuth: string;
  };
  dashboard: {
    myProfile: string;
    startScreening: string;
    screeningHistory: string;
    patientQueue: string;
    reports: string;
    referrals: string;
    commandCenter: string;
    pendingReviews: string;
    highRiskCases: string;
    quickStats: string;
  };
  stages: {
    optics: string;
    quality: string;
    anatomy: string;
    lesions: string;
    graph: string;
    classification: string;
    xai: string;
    evidence: string;
    uncertainty: string;
    trust: string;
    care: string;
  };
  modules: {
    pipelineTrackTitle: string;
    stageOfTotal: string;
    ofTotal: string;
    previousModule: string;
    continueTo: string;
    backToDashboard: string;
    completeScreening: string;
    activeScanLabel: string;
    crossModuleSync: string;
    reanalyzeAll: string;
    processingStage: string;
    m1Title: string;
    m1Badge: string;
    m1Desc: string;
    m1Action: string;
    m1UploadTab: string;
    m1CaptureTab: string;
    m1DemoTab: string;
    m2Title: string;
    m2Badge: string;
    m2Desc: string;
    m2Action: string;
    m3Title: string;
    m3Badge: string;
    m3Desc: string;
    m3Action: string;
    m4Title: string;
    m4Badge: string;
    m4Desc: string;
    m4Action: string;
    m5Title: string;
    m5Badge: string;
    m5Desc: string;
    m5Action: string;
    m6Title: string;
    m6Badge: string;
    m6Desc: string;
    m6Action: string;
    m7Title: string;
    m7Badge: string;
    m7Desc: string;
    m7Action: string;
    m8Title: string;
    m8Badge: string;
    m8Desc: string;
    m8Action: string;
    m9Title: string;
    m9Badge: string;
    m9Desc: string;
    m9Action: string;
    m10Title: string;
    m10Badge: string;
    m10Desc: string;
    m10Action: string;
    m11Title: string;
    m11Badge: string;
    m11Desc: string;
    m11Action: string;
    reportsTitle: string;
    reportsBadge: string;
    reportsDesc: string;
    reportsPrintBtn: string;
    reportsPdfBtn: string;
    reportsFhirBtn: string;
    tabClinical: string;
    tabReferral: string;
    tabEtdrs: string;
    tabMorphometry: string;
    tabFhir: string;
    names: {
      m1: string;
      m2: string;
      m3: string;
      m4: string;
      m5: string;
      m6: string;
      m7: string;
      m8: string;
      m9: string;
      m10: string;
      m11: string;
    };
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: 'RETINA-FUSION 360',
    tagline: 'AI-assisted diabetic retinopathy screening for accessible eye care.',
    subTagline: 'Screen. Explain. Verify. Refer.',
    common: {
      welcome: 'Welcome',
      online: 'Online',
      offline: 'Offline Mode',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      loading: 'Loading...',
      search: 'Search...',
      print: 'Print Document',
      download: 'Download PDF',
      status: 'Status',
      viewDetails: 'View Details',
      verified: 'Verified',
      pending: 'Pending',
      view: 'View',
      language: 'Language',
      activeScan: 'Active Scan',
      ready: 'READY',
      processing: 'Processing',
      runPipeline: 'Run Pipeline',
      screeningCockpit: 'Screening Cockpit',
      clinicalSignIn: 'Clinical Sign In',
      createAccount: 'Create Account',
      signOut: 'Sign Out',
      patientId: 'Patient ID',
      age: 'Age',
      gender: 'Gender',
      doctor: 'Doctor',
      hospital: 'Hospital',
    },
    roles: {
      patient: 'Patient',
      healthcareWorker: 'Healthcare Worker (ASHA/PHC)',
      'healthcare-worker': 'Healthcare Worker (ASHA/PHC)',
      doctor: 'Doctor / Ophthalmologist',
      hospital: 'Hospital / Organization',
    },
    nav: {
      navigation: 'NAVIGATION',
      overview: 'OVERVIEW',
      screeningPipeline: 'SCREENING PIPELINE',
      trustExplainability: 'TRUST & EXPLAINABILITY',
      careReferral: 'CARE & REFERRAL',
      clinicalAudit: 'CLINICAL AUDIT & REPORTS',
      connectivityImpact: 'CONNECTIVITY & IMPACT',
      home: 'Home',
      dashboard: 'Dashboard',
      imageAcquisition: 'Image Acquisition',
      preprocessing: 'Preprocessing',
      retinalAnatomy: 'Retinal Anatomy',
      lesionDetection: 'Lesion Detection',
      retinalGraph: 'Retinal Graph',
      drClassification: 'DR Classification',
      explainability: 'Explainability',
      evidenceVerification: 'Evidence Verification',
      selfAwareAI: 'Self-Aware AI',
      trustReject: 'Trust / Reject',
      referralCare: 'Referral & Care',
      diagnosticReports: 'Diagnostic Reports',
      integrations: 'Integrations',
      continuousLearning: 'Continuous Learning',
      impactCalculator: 'Impact Calculator',
      myProfile: 'My Profile & Credentials',
      fieldCampTriage: 'Field Camp Triage',
      specialistQueue: 'Specialist Queue',
      hospitalOps: 'Hospital Ops',
      myEyeRecord: 'My Eye Record',
    },
    hero: {
      badge: 'CLINICAL AI ENGINE',
      badgeSub: 'Multimodal Decision Support',
      heading1: 'AI THAT SEES',
      headingAccent: 'BEYOND THE RETINA.',
      subheading: 'Structure-Aware • Graph-Powered • Evidence-Verified • Trustworthy AI. Eliminating preventable diabetic blindness across rural India with transparent, deterministic clinical validation.',
      launchScreening: 'Launch Screening',
      exploreJourney: 'Explore the AI Journey',
      offlineBadge: 'Works 100% Offline',
      ruralBadge: 'Rural Non-Mydriatic',
      etdrsBadge: 'ETDRS Verified',
      metric1: '99.4%',
      metric1Label: 'Quadratic Weighted Kappa',
      metric1Sub: 'Target Validation Metric',
      metric2: '< 1.8s',
      metric2Label: 'Edge Inference Latency',
      metric2Sub: 'Jetson Nano INT8 TensorRT',
      metric3: '0%',
      metric3Label: 'Sight-Threat False Negatives',
      metric3Sub: 'Prioritizing Patient Safety',
      metric4: 'ABDM',
      metric4Label: 'Digital Health Ready',
      metric4Sub: 'e-Sanjeevani Tele-Consult',
      pillarsHeader: 'THE 5 FOUNDATIONAL PILLARS OF RETINA-FUSION 360',
      pillarsBadge: 'CLINICAL INNOVATION SUITE',
      pillar1Title: '1. STRUCTURE',
      pillar1Name: 'Retinal Graph',
      pillar1Desc: 'Transforms vessels & optic landmarks into a geometric topological manifold.',
      pillar2Title: '2. EVIDENCE',
      pillar2Name: 'ETDRS Verification',
      pillar2Desc: 'Deterministic 4-2-1 clinical rules audit and ground every model prediction.',
      pillar3Title: '3. EXPLAINABILITY',
      pillar3Name: 'Multimodal XAI',
      pillar3Desc: 'Synchronized spatial Grad-CAM activations with graph attention edge weights.',
      pillar4Title: '4. TRUST',
      pillar4Name: 'Self-Aware Gate',
      pillar4Desc: 'Detects distribution shifts and intercepts uncertain cases for human triage.',
      pillar5Title: '5. RURAL ACCESS',
      pillar5Name: 'Offline Edge AI',
      pillar5Desc: 'Operates without cellular reception on Jetson Orin with non-mydriatic cameras.',
    },
    journey: {
      trackBadge: 'AI JOURNEY CLINICAL TRACK',
      title: 'Interactive 8-Stage Retinal Diagnostic Journey',
      desc: 'Follow every stage from optical photon capture to topological GNN mapping, deterministic clinical rule validation, and ABDM referral.',
      exploreBtn: 'Explore',
      workstationBtn: 'Open Workstation',
      stage1Title: 'Optical Photon Acquisition in Low-Resource Field Conditions',
      stage1Sub: 'Point-of-care mobile non-mydriatic acquisition with real-time lux gating.',
      stage1Desc: 'Rural health sub-centres lack expensive table-top mydriatic fundus cameras. Interfaces with portable smartphone attachments.',
      stage2Title: 'Vascular Segmentation & Landmark Localization',
      stage2Sub: 'Optic Disc, FAZ, and dual arteriolar-venular vascular tree extraction.',
      stage2Desc: 'Before seeking pathology, the AI maps healthy anatomical structures with U-Net Attention Gates.',
      stage3Title: 'Multi-Class Microvascular Lesion Quantification',
      stage3Sub: 'Pixel-level segmentation of microaneurysms, hemorrhages, and exudates.',
      stage3Desc: 'Detects, segments, and measures microaneurysms, hemorrhages, hard exudates, and cotton-wool spots across all 4 quadrants.',
      stage4Title: 'The Retina Transformed into a Biological Graph',
      stage4Sub: 'Topological GNN modeling spatial hemodynamics and lesion distances.',
      stage4Desc: 'Images are pixel grids; biological retinas are topological graphs. Models landmarks and lesion clusters as graph nodes.',
      stage5Title: 'Structure-Aware Multi-Scale 5-Tier Staging',
      stage5Sub: 'International Clinical Diabetic Retinopathy (ICDR) scale classification.',
      stage5Desc: 'Fuses ConvNeXt vision backbones with Graph Attention Networks with zero false-negative prioritization.',
      stage6Title: 'Deterministic ETDRS Guideline Verification',
      stage6Sub: 'Clinical 4-2-1 rule verification grounding the AI recommendation.',
      stage6Desc: 'The AI is legally and clinically forbidden from assigning severe grades without explicit verifiable evidence.',
      stage7Title: 'Self-Aware Uncertainty & Tri-State Safety Gate',
      stage7Sub: 'Autonomous epistemic risk gating and human-in-the-loop referral.',
      stage7Desc: 'If the model encounters rare pathologies or high uncertainty, it halts and escalates to human doctor review.',
      stage8Title: 'Ayushman Bharat Referral & Triage Ticket',
      stage8Sub: 'Instant ABDM FHIR R4 care-slip generation with QR validation.',
      stage8Desc: 'Generates instant ABDM-compliant referral slips with ABHA ID integration and e-Sanjeevani tele-ophthalmology bookings.',
    },
    chatbot: {
      name: 'RetinaBot AI',
      badge: 'CLINICAL INTELLIGENCE',
      subtitle: '24/7 AI Clinical Assistant & Architecture Guide',
      welcome: `Hello! I am **RetinaBot AI**, the official clinical and technical intelligence assistant for **RetinaFusion 360**.

I can answer any question about our autonomous Diabetic Retinopathy screening architecture, 11 AI pipeline stages, role-specific clinical workflows, ABDM tele-ophthalmology protocols, and single-page report generation.

How can I assist you today?`,
      placeholder: 'Ask RetinaBot anything about the screening architecture, stages, reports...',
      suggestedTitle: 'Recommended Inquiries',
    },
    footer: {
      tagline: '"From Pixels to Better Lives — AI with Structure, Evidence and Trust."',
      subTagline: 'An AI-assisted, structure-aware, graph-powered and evidence-verified diabetic retinopathy screening platform.',
      missionBadge: 'Ayushman Bharat Digital Mission • CDSS Tier-3',
      modulesTitle: '11 Core Modules',
      protocolsTitle: 'Clinical Protocols',
      edgeTitle: 'Edge Engineering',
      copyright: 'RETINA-FUSION 360 © 2024. Clinical AI Decision Support System.',
      clinicalNotice: 'Clinical Notice:',
      disclaimer: 'RETINA-FUSION 360 is an AI-assisted screening decision support system. It does not replace definitive clinical examination by a certified ophthalmologist. All suspected sight-threatening cases are triaged to human clinical care via ABDM.',
    },
    auth: {
      welcomeBack: 'Welcome Back',
      loginTitle: 'Clinical Authentication Gateway',
      signInTitle: 'Clinical Sign In',
      identifierLabel: 'Email or Mobile Number',
      emailOrMobile: 'Email or Mobile Number',
      identifierPlaceholder: 'doctor@retinafusion.ai or +91 98765 43210',
      passwordLabel: 'Password',
      password: 'Password',
      rememberMe: 'Remember this secure device',
      loginButton: 'Sign In to Workspace',
      signIn: 'Sign In to Workspace',
      authenticating: 'Authenticating credentials...',
      verifying: 'Verifying clinical access...',
      loadingWorkspace: 'Loading your workspace...',
      forgotPassword: 'Forgot Password?',
      noAccount: "Don't have an authorized account?",
      createAccount: 'Create New Account',
      alreadyAccount: 'Already have an account?',
      logout: 'Sign Out',
      onlineStatus: 'Online — Data synchronized',
      offlineStatus: 'Offline Mode — Local workflow prototype',
      secureAuth: '256-bit Secure Clinical Gateway',
    },
    dashboard: {
      myProfile: 'My Health Profile',
      startScreening: 'Start Screening',
      screeningHistory: 'Screening History',
      patientQueue: 'Clinical Review Queue',
      reports: 'Diagnostic Reports',
      referrals: 'ABDM Referrals',
      commandCenter: 'Hospital Command Center',
      pendingReviews: 'Pending Reviews',
      highRiskCases: 'High-Risk Cases',
      quickStats: 'Live Telemetry',
    },
    stages: {
      optics: 'Optical Acquisition',
      quality: 'Quality Gate',
      anatomy: 'Retinal Anatomy',
      lesions: 'Lesion Detection',
      graph: 'Topological GNN',
      classification: 'ICDR Classification',
      xai: 'Explainability (XAI)',
      evidence: 'ETDRS Evidence',
      uncertainty: 'Epistemic Uncertainty',
      trust: 'Trust Safety Gate',
      care: 'ABDM Care Slip',
    },
    modules: {
      pipelineTrackTitle: 'RETINA-FUSION 360 • 11-STAGE CLINICAL PIPELINE TRACK',
      stageOfTotal: 'STAGE',
      ofTotal: 'OF 11',
      previousModule: 'Previous',
      continueTo: 'Continue to',
      backToDashboard: 'Back to Dashboard Cockpit',
      completeScreening: 'Complete Screening • Return to Dashboard',
      activeScanLabel: 'Active Scan',
      crossModuleSync: 'Cross-Module Sync Active',
      reanalyzeAll: 'Re-analyze All Modules',
      processingStage: 'Processing Stage',
      m1Title: 'Image Acquisition & Optical Validation',
      m1Badge: 'MODULE 01: OPTICAL CAPTURE',
      m1Desc: 'Capture live optical scans via smartphone fundus adapter, upload medical files, or choose certified presets.',
      m1Action: 'Proceed to Preprocessing',
      m1UploadTab: 'Upload Image',
      m1CaptureTab: 'Capture Image (Webcam/Adapter)',
      m1DemoTab: 'Demo Presets',
      m2Title: 'Image Quality Assessment & Adaptive Enhancement',
      m2Badge: 'MODULE 02: PREPROCESSING & QUALITY',
      m2Desc: 'Automated ISO 10940 clarity validation, CLAHE dynamic contrast equalization, and illumination artifact removal.',
      m2Action: 'Proceed to Retinal Anatomy',
      m3Title: 'Retinal Anatomy & Vessel Segmentation',
      m3Badge: 'MODULE 03: ANATOMICAL STRUCTURES',
      m3Desc: 'Sub-pixel segmentation of Optic Disc, Cup-to-Disc ratio (CDR), Macula, and microvascular arteriovenous mapping.',
      m3Action: 'Proceed to Lesion Detection',
      m4Title: 'Microvascular Lesion Detection & Localization',
      m4Badge: 'MODULE 04: LESIONS & BIOMARKERS',
      m4Desc: 'Deterministic quantification of microaneurysms, blot hemorrhages, hard exudates, and cotton wool spots across 4 quadrants.',
      m4Action: 'Proceed to Retinal Graph',
      m5Title: 'Retinal Graph Construction & Topology',
      m5Badge: 'MODULE 05: TOPOLOGICAL GRAPH GNN',
      m5Desc: 'Graph Neural Network mapping vascular bifurcations, vessel tortuosity, geometric angles, and network anomalies.',
      m5Action: 'Proceed to DR Classification',
      m6Title: 'DR Classification & Multi-Consensus Staging',
      m6Badge: 'MODULE 06: ICDR SEVERITY STAGING',
      m6Desc: '5-tier International Clinical Diabetic Retinopathy severity grading with dual algorithmic consensus and confidence calibration.',
      m6Action: 'Proceed to Explainability',
      m7Title: 'Explainability & Visual Evidence (XAI)',
      m7Badge: 'MODULE 07: EXPLAINABLE AI',
      m7Desc: 'High-resolution Grad-CAM saliency heatmaps, attention token overlays, and feature attribution for clinical transparency.',
      m7Action: 'Proceed to Evidence Verification',
      m8Title: 'Clinical Evidence Verification (ETDRS 4-2-1 Rule)',
      m8Badge: 'MODULE 08: CLINICAL GROUNDING',
      m8Desc: 'Auditable rule engine checking quadrant hemorrhages, venous beading, and IRMA against international ETDRS criteria.',
      m8Action: 'Proceed to Self-Aware AI',
      m9Title: 'Self-Aware AI & Out-of-Distribution Detection',
      m9Badge: 'MODULE 09: UNCERTAINTY QUANTIFICATION',
      m9Desc: 'Monte Carlo dropout epistemic uncertainty estimation, novelty scoring, and non-retinal image artifact rejection.',
      m9Action: 'Proceed to Trust Gate',
      m10Title: 'Trust Gate & Human-in-the-Loop Triage',
      m10Badge: 'MODULE 10: SAFETY TRIAGE GATE',
      m10Desc: 'Automated clinical safety gate triaging cases into Autonomous Safe Referral, Doctor Review Required, or Hardware Retake.',
      m10Action: 'Proceed to Referral & Care',
      m11Title: 'Referral & Tele-OPD Care Pathway',
      m11Badge: 'MODULE 11: ABDM REFERRAL PATHWAY',
      m11Desc: 'ABDM e-Sanjeevani Tele-OPD referral docket, HL7 FHIR R4 clinical package generation, and urgent care escalation.',
      m11Action: 'View Diagnostic Reports',
      reportsTitle: 'Diagnostic Reports & Documentation',
      reportsBadge: 'CLINICAL AUDIT & DOCUMENTATION CENTER',
      reportsDesc: 'Medical-grade clinical summaries, ABDM Tele-OPD referral slips, ETDRS audits, and FHIR R4 interoperability documents.',
      reportsPrintBtn: 'Print Report',
      reportsPdfBtn: 'Save as PDF',
      reportsFhirBtn: 'FHIR JSON',
      tabClinical: '1. Comprehensive Clinical Summary',
      tabReferral: '2. ABDM Tele-OPD Referral Slip',
      tabEtdrs: '3. ETDRS 4-2-1 Clinical Audit',
      tabMorphometry: '4. Vascular & Graph Morphometry',
      tabFhir: '5. HL7 FHIR R4 Document',
      names: {
        m1: 'M1: Acquisition',
        m2: 'M2: Quality',
        m3: 'M3: Anatomy',
        m4: 'M4: Lesions',
        m5: 'M5: Graph',
        m6: 'M6: Predict',
        m7: 'M7: Explain',
        m8: 'M8: Evidence',
        m9: 'M9: Self-Aware',
        m10: 'M10: Trust',
        m11: 'M11: Care',
      },
    },
  },

  gu: {
    appName: 'રેટિના-ફ્યુઝન ૩૬૦',
    tagline: 'સુલભ આંખની સંભાળ માટે AI-સહાયિત ડાયાબિટીક રેટિનોપેથી સ્ક્રીનિંગ.',
    subTagline: 'તપાસો. સમજાવો. ચકાસો. સંદર્ભ આપો.',
    common: {
      welcome: 'સ્વાગત છે',
      online: 'ઓનલાઇન',
      offline: 'ઓફલાઇન મોડ',
      save: 'સાચવો',
      cancel: 'રદ કરો',
      close: 'બંધ કરો',
      back: 'પાછળ',
      next: 'આગળ',
      submit: 'સબમિટ કરો',
      loading: 'લોડ થઈ રહ્યું છે...',
      search: 'શોધો...',
      print: 'દસ્તાવેજ પ્રિન્ટ કરો',
      download: 'પીડીએફ ડાઉનલોડ કરો',
      status: 'સ્થિતિ',
      viewDetails: 'વિગતો જુઓ',
      verified: 'ચકાસાયેલ',
      pending: 'બાકી',
      view: 'જુઓ',
      language: 'ભાષા',
      activeScan: 'સક્રિય સ્કેન',
      ready: 'તૈયાર',
      processing: 'પ્રક્રિયા ચાલુ',
      runPipeline: 'પાઇપલાઇન ચલાવો',
      screeningCockpit: 'સ્ક્રીનીંગ કોકપિટ',
      clinicalSignIn: 'ક્લિનિકલ સાઇન ઇન',
      createAccount: 'ખાતું બનાવો',
      signOut: 'સાઇન આઉટ',
      patientId: 'દર્દી આઈડી',
      age: 'ઉંમર',
      gender: 'જાતિ',
      doctor: 'ડૉક્ટર',
      hospital: 'હોસ્પિટલ',
    },
    roles: {
      patient: 'દર્દી (પેશન્ટ)',
      healthcareWorker: 'આરોગ્ય કાર્યકર (આશા/PHC)',
      'healthcare-worker': 'આરોગ્ય કાર્યકર (આશા/PHC)',
      doctor: 'ડૉક્ટર / નેત્ર ચિકિત્સક',
      hospital: 'હોસ્પિટલ / સંસ્થા',
    },
    nav: {
      navigation: 'નેવિગેશન',
      overview: 'ઝાંખી (ઓવરવ્યૂ)',
      screeningPipeline: 'સ્ક્રીનીંગ પાઇપલાઇન',
      trustExplainability: 'વિશ્વાસ અને સમજૂતી',
      careReferral: 'સંભાળ અને સંદર્ભ',
      clinicalAudit: 'ક્લિનિકલ ઓડિટ અને અહેવાલો',
      connectivityImpact: 'જોડાણ અને પ્રભાવ',
      home: 'મુખ્ય પૃષ્ઠ',
      dashboard: 'ડેશબોર્ડ',
      imageAcquisition: 'છબી પ્રાપ્તિ (Acquisition)',
      preprocessing: 'પ્રીપ્રોસેસિંગ',
      retinalAnatomy: 'રેટિના એનાટોમી',
      lesionDetection: 'ક્ષતિ શોધ (Lesions)',
      retinalGraph: 'રેટિનલ ગ્રાફ (GNN)',
      drClassification: 'DR વર્ગીકરણ',
      explainability: 'સમજૂતી ક્ષમતા (XAI)',
      evidenceVerification: 'પુરાવા ચકાસણી (ETDRS)',
      selfAwareAI: 'સ્વ-જાગૃત AI (Self-Aware)',
      trustReject: 'વિશ્વાસ / અસ્વીકાર ગેટ',
      referralCare: 'સંદર્ભ અને સંભાળ (ABDM)',
      diagnosticReports: 'નિદાન અહેવાલો',
      integrations: 'રાષ્ટ્રીય જોડાણ',
      continuousLearning: 'સતત શિક્ષણ',
      impactCalculator: 'પ્રભાવ કેલ્ક્યુલેટર',
      myProfile: 'મારી પ્રોફાઇલ અને પ્રમાણપત્રો',
      fieldCampTriage: 'ફીલ્ડ કેમ્પ ટ્રાયજ',
      specialistQueue: 'નિષ્ણાત કતાર',
      hospitalOps: 'હોસ્પિટલ કામગીરી',
      myEyeRecord: 'મારો આંખનો રેકોર્ડ',
    },
    hero: {
      badge: 'ક્લિનિકલ AI એન્જિન',
      badgeSub: 'મલ્ટિમોડલ નિર્ણય સહાયક',
      heading1: 'રેટિનાથી આગળ',
      headingAccent: 'જોતી બુદ્ધિશાળી AI.',
      subheading: 'સંરચના-જાગૃત • ગ્રાફ-આધારિત • પુરાવા-ચકાસાયેલ • વિશ્વસનીય AI. પારદર્શક અને સચોટ ક્લિનિકલ ચકાસણી સાથે ગ્રામીણ ભારતમાં અંધાપો અટકાવવા માટે સમર્પિત.',
      launchScreening: 'સ્ક્રીનીંગ શરૂ કરો',
      exploreJourney: 'AI ડાયગ્નોસ્ટિક સફર જુઓ',
      offlineBadge: '૧૦૦% ઓફલાઇન કાર્યક્ષમ',
      ruralBadge: 'નોન-માઇડ્રિયાટિક કૅમેરા સક્ષમ',
      etdrsBadge: 'ETDRS ચકાસાયેલ',
      metric1: '૯૯.૪%',
      metric1Label: 'ક્વાડ્રેટિક વેઇટેડ કપ્પા',
      metric1Sub: 'ચકાસણી ચોકસાઈ ધોરણ',
      metric2: '< ૧.૮ સે.',
      metric2Label: 'એજ ઇન્ફરન્સ લેટન્સી',
      metric2Sub: 'જેટસન નેનો INT8 TensorRT',
      metric3: '૦%',
      metric3Label: 'ગંભીર કેસમાં ફોલ્સ નેગેટિવ',
      metric3Sub: 'દર્દીની સુરક્ષા પ્રથમ',
      metric4: 'ABDM',
      metric4Label: 'ડિજિટલ હેલ્થ સક્ષમ',
      metric4Sub: 'ઇ-સંજીવની ટેલિ-કન્સલ્ટ',
      pillarsHeader: 'રેટિના-ફ્યુઝન ૩૬૦ ના ૫ મૂળભૂત આધારસ્તંભ',
      pillarsBadge: 'ક્લિનિકલ ઇનોવેશન સ્યુટ',
      pillar1Title: '૧. સંરચના',
      pillar1Name: 'રેટિનલ ગ્રાફ',
      pillar1Desc: 'રક્તવાહિનીઓ અને ઓપ્ટિક લેન્ડમાર્ક્સને ભૌમિતિક ટોપોલોજિકલ મેનિફોલ્ડમાં ફેરવે છે.',
      pillar2Title: '૨. પુરાવા',
      pillar2Name: 'ETDRS ચકાસણી',
      pillar2Desc: 'નિર્ણાયક ૪-૨-૧ ક્લિનિકલ નિયમો દરેક અનુમાનની સચોટ ચકાસણી કરે છે.',
      pillar3Title: '૩. સમજૂતી',
      pillar3Name: 'મલ્ટિમોડલ XAI',
      pillar3Desc: 'ગ્રાફ એટેન્શન એજ વજન સાથે અવકાશી Grad-CAM સક્રિયકરણનું સંકલન.',
      pillar4Title: '૪. વિશ્વાસ',
      pillar4Name: 'સ્વ-જાગૃત ગેટ',
      pillar4Desc: 'અનિશ્ચિત કેસોને ઓળખીને માનવ ડૉક્ટર સમીક્ષા માટે સુરક્ષિત રીતે મોકલે છે.',
      pillar5Title: '૫. ગ્રામીણ પહોંચ',
      pillar5Name: 'ઓફલાઇન એજ AI',
      pillar5Desc: 'ઇન્ટરનેટ વિના પણ નોન-માઇડ્રિયાટિક કેમેરા સાથે જેટસન પર કાર્ય કરે છે.',
    },
    journey: {
      trackBadge: 'AI જર્ની ક્લિનિકલ ટ્રેક',
      title: 'ઇન્ટરેક્ટિવ ૮-તબક્કાની રેટિનલ નિદાન યાત્રા',
      desc: 'ઓપ્ટિકલ કેપ્ચરથી લઈને ટોપોલોજિકલ GNN મેપિંગ, નિર્ણાયક નિયમ ચકાસણી અને ABDM રેફરલ સુધીના દરેક તબક્કાને અનુસરો.',
      exploreBtn: 'તપાસો',
      workstationBtn: 'વર્કસ્ટેશન ખોલો',
      stage1Title: 'ઓછી સુવિધા ધરાવતા વિસ્તારોમાં ઓપ્ટિકલ ફોટોન કેપ્ચર',
      stage1Sub: 'લાઇવ લક્સ ગેટીંગ સાથે પોઇન્ટ-ઓફ-કેર પોર્ટેબલ કેપ્ચર.',
      stage1Desc: 'ગ્રામીણ આરોગ્ય કેન્દ્રોમાં મોંઘા કેમેરા હોતા નથી. સિસ્ટમ પોર્ટેબલ સ્માર્ટફોન એટેચમેન્ટ સાથે સચોટ રીતે કાર્ય કરે છે.',
      stage2Title: 'રક્તવાહિનીઓનું સેગમેન્ટેશન અને લેન્ડમાર્ક ઓળખ',
      stage2Sub: 'ઓપ્ટિક ડિસ્ક, FAZ અને ધમની-શિરા નેટવર્ક ઓળખ.',
      stage2Desc: 'રોગની શોધ કરતા પહેલાં, AI સ્વસ્થ શારીરિક રચનાઓનો ચોક્કસ નકશો તૈયાર કરે છે.',
      stage3Title: 'માઇક્રોવાસ્ક્યુલર ક્ષતિઓનું ચોક્કસ માપન',
      stage3Sub: 'માઇક્રોએન્યુરિઝમ, હેમરેજ અને એક્સ્યુડેટ્સનું પિક્સેલ-સ્તરનું વિશ્લેષણ.',
      stage3Desc: 'બધા ૪ ક્વોડ્રન્ટ્સમાં માઇક્રોએન્યુરિઝમ અને રક્તસ્ત્રાવ શોધીને તેનું અંતર માપે છે.',
      stage4Title: 'રેટિનાનું જૈવિક ગ્રાફમાં રૂપાંતર',
      stage4Sub: 'ટોપોલોજિકલ GNN મોડેલિંગ અને ક્ષતિ અંતર વિશ્લેષણ.',
      stage4Desc: 'છબીઓ પિક્સેલ ગ્રીડ છે જ્યારે રેટિના ટોપોલોજિકલ ગ્રાફ છે. AI તેને નોડ્સ અને એજ તરીકે પ્રોસેસ કરે છે.',
      stage5Title: 'સંરચના-આધારિત ૫-સ્તરીય DR વર્ગીકરણ',
      stage5Sub: 'આંતરરાષ્ટ્રીય ક્લિનિકલ ICDR સ્કેલ અનુસાર વર્ગીકરણ.',
      stage5Desc: 'ConvNeXt બેકબોન અને ગ્રાફ એટેન્શન નેટવર્ક દ્વારા દર્દીની સુરક્ષાને પ્રાથમિકતા આપીને ગ્રેડિંગ કરે છે.',
      stage6Title: 'ETDRS માર્ગદર્શિકા આધારિત નિર્ણાયક ચકાસણી',
      stage6Sub: 'AI ભલામણોને માન્યતા આપતા ક્લિનિકલ ૪-૨-૧ નિયમો.',
      stage6Desc: 'સ્પષ્ટ અને ચકાસી શકાય તેવા શારીરિક પુરાવા વિના ગંભીર ગ્રેડ આપવા માટે AI કાયદેસર પ્રતિબંધિત છે.',
      stage7Title: 'સ્વ-જાગૃત અનિશ્ચિતતા અને ટ્રાઇ-સ્ટેટ સેફ્ટી ગેટ',
      stage7Sub: 'સ્વાયત્ત જોખમ તપાસ અને માનવ ડૉક્ટર સમીક્ષા.',
      stage7Desc: 'જો મોડેલ અસ્પષ્ટ કેસ જુએ છે, તો તે અનુમાન કરવાને બદલે પ્રક્રિયા અટકાવી નિષ્ણાતને રેફર કરે છે.',
      stage8Title: 'આયુષ્માન ભારત રેફરલ અને સારવાર સ્લિપ',
      stage8Sub: 'QR કોડ સાથે તાત્કાલિક ABDM FHIR R4 સ્લિપ જનરેશન.',
      stage8Desc: 'ABHA ID એકીકરણ અને ઈ-સંજીવની બુકિંગ સાથે તાત્કાલિક માન્યતા પ્રાપ્ત રેફરલ સ્લિપ બનાવે છે.',
    },
    chatbot: {
      name: 'રેટિનાબોટ AI',
      badge: 'ક્લિનિકલ ઇન્ટેલિજન્સ',
      subtitle: '૨૪/૭ AI ક્લિનિકલ સહાયક અને પ્રોજેક્ટ માર્ગદર્શિકા',
      welcome: `નમસ્તે! હું **રેટિનાબોટ AI (RetinaBot)** છું — **રેટિના-ફ્યુઝન ૩૬૦** નો સત્તાવાર ક્લિનિકલ અને ટેકનિકલ સહાયક.

હું અમારા ૧૧-તબક્કાના AI ડાયગ્નોસ્ટિક આર્કિટેક્ચર, ભૂમિકા-આધારિત વર્કફ્લો, ABDM ટેલિ-રેફરલ પ્રોટોકોલ અને સિંગલ-પેજ રિપોર્ટ પ્રિન્ટિંગ અંગેના તમામ પ્રશ્નોના ઉત્તર આપી શકું છું.

આજે હું આપને કેવી રીતે મદદ કરી શકું?`,
      placeholder: 'રેટિના-ફ્યુઝન ૩૬૦ વિશે કોઈપણ પ્રશ્ન પૂછો...',
      suggestedTitle: 'ભલામણ કરેલા પ્રશ્નો',
    },
    footer: {
      tagline: '"પિક્સેલથી વધુ સારા જીવન તરફ — સંરચના, પુરાવા અને વિશ્વાસ સાથે AI."',
      subTagline: 'સંરચના-જાગૃત, ગ્રાફ-સંચાલિત અને પુરાવા-ચકાસાયેલ ડાયાબિટીક રેટિનોપેથી સ્ક્રીનિંગ પ્લેટફોર્મ.',
      missionBadge: 'આયુષ્માન ભારત ડિજિટલ મિશન • CDSS Tier-3',
      modulesTitle: '૧૧ મુખ્ય મોડ્યુલ્સ',
      protocolsTitle: 'ક્લિનિકલ પ્રોટોકોલ્સ',
      edgeTitle: 'એજ એન્જિનિયરિંગ',
      copyright: 'રેટિના-ફ્યુઝન ૩૬૦ © ૨૦૨૪. ક્લિનિકલ AI નિર્ણય સહાયક સિસ્ટમ.',
      clinicalNotice: 'તબીબી સૂચના:',
      disclaimer: 'રેટિના-ફ્યુઝન ૩૬૦ એ AI-સહાયિત સ્ક્રીનિંગ નિર્ણય સહાયક પ્રણાલી છે. તે પ્રમાણિત આંખના ડૉક્ટરની તપાસનું સ્થાન લેતી નથી. તમામ શંકાસ્પદ ગંભીર કેસો ABDM દ્વારા માનવ ક્લિનિકલ સંભાળ માટે મોકલવામાં આવે છે.',
    },
    auth: {
      welcomeBack: 'પુનઃ સ્વાગત છે',
      loginTitle: 'ક્લિનિકલ અધિકૃતતા ગેટવે',
      signInTitle: 'ક્લિનિકલ સાઇન ઇન',
      identifierLabel: 'ઈમેલ અથવા મોબાઈલ નંબર',
      emailOrMobile: 'ઈમેલ અથવા મોબાઈલ નંબર',
      identifierPlaceholder: 'doctor@retinafusion.ai અથવા મોબાઈલ નંબર',
      passwordLabel: 'પાસવર્ડ',
      password: 'પાસવર્ડ',
      rememberMe: 'આ સુરક્ષિત ઉપકરણ યાદ રાખો',
      loginButton: 'વર્કસ્પેસમાં પ્રવેશ કરો',
      signIn: 'વર્કસ્પેસમાં પ્રવેશ કરો',
      authenticating: 'ઓળખપત્ર ચકાસી રહ્યું છે...',
      verifying: 'ક્લિનિકલ એક્સેસ ચકાસી રહ્યું છે...',
      loadingWorkspace: 'તમારું વર્કસ્પેસ લોડ થઈ રહ્યું છે...',
      forgotPassword: 'પાસવર્ડ ભૂલી ગયા છો?',
      noAccount: 'નવું ખાતું બનાવવું છે?',
      createAccount: 'નવું ખાતું બનાવો',
      alreadyAccount: 'પહેલેથી ખાતું છે?',
      logout: 'સાઇન આઉટ',
      onlineStatus: 'ઓનલાઇન — ડેટા સિંક્રોનાઇઝ થયેલ છે',
      offlineStatus: 'ઓફલાઇન મોડ — સ્થાનિક પ્રક્રિયા ઉપલબ્ધ',
      secureAuth: '૨૫૬-બીટ સુરક્ષિત ક્લિનિકલ ગેટવે',
    },
    dashboard: {
      myProfile: 'મારી આરોગ્ય પ્રોફાઇલ',
      startScreening: 'સ્ક્રીનીંગ શરૂ કરો',
      screeningHistory: 'સ્ક્રીનીંગ ઇતિહાસ',
      patientQueue: 'દર્દી સમીક્ષા કતાર',
      reports: 'તબીબી અહેવાલો',
      referrals: 'ABDM સંદર્ભો',
      commandCenter: 'હોસ્પિટલ કમાન્ડ સેન્ટર',
      pendingReviews: 'બાકી સમીક્ષાઓ',
      highRiskCases: 'ઉચ્ચ જોખમી કેસો',
      quickStats: 'લાઈવ ટેલિમેટ્રી',
    },
    stages: {
      optics: 'ઓપ્ટિકલ કેપ્ચર',
      quality: 'ગુણવત્તા તપાસ',
      anatomy: 'રેટિનલ રચના',
      lesions: 'ક્ષતિ શોધ',
      graph: 'ટોપોલોજિકલ જીએનએન',
      classification: 'ICDR વર્ગીકરણ',
      xai: 'સમજૂતી (XAI)',
      evidence: 'ETDRS પુરાવા',
      uncertainty: 'અનિશ્ચિતતા તપાસ',
      trust: 'ટ્રસ્ટ સેફ્ટી ગેટ',
      care: 'ABDM કેર સ્લિપ',
    },
    modules: {
      pipelineTrackTitle: 'રેટિના-ફ્યુઝન ૩૬૦ • ૧૧-તબક્કાની ક્લિનિકલ પાઇપલાઇન',
      stageOfTotal: 'તબક્કો',
      ofTotal: 'કુલ ૧૧ માંથી',
      previousModule: 'પાછલું મોડ્યુલ',
      continueTo: 'આગળ વધો:',
      backToDashboard: 'ડેશબોર્ડ કોકપિટ પર પાછા જાઓ',
      completeScreening: 'સ્ક્રીનીંગ પૂર્ણ કરો • ડેશબોર્ડ પર જાઓ',
      activeScanLabel: 'સક્રિય સ્કેન',
      crossModuleSync: 'ક્રોસ-મોડ્યુલ સિંક સક્રિય',
      reanalyzeAll: 'તમામ મોડ્યુલો ફરીથી તપાસો',
      processingStage: 'પ્રોસેસિંગ તબક્કો',
      m1Title: 'છબી પ્રાપ્તિ અને ઓપ્ટિકલ ચકાસણી',
      m1Badge: 'મોડ્યુલ ૦૧: ઓપ્ટિકલ કેપ્ચર',
      m1Desc: 'સ્માર્ટફોન ફંડસ એડેપ્ટર દ્વારા લાઇવ સ્કેન લો, મેડિકલ ફાઇલ અપલોડ કરો, અથવા પ્રમાણિત પ્રીસેટ પસંદ કરો.',
      m1Action: 'પ્રીપ્રોસેસિંગ તરફ આગળ વધો',
      m1UploadTab: 'છબી અપલોડ કરો',
      m1CaptureTab: 'કેમેરા કેપ્ચર (વેબકેમ/એડેપ્ટર)',
      m1DemoTab: 'ડેમો પ્રીસેટ્સ',
      m2Title: 'છબી ગુણવત્તા મૂલ્યાંકન અને સુધારો',
      m2Badge: 'મોડ્યુલ ૦૨: પ્રીપ્રોસેસિંગ અને ગુણવત્તા',
      m2Desc: 'સ્વચાલિત ISO 10940 સ્પષ્ટતા ચકાસણી, CLAHE કોન્ટ્રાસ્ટ સંતુલન, અને લાઈટિંગ ખામી નિવારણ.',
      m2Action: 'રેટિનલ એનાટોમી તરફ આગળ વધો',
      m3Title: 'રેટિનલ એનાટોમી અને રક્તવાહિની વિભાજન',
      m3Badge: 'મોડ્યુલ ૦૩: શરીરરચનાત્મક સંરચના',
      m3Desc: 'ઓપ્ટિક ડિસ્ક, કપ-ટુ-ડિસ્ક ગુણોત્તર (CDR), મેક્યુલા અને સૂક્ષ્મ રક્તવાહિનીઓનું ચોક્કસ સેગમેન્ટેશન.',
      m3Action: 'ક્ષતિ શોધ તરફ આગળ વધો',
      m4Title: 'માઇક્રોવાસ્ક્યુલર ક્ષતિ શોધ અને સ્થાનિકીકરણ',
      m4Badge: 'મોડ્યુલ ૦૪: ક્ષતિઓ (Lesions) અને બાયોમાર્કર્સ',
      m4Desc: 'માઇક્રોએન્યુરિઝમ, રક્તસ્ત્રાવ અને હાર્ડ એક્સ્યુડેટ્સનું ૪ ક્વાડ્રન્ટ્સમાં ચોક્કસ પરિમાણીકરણ.',
      m4Action: 'રેટિનલ ગ્રાફ તરફ આગળ વધો',
      m5Title: 'રેટિનલ ગ્રાફ નિર્માણ અને ટોપોલોજી',
      m5Badge: 'મોડ્યુલ ૦૫: ટોપોલોજીકલ ગ્રાફ (GNN)',
      m5Desc: 'ગ્રાફ ન્યુરલ નેટવર્ક દ્વારા રક્તવાહિની જોડાણો, વળાંક અને નેટવર્ક વિસંગતતાઓનું મેપિંગ.',
      m5Action: 'DR વર્ગીકરણ તરફ આગળ વધો',
      m6Title: 'DR વર્ગીકરણ અને સર્વસંમતિ સ્ટેજીંગ',
      m6Badge: 'મોડ્યુલ ૦૬: ICDR તીવ્રતા ગ્રેડિંગ',
      m6Desc: 'ડ્યુઅલ અલ્ગોરિધમિક સર્વસંમતિ અને વિશ્વસનીયતા સાથે ૫-સ્તરીય આંતરરાષ્ટ્રીય ક્લિનિકલ ગ્રેડિંગ.',
      m6Action: 'સમજૂતી (XAI) તરફ આગળ વધો',
      m7Title: 'સમજૂતી અને વિઝ્યુઅલ પુરાવા (XAI)',
      m7Badge: 'મોડ્યુલ ૦૭: સમજૂતી યોગ્ય AI',
      m7Desc: 'ક્લિનિકલ પારદર્શિતા માટે હાઇ-રિઝોલ્યુશન Grad-CAM હીટમેપ્સ અને લક્ષણ એટ્રિબ્યુશન.',
      m7Action: 'સાક્ષ્ય ચકાસણી તરફ આગળ વધો',
      m8Title: 'ક્લિનિકલ સાક્ષ્ય ચકાસણી (ETDRS 4-2-1 નિયમ)',
      m8Badge: 'મોડ્યુલ ૦૮: ક્લિનિકલ નિયમો',
      m8Desc: 'આંતરરાષ્ટ્રીય ETDRS માપદંડો સામે ૪-ક્વાડ્રન્ટ હેમરેજ અને વેનસ બિડિંગની ઓડિટેબલ નિયમ ચકાસણી.',
      m8Action: 'સ્વ-જાગૃત AI તરફ આગળ વધો',
      m9Title: 'સ્વ-જાગૃત AI અને અનિશ્ચિતતા શોધ',
      m9Badge: 'મોડ્યુલ ૦૯: અનિશ્ચિતતા પરિમાણીકરણ',
      m9Desc: 'મોન્ટે કાર્લો ડ્રોપઆઉટ દ્વારા અનિશ્ચિતતા મૂલ્યાંકન અને બિન-રેટિનલ છબી ખામી અસ્વીકાર.',
      m9Action: 'ટ્રસ્ટ ગેટ તરફ આગળ વધો',
      m10Title: 'ટ્રસ્ટ ગેટ અને ક્લિનિકલ સલામતી ટ્રાયજ',
      m10Badge: 'મોડ્યુલ ૧૦: સલામતી ટ્રાયજ ગેટ',
      m10Desc: 'સ્વચાલિત સલામત રેફરલ, ડૉક્ટર સમીક્ષા, અથવા ફરીથી સ્કેન લેવા માટે ટ્રાયજ ગેટ.',
      m10Action: 'સંદર્ભ અને સંભાળ તરફ આગળ વધો',
      m11Title: 'સંદર્ભ અને ટેલી-ઓપીડી સંભાળ માર્ગ',
      m11Badge: 'મોડ્યુલ ૧૧: ABDM રેફરલ પાથવે',
      m11Desc: 'ABDM ઈ-સંજીવની ટેલી-ઓપીડી રેફરલ ડોકેટ અને HL7 FHIR R4 ક્લિનિકલ પેકેજ નિર્માણ.',
      m11Action: 'નિદાન અહેવાલો જુઓ',
      reportsTitle: 'નિદાન અહેવાલો અને દસ્તાવેજીકરણ',
      reportsBadge: 'ક્લિનિકલ ઓડિટ અને દસ્તાવેજ કેન્દ્ર',
      reportsDesc: 'તબીબી-ગ્રેડ ક્લિનિકલ સારાંશ, ABDM ટેલી-ઓપીડી રેફરલ સ્લિપ, ETDRS ઓડિટ અને FHIR R4 દસ્તાવેજો.',
      reportsPrintBtn: 'અહેવાલ પ્રિન્ટ કરો',
      reportsPdfBtn: 'પીડીએફ તરીકે સાચવો',
      reportsFhirBtn: 'FHIR JSON',
      tabClinical: '૧. વ્યાપક ક્લિનિકલ સારાંશ',
      tabReferral: '૨. ABDM ટેલી-ઓપીડી રેફરલ સ્લિપ',
      tabEtdrs: '૩. ETDRS ૪-૨-૧ ક્લિનિકલ ઓડિટ',
      tabMorphometry: '૪. વેસ્ક્યુલર અને ગ્રાફ મોર્ફોમેટ્રી',
      tabFhir: '૫. HL7 FHIR R4 દસ્તાવેજ',
      names: {
        m1: 'M1: પ્રાપ્તિ',
        m2: 'M2: ગુણવત્તા',
        m3: 'M3: એનાટોમી',
        m4: 'M4: ક્ષતિઓ',
        m5: 'M5: ગ્રાફ',
        m6: 'M6: વર્ગીકરણ',
        m7: 'M7: સમજૂતી',
        m8: 'M8: સાક્ષ્ય',
        m9: 'M9: સ્વ-જાગૃત',
        m10: 'M10: વિશ્વાસ',
        m11: 'M11: સંભાળ',
      },
    },
  },

  hi: {
    appName: 'रेटिना-फ्यूजन 360',
    tagline: 'सुलभ नेत्र देखभाल के लिए AI-सहायता प्राप्त डायबिटिक रेटिनोपैथी स्क्रीनिंग।',
    subTagline: 'जांचें। समझाएं। सत्यापित करें। रेफर करें।',
    common: {
      welcome: 'स्वागत है',
      online: 'ऑनलाइन',
      offline: 'ऑफ़लाइन मोड',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      close: 'बंद करें',
      back: 'पीछे',
      next: 'आगे',
      submit: 'सबमिट करें',
      loading: 'लोड हो रहा है...',
      search: 'खोजें...',
      print: 'दस्तावेज़ प्रिंट करें',
      download: 'पीडीएफ डाउनलोड करें',
      status: 'स्थिति',
      viewDetails: 'विवरण देखें',
      verified: 'सत्यापित',
      pending: 'लंबित',
      view: 'देखें',
      language: 'भाषा',
      activeScan: 'सक्रिय स्कैन',
      ready: 'तैयार',
      processing: 'प्रक्रिया जारी',
      runPipeline: 'पाइपलाइन चलाएं',
      screeningCockpit: 'स्क्रीनिंग कॉकपिट',
      clinicalSignIn: 'क्लिनिकल साइन इन',
      createAccount: 'खाता बनाएं',
      signOut: 'लॉग आउट',
      patientId: 'रोगी आईडी',
      age: 'आयु',
      gender: 'लिंग',
      doctor: 'डॉक्टर',
      hospital: 'अस्पताल',
    },
    roles: {
      patient: 'मरीज़ (पेशेंट)',
      healthcareWorker: 'स्वास्थ्य कार्यकर्ता (आशा/PHC)',
      'healthcare-worker': 'स्वास्थ्य कार्यकर्ता (आशा/PHC)',
      doctor: 'डॉक्टर / नेत्र विशेषज्ञ',
      hospital: 'अस्पताल / संस्था',
    },
    nav: {
      navigation: 'नेविगेशन',
      overview: 'अवलोकन (ओवरव्यू)',
      screeningPipeline: 'स्क्रीनिंग पाइपलाइन',
      trustExplainability: 'विश्वास और व्याख्यात्मकता',
      careReferral: 'देखभाल और रेफरल',
      clinicalAudit: 'क्लिनिकल ऑडिट और रिपोर्ट',
      connectivityImpact: 'कनेक्टिविटी और प्रभाव',
      home: 'होम',
      dashboard: 'डैशबोर्ड',
      imageAcquisition: 'छवि अधिग्रहण (Acquisition)',
      preprocessing: 'प्रीप्रोसेसिंग',
      retinalAnatomy: 'रेटिनल एनाटॉमी',
      lesionDetection: 'घाव की पहचान (Lesions)',
      retinalGraph: 'रेटिनल ग्राफ (GNN)',
      drClassification: 'DR वर्गीकरण',
      explainability: 'व्याख्यात्मकता (XAI)',
      evidenceVerification: 'साक्ष्य सत्यापन (ETDRS)',
      selfAwareAI: 'स्व-जागरूक AI (Self-Aware)',
      trustReject: 'विश्वास / अस्वीकार गेट',
      referralCare: 'रेफरल और देखभाल (ABDM)',
      diagnosticReports: 'नैदानिक रिपोर्ट',
      integrations: 'राष्ट्रीय एकीकरण',
      continuousLearning: 'निरंतर सीखना',
      impactCalculator: 'प्रभाव कैलकुलेटर',
      myProfile: 'मेरी प्रोफ़ाइल और क्रेडेंशियल',
      fieldCampTriage: 'फील्ड कैंप ट्रायज',
      specialistQueue: 'विशेषज्ञ कतार',
      hospitalOps: 'अस्पताल संचालन',
      myEyeRecord: 'मेरा नेत्र रिकॉर्ड',
    },
    hero: {
      badge: 'क्लिनिकल AI इंजन',
      badgeSub: 'मल्टीमॉडल निर्णय समर्थन',
      heading1: 'रेटिना से परे देखने वाली',
      headingAccent: 'बुद्धिमत्तापूर्ण AI।',
      subheading: 'संरचना-सचेत • ग्राफ-संचालित • साक्ष्य-सत्यापित • विश्वसनीय AI। पारदर्शी और निर्णायक क्लिनिकल सत्यापन के साथ ग्रामीण भारत में अंधापन रोकने के लिए समर्पित।',
      launchScreening: 'स्क्रीनिंग शुरू करें',
      exploreJourney: 'AI यात्रा का अन्वेषण करें',
      offlineBadge: '100% ऑफ़लाइन कार्यक्षम',
      ruralBadge: 'ग्रामीण नॉन-माइड्रिएटिक कैमरा सक्षम',
      etdrsBadge: 'ETDRS सत्यापित',
      metric1: '99.4%',
      metric1Label: 'द्विघात भारित कप्पा',
      metric1Sub: 'सत्यापन सटीकता मानक',
      metric2: '< 1.8 से.',
      metric2Label: 'एज इन्फरेंस लेटेंसी',
      metric2Sub: 'जेटसन नैनो INT8 TensorRT',
      metric3: '0%',
      metric3Label: 'गंभीर मामलों में फॉल्स नेगेटिव',
      metric3Sub: 'रोगी सुरक्षा सर्वोपरि',
      metric4: 'ABDM',
      metric4Label: 'डिजिटल स्वास्थ्य सक्षम',
      metric4Sub: 'ई-संजीवनी टेली-परामर्श',
      pillarsHeader: 'रेटिना-फ्यूजन 360 के 5 मूलभूत स्तंभ',
      pillarsBadge: 'क्लिनिकल इनोवेशन सुइट',
      pillar1Title: '1. संरचना',
      pillar1Name: 'रेटिनल ग्राफ',
      pillar1Desc: 'रक्त वाहिकाओं और ऑप्टिक लैंडमार्क को ज्यामितीय टोपोलॉजिकल मैनिफोल्ड में बदलता है।',
      pillar2Title: '2. साक्ष्य',
      pillar2Name: 'ETDRS सत्यापन',
      pillar2Desc: 'निर्णायक 4-2-1 क्लिनिकल नियम प्रत्येक भविष्यवाणी की सत्यता की पुष्टि करते हैं।',
      pillar3Title: '3. व्याख्यात्मकता',
      pillar3Name: 'मल्टीमॉडल XAI',
      pillar3Desc: 'ग्राफ अटेंशन किनारों के साथ स्थानिक Grad-CAM सक्रियता का तालमेल।',
      pillar4Title: '4. विश्वास',
      pillar4Name: 'स्व-जागरूक गेट',
      pillar4Desc: 'अनिश्चित मामलों का पता लगाकर विशेषज्ञ डॉक्टर की समीक्षा हेतु भेजता है।',
      pillar5Title: '5. ग्रामीण पहुंच',
      pillar5Name: 'ऑफ़लाइन एज AI',
      pillar5Desc: 'इंटरनेट के बिना भी नॉन-माइड्रिएटिक कैमरों के साथ जेटसन पर संचालित होता है।',
    },
    journey: {
      trackBadge: 'AI यात्रा क्लिनिकल ट्रैक',
      title: 'इंटरैक्टिव 8-चरणीय रेटिनल नैदानिक यात्रा',
      desc: 'ऑप्टिकल कैप्चर से लेकर टोपोलॉजिकल GNN मैपिंग, निर्णायक नियम सत्यापन और ABDM रेफरल तक प्रत्येक चरण का पालन करें।',
      exploreBtn: 'अन्वेषण करें',
      workstationBtn: 'वर्कस्टेशन खोलें',
      stage1Title: 'कम संसाधन वाली परिस्थितियों में ऑप्टिकल फोटॉन अधिग्रहण',
      stage1Sub: 'रीयल-टाइम लक्स गेटिंग के साथ पोर्टेबल मोबाइल अधिग्रहण।',
      stage1Desc: 'ग्रामीण प्राथमिक स्वास्थ्य केंद्रों में महंगे कैमरे नहीं होते। सिस्टम पोर्टेबल स्मार्टफोन अटैचमेंट के साथ कार्य करता है।',
      stage2Title: 'संवहनी विभाजन और शारीरिक पहचान',
      stage2Sub: 'ऑप्टिक डिस्क, FAZ और धमनी-शिरा संवहनी जाल का निष्कर्षण।',
      stage2Desc: 'बीमारी खोजने से पहले, AI स्वस्थ शारीरिक संरचनाओं का सटीक मानचित्र बनाता है।',
      stage3Title: 'सूक्ष्म संवहनी घावों की सटीक गणना',
      stage3Sub: 'माइक्रोएन्यूरिज्म, रक्तस्राव और एक्सयूडेट्स का पिक्सेल-स्तरीय विभाजन।',
      stage3Desc: 'सभी 4 चतुर्थांशों में माइक्रोएन्यूरिज्म, रक्तस्राव और कठोर एक्सयूडेट्स की गणना और दूरी मापता है।',
      stage4Title: 'रेटिना का जैविक ग्राफ में रूपांतरण',
      stage4Sub: 'स्थानिक हेमोडायनामिक्स और घाव की दूरी को दर्शाने वाला टोपोलॉजिकल GNN।',
      stage4Desc: 'छवियां पिक्सेल ग्रिड हैं; रेटिना टोपोलॉजिकल ग्राफ है। AI लैंडमार्क को नोड्स और किनारों के रूप में मॉडल करता है।',
      stage5Title: 'संरचना-सचेत 5-स्तरीय DR स्टेजिंग',
      stage5Sub: 'अंतर्राष्ट्रीय क्लिनिकल डायबिटिक रेटिनोपैथी (ICDR) पैमाना।',
      stage5Desc: 'ConvNeXt बैकबोन और ग्राफ अटेंशन नेटवर्क को शून्य फॉल्स-नेगेटिव प्राथमिकता के साथ जोड़ता है।',
      stage6Title: 'निर्णायक ETDRS दिशानिर्देश सत्यापन',
      stage6Sub: 'AI सिफारिश को सत्यापित करने वाले क्लिनिकल 4-2-1 नियम।',
      stage6Desc: 'स्पष्ट और सत्यापन योग्य शारीरिक साक्ष्य के बिना गंभीर ग्रेड देने के लिए AI कानूनी रूप से प्रतिबंधित है।',
      stage7Title: 'स्व-जागरूक अनिश्चितता और त्रि-राज्य सुरक्षा गेट',
      stage7Sub: 'स्वायत्त जोखिम सीमा और मानव विशेषज्ञ डॉक्टर रेफरल।',
      stage7Desc: 'यदि मॉडल उच्च अनिश्चितता देखता है, तो यह अनुमान लगाने के बजाय प्रक्रिया रोककर डॉक्टर को रेफर करता है।',
      stage8Title: 'आयुष्मान भारत रेफरल और देखभाल पर्ची',
      stage8Sub: 'QR कोड सत्यापन के साथ त्वरित ABDM FHIR R4 पर्ची निर्माण।',
      stage8Desc: 'ABHA ID एकीकरण और ई-संजीवनी टेली-कंसल्टेशन बुकिंग के साथ त्वरित वैध रेफरल पर्ची तैयार करता है।',
    },
    chatbot: {
      name: 'रेटिनाबॉट AI',
      badge: 'क्लिनिकल इंटेलिजेंस',
      subtitle: '24/7 AI क्लिनिकल सहायक और आर्किटेक्चर गाइड',
      welcome: `नमस्ते! मैं **रेटिनाबॉट AI (RetinaBot)** हूँ — **रेटिना-फ्यूजन 360** का आधिकारिक क्लिनिकल और तकनीकी सहायक।

मैं हमारी 11-चरणीय AI डायग्नोस्टिक पाइपलाइन, भूमिका-आधारित वर्कफ़्लो, ABDM टेली-रेफरल प्रोटोकॉल और सिंगल-पेज रिपोर्ट जेनरेशन के बारे में किसी भी प्रश्न का उत्तर दे सकता हूँ।

आज मैं आपकी क्या सहायता कर सकता हूँ?`,
      placeholder: 'रेटिना-फ्यूजन 360 के बारे में कुछ भी पूछें...',
      suggestedTitle: 'अनुशंसित प्रश्न',
    },
    footer: {
      tagline: '"पिक्सेल से बेहतर जीवन तक — संरचना, साक्ष्य और विश्वास के साथ AI।"',
      subTagline: 'संरचना-सचेत, ग्राफ-संचालित और साक्ष्य-सत्यापित डायबिटिक रेटिनोपैथी स्क्रीनिंग प्लेटफॉर्म।',
      missionBadge: 'आयुष्मान भारत डिजिटल मिशन • CDSS Tier-3',
      modulesTitle: '11 मुख्य मॉड्यूल',
      protocolsTitle: 'क्लिनिकल प्रोटोकॉल',
      edgeTitle: 'एज इंजीनियरिंग',
      copyright: 'रेटिना-फ्यूजन 360 © 2024. क्लिनिकल AI निर्णय समर्थन प्रणाली।',
      clinicalNotice: 'क्लिनिकल सूचना:',
      disclaimer: 'रेटिना-फ्यूजन 360 एक AI-सहायता प्राप्त स्क्रीनिंग निर्णय समर्थन प्रणाली है। यह प्रमाणित नेत्र रोग विशेषज्ञ की जांच का विकल्प नहीं है। सभी संदिग्ध गंभीर मामलों को ABDM के माध्यम से विशेषज्ञ क्लिनिकल देखभाल हेतु भेजा जाता है।',
    },
    auth: {
      welcomeBack: 'वापसी पर स्वागत है',
      loginTitle: 'क्लिनिकल प्रमाणीकरण गेटवे',
      signInTitle: 'क्लिनिकल साइन इन',
      identifierLabel: 'ईमेल या मोबाइल नंबर',
      emailOrMobile: 'ईमेल या मोबाइल नंबर',
      identifierPlaceholder: 'doctor@retinafusion.ai या मोबाइल नंबर',
      passwordLabel: 'पासवर्ड',
      password: 'पासवर्ड',
      rememberMe: 'इस सुरक्षित डिवाइस को याद रखें',
      loginButton: 'कार्यक्षेत्र में प्रवेश करें',
      signIn: 'कार्यक्षेत्र में प्रवेश करें',
      authenticating: 'प्रमाणपत्र जांच रहे हैं...',
      verifying: 'क्लिनिकल पहुंच सत्यापित हो रही है...',
      loadingWorkspace: 'आपका कार्यक्षेत्र लोड हो रहा है...',
      forgotPassword: 'पासवर्ड भूल गए?',
      noAccount: 'क्या आपके पास खाता नहीं है?',
      createAccount: 'नया खाता बनाएं',
      alreadyAccount: 'पहले से खाता है?',
      logout: 'लॉग आउट',
      onlineStatus: 'ऑनलाइन — डेटा सिंक्रनाइज़ है',
      offlineStatus: 'ऑफ़लाइन मोड — स्थानीय वर्कफ़्लो उपलब्ध',
      secureAuth: '256-बिट सुरक्षित क्लिनिकल गेटवे',
    },
    dashboard: {
      myProfile: 'मेरी स्वास्थ्य प्रोफ़ाइल',
      startScreening: 'स्क्रीनिंग शुरू करें',
      screeningHistory: 'स्क्रीनिंग इतिहास',
      patientQueue: 'रोगी समीक्षा कतार',
      reports: 'नैदानिक रिपोर्ट',
      referrals: 'ABDM रेफरल विवरण',
      commandCenter: 'अस्पताल कमांड सेंटर',
      pendingReviews: 'लंबित समीक्षाएं',
      highRiskCases: 'उच्च जोखिम वाले मामले',
      quickStats: 'लाइव टेलीमेट्री',
    },
    stages: {
      optics: 'ऑप्टिकल कैप्चर',
      quality: 'गुणवत्ता जांच',
      anatomy: 'रेटिनल संरचना',
      lesions: 'घाव की पहचान',
      graph: 'टोपोलॉजिकल जीएनएन',
      classification: 'ICDR वर्गीकरण',
      xai: 'व्याख्यात्मकता (XAI)',
      evidence: 'ETDRS साक्ष्य',
      uncertainty: 'अनिश्चितता जांच',
      trust: 'विश्वास सुरक्षा द्वार',
      care: 'ABDM देखभाल रेफरल',
    },
    modules: {
      pipelineTrackTitle: 'रेटिना-फ्यूजन ३६० • ११-चरणीय क्लिनिकल पाइपलाइन ट्रैक',
      stageOfTotal: 'चरण',
      ofTotal: 'कुल ११ में से',
      previousModule: 'पिछला मॉड्यूल',
      continueTo: 'आगे बढ़ें:',
      backToDashboard: 'डैशबोर्ड कॉकपिट पर वापस जाएं',
      completeScreening: 'स्क्रीनिंग पूर्ण करें • डैशबोर्ड पर जाएं',
      activeScanLabel: 'सक्रिय स्कैन',
      crossModuleSync: 'क्रॉस-मॉड्यूल सिंक सक्रिय',
      reanalyzeAll: 'सभी मॉड्यूल पुनः विश्लेषित करें',
      processingStage: 'प्रसंस्करण चरण',
      m1Title: 'छवि अधिग्रहण और ऑप्टिकल सत्यापन',
      m1Badge: 'मॉड्यूल ०१: ऑप्टिकल कैप्चर',
      m1Desc: 'स्मार्टफोन फंडस एडेप्टर के माध्यम से लाइव स्कैन लें, मेडिकल फाइल अपलोड करें, या प्रमाणित प्रीसेट चुनें।',
      m1Action: 'प्रीप्रोसेसिंग की ओर बढ़ें',
      m1UploadTab: 'छवि अपलोड करें',
      m1CaptureTab: 'कैमरा कैप्चर (वेबकैम/एडेप्टर)',
      m1DemoTab: 'डेमो प्रीसेट',
      m2Title: 'छवि गुणवत्ता मूल्यांकन और संवर्द्धन',
      m2Badge: 'मॉड्यूल ०२: प्रीप्रोसेसिंग और गुणवत्ता',
      m2Desc: 'स्वचालित ISO 10940 स्पष्टता सत्यापन, CLAHE कंट्रास्ट संतुलन, और रोशनी दोष निवारण।',
      m2Action: 'रेटिनल एनाटॉमी की ओर बढ़ें',
      m3Title: 'रेटिनल एनाटॉमी और वाहिका विभाजन',
      m3Badge: 'मॉड्यूल ०३: शारीरिक संरचना',
      m3Desc: 'ऑप्टिक डिस्क, कप-टू-डिस्क अनुपात (CDR), मैक्युला और सूक्ष्म रक्त वाहिकाओं का सटीक विभाजन।',
      m3Action: 'घाव पहचान की ओर बढ़ें',
      m4Title: 'माइक्रोवास्कुलर घाव पहचान और स्थानीयकरण',
      m4Badge: 'मॉड्यूल ०४: घाव (Lesions) और बायोमार्कर',
      m4Desc: 'माइक्रोएन्यूरिज्म, रक्तस्राव और हार्ड एक्स्युडेट्स का ४ चतुर्थांशों में सटीक परिमाणीकरण।',
      m4Action: 'रेटिनल ग्राफ की ओर बढ़ें',
      m5Title: 'रेटिनल ग्राफ निर्माण और टोपोलॉजी',
      m5Badge: 'मॉड्यूल ०५: टोपोलॉजिकल ग्राफ (GNN)',
      m5Desc: 'ग्राफ न्यूरल नेटवर्क द्वारा वाहिका जंक्शनों, घुमाव और नेटवर्क विसंगतियों की मैपिंग।',
      m5Action: 'DR वर्गीकरण की ओर बढ़ें',
      m6Title: 'DR वर्गीकरण और बहु-सहमति स्टेजिंग',
      m6Badge: 'मॉड्यूल ०६: ICDR गंभीरता ग्रेडिंग',
      m6Desc: 'दोहरे एल्गोरिदम सहमति और आत्मविश्वास अंशांकन के साथ ५-स्तरीय अंतरराष्ट्रीय क्लिनिकल ग्रेडिंग।',
      m6Action: 'व्याख्यात्मकता (XAI) की ओर बढ़ें',
      m7Title: 'व्याख्यात्मकता और दृश्य साक्ष्य (XAI)',
      m7Badge: 'मॉड्यूल ०७: व्याख्या योग्य AI',
      m7Desc: 'क्लिनिकल पारदर्शिता के लिए उच्च-रिज़ॉल्यूशन Grad-CAM हीटमैप और विशेषता एट्रिब्यूशन।',
      m7Action: 'साक्ष्य सत्यापन की ओर बढ़ें',
      m8Title: 'क्लिनिकल साक्ष्य सत्यापन (ETDRS 4-2-1 नियम)',
      m8Badge: 'मॉड्यूल ०८: क्लिनिकल नियम',
      m8Desc: 'अंतरराष्ट्रीय ETDRS मानदंडों के खिलाफ ४-चतुर्थांश रक्तस्राव और वेनस बीडिंग की नियम जाँच।',
      m8Action: 'स्व-जागरूक AI की ओर बढ़ें',
      m9Title: 'स्व-जागरूक AI और अनिश्चितता पहचान',
      m9Badge: 'मॉड्यूल ०९: अनिश्चितता परिमाणीकरण',
      m9Desc: 'मोंटे कार्लो ड्रॉपआउट द्वारा अनिश्चितता अनुमान और गैर-रेटिनल छवि विकृति अस्वीकृति।',
      m9Action: 'ट्रस्ट गेट की ओर बढ़ें',
      m10Title: 'ट्रस्ट गेट और क्लिनिकल सुरक्षा ट्रायज',
      m10Badge: 'मॉड्यूल १०: सुरक्षा ट्रायज गेट',
      m10Desc: 'स्वचालित सुरक्षित रेफरल, डॉक्टर समीक्षा, या पुनः स्कैन लेने के लिए सुरक्षा ट्रायज गेट।',
      m10Action: 'रेफरल और देखभाल की ओर बढ़ें',
      m11Title: 'रेफरल और टेली-ओपीडी देखभाल मार्ग',
      m11Badge: 'मॉड्यूल ११: ABDM रेफरल पाथवे',
      m11Desc: 'ABDM ई-संजीवनी टेली-ओपीडी रेफरल डॉकेट और HL7 FHIR R4 क्लिनिकल पैकेज निर्माण।',
      m11Action: 'नैदानिक रिपोर्ट देखें',
      reportsTitle: 'नैदानिक रिपोर्ट और दस्तावेज़ीकरण',
      reportsBadge: 'क्लिनिकल ऑडिट और दस्तावेज़ीकरण केंद्र',
      reportsDesc: 'चिकित्सीय-ग्रेड क्लिनिकल सारांश, ABDM टेली-ओपीडी रेफरल पर्ची, ETDRS ऑडिट और FHIR R4 इंटरऑपरेबिलिटी दस्तावेज़।',
      reportsPrintBtn: 'रिपोर्ट प्रिंट करें',
      reportsPdfBtn: 'पीडीएफ के रूप में सहेजें',
      reportsFhirBtn: 'FHIR JSON',
      tabClinical: '1. व्यापक क्लिनिकल सारांश',
      tabReferral: '2. ABDM टेली-ओपीडी रेफरल पर्ची',
      tabEtdrs: '3. ETDRS 4-2-1 क्लिनिकल ऑडिट',
      tabMorphometry: '4. संवहनी और ग्राफ मॉर्फोमेट्री',
      tabFhir: '5. HL7 FHIR R4 दस्तावेज़',
      names: {
        m1: 'M1: अधिग्रहण',
        m2: 'M2: गुणवत्ता',
        m3: 'M3: एनाटॉमी',
        m4: 'M4: घाव',
        m5: 'M5: ग्राफ',
        m6: 'M6: वर्गीकरण',
        m7: 'M7: व्याख्या',
        m8: 'M8: साक्ष्य',
        m9: 'M9: स्व-जागरूक',
        m10: 'M10: विश्वास',
        m11: 'M11: देखभाल',
      },
    },
  },
};
