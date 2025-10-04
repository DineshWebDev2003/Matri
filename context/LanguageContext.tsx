import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Home Screen
    'search_placeholder': 'Search...',
    'just_joined': 'Just Joined',
    'new_matches': 'New Matches',
    'recommended_matches': 'Recommended Matches',
    'view_all': 'View all',
    'interest_requests': 'Interest Requests',
    'interest_sent': 'Interest Sent',
    'total_shortlist': 'Total Shortlist',
    
    // Profile Screen
    'profiles': 'Profiles',
    'newly_joined': 'Newly joined',
    'all_profiles': 'All Profiles',
    'premium': 'Premium',
    'search': 'Search',
    'search_by_name': 'Search by name, caste, or profile ID...',
    'no_profiles_found': 'No profiles found',
    'loading_profiles': 'Loading profiles...',
    
    // Chat Screen
    'messages': 'Messages',
    'all': 'All',
    'unread': 'Unread',
    'chats': 'Chats',
    'interest': 'Interest',
    'online': 'Online',
    'say_something_nice': 'Say Something nice...',
    'voice_message': 'Voice Message',
    'today': 'Today',
    'yesterday': 'Yesterday',
    
    // Account Screen
    'account': 'Account',
    'profile': 'Profile',
    'settings': 'Settings',
    'logout': 'Logout',
    
    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'ok': 'OK',
    'age': 'Age',
    'height': 'Height',
    'location': 'Location',
    'id': 'ID',
  },
  ta: {
    // Home Screen
    'search_placeholder': 'தேடுக...',
    'just_joined': 'புதிதாக சேர்ந்தவர்கள்',
    'new_matches': 'புதிய பொருத்தங்கள்',
    'recommended_matches': 'பரிந்துரைக்கப்பட்ட பொருத்தங்கள்',
    'view_all': 'அனைத்தையும் பார்க்க',
    'interest_requests': 'ஆர்வ கோரிக்கைகள்',
    'interest_sent': 'ஆர்வம் அனுப்பப்பட்டது',
    'total_shortlist': 'மொத்த குறுகிய பட்டியல்',
    
    // Profile Screen
    'profiles': 'சுயவிவரங்கள்',
    'newly_joined': 'புதிதாக சேர்ந்தவர்கள்',
    'all_profiles': 'அனைத்து சுயவிவரங்கள்',
    'premium': 'பிரீமியம்',
    'search': 'தேடல்',
    'search_by_name': 'பெயர், சாதி அல்லது சுயவிவர ஐடி மூலம் தேடுங்கள்...',
    'no_profiles_found': 'சுயவிவரங்கள் எதுவும் கிடைக்கவில்லை',
    'loading_profiles': 'சுயவிவரங்களை ஏற்றுகிறது...',
    
    // Chat Screen
    'messages': 'செய்திகள்',
    'all': 'அனைத்தும்',
    'unread': 'படிக்கப்படாதவை',
    'chats': 'அரட்டைகள்',
    'interest': 'ஆர்வம்',
    'online': 'ஆன்லைன்',
    'say_something_nice': 'ஏதாவது நல்லது சொல்லுங்கள்...',
    'voice_message': 'குரல் செய்தி',
    'today': 'இன்று',
    'yesterday': 'நேற்று',
    
    // Account Screen
    'account': 'கணக்கு',
    'profile': 'சுயவிவரம்',
    'settings': 'அமைப்புகள்',
    'logout': 'வெளியேறு',
    
    // Common
    'loading': 'ஏற்றுகிறது...',
    'error': 'பிழை',
    'success': 'வெற்றி',
    'cancel': 'ரத்து',
    'ok': 'சரி',
    'age': 'வயது',
    'height': 'உயரம்',
    'location': 'இடம்',
    'id': 'ஐடி',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
