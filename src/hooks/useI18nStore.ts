import { create } from 'zustand';
import { useCallback } from 'react';

interface I18nState {
  lang: string;
  translations: Record<string, string>;
  _initialized: boolean;
  setLang: (lang: string) => Promise<void>;
}

export const useI18nStore = create<I18nState>((set, get) => ({
  lang: 'tj',
  translations: {},
  _initialized: false,
  setLang: async (newLang: string) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('app_lang', newLang);
      }
      
      const res = await fetch(`/locales/${newLang}/common.json`);
      if (res.ok) {
        const translations = await res.json();
        set({ lang: newLang, translations, _initialized: true });
      } else {
        console.error(`Failed to load translation for ${newLang}`);
        set({ lang: newLang, _initialized: true });
      }
    } catch (e) {
      console.error(e);
      set({ lang: newLang, _initialized: true });
    }
  }
}));

export const initI18n = async () => {
  const store = useI18nStore.getState();
  if (store._initialized) return;
  
  let savedLang = 'tj';
  if (typeof window !== 'undefined') {
    const persisted = localStorage.getItem('app_lang');
    if (persisted) savedLang = persisted;
  }
  await store.setLang(savedLang);
};

export const useTranslation = () => {
  const translations = useI18nStore((state) => state.translations);
  const lang = useI18nStore((state) => state.lang);
  
  const t = useCallback((key: string, variables?: Record<string, string | number>) => {
    let text = translations[key] || key;
    if (variables) {
      Object.keys(variables).forEach(varKey => {
        text = text.replace(`{{${varKey}}}`, String(variables[varKey]));
      });
    }
    return text;
  }, [translations]);

  return { t, lang };
};
