// context/ConfigContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ENDPOINTS } from '../constants/api';
import { useAlert } from './AlertContext';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({
    customer_service_number: '',
    maintenance_mode: false,
    isLoading: true,
  });
  const { showAlert } = useAlert();

  const fetchConfig = async () => {
    try {
      const res = await fetch(ENDPOINTS.settings);
      const data = await res.json();
      if (data.status === 'success') {
        setConfig({
          customer_service_number: data.config.customer_service_number || '',
          maintenance_mode: !!data.config.maintenance_mode,
          isLoading: false,
        });
      } else {
        throw new Error(data.message || 'Erreur lors du chargement de la configuration.');
      }
    } catch (err) {
      console.error('Erreur fetchConfig:', err);
      showAlert({
        title: 'Erreur de configuration',
        message: 'Impossible de récupérer les paramètres de l\'application.',
        type: 'error',
      });
      setConfig(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, refreshConfig: fetchConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

