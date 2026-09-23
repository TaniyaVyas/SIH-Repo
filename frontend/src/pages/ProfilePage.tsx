import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { printElement } from '../utils/printDocument';
import {
  User as UserIcon,
  ShieldCheck,
  Building2,
  Stethoscope,
  HeartPulse,
  LogOut,
  Printer,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  CheckCircle2,
  ExternalLink,
  Award,
  Clock,
  IdCard,
  LayoutDashboard,
  QrCode,
  ArrowRight,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-[#17221C]">No Active Profile Found</h2>
        <p className="text-xs text-[#65736B] mt-1 mb-4">Please log in to view your profile and credentials.</p>
        <Link
          to="/login"
          className="px-5 py-2.5 rounded-xl bg-[#124B3A] text-white text-xs font-bold hover:bg-[#1F7A5A]"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleTitleMap: Record<string, string> = {
    patient: 'Ayushman Patient Profile',
    'healthcare-worker': 'Frontline Health Worker Profile',
    doctor: 'Ophthalmic Specialist Profile',
    hospital: 'Institutional Health Centre Profile',
  };

  const handlePrint = () => {
    printElement('profile-credential-card', `${roleTitleMap[user.role] || 'Credential_Pass'}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto space-y-6 pb-16 px-4"
    >
      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-[#17221C] via-[#124B3A] to-[#1F7A5A] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#E9A23B]/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#E9A23B] to-[#d6902d] text-[#17221C] flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg border-2 border-white/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-white/15 text-[#E9A23B] border border-white/20">
                  {user.role.replace('-', ' ')}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/20 text-white font-bold">
                  {user.verificationStatus.toUpperCase()}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user.name}</h1>
              <p className="text-xs text-white/80 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
                <span>•</span>
                <Phone className="w-3.5 h-3.5" />
                <span>{user.mobile}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 no-print">
            <Link
              to={`/dashboard/${user.role}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-[#124B3A] text-xs font-bold hover:bg-[#F8F6EF] transition-all shadow-sm"
            >
              <LayoutDashboard className="w-4 h-4 text-[#1F7A5A]" />
              <span>Go to Dashboard</span>
            </Link>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-4 h-4 text-[#E9A23B]" />
              <span>Print Credential Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role-Specific Credential Card */}
      {user.role === 'patient' && (
        <div
          id="profile-credential-card"
          className="printable-sheet single-page-sheet bg-white rounded-3xl border border-[#DDE5DC] p-6 sm:p-8 shadow-sm space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE5DC] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#124B3A] text-white flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-[#E9A23B]" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#17221C]">
                  Ayushman Bharat Digital Health Card (AD-EHC)
                </h2>
                <p className="text-xs text-[#65736B]">
                  National Health Authority (NHA) • Personal Retinal Screening Registry
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1F7A5A]/15 text-[#1F7A5A]">
              ABDM Linked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">ABHA ID / Number</span>
              <strong className="font-mono text-sm text-[#124B3A]">
                {user.patientDetails?.abhaId || '91-8842-1920-5512'}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Age & Gender</span>
              <strong className="text-sm text-[#17221C]">
                {user.patientDetails?.age || 52} Years • {user.patientDetails?.gender || 'Female'}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Diabetes Classification</span>
              <strong className="text-sm text-[#E9A23B]">
                {user.patientDetails?.diabetesStatus || 'Type 2 Diabetes'} (
                {user.patientDetails?.diabetesDuration || '6 Years'})
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Primary Health Sub-Centre</span>
              <strong className="text-sm text-[#17221C]">
                Shirur Ayushman Arogya Mandir (Pune Dist)
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Last Screening Finding</span>
              <strong className="text-sm text-[#1F7A5A]">
                Grade 2 — Moderate NPDR (FAZ Clear)
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Next Follow-Up Interval</span>
              <strong className="text-sm text-[#124B3A]">6 Months (March 2027)</strong>
            </div>
          </div>
        </div>
      )}

      {user.role === 'healthcare-worker' && (
        <div
          id="profile-credential-card"
          className="printable-sheet single-page-sheet bg-white rounded-3xl border border-[#DDE5DC] p-6 sm:p-8 shadow-sm space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE5DC] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#124B3A] text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#E9A23B]" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#17221C]">
                  Ayushman Arogya Mandir (AAM) Field Officer Pass
                </h2>
                <p className="text-xs text-[#65736B]">
                  Government of India • Ministry of Health & Family Welfare
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1F7A5A]/15 text-[#1F7A5A]">
              Authorized Operator
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Employee / CHO ID</span>
              <strong className="font-mono text-sm text-[#124B3A]">
                {user.workerDetails?.employeeId || 'CHO-MH-PUN-0841'}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Designation</span>
              <strong className="text-sm text-[#17221C]">
                {user.workerDetails?.designation || 'Community Health Officer (CHO)'}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Assigned Health Centre</span>
              <strong className="text-sm text-[#17221C]">
                {user.workerDetails?.healthCenter || 'Shirur Primary Health Sub-Centre'}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">District & State</span>
              <strong className="text-sm text-[#17221C]">
                {user.workerDetails?.district || 'Pune District'},{' '}
                {user.workerDetails?.state || 'Maharashtra'}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Authorized Screening Kit</span>
              <strong className="text-sm text-[#124B3A]">
                Remidio NM-FOP Smart Fundus (RMD-8821)
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Screening Milestone</span>
              <strong className="text-sm text-[#1F7A5A]">342 Screenings Completed</strong>
            </div>
          </div>
        </div>
      )}

      {user.role === 'doctor' && (
        <div
          id="profile-credential-card"
          className="printable-sheet single-page-sheet bg-white rounded-3xl border border-[#DDE5DC] p-6 sm:p-8 shadow-sm space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE5DC] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#124B3A] text-white flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-[#E9A23B]" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#17221C]">
                  National Medical Commission (NMC) Tele-Practice Certificate
                </h2>
                <p className="text-xs text-[#65736B]">
                  Certified Specialist Workstation • Registered Tele-Ophthalmologist
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1F7A5A]/15 text-[#1F7A5A]">
              DSC Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Registration Number</span>
              <strong className="font-mono text-sm text-[#124B3A]">
                {user.doctorDetails?.registrationNumber || 'MCI-2012-08492'}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Specialization & Qualifications</span>
              <strong className="text-sm text-[#17221C]">
                {user.doctorDetails?.specialization || 'Retina & Vitreous Specialist'} •{' '}
                {user.doctorDetails?.qualification || 'MBBS, MS, FVRS'}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Affiliated Hospital</span>
              <strong className="text-sm text-[#17221C]">
                {user.doctorDetails?.hospital || 'Sankara Eye Centre & Research Institute'}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Experience & Jurisdiction</span>
              <strong className="text-sm text-[#17221C]">
                {user.doctorDetails?.yearsOfExperience || 14} Years • Maharashtra Medical Council
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Digital Signing Algorithm</span>
              <strong className="text-sm text-[#1F7A5A]">
                RSA 2048-bit Class 3 Health DSC
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Average Turnaround SLA</span>
              <strong className="text-sm text-[#124B3A]">42s / Case (&lt; 2h SLA Compliant)</strong>
            </div>
          </div>
        </div>
      )}

      {user.role === 'hospital' && (
        <div
          id="profile-credential-card"
          className="printable-sheet single-page-sheet bg-white rounded-3xl border border-[#DDE5DC] p-6 sm:p-8 shadow-sm space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE5DC] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#124B3A] text-white flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#E9A23B]" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#17221C]">
                  NHA Hospital Facility Registry (HFR) Certificate
                </h2>
                <p className="text-xs text-[#65736B]">
                  Ayushman Bharat Digital Mission • Institutional Command Node
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1F7A5A]/15 text-[#1F7A5A]">
              NHA Accredited
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Facility Registration ID</span>
              <strong className="font-mono text-sm text-[#124B3A]">
                {user.hospitalDetails?.registrationId || 'MH-DH-2021-9921'}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Institution Name</span>
              <strong className="text-sm text-[#17221C]">
                {user.hospitalDetails?.organizationName || 'District General Hospital Pune'}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Medical Superintendent</span>
              <strong className="text-sm text-[#17221C]">
                {user.hospitalDetails?.contactPerson || 'Dr. Sunita Kulkarni'}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">District & Address</span>
              <strong className="text-sm text-[#17221C]">
                {user.hospitalDetails?.address || 'Civil Lines, Station Road, Pune - 411001'}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Ophthalmic Bed Capacity</span>
              <strong className="text-sm text-[#124B3A]">50 Beds • 8 Laser Suites</strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6EF] border border-[#DDE5DC] space-y-1">
              <span className="text-[#65736B] block">Monthly Screening Volume</span>
              <strong className="text-sm text-[#1F7A5A]">1,420 Screenings / Month</strong>
            </div>
          </div>
        </div>
      )}

      {/* Account Security & Logout Section (Below Profile) */}
      <div className="bg-white rounded-3xl border border-[#DDE5DC] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h3 className="font-bold text-sm text-[#17221C]">Active Account Session</h3>
          <p className="text-xs text-[#65736B] mt-0.5">
            Logged in as <strong className="text-[#124B3A]">{user.email}</strong> • Role:{' '}
            <span className="font-semibold uppercase">{user.role}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#E76F51]/10 text-[#E76F51] border border-[#E76F51]/30 hover:bg-[#E76F51] hover:text-white text-xs font-bold transition-all shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Workstation</span>
        </button>
      </div>
    </motion.div>
  );
};
