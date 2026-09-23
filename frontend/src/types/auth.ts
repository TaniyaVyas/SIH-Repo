export type UserRole = 'hospital' | 'doctor' | 'patient' | 'healthcare-worker';

export type VerificationStatus = 'pending' | 'verified' | 'unverified';

export type NetworkState = 'online' | 'offline' | 'syncing';

export type LanguageCode = 'en' | 'gu' | 'hi';

export interface PatientProfile {
  dateOfBirth?: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  village?: string;
  talukaBlock?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  bloodGroup?: string;
  diabetesStatus: 'Yes' | 'No' | 'Type 1' | 'Type 2' | 'Not diagnosed' | 'Unknown';
  diabetesDuration?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  languagePreference?: LanguageCode;
  previousEyeExam?: string;
  knownEyeCondition?: string;
  abhaId?: string;
}

export interface HealthcareWorkerProfile {
  healthCenter: string;
  district: string;
  state: string;
  employeeId: string;
  designation: string;
}

export interface DoctorProfile {
  fullName?: string;
  registrationNumber: string;
  qualification: string;
  specialization: string;
  hospital: string;
  hospitalClinic?: string;
  city: string;
  district: string;
  cityDistrict?: string;
  yearsOfExperience?: number;
  verificationDocumentName?: string;
  verificationDocument?: string;
}

export interface HospitalProfile {
  hospitalName: string;
  area: string;
  healthCenterName: string;
  officialEmail: string;
  verificationDetails: string;
  // Backward compatibility fields
  organizationName?: string;
  organizationType?: string;
  registrationId?: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  district?: string;
  state?: string;
  verificationDocumentName?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  avatar?: string;
  verificationStatus: VerificationStatus;
  createdAt: string;
  patientDetails?: PatientProfile;
  workerDetails?: HealthcareWorkerProfile;
  doctorDetails?: DoctorProfile;
  hospitalDetails?: HospitalProfile;
  password?: string;
}

export interface AuthCredentials {
  identifier?: string; // Email or Mobile
  email?: string;
  password: string;
  role?: UserRole;
  rememberMe?: boolean;
}

export interface SignupFormData {
  // Common Account Fields
  name: string;
  mobile: string;
  email: string;
  password: string;
  confirmPassword: string;

  // Primary Role
  role: UserRole;

  // Role-Specific Profile Details
  patientDetails?: PatientProfile;
  workerDetails?: HealthcareWorkerProfile;
  doctorDetails?: DoctorProfile;
  hospitalDetails?: HospitalProfile;

  // Consent & Verification
  consentGiven?: boolean;
  dataSharingAgreed?: boolean;
  medicalConsent?: boolean;
  aiAdvisoryAcknowledged?: boolean;
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
}

