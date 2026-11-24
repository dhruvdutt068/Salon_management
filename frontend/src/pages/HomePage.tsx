import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '../store/useLanguageStore';
import { DUMMY_BARBERS } from '../constants/dummyData';
import { Users, Clock, Scissors, ArrowRight, CheckCircle2, Coffee, AlertCircle } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t } = useLanguageStore();

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
    <div className="flex-1 flex flex-col justify-center items-center max-w-2xl mx-auto w-full py-8 text-center space-y-8">
      {/* Hero Welcome */}
      <div className="space-y-3">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/30">
          <Scissors className="w-3.5 h-3.5 mr-1.5" />
          {t('closingBadge')}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t('salonName')}
        </h1>
        <p className="text-gray-300 text-sm sm:text-base max-w-md mx-auto">
          {t('homeWelcome')}
        </p>
      </div>

      {/* Live Queue Card */}
      <div className="w-full bg-[#111827]/80 rounded-2xl border border-gray-700/60 p-6 shadow-xl backdrop-blur-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center justify-center">
          <Users className="w-4 h-4 mr-1.5 text-[#D4A017]" />
          {t('liveQueueTitle')}
        </h2>
        <div className="grid grid-cols-2 gap-4 divide-x divide-gray-700/60">
          <div className="text-center px-2">
            <p className="text-3xl sm:text-4xl font-black text-white">6</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">{t('peopleWaiting')}</p>
          </div>
          <div className="text-center px-2">
            <p className="text-3xl sm:text-4xl font-black text-[#D4A017]">~50</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">{t('aboutWait')} 50 {t('minWait')}</p>
          </div>
        </div>
      </div>

      {/* Barbers on Duty Chips */}
      <div className="w-full bg-gray-800/40 rounded-2xl border border-gray-700/50 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 text-left flex items-center">
          <AlertCircle className="w-3.5 h-3.5 mr-1 text-[#D4A017]" />
          {t('barberAvailability')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DUMMY_BARBERS.map((barber) => (
            <div
              key={barber.id}
              className="bg-gray-900/70 border border-gray-700/50 rounded-xl p-3 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-[#D4A017]">
                  {barber.name.charAt(0)}
                </div>
                <span className="font-medium text-sm text-white">{barber.name}</span>
              </div>
              {getStatusBadge(barber.status)}
            </div>
          ))}
        </div>
      </div>

      {/* Big Gold Join Button */}
      <div className="w-full pt-2">
        <Link
          to="/join"
          className="w-full min-h-[56px] rounded-xl bg-gradient-to-r from-[#D4A017] to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold text-lg flex items-center justify-center space-x-2 shadow-lg shadow-[#D4A017]/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <span>{t('joinQueueCTA')}</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};
