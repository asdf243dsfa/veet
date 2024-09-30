// VeetAI Internationalization Module
class VeetI18n {
  constructor() {
    this.currentLanguage = 'en';
    this.translations = {};
    this.availableLanguages = {
      'en': 'English',
      'es': 'Español',
      'fr': 'Français', 
      'de': 'Deutsch',
      'it': 'Italiano',
      'pt': 'Português',
      'ja': '日本語',
      'ko': '한국어',
      'zh': '中文',
      'ar': 'العربية',
      'hi': 'हिन्दी'
    };
    
    this.init();
  }

  async init() {
    // 1. Detect user's preferred language
    this.currentLanguage = this.detectLanguage();
    
    // 2. Load translations for current language
    await this.loadTranslations(this.currentLanguage);
    
    // 3. Apply translations to the page
    this.translatePage();
    
    // 4. Set up language change listeners
    this.setupLanguageChangeListeners();
  }

  detectLanguage() {
    // Priority: URL param > localStorage > browser language > default
    
    // 1. Check URL parameter (?lang=es)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && this.availableLanguages[urlLang]) {
      return urlLang;
    }
    
    // 2. Check localStorage
    const savedLang = localStorage.getItem('intellimeet-language');
    if (savedLang && this.availableLanguages[savedLang]) {
      return savedLang;
    }
    
    // 3. Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (this.availableLanguages[browserLang]) {
      return browserLang;
    }
    
    // 4. Default to English
    return 'en';
  }

  async loadTranslations(language) {
    try {
      const response = await fetch(`/locales/${language}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load ${language} translations`);
      }
      this.translations = await response.json();
      console.log(`✅ Loaded ${language} translations`);
    } catch (error) {
      console.warn(`⚠️ Failed to load ${language} translations:`, error);
      
      // Fallback to English if not already English
      if (language !== 'en') {
        console.log('📖 Falling back to English translations');
        await this.loadTranslations('en');
        this.currentLanguage = 'en';
      }
    }
  }

  translatePage() {
    // Translate elements with data-i18n attributes
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.translations[key];
      
      if (translation) {
        // Handle different element types
        if (element.tagName === 'INPUT' && element.type === 'text') {
          element.placeholder = translation;
        } else {
          element.textContent = translation;
        }
      } else {
        console.warn(`⚠️ Missing translation for key: ${key}`);
      }
    });

    // Update document title and meta tags
    if (this.translations.page_title) {
      document.title = this.translations.page_title;
    }

    // Update HTML lang attribute
    document.documentElement.lang = this.currentLanguage;
    
    console.log(`🌐 Page translated to: ${this.availableLanguages[this.currentLanguage]}`);
  }

  async changeLanguage(newLanguage) {
    if (!this.availableLanguages[newLanguage]) {
      console.error(`❌ Language ${newLanguage} not available`);
      return;
    }

    if (newLanguage === this.currentLanguage) {
      return; // Already using this language
    }

    console.log(`🔄 Changing language to: ${this.availableLanguages[newLanguage]}`);
    
    // Load new translations
    await this.loadTranslations(newLanguage);
    this.currentLanguage = newLanguage;
    
    // Save to localStorage
    localStorage.setItem('intellimeet-language', newLanguage);
    
    // Update URL parameter
    const url = new URL(window.location);
    url.searchParams.set('lang', newLanguage);
    window.history.replaceState(null, '', url);
    
    // Re-translate page
    this.translatePage();
    
    // Trigger custom event for other components
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: newLanguage } 
    }));
  }

  setupLanguageChangeListeners() {
    // Listen for language selector changes
    document.addEventListener('change', (e) => {
      if (e.target.matches('[data-language-selector]')) {
        this.changeLanguage(e.target.value);
      }
    });

    // Listen for language button clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-lang]')) {
        const lang = e.target.getAttribute('data-lang');
        this.changeLanguage(lang);
      }
    });
  }

  // Public API methods
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getAvailableLanguages() {
    return { ...this.availableLanguages };
  }

  translate(key) {
    return this.translations[key] || key;
  }

  isRTL() {
    return ['ar'].includes(this.currentLanguage);
  }
}

// Initialize and expose globally
window.veetI18n = new VeetI18n();

// Export for modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VeetI18n;
}