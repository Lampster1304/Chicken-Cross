import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../store';
import { setLanguage } from '../store/languageSlice';

export const useLanguageSync = () => {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const currentLanguage = useSelector((state: RootState) => state.language.currentLanguage);

  // Sincronizar cambios en Redux con i18n
  useEffect(() => {
    if (i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage, i18n]);

  // Sincronizar cambios en localStorage al montar (en caso de múltiples tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'language' && (e.newValue === 'en' || e.newValue === 'es')) {
        const newLang = e.newValue as 'en' | 'es';
        dispatch(setLanguage(newLang));
        i18n.changeLanguage(newLang);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch, i18n]);
};
