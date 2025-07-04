import {create} from 'zustand';
import dataPersistenceService from '../services/DataPersistenceService';
import { safeStorageOperation, safeBatchStorageOperation } from '../utils/storageUtils';

export const useAppStore = create((set, get) => ({
  // App initialization state
  isLoading: true,
  isInitialized: false,
  // Cart Management
  cartItems: [],
  addToCart: async (item) => {
    const state = get();
    const newCartItems = [...state.cartItems, { ...item, id: Date.now().toString() }];
    set({ cartItems: newCartItems });
    
    // Save to storage but don't block UI if it fails
    try {
      await dataPersistenceService.saveCartItems(newCartItems);
    } catch (error) {
      console.warn('Failed to save cart items:', error);
    }
  },
  removeFromCart: async (id) => {
    const state = get();
    const newCartItems = state.cartItems.filter((item) => item.id !== id);
    set({ cartItems: newCartItems });
    
    try {
      await dataPersistenceService.saveCartItems(newCartItems);
    } catch (error) {
      console.warn('Failed to save cart items:', error);
    }
  },
  clearCart: async () => {
    set({ cartItems: [] });
    
    try {
      await dataPersistenceService.saveCartItems([]);
    } catch (error) {
      console.warn('Failed to save cart items:', error);
    }
  },
  
  // User Profile
  userProfile: {
    name: 'Le Tan Nguyen Dat',
    dateOfBirth: '2005-02-10',
    phoneNumber: '12345',
    email: 'Endy@apcs',
    address: 'Tran Phu, Ho Chi Minh'
  },
  updateProfile: async (field, value) => {
    const state = get();
    const newProfile = { ...state.userProfile, [field]: value };
    set({ userProfile: newProfile });
    
    await safeStorageOperation(
      () => dataPersistenceService.saveUserProfile(newProfile),
      'save user profile'
    );
  },
  
  // Membership System
  stamps: 0,
  points: 0,
  pointHistory: [],
  addStamp: async () => {
    const state = get();
    const newStamps = (state.stamps + 1) % 8;
    const earnedFreeDrink = state.stamps === 7;
    
    const newPointHistory = earnedFreeDrink ? [...state.pointHistory, {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      description: 'Free drink earned with 8 stamps',
      points: 0,
      type: 'reward'
    }] : state.pointHistory;
    
    set({
      stamps: newStamps,
      pointHistory: newPointHistory
    });
    
    await Promise.all([
      dataPersistenceService.saveStamps(newStamps),
      dataPersistenceService.savePointHistory(newPointHistory)
    ]);
  },
  addPoints: async (amount, description) => {
    const state = get();
    const newPoints = state.points + amount;
    const newPointHistory = [
      ...state.pointHistory,
      {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        description,
        points: amount,
        type: 'earned'
      }
    ];
    
    set({
      points: newPoints,
      pointHistory: newPointHistory
    });
    
    await Promise.all([
      dataPersistenceService.savePoints(newPoints),
      dataPersistenceService.savePointHistory(newPointHistory)
    ]);
  },
  
  redeemPoints: async (amount, description) => {
    const state = get();
    const newPoints = Math.max(0, state.points - amount);
    const newPointHistory = [
      ...state.pointHistory,
      {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        description,
        points: -amount,
        type: 'redeemed'
      }
    ];
    
    set({
      points: newPoints,
      pointHistory: newPointHistory
    });
    
    await Promise.all([
      dataPersistenceService.savePoints(newPoints),
      dataPersistenceService.savePointHistory(newPointHistory)
    ]);
  },
  
  // Orders Management
  currentOrders: [],
  orderHistory: [],
  placeOrder: async (items) => {
    const orderId = Date.now().toString();
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const pointsEarned = Math.floor(totalAmount * 5); // 1$ = 5 points
    const totalCups = items.reduce((sum, item) => sum + item.quantity, 0); // Calculate total cups
    
    const state = get();
    const newOrder = {
      id: orderId,
      items: items,
      totalAmount,
      pointsEarned, // Store for later when order is completed
      totalCups, // Store for later when order is completed
      status: 'in-process',
      orderDate: new Date().toISOString(),
      estimatedTime: '15-20 mins'
    };
    
    const newCurrentOrders = [...state.currentOrders, newOrder];
    
    set({
      currentOrders: newCurrentOrders,
      cartItems: []
    });
    
    await Promise.all([
      dataPersistenceService.saveCurrentOrders(newCurrentOrders),
      dataPersistenceService.saveCartItems([])
    ]);
    
    return orderId;
  },
  
  completeOrder: async (orderId) => {
    const state = get();
    const order = state.currentOrders.find(o => o.id === orderId);
    if (!order) return;
    
    // Calculate new stamps, considering the 8-stamp reset cycle
    const newStamps = (state.stamps + order.totalCups) % 8;
    const earnedFreeDrink = (state.stamps + order.totalCups) >= 8;
    const newPoints = state.points + order.pointsEarned;
    
    const completedOrder = { ...order, status: 'completed', completedDate: new Date().toISOString() };
    const newCurrentOrders = state.currentOrders.filter(o => o.id !== orderId);
    const newOrderHistory = [...state.orderHistory, completedOrder];
    
    const newPointHistory = [
      ...state.pointHistory,
      {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        description: `Order #${orderId.slice(-4)} completed - ${order.totalCups} drinks`,
        points: order.pointsEarned,
        type: 'earned'
      },
      ...(earnedFreeDrink ? [{
        id: (Date.now() + 1).toString(),
        date: new Date().toISOString(),
        description: 'Free drink earned with 8 stamps!',
        points: 0,
        type: 'reward'
      }] : [])
    ];
    
    set({
      currentOrders: newCurrentOrders,
      orderHistory: newOrderHistory,
      stamps: newStamps,
      points: newPoints,
      pointHistory: newPointHistory
    });
    
    await Promise.all([
      dataPersistenceService.saveCurrentOrders(newCurrentOrders),
      dataPersistenceService.saveOrderHistory(newOrderHistory),
      dataPersistenceService.saveStamps(newStamps),
      dataPersistenceService.savePoints(newPoints),
      dataPersistenceService.savePointHistory(newPointHistory)
    ]);
  },
  cancelOrder: async (orderId) => {
    const state = get();
    const order = state.currentOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const cancelledOrder = { ...order, status: 'cancelled', cancelledDate: new Date().toISOString() };
    const newCurrentOrders = state.currentOrders.filter(o => o.id !== orderId);
    const newOrderHistory = [...state.orderHistory, cancelledOrder];
    
    set({
      currentOrders: newCurrentOrders,
      orderHistory: newOrderHistory
    });
    
    await Promise.all([
      dataPersistenceService.saveCurrentOrders(newCurrentOrders),
      dataPersistenceService.saveOrderHistory(newOrderHistory)
    ]);
  },

  // Data persistence and initialization methods
  initializeApp: async () => {
    try {
      set({ isLoading: true });
      
      console.log('🚀 Initializing Code Cup app...');
      
      // Check if app needs initial data seeding (non-blocking)
      safeStorageOperation(
        () => dataPersistenceService.seedInitialData(),
        'seed initial data'
      );
      
      // Handle data migration for app updates (non-blocking)
      safeStorageOperation(
        () => dataPersistenceService.handleDataMigration('1.0.0'),
        'handle data migration'
      );
      
      // Load saved app state
      const loadResult = await safeStorageOperation(
        () => dataPersistenceService.loadAppState(),
        'load app state'
      );
      
      if (loadResult.success && loadResult.result) {
        set({
          ...loadResult.result,
          isLoading: false,
          isInitialized: true
        });
        console.log('✅ App state loaded successfully');
      } else {
        // Use default state if loading fails
        set({ 
          isLoading: false, 
          isInitialized: true 
        });
        console.log('📝 Using default app state (storage fallback)');
      }
    } catch (error) {
      console.error('❌ Error initializing app:', error);
      // Always set initialized to true so app can function
      set({ 
        isLoading: false, 
        isInitialized: true 
      });
    }
  },

  // Save current app state
  saveAppState: async () => {
    const state = get();
    const operations = [
      { name: 'userProfile', operation: () => dataPersistenceService.saveUserProfile(state.userProfile) },
      { name: 'cartItems', operation: () => dataPersistenceService.saveCartItems(state.cartItems) },
      { name: 'stamps', operation: () => dataPersistenceService.saveStamps(state.stamps) },
      { name: 'points', operation: () => dataPersistenceService.savePoints(state.points) },
      { name: 'pointHistory', operation: () => dataPersistenceService.savePointHistory(state.pointHistory) },
      { name: 'currentOrders', operation: () => dataPersistenceService.saveCurrentOrders(state.currentOrders) },
      { name: 'orderHistory', operation: () => dataPersistenceService.saveOrderHistory(state.orderHistory) },
    ];

    const result = await safeBatchStorageOperation(operations);
    
    if (result.allSuccess) {
      console.log('All app state saved successfully');
    } else if (result.partialSuccess) {
      console.warn(`Partial save success: ${result.successCount}/${result.totalOperations} items saved`);
    } else {
      console.error('Failed to save app state');
    }
    
    return result.partialSuccess; // Return true if at least some data was saved
  },

  // Clear all data (for logout/reset)
  clearAllData: async () => {
    await dataPersistenceService.clearAllData();
    
    // Reset to default state
    set({
      cartItems: [],
      userProfile: {
        name: 'Le Tan Nguyen Dat',
        dateOfBirth: '2005-02-10',
        phoneNumber: '12345',
        email: 'Endy@apcs',
        address: 'Tran Phu, Ho Chi Minh'
      },
      stamps: 0,
      points: 0,
      pointHistory: [],
      currentOrders: [],
      orderHistory: [],
      isInitialized: false
    });
  },

  // Export user data for backup
  exportUserData: async () => {
    return await dataPersistenceService.exportUserData();
  },

  // Import user data from backup
  importUserData: async (importDataString) => {
    const success = await dataPersistenceService.importUserData(importDataString);
    if (success) {
      // Reload app state after import
      const savedState = await dataPersistenceService.loadAppState();
      if (savedState) {
        set(savedState);
      }
    }
    return success;
  },
}));
