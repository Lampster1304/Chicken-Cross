import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Guía de uso de i18n en la aplicación
 * 
 * 1. Importar useTranslation en tus componentes:
 *    import { useTranslation } from 'react-i18next';
 * 
 * 2. Usar el hook en tu componente:
 *    const { t } = useTranslation();
 * 
 * 3. Usar las traducciones en JSX:
 *    <button>{t('common.save')}</button>
 *    <h1>{t('game.title')}</h1>
 * 
 * 4. Para el selector de idioma, importar LanguageSwitcher:
 *    import { LanguageSwitcher } from './components/LanguageSwitcher';
 *    <LanguageSwitcher />
 */

// Ejemplo de componente traducido
export const ExampleComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="p-4">
      <h1>{t('game.title')}</h1>
      <p>{t('common.loading')}</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        {t('common.save')}
      </button>
    </div>
  );
};
