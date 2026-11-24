import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../store/useLanguageStore';
import { useAuthStore } from '../store/useAuthStore';
import { useQueueStore } from '../store/useQueueStore';
import { Scissors, Globe, Clock, User, LogOut, LogIn, ShieldCheck } from 'lucide-react';

export const RootLayout: React.FC = () => {
  const { t, language, toggleLanguage } = useLanguageStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { queue } = useQueueStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    // 1. Unauthenticated / Guest: can only view Home, TV Display, and Login
    if (!isAuthenticated || !user) {
      return [
        { to: '/', label: t('navHome') },
        { to: '/display', label: t('navDisplay') },
      ];
    }

    // 2. Customer: can only see Home, Join Queue, My Status, and TV Display
    if (user.role === 'customer') {
      const activeEntry = queue.find(
        (q) =>
          (q.customerPhone === user.phone || q.customerPhone === user.username) &&
          (q.status === 'Waiting' || q.status === 'Called' || q.status === 'In Chair')
      );
      const customerToken =
        activeEntry?.token ||
        (typeof window !== 'undefined' ? localStorage.getItem('my_active_token') : null) ||
        'S-009';

      return [
        { to: '/', label: t('navHome') },
        { to: '/join', label: t('navJoin') },
        { to: `/status/${customerToken}`, label: t('navStatus') },
        { to: '/display', label: t('navDisplay') },
      ];
    }

    // 3. Barber: can only see their dedicated workstation and TV Display
    if (user.role === 'barber') {
      const stylistName = user.username.charAt(0).toUpperCase() + user.username.slice(1);
      return [
        { to: `/barber/${stylistName}`, label: `My Station (${stylistName})` },
        { to: '/display', label: t('navDisplay') },
      ];
    }

    // 4. Receptionist: can see Reception Dashboard, TV Display, and Home
    if (user.role === 'receptionist') {
      return [
        { to: '/reception', label: t('navReception') },
        { to: '/display', label: t('navDisplay') },
        { to: '/', label: t('navHome') },
      ];
    }

    // 5. Admin / Owner: Full operational visibility
    return [
      { to: '/', label: t('navHome') },
      { to: '/reception', label: t('navReception') },
      { to: '/barber/Amit', label: t('navBarber') },
      { to: '/display', label: t('navDisplay') },
      { to: '/admin', label: t('navAdmin') },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-[#1F2937] text-gray-100 flex flex-col font-sans selection:bg-[#D4A017] selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#111827]/90 backdrop-blur-md border-b border-gray-700/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <NavLink to="/" className="flex items-center space-x-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A017] to-amber-700 flex items-center justify-center shadow-md shadow-amber-900/30 group-hover:scale-105 transition-transform">
              <Scissors className="w-5 h-5 text-gray-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-[#D4A017] transition-colors">
                  {t('salonName')}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Clock className="w-3 h-3 mr-1" />
                  {t('closingBadge')}
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">{t('salonTagline')}</p>
            </div>
          </NavLink>

          {/* Navigation Items (Desktop & Tablet) */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[44px] flex items-center ${
                    isActive
                      ? 'bg-[#D4A017] text-gray-950 font-semibold shadow-sm shadow-[#D4A017]/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions: Profile, Login, Language */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* User Profile or Login CTA */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2 bg-gray-800/90 border border-gray-700/80 rounded-xl p-1 sm:px-2.5 sm:py-1.5 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-[#D4A017] text-gray-950 flex items-center justify-center text-xs font-black shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">{user.name}</p>
                  <p className="text-[10px] text-[#D4A017] font-semibold uppercase tracking-wider">{user.role}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer rounded-lg hover:bg-gray-700/50"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D4A017] text-gray-950 hover:bg-amber-400 transition-all cursor-pointer min-h-[44px] shadow-sm shadow-[#D4A017]/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('navLogin')}</span>
              </Link>
            )}

            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-[#D4A017] border border-[#D4A017]/30 shadow-sm transition-all cursor-pointer min-h-[44px]"
              aria-label="Toggle language between English and Gujarati"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'ગુજરાતી' : 'English'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center space-x-1 px-4 py-2 bg-gray-900/90 border-t border-gray-800 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap min-h-[44px] flex items-center ${
                  isActive
                    ? 'bg-[#D4A017] text-gray-950 font-bold'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </header>

      {/* Main Screen Outlet */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#111827] border-t border-gray-800 py-6 text-center text-xs text-gray-500">
        <p>© 2026 {t('salonName')}. All rights reserved.</p>
        <p className="mt-1 text-gray-600">Built for seamless salon queue operations with React, FastAPI & WebSockets.</p>
      </footer>
    </div>
  );
};
