import React from 'react';
import { useLanguageStore } from '../store/useLanguageStore';
import { DUMMY_SERVICES, DUMMY_BARBERS } from '../constants/dummyData';
import { Settings, ToggleLeft, ToggleRight, BarChart3, Users, Clock, AlertOctagon } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { t } = useLanguageStore();
  const [isQueueOpen, setIsQueueOpen] = React.useState(true);

  return (
    <div className="max-w-4xl mx-auto w-full py-6 space-y-8">
      {/* Admin Title */}
      <div className="border-b border-gray-700/60 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center">
          <Settings className="w-7 h-7 mr-2 text-[#D4A017]" />
          {t('adminTitle')}
        </h1>
        <p className="text-xs text-gray-400 mt-1">Configure salon operations, services, and view daily metrics</p>
      </div>

      {/* Online Queue Master Switch */}
      <div className="bg-[#111827] rounded-2xl border border-gray-700/60 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white">{t('queueControlTitle')}</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {isQueueOpen ? t('queueOpen') : t('queueClosed')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsQueueOpen(!isQueueOpen)}
          className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm min-h-[44px] cursor-pointer transition-all ${
            isQueueOpen
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
          }`}
        >
          {isQueueOpen ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          <span>{isQueueOpen ? 'Queue is OPEN' : 'Queue is CLOSED'}</span>
        </button>
      </div>

      {/* Today's Operational Stats */}
      <div className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold flex items-center">
          <BarChart3 className="w-4 h-4 mr-1 text-[#D4A017]" />
          {t('todayStatsTitle')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#111827] rounded-2xl border border-gray-700/60 p-5">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">28</p>
                <p className="text-xs text-gray-400">{t('statServed')}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-gray-700/60 p-5">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-500/10 text-[#D4A017] rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">24 min</p>
                <p className="text-xs text-gray-400">{t('statAvgWait')}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-gray-700/60 p-5">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">2</p>
                <p className="text-xs text-gray-400">{t('statNoShows')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services List Management */}
      <div className="bg-[#111827] rounded-2xl border border-gray-700/60 p-6 space-y-4">
        <h2 className="text-base font-bold text-white">{t('manageServicesTitle')}</h2>
        <div className="divide-y divide-gray-800">
          {DUMMY_SERVICES.map((s) => (
            <div key={s.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  {s.nameEn} / {s.nameGu}
                </p>
                <p className="text-xs text-gray-400">{s.durationMinutes} min • ₹{s.price}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Barbers Management */}
      <div className="bg-[#111827] rounded-2xl border border-gray-700/60 p-6 space-y-4">
        <h2 className="text-base font-bold text-white">{t('manageBarbersTitle')}</h2>
        <div className="divide-y divide-gray-800">
          {DUMMY_BARBERS.map((barber) => (
            <div key={barber.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 text-[#D4A017] font-bold flex items-center justify-center text-xs">
                  {barber.name.charAt(0)}
                </div>
                <p className="text-sm font-semibold text-white">{barber.name}</p>
              </div>
              <span className="text-xs text-emerald-400 font-medium">On Duty</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
