import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-[#1F7A5A]/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#1F7A5A] border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-2 border-[#E9A23B]/30 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-sm font-semibold text-[#124B3A] tracking-wider uppercase">
          Verifying Clinical Credentials...
        </p>
        <span className="text-xs text-[#65736B] mt-1">
          RETINAFUSION 360 Zero-Trust Identity Guard
        </span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect unauthenticated user to login with return path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#DDE5DC] p-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E76F51]/10 border border-[#E76F51]/30 text-[#E76F51] flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E76F51]/15 text-[#E76F51] tracking-wide uppercase">
            Access Restricted
          </span>

          <h2 className="text-xl font-bold text-[#17221C] mt-3">
            Role Permission Required
          </h2>
          <p className="text-sm text-[#65736B] mt-2 leading-relaxed">
            You are authenticated as{' '}
            <strong className="text-[#124B3A] capitalize">
              {user.role.replace('-', ' ')}
            </strong>
            . This clinical workstation requires{' '}
            <strong className="text-[#124B3A]">
              {allowedRoles.map((r) => r.replace('-', ' ')).join(' or ')}
            </strong>{' '}
            credentials.
          </p>

          <div className="mt-6 pt-6 border-t border-[#DDE5DC] flex flex-col sm:flex-row gap-3">
            <Link
              to={`/dashboard/${user.role}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F7A5A] text-white text-xs font-semibold hover:bg-[#124B3A] transition-all shadow-md shadow-[#1F7A5A]/20"
            >
              <span>Go to My Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#DDE5DC] text-[#17221C] text-xs font-semibold hover:bg-[#F8F6EF] transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-[#65736B]" />
              <span>Switch Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
