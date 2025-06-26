/**
 * Internationalization (i18n) utilities for BioBloom
 */

// Default language
let currentLanguage = localStorage.getItem('biobloom-language') || 'en';
let translations = {};

/**
 * Initialize the i18n system
 * @returns {Promise<void>}
 */
export const initializeI18n = async () => {
    try {
        // Load the current language
        await loadLanguage(currentLanguage);
        
        // Update UI language selectors
        updateLanguageUI();
    } catch (error) {
        console.error('Failed to initialize i18n:', error);
        // Fall back to English if there's an error
        if (currentLanguage !== 'en') {
            currentLanguage = 'en';
            await loadLanguage('en');
        }
    }
};

/**
 * Load a language file
 * @param {string} lang - Language code to load
 * @returns {Promise<void>}
 */
export const loadLanguage = async (lang) => {
    try {
        const response = await fetch(`/i18n/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load language file: ${lang}.json`);
        }
        
        translations = await response.json();
        currentLanguage = lang;
        
        // Save user preference
        localStorage.setItem('biobloom-language', lang);
        
        // Apply translations to the page
        translatePage();
    } catch (error) {
        console.error(`Error loading language ${lang}:`, error);
        throw error;
    }
};

/**
 * Change the current language
 * @param {string} lang - Language code to change to
 */
export const changeLanguage = async (lang) => {
    await loadLanguage(lang);
    updateLanguageUI();
};

/**
 * Translate the current page
 */
export const translatePage = () => {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });
    
    // Also update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[key]) {
            element.setAttribute('placeholder', translations[key]);
        }
    });
};

/**
 * Update language selection UI elements
 */
function updateLanguageUI() {
    document.querySelectorAll('.language-selector').forEach(select => {
        if (select.tagName === 'SELECT') {
            select.value = currentLanguage;
        } else {
            // For other UI elements like buttons or links
            // Remove active class from all
            select.querySelectorAll('.language-option').forEach(option => {
                option.classList.remove('active');
            });
            // Add active class to current language
            const activeOption = select.querySelector(`[data-lang="${currentLanguage}"]`);
            if (activeOption) {
                activeOption.classList.add('active');
            }
        }
    });
}

/**
 * Get a translated string
 * @param {string} key - Translation key
 * @param {Object} params - Optional parameters for string interpolation
 * @returns {string} - Translated string
 */
export const translate = (key, params = {}) => {
    let text = translations[key] || key;
    
    // Simple string interpolation
    Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`{${paramKey}}`, 'g'), paramValue);
    });
    
    return text;
};

// Export the current language
export const getCurrentLanguage = () => currentLanguage;

// Initialize when the script is loaded
document.addEventListener('DOMContentLoaded', initializeI18n);

// Attach language change event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.language-selector').forEach(selector => {
        if (selector.tagName === 'SELECT') {
            selector.addEventListener('change', (e) => changeLanguage(e.target.value));
        } else {
            selector.querySelectorAll('.language-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    const lang = e.currentTarget.getAttribute('data-lang');
                    if (lang) {
                        changeLanguage(lang);
                    }
                });
            });
        }
    });
});
