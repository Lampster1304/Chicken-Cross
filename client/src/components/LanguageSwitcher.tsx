import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../store';
import { toggleLanguage } from '../store/languageSlice';
import flagEn from '../assets/flag-en.png';
import flagEs from '../assets/flag-es.png';

export const LanguageSwitcher = () => {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const currentLanguage = useSelector((state: RootState) => state.language.currentLanguage);

  const handleToggle = () => {
    const newLang = currentLanguage === 'en' ? 'es' : 'en';
    dispatch(toggleLanguage());
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-yellow-400 transition-all"
      aria-label={currentLanguage === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
      title={currentLanguage === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
    >
      <img
        src={currentLanguage === 'en' ? flagEn : flagEs}
        alt={currentLanguage === 'en' ? 'English' : 'Español'}
        className="w-full h-full object-cover"
      />
    </button>
  );
};
