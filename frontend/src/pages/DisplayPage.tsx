import React, { useState, useEffect } from 'react';
import { useLanguageStore } from '../store/useLanguageStore';
import { useQueueStore } from '../store/useQueueStore';
import {
  Tv,
  Sparkles,
  Clock,
  Volume2,
  VolumeX,
  Bell,
  Scissors,
  CheckCircle2,
  Coffee,
} from 'lucide-react';

export const DisplayPage: React.FC = () => {
  const { t, language } = useLanguageStore();
  const { barbers, queue, services } = useQueueStore();

  // Live wall clock for TV display
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sound chime toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Check for any newly called customer
  const calledCustomer = queue.find((q) => q.status === 'Called');
  const calledBarber = barbers.find((b) => b.id === calledCustomer?.assignedBarberId);

  // Trigger TV chime when a customer is called
  useEffect(() => {
    if (calledCustomer && soundEnabled) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const now = ctx.currentTime;

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.2);
        }
      } catch {
        // audio policy fallback
      }
    }
  }, [calledCustomer?.token, soundEnabled]);

  // Next 5 waiting tokens
  const upNextTokens = queue.filter((q) => q.status === 'Waiting').slice(0, 5);

  return (
    <div className="w-full min-h-[85vh] flex flex-col justify-between space-y-6 sm:space-y-8 select-none py-2">
      {/* Top Header: Salon Branding, Live Clock & Audio Toggle (Readable from 5 metres) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-gray-700/60 pb-5">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-3xl bg-[#D4A017] text-gray-950 flex items-center justify-center shadow-xl shadow-[#D4A017]/25">
            <Tv className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
              {t('tvDisplayTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-medium">{t('tvSubtitle')}</p>
          </div>
        </div>

        {/* Live Digital Clock & Chime Toggle */}
        <div className="flex items-center space-x-4">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-2xl px-5 py-2 flex items-center space-x-2.5 shadow-lg">
            <Clock className="w-5 h-5 text-[#D4A017]" />
            <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-wider">
              {currentTime}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-2xl border transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ${
              soundEnabled
                ? 'bg-amber-500/15 border-[#D4A017] text-[#D4A017]'
                : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
            title={soundEnabled ? t('soundOn') : t('soundOff')}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Flashing Gold Call Alert Banner when a token is Called */}
      {calledCustomer && (
        <div className="bg-gradient-to-r from-[#D4A017] via-amber-300 to-[#D4A017] text-gray-950 p-4 sm:p-5 rounded-3xl flex items-center justify-center space-x-3 shadow-2xl animate-pulse">
          <Bell className="w-7 h-7 stroke-[3] animate-bounce shrink-0" />
          <p className="text-lg sm:text-2xl font-black tracking-tight text-center">
            {t('newlyCalledBanner')
              .replace('#token', calledCustomer.token)
              .replace('#barber', calledBarber?.name || 'Stylist')}
          </p>
        </div>
      )}

      {/* Active Barber Chairs (Row of 3 Chairs) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm uppercase tracking-widest text-[#D4A017] font-black flex items-center">
            <Scissors className="w-4 h-4 mr-2" />
            {t('nowServing')}
          </h2>
          <span className="text-xs text-gray-400 font-mono">Live Chair Status</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {barbers.map((barber) => {
            const isCalled = barber.currentCustomerToken === calledCustomer?.token;
            const isBusy = barber.status === 'Busy';
            const isOnBreak = barber.status === 'On Break';
            const isAvailable = barber.status === 'Available';

            // Find current serving customer details
            const currentServingCustomer = queue.find(
              (q) => q.token === barber.currentCustomerToken
            );
            const currentServiceNames = services
              .filter((s) => currentServingCustomer?.serviceIds.includes(s.id))
              .map((s) => (language === 'gu' ? s.nameGu : s.nameEn))
              .join(' + ');

            return (
              <div
                key={barber.id}
                className={`bg-[#111827] rounded-3xl p-6 sm:p-7 flex flex-col justify-between border-2 transition-all shadow-2xl relative overflow-hidden ${
                  isCalled
                    ? 'border-[#D4A017] ring-4 ring-amber-500/30 animate-pulse bg-gradient-to-b from-amber-950/40 to-[#111827]'
                    : isBusy
                    ? 'border-gray-700/80'
                    : isAvailable
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-gray-800 opacity-60'
                }`}
              >
                {/* Stylist Avatar & Name */}
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gray-800 border-2 border-[#D4A017] text-[#D4A017] font-black text-xl flex items-center justify-center shadow-md">
                      {barber.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xl font-black text-white">{barber.name}</p>
                      <span
                        className={`inline-flex items-center text-xs font-bold ${
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

                  {isCalled && (
                    <span className="px-3 py-1 rounded-xl bg-[#D4A017] text-gray-950 font-black text-xs uppercase animate-bounce">
                      Calling!
                    </span>
                  )}
                </div>

                {/* Giant Serving Token (Readable from 5 metres) */}
                <div className="py-6 text-center space-y-2">
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                    {t('tokenServing')}
                  </p>
                  <p
                    className={`font-mono text-5xl sm:text-6xl font-black tracking-widest ${
                      barber.currentCustomerToken
                        ? 'text-[#D4A017]'
                        : 'text-gray-600'
                    }`}
                  >
                    {barber.currentCustomerToken || '—'}
                  </p>
                  <p className="text-sm font-bold text-gray-200 truncate">
                    {barber.currentCustomerName || (isOnBreak ? t('chairBreak') : t('chairIdle'))}
                  </p>
                  {currentServiceNames && (
                    <p className="text-xs text-gray-400 truncate">{currentServiceNames}</p>
                  )}
                </div>

                {/* Chair Footer Indicator */}
                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
                  <span>Chair {barber.name}</span>
                  <span className="font-mono text-[#D4A017]">
                    {isBusy ? 'In Service' : isAvailable ? 'Ready' : 'Rest'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Up Next List (Next 5 Queue Tokens) */}
      <div className="bg-[#111827] rounded-3xl border border-gray-700/60 p-6 sm:p-7 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm uppercase tracking-widest text-[#D4A017] font-black flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            {t('upNextTitle')}
          </h2>
          <span className="text-xs text-gray-400">{upNextTokens.length} waiting</span>
        </div>

        {upNextTokens.length === 0 ? (
          <p className="py-6 text-center text-gray-400 text-sm">{t('emptyQueueMsg')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            {upNextTokens.map((item, index) => {
              const prefBarber = barbers.find((b) => b.id === item.preferredBarberId);
              return (
                <div
                  key={item.token}
                  className={`p-4 rounded-2xl border text-center space-y-1.5 transition-all ${
                    index === 0
                      ? 'bg-amber-500/15 border-[#D4A017] shadow-lg shadow-amber-950/40 ring-2 ring-[#D4A017]/30'
                      : 'bg-gray-800/70 border-gray-700/70'
                  }`}
                >
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                    #{index + 1} Next
                  </span>
                  <p className="text-3xl font-mono font-black text-white tracking-wider">
                    {item.token}
                  </p>
                  <p className="text-xs font-bold text-gray-200 truncate">{item.customerName}</p>
                  <div className="pt-1 flex items-center justify-center space-x-1.5 text-[11px]">
                    <span className="text-gray-400 truncate">
                      {prefBarber ? prefBarber.name : 'Any'}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-[#D4A017] font-bold font-mono">
                      ~{item.estimatedWaitMinutes}m
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Auto-Refresh Footer Notice */}
      <div className="text-center text-xs text-gray-500 py-1">
        <p>{t('autoRefreshNotice')}</p>
      </div>
    </div>
  );
};
