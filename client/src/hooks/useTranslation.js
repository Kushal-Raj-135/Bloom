import { useTranslation } from '../../node_modules/react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

export const useEnhancedTranslation = (namespace = 'common') => {
  const { t: i18nT, i18n } = useTranslation(namespace);
  const { formatters, hasTranslation } = useLanguage();


  const t = (key, options = {}) => {
  
    const fullKey = namespace === 'common' ? key : `${namespace}:${key}`;
    
  
    return i18nT(key, {
      defaultValue: options.defaultValue || key,
      ...options
    });
  };


  const tHTML = (key, options = {}) => {
    return {
      __html: t(key, options)
    };
  };


  const tCount = (key, count, options = {}) => {
    return t(key, {
      count,
      ...options
    });
  };


  const tInterpolate = (key, values = {}, options = {}) => {
    return t(key, {
      ...values,
      ...options
    });
  };


  const tNS = (ns, key, options = {}) => {
    return i18nT(`${ns}:${key}`, options);
  };


  const exists = (key) => {
    return hasTranslation(key, { ns: namespace });
  };


  const getResourceBundle = () => {
    return i18n.getResourceBundle(i18n.language, namespace);
  };


  const formatNumber = (value, options = {}) => {
    return formatters.number(value, options);
  };


  const formatCurrency = (value, currency = 'INR') => {
    return formatters.currency(value, currency);
  };


  const formatDate = (value, options = {}) => {
    return formatters.date(value, options);
  };


  const formatRelativeTime = (value) => {
    return formatters.relativeTime(value);
  };

  return {
  
    t,
    tHTML,
    tCount,
    tInterpolate,
    tNS,
    
  
    exists,
    getResourceBundle,
    
  
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime,
    
  
    i18n,
    
  
    language: i18n.language,
    isRTL: ['ar', 'he', 'fa'].includes(i18n.language)
  };
};

/**
 * Hook for getting translations from multiple namespaces
 */
export const useMultiNamespaceTranslation = (namespaces = ['common']) => {
  const { t, i18n } = useTranslation(namespaces);
  
  const translations = {};
  
  namespaces.forEach(ns => {
    translations[ns] = (key, options = {}) => {
      return t(`${ns}:${key}`, options);
    };
  });
  
  return {
    ...translations,
    t,
    i18n
  };
};

/**
 * Hook for lazy loading translation namespaces
 */
export const useLazyTranslation = () => {
  const { loadNamespace } = useLanguage();
  const { i18n } = useTranslation();
  
  const loadAndUse = async (namespace) => {
    await loadNamespace(namespace);
    return useTranslation(namespace);
  };
  
  return {
    loadAndUse,
    loadNamespace,
    i18n
  };
};

export default useEnhancedTranslation;
