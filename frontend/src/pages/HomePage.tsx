import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '../store/useLanguageStore';
import { useQueueStore } from '../store/useQueueStore';
import {
  Users,
  Clock,
  Scissors,
  ArrowRight,
  CheckCircle2,
  Coffee,
  Sparkles,
  Wind,
  Shield,
  Wifi,
  AlertTriangle,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t } = useLanguageStore();
  const { barbers, getWaitingCount, getTotalEstimatedWait, isQueueOpen } = useQueueStore();

  const waitingCount = getWaitingCount();
  const estimatedWait = getTotalEstimatedWait();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {t('statusAvailable')}
          </span>
        );
      case 'Busy':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3 mr-1" />
            {t('statusBusy')}
          </span>
        );
      case 'On Break':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Coffee className="w-3 h-3 mr-1" />
            {t('statusOnBreak')}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center max-w-2xl mx-auto w-full py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Hero Welcome & Salon Info */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/30">
          <Scissors className="w-3.5 h-3.5 mr-1.5" />
          <span>{isQueueOpen ? t('closingBadge') : t('queueClosedBadge')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          {t('salonName')}
        </h1>
        <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto">
          {t('homeWelcome')}
        </p>
      </div>

      {/* Live Queue Card */}
      <div className="w-full bg-[#111827]/90 rounded-3xl border border-gray-700/60 p-6 sm:p-7 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-5">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-300">
              {t('liveQueueTitle')}
            </h2>
          </div>
          <span className="text-xs text-gray-400 font-mono">Real-time</span>
        </div>

        <div className="grid grid-cols-2 gap-4 divide-x divide-gray-800">
          <div className="text-center px-2">
            <p className="text-4xl sm:text-5xl font-black text-white font-mono">{waitingCount}</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">{t('peopleWaiting')}</p>
          </div>
          <div className="text-center px-2">
            <p className="text-4xl sm:text-5xl font-black text-[#D4A017] font-mono">
              ~{estimatedWait}
            </p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">
              {t('aboutWait')} {estimatedWait} {t('minWait')}
            </p>
          </div>
        </div>
      </div>

      {/* Barbers on Duty Chips */}
      <div className="w-full bg-gray-900/60 rounded-3xl border border-gray-800 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center">
            <Sparkles className="w-4 h-4 mr-1.5 text-[#D4A017]" />
            {t('barberAvailability')}
          </h3>
          <span className="text-xs text-gray-400">
            {barbers.filter((b) => b.status !== 'On Break').length} / {barbers.length} Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="bg-gray-800/80 border border-gray-700/60 rounded-2xl p-3.5 flex flex-col justify-between space-y-2 hover:border-gray-600 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-[#D4A017] border border-gray-600">
                    {barber.name.charAt(0)}
                  </div>
                  <span className="font-bold text-sm text-white">{barber.name}</span>
                </div>
                {getStatusBadge(barber.status)}
              </div>

              <p className="text-xs text-gray-400 truncate">
                {barber.status === 'Busy' && barber.currentCustomerName
                  ? `${t('barberBusyWith')} ${barber.currentCustomerName}`
                  : barber.status === 'Available'
                  ? t('barberIdleReady')
                  : t('barberBreakNotice')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Salon Amenities / Highlights */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-2.5 flex items-center justify-center space-x-1.5 text-gray-300 text-xs">
          <Wind className="w-3.5 h-3.5 text-[#D4A017]" />
          <span>{t('highlightAc')}</span>
        </div>
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-2.5 flex items-center justify-center space-x-1.5 text-gray-300 text-xs">
          <Shield className="w-3.5 h-3.5 text-[#D4A017]" />
          <span>{t('highlightHygiene')}</span>
        </div>
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-2.5 flex items-center justify-center space-x-1.5 text-gray-300 text-xs">
          <Scissors className="w-3.5 h-3.5 text-[#D4A017]" />
          <span>{t('highlightStylists')}</span>
        </div>
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-2.5 flex items-center justify-center space-x-1.5 text-gray-300 text-xs">
          <Wifi className="w-3.5 h-3.5 text-[#D4A017]" />
          <span>{t('highlightWifi')}</span>
        </div>
      </div>

      {/* Big Gold Join Button or Queue Closed Notice */}
      <div className="w-full pt-1">
        {isQueueOpen ? (
          <Link
            to="/join"
            className="w-full min-h-[56px] rounded-2xl bg-gradient-to-r from-[#D4A017] to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-black text-lg flex items-center justify-center space-x-2.5 shadow-xl shadow-[#D4A017]/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <span>{t('joinQueueCTA')}</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </Link>
        ) : (
          <div className="w-full rounded-2xl bg-gray-800/80 border border-rose-500/40 p-4 text-center space-y-1.5">
            <div className="inline-flex items-center text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              {t('queueClosedCTA')}
            </div>
            <p className="text-xs text-gray-400">{t('queueClosedNote')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
