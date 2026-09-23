import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Play,
  ChevronRight,
  RotateCcw,
  LogIn,
  LogOut,
  ChevronDown,
  User as UserIcon,
  LayoutDashboard,
  Building2,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';
import { TopBrandHeader } from './TopBrandHeader';
import { useRetinaData } from '../../context/RetinaContext';
import { useAuth } from '../../context/AuthContext';
import { LanguageSelector } from '../common/LanguageSelector';

interface TopStatusBarProps {
  onOpenMobileSidebar: () => void;
  onLaunchDemoModal: () => void;
  activePatient?: string;
  onChangePatient?: (patientId: string) => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  onOpenMobileSidebar,
  onLaunchDemoModal,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeImage, imageMetadata, imageSource, isProcessingPipeline, runSequentialPipeline } = useRetinaData();
  const { user, isAuthenticated, loginAsDemo, logout, t } = useAuth();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Determine current page title and category using current active language
  const getTranslatedTitleAndGroup = () => {
    const p = location.pathname;
    if (p === '/' || p === '/home') return { title: t.nav.home, group: t.nav.overview, badge: 'M1' };
    if (p === '/dashboard') return { title: t.nav.dashboard, group: t.nav.overview, badge: 'LIVE' };
    if (p === '/acquisition') return { title: t.nav.imageAcquisition, group: t.nav.screeningPipeline, badge: 'M1' };
    if (p === '/preprocessing') return { title: t.nav.preprocessing, group: t.nav.screeningPipeline, badge: 'M2' };
    if (p === '/anatomy') return { title: t.nav.retinalAnatomy, group: t.nav.screeningPipeline, badge: 'M3' };
    if (p === '/lesions') return { title: t.nav.lesionDetection, group: t.nav.screeningPipeline, badge: 'M4' };
    if (p === '/retinal-graph') return { title: t.nav.retinalGraph, group: t.nav.screeningPipeline, badge: 'M5' };
    if (p === '/classification') return { title: t.nav.drClassification, group: t.nav.screeningPipeline, badge: 'M6' };
    if (p === '/explainability') return { title: t.nav.explainability, group: t.nav.trustExplainability, badge: 'XAI' };
    if (p === '/evidence') return { title: t.nav.evidenceVerification, group: t.nav.trustExplainability, badge: 'ETDRS' };
    if (p === '/self-aware') return { title: t.nav.selfAwareAI, group: t.nav.trustExplainability, badge: 'OOD' };
    if (p === '/trust') return { title: t.nav.trustReject, group: t.nav.trustExplainability, badge: 'SAFETY' };
    if (p === '/care') return { title: t.nav.referralCare, group: t.nav.careReferral, badge: 'ABDM' };
    if (p === '/reports') return { title: t.nav.diagnosticReports, group: t.nav.clinicalAudit, badge: 'PDF' };
    if (p === '/learning') return { title: t.nav.continuousLearning, group: t.nav.connectivityImpact, badge: '' };
    if (p === '/impact') return { title: t.nav.impactCalculator, group: t.nav.connectivityImpact, badge: '600k' };
    if (p === '/profile') return { title: t.nav.myProfile, group: t.nav.overview, badge: '' };
    if (p.startsWith('/dashboard/')) {
      const role = p.split('/')[2];
      const roleLabel =
        role === 'healthcare-worker'
          ? t.nav.fieldCampTriage
          : role === 'doctor'
          ? t.nav.specialistQueue
          : role === 'hospital'
          ? t.nav.hospitalOps
          : t.nav.myEyeRecord;
      return { title: roleLabel, group: t.nav.overview, badge: role.toUpperCase() };
    }
    return { title: '', isHome: true, badge: '' };
  };

  const { title: currentTitle, isHome, badge: currentBadge } = getTranslatedTitleAndGroup();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full h-16 bg-[#FFFDF8]/95 backdrop-blur-md border-b border-[#DDE5DC] px-4 sm:px-6 lg:px-8 shadow-xs flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile Menu Toggle, Animated Top-Left Brand & Clean Page Indicator */}
      <div className="flex items-center gap-3 min-w-0">
        {isAuthenticated && (
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden w-9 h-9 rounded-xl border border-[#DDE5DC] bg-[#F8F6EF] flex items-center justify-center text-[#124B3A] hover:bg-[#FAF4ED] transition-colors"
            aria-label="Open Navigation"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Top-Left Animated Brand Logo & Name */}
        <TopBrandHeader />

        {/* Subtle Vertical Divider & Clean Page Indicator (No awkward OVERVIEW breadcrumb) */}
        {isAuthenticated && !isHome && currentTitle && (
          <div className="hidden sm:flex items-center gap-2 min-w-0">
            <div className="w-px h-6 bg-[#DDE5DC] mx-1 shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              {currentBadge && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#124B3A]/10 text-[#124B3A] border border-[#124B3A]/20 shrink-0">
                  {currentBadge}
                </span>
              )}
              <span className="font-sans font-bold text-xs sm:text-sm text-[#124B3A] truncate">
                {currentTitle}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Center: Active Retinal Scan Pill */}
      {isAuthenticated && (
        <div
          onClick={() => navigate('/acquisition')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8F6EF] hover:bg-[#FAF4ED] border border-[#DDE5DC] text-[11px] text-[#65736B] cursor-pointer transition-all group"
          title="Click to view or change active image in Acquisition"
        >
          {activeImage && (
            <div className="w-5 h-5 rounded-full overflow-hidden bg-[#06150F] border border-[#1F7A5A]/50 shrink-0">
              <img src={activeImage} alt="Active Scan" className="w-full h-full object-cover" />
            </div>
          )}
          <span>
            <strong className="text-[#124B3A]">{t.common.activeScan}:</strong> {imageMetadata.fileName || imageSource}
          </span>
          {isProcessingPipeline ? (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#E9A23B]/20 text-[#8A5612] flex items-center gap-1">
              <RotateCcw size={10} className="animate-spin" /> {t.common.processing}
            </span>
          ) : (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#1F7A5A]/10 text-[#1F7A5A]">
              {t.common.ready}
            </span>
          )}
        </div>
      )}

      {/* Right: Trilingual Switcher, Telemetry & Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Fast 3-Role Evaluator Switcher (Hospital / Doctor / Patient) */}
        {isAuthenticated && (
          <div className="hidden lg:flex items-center p-0.5 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC] text-[11px]">
            <button
              onClick={async () => {
                await loginAsDemo('hospital');
                navigate('/dashboard/hospital');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                user?.role === 'hospital' || user?.role === 'healthcare-worker'
                  ? 'bg-[#124B3A] text-white shadow-xs'
                  : 'text-[#65736B] hover:text-[#17221C]'
              }`}
            >
              <Building2 size={12} />
              <span>Hospital</span>
            </button>
            <button
              onClick={async () => {
                await loginAsDemo('doctor');
                navigate('/dashboard/doctor');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                user?.role === 'doctor'
                  ? 'bg-[#124B3A] text-white shadow-xs'
                  : 'text-[#65736B] hover:text-[#17221C]'
              }`}
            >
              <Stethoscope size={12} />
              <span>Doctor</span>
            </button>
            <button
              onClick={async () => {
                await loginAsDemo('patient');
                navigate('/dashboard/patient');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                user?.role === 'patient'
                  ? 'bg-[#124B3A] text-white shadow-xs'
                  : 'text-[#65736B] hover:text-[#17221C]'
              }`}
            >
              <HeartPulse size={12} />
              <span>Patient</span>
            </button>
          </div>
        )}

        {/* Global Trilingual Language Switcher matching user reference photo */}
        <LanguageSelector variant="dropdown" />

        {/* Quick Re-run Pipeline */}
        {isAuthenticated && (
          <button
            onClick={() => runSequentialPipeline()}
            disabled={isProcessingPipeline}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F6EF] hover:bg-[#FAF4ED] text-[#124B3A] text-xs font-semibold border border-[#DDE5DC] hover:border-[#1F7A5A]/40 transition-all shadow-xs"
            title="Re-run entire sequential pipeline"
          >
            <RotateCcw size={13} className={`text-[#1F7A5A] ${isProcessingPipeline ? 'animate-spin' : ''}`} />
            <span className="text-[11px] font-mono">{t.common.runPipeline}</span>
          </button>
        )}

        {/* Quick Launch Demo Cockpit Button */}
        {isAuthenticated && (
          <button
            onClick={onLaunchDemoModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#124B3A] to-[#1F7A5A] hover:from-[#175643] hover:to-[#248965] text-[#FFFDF8] text-xs font-semibold shadow-md shadow-[#124B3A]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            data-cursor="button"
          >
            <Play size={13} className="fill-[#FFFDF8]" />
            <span className="hidden sm:inline">{t.common.screeningCockpit}</span>
            <span className="sm:hidden">Cockpit</span>
          </button>
        )}

        {/* User Profile & Auth Gateway Dropdown */}
        {isAuthenticated && user ? (
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-[#F8F6EF] hover:bg-[#FAF4ED] border border-[#DDE5DC] hover:border-[#1F7A5A]/50 transition-all text-left"
              aria-label="User Account Menu"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover border border-[#1F7A5A]/30"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-[#124B3A] text-white flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
              )}

              <div className="hidden lg:flex flex-col">
                <span className="text-xs font-bold text-[#17221C] truncate max-w-[110px]">
                  {user.name}
                </span>
                <span className="text-[10px] uppercase font-semibold text-[#1F7A5A]">
                  {t.roles[user.role] || user.role.replace('-', ' ')}
                </span>
              </div>

              <ChevronDown size={14} className="text-[#65736B] hidden sm:inline" />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#DDE5DC] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Details */}
                <div className="p-2 border-b border-[#DDE5DC] pb-3 mb-2">
                  <span className="text-xs font-black text-[#17221C] block truncate">
                    {user.name}
                  </span>
                  <span className="text-[11px] text-[#65736B] block truncate">
                    {user.email}
                  </span>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#1F7A5A]/15 text-[#1F7A5A]">
                      {t.roles[user.role] || user.role.replace('-', ' ')}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#E9A23B]/20 text-[#A6680C]">
                      {user.verificationStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Role Dashboard Link */}
                <Link
                  to={`/dashboard/${user.role}`}
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#124B3A] hover:bg-[#F8F6EF] transition-colors mb-1"
                >
                  <LayoutDashboard size={14} className="text-[#1F7A5A]" />
                  <span>{t.nav.dashboard}</span>
                </Link>

                {/* Profile Link */}
                <Link
                  to="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#124B3A] hover:bg-[#F8F6EF] transition-colors mb-1"
                >
                  <UserIcon size={14} className="text-[#1F7A5A]" />
                  <span>{t.nav.myProfile}</span>
                </Link>

                {/* Logout Button Below Profile */}
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#E76F51] hover:bg-[#E76F51]/10 transition-colors mt-2 pt-2 border-t border-[#DDE5DC]"
                >
                  <LogOut size={14} />
                  <span>{t.common.signOut}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#124B3A]/30 text-[#124B3A] hover:bg-[#124B3A] hover:text-white text-xs font-bold transition-all shadow-xs"
            >
              <LogIn size={13} />
              <span className="hidden sm:inline">{t.common.clinicalSignIn}</span>
              <span className="sm:hidden">{t.auth.signInTitle}</span>
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#124B3A] text-white hover:bg-[#1F7A5A] text-xs font-bold transition-all shadow-xs"
            >
              <span>{t.common.createAccount}</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
