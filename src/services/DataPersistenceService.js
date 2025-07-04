import robustStorage from './RobustStorageService';

// Storage keys for different data types
const STORAGE_KEYS = {
  USER_PROFILE: '@CodeCup:userProfile',
  CART_ITEMS: '@CodeCup:cartItems',
  STAMPS: '@CodeCup:stamps',
  POINTS: '@CodeCup:points',
  POINT_HISTORY: '@CodeCup:pointHistory',
  CURRENT_ORDERS: '@CodeCup:currentOrders',
  ORDER_HISTORY: '@CodeCup:orderHistory',
  APP_INITIALIZED: '@CodeCup:appInitialized',
  LAST_APP_VERSION: '@CodeCup:lastAppVersion',
  USER_PREFERENCES: '@CodeCup:userPreferences',
};

class DataPersistenceService {
  // Generic storage methods
  async setItem(key, value) {
    try {
      const result = await robustStorage.setItem(key, value);
      if (result.success) {
        // Only log in development mode to reduce noise
        if (__DEV__ && result.method !== 'AsyncStorage') {
          console.log(`💾 ${key} saved using ${result.method}`);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Storage operation failed for ${key}:`, error);
      return false;
    }
  }

  async getItem(key, defaultValue = null) {
    try {
      return await robustStorage.getItem(key, defaultValue);
    } catch (error) {
      console.error(`Storage read failed for ${key}:`, error);
      return defaultValue;
    }
  }

  async removeItem(key) {
    try {
      const result = await robustStorage.removeItem(key);
      return result.success;
    } catch (error) {
      console.error(`Storage remove failed for ${key}:`, error);
      return false;
    }
  }

  // User Profile persistence
  async saveUserProfile(profile) {
    return await this.setItem(STORAGE_KEYS.USER_PROFILE, profile);
  }

  async getUserProfile() {
    return await this.getItem(STORAGE_KEYS.USER_PROFILE, {
      name: 'Le Tan Nguyen Dat',
      dateOfBirth: '2005-02-10',
      phoneNumber: '12345',
      email: 'Endy@apcs',
      address: 'Tran Phu, Ho Chi Minh'
    });
  }

  // Cart persistence
  async saveCartItems(cartItems) {
    return await this.setItem(STORAGE_KEYS.CART_ITEMS, cartItems);
  }

  async getCartItems() {
    return await this.getItem(STORAGE_KEYS.CART_ITEMS, []);
  }

  // Stamps and Points persistence
  async saveStamps(stamps) {
    return await this.setItem(STORAGE_KEYS.STAMPS, stamps);
  }

  async getStamps() {
    return await this.getItem(STORAGE_KEYS.STAMPS, 0);
  }

  async savePoints(points) {
    return await this.setItem(STORAGE_KEYS.POINTS, points);
  }

  async getPoints() {
    return await this.getItem(STORAGE_KEYS.POINTS, 0);
  }

  async savePointHistory(pointHistory) {
    return await this.setItem(STORAGE_KEYS.POINT_HISTORY, pointHistory);
  }

  async getPointHistory() {
    return await this.getItem(STORAGE_KEYS.POINT_HISTORY, []);
  }

  // Orders persistence
  async saveCurrentOrders(orders) {
    return await this.setItem(STORAGE_KEYS.CURRENT_ORDERS, orders);
  }

  async getCurrentOrders() {
    return await this.getItem(STORAGE_KEYS.CURRENT_ORDERS, []);
  }

  async saveOrderHistory(orderHistory) {
    return await this.setItem(STORAGE_KEYS.ORDER_HISTORY, orderHistory);
  }

  async getOrderHistory() {
    return await this.getItem(STORAGE_KEYS.ORDER_HISTORY, []);
  }

  // App initialization and versioning
  async setAppInitialized(version = '1.0.0') {
    await this.setItem(STORAGE_KEYS.APP_INITIALIZED, true);
    return await this.setItem(STORAGE_KEYS.LAST_APP_VERSION, version);
  }

  async isAppInitialized() {
    return await this.getItem(STORAGE_KEYS.APP_INITIALIZED, false);
  }

  async getLastAppVersion() {
    return await this.getItem(STORAGE_KEYS.LAST_APP_VERSION, '0.0.0');
  }

  // User preferences
  async saveUserPreferences(preferences) {
    return await this.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  async getUserPreferences() {
    return await this.getItem(STORAGE_KEYS.USER_PREFERENCES, {
      notifications: true,
      darkMode: false,
      language: 'en',
      currency: 'USD'
    });
  }

  // Complete app state save/load
  async saveAppState(state) {
    const saveOperations = [
      { name: 'userProfile', operation: () => this.saveUserProfile(state.userProfile) },
      { name: 'cartItems', operation: () => this.saveCartItems(state.cartItems) },
      { name: 'stamps', operation: () => this.saveStamps(state.stamps) },
      { name: 'points', operation: () => this.savePoints(state.points) },
      { name: 'pointHistory', operation: () => this.savePointHistory(state.pointHistory) },
      { name: 'currentOrders', operation: () => this.saveCurrentOrders(state.currentOrders) },
      { name: 'orderHistory', operation: () => this.saveOrderHistory(state.orderHistory) },
    ];

    let successCount = 0;
    let failedOperations = [];

    for (const { name, operation } of saveOperations) {
      try {
        const success = await operation();
        if (success) {
          successCount++;
        } else {
          failedOperations.push(name);
        }
      } catch (error) {
        console.error(`Failed to save ${name}:`, error);
        failedOperations.push(name);
      }
    }

    const allSuccessful = failedOperations.length === 0;
    
    if (allSuccessful) {
      if (__DEV__) console.log('✅ All app state saved successfully');
    } else if (result.partialSuccess) {
      console.warn(`⚠️ Partial save success: ${result.successCount}/${result.totalOperations} items saved`);
    } else {
      console.error('❌ Failed to save app state');
    }
    
    // Return true if at least half the operations succeeded
    return successCount >= saveOperations.length / 2;
  }

  async loadAppState() {
    try {
      const [
        userProfile,
        cartItems,
        stamps,
        points,
        pointHistory,
        currentOrders,
        orderHistory,
        userPreferences
      ] = await Promise.all([
        this.getUserProfile(),
        this.getCartItems(),
        this.getStamps(),
        this.getPoints(),
        this.getPointHistory(),
        this.getCurrentOrders(),
        this.getOrderHistory(),
        this.getUserPreferences()
      ]);

      return {
        userProfile,
        cartItems,
        stamps,
        points,
        pointHistory,
        currentOrders,
        orderHistory,
        userPreferences
      };
    } catch (error) {
      console.error('Error loading app state:', error);
      return null;
    }
  }

  // Data seeding for initial app setup
  async seedInitialData() {
    try {
      const isInitialized = await this.isAppInitialized();
      
      if (!isInitialized) {
        if (__DEV__) console.log('🌱 Seeding initial app data...');
        
        // Initial user profile
        const defaultProfile = {
          name: 'Le Tan Nguyen Dat',
          dateOfBirth: '2005-02-10',
          phoneNumber: '12345',
          email: 'Endy@apcs',
          address: 'Tran Phu, Ho Chi Minh'
        };

        // Initial user preferences
        const defaultPreferences = {
          notifications: true,
          darkMode: false,
          language: 'en',
          currency: 'USD'
        };

        // Welcome bonus
        const welcomePointHistory = [{
          id: Date.now().toString(),
          date: new Date().toISOString(),
          description: 'Welcome bonus!',
          points: 100,
          type: 'earned'
        }];

        // Save initial data
        await Promise.all([
          this.saveUserProfile(defaultProfile),
          this.savePoints(100), // Welcome bonus points
          this.savePointHistory(welcomePointHistory),
          this.saveUserPreferences(defaultPreferences),
          this.setAppInitialized('1.0.0')
        ]);

        console.log('✅ Initial data seeded successfully');
        return true;
      }
      
      return false; // Already initialized
    } catch (error) {
      console.error('Error seeding initial data:', error);
      return false;
    }
  }

  // Data migration for app updates
  async handleDataMigration(currentVersion) {
    try {
      const lastVersion = await this.getLastAppVersion();
      
      if (lastVersion !== currentVersion) {
        if (__DEV__) console.log(`📦 Migrating data from version ${lastVersion} to ${currentVersion}`);
        
        // Add migration logic here for future app updates
        // For example:
        // if (lastVersion < '1.1.0') {
        //   await this.migrateToV110();
        // }
        
        await this.setItem(STORAGE_KEYS.LAST_APP_VERSION, currentVersion);
        console.log('✅ Data migration completed');
      }
    } catch (error) {
      console.error('Error during data migration:', error);
    }
  }

  // Clear all app data (for logout or reset)
  async clearAllData() {
    try {
      const keys = Object.values(STORAGE_KEYS);
      const result = await robustStorage.multiRemove(keys);
      
      if (result.success) {
        console.log('✅ All app data cleared successfully');
      } else {
        console.warn('⚠️ Some data may not have been cleared properly');
      }
      
      return true; // Always return true since fallback ensures some cleanup
    } catch (error) {
      console.error('Error clearing app data:', error);
      return false;
    }
  }

  // Export/Import data for backup purposes
  async exportUserData() {
    try {
      const appState = await this.loadAppState();
      const exportData = {
        ...appState,
        exportDate: new Date().toISOString(),
        appVersion: await this.getLastAppVersion()
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting user data:', error);
      return null;
    }
  }

  async importUserData(importDataString) {
    try {
      const importData = JSON.parse(importDataString);
      
      // Validate import data structure
      if (!importData.userProfile || !importData.exportDate) {
        throw new Error('Invalid import data format');
      }
      
      // Save imported data
      const success = await this.saveAppState(importData);
      
      if (success) {
        console.log('User data imported successfully');
      }
      
      return success;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  }
}

// Singleton instance
const dataPersistenceService = new DataPersistenceService();
export default dataPersistenceService;
