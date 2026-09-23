import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopStatusBar } from './TopStatusBar';
import { CustomCursor } from '../cursor/CustomCursor';
import { ScreeningDemoModal } from '../ScreeningDemoModal';
import { ScrollToTop } from './ScrollToTop';
import { ErrorBoundary } from '../ErrorBoundary';
import { ProjectAIChatbot } from '../chat/ProjectAIChatbot';
import { useAuth } from '../../context/AuthContext';

interface AppShellProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({ children, isLoading = false }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isHome = location.pathname === '/' || location.pathname === '/home';
  const isAuthPage = [
    '/login',
    '/signup',
    '/forgot-password',
    '/verify-account',
  ].some((path) => location.pathname.startsWith(path));

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#F8F6EF] text-[#17221C] font-sans selection:bg-[#1F7A5A] selection:text-[#FFFDF8] relative">
        <ScrollToTop />
        {!isLoading && <CustomCursor />}
        <main className="w-full relative min-h-screen">
          <ErrorBoundary>
            <div className="w-full min-h-screen">
              {children}
            </div>
          </ErrorBoundary>
        </main>
        {!isLoading && <ProjectAIChatbot />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6EF] text-[#17221C] font-sans selection:bg-[#1F7A5A] selection:text-[#FFFDF8] relative overflow-x-hidden">
      {/* 0. Scroll to Top on Navigation */}
      <ScrollToTop />

      {/* 1. Custom Desktop Cursor */}
      {!isLoading && <CustomCursor />}

      {/* 2. Persistent Left Floating Sidebar (Only rendered when user is logged in) */}
      {!isLoading && isAuthenticated && (
        <motion.div
          initial={{ x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.32, ease: 'easeOut', delay: 0.05 }}
        >
          <Sidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
          />
        </motion.div>
      )}

      {/* 3. Persistent Full-Width Header */}
      {!isLoading && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.32, ease: 'easeOut', delay: 0.14 }}
        >
          <TopStatusBar
            onOpenMobileSidebar={() => setMobileOpen(true)}
            onLaunchDemoModal={() => setDemoOpen(true)}
          />
        </motion.div>
      )}

      {/* 4. Main Workspace Container with pt-16 to clear fixed top header */}
      <div
        className={`transition-all duration-300 ease-in-out min-h-screen flex flex-col pt-16 ${
          isAuthenticated
            ? (collapsed ? 'lg:pl-[104px]' : 'lg:pl-[288px]')
            : 'w-full'
        }`}
      >
        {/* Content Area with Medical-Grade Fast Route Transition & Error Boundary */}
        <main className="flex-1 w-full relative">
          <ErrorBoundary>
            <div className="w-full">
              {children}
            </div>
          </ErrorBoundary>
        </main>
      </div>

      {/* 4. Global Screening Simulation Cockpit Modal */}
      <ScreeningDemoModal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
      />

      {/* 5. Persistent Project-Wide AI Intelligence Assistant */}
      {!isLoading && <ProjectAIChatbot />}
    </div>
  );
};
