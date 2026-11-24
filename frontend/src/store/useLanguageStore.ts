import { create } from 'zustand';
import type { Language } from '../types';
import { translations, type TranslationKey } from '../i18n/translations';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'en',
  setLanguage: (lang: Language) => set({ language: lang }),
  toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'gu' : 'en' })),
  t: (key: TranslationKey) => {
    const currentLang = get().language;
    return translations[currentLang][key] || translations.en[key] || key;
  },
}));
