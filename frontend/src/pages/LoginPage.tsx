import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore, type UserRole } from '../store/useAuthStore';
import { useLanguageStore } from '../store/useLanguageStore';
import {
  ShieldCheck,
  User,
  Scissors,
  ClipboardList,
  Sparkles,
  Lock,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  UserPlus
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t } = useLanguageStore();
  const { login, registerCustomer } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  // Role Tab
  const [activeRole, setActiveRole] = useState<UserRole>('customer');

  // Form Fields
  const [username, setUsername] = useState('9876543210');
  const [pin, setPin] = useState('1234');
  const [customerName, setCustomerName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // UI state
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Quick Demo credentials
  const demoAccounts = [
    { role: 'customer' as UserRole, label: 'Customer (Kunal)', user: '9876543210', pin: '1234' },
    { role: 'barber' as UserRole, label: 'Barber (Ravi)', user: 'ravi', pin: '1111' },
    { role: 'barber' as UserRole, label: 'Barber (Amit)', user: 'amit', pin: '2222' },
    { role: 'barber' as UserRole, label: 'Barber (Imran)', user: 'imran', pin: '3333' },
    { role: 'receptionist' as UserRole, label: 'Receptionist', user: 'reception', pin: '1234' },
    { role: 'admin' as UserRole, label: 'Admin (Owner)', user: 'admin', pin: '9999' },
  ];

  const handleSelectRoleTab = (role: UserRole) => {
    setActiveRole(role);
    setError(null);
    setIsRegistering(false);
    if (role === 'admin') {
      setUsername('admin');
      setPin('9999');
    } else if (role === 'receptionist') {
      setUsername('reception');
      setPin('1234');
    } else if (role === 'barber') {
      setUsername('amit');
      setPin('2222');
    } else {
      setUsername('9876543210');
      setPin('1234');
    }
  };

  const handleApplyDemo = (item: typeof demoAccounts[0]) => {
    setActiveRole(item.role);
    setUsername(item.user);
    setPin(item.pin);
    setError(null);
    setIsRegistering(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegistering && activeRole === 'customer') {
        if (!customerName.trim() || customerName.trim().length < 2) {
          setError('Please enter your full name (at least 2 characters).');
          setIsLoading(false);
          return;
        }
        const res = await registerCustomer(customerName, username, pin);
        if (res.success) {
          navigate(redirectUrl || '/join');
        } else {
          setError(res.error || 'Registration failed.');
        }
      } else {
        const res = await login(username, pin);
        if (res.success && res.user) {
          // Dynamic redirect based on role
          if (redirectUrl) {
            navigate(redirectUrl);
          } else if (res.user.role === 'admin') {
            navigate('/admin');
          } else if (res.user.role === 'receptionist') {
            navigate('/reception');
          } else if (res.user.role === 'barber') {
            const barberName = res.user.username.charAt(0).toUpperCase() + res.user.username.slice(1);
            navigate(`/barber/${barberName}`);
          } else {
            navigate('/join');
          }
        } else {
          setError(res.error || 'Invalid credentials. Please verify your username and PIN.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full py-6 sm:py-10 space-y-6">
      {/* Title & Brand */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4A017] to-amber-700 text-gray-950 shadow-xl shadow-amber-900/30">
          <KeyRound className="w-7 h-7 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {t('loginTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          {t('loginSubtitle')}
        </p>
      </div>

      {/* Role Selector Segmented Control */}
      <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-gray-900/90 rounded-2xl border border-gray-800">
        <button
          type="button"
          onClick={() => handleSelectRoleTab('customer')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 min-h-[44px] cursor-pointer ${
            activeRole === 'customer'
              ? 'bg-[#D4A017] text-gray-950 shadow-md font-black'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>{t('tabCustomer')}</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectRoleTab('barber')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 min-h-[44px] cursor-pointer ${
            activeRole === 'barber'
              ? 'bg-[#D4A017] text-gray-950 shadow-md font-black'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>{t('tabBarber')}</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectRoleTab('receptionist')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 min-h-[44px] cursor-pointer ${
            activeRole === 'receptionist'
              ? 'bg-[#D4A017] text-gray-950 shadow-md font-black'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>{t('tabReception')}</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectRoleTab('admin')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 min-h-[44px] cursor-pointer ${
            activeRole === 'admin'
              ? 'bg-[#D4A017] text-gray-950 shadow-md font-black'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('tabAdmin')}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="bg-[#111827] rounded-3xl border-2 border-gray-700/60 p-6 sm:p-8 shadow-2xl relative space-y-6">
        {/* Role Badge Indicator */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4A017] animate-pulse" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              {activeRole === 'admin' && t('roleAdminBadge')}
              {activeRole === 'receptionist' && t('roleReceptionBadge')}
              {activeRole === 'barber' && t('roleBarberBadge')}
              {activeRole === 'customer' && (isRegistering ? t('registerTitle') : t('roleCustomerBadge'))}
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-400 bg-gray-800/80 px-2.5 py-1 rounded-lg border border-gray-700">
            Role: <strong className="text-[#D4A017]">{activeRole}</strong>
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Name if Registering */}
          {isRegistering && activeRole === 'customer' && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-gray-800/90 border border-gray-700 focus:border-[#D4A017] rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none min-h-[44px]"
                />
              </div>
            </div>
          )}

          {/* Identifier Field (Phone or Username) */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              {activeRole === 'customer' ? t('phoneOrTokenLabel') : t('usernameLabel')}
            </label>
            <div className="relative">
              {activeRole === 'customer' ? (
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              ) : (
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              )}
              <input
                type={activeRole === 'customer' ? 'tel' : 'text'}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={activeRole === 'customer' ? 'e.g. 9876543210' : 'Username'}
                className="w-full bg-gray-800/90 border border-gray-700 focus:border-[#D4A017] rounded-xl pl-10 pr-4 py-3 text-white text-sm font-mono focus:outline-none min-h-[44px]"
              />
            </div>
          </div>

          {/* PIN / Password Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              {t('pinLabel')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type={showPin ? 'text' : 'password'}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={t('pinPlaceholder')}
                className="w-full bg-gray-800/90 border border-gray-700 focus:border-[#D4A017] rounded-xl pl-10 pr-11 py-3 text-white text-sm font-mono tracking-widest focus:outline-none min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 p-1 cursor-pointer"
                title={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4A017] to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-black text-sm flex items-center justify-center space-x-2 shadow-xl shadow-[#D4A017]/20 transition-all cursor-pointer min-h-[48px] active:scale-[0.99] disabled:opacity-50"
          >
            <span>{isRegistering ? t('registerBtn') : t('loginBtn')}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Customer Register Toggle */}
        {activeRole === 'customer' && (
          <div className="text-center pt-2 border-t border-gray-800">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-xs text-[#D4A017] hover:underline font-semibold cursor-pointer inline-flex items-center min-h-[44px]"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              {isRegistering ? 'Already have a PIN? Sign in' : 'First time? Create a customer PIN'}
            </button>
          </div>
        )}

        {/* Quick Demo Credentials Bar */}
        <div className="pt-4 border-t border-gray-800 space-y-2">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold flex items-center">
            <Sparkles className="w-3 h-3 mr-1 text-[#D4A017]" />
            {t('quickDemoCredentials')}
          </p>
          <div className="flex flex-wrap gap-2">
            {demoAccounts.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleApplyDemo(item)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border cursor-pointer min-h-[36px] flex items-center ${
                  username === item.user && pin === item.pin
                    ? 'bg-[#D4A017]/20 text-[#D4A017] border-[#D4A017]'
                    : 'bg-gray-800/70 text-gray-300 border-gray-700 hover:border-gray-500'
                }`}
              >
                {item.label}: <span className="text-[#D4A017] ml-1 font-bold">{item.pin}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
