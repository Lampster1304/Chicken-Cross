import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type LanguageType = 'en' | 'es';

interface LanguageState {
  currentLanguage: LanguageType;
}

const getInitialLanguage = (): LanguageType => {
  // Intentar obtener del localStorage
  const saved = localStorage.getItem('language');
  if (saved === 'en' || saved === 'es') {
    return saved;
  }

  // Detectar del navegador
  const browserLanguage = navigator.language.split('-')[0];
  if (browserLanguage === 'es') {
    return 'es';
  }

  // Default a inglés
  return 'en';
};

const initialState: LanguageState = {
  currentLanguage: getInitialLanguage(),
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<LanguageType>) => {
      state.currentLanguage = action.payload;
      localStorage.setItem('language', action.payload);
    },
    toggleLanguage: (state) => {
      state.currentLanguage = state.currentLanguage === 'en' ? 'es' : 'en';
      localStorage.setItem('language', state.currentLanguage);
    },
  },
});

export const { setLanguage, toggleLanguage } = languageSlice.actions;
export default languageSlice.reducer;
