import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguageStore } from '../store/useLanguageStore';
import { useQueueStore } from '../store/useQueueStore';
import type { QueueStatus } from '../types';
import {
  Bell,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Scissors,
  Check,
  RotateCcw,
  Volume2,
  ShieldAlert,
  LogIn,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const MyStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguageStore();
  const {
    getEntryByToken,
    cancelEntry,
    updateEntryStatus,
    setSimulatedPosition,
    barbers,
    services,
    queue,
  } = useQueueStore();
  const { user, isAuthenticated } = useAuthStore();

  const tokenParam = id || 'S-014';
  const entry = getEntryByToken(tokenParam);

  // Fallback defaults if visiting a direct token not yet in store
  const token = entry ? entry.token : tokenParam;
  const status: QueueStatus = entry ? entry.status : 'Waiting';
  const position = entry ? entry.computedPosition : 2;
  const waitMins = entry ? entry.estimatedWaitMinutes : 20;
  const customerName = entry ? entry.customerName : 'Rahul Sharma';
  const assignedBarber = barbers.find((b) => b.id === entry?.assignedBarberId) || barbers[0];

  const selectedServices = services.filter((s) => entry?.serviceIds.includes(s.id));

  // Modals & local state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCalledModal, setShowCalledModal] = useState(status === 'Called');
  const [secondsRemaining, setSecondsRemaining] = useState(waitMins * 60);

  // Auto-trigger full-screen gold alert if status transitions to Called
  useEffect(() => {
    if (status === 'Called') {
      setShowCalledModal(true);
      playChimeAndVibrate();
    } else {
      setShowCalledModal(false);
    }
  }, [status]);

  // Countdown timer effect
  useEffect(() => {
    if (status !== 'Waiting' || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [status, secondsRemaining]);

  // Audio chime & phone vibration synthesis
  const playChimeAndVibrate = () => {
    try {
      // Gentle dual-tone chime using Web Audio API
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        // Tone 1
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.6);

        // Tone 2 (Higher, pleasing harmonic)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, now + 0.25); // A5
        gain2.gain.setValueAtTime(0.35, now + 0.25);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.25);
        osc2.stop(now + 1.2);
      }

      // Phone vibration API (gentle pulse: vibrate 200ms, pause 100ms, vibrate 200ms)
      if (navigator.vibrate) {
        navigator.vibrate([250, 100, 250]);
      }
    } catch {
      // Audio/vibrate unavailable or blocked by browser policy
    }
  };

  const handleCancelSpot = () => {
    cancelEntry(token);
    setShowCancelModal(false);
  };

  // Circular timer calculations
  const totalSeconds = Math.max(waitMins * 60, 60);
  const progressPercent = Math.min(100, Math.max(0, (secondsRemaining / totalSeconds) * 100));
  const circleRadius = 58;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const displayMinutes = Math.floor(secondsRemaining / 60);
  const displaySeconds = secondsRemaining % 60;

  // Simulator actions for demonstration
  const handleSimulateStatus = (newStatus: QueueStatus, newPos: number) => {
    updateEntryStatus(token, newStatus, assignedBarber.id);
    setSimulatedPosition(token, newPos);
    if (newStatus === 'Waiting') {
      setSecondsRemaining(newPos === 2 ? 12 * 60 : 35 * 60);
    }
  };

  // Find my own ticket if any
  const myTicket = queue.find(
    (q) =>
      (user && (q.customerPhone === user.phone || q.customerPhone === user.username)) ||
      (typeof window !== 'undefined' && q.token === localStorage.getItem('my_active_token'))
  );

  // Check if current user is authorized to view this ticket
  const isAuthorized = (() => {
    // 1. Staff roles (Admin & Receptionist) can inspect any ticket for support
    if (user?.role === 'admin' || user?.role === 'receptionist') {
      return true;
    }

    // 2. If ticket does not exist in store, cannot view
    if (!entry) {
      return false;
    }

    // 3. If logged in as customer:
    if (user?.role === 'customer') {
      return entry.customerPhone === user.phone || entry.customerPhone === user.username;
    }

    // 4. If logged in as barber:
    if (user?.role === 'barber') {
      return entry.assignedBarberId === user.barber_id || entry.preferredBarberId === user.barber_id;
    }

    // 5. Unauthenticated / Guest:
    // Only allowed if this ticket was created in their current browser session
    const localActiveToken = typeof window !== 'undefined' ? localStorage.getItem('my_active_token') : null;
    return !!localActiveToken && localActiveToken.toUpperCase() === entry.token.toUpperCase();
  })();

  // Customer Privacy Barrier Screen
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-gray-900 border-2 border-rose-500/40 rounded-3xl text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-white">Private Queue Ticket</h2>
          <p className="text-xs text-rose-300 font-mono font-bold">Ticket: {tokenParam}</p>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          This ticket belongs to another customer and cannot be viewed. For privacy and security, you can only view tickets associated with your account or phone number.
        </p>

        <div className="space-y-2 pt-2">
          {myTicket && myTicket.token !== tokenParam && (
            <Link
              to={`/status/${myTicket.token}`}
              className="w-full py-3 px-4 rounded-xl bg-[#D4A017] text-gray-950 font-black text-xs flex items-center justify-center min-h-[44px] shadow-lg shadow-[#D4A017]/20"
            >
              <span>Go to My Active Ticket ({myTicket.token})</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          )}

          {!isAuthenticated && (
            <Link
              to="/login"
              className="w-full py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs flex items-center justify-center min-h-[44px] border border-gray-700"
            >
              <LogIn className="w-4 h-4 mr-1.5" />
              <span>Sign In to Verify Ownership</span>
            </Link>
          )}

          <Link
            to="/join"
            className="w-full py-3 px-4 rounded-xl bg-gray-800/60 hover:bg-gray-800 text-gray-300 font-semibold text-xs flex items-center justify-center min-h-[44px]"
          >
            <span>Join the Live Queue</span>
          </Link>

          <Link
            to="/"
            className="w-full py-2.5 px-4 text-xs text-gray-400 hover:text-white flex items-center justify-center min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto w-full py-4 sm:py-6 space-y-6 text-center">
      {/* Top Bar with Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center text-xs text-gray-400 hover:text-white min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {t('backHomeBtn')}
        </Link>
        <div className="flex items-center space-x-1 text-xs text-[#D4A017] font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live Token Tracker</span>
        </div>
      </div>

      {/* Screen Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {t('statusTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Customer: <strong className="text-gray-200">{customerName}</strong>
          {selectedServices.length > 0 && (
            <span> • {selectedServices.map((s) => (language === 'gu' ? s.nameGu : s.nameEn)).join(', ')}</span>
          )}
        </p>
      </div>

      {/* Main Token & Status Card */}
      <div className="bg-[#111827] rounded-3xl border-2 border-[#D4A017] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#D4A017]/10 rounded-full blur-3xl pointer-events-none" />

        <p className="text-xs uppercase tracking-widest text-[#D4A017] font-black mb-1">
          {t('tokenLabel')}
        </p>
        <p className="text-6xl sm:text-7xl font-black text-white font-mono tracking-widest my-2">
          {token}
        </p>

        {/* State-Specific Content */}
        {status === 'Cancelled' ? (
          <div className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
            <p className="font-bold text-base">{t('statusCancelledTitle')}</p>
            <p className="text-xs text-gray-400">{t('statusCancelledDesc')}</p>
            <Link
              to="/join"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#D4A017] text-gray-950 font-bold text-xs min-h-[44px] mt-2"
            >
              {t('rejoinQueueBtn')}
            </Link>
          </div>
        ) : status === 'Completed' ? (
          <div className="mt-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="font-bold text-lg text-white">{t('statusCompletedTitle')}</p>
            <p className="text-xs text-gray-300">{t('statusCompletedDesc')}</p>
            <Link
              to="/join"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#D4A017] text-gray-950 font-bold text-xs min-h-[44px] mt-2"
            >
              {t('rejoinQueueBtn')}
            </Link>
          </div>
        ) : status === 'In Chair' ? (
          <div className="mt-4 p-5 rounded-2xl bg-[#D4A017]/10 border border-[#D4A017]/40 space-y-2">
            <Scissors className="w-10 h-10 text-[#D4A017] mx-auto animate-bounce" />
            <p className="font-bold text-lg text-white">{t('statusInChairTitle')}</p>
            <p className="text-xs text-gray-300">
              {t('statusInChairDesc')} With stylist: <strong className="text-[#D4A017]">{assignedBarber.name}</strong>
            </p>
          </div>
        ) : (
          /* Waiting Status: Circular Countdown & Position */
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* SVG Circular Countdown Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                {/* Background Ring */}
                <circle
                  cx="70"
                  cy="70"
                  r={circleRadius}
                  stroke="#374151"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Ring */}
                <circle
                  cx="70"
                  cy="70"
                  r={circleRadius}
                  stroke="#D4A017"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              {/* Inner Countdown Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Clock className="w-4 h-4 text-[#D4A017] mb-0.5" />
                <span className="text-xl font-mono font-black text-white">
                  {displayMinutes}:{displaySeconds.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-gray-400 uppercase font-semibold">
                  {t('estimatedWaitLabel')}
                </span>
              </div>
            </div>

            {/* Position Stat Card */}
            <div className="flex-1 w-full sm:w-auto bg-gray-800/80 rounded-2xl p-4 border border-gray-700 space-y-1 text-center sm:text-left">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">
                {t('positionLabel')}
              </p>
              <div className="flex items-baseline justify-center sm:justify-start space-x-2">
                <span className="text-4xl font-black text-white">#{position}</span>
                <span className="text-xs text-amber-400 font-semibold">in line</span>
              </div>
              <p className="text-xs text-gray-400 pt-1">
                Barber: <strong className="text-gray-200">{assignedBarber.name}</strong>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* "Start coming to the salon" Alert Banner (Triggered when 2nd in line) */}
      {status === 'Waiting' && position === 2 && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-600/25 to-amber-500/20 border-2 border-[#D4A017] rounded-3xl p-5 flex items-start space-x-3.5 text-left shadow-lg animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-[#D4A017] text-gray-950 flex items-center justify-center shrink-0 shadow-md">
            <Bell className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-base font-extrabold text-amber-300">
              {t('alertStartComing')}
            </h3>
            <p className="text-xs text-gray-200">
              {t('alertStartComingSub')}
            </p>
          </div>
        </div>
      )}

      {/* Progress Timeline */}
      <div className="bg-[#111827]/85 rounded-3xl border border-gray-700/60 p-5 sm:p-6 text-left space-y-4 shadow-xl">
        <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
          Queue Progress
        </h3>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {/* Step 1: Waiting */}
          <div className="space-y-1.5">
            <div
              className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                status === 'Waiting'
                  ? 'bg-[#D4A017] text-gray-950 ring-4 ring-[#D4A017]/20 font-black'
                  : status === 'Cancelled'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-emerald-500 text-gray-950'
              }`}
            >
              {status !== 'Waiting' && status !== 'Cancelled' ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
            </div>
            <p className={`font-semibold ${status === 'Waiting' ? 'text-white' : 'text-gray-400'}`}>
              {t('statusStepWaiting')}
            </p>
          </div>

          {/* Step 2: Called */}
          <div className="space-y-1.5">
            <div
              className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                status === 'Called'
                  ? 'bg-[#D4A017] text-gray-950 ring-4 ring-[#D4A017]/20 font-black'
                  : status === 'In Chair' || status === 'Completed'
                  ? 'bg-emerald-500 text-gray-950'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              {status === 'In Chair' || status === 'Completed' ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
            </div>
            <p className={`font-semibold ${status === 'Called' ? 'text-white' : 'text-gray-400'}`}>
              {t('statusStepCalled')}
            </p>
          </div>

          {/* Step 3: In Chair */}
          <div className="space-y-1.5">
            <div
              className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                status === 'In Chair'
                  ? 'bg-[#D4A017] text-gray-950 ring-4 ring-[#D4A017]/20 font-black'
                  : status === 'Completed'
                  ? 'bg-emerald-500 text-gray-950'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              {status === 'Completed' ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
            </div>
            <p className={`font-semibold ${status === 'In Chair' ? 'text-white' : 'text-gray-400'}`}>
              {t('statusStepInChair')}
            </p>
          </div>

          {/* Step 4: Completed */}
          <div className="space-y-1.5">
            <div
              className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                status === 'Completed'
                  ? 'bg-emerald-500 text-gray-950 ring-4 ring-emerald-500/20 font-black'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              4
            </div>
            <p className={`font-semibold ${status === 'Completed' ? 'text-white' : 'text-gray-400'}`}>
              {t('statusStepDone')}
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Spot Button (Only allowed during Waiting status per rules) */}
      {status === 'Waiting' && (
        <div>
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 hover:underline min-h-[44px] px-4 cursor-pointer"
          >
            {t('cancelSpotBtn')}
          </button>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-black text-white">{t('cancelConfirmTitle')}</h3>
            <p className="text-xs text-gray-400">{t('cancelConfirmDesc')}</p>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold min-h-[44px] cursor-pointer"
              >
                {t('cancelConfirmNo')}
              </button>
              <button
                type="button"
                onClick={handleCancelSpot}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold min-h-[44px] cursor-pointer"
              >
                {t('cancelConfirmYes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Gold "It's your turn!" Modal when Called */}
      {showCalledModal && (
        <div className="fixed inset-0 bg-gradient-to-b from-[#f6c845] via-[#D4A017] to-amber-700 z-50 flex flex-col items-center justify-center p-6 text-center text-gray-950 animate-in fade-in duration-300">
          <div className="max-w-md w-full space-y-6">
            {/* Pulsing Bell Icon with sound badge */}
            <div className="w-24 h-24 rounded-full bg-gray-950/15 border-4 border-gray-950/20 flex items-center justify-center mx-auto animate-bounce shadow-2xl">
              <Bell className="w-12 h-12 text-gray-950 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gray-950/10 text-gray-950">
                <Volume2 className="w-3.5 h-3.5 mr-1" />
                Notification Chime
              </span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-950">
                {t('alertItsYourTurn')}
              </h2>
              <p className="text-lg font-bold text-gray-900">
                {t('alertGoToBarber')}: <span className="underline decoration-2 font-black">{assignedBarber.name}</span>
              </p>
            </div>

            {/* Token Badge */}
            <div className="bg-gray-950/90 text-white rounded-3xl p-5 border border-gray-900 shadow-2xl">
              <p className="text-xs uppercase tracking-widest text-[#D4A017] font-bold">Your Token</p>
              <p className="text-5xl font-mono font-black text-[#D4A017] mt-1">{token}</p>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => setShowCalledModal(false)}
              className="w-full py-4 rounded-2xl bg-gray-950 hover:bg-gray-900 text-white font-black text-base shadow-2xl transition-all cursor-pointer min-h-[56px]"
            >
              {t('chairHeadingBtn')}
            </button>
          </div>
        </div>
      )}

      {/* Simulator Bar (For TA/testing automated states easily) */}
      <div className="bg-gray-900/90 rounded-2xl border border-gray-800 p-4 space-y-2.5 text-left">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center">
            <RotateCcw className="w-3.5 h-3.5 mr-1 text-[#D4A017]" />
            {t('simulatorTitle')}
          </p>
          <span className="text-[10px] text-gray-500 font-mono">TA Verification</span>
        </div>
        <p className="text-[11px] text-gray-400">{t('simulatorDesc')}</p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => handleSimulateStatus('Waiting', 3)}
            className="px-2 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-semibold min-h-[36px]"
          >
            {t('simPos3')}
          </button>
          <button
            type="button"
            onClick={() => handleSimulateStatus('Waiting', 2)}
            className="px-2 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/30 min-h-[36px]"
          >
            {t('simPos2')}
          </button>
          <button
            type="button"
            onClick={() => handleSimulateStatus('Called', 1)}
            className="px-2 py-1.5 rounded-lg bg-[#D4A017] hover:bg-amber-400 text-gray-950 text-[11px] font-black min-h-[36px]"
          >
            {t('simCalled')}
          </button>
          <button
            type="button"
            onClick={() => handleSimulateStatus('In Chair', 0)}
            className="px-2 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold min-h-[36px]"
          >
            {t('simInChair')}
          </button>
          <button
            type="button"
            onClick={() => handleSimulateStatus('Completed', 0)}
            className="px-2 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-semibold min-h-[36px]"
          >
            {t('simDone')}
          </button>
        </div>
      </div>
    </div>
  );
};
