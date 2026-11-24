import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguageStore } from '../store/useLanguageStore';
import { Bell, AlertTriangle, ArrowLeft } from 'lucide-react';

export const MyStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguageStore();

  const token = id || 'S-014';
  const position = 2; // Demo showing 2nd in queue to show the banner
  const [showCancelModal, setShowCancelModal] = React.useState(false);

  return (
    <div className="max-w-xl mx-auto w-full py-6 space-y-6 text-center">
      {/* Back button */}
      <div className="text-left">
        <Link to="/" className="inline-flex items-center text-xs text-gray-400 hover:text-white min-h-[44px]">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t('backHomeBtn')}
        </Link>
      </div>

      {/* Screen Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{t('statusTitle')}</h1>
        <p className="text-xs text-gray-400 mt-1">Live queue updates in real-time</p>
      </div>

      {/* Token Hero Display */}
      <div className="bg-[#111827] rounded-3xl border-2 border-[#D4A017] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#D4A017]/10 rounded-full blur-2xl" />
        <p className="text-xs uppercase tracking-widest text-[#D4A017] font-bold mb-2">
          {t('tokenLabel')}
        </p>
        <p className="text-6xl font-black text-white tracking-wider">{token}</p>

        <div className="mt-6 flex items-center justify-center space-x-4">
          <div className="bg-gray-800/80 rounded-xl px-4 py-2 border border-gray-700">
            <p className="text-xs text-gray-400">{t('positionLabel')}</p>
            <p className="text-xl font-bold text-white"># {position}</p>
          </div>
          <div className="bg-gray-800/80 rounded-xl px-4 py-2 border border-gray-700">
            <p className="text-xs text-gray-400">{t('estimatedWaitLabel')}</p>
            <p className="text-xl font-bold text-[#D4A017]">~ 20 min</p>
          </div>
        </div>
      </div>

      {/* 2nd in queue banner alert */}
      {position === 2 && (
        <div className="bg-amber-500/15 border-2 border-[#D4A017] rounded-2xl p-4 flex items-center space-x-3 text-left animate-pulse">
          <Bell className="w-6 h-6 text-[#D4A017] shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-300">{t('alertStartComing')}</p>
            <p className="text-xs text-gray-300">Your assigned barber will be ready shortly.</p>
          </div>
        </div>
      )}

      {/* Status Progress Tracker */}
      <div className="bg-[#111827]/80 rounded-2xl border border-gray-700/60 p-5 text-left space-y-4">
        <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
          Progress Timeline
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-6 h-6 rounded-full bg-[#D4A017] text-gray-950 font-bold flex items-center justify-center text-xs">
              ✓
            </div>
            <span className="font-semibold text-white">{t('statusStepWaiting')}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm opacity-50">
            <div className="w-6 h-6 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-xs">
              2
            </div>
            <span>{t('statusStepCalled')}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm opacity-50">
            <div className="w-6 h-6 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-xs">
              3
            </div>
            <span>{t('statusStepInChair')}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm opacity-50">
            <div className="w-6 h-6 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-xs">
              4
            </div>
            <span>{t('statusStepDone')}</span>
          </div>
        </div>
      </div>

      {/* Cancel Spot Button */}
      <div>
        <button
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="text-xs font-semibold text-rose-400 hover:text-rose-300 hover:underline min-h-[44px] px-4 cursor-pointer"
        >
          {t('cancelSpotBtn')}
        </button>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-white">{t('cancelConfirmTitle')}</h3>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold min-h-[44px]"
              >
                {t('cancelConfirmNo')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  alert('Spot cancelled');
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold min-h-[44px]"
              >
                {t('cancelConfirmYes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
