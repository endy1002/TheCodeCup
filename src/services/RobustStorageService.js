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

  // Test AsyncStorage availability with multiple attempts and better error handling
  async testAsyncStorage() {
    if (this.isAsyncStorageAvailable !== null) {
      return this.isAsyncStorageAvailable;
    }

    // Single test first to avoid spam
    try {
      const testKey = '@CodeCup:test_' + Date.now();
      const testValue = 'test_single';
      
      await AsyncStorage.setItem(testKey, testValue);
      const retrieved = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
      
      if (retrieved === testValue) {
        this.isAsyncStorageAvailable = true;
        this.storageType = 'AsyncStorage';
        if (__DEV__) console.log('✅ AsyncStorage is working correctly');
        return true;
      }
    } catch (error) {
      // Detect iOS simulator specific errors to reduce spam
      const isIOSSimulatorError = error.message.includes('ExponentExperienceData') || 
                                  error.message.includes('NSCocoaErrorDomain') ||
                                  error.message.includes('Not a directory');
      
      if (isIOSSimulatorError) {
        this.isAsyncStorageAvailable = false;
        this.storageType = 'MemoryStorage';
        if (__DEV__) {
          console.log('📱 iOS Simulator detected - using memory storage (normal behavior)');
        }
        return false;
      } else {
        // For other errors, do retry logic
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
          try {
            const testKey = '@CodeCup:test_' + Date.now() + '_' + attempt;
            const testValue = 'test_' + attempt;
            
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('AsyncStorage test timeout')), 5000)
            );
            
            const testPromise = (async () => {
              await AsyncStorage.setItem(testKey, testValue);
              const retrieved = await AsyncStorage.getItem(testKey);
              await AsyncStorage.removeItem(testKey);
              return retrieved;
            })();
            
            const retrieved = await Promise.race([testPromise, timeoutPromise]);
            
            if (retrieved === testValue) {
              this.isAsyncStorageAvailable = true;
              this.storageType = 'AsyncStorage';
              console.log(`✅ AsyncStorage is working correctly (attempt ${attempt})`);
              return true;
            }
          } catch (retryError) {
            if (__DEV__ && attempt === this.retryAttempts) {
              console.warn(`⚠️ AsyncStorage test failed after ${this.retryAttempts} attempts`);
            }
            if (attempt < this.retryAttempts) {
              await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
            }
          }
        }
      }
    }

    this.isAsyncStorageAvailable = false;
    this.storageType = 'MemoryStorage';
    if (__DEV__) console.log('📝 Using memory storage fallback after all attempts failed');
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
      console.error(`Storage setItem failed for ${key}:`, error.message);
      
      // Fallback to memory storage
      try {
        const jsonValue = JSON.stringify(value);
        this.memoryStore.set(key, jsonValue);
        return { success: true, method: 'MemoryStorage (fallback)' };
      } catch (fallbackError) {
        console.error(`Memory storage fallback failed for ${key}:`, fallbackError.message);
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
      console.error(`Storage removeItem failed for ${key}:`, error.message);
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
      console.error('Storage multiRemove failed:', error.message);
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
      console.log('✅ Memory storage cleared');
      
      // Reset storage service state
      this.isAsyncStorageAvailable = null;
      this.storageType = 'unknown';
      
      console.log('🎉 All app data cleared successfully');
      return { success: true, clearedStorage: true };
    } catch (error) {
      console.error('❌ Failed to clear app data:', error.message);
      
      // Fallback: at least clear memory storage
      try {
        this.memoryStore.clear();
        console.log('⚠️ Memory storage cleared as fallback');
        return { success: true, clearedStorage: false, error: error.message };
      } catch (fallbackError) {
        console.error('❌ Complete failure to clear data:', fallbackError.message);
        return { success: false, error: fallbackError.message };
      }
    }
  }

  // Force re-test of AsyncStorage (useful for debugging and recovery)
  async retestAsyncStorage() {
    this.isAsyncStorageAvailable = null;
    this.storageType = 'unknown';
    const result = await this.testAsyncStorage();
    
    if (result) {
      console.log('🔄 AsyncStorage retest successful - switched to persistent storage');
    } else {
      // Provide more context about why retest failed
      const isSimulator = Platform.OS === 'ios' && __DEV__;
      if (isSimulator) {
        if (__DEV__) {
          console.log('🔄 AsyncStorage retest failed - remaining on memory storage (normal in iOS Simulator)');
        }
      } else {
        console.log('🔄 AsyncStorage retest failed - remaining on memory storage');
      }
    }
    
    return result;
  }

  // Health check method for monitoring storage status
  async getStorageHealth() {
    const healthInfo = {
      type: this.storageType,
      isAsyncStorageAvailable: this.isAsyncStorageAvailable,
      memoryStoreSize: this.memoryStore.size,
      lastTestedAt: new Date().toISOString()
    };

    // If using memory storage, try to retest AsyncStorage periodically
    if (this.storageType === 'MemoryStorage') {
      try {
        const retestResult = await this.retestAsyncStorage();
        healthInfo.retestSuccessful = retestResult;
      } catch (error) {
        healthInfo.retestError = error.message;
      }
    }

    return healthInfo;
  }
}

// Create singleton instance
const robustStorage = new RobustStorageService();
export default robustStorage;
