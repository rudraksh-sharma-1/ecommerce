import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPromotionalSettings } from '../utils/supabaseApi';

const PromotionalContext = createContext();

export const usePromotional = () => {
  const context = useContext(PromotionalContext);
  if (!context) {
    throw new Error('usePromotional must be used within a PromotionalProvider');
  }
  return context;
};

export const PromotionalProvider = ({ children }) => {
  const [promotionalSettings, setPromotionalSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchPromotionalSettings = async () => {
    try {
      const { success, settings } = await getPromotionalSettings();
      if (success) {
        setPromotionalSettings(settings);
      }
    } catch (error) {
      console.error('Error fetching promotional settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotionalSettings();
  }, []);

  const getPromoSetting = (key, defaultValue = '') => {
    return promotionalSettings[key] || defaultValue;
  };

  const refreshPromotionalSettings = () => {
    fetchPromotionalSettings();
  };

  const value = {
    promotionalSettings,
    getPromoSetting,
    refreshPromotionalSettings,
    loading
  };

  return (
    <PromotionalContext.Provider value={value}>
      {children}
    </PromotionalContext.Provider>
  );
};

export default PromotionalContext;
