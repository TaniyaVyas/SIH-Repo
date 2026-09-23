import React, { useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRetinaData } from '../../context/RetinaContext';
import { useAuth } from '../../context/AuthContext';
import { LanguageSelector } from '../common/LanguageSelector';
import {
  Home,
  LayoutDashboard,
  Camera,
  Sliders,
  Eye,
  Crosshair,
  Network,
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Hospital,
  Share2,
  Repeat,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  LogOut,
} from 'lucide-react';

export interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  shortDesc: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

// Fallback constant for legacy references
export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Home', path: '/', icon: Home, shortDesc: 'Cinematic Platform Overview' },
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: 'LIVE', badgeColor: '#1F7A5A', shortDesc: 'Clinical Screening Cockpit' },
    ],
  },
  {
    title: 'SCREENING PIPELINE',
    items: [
      { name: 'Image Acquisition', path: '/acquisition', icon: Camera, badge: 'M1', badgeColor: '#124B3A', shortDesc: 'Point-of-Care Handheld Capture' },
      { name: 'Preprocessing', path: '/preprocessing', icon: Sliders, badge: 'M2', badgeColor: '#124B3A', shortDesc: 'Quality Gate & Denoising' },
      { name: 'Retinal Anatomy', path: '/anatomy', icon: Eye, badge: 'M3', badgeColor: '#124B3A', shortDesc: 'Vessel Segmentation & Disc' },
      { name: 'Lesion Detection', path: '/lesions', icon: Crosshair, badge: 'M4', badgeColor: '#124B3A', shortDesc: 'Microaneurysms & Exudates' },
      { name: 'Retinal Graph', path: '/retinal-graph', icon: Network, badge: 'M5', badgeColor: '#124B3A', shortDesc: 'Topological GNN Structure' },
      { name: 'DR Classification', path: '/classification', icon: BrainCircuit, badge: 'M6', badgeColor: '#124B3A', shortDesc: 'ICDR 5-Tier Staging' },
    ],
  },
  {
    title: 'TRUST & EXPLAINABILITY',
    items: [
      { name: 'Explainability', path: '/explainability', icon: Sparkles, badge: 'XAI', badgeColor: '#E9A23B', shortDesc: 'Graph & Spatial Heatmaps' },
      { name: 'Evidence Verification', path: '/evidence', icon: ShieldCheck, badge: 'ETDRS', badgeColor: '#1F7A5A', shortDesc: 'Clinical Rule Concordance' },
      { name: 'Self-Aware AI', path: '/self-aware', icon: AlertTriangle, badge: 'OOD', badgeColor: '#E9A23B', shortDesc: 'Epistemic Uncertainty Gate' },
      { name: 'Trust / Reject', path: '/trust', icon: CheckCircle2, badge: 'SAFETY', badgeColor: '#1F7A5A', shortDesc: 'Autonomous Triage Gate' },
    ],
  },
  {
    title: 'CARE & REFERRAL',
    items: [
      { name: 'Referral & Care', path: '/care', icon: Hospital, badge: 'ABDM', badgeColor: '#E76F51', shortDesc: 'Ayushman Bharat Care Slip' },
    ],
  },
  {
    title: 'CLINICAL AUDIT & REPORTS',
    items: [
      {
        name: 'Diagnostic Reports',
        path: '/reports',
        icon: FileText,
        badge: 'PDF',
        badgeColor: '#124B3A',
        shortDesc: 'Printable Summaries & FHIR R4',
      },
    ],
  },
  {
    title: 'CONNECTIVITY & IMPACT',
    items: [
      { name: 'Continuous Learning', path: '/learning', icon: Repeat, shortDesc: 'Active Learning Feedback' },
      { name: 'Impact Calculator', path: '/impact', icon: HeartHandshake, badge: '600k', badgeColor: '#E76F51', shortDesc: 'Rural Vision Loss Saved' },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const location = useLocation();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const { user, isAuthenticated, logout, t } = useAuth();
  const { activeImage, imageSource } = useRetinaData();

  // Helper to check if route matches
  const isItemActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/home';
    return location.pathname === path;
  };

  // Dynamically build localized nav groups
  const dynamicNavGroups = useMemo(() => {
    // Role-specific primary workspace navigation (Section 37)
    let roleNavGroup: NavGroup | null = null;

    if (isAuthenticated && user) {
      if (user.role === 'hospital' || user.role === 'healthcare-worker') {
        roleNavGroup = {
          title: 'HOSPITAL WORKSPACE',
          items: [
            { name: 'Health Center Dashboard', path: '/dashboard/hospital', icon: LayoutDashboard, badge: 'OPERATIONAL', badgeColor: '#1F7A5A', shortDesc: 'Register, Screen, and Review Cases' },
          ],
        };
      } else if (user.role === 'doctor') {
        roleNavGroup = {
          title: 'DOCTOR WORKSPACE',
          items: [
            { name: 'Patient Report Review', path: '/dashboard/doctor', icon: LayoutDashboard, badge: 'QUEUED', badgeColor: '#E9A23B', shortDesc: 'Review AI DR Predictions & Evidence' },
            { name: 'Diagnostic Reports', path: '/reports', icon: FileText, badge: 'PDF', badgeColor: '#124B3A', shortDesc: 'Clinical Audit & FHIR R4' },
            { name: 'Model Evaluation Feedback', path: '/learning', icon: Repeat, shortDesc: 'Continuous Learning Feedback' },
          ],
        };
      } else {
        roleNavGroup = {
          title: 'PATIENT WORKSPACE',
          items: [
            { name: 'My Eye Health Portal', path: '/dashboard/patient', icon: LayoutDashboard, badge: 'PERSONAL', badgeColor: '#1F7A5A', shortDesc: 'Screening Result & Voice Report' },
            { name: 'My Verified Reports', path: '/reports', icon: FileText, badge: 'PDF', badgeColor: '#124B3A', shortDesc: 'Doctor Certified Diagnosis' },
            { name: 'Care Plan & Referral', path: '/care', icon: Hospital, badge: 'ABDM', badgeColor: '#E76F51', shortDesc: 'Ayushman Care Slip' },
          ],
        };
      }
    }

    const isDoctorOrPatient = user?.role === 'doctor' || user?.role === 'patient';

    const groups: NavGroup[] = [
      {
        title: t.nav.overview,
        items: [
          { name: t.nav.home, path: '/', icon: Home, shortDesc: 'Cinematic Platform Overview' },
          ...(!roleNavGroup ? [
            { name: t.nav.dashboard, path: '/dashboard', icon: LayoutDashboard, badge: 'LIVE', badgeColor: '#1F7A5A', shortDesc: 'Clinical Screening Cockpit' },
          ] : []),
        ],
      },
    ];

    if (roleNavGroup) {
      groups.push(roleNavGroup);
    }

    // Only display 11 AI Architecture Modules if NOT in Doctor or Patient demo session
    if (!isDoctorOrPatient) {
      groups.push({
        title: '11 AI ARCHITECTURE MODULES',
        items: [
          { name: t.nav.imageAcquisition, path: '/acquisition', icon: Camera, badge: 'M1', badgeColor: '#124B3A', shortDesc: 'Point-of-Care Handheld Capture' },
          { name: t.nav.preprocessing, path: '/preprocessing', icon: Sliders, badge: 'M2', badgeColor: '#124B3A', shortDesc: 'Quality Gate & Denoising' },
          { name: t.nav.retinalAnatomy, path: '/anatomy', icon: Eye, badge: 'M3', badgeColor: '#124B3A', shortDesc: 'Vessel Segmentation & Disc' },
          { name: t.nav.lesionDetection, path: '/lesions', icon: Crosshair, badge: 'M4', badgeColor: '#124B3A', shortDesc: 'Microaneurysms & Exudates' },
          { name: t.nav.retinalGraph, path: '/retinal-graph', icon: Network, badge: 'M5', badgeColor: '#124B3A', shortDesc: 'Topological GNN Structure' },
          { name: t.nav.drClassification, path: '/classification', icon: BrainCircuit, badge: 'M6', badgeColor: '#124B3A', shortDesc: 'ICDR 5-Tier Staging' },
          { name: t.nav.explainability, path: '/explainability', icon: Sparkles, badge: 'XAI', badgeColor: '#E9A23B', shortDesc: 'Graph & Spatial Heatmaps' },
          { name: t.nav.evidenceVerification, path: '/evidence', icon: ShieldCheck, badge: 'ETDRS', badgeColor: '#1F7A5A', shortDesc: 'Clinical Rule Concordance' },
          { name: t.nav.selfAwareAI, path: '/self-aware', icon: AlertTriangle, badge: 'OOD', badgeColor: '#E9A23B', shortDesc: 'Epistemic Uncertainty Gate' },
          { name: t.nav.trustReject, path: '/trust', icon: CheckCircle2, badge: 'SAFETY', badgeColor: '#1F7A5A', shortDesc: 'Autonomous Triage Gate' },
          { name: t.nav.referralCare, path: '/care', icon: Hospital, badge: 'ABDM', badgeColor: '#E76F51', shortDesc: 'Ayushman Bharat Care Slip' },
        ],
      });
    }

    // Connectivity & Impact (with Integrations module removed)
    if (!isDoctorOrPatient) {
      groups.push({
        title: t.nav.connectivityImpact,
        items: [
          { name: t.nav.diagnosticReports, path: '/reports', icon: FileText, badge: 'PDF', badgeColor: '#124B3A', shortDesc: 'Printable Summaries & FHIR R4' },
          { name: t.nav.continuousLearning, path: '/learning', icon: Repeat, shortDesc: 'Active Learning Feedback' },
          { name: t.nav.impactCalculator, path: '/impact', icon: HeartHandshake, badge: '600k', badgeColor: '#E76F51', shortDesc: 'Rural Vision Loss Saved' },
        ],
      });
    } else if (user?.role === 'doctor') {
      groups.push({
        title: 'IMPACT',
        items: [
          { name: t.nav.impactCalculator, path: '/impact', icon: HeartHandshake, badge: '600k', badgeColor: '#E76F51', shortDesc: 'Rural Vision Loss Saved' },
        ],
      });
    }

    return groups;
  }, [t, isAuthenticated, user]);

  const sidebarContent = (
    <div className={`h-full flex flex-col ${collapsed ? 'px-2' : 'px-3'} py-3 select-none`}>
      {/* Clean Sidebar Navigation Header (shrink-0) */}
      <div className={`shrink-0 flex items-center ${collapsed ? 'justify-center px-0 mb-2' : 'justify-between px-2 mb-2'} pb-2 border-b border-[#DDE5DC]/70`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1F7A5A]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#65736B]">
              {t.nav.navigation}
            </span>
          </div>
        )}

        {/* Desktop Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex w-7 h-7 rounded-lg border border-[#DDE5DC] hover:border-[#1F7A5A] bg-[#F8F6EF] hover:bg-[#FAF4ED] items-center justify-center text-[#65736B] hover:text-[#124B3A] transition-colors shadow-2xs shrink-0"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* Navigation Group Items */}
      <div className={`flex-1 min-h-0 overflow-y-auto space-y-4 ${collapsed ? 'no-scrollbar px-0' : 'custom-scrollbar pr-1'}`}>
        {dynamicNavGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {/* Group Title */}
            {!collapsed && (
              <div className="px-3 text-[10px] font-mono font-bold tracking-widest text-[#65736B]/80 uppercase mb-1">
                {group.title}
              </div>
            )}

            {collapsed && (
              <div className="w-full flex justify-center py-1">
                <div className="w-5 h-[1px] bg-[#DDE5DC]" />
              </div>
            )}

            {/* Group Nav Items */}
            {group.items.map((item) => {
              const active = isItemActive(item.path);
              const IconComponent = item.icon;

              return (
                <div key={item.path} className="relative group/nav">
                  <NavLink
                    to={item.path}
                    onClick={onCloseMobile}
                    onMouseEnter={() => setHoveredPath(item.path)}
                    onMouseLeave={() => setHoveredPath(null)}
                    className={`relative flex items-center ${
                      collapsed ? 'justify-center w-11 h-11 mx-auto p-0' : 'gap-3 px-3 py-2'
                    } rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 z-10 ${
                      active
                        ? 'text-[#124B3A] font-bold'
                        : 'text-[#526058] hover:text-[#17221C] hover:bg-[#F8F6EF]'
                    }`}
                  >
                    {/* Active State Background Pill with Spring Layout Animation */}
                    {active && (
                      <motion.div
                        layoutId="sidebarActivePill"
                        className="absolute inset-0 rounded-xl bg-[#E8F3EE] border border-[#1F7A5A]/30 shadow-xs"
                        transition={{
                          type: 'spring',
                          stiffness: 450,
                          damping: 35,
                        }}
                      >
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#1F7A5A]" />
                      </motion.div>
                    )}

                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.94 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                        active
                          ? 'bg-[#124B3A] text-[#FFFDF8] shadow-sm shadow-[#124B3A]/20'
                          : 'text-[#526058] group-hover/nav:text-[#124B3A]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </motion.div>

                    {/* Item Label & Badge */}
                    {!collapsed && (
                      <div className="relative z-10 flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <span
                            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border shadow-2xs"
                            style={{
                              color: item.badgeColor || '#124B3A',
                              backgroundColor: `${item.badgeColor || '#124B3A'}15`,
                              borderColor: `${item.badgeColor || '#124B3A'}30`,
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </NavLink>

                  {/* Animated Tooltip on Collapsed Mode */}
                  <AnimatePresence>
                    {collapsed && hoveredPath === item.path && (
                      <motion.div
                        initial={{ opacity: 0, x: -8, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -6, scale: 0.95 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#17221C] text-[#FFFDF8] text-xs font-medium whitespace-nowrap shadow-xl z-50 flex items-center gap-2 border border-white/10 pointer-events-none"
                      >
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/20">
                            {item.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-[#DDE5DC]/75 font-normal">
                          • {item.shortDesc}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / Active Scan & System Status Pill (shrink-0 pinned at bottom) */}
      <div className="shrink-0 mt-2 pt-2 border-t border-[#DDE5DC]/80 px-1 space-y-1.5">
        {activeImage && !collapsed && (
          <NavLink
            to="/acquisition"
            onClick={onCloseMobile}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-[#F8F6EF] hover:bg-[#FAF4ED] border border-[#DDE5DC] transition-all group shadow-2xs"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#06150F] shrink-0 border border-[#1F7A5A]/40">
              <img src={activeImage} alt="Active Scan" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-[#124B3A] truncate flex items-center gap-1">
                <span>{t.common.activeScan}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A5A]" />
              </div>
              <div className="text-[9px] font-mono text-[#65736B] truncate">
                {imageSource}
              </div>
            </div>
          </NavLink>
        )}

        {activeImage && collapsed && (
          <NavLink
            to="/acquisition"
            onClick={onCloseMobile}
            title={`${t.common.activeScan}: ${imageSource}`}
            className="w-9 h-9 mx-auto rounded-xl overflow-hidden bg-[#06150F] border border-[#1F7A5A]/50 flex items-center justify-center block shadow-xs hover:scale-105 transition-transform"
          >
            <img src={activeImage} alt="Active Scan" className="w-full h-full object-cover" />
          </NavLink>
        )}

        {/* Profile Card & Logout */}
        {isAuthenticated && user ? (
          <div className="pt-2 border-t border-[#DDE5DC]/70 space-y-1">
            <NavLink
              to="/profile"
              onClick={onCloseMobile}
              title={collapsed ? `${user.name} (${user.role}) - ${t.nav.myProfile}` : undefined}
              className={`flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F8F6EF] border border-transparent hover:border-[#DDE5DC] transition-all group ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#124B3A] to-[#1F7A5A] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#17221C] truncate">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-[#1F7A5A] font-semibold truncate capitalize">
                    {t.roles[user.role] || user.role.replace('-', ' ')}
                  </div>
                </div>
              )}
            </NavLink>

            <button
              type="button"
              onClick={() => {
                logout();
                onCloseMobile();
              }}
              title={collapsed ? t.common.signOut : undefined}
              className={`w-full flex items-center gap-2 p-1.5 rounded-xl text-xs font-bold text-[#E76F51] hover:bg-[#E76F51]/10 transition-colors ${
                collapsed ? 'justify-center' : 'px-2'
              }`}
            >
              <LogOut size={14} className="shrink-0" />
              {!collapsed && <span>{t.common.signOut}</span>}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Floating Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 264 }}
        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
        className="hidden lg:block fixed left-4 top-[74px] bottom-4 z-40 bg-[#FFFDF8]/95 backdrop-blur-md rounded-3xl border border-[#DDE5DC] shadow-xl shadow-[#124B3A]/5 overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>

      {/* 2. Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="lg:hidden fixed inset-0 bg-[#17221C]/40 backdrop-blur-xs z-50"
          />
        )}
      </AnimatePresence>

      {/* 3. Mobile Slide-out Drawer */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: mobileOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="lg:hidden fixed top-0 bottom-0 left-0 w-[290px] bg-[#FFFDF8] border-r border-[#DDE5DC] shadow-2xl z-50 overflow-hidden flex flex-col"
      >
        <div className="p-3 border-b border-[#DDE5DC] flex items-center justify-between">
          <LanguageSelector variant="compact" />
          <button
            onClick={onCloseMobile}
            className="w-8 h-8 rounded-lg bg-[#F8F6EF] border border-[#DDE5DC] flex items-center justify-center text-[#65736B] hover:text-[#124B3A]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {sidebarContent}
        </div>
      </motion.aside>
    </>
  );
};
