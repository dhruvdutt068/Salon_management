import React from 'react';
import { useParams } from 'react-router-dom';
import { useLanguageStore } from '../store/useLanguageStore';
import { Play, CheckCircle, Coffee, Clock } from 'lucide-react';

export const BarberPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const { t } = useLanguageStore();

  const barberName = name || 'Amit';
  const [isOnBreak, setIsOnBreak] = React.useState(false);
  const [inService, setInService] = React.useState(false);
  const [seconds, setSeconds] = React.useState(180); // 3:00 demo timer

  React.useEffect(() => {
    let interval: any = null;
    if (inService) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [inService]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto w-full py-6 space-y-6">
      {/* Header with barber name and break toggle */}
      <div className="flex items-center justify-between border-b border-gray-700/60 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#D4A017] text-gray-950 flex items-center justify-center font-bold text-lg">
            {barberName.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{barberName}'s Console</h1>
            <p className="text-xs text-gray-400">{isOnBreak ? t('statusOnBreak') : t('statusAvailable')}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOnBreak(!isOnBreak)}
          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all min-h-[44px] cursor-pointer ${
            isOnBreak
              ? 'bg-rose-500/20 border-rose-500 text-rose-300'
              : 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>{isOnBreak ? t('toggleAvailable') : t('toggleBreak')}</span>
        </button>
      </div>

      {/* Active Customer Card */}
      <div className="bg-[#111827] rounded-3xl border-2 border-[#D4A017]/80 p-6 space-y-4 shadow-xl text-center">
        <p className="text-xs uppercase tracking-wider text-[#D4A017] font-bold">
          {t('currentCustomer')}
        </p>

        <p className="text-5xl font-black text-white font-mono tracking-wider">S-014</p>
        <p className="text-lg font-bold text-gray-200">Rahul Sharma</p>
        <p className="text-xs text-gray-400">Haircut + Beard Trim (45 min)</p>

        {/* Timer display */}
        <div className="bg-gray-800/80 rounded-2xl p-4 border border-gray-700 flex items-center justify-center space-x-2">
          <Clock className="w-5 h-5 text-[#D4A017]" />
          <span className="text-3xl font-mono font-bold text-white tracking-widest">
            {formatTimer(seconds)}
          </span>
        </div>

        {/* Big Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setInService(true)}
            disabled={inService}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center space-x-1.5 min-h-[48px] shadow-md cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>{t('startServiceBtn')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setInService(false);
              alert('Service completed!');
            }}
            className="w-full py-3.5 rounded-xl bg-[#D4A017] hover:bg-amber-400 text-gray-950 font-bold text-sm flex items-center justify-center space-x-1.5 min-h-[48px] shadow-md cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{t('doneServiceBtn')}</span>
          </button>
        </div>
      </div>

      {/* Next Up For You Preview */}
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700/60 p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {t('nextCustomerLabel')}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-sm font-bold text-[#D4A017] mr-2">S-015</span>
            <span className="text-sm font-semibold text-white">Kunal Patel</span>
            <p className="text-xs text-gray-400">Haircut (30 min)</p>
          </div>
          <span className="text-xs text-gray-400">Next</span>
        </div>
      </div>
    </div>
  );
};
