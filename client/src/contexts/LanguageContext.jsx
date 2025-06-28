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

// Legacy translation data for backward compatibility
const legacyTranslations = {
  en: {
    // Navigation
    home: 'Home',
    about: 'About',
    products: 'Products',
    contact: 'Contact',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    
    // Products
    crop_rotation: 'CropShiftX',
    agrirevive: 'AgriReVive',
    agrisensex: 'AgriSenseX',
    bio_guardian: 'BioGuardian',
    
    // Home page
    sustainable_farming: 'Sustainable Farming for Cleaner Air',
    hero_description: 'Harness the power of AI to make farming smarter and greener. Get real-time insights to reduce pollution and boost crop yields. Optimize resources naturally while protecting the environment. Sustainable agriculture starts with smart decisions!',
    get_started: 'Get Started',
    our_products: 'Our Products',
    
    // Auth forms
    email: 'Email',
    password: 'Password',
    confirm_password: 'Confirm Password',
    name: 'Full Name',
    phone: 'Phone Number',
    location: 'Location',
    bio: 'Bio',
    current_password: 'Current Password',
    new_password: 'New Password',
    
    // Buttons
    submit: 'Submit',
    save_changes: 'Save Changes',
    cancel: 'Cancel',
    
    // Messages
    login_success: 'Login successful!',
    register_success: 'Registration successful!',
    profile_updated: 'Profile updated successfully!',
    logout_success: 'Logout successful!',
    
    // Errors
    required_field: 'This field is required',
    invalid_email: 'Please enter a valid email address',
    password_min_length: 'Password must be at least 8 characters',
    passwords_not_match: 'Passwords do not match',
  },
  hi: {
    // Navigation
    home: 'होम',
    about: 'के बारे में',
    products: 'उत्पाद',
    contact: 'संपर्क',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    logout: 'लॉगआउट',
    profile: 'प्रोफ़ाइल',
    
    // Products
    crop_rotation: 'क्रॉपशिफ्टएक्स',
    agrirevive: 'एग्रीरिवाइव',
    agrisensex: 'एग्रीसेंसएक्स',
    bio_guardian: 'बायोगार्डियन',
    
    // Home page
    sustainable_farming: 'स्वच्छ हवा के लिए टिकाऊ खेती',
    hero_description: 'खेती को स्मार्ट और हरित बनाने के लिए AI की शक्ति का उपयोग करें। प्रदूषण कम करने और फसल की पैदावार बढ़ाने के लिए रीयल-टाइम इनसाइट प्राप्त करें।',
    get_started: 'शुरू करें',
    our_products: 'हमारे उत्पाद',
    
    // Auth forms
    email: 'ईमेल',
    password: 'पासवर्ड',
    confirm_password: 'पासवर्ड की पुष्टि करें',
    name: 'पूरा नाम',
    phone: 'फोन नंबर',
    location: 'स्थान',
    bio: 'बायो',
    current_password: 'वर्तमान पासवर्ड',
    new_password: 'नया पासवर्ड',
    
    // Buttons
    submit: 'सबमिट',
    save_changes: 'परिवर्तन सहेजें',
    cancel: 'रद्द करें',
    
    // Messages
    login_success: 'लॉगिन सफल!',
    register_success: 'पंजीकरण सफल!',
    profile_updated: 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!',
    logout_success: 'लॉगआउट सफल!',
    
    // Errors
    required_field: 'यह फील्ड आवश्यक है',
    invalid_email: 'कृपया एक मान्य ईमेल पता दर्ज करें',
    password_min_length: 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए',
    passwords_not_match: 'पासवर्ड मेल नहीं खाते',
  },
  kn: {
    // Navigation
    home: 'ಮುಖ್ಯಪುಟ',
    about: 'ಬಗ್ಗೆ',
    products: 'ಉತ್ಪಾದನೆಗಳು',
    contact: 'ಸಂಪರ್ಕ',
    login: 'ಲಾಗಿನ್',
    register: 'ನೋಂದಣಿ',
    logout: 'ಲಾಗೌಟ್',
    profile: 'ಪ್ರೊಫೈಲ್',
    
    // Products
    crop_rotation: 'ಕ್ರಾಪ್‌ಶಿಫ್ಟ್‌ಎಕ್ಸ್',
    agrirevive: 'ಅಗ್ರಿರಿವೈವ್',
    agrisensex: 'ಅಗ್ರಿಸೆನ್ಸ್‌ಎಕ್ಸ್',
    bio_guardian: 'ಬಯೋಗಾರ್ಡಿಯನ್',
    
    // Home page
    sustainable_farming: 'ಶುದ್ಧ ಗಾಳಿಗಾಗಿ ಸಮರ್ಥನೀಯ ಕೃಷಿ',
    hero_description: 'ಕೃಷಿಯನ್ನು ಸ್ಮಾರ್ಟ್ ಮತ್ತು ಹಸಿರು ಮಾಡಲು AI ಯ ಶಕ್ತಿಯನ್ನು ಬಳಸಿ। ಮಾಲಿನ್ಯವನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಮತ್ತು ಬೆಳೆಯ ಇಳುವರಿ ಹೆಚ್ಚಿಸಲು ನಿಜ-ಸಮಯದ ಒಳನೋಟಗಳನ್ನು ಪಡೆಯಿರಿ।',
    get_started: 'ಪ್ರಾರಂಭಿಸಿ',
    our_products: 'ನಮ್ಮ ಉತ್ಪಾದನೆಗಳು',
    
    // Auth forms
    email: 'ಇಮೇಲ್',
    password: 'ಪಾಸ್‌ವರ್ಡ್',
    confirm_password: 'ಪಾಸ್‌ವರ್ಡ್ ಖಚಿತಪಡಿಸಿ',
    name: 'ಪೂರ್ಣ ಹೆಸರು',
    phone: 'ಫೋನ್ ಸಂಖ್ಯೆ',
    location: 'ಸ್ಥಳ',
    bio: 'ಬಯೋ',
    current_password: 'ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್',
    new_password: 'ಹೊಸ ಪಾಸ್‌ವರ್ಡ್',
    
    // Buttons
    submit: 'ಸಲ್ಲಿಸಿ',
    save_changes: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    
    // Messages
    login_success: 'ಲಾಗಿನ್ ಯಶಸ್ವಿ!',
    register_success: 'ನೋಂದಣಿ ಯಶಸ್ವಿ!',
    profile_updated: 'ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಡೇಟ್ ಮಾಡಲಾಗಿದೆ!',
    logout_success: 'ಲಾಗೌಟ್ ಯಶಸ್ವಿ!',
    
    // Errors
    required_field: 'ಈ ಕ್ಷೇತ್ರವು ಅಗತ್ಯವಿದೆ',
    invalid_email: 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ',
    password_min_length: 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳಾಗಿರಬೇಕು',
    passwords_not_match: 'ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ',
  }
};

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
    
    // Try common namespace first, then fallback to key
    return t(key, { 
      ...options,
      fallbackKey: key,
      defaultValue: options.defaultValue || key
    });
  };

  // Get translation with fallback to legacy translations
  const getTranslation = (key, options = {}) => {
    try {
      // First try react-i18next with the key
      let translated = t(key, { 
        ...options,
        defaultValue: undefined // Don't use defaultValue in first attempt
      });
      
      // If translation exists and is not the same as key, return it
      if (translated && translated !== key) {
        return translated;
      }
      
      // Try to get nested value from legacy translations
      const keys = key.split('.');
      let value = legacyTranslations[i18n.language];
      
      for (const k of keys) {
        if (value && typeof value === 'object' && value[k] !== undefined) {
          value = value[k];
        } else {
          value = undefined;
          break;
        }
      }
      
      // If found in legacy translations, return it
      if (value && typeof value === 'string') {
        return value;
      }
      
      // Fallback: return the default value or the key
      return options.defaultValue || key;
    } catch (error) {
      console.warn('Translation error for key:', key, error);
      return options.defaultValue || key;
    }
  };

  // Check if translation exists
  const hasTranslation = (key, options = {}) => {
    return i18n.exists(key, options) || 
           !!legacyTranslations[i18n.language]?.[key];
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
    i18n,
    
    // Legacy support
    legacyTranslations
  };

  return (
    <LanguageContext.Provider value={value}>
      <LanguageLoader>
        {children}
      </LanguageLoader>
    </LanguageContext.Provider>
  );
};
