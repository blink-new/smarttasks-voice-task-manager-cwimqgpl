import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, useTranslation } from '../lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('smarttasks-language');
    return (saved as Language) || 'en';
  });

  const { t, isRTL } = useTranslation(language);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('smarttasks-language', newLanguage);
    
    // Update document direction and lang attribute
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
  };

  useEffect(() => {
    // Set initial document direction and lang
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};