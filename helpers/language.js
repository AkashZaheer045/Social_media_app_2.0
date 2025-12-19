/**
 * Language Detection Helper
 * Detects user's preferred language from various sources
 */

const detectLanguage = (req) => {
  // Priority order for language detection:
  // 1. URL parameter (?lang=ar)
  // 2. Request header (Accept-Language)
  // 3. Authorization token payload (if user is logged in)
  // 4. Default to English

  const language = 'en'; // Default language

  try {
    // 1. Check URL parameter
    if (req.query && req.query.lang) {
      const urlLang = req.query.lang.toLowerCase();
      if (isValidLanguage(urlLang)) {
        return urlLang;
      }
    }

    // 2. Check custom header (X-Language)
    if (req.headers && req.headers['x-language']) {
      const headerLang = req.headers['x-language'].toLowerCase();
      if (isValidLanguage(headerLang)) {
        return headerLang;
      }
    }

    // 3. Check Accept-Language header
    if (req.headers && req.headers['accept-language']) {
      const acceptLang = req.headers['accept-language'].split(',')[0].split('-')[0];
      if (isValidLanguage(acceptLang)) {
        return acceptLang;
      }
    }

    // 4. Check user preferences from token/session
    if (req.user && req.user.preferred_language) {
      const userLang = req.user.preferred_language.toLowerCase();
      if (isValidLanguage(userLang)) {
        return userLang;
      }
    }
  } catch (error) {
    console.log('Language detection error:', error.message);
  }

  return language; // Return default 'en'
};

/**
 * Validate if the language code is supported
 */
const isValidLanguage = (lang) => {
  const supportedLanguages = ['en', 'ar'];
  return supportedLanguages.includes(lang.toLowerCase());
};

/**
 * Get supported languages list
 */
const getSupportedLanguages = () => {
  return ['en', 'ar'];
};

/**
 * Get language direction (for RTL support)
 */
const getLanguageDirection = (lang) => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(lang.toLowerCase()) ? 'rtl' : 'ltr';
};

module.exports = {
  detectLanguage,
  isValidLanguage,
  getSupportedLanguages,
  getLanguageDirection,
};
