import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { UserRole, LanguageCode } from '../../types/auth';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Wifi,
  WifiOff,
  UserCheck,
  Stethoscope,
  Building2,
  HeartPulse,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { LanguageSelector } from '../../components/common/LanguageSelector';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo, language, setLanguage, networkStatus, toggleNetworkStatus, t } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Read possible redirect state (e.g. from Signup, Password Reset, or Protected Route)
  const stateIdentifier = (location.state as any)?.identifier || (location.state as any)?.email || '';
  const stateRole = (location.state as any)?.role as UserRole | undefined;
  const stateMessage = (location.state as any)?.message as string | undefined;

  const [selectedRole, setSelectedRole] = useState<UserRole>(stateRole || 'patient');
  const [email, setEmail] = useState(stateIdentifier);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(stateMessage || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authStageText, setAuthStageText] = useState<string>('');

  // Destination after login
  const from = (location.state as any)?.from?.pathname;

  // Auto-fill demo credentials for current tab
  const fillDemoCredentials = (role: UserRole) => {
    setSelectedRole(role);
    setAuthError(null);
    if (role === 'hospital') {
      setEmail('hospital@retinafusion.ai');
      setPassword('hospital123');
    } else if (role === 'doctor') {
      setEmail('doctor@retinafusion.ai');
      setPassword('doctor123');
    } else {
      setEmail('patient@retinafusion.ai');
      setPassword('patient123');
    }
  };

  const handleSuccessfulAuth = (role: UserRole) => {
    if (from && from !== '/login') {
      navigate(from, { replace: true });
    } else {
      navigate(`/dashboard/${role}`, { replace: true });
    }
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (authError) setAuthError(null);
    const lower = val.toLowerCase();
    if (lower.includes('hospital') || lower.includes('hsp') || lower.includes('clinic')) {
      setSelectedRole('hospital');
    } else if (lower.includes('doctor') || lower.includes('dr.') || lower.includes('doc')) {
      setSelectedRole('doctor');
    } else if (lower.includes('patient') || lower.includes('pat')) {
      setSelectedRole('patient');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email.trim() || !password) {
      setAuthError('Please provide both username/email/mobile and password.');
      return;
    }

    setIsSubmitting(true);
    setAuthStageText(`Verifying credentials...`);

    try {
      setTimeout(() => setAuthStageText('Validating Clinical Identity & Role...'), 250);
      setTimeout(() => setAuthStageText('Authorizing Workstation Access...'), 500);

      const authenticatedUser = await login({
        email: email.trim(),
        identifier: email.trim(),
        password,
        role: selectedRole,
      });
      setSelectedRole(authenticatedUser.role);
      handleSuccessfulAuth(authenticatedUser.role);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setSelectedRole(role);
    setAuthError(null);
    setIsSubmitting(true);
    setAuthStageText(`Authenticating as Demo ${role.replace('-', ' ').toUpperCase()}...`);

    try {
      const authenticatedUser = await loginAsDemo(role);
      handleSuccessfulAuth(authenticatedUser.role);
    } catch (err: any) {
      setAuthError(err.message || 'Demo sign-in failed.');
      setIsSubmitting(false);
    }
  };

  const isEmailValid = email.includes('@') && email.length > 5;
  const isPasswordValid = password.length >= 6;

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-[#F8F6EF] text-[#17221C] flex flex-col justify-between selection:bg-[#1F7A5A] selection:text-white">
      {/* Top Utility Bar: Language & Network State */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full px-6 py-4 flex items-center justify-between border-b border-[#DDE5DC] bg-white/85 backdrop-blur-md sticky top-0 z-30"
      >
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#124B3A] flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
            RF
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-wider text-[#124B3A] uppercase">
              RETINAFUSION 360
            </span>
            <span className="text-[10px] text-[#65736B] tracking-tight">
              Clinical Identity & Role Gateway
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Network State Prototype Toggle */}
          <button
            onClick={toggleNetworkStatus}
            type="button"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              networkStatus === 'online'
                ? 'bg-[#1F7A5A]/10 text-[#1F7A5A] border-[#1F7A5A]/30 hover:bg-[#1F7A5A]/20'
                : 'bg-[#E76F51]/10 text-[#E76F51] border-[#E76F51]/30 hover:bg-[#E76F51]/20'
            }`}
            title="Toggle Online/Offline prototype simulation"
          >
            {networkStatus === 'online' ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.common.online}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.common.offline}</span>
              </>
            )}
          </button>

          {/* Trilingual Selector */}
          <LanguageSelector variant="pill" className="hidden sm:inline-flex" />
          <LanguageSelector variant="compact" className="sm:hidden" />
        </div>
      </motion.header>

      {/* Main Split Authentication Screen */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <motion.div
          initial={{ y: 16, opacity: 0, scale: 0.99 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-[#DDE5DC] shadow-2xl overflow-hidden min-h-[640px]"
        >
          {/* Left Panel: Calibrated Retinal Visualization & Clinical Branding */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#124B3A] via-[#17221C] to-[#0D1510] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Ambient Optical Glows (Emerald & Amber / Warm Saffron only - ZERO BLUE) */}
            <motion.div
              animate={{ opacity: [0.25, 0.4, 0.25], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#1F7A5A]/35 blur-3xl pointer-events-none"
            />
            <motion.div
              animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.08, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#E9A23B]/25 blur-3xl pointer-events-none"
            />

            {/* Top Brand Banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-[#E9A23B] backdrop-blur-md mb-6">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1F7A5A]" />
                <span>NABL & ISO-13485 Clinical Security</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                Zero-Trust Retinal AI Workstation
              </h1>
              <p className="text-xs sm:text-sm text-white/75 mt-2 leading-relaxed">
                Empowering frontline screening, automated ICDR grading, and seamless tertiary eye care referral across 4 clinical roles.
              </p>
            </motion.div>

            {/* Dynamic Animated Retinal Canvas with Vessel Drawing */}
            <div className="relative z-10 my-6 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.25 }}
                className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full border-2 border-white/20 bg-gradient-to-tr from-[#3b0f0a] via-[#5c1c11] to-[#240603] flex items-center justify-center shadow-2xl overflow-hidden"
              >
                {/* SVG Retinal Vessels Drawing in Real-Time */}
                <svg
                  viewBox="0 0 300 300"
                  className="w-full h-full absolute inset-0 pointer-events-none"
                >
                  <defs>
                    <radialGradient id="discGlow" cx="40%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFF8EC" stopOpacity="0.95" />
                      <stop offset="35%" stopColor="#F7C978" stopOpacity="0.8" />
                      <stop offset="75%" stopColor="#E9A23B" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#B8731E" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="foveaGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#100302" stopOpacity="0.9" />
                      <stop offset="70%" stopColor="#2e0a05" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#4a160c" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Optic Disc Center */}
                  <circle cx="105" cy="150" r="26" fill="url(#discGlow)" />
                  <circle cx="105" cy="150" r="14" fill="#FFFDF8" opacity="0.85" />

                  {/* Macular Fovea Center */}
                  <circle cx="195" cy="152" r="20" fill="url(#foveaGlow)" />

                  {/* Upper Temporal Vascular Arcade (Drawn with SVG animation) */}
                  <motion.path
                    d="M 105 145 C 112 105, 145 68, 205 62 C 235 59, 265 72, 288 95"
                    fill="none"
                    stroke="#E76F51"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.9 }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                  />
                  <motion.path
                    d="M 155 82 C 170 65, 195 55, 220 50"
                    fill="none"
                    stroke="#E9A23B"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.55 }}
                  />

                  {/* Lower Temporal Vascular Arcade */}
                  <motion.path
                    d="M 105 155 C 112 195, 145 232, 205 238 C 235 241, 265 228, 288 205"
                    fill="none"
                    stroke="#E76F51"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.9 }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.35 }}
                  />
                  <motion.path
                    d="M 155 218 C 170 235, 195 245, 220 250"
                    fill="none"
                    stroke="#E9A23B"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.6 }}
                  />

                  {/* Nasal Arcades */}
                  <motion.path
                    d="M 95 142 C 75 115, 45 95, 12 88"
                    fill="none"
                    stroke="#E76F51"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.85 }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.4 }}
                  />
                  <motion.path
                    d="M 95 158 C 75 185, 45 205, 12 212"
                    fill="none"
                    stroke="#E76F51"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.85 }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.45 }}
                  />

                  {/* Microvascular capillary bed towards fovea */}
                  <motion.path
                    d="M 120 149 Q 155 150, 185 151"
                    fill="none"
                    stroke="#F8F6EF"
                    strokeWidth="1.2"
                    strokeDasharray="2 3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  />
                </svg>

                {/* Pulsing Calibration Ring */}
                <motion.div
                  animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-40 h-40 rounded-full border border-[#E9A23B]/40 pointer-events-none"
                />

                {/* Laser Sweep Scan Effect */}
                <motion.div
                  animate={{ y: [-120, 120, -120] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-[#1F7A5A] to-transparent pointer-events-none opacity-60"
                />

                {/* Crosshair reticle */}
                <div className="absolute inset-0 border border-white/10 rounded-full" />
                <div className="absolute w-full h-[1px] bg-white/15" />
                <div className="absolute h-full w-[1px] bg-white/15" />

                <div className="absolute bottom-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] text-[#F8F6EF] font-mono tracking-wider">
                  VESSELS: TRACED • CLAHE ON
                </div>
              </motion.div>
            </div>

            {/* Bottom Clinical Metric Pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="relative z-10 grid grid-cols-2 gap-3 pt-4 border-t border-white/15 text-left"
            >
              <div>
                <span className="text-[11px] text-white/60 block">Screening Speed</span>
                <span className="text-sm font-bold text-white">&lt; 3.2 Seconds</span>
              </div>
              <div>
                <span className="text-[11px] text-white/60 block">Clinical Accuracy</span>
                <span className="text-sm font-bold text-[#E9A23B]">98.7% AUROC</span>
              </div>
            </motion.div>
          </div>

          {/* Right Panel: Medical Sign-In Form & Role Demos */}
          <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-between">
            <motion.div variants={containerVariants} initial="hidden" animate="show">
              {/* Header Title */}
              <motion.div variants={itemVariants} className="mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-[#1F7A5A]">
                  Secure Authentication
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#17221C] tracking-tight mt-1">
                  {t.auth.signInTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#65736B] mt-1">
                  Enter your clinical credentials or launch an instant role demo.
                </p>
              </motion.div>

              {/* Redirect Notice if user attempted to access protected module */}
              {from && (
                <div className="mb-5 p-3.5 rounded-2xl bg-[#E9A23B]/15 border border-[#E9A23B]/40 text-[#17221C] text-xs flex items-center gap-2.5 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-[#A6680C] shrink-0" />
                  <span>
                    <strong>Login Required:</strong> Please sign in or create an account to access the screening modules.
                  </span>
                </div>
              )}

              {/* Success Notification if redirected from reset or signup */}
              <AnimatePresence>
                {successNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mb-5 p-4 rounded-2xl bg-[#1F7A5A]/10 border border-[#1F7A5A]/30 flex items-start justify-between gap-3 text-xs sm:text-sm text-[#1F7A5A]"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1F7A5A]" />
                      <span>{successNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSuccessNotice(null)}
                      className="text-[#65736B] hover:text-[#17221C] text-xs font-bold"
                    >
                      ✕
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Alert with Coral Subtle Shake */}
              <AnimatePresence mode="wait">
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      x: [-4, 4, -3, 3, -1, 1, 0],
                    }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.4 }}
                    className="mb-6 p-4 rounded-2xl bg-[#E76F51]/10 border border-[#E76F51]/30 flex items-start gap-3 text-sm text-[#E76F51]"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-xs uppercase tracking-wide">
                        Authentication Required
                      </span>
                      <span className="text-xs">{authError}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Role Selection for Sign-In (Strict 3-Role System) */}
              <motion.div variants={itemVariants} className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C]">
                    Select Role to Sign In
                  </label>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials(selectedRole)}
                    className="text-[11px] font-bold text-[#1F7A5A] hover:text-[#124B3A] flex items-center gap-1 hover:underline"
                    title="Auto-fill verified credentials into the form"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E9A23B]" />
                    <span>Quick-Fill Demo</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { role: 'hospital' as UserRole, label: 'Hospital / Health Center', sub: 'Rural Center / Screening', icon: Building2 },
                    { role: 'doctor' as UserRole, label: 'Doctor / Ophthalmologist', sub: 'Verification & Review', icon: Stethoscope },
                    { role: 'patient' as UserRole, label: 'Patient', sub: 'Report & Care Plan', icon: HeartPulse },
                  ].map((r) => {
                    const isSelected = selectedRole === r.role;
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => {
                          setSelectedRole(r.role);
                          if (authError) setAuthError(null);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#1F7A5A] bg-[#1F7A5A]/10 text-[#124B3A] font-bold shadow-xs'
                            : 'border-[#DDE5DC] bg-[#F8F6EF]/60 text-[#65736B] hover:bg-[#FAF4ED]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#1F7A5A]' : 'text-[#65736B]'}`} />
                          <span className="text-xs font-bold truncate">{r.label}</span>
                        </div>
                        <span className="text-[10px] text-[#65736B] block pl-6">{r.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Login Form Fields */}
              <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1.5">
                    {selectedRole === 'hospital'
                      ? 'Official Hospital Email'
                      : selectedRole === 'doctor'
                      ? 'Doctor Email / Registration ID'
                      : 'Registered Mobile Number or Email'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#65736B]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder={
                        selectedRole === 'hospital'
                          ? 'e.g. hospital@retinafusion.ai'
                          : selectedRole === 'doctor'
                          ? 'e.g. doctor@retinafusion.ai'
                          : 'e.g. patient@retinafusion.ai or +91 98231 45678'
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDE5DC] focus:border-[#1F7A5A] focus:ring-1 focus:ring-[#1F7A5A] outline-none text-sm transition-all bg-[#FAF4ED]/50"
                      required
                    />
                    {isEmailValid && (
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#1F7A5A]">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C]">
                      {t.auth.password}
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-[#1F7A5A] hover:underline"
                    >
                      {t.auth.forgotPassword}
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#65736B]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-[#DDE5DC] focus:border-[#1F7A5A] focus:ring-1 focus:ring-[#1F7A5A] outline-none text-sm transition-all bg-[#FAF4ED]/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#65736B] hover:text-[#124B3A] transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#124B3A] text-white text-sm font-bold hover:bg-[#1F7A5A] transition-all shadow-md shadow-[#124B3A]/20 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>{authStageText || 'Authenticating...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{selectedRole === 'hospital' ? 'Login to Health Center' : t.auth.signIn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </motion.form>

              {/* Instant 1-Click Role Demonstrators (Exact 3 Roles) */}
              <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-[#DDE5DC]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#124B3A] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E9A23B]" />
                    <span>Quick Demo Sign-In</span>
                  </span>
                  <span className="text-[11px] text-[#65736B]">1-Click SIH Presentation Access</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <motion.button
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDemoLogin('hospital')}
                    disabled={isSubmitting}
                    className="p-3 rounded-xl border border-[#DDE5DC] bg-[#F8F6EF]/80 hover:bg-[#1F7A5A]/10 hover:border-[#1F7A5A] transition-all text-left flex flex-col justify-between group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Building2 className="w-4 h-4 text-[#1F7A5A] group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-[#17221C]">Hospital / Health Center</span>
                    </div>
                    <span className="text-[11px] text-[#124B3A] font-semibold">Shirur Health Center</span>
                    <span className="text-[10px] text-[#65736B]">Screening & Patient Reg</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDemoLogin('doctor')}
                    disabled={isSubmitting}
                    className="p-3 rounded-xl border border-[#DDE5DC] bg-[#F8F6EF]/80 hover:bg-[#124B3A]/10 hover:border-[#124B3A] transition-all text-left flex flex-col justify-between group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Stethoscope className="w-4 h-4 text-[#124B3A] group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-[#17221C]">Doctor / Ophthalmologist</span>
                    </div>
                    <span className="text-[11px] text-[#124B3A] font-semibold">Dr. Arvind Natarajan</span>
                    <span className="text-[10px] text-[#65736B]">Verification & Feedback</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDemoLogin('patient')}
                    disabled={isSubmitting}
                    className="p-3 rounded-xl border border-[#DDE5DC] bg-[#F8F6EF]/80 hover:bg-[#E9A23B]/15 hover:border-[#E9A23B] transition-all text-left flex flex-col justify-between group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <HeartPulse className="w-4 h-4 text-[#E9A23B] group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-[#17221C]">Patient</span>
                    </div>
                    <span className="text-[11px] text-[#124B3A] font-semibold">Ramesh Patel</span>
                    <span className="text-[10px] text-[#65736B]">Voice Report & Care Plan</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>

            {/* Bottom Footer / Signup Redirect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="mt-8 pt-6 border-t border-[#DDE5DC] flex items-center justify-between text-xs text-[#65736B]"
            >
              <span>Don't have an account yet?</span>
              <Link
                to="/signup"
                className="font-bold text-[#1F7A5A] hover:text-[#124B3A] flex items-center gap-1"
              >
                <span>{t.auth.createAccount}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Security Footer */}
      <footer className="w-full text-center py-4 text-xs text-[#65736B] border-t border-[#DDE5DC] bg-white/60">
        RETINAFUSION 360 Diagnostic Platform • Tele-ophthalmology Protocol ISO/DIS 13485 & HIPAA Compliant
      </footer>
    </div>
  );
};
