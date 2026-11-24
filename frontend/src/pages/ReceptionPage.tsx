import React, { useState } from 'react';
import { useLanguageStore } from '../store/useLanguageStore';
import { useQueueStore } from '../store/useQueueStore';
import type { QueueEntry } from '../types';
import {
  Scissors,
  Plus,
  Search,
  Clock,
  User,
  Phone,
  AlertCircle,
  AlertTriangle,
  UserX,
  XCircle,
  Check,
  CheckCircle2,
  Coffee,
  X,
  PhoneCall,
  Flame,
} from 'lucide-react';

export const ReceptionPage: React.FC = () => {
  const { t, language } = useLanguageStore();
  const {
    barbers,
    services,
    queue,
    getWaitingCount,
    getTotalEstimatedWait,
    callNextForBarber,
    markNoShow,
    cancelEntry,
    joinQueue,
    completeBarberService,
  } = useQueueStore();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWaitingOnly, setFilterWaitingOnly] = useState(true);

  // Alert message for actions
  const [actionAlert, setActionAlert] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);

  // Walk-in modal state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInServices, setWalkInServices] = useState<string[]>(['s-haircut']);
  const [walkInBarber, setWalkInBarber] = useState<string>('any');
  const [walkInError, setWalkInError] = useState<string | null>(null);

  // Confirmation modals
  const [noShowTarget, setNoShowTarget] = useState<QueueEntry | null>(null);
  const [cancelTarget, setCancelTarget] = useState<QueueEntry | null>(null);

  // Filtered queue items
  const filteredQueue = queue.filter((item) => {
    if (filterWaitingOnly && item.status !== 'Waiting') return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.token.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q) ||
      item.customerPhone.includes(q)
    );
  });

  // Call Next handler
  const handleCallNext = (barberId: string) => {
    setActionAlert(null);
    const result = callNextForBarber(barberId);
    const barber = barbers.find((b) => b.id === barberId);

    if (result.success && result.customer) {
      setActionAlert({
        type: 'success',
        message: t('customerCalledAlert')
          .replace('#token', result.customer.token)
          .replace('#name', result.customer.customerName)
          .replace('#barber', barber?.name || ''),
      });
    } else {
      setActionAlert({
        type: 'warning',
        message: result.message || t('noEligibleCustomer'),
      });
    }

    setTimeout(() => {
      setActionAlert(null);
    }, 6000);
  };

  // Add Walk-in submit handler
  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWalkInError(null);

    if (!walkInName.trim() || walkInName.trim().length < 2) {
      setWalkInError(t('nameError'));
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(walkInPhone.trim())) {
      setWalkInError(t('phoneError'));
      return;
    }

    if (walkInServices.length === 0 || walkInServices.length > 3) {
      setWalkInError(t('serviceLimitError'));
      return;
    }

    const res = joinQueue({
      customerName: walkInName,
      customerPhone: walkInPhone,
      serviceIds: walkInServices,
      preferredBarberId: walkInBarber,
      isWalkIn: true,
    });

    if (res.success && res.token) {
      setShowWalkInModal(false);
      setWalkInName('');
      setWalkInPhone('');
      setWalkInServices(['s-haircut']);
      setWalkInBarber('any');
      setActionAlert({
        type: 'success',
        message: `Walk-in customer registered with token ${res.token}! Joined end of queue.`,
      });
    } else if (res.error === 'duplicate_phone') {
      setWalkInError(`Phone already active with token ${res.existingToken}`);
    }
  };

  // Service toggle for Walk-in modal
  const toggleWalkInService = (id: string) => {
    if (walkInServices.includes(id)) {
      if (walkInServices.length > 1) {
        setWalkInServices(walkInServices.filter((s) => s !== id));
      }
    } else {
      if (walkInServices.length < 3) {
        setWalkInServices([...walkInServices, id]);
      }
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Metrics Bar (Optimized for 10-inch Tablet in Landscape) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-700/60 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('receptionTitle')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-[#D4A017] border border-[#D4A017]/30">
              Tablet Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{t('receptionSubtitle')}</p>
        </div>

        {/* Header Action & Quick Metrics */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-3 bg-gray-900/80 rounded-2xl p-2 border border-gray-800 text-xs">
            <div className="px-3 py-1">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">{t('totalActiveQueue')}</span>
              <strong className="text-base text-white font-mono">{getWaitingCount()}</strong>
            </div>
            <div className="h-6 w-px bg-gray-800" />
            <div className="px-3 py-1">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">{t('avgWaitTime')}</span>
              <strong className="text-base text-[#D4A017] font-mono">~{getTotalEstimatedWait()}m</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowWalkInModal(true)}
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-[#D4A017] hover:bg-amber-400 text-gray-950 font-black text-sm shadow-xl shadow-[#D4A017]/20 transition-all min-h-[44px] cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>{t('addWalkInBtn')}</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionAlert && (
        <div
          className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between shadow-lg animate-in fade-in duration-200 ${
            actionAlert.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-500/15 border-[#D4A017]/40 text-amber-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {actionAlert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-[#D4A017] shrink-0" />
            )}
            <span>{actionAlert.message}</span>
          </div>
          <button
            onClick={() => setActionAlert(null)}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3-Column Barber Cards (UI Tweak: 3-column row with progress bar on Tablet) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center">
            <Scissors className="w-4 h-4 mr-1.5 text-[#D4A017]" />
            {t('activeBarbers')} (3 Chairs)
          </h2>
          <span className="text-xs text-gray-400 font-medium">Click "Call Next" to auto-assign customer</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {barbers.map((barber) => {
            const isBusy = barber.status === 'Busy';
            const isOnBreak = barber.status === 'On Break';
            const isAvailable = barber.status === 'Available';

            // Simulated progress percentage for active service
            const progress = isBusy ? 65 : 0;

            return (
              <div
                key={barber.id}
                className={`bg-[#111827]/90 rounded-3xl border p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all ${
                  isBusy
                    ? 'border-amber-500/40'
                    : isAvailable
                    ? 'border-emerald-500/40'
                    : 'border-gray-800 opacity-75'
                }`}
              >
                {/* Barber Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shadow-md ${
                        isAvailable
                          ? 'bg-emerald-500 text-gray-950'
                          : isBusy
                          ? 'bg-[#D4A017] text-gray-950'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {barber.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white text-base">{barber.name}</p>
                      <span
                        className={`inline-flex items-center text-xs font-semibold ${
                          isAvailable
                            ? 'text-emerald-400'
                            : isBusy
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {isAvailable && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                        {isBusy && <Clock className="w-3.5 h-3.5 mr-1" />}
                        {isOnBreak && <Coffee className="w-3.5 h-3.5 mr-1" />}
                        {barber.status}
                      </span>
                    </div>
                  </div>

                  {barber.currentCustomerToken && (
                    <span className="px-3 py-1 rounded-xl bg-gray-900 border border-amber-500/40 text-[#D4A017] font-mono text-xs font-black">
                      {barber.currentCustomerToken}
                    </span>
                  )}
                </div>

                {/* Current Customer & Progress Bar */}
                <div className="bg-gray-900/80 rounded-2xl p-3.5 border border-gray-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      {isBusy && barber.currentCustomerName
                        ? `Client: ${barber.currentCustomerName}`
                        : isAvailable
                        ? 'Chair Empty • Ready'
                        : 'On Rest Break'}
                    </span>
                    {isBusy && <span className="font-mono text-amber-300 font-bold">{progress}%</span>}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isBusy ? 'bg-gradient-to-r from-[#D4A017] to-amber-400' : 'bg-transparent'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Barber Action Button */}
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    disabled={isOnBreak}
                    onClick={() => handleCallNext(barber.id)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#D4A017] hover:bg-amber-400 disabled:opacity-40 text-gray-950 font-black text-xs flex items-center justify-center space-x-1.5 transition-all min-h-[44px] cursor-pointer shadow-md"
                  >
                    <PhoneCall className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{t('callNextBtn')}</span>
                  </button>

                  {isBusy && (
                    <button
                      type="button"
                      onClick={() => completeBarberService(barber.id)}
                      className="px-3 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-all min-h-[44px] cursor-pointer"
                      title="Finish active service and free chair"
                    >
                      Done
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Waiting List Section */}
      <div className="bg-[#111827]/90 rounded-3xl border border-gray-700/60 p-5 sm:p-6 space-y-5 shadow-2xl">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-gray-800/90 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-[#D4A017] min-h-[44px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setFilterWaitingOnly(false)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] cursor-pointer ${
                !filterWaitingOnly
                  ? 'bg-[#D4A017] text-gray-950 shadow-sm'
                  : 'bg-gray-800 text-gray-300 hover:text-white'
              }`}
            >
              {t('filterAll')} ({queue.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterWaitingOnly(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] cursor-pointer ${
                filterWaitingOnly
                  ? 'bg-[#D4A017] text-gray-950 shadow-sm'
                  : 'bg-gray-800 text-gray-300 hover:text-white'
              }`}
            >
              {t('filterWaiting')} ({getWaitingCount()})
            </button>
          </div>
        </div>

        {/* Waiting List Items */}
        {filteredQueue.length === 0 ? (
          <div className="py-12 text-center text-gray-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-base font-bold text-white">{t('emptyQueueMsg')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQueue.map((item) => {
              const isOver60 = item.estimatedWaitMinutes >= 60 && item.status === 'Waiting';
              const prefBarber = barbers.find((b) => b.id === item.preferredBarberId);
              const serviceNames = services
                .filter((s) => item.serviceIds.includes(s.id))
                .map((s) => (language === 'gu' ? s.nameGu : s.nameEn))
                .join(', ');

              return (
                <div
                  key={item.token}
                  className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    isOver60
                      ? 'bg-amber-950/20 border-amber-500/70 shadow-md shadow-amber-950/40'
                      : 'bg-gray-800/60 border-gray-700/60 hover:border-gray-600'
                  }`}
                >
                  {/* Left: Token & Customer Details */}
                  <div className="flex items-center space-x-3.5">
                    <div className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-700 font-mono text-base font-black text-[#D4A017] shrink-0">
                      {item.token}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{item.customerName}</span>
                        <span className="text-xs text-gray-400 font-mono">({item.customerPhone})</span>
                        {isOver60 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Flame className="w-3 h-3 mr-0.5" />
                            {t('over60Badge')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-300">
                        {serviceNames || 'Haircut'} • Total: <strong className="text-gray-200">₹{item.totalPrice}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Middle: Barber Preference & Status */}
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-gray-400">
                      Barber:{' '}
                      <strong className="text-white">
                        {prefBarber ? prefBarber.name : t('anyBarber')}
                      </strong>
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-full font-bold ${
                        item.status === 'Waiting'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : item.status === 'Called'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                          : item.status === 'In Chair'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {item.status}
                    </span>

                    <span className={`font-mono font-bold ${isOver60 ? 'text-amber-400' : 'text-gray-300'}`}>
                      ~{item.estimatedWaitMinutes}m
                    </span>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-2 justify-end">
                    {item.status === 'Waiting' || item.status === 'Called' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setNoShowTarget(item)}
                          className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-amber-900/40 text-amber-300 border border-gray-700 text-xs font-bold flex items-center space-x-1 min-h-[44px] cursor-pointer"
                          title={t('markNoShowBtn')}
                        >
                          <UserX className="w-4 h-4" />
                          <span className="hidden sm:inline">{t('markNoShowBtn')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCancelTarget(item)}
                          className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-rose-900/40 text-rose-300 border border-gray-700 text-xs font-bold flex items-center space-x-1 min-h-[44px] cursor-pointer"
                          title={t('cancelEntryBtn')}
                        >
                          <XCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">{t('cancelEntryBtn')}</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500 italic">Archived</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* [+ Add Walk-in] Modal Quick Form */}
      {showWalkInModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowWalkInModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-black text-white">{t('addWalkInTitle')}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{t('addWalkInSubtitle')}</p>
            </div>

            {walkInError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-1.5 shrink-0" />
                {walkInError}
              </div>
            )}

            <form onSubmit={handleWalkInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  {t('nameLabel')} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    placeholder={t('namePlaceholder')}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4A017] min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  {t('phoneLabel')} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('phonePlaceholder')}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-[#D4A017] min-h-[44px]"
                  />
                </div>
              </div>

              {/* Service Cards (max 3) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase text-gray-400">
                    {t('servicesLabel')}
                  </label>
                  <span className="text-xs text-[#D4A017] font-bold">{walkInServices.length}/3</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {services.map((s) => {
                    const isSel = walkInServices.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleWalkInService(s.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all min-h-[44px] flex items-center justify-between ${
                          isSel
                            ? 'bg-[#D4A017]/20 border-[#D4A017] text-white font-bold'
                            : 'bg-gray-800 border-gray-700 text-gray-300'
                        }`}
                      >
                        <span className="truncate">{language === 'gu' ? s.nameGu : s.nameEn}</span>
                        {isSel && <Check className="w-3.5 h-3.5 text-[#D4A017] shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Barber Picker */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  {t('barberLabel')}
                </label>
                <select
                  value={walkInBarber}
                  onChange={(e) => setWalkInBarber(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4A017] min-h-[44px]"
                >
                  <option value="any">{t('anyBarber')}</option>
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#D4A017] hover:bg-amber-400 text-gray-950 font-black text-sm min-h-[48px] shadow-lg cursor-pointer"
                >
                  Register Walk-in Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: No-show */}
      {noShowTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-black text-white">{t('confirmNoShowTitle')}</h3>
            <p className="text-xs text-gray-400">
              {t('confirmNoShowDesc')
                .replace('#customer', noShowTarget.customerName)
                .replace('#token', noShowTarget.token)}
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setNoShowTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  markNoShow(noShowTarget.token);
                  setNoShowTarget(null);
                  setActionAlert({
                    type: 'warning',
                    message: `Customer ${noShowTarget.token} marked as No-show.`,
                  });
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-gray-950 font-black text-xs min-h-[44px] cursor-pointer"
              >
                Confirm No-Show
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Cancel */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-black text-white">{t('confirmCancelTitle')}</h3>
            <p className="text-xs text-gray-400">
              {t('confirmCancelDesc')
                .replace('#customer', cancelTarget.customerName)
                .replace('#token', cancelTarget.token)}
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold min-h-[44px] cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelEntry(cancelTarget.token);
                  setCancelTarget(null);
                  setActionAlert({
                    type: 'warning',
                    message: `Customer ${cancelTarget.token} cancelled from queue.`,
                  });
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs min-h-[44px] cursor-pointer"
              >
                Cancel Spot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
