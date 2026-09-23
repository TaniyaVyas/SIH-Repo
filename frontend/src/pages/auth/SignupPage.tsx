import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import {
  Building2,
  Stethoscope,
  HeartPulse,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  FileText,
  AlertCircle,
  MapPin,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { LanguageSelector } from '../../components/common/LanguageSelector';

export const SignupPage: React.FC = () => {
  const { signup, t } = useAuth();
  const navigate = useNavigate();

  // Active registration tab: strictly 3 roles
  const [activeRole, setActiveRole] = useState<'hospital' | 'doctor' | 'patient'>('hospital');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRegisteredSuccess, setIsRegisteredSuccess] = useState(false);

  // Password visibility states
  const [showHospitalPass, setShowHospitalPass] = useState(false);
  const [showDoctorPass, setShowDoctorPass] = useState(false);
  const [showPatientPass, setShowPatientPass] = useState(false);

  // Hospital Signup Form State (Section 4)
  const [hospitalForm, setHospitalForm] = useState({
    hospitalName: '',
    area: '',
    healthCenterName: '',
    officialEmail: '',
    password: '',
    confirmPassword: '',
    verificationDetails: '',
    termsAccepted: true,
    privacyAccepted: true,
  });

  // Doctor Signup Form State (Section 19)
  const [doctorForm, setDoctorForm] = useState({
    fullName: '',
    registrationNumber: '',
    qualification: 'MBBS, MS (Ophthalmology)',
    specialization: 'Vitreo-Retinal Specialist',
    hospitalClinic: '',
    cityDistrict: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationDocument: 'State_Medical_Council_Certificate.pdf',
    termsAccepted: true,
    privacyAccepted: true,
  });

  // Patient Signup Form State
  const [patientForm, setPatientForm] = useState({
    name: '',
    age: '48',
    gender: 'Female' as 'Female' | 'Male' | 'Other',
    mobile: '',
    email: '',
    village: '',
    diabetesStatus: 'Yes' as 'Yes' | 'No',
    password: '',
    confirmPassword: '',
    termsAccepted: true,
    privacyAccepted: true,
  });

  const handleHospitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!hospitalForm.hospitalName.trim() || !hospitalForm.officialEmail.trim() || !hospitalForm.password) {
      setErrorMsg('Please provide Hospital Name, Official Email, and Password.');
      return;
    }
    if (hospitalForm.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (hospitalForm.password !== hospitalForm.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        name: hospitalForm.hospitalName.trim(),
        email: hospitalForm.officialEmail.trim(),
        mobile: '+91 98220 99001',
        password: hospitalForm.password,
        confirmPassword: hospitalForm.confirmPassword,
        role: 'hospital',
        hospitalDetails: {
          hospitalName: hospitalForm.hospitalName.trim(),
          area: hospitalForm.area.trim(),
          healthCenterName: hospitalForm.healthCenterName.trim(),
          officialEmail: hospitalForm.officialEmail.trim(),
          verificationDetails: hospitalForm.verificationDetails.trim() || 'Pending State Health Registry Audit',
          organizationName: hospitalForm.hospitalName.trim(),
        },
        termsAccepted: hospitalForm.termsAccepted,
        privacyAccepted: hospitalForm.privacyAccepted,
      });

      setIsRegisteredSuccess(true);
      setTimeout(() => navigate('/dashboard/hospital', { replace: true }), 1400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Hospital registration failed.');
      setIsSubmitting(false);
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!doctorForm.fullName.trim() || !doctorForm.registrationNumber.trim() || !doctorForm.email.trim() || !doctorForm.password) {
      setErrorMsg('Please fill in Full Name, Medical Registration Number, Email, and Password.');
      return;
    }
    if (doctorForm.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (doctorForm.password !== doctorForm.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        name: doctorForm.fullName.trim(),
        email: doctorForm.email.trim(),
        mobile: '+91 98450 77889',
        password: doctorForm.password,
        confirmPassword: doctorForm.confirmPassword,
        role: 'doctor',
        doctorDetails: {
          fullName: doctorForm.fullName.trim(),
          registrationNumber: doctorForm.registrationNumber.trim(),
          qualification: doctorForm.qualification.trim(),
          specialization: doctorForm.specialization.trim(),
          hospital: doctorForm.hospitalClinic.trim(),
          hospitalClinic: doctorForm.hospitalClinic.trim(),
          city: doctorForm.cityDistrict.trim(),
          district: doctorForm.cityDistrict.trim(),
          cityDistrict: doctorForm.cityDistrict.trim(),
          verificationDocument: doctorForm.verificationDocument,
        },
        termsAccepted: doctorForm.termsAccepted,
        privacyAccepted: doctorForm.privacyAccepted,
      });

      setIsRegisteredSuccess(true);
      setTimeout(() => navigate('/dashboard/doctor', { replace: true }), 1400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Doctor registration failed.');
      setIsSubmitting(false);
    }
  };

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!patientForm.name.trim() || !patientForm.mobile.trim() || !patientForm.password) {
      setErrorMsg('Please fill in Name, Mobile, and Password.');
      return;
    }
    if (patientForm.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (patientForm.password !== patientForm.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        name: patientForm.name.trim(),
        email: patientForm.email.trim() || `${patientForm.mobile.replace(/\D/g, '')}@patient.retinafusion.ai`,
        mobile: patientForm.mobile.trim(),
        password: patientForm.password,
        confirmPassword: patientForm.confirmPassword,
        role: 'patient',
        patientDetails: {
          age: Number(patientForm.age) || 50,
          gender: patientForm.gender,
          village: patientForm.village.trim() || 'Rural Camp',
          diabetesStatus: patientForm.diabetesStatus,
          diabetesDuration: '3 Years',
        },
        termsAccepted: patientForm.termsAccepted,
        privacyAccepted: patientForm.privacyAccepted,
      });

      setIsRegisteredSuccess(true);
      setTimeout(() => navigate('/dashboard/patient', { replace: true }), 1400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Patient registration failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6EF] text-[#17221C] flex flex-col justify-between selection:bg-[#1F7A5A] selection:text-white">
      {/* Top Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[#DDE5DC] bg-white/85 backdrop-blur-md sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#124B3A] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            RF
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-wider text-[#124B3A] uppercase">
              RETINAFUSION 360
            </span>
            <span className="text-[10px] text-[#65736B]">Clinical Account Onboarding</span>
          </div>
        </Link>
        <LanguageSelector variant="pill" />
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl border border-[#DDE5DC] p-6 sm:p-10 shadow-xl">
          {/* Title & Role Tabs */}
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1F7A5A]">
              Role Registration
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#17221C] tracking-tight mt-1">
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-[#65736B] mt-1">
              Select your role in the rural tele-ophthalmology screening network.
            </p>

            {/* 3 Dedicated Role Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-6 p-1.5 bg-[#F8F6EF] rounded-2xl border border-[#DDE5DC]">
              <button
                type="button"
                onClick={() => {
                  setActiveRole('hospital');
                  setErrorMsg(null);
                }}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeRole === 'hospital'
                    ? 'bg-[#124B3A] text-white shadow-md'
                    : 'text-[#65736B] hover:text-[#17221C]'
                }`}
              >
                <Building2 size={16} />
                <span>Hospital / Health Center</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveRole('doctor');
                  setErrorMsg(null);
                }}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeRole === 'doctor'
                    ? 'bg-[#124B3A] text-white shadow-md'
                    : 'text-[#65736B] hover:text-[#17221C]'
                }`}
              >
                <Stethoscope size={16} />
                <span>Doctor / Ophthalmologist</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveRole('patient');
                  setErrorMsg(null);
                }}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeRole === 'patient'
                    ? 'bg-[#124B3A] text-white shadow-md'
                    : 'text-[#65736B] hover:text-[#17221C]'
                }`}
              >
                <HeartPulse size={16} />
                <span>Patient</span>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-[#E76F51]/10 border border-[#E76F51]/30 flex items-start gap-3 text-xs sm:text-sm text-[#E76F51]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {isRegisteredSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-[#1F7A5A]/10 border border-[#1F7A5A]/30 flex items-center gap-3 text-sm text-[#1F7A5A]">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>
                ✓ Account Created Successfully! Initializing your clinical dashboard...
              </span>
            </div>
          )}

          {/* Form 1: Hospital / Health Center (Section 4) */}
          {activeRole === 'hospital' && (
            <form onSubmit={handleHospitalSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#F8F6EF]/60 border border-[#DDE5DC] mb-4 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#124B3A]">
                  🏥 Dedicated Rural Health Center / Screening Account
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#E9A23B]/20 text-[#8A5612] font-mono font-bold">
                  Status: Pending Verification
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Hospital Name <span className="text-[#E76F51]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shirur Rural General Hospital"
                    value={hospitalForm.hospitalName}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, hospitalName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Area / Sector <span className="text-[#E76F51]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shirur Rural Sector"
                    value={hospitalForm.area}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, area: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Health Center Name <span className="text-[#E76F51]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Primary Health Sub-Centre 04"
                    value={hospitalForm.healthCenterName}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, healthCenterName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Official Hospital Email <span className="text-[#E76F51]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. healthcenter@retinafusion.ai"
                    value={hospitalForm.officialEmail}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, officialEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Password <span className="text-[#E76F51]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showHospitalPass ? 'text' : 'password'}
                      required
                      placeholder="Min 6 characters"
                      value={hospitalForm.password}
                      onChange={(e) => setHospitalForm({ ...hospitalForm, password: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowHospitalPass(!showHospitalPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#65736B] hover:text-[#124B3A]"
                    >
                      {showHospitalPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Confirm Password <span className="text-[#E76F51]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showHospitalPass ? 'text' : 'password'}
                      required
                      placeholder="Repeat password"
                      value={hospitalForm.confirmPassword}
                      onChange={(e) => setHospitalForm({ ...hospitalForm, confirmPassword: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowHospitalPass(!showHospitalPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#65736B] hover:text-[#124B3A]"
                    >
                      {showHospitalPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                  Verification Details <span className="text-[#65736B] font-normal">(Registration ID / License Ref)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ayushman Arogya Mandir Registration #MH-PHC-2024-8841"
                  value={hospitalForm.verificationDetails}
                  onChange={(e) => setHospitalForm({ ...hospitalForm, verificationDetails: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-[#65736B]">
                  Already registered?{' '}
                  <Link to="/login" className="text-[#1F7A5A] font-bold hover:underline">
                    Sign In here
                  </Link>
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-[#124B3A] hover:bg-[#1F7A5A] text-white text-sm font-bold transition-all shadow-md shadow-[#124B3A]/20 flex items-center gap-2 disabled:opacity-60"
                >
                  <span>Create Hospital Account</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* Form 2: Doctor / Ophthalmologist (Section 19) */}
          {activeRole === 'doctor' && (
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#F8F6EF]/60 border border-[#DDE5DC] mb-4 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#124B3A]">
                  🩺 Tele-Ophthalmologist Verification Account
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#E9A23B]/20 text-[#8A5612] font-mono font-bold">
                  Status: Pending Verification
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Full Name <span className="text-[#E76F51]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Arvind Natarajan"
                    value={doctorForm.fullName}
                    onChange={(e) => setDoctorForm({ ...doctorForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Medical Registration Number <span className="text-[#E76F51]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MCI-2012-08492"
                    value={doctorForm.registrationNumber}
                    onChange={(e) => setDoctorForm({ ...doctorForm, registrationNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Qualification <span className="text-[#E76F51]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MBBS, MS (Ophthalmology), DNB, FVR"
                    value={doctorForm.qualification}
                    onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Specialization <span className="text-[#E76F51]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vitreo-Retinal Specialist"
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Hospital / Clinic <span className="text-[#E76F51]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. District Hospital Pune"
                    value={doctorForm.hospitalClinic}
                    onChange={(e) => setDoctorForm({ ...doctorForm, hospitalClinic: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    City / District <span className="text-[#E76F51]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune District"
                    value={doctorForm.cityDistrict}
                    onChange={(e) => setDoctorForm({ ...doctorForm, cityDistrict: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Email <span className="text-[#E76F51]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. doctor@retinafusion.ai"
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Verification Document <span className="text-[#65736B] font-normal">(Uploaded)</span>
                  </label>
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm text-[#124B3A]">
                    <FileText size={15} className="text-[#1F7A5A]" />
                    <span className="truncate">{doctorForm.verificationDocument}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Password <span className="text-[#E76F51]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showDoctorPass ? 'text' : 'password'}
                      required
                      placeholder="Min 6 characters"
                      value={doctorForm.password}
                      onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDoctorPass(!showDoctorPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#65736B] hover:text-[#124B3A]"
                    >
                      {showDoctorPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Confirm Password <span className="text-[#E76F51]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showDoctorPass ? 'text' : 'password'}
                      required
                      placeholder="Repeat password"
                      value={doctorForm.confirmPassword}
                      onChange={(e) => setDoctorForm({ ...doctorForm, confirmPassword: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDoctorPass(!showDoctorPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#65736B] hover:text-[#124B3A]"
                    >
                      {showDoctorPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-[#65736B]">
                  Already registered?{' '}
                  <Link to="/login" className="text-[#1F7A5A] font-bold hover:underline">
                    Sign In here
                  </Link>
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-[#124B3A] hover:bg-[#1F7A5A] text-white text-sm font-bold transition-all shadow-md shadow-[#124B3A]/20 flex items-center gap-2 disabled:opacity-60"
                >
                  <span>Create Doctor Account</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* Form 3: Patient */}
          {activeRole === 'patient' && (
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#F8F6EF]/60 border border-[#DDE5DC] mb-4 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#124B3A]">
                  👤 Patient Personal Eye Health Record
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#1F7A5A]/20 text-[#124B3A] font-mono font-bold">
                  Status: Instant Access
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Full Name <span className="text-[#E76F51]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={patientForm.name}
                    onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Age <span className="text-[#E76F51]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="52"
                    value={patientForm.age}
                    onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Mobile Number <span className="text-[#E76F51]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98231 45678"
                    value={patientForm.mobile}
                    onChange={(e) => setPatientForm({ ...patientForm, mobile: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Village Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Example Village"
                    value={patientForm.village}
                    onChange={(e) => setPatientForm({ ...patientForm, village: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Diabetes Status
                  </label>
                  <select
                    value={patientForm.diabetesStatus}
                    onChange={(e) => setPatientForm({ ...patientForm, diabetesStatus: e.target.value as 'Yes' | 'No' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                  >
                    <option value="Yes">Yes (Diabetic)</option>
                    <option value="No">No (Non-Diabetic)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Email Address <span className="text-[#65736B] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh.patel@gmail.com"
                    value={patientForm.email}
                    onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Password <span className="text-[#E76F51]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPatientPass ? 'text' : 'password'}
                      required
                      placeholder="Min 6 characters"
                      value={patientForm.password}
                      onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPatientPass(!showPatientPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#65736B] hover:text-[#124B3A]"
                    >
                      {showPatientPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                    Confirm Password <span className="text-[#E76F51]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPatientPass ? 'text' : 'password'}
                      required
                      placeholder="Repeat password"
                      value={patientForm.confirmPassword}
                      onChange={(e) => setPatientForm({ ...patientForm, confirmPassword: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#FAF4ED]/50 text-sm focus:border-[#1F7A5A] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPatientPass(!showPatientPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#65736B] hover:text-[#124B3A]"
                    >
                      {showPatientPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-[#65736B]">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#1F7A5A] font-bold hover:underline">
                    Sign In here
                  </Link>
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-[#124B3A] hover:bg-[#1F7A5A] text-white text-sm font-bold transition-all shadow-md shadow-[#124B3A]/20 flex items-center gap-2 disabled:opacity-60"
                >
                  <span>Create Patient Account</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};
