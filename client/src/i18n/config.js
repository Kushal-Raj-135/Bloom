import i18n from 'i18next';
import { initReactI18next } from '../../node_modules/react-i18next';
import Backend from '../../node_modules/i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector/cjs';

const detectionOptions = {

  order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
  

  caches: ['localStorage'],
  

  excludeCacheFor: ['cimode'],
  

  lookupLocalStorage: 'selectedLanguage',
  

  fallbackLng: 'en'
};

const backendOptions = {
  // Path where resources get loaded from (relative path)
  loadPath: '/locales/{{lng}}/{{ns}}.json',
  
  // Allow cross-domain requests
  crossDomain: false,
  
  // Add request options for better debugging
  requestOptions: {
    cache: 'no-cache',
    mode: 'cors'
  },
  
  // Parse function to handle response
  parse: function(data) {
    console.log('Attempting to parse translation data:', typeof data, data.substring(0, 100));
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse translation data for:', data.substring(0, 200));
      console.error('Error:', e);
      return {};
    }
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Language settings
    lng: 'en',
    fallbackLng: 'en',
    
    // Supported languages
    supportedLngs: ['en', 'hi', 'kn'],
    
    // Namespace configuration
    ns: ['common', 'crop-rotation', 'agri-revive', 'agri-sensex'],
    defaultNS: 'common',
    fallbackNS: 'common',
    
    // Load all namespaces on init
    preload: ['en'], // Start with just English, load others on demand
    
    // Detection options
    detection: detectionOptions,
    
    // Backend options
    backend: backendOptions,
    
    // Interpolation options
    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
      format: function(value, format, lng, options) {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        if (format === 'capitalize') return value.charAt(0).toUpperCase() + value.slice(1);
        return value;
      }
    },
    
    // React options
    react: {
      useSuspense: false, // Disable suspense to avoid loading issues
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em', 'span'],
    },
    
    // Debug mode (enable for now to see what's happening)
    debug: true,
    
    // Save missing keys during development
    saveMissing: true,
    
    // Handle missing keys
    missingKeyHandler: function(lng, ns, key, fallbackValue) {
      console.warn(`Missing translation key: ${ns}:${key} for language: ${lng}`);
    },
    
    // Custom key separator
    keySeparator: '.',
    
    // Custom namespace separator
    nsSeparator: ':',
    
    // Pluralization rules
    pluralSeparator: '_',
    
    // Load resources synchronously for debugging
    initImmediate: false,
    
    // Resource loading timeout
    loadTimeout: 10000, // Increased timeout
    
    // Clean codes
    cleanCode: true,
    
    // Non-explicit support
    nonExplicitSupportedLngs: false
  })
  .then((t) => {
    console.log('i18next initialized successfully!');
    console.log('Available resources:', i18n.store.data);
    console.log('Current language:', i18n.language);
  })
  .catch((error) => {
    console.error('Failed to initialize i18next:', error);
  });

i18n.on('languageChanged', (lng) => {
  console.log(`Language changed to: ${lng}`);
  

  document.documentElement.lang = lng;
  

  const isRTL = ['ar', 'he', 'fa'].includes(lng);
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  

  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lng } }));
});

i18n.on('loaded', (loaded) => {
  console.log('Translation resources loaded:', loaded);
});

i18n.on('failedLoading', (lng, ns, msg) => {
  console.error(`Failed to load translations for ${lng}:${ns}`, msg);
});

export default i18n;
