import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useAppStore } from '../viewmodels/useCartViewModel';

// Custom hook for background data persistence
export const useDataPersistence = () => {
  const { saveAppState } = useAppStore();
  const appState = useRef(AppState.currentState);
  const saveIntervalRef = useRef(null);

  useEffect(() => {
    // Auto-save every 30 seconds when app is active
    const startAutoSave = () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      
      saveIntervalRef.current = setInterval(async () => {
        try {
          await saveAppState();
        } catch (error) {
          // Auto-save failed silently
        }
      }, 30000); // 30 seconds
    };

    // Stop auto-save
    const stopAutoSave = () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
    };

    // Handle app state changes
    const handleAppStateChange = async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground
        startAutoSave();
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App went to background - save data immediately
        stopAutoSave();
        try {
          await saveAppState();
        } catch (error) {
          // Background save failed silently
        }
      }

      appState.current = nextAppState;
    };

    // Start auto-save immediately if app is active
    if (AppState.currentState === 'active') {
      startAutoSave();
    }

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup on unmount
    return () => {
      stopAutoSave();
      subscription?.remove();
    };
  }, [saveAppState]);

  // Manual save function for critical operations
  const forceSave = async () => {
    try {
      const success = await saveAppState();
      return success;
    } catch (error) {
      return false;
    }
  };

  return { forceSave };
};

// Component that handles background data persistence
export const DataPersistenceProvider = ({ children }) => {
  useDataPersistence();
  return children;
};
