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
  // Free drink redemption state
  pendingFreeDrinks: 0, // Number of free drinks available to redeem
  isSelectingFreeDrink: false, // Whether user is currently selecting a free drink
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
    
    const newPendingFreeDrinks = earnedFreeDrink ? state.pendingFreeDrinks + 1 : state.pendingFreeDrinks;
    
    set({
      stamps: newStamps,
      pointHistory: newPointHistory,
      pendingFreeDrinks: newPendingFreeDrinks
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
    
    // Separate free drinks from paid items for reward calculation
    const paidItems = items.filter(item => !item.isFree);
    const freeItems = items.filter(item => item.isFree);
    
    // Calculate totals only from paid items
    const totalAmount = paidItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const pointsEarned = Math.floor(totalAmount * 5); // 1$ = 5 points, only from paid items
    const totalCups = paidItems.reduce((sum, item) => sum + item.quantity, 0); // Only count paid cups for stamps
    
    const state = get();
    const newOrder = {
      id: orderId,
      items: items, // Include all items (free and paid) in the order
      totalAmount, // But total amount is only from paid items
      pointsEarned, // Store for later when order is completed (only from paid items)
      totalCups, // Store for later when order is completed (only from paid items)
      paidItemsCount: paidItems.length,
      freeItemsCount: freeItems.length,
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
    
    // Calculate new stamps and points only from paid items (totalCups and pointsEarned already exclude free drinks)
    const newStamps = (state.stamps + order.totalCups) % 8;
    const earnedFreeDrink = (state.stamps + order.totalCups) >= 8;
    const newPoints = state.points + order.pointsEarned;
    const newPendingFreeDrinks = earnedFreeDrink ? state.pendingFreeDrinks + 1 : state.pendingFreeDrinks;
    
    const completedOrder = { ...order, status: 'completed', completedDate: new Date().toISOString() };
    const newCurrentOrders = state.currentOrders.filter(o => o.id !== orderId);
    const newOrderHistory = [...state.orderHistory, completedOrder];
    
    // Create point history entries only if there were paid items
    let newPointHistory = [...state.pointHistory];
    
    if (order.pointsEarned > 0) {
      newPointHistory.push({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        description: `Order #${orderId.slice(-4)} completed - ${order.totalCups} paid drinks`,
        points: order.pointsEarned,
        type: 'earned'
      });
    }
    
    if (earnedFreeDrink) {
      newPointHistory.push({
        id: (Date.now() + 1).toString(),
        date: new Date().toISOString(),
        description: 'Free drink earned with 8 stamps!',
        points: 0,
        type: 'reward'
      });
    }
    
    // Create a summary message for the completion
    const paidCount = order.paidItemsCount || 0;
    const freeCount = order.freeItemsCount || 0;
    let summaryMessage = '';
    
    if (paidCount > 0 && freeCount > 0) {
      summaryMessage = `Order completed: ${paidCount} paid drink${paidCount > 1 ? 's' : ''} + ${freeCount} free drink${freeCount > 1 ? 's' : ''}`;
    } else if (paidCount > 0) {
      summaryMessage = `Order completed: ${paidCount} paid drink${paidCount > 1 ? 's' : ''}`;
    } else {
      summaryMessage = `Order completed: ${freeCount} free drink${freeCount > 1 ? 's' : ''} (no rewards earned)`;
    }
    
    set({
      currentOrders: newCurrentOrders,
      orderHistory: newOrderHistory,
      stamps: newStamps,
      points: newPoints,
      pointHistory: newPointHistory,
      pendingFreeDrinks: newPendingFreeDrinks
    });
    
    console.log(summaryMessage);
    if (order.pointsEarned > 0) {
      console.log(`💰 Earned ${order.pointsEarned} points from paid items`);
    }
    if (order.totalCups > 0) {
      console.log(`☕ Earned ${order.totalCups} stamps from paid items`);
    }
    if (earnedFreeDrink) {
      console.log('🎉 Earned a free drink with 8 stamps!');
    }
    
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

  // Free Drink Redemption Functions
  startFreeDrinkSelection: () => {
    const state = get();
    if (state.pendingFreeDrinks > 0) {
      set({ isSelectingFreeDrink: true });
      return true;
    }
    return false;
  },
  
  cancelFreeDrinkSelection: () => {
    set({ isSelectingFreeDrink: false });
  },
  
  addFreeDrinkToCart: async (coffee) => {
    const state = get();
    if (!state.isSelectingFreeDrink || state.pendingFreeDrinks <= 0) {
      return false;
    }
    
    // Create free drink item with fixed small size and quantity 1
    const freeDrinkItem = {
      ...coffee,
      size: { name: 'Small', multiplier: 1 }, // Fixed small size
      sweetness: { name: 'Regular', value: 'regular' },
      ice: { name: 'Regular Ice', value: 'regular' },
      quantity: 1, // Fixed quantity
      totalPrice: 0, // Free!
      originalPrice: coffee.price,
      customization: 'Small, Regular, Regular Ice',
      isFree: true,
      redemptionType: 'free_drink',
      id: Date.now().toString()
    };
    
    const newCartItems = [...state.cartItems, freeDrinkItem];
    const newPendingFreeDrinks = state.pendingFreeDrinks - 1;
    
    set({ 
      cartItems: newCartItems,
      pendingFreeDrinks: newPendingFreeDrinks,
      isSelectingFreeDrink: false
    });
    
    // Save to storage
    try {
      await dataPersistenceService.saveCartItems(newCartItems);
    } catch (error) {
      console.warn('Failed to save cart items:', error);
    }
    
    return true;
  },
  
  redeemPointsForFreeDrink: async () => {
    const state = get();
    if (state.points < 100) {
      return false;
    }
    
    // Deduct points and add a pending free drink
    const newPoints = state.points - 100;
    const newPendingFreeDrinks = state.pendingFreeDrinks + 1;
    const newPointHistory = [
      ...state.pointHistory,
      {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        description: 'Free drink redeemed with 100 points',
        points: -100,
        type: 'redeemed'
      }
    ];
    
    set({
      points: newPoints,
      pendingFreeDrinks: newPendingFreeDrinks,
      pointHistory: newPointHistory,
      isSelectingFreeDrink: true
    });
    
    await Promise.all([
      dataPersistenceService.savePoints(newPoints),
      dataPersistenceService.savePointHistory(newPointHistory)
    ]);
    
    return true;
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
      pendingFreeDrinks: 0,
      isSelectingFreeDrink: false,
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
