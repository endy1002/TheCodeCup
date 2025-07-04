import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppStore } from '../viewmodels/useCartViewModel';
import { DataPersistenceProvider } from '../hooks/useDataPersistence';
import StorageStatusIndicator from './StorageStatusIndicator';

const AppInitializer = ({ children }) => {
  const { isLoading, isInitialized, initializeApp } = useAppStore();

  useEffect(() => {
    const setupApp = async () => {
      try {
        await initializeApp();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    setupApp();
  }, [initializeApp]);

  if (isLoading || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Loading The Code Cup...</Text>
        <Text style={styles.subText}>Preparing your coffee experience</Text>
      </View>
    );
  }

  return (
    <DataPersistenceProvider>
      {children}
      <StorageStatusIndicator />
    </DataPersistenceProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5DC',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  subText: {
    marginTop: 10,
    fontSize: 14,
    color: '#A0522D',
    textAlign: 'center',
  },
});

export default AppInitializer;
