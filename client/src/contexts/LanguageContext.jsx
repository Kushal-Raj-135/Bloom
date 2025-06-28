import React, { createContext, useContext, useState, useEffect, Suspense } from 'react';
import { useTranslation } from '../../node_modules/react-i18next';
import '../i18n/config'; // Import i18n configuration

const LanguageContext = createContext({});

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const LanguageLoader = ({ children }) => (
  <Suspense fallback={
    <div className="language-loading">
      <div className="spinner"></div>
      <p>Loading translations...</p>
    </div>
  }>
    {children}
  </Suspense>
);

export const LanguageProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Available languages with more details
  const availableLanguages = [
    { 
      code: 'en', 
      name: 'English', 
      nativeName: 'English',
      flag: '🇺🇸',
      direction: 'ltr'
    },
    { 
      code: 'hi', 
      name: 'Hindi', 
      nativeName: 'हिंदी',
      flag: '🇮🇳',
      direction: 'ltr'
    },
    { 
      code: 'kn', 
      name: 'Kannada', 
      nativeName: 'ಕನ್ನಡ',
      flag: '🇮🇳',
      direction: 'ltr'
    }
  ];

  // Enhanced language change function
  const changeLanguage = async (langCode, options = {}) => {
    if (!availableLanguages.find(lang => lang.code === langCode)) {
      console.warn(`Language ${langCode} is not supported`);
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await i18n.changeLanguage(langCode);
      
      // Save to localStorage if not disabled
      if (!options.skipSave) {
        localStorage.setItem('selectedLanguage', langCode);
      }

      // Update document attributes
      const language = availableLanguages.find(lang => lang.code === langCode);
      if (language) {
        document.documentElement.lang = langCode;
        document.documentElement.dir = language.direction;
      }

      // Custom success callback
      if (options.onSuccess) {
        options.onSuccess(langCode);
      }

      return true;
    } catch (err) {
      console.error('Failed to change language:', err);
      setError(`Failed to load ${langCode} translations`);
      
      // Custom error callback
      if (options.onError) {
        options.onError(err);
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced translation function with namespace support
  const translate = (key, options = {}) => {
    // If namespace is specified, use it
    if (options.ns) {
      return t(`${options.ns}:${key}`, options);
    }
    
    // Use react-i18next with fallback
    return t(key, { 
      ...options,
      defaultValue: options.defaultValue || key
    });
  };

  // Get translation - simplified version
  const getTranslation = (key, options = {}) => {
    try {
      // Use react-i18next translation
      const translated = t(key, { 
        ...options,
        defaultValue: options.defaultValue || key
      });
      
      return translated;
    } catch (error) {
      console.warn('Translation error for key:', key, error);
      return options.defaultValue || key;
    }
  };

  // Check if translation exists
  const hasTranslation = (key, options = {}) => {
    return i18n.exists(key, options);
  };

  // Get current language info
  const getCurrentLanguage = () => {
    return availableLanguages.find(lang => lang.code === i18n.language) || 
           availableLanguages[0];
  };

  // Load additional namespaces
  const loadNamespace = async (namespace) => {
    setIsLoading(true);
    try {
      await i18n.loadNamespaces(namespace);
      return true;
    } catch (err) {
      console.error(`Failed to load namespace ${namespace}:`, err);
      setError(`Failed to load ${namespace} translations`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Format numbers, dates, etc. based on current locale
  const formatters = {
    number: (value, options = {}) => {
      const locale = i18n.language === 'hi' || i18n.language === 'kn' ? 'en-IN' : 'en-US';
      return new Intl.NumberFormat(locale, options).format(value);
    },
    
    currency: (value, currency = 'INR') => {
      const locale = i18n.language === 'hi' || i18n.language === 'kn' ? 'en-IN' : 'en-US';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
      }).format(value);
    },
    
    date: (value, options = {}) => {
      const locale = i18n.language === 'hi' || i18n.language === 'kn' ? 'en-IN' : 'en-US';
      return new Intl.DateTimeFormat(locale, options).format(new Date(value));
    },
    
    relativeTime: (value) => {
      const locale = i18n.language === 'hi' || i18n.language === 'kn' ? 'en-IN' : 'en-US';
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      
      const diff = new Date(value) - new Date();
      const diffInSeconds = Math.floor(diff / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      
      if (Math.abs(diffInDays) > 0) return rtf.format(diffInDays, 'day');
      if (Math.abs(diffInHours) > 0) return rtf.format(diffInHours, 'hour');
      if (Math.abs(diffInMinutes) > 0) return rtf.format(diffInMinutes, 'minute');
      return rtf.format(diffInSeconds, 'second');
    }
  };

  const value = {
    // Core i18n functions
    t: getTranslation,
    translate: getTranslation,
    changeLanguage,
    hasTranslation,
    loadNamespace,
    
    // Language info
    currentLanguage: i18n.language,
    getCurrentLanguage,
    availableLanguages,
    
    // State
    isLoading,
    error,
    
    // Formatters
    formatters,
    
    // i18n instance for advanced usage
    i18n
  };

  return (
    <LanguageContext.Provider value={value}>
      <LanguageLoader>
        {children}
      </LanguageLoader>
    </LanguageContext.Provider>
  );
};
