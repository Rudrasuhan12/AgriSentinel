import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center text-sand-200">
        <div className="w-10 h-10 border-2 border-forest-600 border-t-lime-accent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono uppercase tracking-widest text-olive-300">
          Verifying security credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Account status verification
  if (user.account_status === 'PENDING') {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-forest-950/70 border border-amber-500/30 rounded-2xl p-8 backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
            ⏳
          </div>
          <h2 className="text-lg font-bold text-sand-50 mb-2">Access Request Pending Review</h2>
          <p className="text-xs text-sand-300 mb-6 leading-relaxed">
            Your official government account request has been submitted and is currently pending review by an AgriSentinel System Administrator.
          </p>
          <div className="text-[11px] font-mono bg-charcoal-900/60 p-3 rounded-lg border border-forest-800 text-olive-300 mb-6 text-left">
            <div>Account: {user.email}</div>
            <div>Role: {user.role}</div>
            <div>Status: PENDING REVIEW</div>
          </div>
          <a
            href="/"
            className="inline-block px-5 py-2 rounded-lg bg-forest-800 hover:bg-forest-700 text-sand-100 text-xs font-mono uppercase tracking-wider transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  if (user.account_status === 'REJECTED' || user.account_status === 'SUSPENDED') {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-forest-950/70 border border-rose-500/30 rounded-2xl p-8 backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
            ⚠️
          </div>
          <h2 className="text-lg font-bold text-sand-50 mb-2">Account Not Authorized</h2>
          <p className="text-xs text-sand-300 mb-6 leading-relaxed">
            Your account status is currently <span className="font-semibold text-rose-400">{user.account_status}</span>. Please contact platform administration for assistance.
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2 rounded-lg bg-forest-800 hover:bg-forest-700 text-sand-100 text-xs font-mono uppercase tracking-wider transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  // Role authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective authorized root
    const defaultRedirect = 
      user.role === UserRole.ADMIN ? '/admin/dashboard' :
      user.role === UserRole.GOVERNMENT_OFFICIAL ? '/government/dashboard' :
      '/farmer/dashboard';

    return <Navigate to={defaultRedirect} replace />;
  }

  return <>{children}</>;
};
