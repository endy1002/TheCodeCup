import robustStorage from './RobustStorageService';
import { Platform } from 'react-native';

// Storage keys for different data types
const STORAGE_KEYS = {
  USER_PROFILE: '@CodeCup:userProfile',
  CART_ITEMS: '@CodeCup:cartItems',
  FAVORITES: '@CodeCup:favorites',
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
  constructor() {
    this.retryAttempts = 2;
    this.retryDelay = 500; // ms
  }

  // Generic storage methods with retry logic
  async setItem(key, value) {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const result = await robustStorage.setItem(key, value);
        if (result.success) {
          return true;
        }
        
        if (attempt < this.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      } catch (error) {
        if (attempt < this.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }
    
    return false;
  }

  async getItem(key, defaultValue = null) {
    try {
      return await robustStorage.getItem(key, defaultValue);
    } catch (error) {
      return defaultValue;
    }
  }

  async removeItem(key) {
    try {
      const result = await robustStorage.removeItem(key);
      return result.success;
    } catch (error) {
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

  // Favorites persistence
  async saveFavorites(favorites) {
    return await this.setItem(STORAGE_KEYS.FAVORITES, favorites);
  }

  async getFavorites() {
    return await this.getItem(STORAGE_KEYS.FAVORITES, []);
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
      { name: 'favorites', operation: () => this.saveFavorites(state.favorites || []) },
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
        failedOperations.push(name);
      }
    }

    const allSuccessful = failedOperations.length === 0;
    
    // Return true if at least half the operations succeeded
    return successCount >= saveOperations.length / 2;
  }

  async loadAppState() {
    try {
      const [
        userProfile,
        cartItems,
        favorites,
        stamps,
        points,
        pointHistory,
        currentOrders,
        orderHistory,
        userPreferences
      ] = await Promise.all([
        this.getUserProfile(),
        this.getCartItems(),
        this.getFavorites(),
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
        favorites,
        stamps,
        points,
        pointHistory,
        currentOrders,
        orderHistory,
        userPreferences
      };
    } catch (error) {
      return null;
    }
  }

  // Data seeding for initial app setup
  async seedInitialData() {
    try {
      const isInitialized = await this.isAppInitialized();
      
      if (!isInitialized) {
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

        return true;
      }
      
      return false; // Already initialized
    } catch (error) {
      return false;
    }
  }

  // Data migration for app updates
  async handleDataMigration(currentVersion) {
    try {
      const lastVersion = await this.getLastAppVersion();
      
      if (lastVersion !== currentVersion) {
        // Add migration logic here for future app updates
        // For example:
        // if (lastVersion < '1.1.0') {
        //   await this.migrateToV110();
        // }
        
        await this.setItem(STORAGE_KEYS.LAST_APP_VERSION, currentVersion);
      }
    } catch (error) {
      // Migration failed silently
    }
  }

  // Clear all app data (for logout or reset)
  async clearAllData() {
    try {
      // Use the robust storage clear method that handles both AsyncStorage and memory
      const result = await robustStorage.clearAllAppData();
      
      return result.success;
    } catch (error) {
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
      
      return success;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
const dataPersistenceService = new DataPersistenceService();
export default dataPersistenceService;
