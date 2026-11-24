import React from 'react';
import { useLanguageStore } from '../store/useLanguageStore';
import { DUMMY_BARBERS } from '../constants/dummyData';
import { Plus, AlertCircle, Clock, Scissors, XCircle, UserX } from 'lucide-react';

export const ReceptionPage: React.FC = () => {
  const { t } = useLanguageStore();

  const dummyQueue = [
    { token: 'S-014', name: 'Rahul Sharma', services: 'Haircut', barber: 'Amit', waitMins: 20 },
    { token: 'S-015', name: 'Priya Verma', services: 'Hair Spa', barber: 'Any', waitMins: 45 },
    { token: 'S-016', name: 'Karan Mehra', services: 'Beard Trim', barber: 'Ravi', waitMins: 65 }, // over 60 min highlight
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header with Title and Add Walk-in */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('receptionTitle')}</h1>
          <p className="text-xs text-gray-400">Tablet-friendly live queue monitor and walk-in registrar</p>
        </div>
        <button
          type="button"
          onClick={() => alert('Walk-in modal')}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#D4A017] hover:bg-amber-400 text-gray-950 font-bold text-sm shadow-md transition-all min-h-[44px] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t('addWalkInBtn')}</span>
        </button>
      </div>

      {/* 2-Column Layout for Tablet/Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Barber Cards (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center">
            <Scissors className="w-4 h-4 mr-1.5 text-[#D4A017]" />
            {t('activeBarbers')}
          </h2>

          <div className="space-y-3">
            {DUMMY_BARBERS.map((barber) => (
              <div
                key={barber.id}
                className="bg-[#111827]/80 rounded-2xl border border-gray-700/60 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center font-bold text-[#D4A017]">
                      {barber.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{barber.name}</p>
                      <span className={`text-xs ${barber.status === 'Available' ? 'text-emerald-400' : barber.status === 'Busy' ? 'text-amber-400' : 'text-rose-400'}`}>
                        {barber.status}
                      </span>
                    </div>
                  </div>
                  {barber.currentCustomerToken && (
                    <span className="px-2.5 py-1 rounded-lg bg-gray-800 text-[#D4A017] font-mono text-xs font-bold border border-gray-700">
                      Now: {barber.currentCustomerToken}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-gray-400">
                    {barber.currentCustomerName ? `Serving: ${barber.currentCustomerName}` : 'Idle — ready for customer'}
                  </p>
                  <button
                    type="button"
                    disabled={barber.status !== 'Available'}
                    className="px-3 py-1.5 rounded-lg bg-[#D4A017] hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-[#D4A017] text-gray-950 text-xs font-bold transition-all min-h-[36px] cursor-pointer"
                  >
                    {t('callNextBtn')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Waiting List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-[#D4A017]" />
              {t('waitingListTitle')} ({dummyQueue.length})
            </span>
            <span className="text-amber-400 text-xs normal-case flex items-center">
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              Amber = &gt; 60 min wait
            </span>
          </h2>

          <div className="space-y-2.5">
            {dummyQueue.map((item) => {
              const isOver60 = item.waitMins >= 60;
              return (
                <div
                  key={item.token}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isOver60
                      ? 'bg-amber-950/20 border-amber-500/50'
                      : 'bg-[#111827]/80 border-gray-700/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-base font-black px-2.5 py-1 bg-gray-800 rounded-lg text-[#D4A017] border border-gray-700">
                      {item.token}
                    </span>
                    <div>
                      <p className="font-bold text-white text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400">
                        {item.services} • Barber: <strong className="text-gray-200">{item.barber}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-3">
                    <span className={`text-xs font-semibold ${isOver60 ? 'text-amber-400' : 'text-gray-300'}`}>
                      ~{item.waitMins} min
                    </span>
                    <div className="flex space-x-1.5">
                      <button
                        type="button"
                        className="p-2 rounded-lg bg-gray-800 hover:bg-amber-900/40 text-amber-400 border border-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                        title={t('markNoShowBtn')}
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded-lg bg-gray-800 hover:bg-rose-900/40 text-rose-400 border border-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                        title={t('cancelEntryBtn')}
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
