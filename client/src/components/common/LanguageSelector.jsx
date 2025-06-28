import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './LanguageSelector.css';

const LanguageSelector = ({ 
  variant = 'dropdown', // 'dropdown', 'buttons', 'toggle'
  showFlags = true,
  showNativeNames = true,
  className = '',
  onLanguageChange
}) => {
  const { 
    currentLanguage, 
    availableLanguages, 
    changeLanguage, 
    isLoading 
  } = useLanguage();

  const handleLanguageChange = async (langCode) => {
    const success = await changeLanguage(langCode);
    if (success && onLanguageChange) {
      onLanguageChange(langCode);
    }
  };

  if (variant === 'dropdown') {
    return (
      <div className={`language-selector dropdown ${className}`}>
        <select
          value={currentLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          disabled={isLoading}
          className="language-dropdown"
        >
          {availableLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {showFlags && lang.flag} {showNativeNames ? lang.nativeName : lang.name}
            </option>
          ))}
        </select>
        {isLoading && <div className="loading-spinner"></div>}
      </div>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className={`language-selector buttons ${className}`}>
        {availableLanguages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`language-button ${currentLanguage === lang.code ? 'active' : ''}`}
            disabled={isLoading}
          >
            {showFlags && <span className="flag">{lang.flag}</span>}
            <span className="name">
              {showNativeNames ? lang.nativeName : lang.name}
            </span>
          </button>
        ))}
        {isLoading && <div className="loading-overlay"></div>}
      </div>
    );
  }

  if (variant === 'toggle') {
    return (
      <div className={`language-selector toggle ${className}`}>
        <div className="current-language">
          {showFlags && availableLanguages.find(l => l.code === currentLanguage)?.flag}
          <span>
            {showNativeNames 
              ? availableLanguages.find(l => l.code === currentLanguage)?.nativeName
              : availableLanguages.find(l => l.code === currentLanguage)?.name
            }
          </span>
          <i className="fas fa-chevron-down"></i>
        </div>
        <div className="language-menu">
          {availableLanguages
            .filter(lang => lang.code !== currentLanguage)
            .map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="language-option"
              disabled={isLoading}
            >
              {showFlags && <span className="flag">{lang.flag}</span>}
              <span className="name">
                {showNativeNames ? lang.nativeName : lang.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default LanguageSelector;
