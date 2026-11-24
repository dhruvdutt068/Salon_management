import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '../store/useLanguageStore';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { t } = useLanguageStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-16 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-[#D4A017]/30 text-[#D4A017] flex items-center justify-center">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-5xl font-black text-white">404</h1>
      <h2 className="text-xl font-bold text-gray-200">{t('pageNotFound')}</h2>
      <p className="text-sm text-gray-400 max-w-sm">{t('pageNotFoundDesc')}</p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#D4A017] hover:bg-amber-400 text-gray-950 font-bold text-sm min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('backHomeBtn')}</span>
      </Link>
    </div>
  );
};
