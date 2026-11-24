import React from 'react';
import { useLanguageStore } from '../store/useLanguageStore';
import { DUMMY_BARBERS } from '../constants/dummyData';
import { Tv, Sparkles } from 'lucide-react';

export const DisplayPage: React.FC = () => {
  const { t } = useLanguageStore();

  const upNextTokens = [
    { token: 'S-014', customer: 'Rahul S.', barber: 'Amit', wait: '5 min' },
    { token: 'S-015', customer: 'Priya V.', barber: 'Any', wait: '20 min' },
    { token: 'S-016', customer: 'Kunal P.', barber: 'Ravi', wait: '35 min' },
    { token: 'S-017', customer: 'Aman G.', barber: 'Imran', wait: '50 min' },
    { token: 'S-018', customer: 'Vikram S.', barber: 'Any', wait: '65 min' },
  ];

  return (
    <div className="w-full min-h-[80vh] flex flex-col space-y-6">
      {/* TV Display Header */}
      <div className="flex items-center justify-between border-b border-gray-700/60 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-[#D4A017] text-gray-950 flex items-center justify-center">
            <Tv className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-wide">
              {t('tvDisplayTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">Waiting Area Live Board • Auto-updates</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-amber-500/10 border border-[#D4A017]/30 rounded-xl text-amber-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-[#D4A017]" />
          <span>Live Auto-Sync Enabled</span>
        </div>
      </div>

      {/* TV Grid: Barbers Active Chairs */}
      <div className="space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold">
          {t('nowServing')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DUMMY_BARBERS.map((barber) => (
            <div
              key={barber.id}
              className="bg-[#111827] border-2 border-gray-700/70 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-3 shadow-xl"
            >
              <div className="w-14 h-14 rounded-full bg-gray-800 border-2 border-[#D4A017] text-[#D4A017] font-black text-xl flex items-center justify-center">
                {barber.name.charAt(0)}
              </div>
              <div>
                <p className="text-base font-bold text-white">{barber.name}</p>
                <span className={`text-xs ${barber.status === 'Available' ? 'text-emerald-400' : barber.status === 'Busy' ? 'text-amber-400' : 'text-rose-400'}`}>
                  {barber.status}
                </span>
              </div>

              <div className="w-full bg-gray-900/90 rounded-2xl p-4 border border-gray-800">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Token</p>
                <p className="text-4xl font-mono font-black text-[#D4A017]">
                  {barber.currentCustomerToken || '—'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Up Next List (Next 5) */}
      <div className="bg-[#111827] rounded-3xl border border-gray-700/60 p-6 space-y-4">
        <h2 className="text-xs uppercase tracking-widest text-gray-400 font-bold">
          {t('upNextTitle')} (Next 5)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {upNextTokens.map((item, idx) => (
            <div
              key={item.token}
              className={`p-4 rounded-2xl border text-center space-y-1 ${
                idx === 0
                  ? 'bg-amber-500/15 border-[#D4A017] animate-pulse'
                  : 'bg-gray-800/50 border-gray-700/60'
              }`}
            >
              <span className="text-xs text-gray-400 font-medium">#{idx + 1}</span>
              <p className="text-2xl font-mono font-black text-white">{item.token}</p>
              <p className="text-xs font-semibold text-gray-200 truncate">{item.customer}</p>
              <p className="text-xs text-[#D4A017] font-medium">{item.wait}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
