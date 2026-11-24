import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguageStore } from '../store/useLanguageStore';
import { useQueueStore } from '../store/useQueueStore';
import { Bell, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const MyStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguageStore();
  const { getEntryByToken, cancelEntry } = useQueueStore();

  const tokenParam = id || 'S-014';
  const entry = getEntryByToken(tokenParam);

  const token = entry ? entry.token : tokenParam;
  const position = entry ? entry.positionInQueue : 2;
  const waitMins = entry ? entry.estimatedWaitMinutes : 20;
  const status = entry ? entry.status : 'Waiting';
  const customerName = entry ? entry.customerName : 'Demo Customer';

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelled, setIsCancelled] = useState(status === 'Cancelled');

  const handleCancel = () => {
    cancelEntry(token);
    setIsCancelled(true);
    setShowCancelModal(false);
  };

  return (
    <div className="max-w-xl mx-auto w-full py-4 sm:py-6 space-y-6 text-center">
      {/* Back to Home Link */}
      <div className="text-left">
        <Link to="/" className="inline-flex items-center text-xs text-gray-400 hover:text-white min-h-[44px]">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {t('backHomeBtn')}
        </Link>
      </div>

      {/* Screen Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{t('statusTitle')}</h1>
        <p className="text-xs text-gray-400 mt-1">Hello, <strong className="text-gray-200">{customerName}</strong></p>
      </div>

      {/* Token Hero Card */}
      <div className="bg-[#111827] rounded-3xl border-2 border-[#D4A017] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#D4A017]/10 rounded-full blur-2xl pointer-events-none" />
        <p className="text-xs uppercase tracking-widest text-[#D4A017] font-black mb-1">
          {t('tokenLabel')}
        </p>
        <p className="text-5xl sm:text-6xl font-black text-white font-mono tracking-wider">{token}</p>

        {isCancelled ? (
          <div className="mt-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-bold">
            This queue spot has been cancelled.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gray-800/80 rounded-2xl p-3 border border-gray-700">
              <p className="text-xs text-gray-400 font-semibold">{t('positionLabel')}</p>
              <p className="text-2xl font-black text-white mt-0.5">#{position}</p>
            </div>
            <div className="bg-gray-800/80 rounded-2xl p-3 border border-gray-700">
              <p className="text-xs text-gray-400 font-semibold">{t('estimatedWaitLabel')}</p>
              <p className="text-2xl font-black text-[#D4A017] mt-0.5">~{waitMins} min</p>
            </div>
          </div>
        )}
      </div>

      {/* 2nd in queue banner alert */}
      {!isCancelled && position === 2 && (
        <div className="bg-amber-500/15 border-2 border-[#D4A017] rounded-2xl p-4 flex items-center space-x-3 text-left animate-pulse">
          <Bell className="w-6 h-6 text-[#D4A017] shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-300">{t('alertStartComing')}</p>
            <p className="text-xs text-gray-300">Your assigned chair will be ready shortly.</p>
          </div>
        </div>
      )}

      {/* Status Progress Tracker */}
      <div className="bg-[#111827]/85 rounded-3xl border border-gray-700/60 p-5 text-left space-y-4">
        <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
          Progress Timeline
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-6 h-6 rounded-full bg-[#D4A017] text-gray-950 font-black flex items-center justify-center text-xs">
              ✓
            </div>
            <span className="font-bold text-white">{t('statusStepWaiting')}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm opacity-50">
            <div className="w-6 h-6 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-xs font-bold">
              2
            </div>
            <span>{t('statusStepCalled')}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm opacity-50">
            <div className="w-6 h-6 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-xs font-bold">
              3
            </div>
            <span>{t('statusStepInChair')}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm opacity-50">
            <div className="w-6 h-6 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-xs font-bold">
              4
            </div>
            <span>{t('statusStepDone')}</span>
          </div>
        </div>
      </div>

      {/* Cancel Spot Button */}
      {!isCancelled && (
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
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-white">{t('cancelConfirmTitle')}</h3>
            <p className="text-xs text-gray-400">If you cancel, you will lose your spot in line.</p>
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold min-h-[44px] cursor-pointer"
              >
                {t('cancelConfirmNo')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold min-h-[44px] cursor-pointer"
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
