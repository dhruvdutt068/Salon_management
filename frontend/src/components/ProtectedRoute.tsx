import React from 'react';
import { Navigate, useLocation, useParams, Link } from 'react-router-dom';
import { useAuthStore, type UserRole } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { t } = useLanguageStore();
  const location = useLocation();
  const params = useParams<{ name?: string }>();

  // 1. Not Authenticated -> Redirect to Login
  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // 2. Admin has universal access
  if (user.role === 'admin') {
    return <>{children}</>;
  }

  // 3. Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-gray-900 border-2 border-rose-500/40 rounded-3xl text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">{t('accessDeniedTitle')}</h2>
        <p className="text-xs text-gray-400 leading-relaxed">{t('accessDeniedDesc')}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/login"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#D4A017] text-gray-950 font-bold text-xs flex items-center justify-center min-h-[44px]"
          >
            <LogIn className="w-4 h-4 mr-1.5" />
            {t('switchAccountBtn')}
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-bold text-xs flex items-center justify-center min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            {t('backHomeBtn')}
          </Link>
        </div>
      </div>
    );
  }

  // 4. Barber personal chair ownership check (Barber Ravi cannot control Barber Amit's chair)
  if (user.role === 'barber' && params.name) {
    const routeStylistName = params.name.toLowerCase();
    const userStylistName = user.username.toLowerCase();
    const isOwner = userStylistName.includes(routeStylistName) || routeStylistName.includes(userStylistName);

    if (!isOwner) {
      return (
        <div className="max-w-md mx-auto my-12 p-8 bg-gray-900 border-2 border-amber-500/40 rounded-3xl text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 bg-amber-500/10 text-[#D4A017] rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">Stylist Chair Protected</h2>
          <p className="text-xs text-gray-300">
            You are logged in as <strong>{user.name}</strong>. You can only control your own chair.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={`/barber/${user.username.charAt(0).toUpperCase() + user.username.slice(1)}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#D4A017] text-gray-950 font-bold text-xs flex items-center justify-center min-h-[44px]"
            >
              Go to My Chair
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-bold text-xs flex items-center justify-center min-h-[44px]"
            >
              Switch Stylist
            </Link>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
