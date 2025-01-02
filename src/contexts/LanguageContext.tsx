import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // App Header
    'app.title': 'DSF App',
    'app.tabs.chat': 'Chat Assistant',
    'app.tabs.supplements': 'Supplement Tracker',
    
    // Chat
    'chat.input.placeholder': 'Type your message here...',
    
    // Supplements
    'supplements.title': 'Log Supplements',
    'supplements.date.title': 'Select Date',
    'supplements.log.button': 'Log',
    'supplements.empty': 'No supplements found. Add some to get started!',
    
    // Success Messages
    'success.supplement.logged': 'Supplement logged successfully',
    
    // Error Messages
    'error.supplement.failed': 'Failed to log supplement',
    'error.chat.failed': 'Failed to send message',
  },
  hi: {
    // App Header
    'app.title': 'डीएसएफ ऐप',
    'app.tabs.chat': 'चैट सहायक',
    'app.tabs.supplements': 'सप्लीमेंट ट्रैकर',
    
    // Chat
    'chat.input.placeholder': 'अपना संदेश यहां टाइप करें...',
    
    // Supplements
    'supplements.title': 'सप्लीमेंट लॉग करें',
    'supplements.date.title': 'दिनांक चुनें',
    'supplements.log.button': 'लॉग करें',
    'supplements.empty': 'कोई सप्लीमेंट नहीं मिला। शुरू करने के लिए कुछ जोड़ें!',
    
    // Success Messages
    'success.supplement.logged': 'सप्लीमेंट सफलतापूर्वक लॉग किया गया',
    
    // Error Messages
    'error.supplement.failed': 'सप्लीमेंट लॉग करने में विफल',
    'error.chat.failed': 'संदेश भेजने में विफल',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};