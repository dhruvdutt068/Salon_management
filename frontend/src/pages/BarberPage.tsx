import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../store/useLanguageStore';
import { useQueueStore } from '../store/useQueueStore';
import {
  Scissors,
  Play,
  CheckCircle,
  Coffee,
  Clock,
  User,
  ArrowRight,
  AlertCircle,
  PhoneCall,
  Check,
} from 'lucide-react';

export const BarberPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguageStore();

  const {
    barbers,
    services,
    queue,
    startBarberService,
    completeBarberService,
    toggleBarberBreak,
    callNextForBarber,
    getNextCustomerForBarber,
  } = useQueueStore();

  // Match barber by name (case-insensitive) or default to Ravi
  const currentBarber =
    barbers.find((b) => b.name.toLowerCase() === (name || 'ravi').toLowerCase()) || barbers[0];

  const isOnBreak = currentBarber.status === 'On Break';

  // Find active customer assigned to this barber
  const activeCustomer = queue.find(
    (q) =>
      (q.assignedBarberId === currentBarber.id || currentBarber.currentCustomerToken === q.token) &&
      (q.status === 'Called' || q.status === 'In Chair')
  );

  // Next customer in queue waiting for this barber or Any
  const nextCustomer = getNextCustomerForBarber(currentBarber.id);

  // Elapsed timer calculation
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  useEffect(() => {
    if (!activeCustomer || activeCustomer.status !== 'In Chair') {
      setElapsedSeconds(0);
      return;
    }

    const startTimestamp = activeCustomer.startedAt
      ? new Date(activeCustomer.startedAt).getTime()
      : Date.now();

    const updateTimer = () => {
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - startTimestamp) / 1000));
      setElapsedSeconds(diffSecs);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeCustomer]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    startBarberService(currentBarber.id);
    setActionAlert(t('serviceStartedAlert').replace('#token', activeCustomer?.token || ''));
    setTimeout(() => setActionAlert(null), 4000);
  };

  const handleDone = () => {
    const token = activeCustomer?.token || '';
    completeBarberService(currentBarber.id);
    setActionAlert(t('serviceFinishedAlert').replace('#token', token));
    setTimeout(() => setActionAlert(null), 4000);
  };

  const handleCallNext = () => {
    const res = callNextForBarber(currentBarber.id);
    if (res.success && res.customer) {
      setActionAlert(`Called ${res.customer.token} (${res.customer.customerName})!`);
    } else {
      setActionAlert(res.message || 'No clients waiting.');
    }
    setTimeout(() => setActionAlert(null), 4000);
  };

  const activeServices = services.filter((s) => activeCustomer?.serviceIds.includes(s.id));
  const nextServices = services.filter((s) => nextCustomer?.serviceIds.includes(s.id));

  return (
    <div className="max-w-md mx-auto w-full py-4 sm:py-6 space-y-5">
      {/* Stylist Selector Chips */}
      <div className="bg-gray-900/90 rounded-2xl border border-gray-800 p-2.5 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider pl-2 flex items-center">
          <Scissors className="w-3.5 h-3.5 mr-1 text-[#D4A017]" />
          Stylist:
        </span>
        <div className="flex space-x-1">
          {barbers.map((b) => (
            <button
              key={b.id}
              onClick={() => navigate(`/barber/${b.name}`)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] cursor-pointer ${
                b.id === currentBarber.id
                  ? 'bg-[#D4A017] text-gray-950 font-black shadow-md'
                  : 'bg-gray-800 text-gray-300 hover:text-white'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Barber Header Card with Break Toggle */}
      <div className="bg-[#111827] rounded-3xl border border-gray-700/60 p-5 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#D4A017] text-gray-950 flex items-center justify-center font-black text-xl shadow-lg shadow-[#D4A017]/20">
            {currentBarber.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-black text-white">{currentBarber.name}</h1>
            <span
              className={`inline-flex items-center text-xs font-bold ${
                isOnBreak
                  ? 'text-rose-400'
                  : currentBarber.status === 'Busy'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {isOnBreak ? <Coffee className="w-3.5 h-3.5 mr-1" /> : <Clock className="w-3.5 h-3.5 mr-1" />}
              {currentBarber.status}
            </span>
          </div>
        </div>

        {/* Break Mode Toggle Button */}
        <button
          type="button"
          onClick={() => toggleBarberBreak(currentBarber.id)}
          className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all min-h-[44px] cursor-pointer ${
            isOnBreak
              ? 'bg-rose-500/20 border-rose-500 text-rose-300'
              : 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white hover:border-gray-600'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>{isOnBreak ? t('toggleAvailable') : t('toggleBreak')}</span>
        </button>
      </div>

      {/* Action Notification Alert */}
      {actionAlert && (
        <div className="p-3.5 rounded-2xl bg-[#D4A017]/15 border border-[#D4A017]/40 text-amber-200 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-[#D4A017] shrink-0" />
            <span>{actionAlert}</span>
          </div>
          <button onClick={() => setActionAlert(null)} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* On Break Warning Card */}
      {isOnBreak && (
        <div className="bg-rose-500/10 border-2 border-rose-500/30 rounded-3xl p-5 text-center space-y-2 text-rose-300">
          <Coffee className="w-8 h-8 text-rose-400 mx-auto" />
          <h2 className="text-sm font-bold text-white">Break Mode Active</h2>
          <p className="text-xs text-rose-200">{t('onBreakAlert')}</p>
        </div>
      )}

      {/* Active Customer Card */}
      <div className="bg-[#111827] rounded-3xl border-2 border-[#D4A017]/80 p-6 space-y-5 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/5 rounded-bl-full pointer-events-none" />

        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <span className="text-xs uppercase tracking-wider text-[#D4A017] font-black flex items-center">
            <User className="w-3.5 h-3.5 mr-1" />
            {t('currentCustomer')}
          </span>
          {activeCustomer && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                activeCustomer.status === 'In Chair'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
              }`}
            >
              {activeCustomer.status}
            </span>
          )}
        </div>

        {activeCustomer ? (
          <div className="space-y-4">
            {/* Token & Client Details */}
            <p className="text-6xl font-mono font-black text-white tracking-widest">
              {activeCustomer.token}
            </p>
            <div>
              <p className="text-xl font-bold text-white">{activeCustomer.customerName}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {activeServices.map((s) => (language === 'gu' ? s.nameGu : s.nameEn)).join(' + ')} • ₹{activeCustomer.totalPrice}
              </p>
            </div>

            {/* Service Timer */}
            <div className="bg-gray-800/90 rounded-2xl p-4 border border-gray-700 flex flex-col items-center justify-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center">
                <Clock className="w-3 h-3 mr-1 text-[#D4A017]" />
                {t('elapsedTimer')}
              </span>
              <span className="text-4xl font-mono font-black text-white tracking-widest">
                {activeCustomer.status === 'In Chair' ? formatTimer(elapsedSeconds) : '00:00'}
              </span>
              <span className="text-[11px] text-gray-400">
                Scheduled: {activeCustomer.totalDurationMinutes} min
              </span>
            </div>

            {/* Big Phone-Friendly Action Buttons (Minimum 48px height) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleStart}
                disabled={activeCustomer.status === 'In Chair'}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-black text-sm flex items-center justify-center space-x-2 min-h-[52px] shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 stroke-[3]" />
                <span>{t('startServiceBtn')}</span>
              </button>

              <button
                type="button"
                onClick={handleDone}
                disabled={activeCustomer.status !== 'In Chair'}
                className="w-full py-4 rounded-2xl bg-[#D4A017] hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-[#D4A017] text-gray-950 font-black text-sm flex items-center justify-center space-x-2 min-h-[52px] shadow-lg shadow-[#D4A017]/25 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{t('doneServiceBtn')}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Empty Chair State */
          <div className="py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto text-gray-500">
              <Scissors className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-white text-base">{t('noCustomerInChair')}</p>
              <p className="text-xs text-gray-400 mt-1">Tap below to call the next customer in queue</p>
            </div>
            <button
              type="button"
              disabled={isOnBreak}
              onClick={handleCallNext}
              className="px-6 py-3.5 rounded-2xl bg-[#D4A017] hover:bg-amber-400 disabled:opacity-40 text-gray-950 font-black text-sm inline-flex items-center space-x-2 shadow-lg shadow-[#D4A017]/20 min-h-[48px] cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t('callNextClient')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Next Up For You Preview Card */}
      <div className="bg-[#111827] rounded-3xl border border-gray-800 p-5 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {t('nextCustomerLabel')}
        </p>

        {nextCustomer ? (
          <div className="bg-gray-800/80 rounded-2xl p-3.5 border border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-base font-black text-[#D4A017] px-2.5 py-1 bg-gray-900 rounded-lg border border-gray-700">
                {nextCustomer.token}
              </span>
              <div>
                <p className="font-bold text-white text-sm">{nextCustomer.customerName}</p>
                <p className="text-xs text-gray-400">
                  {nextServices.map((s) => (language === 'gu' ? s.nameGu : s.nameEn)).join(', ')} ({nextCustomer.totalDurationMinutes}m)
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-300">Up Next</span>
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic py-2">{t('nobodyNext')}</p>
        )}
      </div>
    </div>
  );
};
