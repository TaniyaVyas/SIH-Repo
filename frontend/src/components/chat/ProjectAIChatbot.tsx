import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronRight,
  Eye,
  ShieldCheck,
  Printer,
  HeartPulse,
  Activity,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LanguageCode } from '../../types/auth';
import { LanguageSelector } from '../common/LanguageSelector';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  category?: string;
  suggestedLinks?: { label: string; path: string }[];
}

const GREETINGS: Record<LanguageCode, string> = {
  en: `Hello! I am **RetinaBot AI**, the official clinical and technical intelligence assistant for **RetinaFusion 360**.

I can answer any question about our autonomous Diabetic Retinopathy (DR) screening architecture, our 11 AI pipeline stages, role-specific clinical workflows, ABDM tele-ophthalmology referral protocols, and single-page report generation.

What would you like to explore?`,

  gu: `નમસ્તે! હું **રેટિનાબોટ AI (RetinaBot)** છું — **રેટિના-ફ્યુઝન ૩૬૦** નો સત્તાવાર ક્લિનિકલ અને ટેકનિકલ સહાયક.

હું અમારા ૧૧-તબક્કાના AI ડાયગ્નોસ્ટિક આર્કિટેક્ચર, ભૂમિકા-આધારિત વર્કફ્લો, ABDM ટેલિ-ઓપ્થેલ્મોલોજી રેફરલ પ્રોટોકોલ અને સિંગલ-પેજ રિપોર્ટ પ્રિન્ટિંગ અંગેના તમામ પ્રશ્નોના ઉત્તર આપી શકું છું.

આજે આપ શું જાણવા માંગો છો?`,

  hi: `नमस्ते! मैं **रेटिनाबॉट AI (RetinaBot)** हूँ — **रेटिना-फ्यूजन 360** का आधिकारिक क्लिनिकल और तकनीकी सहायक।

मैं हमारी 11-चरणीय AI डायग्नोस्टिक आर्किटेक्चर, भूमिका-आधारित क्लिनिकल वर्कफ़्लो, ABDM टेली-नेत्र विज्ञान रेफरल प्रोटोकॉल और सिंगल-पेज रिपोर्ट जेनरेशन के बारे में किसी भी प्रश्न का उत्तर दे सकता हूँ।

आज आप क्या जानना चाहते हैं?`,
};

const SUGGESTED_QUESTIONS_BY_LANG: Record<LanguageCode, string[]> = {
  en: [
    'What is RetinaFusion 360 and what problem does it solve?',
    'Explain the 11-stage autonomous AI screening pipeline.',
    'How does the ETDRS 4-2-1 clinical rule verification work?',
    'How do ASHA workers refer patients to ABDM hospitals?',
    'What are the 5 ICDR Diabetic Retinopathy stages?',
    'How does the Graph Neural Network (GNN) analyze vessels?',
    'What makes the AI safe and trustworthy (0.0% missed PDR)?',
    'How do I view and print reports, certificates & referral slips?'
  ],
  gu: [
    'રેટિના-ફ્યુઝન ૩૬૦ શું છે અને તે કઈ સમસ્યા હલ કરે છે?',
    '૧૧-તબક્કાની સ્વાયત્ત AI સ્ક્રીનીંગ પાઇપલાઇન સમજાવો.',
    'ETDRS ૪-૨-૧ ક્લિનિકલ નિયમ ચકાસણી કેવી રીતે કાર્ય કરે છે?',
    'આશા કાર્યકરો દર્દીઓને ABDM હોસ્પિટલમાં કેવી રીતે રેફર કરે છે?',
    '૫ ICDR ડાયાબિટીક રેટિનોપેથી તબક્કા કયા છે?',
    'ગ્રાફ ન્યુરલ નેટવર્ક (GNN) રક્તવાહિનીઓનું વિશ્લેષણ કેવી રીતે કરે છે?',
    'AI ને સુરક્ષિત અને વિશ્વસનીય શું બનાવે છે (૦.૦% મિસ્ડ PDR)?',
    'રિપોર્ટ, પ્રમાણપત્ર અને રેફરલ સ્લિપ કેવી રીતે પ્રિન્ટ કરવા?'
  ],
  hi: [
    'रेटिना-फ्यूजन 360 क्या है और यह क्या समस्या हल करता है?',
    '11-चरणीय स्वायत्त AI स्क्रीनिंग पाइपलाइन समझाइए।',
    'ETDRS 4-2-1 क्लिनिकल नियम सत्यापन कैसे कार्य करता है?',
    'आशा कार्यकर्ता मरीजों को ABDM अस्पताल में कैसे रेफर करते हैं?',
    '5 ICDR डायबिटिक रेटिनोपैथी चरण कौन से हैं?',
    'ग्राफ न्यूरल नेटवर्क (GNN) वाहिकाओं का विश्लेषण कैसे करता है?',
    'AI को सुरक्षित और भरोसेमंद क्या बनाता है (0.0% मिस्ड PDR)?',
    'रिपोर्ट, प्रमाण पत्र और रेफरल पर्ची कैसे देखें और प्रिंट करें?'
  ],
};

interface LocalizedKnowledgeEntry {
  keywords: string[];
  title: string;
  category: string;
  response: Record<LanguageCode, string>;
  links?: { label: string; path: string }[];
}

const LOCALIZED_KNOWLEDGE: LocalizedKnowledgeEntry[] = [
  {
    keywords: [
      'what is', 'overview', 'about', 'retinafusion', 'problem', 'sih', 'purpose', 'mission',
      'શું છે', 'પ્રોજેક્ટ', 'હેતુ', 'મિશન', 'સમસ્યા',
      'क्या है', 'प्रोजेक्ट', 'उद्देश्य', 'मिशन', 'समस्या'
    ],
    title: 'Project Overview & Mission',
    category: 'Architecture',
    response: {
      en: `**RetinaFusion 360** is an autonomous, explainable, and multi-modal AI screening ecosystem engineered for the **Ayushman Bharat Digital Mission (ABDM)** and the **National Programme for Control of Blindness & Visual Impairment (NPCBVI)**.

**The Healthcare Challenge in India:**
- India has over **77 million diabetic individuals**, with over 20% developing Diabetic Retinopathy (DR).
- Over **85% of rural primary health centres (PHCs)** lack trained vitreo-retinal specialists.
- Traditional screening requires costly tabletop mydriatic fundus cameras (₹15L+) and pupil-dilating drops.

**The RetinaFusion 360 Innovation:**
1. **Smartphone-Adaptable Fundus Imaging**: Works with low-cost, portable 3D-printed handheld smartphone adapters (e.g., Remidio NM-FOP).
2. **11-Stage Closed-Loop AI Pipeline**: From optical QA to vascular GNN, dual-consensus ICDR classification, deterministic ETDRS verification, and conformal uncertainty calibration.
3. **Zero-Tolerated False Negatives**: Guaranteed 0.0% missed Proliferative DR through a triple-gate safety system.
4. **End-to-End ABDM Integration**: Issues ABHA-linked fast-track tele-OPD referral slips, e-Sanjeevani consultation tickets, and HL7 FHIR R4 interoperable bundles.`,

      gu: `**રેટિના-ફ્યુઝન ૩૬૦ (RetinaFusion 360)** એ **આયુષ્માન ભારત ડિજિટલ મિશન (ABDM)** અને **નેશનલ પ્રોગ્રામ ફોર કંટ્રોલ ઓફ બ્લાઇન્ડનેસ (NPCBVI)** માટે તૈયાર કરાયેલ એક સ્વાયત્ત, સમજૂતીક્ષમ અને મલ્ટિમોડલ AI સ્ક્રીનીંગ સિસ્ટમ છે.

**ભારતમાં આરોગ્ય ક્ષેત્રનું મોટું પડકાર:**
- ભારતમાં **૭૭ મિલિયનથી વધુ ડાયાબિટીસના દર્દીઓ** છે, જેમાંથી ૨૦% થી વધુ દર્દીઓમાં ડાયાબિટીક રેટિનોપેથી (DR) વિકસે છે.
- ૮૫% થી વધુ ગ્રામીણ પ્રાથમિક આરોગ્ય કેન્દ્રો (PHC) પાસે રેટિના નિષ્ણાત ડૉક્ટર હોતા નથી.
- પરંપરાગત તપાસ માટે ₹૧૫ લાખથી વધુ કિંમતના મોંઘા કેમેરા અને આંખ પહોળી કરવાના ટીપાંની જરૂર પડે છે.

**રેટિના-ફ્યુઝન ૩૬૦ નું ઇનોવેશન:**
૧. **સ્માર્ટફોન-આધારિત ફંડસ ઇમેજિંગ**: પોર્ટેબલ અને સસ્તા 3D-પ્રિન્ટેડ સ્માર્ટફોન એડેપ્ટર સાથે કાર્ય કરે છે.
૨. **૧૧-તબક્કાની ક્લોઝ્ડ-લૂપ AI પાઇપલાઇન**: ઓપ્ટિકલ ગુણવત્તાથી લઈને વાસ્ક્યુલર GNN, ICDR વર્ગીકરણ અને ETDRS ક્લિનિકલ નિયમો.
૩. **શૂન્ય ફોલ્સ નેગેટિવ (0.0% Missed PDR)**: દર્દીની સુરક્ષા માટે ટ્રિપલ-ગેટ સેફ્ટી સિસ્ટમ.
૪. **સંપૂર્ણ ABDM જોડાણ**: ABHA લિંક્ડ રેફરલ સ્લિપ્સ અને ઈ-સંજીવની ટેલિ-કન્સલ્ટેશન ટિકિટ જનરેટ કરે છે.`,

      hi: `**रेटिना-फ्यूजन 360 (RetinaFusion 360)** **आयुष्मान भारत डिजिटल मिशन (ABDM)** और **राष्ट्रीय अंधापन नियंत्रण कार्यक्रम (NPCBVI)** के लिए विकसित एक स्वायत्त, व्याख्यात्मक और मल्टीमॉडल AI स्क्रीनिंग इकोसिस्टम है।

**भारत में स्वास्थ्य सेवा की चुनौती:**
- भारत में **7.7 करोड़ से अधिक डायबिटिक लोग** हैं, जिनमें से 20% से अधिक में डायबिटिक रेटिनोपैथी (DR) विकसित होती है।
- 85% से अधिक ग्रामीण प्राथमिक स्वास्थ्य केंद्रों (PHC) में प्रशिक्षित रेटिना विशेषज्ञ नहीं हैं।
- पारंपरिक जांच के लिए अत्यधिक महंगे कैमरों (₹15 लाख+) और पुतली फैलाने वाली बूंदों की आवश्यकता होती है।

**रेटिना-फ्यूजन 360 का नवाचार:**
1. **स्मार्टफोन-अनुकूल फंडस इमेजिंग**: सस्ते और पोर्टेबल 3D-प्रिंटेड स्मार्टफोन एडेप्टर के साथ कार्य करता है।
2. **11-चरणीय बंद-लूप AI पाइपलाइन**: ऑप्टिकल गुणवत्ता जांच से लेकर संवहनी GNN, ICDR वर्गीकरण और ETDRS क्लिनिकल नियम।
3. **शून्य फॉल्स नेगेटिव (0.0% Missed PDR)**: रोगी सुरक्षा के लिए ट्रिपल-गेट सुरक्षा द्वार।
4. **संपूर्ण ABDM एकीकरण**: ABHA-लिंक्ड त्वरित रेफरल पर्चियां और ई-संजीवनी टेली-परामर्श टिकट तैयार करता है।`
    },
    links: [
      { label: 'System Architecture', path: '/infrastructure' },
      { label: 'View 11 Modules', path: '/acquisition' }
    ]
  },
  {
    keywords: [
      '11', 'pipeline', 'stages', 'modules', 'steps', 'workflow', 'process',
      '૧૧', 'તબક્કા', 'મોડ્યુલ', 'પગલાં', 'પાઇપલાઇન', 'વર્કફ્લો',
      '11', 'चरण', 'मॉड्यूल', 'पाइपलाइन', 'वर्कफ़्लो'
    ],
    title: '11 Core AI Pipeline Stages',
    category: 'Pipeline',
    response: {
      en: `The RetinaFusion 360 diagnostic pipeline operates across **11 interconnected clinical & AI stages**:

1. **Stage 01 — Optical Capture & QC** (\`/acquisition\`): Real-time focus, illumination, SNR, and blur gating before AI processing.
2. **Stage 02 — Retinal Preprocessing** (\`/preprocessing\`): CLAHE contrast enhancement, green channel optical extraction, illumination correction.
3. **Stage 03 — Retinal Anatomy** (\`/anatomy\`): Semantic sub-pixel segmentation of Optic Disc, Cup-to-Disc ratio (CDR), and Foveal Avascular Zone (FAZ).
4. **Stage 04 — Lesion Detection** (\`/lesions\`): 4-quadrant deterministic quantification of microaneurysms, hemorrhages, and hard exudates.
5. **Stage 05 — Retinal Graph GNN** (\`/retinal-graph\`): Geometric deep learning on vascular topology, branching angles, tortuosity, and fractal dimensions.
6. **Stage 06 — ICDR 5-Stage Classification** (\`/classification\`): 5-class clinical diabetic retinopathy grading with dual-consensus confidence.
7. **Stage 07 — Explainability & XAI** (\`/explainability\`): Saliency maps via Grad-CAM, SHAP feature importance, and anatomical lesion heatmaps.
8. **Stage 08 — Evidence Verification** (\`/evidence\`): Deterministic clinical audit adhering strictly to the international ETDRS 4-2-1 gold standard.
9. **Stage 09 — Self-Aware Calibration** (\`/self-aware\`): Monte Carlo Dropout uncertainty estimation, epistemic vs aleatoric variance, conformal prediction sets.
10. **Stage 10 — Trust Gate & Safety** (\`/trust\`): Triple-gate triage: Autonomous Safe Screen, Human-in-the-Loop Specialist Referral, or Quality Rejection.
11. **Stage 11 — Care Pathways & ABDM** (\`/care\`): Instant ABDM tele-OPD docket routing, e-Sanjeevani booking, SMS QR dispatch, and FHIR R4 records.`,

      gu: `રેટિના-ફ્યુઝન ૩૬૦ નિદાન પાઇપલાઇન **૧૧ આંતરિક રીતે જોડાયેલા ક્લિનિકલ અને AI તબક્કાઓ** પર કાર્ય કરે છે:

૧. **તબક્કો ૧ — ઓપ્ટિકલ કેપ્ચર અને QC** (\`/acquisition\`): રિયલ-ટાઇમ ફોકસ, પ્રકાશ અને બ્લર તપાસ.
૨. **તબક્કો ૨ — રેટિના પ્રીપ્રોસેસિંગ** (\`/preprocessing\`): CLAHE કોન્ટ્રાસ્ટ એન્હાન્સમેન્ટ અને ગ્રીન ચેનલ નિષ્કર્ષણ.
૩. **તબક્કો ૩ — રેટિનલ એનાટોમી** (\`/anatomy\`): ઓપ્ટિક ડિસ્ક, CDR રેશિયો અને FAZ મેક્યુલા સેગમેન્ટેશન.
૪. **તબક્કો ૪ — ક્ષતિ શોધ (Lesions)** (\`/lesions\`): ૪ ક્વોડ્રન્ટ્સમાં માઇક્રોએન્યુરિઝમ, હેમરેજ અને એક્સ્યુડેટ્સનું માપન.
૫. **તબક્કો ૫ — રેટિનલ ગ્રાફ GNN** (\`/retinal-graph\`): રક્તવાહિની સંરચના અને શાખાઓનું જીઓમેટ્રિક ડીપ લર્નિંગ.
૬. **તબક્કો ૬ — ICDR ૫-સ્તરીય વર્ગીકરણ** (\`/classification\`): આંતરરાષ્ટ્રીય ધોરણ અનુસાર ગ્રેડ ૦ થી ૪ વર્ગીકરણ.
૭. **તબક્કો ૭ — સમજૂતીક્ષમતા (XAI)** (\`/explainability\`): Grad-CAM અને SHAP આધારિત હીટમેપ્સ.
૮. **તબક્કો ૮ — પુરાવા ચકાસણી (Evidence)** (\`/evidence\`): ETDRS ૪-૨-૧ નિયમો અનુસાર નિર્ણાયક ક્લિનિકલ ઓડિટ.
૯. **તબક્કો ૯ — સ્વ-જાગૃત અનિશ્ચિતતા** (\`/self-aware\`): મોન્ટે કાર્લો ડ્રોપઆઉટ દ્વારા અનિશ્ચિતતા માપન.
૧૦. **તબક્કો ૧૦ — ટ્રસ્ટ સેફ્ટી ગેટ** (\`/trust\`): ટ્રિપલ-ગેટ: સ્વાયત્ત સ્ક્રીન, ડૉક્ટર રેફરલ, અથવા રિકેપ્ચર.
૧૧. **તબક્કો ૧૧ — કેર પાથવે અને ABDM** (\`/care\`): ABHA લિંક્ડ રેફરલ સ્લિપ, ઈ-સંજીવની અને FHIR R4 દસ્તાવેજ.`,

      hi: `रेटिना-फ्यूजन 360 डायग्नोस्टिक पाइपलाइन **11 आपस में जुड़े क्लिनिकल और AI चरणों** में कार्य करती है:

1. **चरण 1 — ऑप्टिकल कैप्चर और QC** (\`/acquisition\`): रीयल-टाइम फोकस, प्रकाश और धुंधलापन जांच।
2. **चरण 2 — रेटिनल प्रीप्रोसेसिंग** (\`/preprocessing\`): CLAHE कंट्रास्ट संवर्धन और ग्रीन चैनल निष्कर्षण।
3. **चरण 3 — रेटिनल एनाटॉमी** (\`/anatomy\`): ऑप्टिक डिस्क, कप-टू-डिस्क अनुपात और FAZ मैकुला विभाजन।
4. **चरण 4 — घावों की पहचान (Lesions)** (\`/lesions\`): 4 चतुर्थांशों में माइक्रोएन्यूरिज्म, रक्तस्राव और एक्सयूडेट्स की गणना।
5. **चरण 5 — रेटिनल ग्राफ GNN** (\`/retinal-graph\`): संवहनी संरचना पर ज्यामितीय डीप लर्निंग।
6. **चरण 6 — ICDR 5-स्तरीय वर्गीकरण** (\`/classification\`): ग्रेड 0 से 4 तक सटीक वर्गीकरण।
7. **चरण 7 — व्याख्यात्मकता (XAI)** (\`/explainability\`): Grad-CAM और SHAP आधारित हीटमैप।
8. **चरण 8 — साक्ष्य सत्यापन (Evidence)** (\`/evidence\`): ETDRS 4-2-1 नियमों के तहत क्लिनिकल ऑडिट।
9. **चरण 9 — स्व-जागरूक अनिश्चितता** (\`/self-aware\`): मोंटे कार्लो ड्रॉपआउट अनिश्चितता माप।
10. **चरण 10 — ट्रस्ट गेट और सुरक्षा** (\`/trust\`): स्वायत्त स्क्रीन, विशेषज्ञ डॉक्टर रेफरल, या पुनः कैप्चर।
11. **चरण 11 — देखभाल मार्ग और ABDM** (\`/care\`): ABHA लिंक्ड रेफरल पर्ची, ई-संजीवनी और FHIR R4 रिकॉर्ड।`
    },
    links: [
      { label: 'Stage 01 Acquisition', path: '/acquisition' },
      { label: 'Stage 05 Classification', path: '/classification' },
      { label: 'Stage 10 Trust Gate', path: '/trust' }
    ]
  },
  {
    keywords: [
      'etdrs', '4-2-1', 'rule', 'evidence', 'gold standard', 'clinical rule', 'consensus',
      'નિયમ', 'પુરાવા', 'ગોલ્ડ સ્ટાન્ડર્ડ', 'ચકાસણી',
      'नियम', 'साक्ष्य', 'गोल्ड स्टैंडर्ड', 'सत्यापन'
    ],
    title: 'ETDRS 4-2-1 Clinical Rule Engine',
    category: 'Clinical Rules',
    response: {
      en: `The **Early Treatment Diabetic Retinopathy Study (ETDRS) 4-2-1 rule** is the international clinical gold standard for diagnosing **Severe Non-Proliferative Diabetic Retinopathy (NPDR, Grade 3)**:

- **Rule 4**: Definite microaneurysms/intraretinal hemorrhages present in **all 4 quadrants**.
- **Rule 2**: Prominent venous beading present in **2 or more quadrants**.
- **Rule 1**: Prominent Intraretinal Microvascular Abnormalities (IRMA) present in **1 or more quadrants**.

**How RetinaFusion 360 Uses It:**
Unlike opaque black-box AI models, our **Evidence Engine (Module 8)** programmatically checks these anatomical criteria. If the vision model predicts Grade 3 but the quadrant lesion count fails the 4-2-1 rule, the system triggers an audit discrepancy and escalates to a human vitreo-retinal specialist for confirmation.`,

      gu: `**ETDRS ૪-૨-૧ નિયમ (Early Treatment Diabetic Retinopathy Study)** એ **ગંભીર નોન-પ્રોલિફેરેટિવ ડાયાબિટીક રેટિનોપેથી (Severe NPDR, Grade 3)** ના નિદાન માટેનું આંતરરાષ્ટ્રીય સુવર્ણ ધોરણ છે:

- **નિયમ ૪**: બધા **૪ ક્વોડ્રન્ટ્સ** માં ચોક્કસ માઇક્રોએન્યુરિઝમ અથવા હેમરેજ હોવા જોઈએ.
- **નિયમ ૨**: **૨ અથવા વધુ ક્વોડ્રન્ટ્સ** માં અગ્રણી વેનસ બીડિંગ હોવું જોઈએ.
- **નિયમ ૧**: **૧ અથવા વધુ ક્વોડ્રન્ટ્સ** માં IRMA અસામાન્યતા હોવી જોઈએ.

**રેટિના-ફ્યુઝન ૩૬૦ આનો કેવી રીતે ઉપયોગ કરે છે:**
સામાન્ય બ્લેક-બોક્સ AI મોડેલ્સથી વિપરીત, અમારું **એવિડન્સ એન્જિન (મોડ્યુલ ૮)** આ નિયમોની પ્રોગ્રામેટિક ચકાસણી કરે છે. જો વિઝન મોડેલ ગ્રેડ ૩ જણાવે પરંતુ ક્વોડ્રન્ટ કાઉન્ટ ૪-૨-૧ નિયમ પાસ ન કરે, તો સિસ્ટમ તરત જ વિસંગતતા નોંધીને નેત્ર નિષ્ણાતને રેફર કરે છે.`,

      hi: `**ETDRS 4-2-1 नियम (Early Treatment Diabetic Retinopathy Study)** **गंभीर नॉन-प्रोलिफेरेटिव डायबिटिक रेटिनोपैथी (Severe NPDR, Grade 3)** के निदान के लिए अंतर्राष्ट्रीय स्वर्ण मानक है:

- **नियम 4**: सभी **4 चतुर्थांशों** में निश्चित माइक्रोएन्यूरिज्म या रक्तस्राव होना चाहिए।
- **नियम 2**: **2 या अधिक चतुर्थांशों** में प्रमुख शिरापरक बीडिंग (Venous Beading) होनी चाहिए।
- **नियम 1**: **1 या अधिक चतुर्थांशों** में IRMA असामान्यताएं होनी चाहिए।

**रेटिना-फ्यूजन 360 इसका उपयोग कैसे करता है:**
पारंपरिक ब्लैक-बॉक्स AI मॉडल के विपरीत, हमारा **एविडेंस इंजन (मॉड्यूल 8)** इन मानदंडों की स्वचालित जांच करता है। यदि मॉडल ग्रेड 3 का अनुमान लगाता है लेकिन 4-2-1 नियम पूरा नहीं होता, तो सिस्टम इसे विशेषज्ञ डॉक्टर के पास भेजता है।`
    },
    links: [
      { label: 'Stage 08 Evidence Module', path: '/evidence' },
      { label: 'View Reports', path: '/reports' }
    ]
  },
  {
    keywords: [
      'print', 'download', 'pdf', 'blank', 'page', 'slip', 'certificate', 'card', 'report',
      'પ્રિન્ટ', 'ડાઉનલોડ', 'અહેવાલ', 'સ્લિપ', 'પ્રમાણપત્ર', 'કાર્ડ',
      'प्रिंट', 'डाउनलोड', 'रिपोर्ट', 'पर्ची', 'प्रमाण पत्र', 'कार्ड'
    ],
    title: 'Professional Single-Page Documents & Printing',
    category: 'Reporting Engine',
    response: {
      en: `Every printable document in RetinaFusion 360 is engineered to render cleanly on a **single standard page (A4/Portrait)** without blank trailing pages:

1. **Digital Eye Health Credential Card**: In Patient Dashboard & Profile. Contains ABHA ID, photo, QR verification, and emergency contacts.
2. **Rural Screening Completion Certificate**: In Healthcare Worker / ASHA Dashboard. Official state emblem, PHC ID, and clinical clearance stamp.
3. **NMC Doctor Sign-Off Certificate**: In Doctor Dashboard. Digital signature token and treatment protocol.
4. **ABDM Tertiary Referral Slip**: In Doctor Dashboard. Fast-track escalation to tertiary eye hospitals.
5. **5 Full Diagnostic Reports**: In \`/reports\` (Clinical Summary, Referral Slip, ETDRS Audit, Vascular Morphometry, HL7 FHIR R4 JSON).

**Universal Print Engine:**
Documents utilize an isolated vector container and CSS page-break optimization to guarantee zero blank pages in Chrome, Edge, and mobile browsers.`,

      gu: `રેટિના-ફ્યુઝન ૩૬૦ માં તમામ પ્રિન્ટેબલ દસ્તાવેજો ખાલી પૃષ્ઠો વગર **સિંગલ સ્ટાન્ડર્ડ પેજ (A4)** પર ચોક્કસ રીતે પ્રિન્ટ અને ડાઉનલોડ થાય છે:

૧. **ડિજિટલ આઇ હેલ્થ ક્રેડેન્શિયલ કાર્ડ**: પેશન્ટ ડેશબોર્ડ અને પ્રોફાઇલમાં. ABHA ID, QR કોડ અને ઇમરજન્સી સંપર્ક સાથે.
૨. **ગ્રામીણ સ્ક્રીનીંગ પ્રમાણપત્ર**: આશા / આરોગ્ય કાર્યકર ડેશબોર્ડમાં. સત્તાવાર રાજ્ય ચિહ્ન અને PHC મહોર સાથે.
૩. **NMC ડૉક્ટર પ્રમાણપત્ર**: ડૉક્ટર ડેશબોર્ડમાં. ડિજિટલ હસ્તાક્ષર અને સારવાર ભલામણ સાથે.
૪. **ABDM તૃતીય રેફરલ સ્લિપ**: ડૉક્ટર ડેશબોર્ડમાં. અદ્યતન આંખની હોસ્પિટલ માટે ફાસ્ટ-ટ્રેક રેફરલ.
૫. **૫ સંપૂર્ણ તબીબી અહેવાલો**: \`/reports\` માં (ક્લિનિકલ સારાંશ, રેફરલ સ્લિપ, ETDRS ઓડિટ, વાસ્ક્યુલર વિશ્લેષણ, FHIR R4 JSON).`,

      hi: `रेटिना-फ्यूजन 360 में सभी प्रिंट करने योग्य दस्तावेज़ बिना किसी खाली पृष्ठ के **सिंगल पेज (A4)** पर सटीक रूप से प्रिंट और डाउनलोड होते हैं:

1. **डिजिटल आई हेल्थ क्रेडेंशियल कार्ड**: रोगी डैशबोर्ड और प्रोफ़ाइल में। ABHA ID, QR कोड और आपातकालीन संपर्क के साथ।
2. **ग्रामीण स्क्रीनिंग प्रमाणपत्र**: आशा / स्वास्थ्य कार्यकर्ता डैशबोर्ड में। आधिकारिक राज्य प्रतीक और PHC मुहर के साथ।
3. **NMC डॉक्टर प्रमाणपत्र**: डॉक्टर डैशबोर्ड में। डिजिटल हस्ताक्षर और उपचार योजना के साथ।
4. **ABDM टर्शियरी रेफरल पर्ची**: डॉक्टर डैशबोर्ड में। उच्च स्तरीय नेत्र अस्पताल के लिए त्वरित रेफरल।
5. **5 विस्तृत नैदानिक रिपोर्ट**: \`/reports\` में (क्लिनिकल सारांश, रेफरल पर्ची, ETDRS ऑडिट, संवहनी विश्लेषण, FHIR R4 JSON)।`
    },
    links: [
      { label: 'Go to Reports Page', path: '/reports' },
      { label: 'View Profile & Card', path: '/profile' }
    ]
  },
  {
    keywords: [
      'asha', 'worker', 'abdm', 'referral', 'phc', 'rural', 'sanjeevani',
      'આશા', 'કાર્યકર', 'રેફરલ', 'ગ્રામીણ', 'હોસ્પિટલ',
      'आशा', 'कार्यकर्ता', 'रेफरल', 'ग्रामीण', 'अस्पताल'
    ],
    title: 'ASHA Field Triage & ABDM Referrals',
    category: 'Care Delivery',
    response: {
      en: `**ASHA (Accredited Social Health Activist) Workers** form the primary screening force of RetinaFusion 360:

1. **Offline Non-Mydriatic Capture**: ASHA workers perform fundus imaging directly at village sub-centres using handheld smartphone adapters without dilating drops.
2. **Edge Triage (< 1.8s)**: The offline model instantly analyzes the scan and grades retinopathy risk.
3. **Instant Referral Generation**: For Grade 2+ cases, an ABDM-compliant referral slip with ABHA ID is generated immediately and sent to the patient's phone via SMS/WhatsApp with QR code.
4. **Tele-Consultation**: Direct integration with e-Sanjeevani books a remote tele-ophthalmology session with the district hospital.`,

      gu: `**આશા (ASHA) કાર્યકરો** રેટિના-ફ્યુઝન ૩૬૦ ની મુખ્ય સંભાળ સેના છે:

૧. **ઓફલાઇન નોન-માઇડ્રિયાટિક કેપ્ચર**: આશા કાર્યકરો આંખ પહોળી કરવાના ટીપાં વગર સ્માર્ટફોન એડેપ્ટર વડે ગામડામાં જ ફોટો લે છે.
૨. **એજ ટ્રાયજ (< ૧.૮ સેકન્ડ)**: ઓફલાઇન AI તરત જ સ્કેનનું વિશ્લેષણ કરીને જોખમ ગ્રેડ નક્કી કરે છે.
૩. **તાત્કાલિક રેફરલ નિર્માણ**: ગ્રેડ ૨ કે તેથી વધુ કેસોમાં દર્દીના મોબાઈલ પર ABHA લિંક્ડ રેફરલ સ્લિપ QR કોડ સાથે મોકલવામાં આવે છે.
૪. **ઈ-સંજીવની ટેલિ-કન્સલ્ટેશન**: દર્દીને જિલ્લા હોસ્પિટલના નેત્ર નિષ્ણાત સાથે સીધા જોડે છે.`,

      hi: `**आशा (ASHA) कार्यकर्ता** रेटिना-फ्यूजन 360 की प्राथमिक स्क्रीनिंग शक्ति हैं:

1. **ऑफ़लाइन नॉन-माइड्रिएटिक कैप्चर**: आशा कार्यकर्ता बिना पुतली फैलाए स्मार्टफोन एडेप्टर से गांव में ही जांच करती हैं।
2. **एज इन्फरेंस (< 1.8 सेकंड)**: ऑफ़लाइन मॉडल तुरंत स्कैन का विश्लेषण कर जोखिम स्तर निर्धारित करता है।
3. **त्वरित रेफरल पर्ची**: ग्रेड 2 या अधिक मामलों में ABHA लिंक्ड रेफरल पर्ची QR कोड के साथ मरीज के फोन पर भेजी जाती है।
4. **टेली-परामर्श**: ई-संजीवनी के माध्यम से सीधे जिला अस्पताल के नेत्र रोग विशेषज्ञ से टेली-परामर्श बुक होता है।`
    },
    links: [
      { label: 'Healthcare Worker Dashboard', path: '/dashboard/healthcare-worker' },
      { label: 'Care Pathway Stage 11', path: '/care' }
    ]
  }
];

export const ProjectAIChatbot: React.FC = () => {
  const { language, t } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize or synchronize initial greeting when language changes (if user hasn't typed custom messages)
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [
          {
            id: 'greeting',
            sender: 'assistant',
            text: GREETINGS[language] || GREETINGS.en,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            category: t.nav.overview,
            suggestedLinks: [
              { label: t.nav.imageAcquisition, path: '/acquisition' },
              { label: t.nav.diagnosticReports, path: '/reports' },
              { label: t.nav.myProfile, path: '/profile' }
            ]
          }
        ];
      }
      return prev;
    });
  }, [language, t]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Knowledge matcher function respecting active language
  const findAnswer = (query: string): { title: string; category: string; response: string; links?: { label: string; path: string }[] } => {
    const clean = query.toLowerCase().trim();

    let bestMatch: LocalizedKnowledgeEntry | null = null;
    let highestScore = 0;

    for (const entry of LOCALIZED_KNOWLEDGE) {
      let score = 0;
      for (const kw of entry.keywords) {
        if (clean.includes(kw.toLowerCase())) {
          score += kw.length;
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = entry;
      }
    }

    if (bestMatch && highestScore > 2) {
      const responseText = bestMatch.response[language] || bestMatch.response.en;
      return {
        title: bestMatch.title,
        category: bestMatch.category,
        response: responseText,
        links: bestMatch.links,
      };
    }

    // Trilingual Default Intelligent Fallback
    const fallbacks: Record<LanguageCode, string> = {
      en: `I searched the RetinaFusion 360 knowledge base regarding **"${query}"**.

Here is what is most relevant:
RetinaFusion 360 is an autonomous, explainable AI platform designed for early Diabetic Retinopathy detection across 11 diagnostic stages for Ayushman Bharat (ABDM).

You can ask me about:
- **11 Pipeline Modules** (Acquisition, Preprocessing, Anatomy, Lesions, Graph, Classification, Explainability, Evidence, Self-Awareness, Trust Gate, Care)
- **Clinical Rules** (ETDRS 4-2-1 rule, ICDR 5-stage scale, 0.0% missed PDR guarantee)
- **Role Dashboards** (Patient, Healthcare Worker/ASHA, Doctor/Ophthalmologist, Hospital Admin)
- **Printing & Reports** (Single-page Eye Health Cards, Screening Certificates, ABDM Referral Slips)
- **ABDM & FHIR Integration** (e-Sanjeevani tele-OPD, ABHA ID linking, HL7 FHIR R4 export)`,

      gu: `મેં **"${query}"** અંગે રેટિના-ફ્યુઝન ૩૬૦ ડેટાબેઝમાં શોધ કરી.

રેટિના-ફ્યુઝન ૩૬૦ એ આયુષ્માન ભારત ડિજિટલ મિશન (ABDM) માટે ૧૧ નિદાન તબક્કાઓમાં કાર્ય કરતી સ્વાયત્ત અને સમજૂતીક્ષમ AI સિસ્ટમ છે.

આપ મને નીચેની બાબતો વિશે પૂછી શકો છો:
- **૧૧ AI પાઇપલાઇન મોડ્યુલ્સ** (ઓપ્ટિક્સ, પ્રીપ્રોસેસિંગ, એનાટોમી, ક્ષતિઓ, ગ્રાફ, વર્ગીકરણ, XAI, પુરાવા, ટ્રસ્ટ ગેટ, સંભાળ)
- **ક્લિનિકલ નિયમો** (ETDRS ૪-૨-૧ નિયમ, ICDR સ્કેલ, શૂન્ય ફોલ્સ નેગેટિવ ગેરંટી)
- **ભૂમિકા-આધારિત ડેશબોર્ડ્સ** (દર્દી, આશા કાર્યકર, ડૉક્ટર, હોસ્પિટલ)
- **સિંગલ-પેજ રિપોર્ટ્સ અને પ્રિન્ટિંગ** (આઇ હેલ્થ કાર્ડ, પ્રમાણપત્ર, રેફરલ સ્લિપ)
- **ABDM અને ઈ-સંજીવની એકીકરણ** (ABHA ID, ટેલિ-ઓપ્થેલ્મોલોજી, FHIR R4)`,

      hi: `मैंने **"${query}"** के संबंध में रेटिना-फ्यूजन 360 डेटाबेस में खोज की।

रेटिना-फ्यूजन 360 आयुष्मान भारत (ABDM) के लिए 11 नैदानिक चरणों में कार्य करने वाली एक स्वायत्त और व्याख्यात्मक AI प्रणाली है।

आप मुझसे इनके बारे में पूछ सकते हैं:
- **11 AI पाइपलाइन मॉड्यूल** (ऑप्टिक्स, प्रीप्रोसेसिंग, एनाटॉमी, घाव, ग्राफ, वर्गीकरण, XAI, साक्ष्य, ट्रस्ट गेट, देखभाल)
- **क्लिनिकल नियम** (ETDRS 4-2-1 नियम, ICDR पैमाना, शून्य फॉल्स नेगेटिव गारंटी)
- **भूमिका-आधारित डैशबोर्ड** (रोगी, आशा कार्यकर्ता, डॉक्टर, अस्पताल)
- **सिंगल-पेज रिपोर्ट और प्रिंटिंग** (आई हेल्थ कार्ड, प्रमाणपत्र, रेफरल पर्ची)
- **ABDM और ई-संजीवनी एकीकरण** (ABHA ID, टेली-नेत्र विज्ञान, FHIR R4)`
    };

    return {
      title: 'RetinaFusion 360 AI Assistant',
      category: 'General',
      response: fallbacks[language] || fallbacks.en,
      links: [
        { label: t.nav.imageAcquisition, path: '/acquisition' },
        { label: t.nav.diagnosticReports, path: '/reports' },
        { label: t.nav.myProfile, path: '/profile' }
      ]
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Realistic typing delay
    setTimeout(() => {
      const match = findAnswer(query);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: match.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: match.category,
        suggestedLinks: match.links
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'greeting',
        sender: 'assistant',
        text: GREETINGS[language] || GREETINGS.en,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: t.nav.overview,
        suggestedLinks: [
          { label: t.nav.imageAcquisition, path: '/acquisition' },
          { label: t.nav.diagnosticReports, path: '/reports' },
          { label: t.nav.myProfile, path: '/profile' }
        ]
      }
    ]);
  };

  const currentSuggestedQuestions = SUGGESTED_QUESTIONS_BY_LANG[language] || SUGGESTED_QUESTIONS_BY_LANG.en;

  return (
    <>
      {/* ─── FLOATING LAUNCHER BUTTON ─── */}
      <div className="fixed bottom-5 right-5 z-40 no-print flex flex-col items-end gap-2 select-none">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="relative group"
            >
              {/* Main Floating Button */}
              <button
                onClick={() => setIsOpen(true)}
                className="relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl bg-gradient-to-r from-[#124B3A] via-[#1A5C47] to-[#1F7A5A] text-white shadow-2xl hover:shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-[#E9A23B]/40 group"
                aria-label={`Open ${t.chatbot.name} Assistant`}
              >
                <div className="relative">
                  <Bot className="w-5 h-5 text-[#E9A23B]" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#E9A23B] animate-ping" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#E9A23B]" />
                </div>
                <div className="text-left hidden xs:block">
                  <span className="text-xs font-black tracking-wide block leading-none">
                    {t.chatbot.name}
                  </span>
                  <span className="text-[9px] text-[#A7F3D0] block mt-0.5 font-medium">
                    {t.chatbot.badge}
                  </span>
                </div>
                {hasUnread && (
                  <span className="w-2 h-2 rounded-full bg-[#E76F51] animate-pulse" />
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── INTERACTIVE CHAT MODAL / DRAWER ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6 no-print flex flex-col bg-[#FFFDF8] border-2 border-[#124B3A]/30 shadow-2xl rounded-3xl overflow-hidden transition-all duration-200 ${
              isExpanded
                ? 'w-[94vw] sm:w-[680px] h-[88vh] max-w-4xl'
                : 'w-[94vw] sm:w-[460px] h-[640px] max-h-[88vh]'
            }`}
          >
            {/* ─── HEADER ─── */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#124B3A] via-[#175442] to-[#1F7A5A] text-white flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#E9A23B] relative">
                  <Bot className="w-5 h-5" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#124B3A]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm tracking-tight">{t.chatbot.name}</h3>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#E9A23B] text-[#17221C] font-bold">
                      {t.chatbot.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/80">
                    {t.chatbot.subtitle}
                  </p>
                </div>
              </div>

              {/* Header Action Controls */}
              <div className="flex items-center gap-1.5">
                {/* Embedded Language Switcher */}
                <LanguageSelector variant="compact" />

                <button
                  onClick={handleResetChat}
                  title="Clear Chat History"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all text-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Restore Size' : 'Maximize'}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all text-xs hidden sm:block"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Assistant"
                  className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-all text-xs"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ─── MESSAGES SCROLL AREA ─── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8F6EF]/60">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-[#124B3A] text-[#E9A23B] flex items-center justify-center shrink-0 mt-1 shadow-xs font-bold text-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`relative max-w-[85%] rounded-2xl p-3.5 space-y-2 text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-[#124B3A] text-white rounded-tr-xs'
                        : 'bg-white text-[#17221C] border border-[#DDE5DC] rounded-tl-xs'
                    }`}
                  >
                    {/* Copy snippet button for bot messages */}
                    {msg.sender === 'assistant' && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        title="Copy message"
                        className="absolute top-2.5 right-2.5 text-[#65736B] hover:text-[#124B3A] p-1 rounded-md hover:bg-[#F8F6EF] transition-all"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-[#1F7A5A]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    {/* Category pill */}
                    {msg.category && msg.sender === 'assistant' && (
                      <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-[#1F7A5A]/10 text-[#1F7A5A] uppercase border border-[#1F7A5A]/20">
                        {msg.category}
                      </span>
                    )}

                    {/* Message Body */}
                    <div className="whitespace-pre-line font-sans">
                      {msg.text.split('\n').map((line, lIdx) => {
                        const boldParsed = line.replace(
                          /\*\*(.*?)\*\*/g,
                          '<strong>$1</strong>'
                        );
                        return (
                          <p
                            key={lIdx}
                            className="min-h-[1.2em]"
                            dangerouslySetInnerHTML={{ __html: boldParsed }}
                          />
                        );
                      })}
                    </div>

                    {/* Clickable Navigation Links */}
                    {msg.suggestedLinks && msg.suggestedLinks.length > 0 && (
                      <div className="pt-2 border-t border-[#DDE5DC] flex flex-wrap gap-1.5">
                        {msg.suggestedLinks.map((link, lIdx) => (
                          <button
                            key={lIdx}
                            onClick={() => {
                              navigate(link.path);
                              if (window.innerWidth < 640) setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#124B3A]/10 hover:bg-[#124B3A] text-[#124B3A] hover:text-white font-bold text-[10px] transition-all border border-[#124B3A]/20"
                          >
                            <span>{link.label}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    )}

                    <div
                      className={`text-[9px] text-right font-mono ${
                        msg.sender === 'user' ? 'text-white/60' : 'text-[#65736B]'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-[#E9A23B] text-[#17221C] flex items-center justify-center shrink-0 mt-1 shadow-xs font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-[#65736B] text-xs pl-1">
                  <div className="w-7 h-7 rounded-lg bg-[#124B3A] text-[#E9A23B] flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white border border-[#DDE5DC] flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A5A] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A5A] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A5A] animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ─── SUGGESTED PROMPT CHIPS ─── */}
            <div className="px-4 py-2 bg-[#FFFDF8] border-t border-[#DDE5DC] overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-bold text-[#65736B] uppercase shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#E9A23B]" />
                {t.chatbot.suggestedTitle}:
              </span>
              {currentSuggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#F8F6EF] hover:bg-[#124B3A] text-[#17221C] hover:text-white border border-[#DDE5DC] transition-all whitespace-nowrap shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* ─── INPUT COMPOSER ─── */}
            <div className="p-3.5 bg-white border-t border-[#DDE5DC] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t.chatbot.placeholder}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC] text-xs text-[#17221C] placeholder-[#65736B] focus:outline-none focus:ring-2 focus:ring-[#1F7A5A] focus:bg-white transition-all font-medium"
                />

                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2.5 rounded-xl bg-[#124B3A] hover:bg-[#1F7A5A] disabled:opacity-40 text-white transition-all shadow-md shrink-0"
                  aria-label="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center justify-between text-[10px] text-[#65736B] pt-2 px-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#1F7A5A]" />
                  ABDM & NPCBVI Verified AI Knowledge
                </span>
                <span>Press Enter to send</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
