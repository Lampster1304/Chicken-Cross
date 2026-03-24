import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../store';
import { setLanguage } from '../store/languageSlice';

export const LanguageSwitcher = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLanguage = useSelector((state: RootState) => state.language.currentLanguage);

  const handleLanguageChange = (language: 'en' | 'es') => {
    dispatch(setLanguage(language));
    i18n.changeLanguage(language);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          currentLanguage === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
        aria-label={t('common.english')}
        title={t('common.english')}
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange('es')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          currentLanguage === 'es'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
        aria-label={t('common.spanish')}
        title={t('common.spanish')}
      >
        ES
      </button>
    </div>
  );
};
