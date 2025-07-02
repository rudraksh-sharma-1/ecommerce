import React, { createContext, useContext } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  // Static settings - no database calls needed
  const staticSettings = {
    company_name: 'BBMart',
    site_logo: '/logo.png',
    site_description: 'Your Online Shopping Destination',
    contact_email: 'support@bbmart.com',
    contact_phone: '+1-234-567-8900',
    site_tagline: 'Shop Smart, Shop BBMart'
  };

  // Helper function to get setting value with fallback
  const getSetting = (key, fallback = '') => {
    return staticSettings[key] || fallback;
  };

  const value = {
    settings: staticSettings,
    loading: false,
    error: null,
    getSetting
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
