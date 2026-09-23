import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LoadingScreen } from './components/LoadingScreen';
import { RetinaProvider } from './context/RetinaContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Page Views
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';

// Authentication Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyAccountPage } from './pages/auth/VerifyAccountPage';

// Role-Based Clinical Dashboards
import { PatientDashboard } from './pages/dashboards/PatientDashboard';
import { HealthcareWorkerDashboard } from './pages/dashboards/HealthcareWorkerDashboard';
import { DoctorDashboard } from './pages/dashboards/DoctorDashboard';
import { HospitalDashboard } from './pages/dashboards/HospitalDashboard';

// 11 Core AI Modules (Dedicated Pages)
import { AcquisitionPage } from './pages/AcquisitionPage';
import { PreprocessingPage } from './pages/PreprocessingPage';
import { AnatomyPage } from './pages/AnatomyPage';
import { LesionsPage } from './pages/LesionsPage';
import { RetinalGraphPage } from './pages/RetinalGraphPage';
import { ClassificationPage } from './pages/ClassificationPage';
import { ExplainabilityPage } from './pages/ExplainabilityPage';
import { EvidencePage } from './pages/EvidencePage';
import { SelfAwarePage } from './pages/SelfAwarePage';
import { TrustPage } from './pages/TrustPage';
import { CarePage } from './pages/CarePage';
import { ReportsPage } from './pages/ReportsPage';

// System Architecture Pages
import { DatasetsPage } from './pages/DatasetsPage';
import { InfrastructurePage } from './pages/InfrastructurePage';
import { LearningPage } from './pages/LearningPage';
import { ImpactPage } from './pages/ImpactPage';

import { PatientWorkflowProvider } from './context/PatientWorkflowContext';

// Dynamic role router for /workspace or /dashboard/role
const DynamicRoleRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  const targetRole = user.role === 'healthcare-worker' ? 'hospital' : user.role;
  return <Navigate to={`/dashboard/${targetRole}`} replace />;
};

export const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <BrowserRouter>
      <AuthProvider>
        <RetinaProvider>
          <PatientWorkflowProvider>
            {/* Biometric Iris Calibration Boot Sequence */}
            {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

            <AppShell isLoading={isLoading}>
            <Routes>
              {/* Overview Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/workspace" element={<DynamicRoleRedirect />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signin" element={<Navigate to="/login" replace />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/register" element={<Navigate to="/signup" replace />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/verify-account" element={<VerifyAccountPage />} />

              {/* Protected Role-Based Dashboards */}
              <Route
                path="/dashboard/patient"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/healthcare-worker"
                element={<Navigate to="/dashboard/hospital" replace />}
              />
              <Route
                path="/dashboard/doctor"
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/hospital"
                element={
                  <ProtectedRoute allowedRoles={['hospital', 'healthcare-worker']}>
                    <HospitalDashboard />
                  </ProtectedRoute>
                }
              />

              {/* 11 Individual Module Routes - Protected (Login/Signup Required) */}
              <Route
                path="/acquisition"
                element={
                  <ProtectedRoute>
                    <AcquisitionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/preprocessing"
                element={
                  <ProtectedRoute>
                    <PreprocessingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/anatomy"
                element={
                  <ProtectedRoute>
                    <AnatomyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lesions"
                element={
                  <ProtectedRoute>
                    <LesionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/retinal-graph"
                element={
                  <ProtectedRoute>
                    <RetinalGraphPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/classification"
                element={
                  <ProtectedRoute>
                    <ClassificationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/explainability"
                element={
                  <ProtectedRoute>
                    <ExplainabilityPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evidence"
                element={
                  <ProtectedRoute>
                    <EvidencePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/self-aware"
                element={
                  <ProtectedRoute>
                    <SelfAwarePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trust"
                element={
                  <ProtectedRoute>
                    <TrustPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/care"
                element={
                  <ProtectedRoute>
                    <CarePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />

              {/* System Architecture Routes - Protected */}
              <Route
                path="/datasets"
                element={
                  <ProtectedRoute>
                    <DatasetsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/infrastructure"
                element={
                  <ProtectedRoute>
                    <InfrastructurePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/integrations"
                element={<Navigate to="/care" replace />}
              />
              <Route
                path="/learning"
                element={
                  <ProtectedRoute>
                    <LearningPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feedback"
                element={
                  <ProtectedRoute>
                    <LearningPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/impact"
                element={
                  <ProtectedRoute>
                    <ImpactPage />
                  </ProtectedRoute>
                }
              />

              {/* Route Aliases for 11 Module Workstations */}
              <Route path="/modules/image-acquisition" element={<Navigate to="/acquisition" replace />} />
              <Route path="/modules/quality-assessment" element={<Navigate to="/preprocessing" replace />} />
              <Route path="/modules/dual-enhancement" element={<Navigate to="/preprocessing" replace />} />
              <Route path="/modules/anatomical-segmentation" element={<Navigate to="/anatomy" replace />} />
              <Route path="/modules/lesion-detection" element={<Navigate to="/lesions" replace />} />
              <Route path="/modules/relational-reasoning" element={<Navigate to="/retinal-graph" replace />} />
              <Route path="/modules/classification" element={<Navigate to="/classification" replace />} />
              <Route path="/modules/explainable-ai" element={<Navigate to="/explainability" replace />} />
              <Route path="/modules/self-aware-ai" element={<Navigate to="/self-aware" replace />} />
              <Route path="/modules/smart-triage" element={<Navigate to="/trust" replace />} />
              <Route path="/modules/care-coordination" element={<Navigate to="/care" replace />} />

              {/* Legacy Route Aliases & Quick Redirects */}
              <Route path="/graph" element={<Navigate to="/retinal-graph" replace />} />
              <Route path="/quality" element={<Navigate to="/preprocessing" replace />} />
              <Route path="/selfaware" element={<Navigate to="/self-aware" replace />} />
              <Route path="/xai" element={<Navigate to="/explainability" replace />} />
              <Route path="/referral" element={<Navigate to="/care" replace />} />
              <Route path="/triage" element={<Navigate to="/trust" replace />} />
              <Route path="/audit" element={<Navigate to="/reports" replace />} />
              <Route path="/report" element={<Navigate to="/reports" replace />} />
              <Route path="/cockpit" element={<Navigate to="/dashboard" replace />} />

              {/* Catch-all fallback to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
          </PatientWorkflowProvider>
        </RetinaProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
