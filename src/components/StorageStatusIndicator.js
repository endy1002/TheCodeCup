import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import robustStorage from '../services/RobustStorageService';

const StorageStatusIndicator = () => {
  const [storageInfo, setStorageInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(__DEV__); // Only show in development

  useEffect(() => {
    const getStorageInfo = async () => {
      // Give storage service time to initialize
      setTimeout(async () => {
        const info = robustStorage.getStorageInfo();
        setStorageInfo(info);
      }, 1000);
    };

    getStorageInfo();
  }, []);

  if (!isVisible || !storageInfo) {
    return null;
  }

  const getStatusColor = () => {
    switch (storageInfo.type) {
      case 'AsyncStorage':
        return '#4CAF50'; // Green
      case 'MemoryStorage':
        return '#FF9800'; // Orange
      default:
        return '#757575'; // Gray
    }
  };

  const getStatusText = () => {
    switch (storageInfo.type) {
      case 'AsyncStorage':
        return '💾 Persistent Storage';
      case 'MemoryStorage':
        return '📝 Memory Storage';
      default:
        return '❓ Unknown Storage';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: getStatusColor() }]}
      onPress={() => setIsVisible(false)}
    >
      <Text style={styles.text}>{getStatusText()}</Text>
      {storageInfo.type === 'MemoryStorage' && (
        <Text style={styles.subText}>Data won't persist between app restarts</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    padding: 8,
    borderRadius: 8,
    zIndex: 1000,
    maxWidth: 200,
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.9,
  },
});

export default StorageStatusIndicator;
