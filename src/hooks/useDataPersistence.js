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
          console.log('Auto-save completed');
        } catch (error) {
          console.error('Auto-save failed:', error);
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
        console.log('App came to foreground - starting auto-save');
        startAutoSave();
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App went to background - save data immediately
        console.log('App went to background - saving data');
        stopAutoSave();
        try {
          await saveAppState();
          console.log('Background save completed');
        } catch (error) {
          console.error('Background save failed:', error);
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
      if (success) {
        console.log('Force save completed successfully');
      } else {
        console.warn('Force save completed with some failures');
      }
      return success;
    } catch (error) {
      console.error('Force save failed:', error);
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
