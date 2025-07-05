// Enhanced storage service that handles Expo/simulator storage issues
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class RobustStorageService {
  constructor() {
    this.isAsyncStorageAvailable = null;
    this.memoryStore = new Map();
    this.storageType = 'unknown';
    this.retryAttempts = 3;
    this.retryDelay = 100; // ms
  }

  // Test AsyncStorage availability
  async testAsyncStorage() {
    if (this.isAsyncStorageAvailable !== null) {
      return this.isAsyncStorageAvailable;
    }

    try {
      const testKey = '@CodeCup:test_' + Date.now();
      const testValue = 'test_single';
      
      await AsyncStorage.setItem(testKey, testValue);
      const retrieved = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
      
      if (retrieved === testValue) {
        this.isAsyncStorageAvailable = true;
        this.storageType = 'AsyncStorage';
        return true;
      }
    } catch (error) {
      this.isAsyncStorageAvailable = false;
      this.storageType = 'MemoryStorage';
      return false;
    }

    this.isAsyncStorageAvailable = false;
    this.storageType = 'MemoryStorage';
    return false;
  }

  async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      
      if (await this.testAsyncStorage()) {
        await AsyncStorage.setItem(key, jsonValue);
        return { success: true, method: 'AsyncStorage' };
      } else {
        this.memoryStore.set(key, jsonValue);
        return { success: true, method: 'MemoryStorage' };
      }
    } catch (error) {
      // Fallback to memory storage
      try {
        const jsonValue = JSON.stringify(value);
        this.memoryStore.set(key, jsonValue);
        return { success: true, method: 'MemoryStorage (fallback)' };
      } catch (fallbackError) {
        return { success: false, error: fallbackError };
      }
    }
  }

  async getItem(key, defaultValue = null) {
    try {
      if (await this.testAsyncStorage()) {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
      } else {
        const jsonValue = this.memoryStore.get(key);
        return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
      }
    } catch (error) {
      console.error(`Storage getItem failed for ${key}:`, error.message);
      
      // Try memory storage
      try {
        const jsonValue = this.memoryStore.get(key);
        return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
      } catch (fallbackError) {
        console.error(`Memory storage fallback failed for ${key}:`, fallbackError.message);
        return defaultValue;
      }
    }
  }

  async removeItem(key) {
    try {
      if (await this.testAsyncStorage()) {
        await AsyncStorage.removeItem(key);
      }
      this.memoryStore.delete(key);
      return { success: true };
    } catch (error) {
      this.memoryStore.delete(key);
      return { success: false, error };
    }
  }

  async multiRemove(keys) {
    try {
      if (await this.testAsyncStorage()) {
        await AsyncStorage.multiRemove(keys);
      }
      keys.forEach(key => this.memoryStore.delete(key));
      return { success: true };
    } catch (error) {
      keys.forEach(key => this.memoryStore.delete(key));
      return { success: false, error };
    }
  }

  async clear() {
    try {
      if (await this.testAsyncStorage()) {
        await AsyncStorage.clear();
      }
      this.memoryStore.clear();
      return { success: true };
    } catch (error) {
      console.error('Storage clear failed:', error.message);
      this.memoryStore.clear();
      return { success: false, error };
    }
  }

  async clearAllAppData() {
    try {
      console.log('🗑️ Clearing all app data...');
      
      // Clear AsyncStorage if available
      if (await this.testAsyncStorage()) {
        await AsyncStorage.clear();
        console.log('✅ AsyncStorage cleared');
      }
      
      // Clear memory storage
      this.memoryStore.clear();
      
      // Reset storage service state
      this.isAsyncStorageAvailable = null;
      this.storageType = 'unknown';
      
      return { success: true, clearedStorage: true };
    } catch (error) {
      // Fallback: at least clear memory storage
      try {
        this.memoryStore.clear();
        return { success: true, clearedStorage: false, error: error.message };
      } catch (fallbackError) {
        return { success: false, error: fallbackError.message };
      }
    }
  }
}

// Create singleton instance
const robustStorage = new RobustStorageService();
export default robustStorage;
