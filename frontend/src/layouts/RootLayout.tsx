import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useLanguageStore } from '../store/useLanguageStore';
import { Scissors, Globe, Clock } from 'lucide-react';

export const RootLayout: React.FC = () => {
  const { t, language, toggleLanguage } = useLanguageStore();

  const navItems = [
    { to: '/', label: t('navHome') },
    { to: '/join', label: t('navJoin') },
    { to: '/status/S-014', label: t('navStatus') },
    { to: '/reception', label: t('navReception') },
    { to: '/barber/Amit', label: t('navBarber') },
    { to: '/display', label: t('navDisplay') },
    { to: '/admin', label: t('navAdmin') },
  ];

  return (
    <div className="min-h-screen bg-[#1F2937] text-gray-100 flex flex-col font-sans selection:bg-[#D4A017] selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#111827]/90 backdrop-blur-md border-b border-gray-700/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <NavLink to="/" className="flex items-center space-x-3 group">
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
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
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

          {/* Language Toggle Button */}
          <div className="flex items-center space-x-2">
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
        <div className="md:hidden flex items-center space-x-1 px-4 py-2 bg-gray-900/90 border-t border-gray-800 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap min-h-[36px] flex items-center ${
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
      <footer className="border-t border-gray-800 bg-[#111827] text-xs text-gray-400 py-4 text-center">
        <p>© 2026 {t('salonName')}. All rights reserved. • Powered by Salon Queue Management System</p>
      </footer>
    </div>
  );
};
