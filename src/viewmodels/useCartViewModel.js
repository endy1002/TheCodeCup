import {create} from 'zustand';

export const useAppStore = create((set, get) => ({
  // Cart Management
  cartItems: [],
  addToCart: (item) =>
    set((state) => ({ cartItems: [...state.cartItems, { ...item, id: Date.now().toString() }] })),
  removeFromCart: (id) =>
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.id !== id),
    })),
  clearCart: () => set({ cartItems: [] }),
  
  // User Profile
  userProfile: {
    name: 'Le Tan Nguyen Dat',
    dateOfBirth: '2005-02-10',
    phoneNumber: '12345',
    email: 'Endy@apcs',
    address: 'Tran Phu, Ho Chi Minh'
  },
  updateProfile: (field, value) =>
    set((state) => ({
      userProfile: { ...state.userProfile, [field]: value }
    })),
  
  // Membership System
  stamps: 0,
  points: 0,
  pointHistory: [],
  addStamp: () =>
    set((state) => {
      const newStamps = (state.stamps + 1) % 8;
      const earnedFreeDrink = state.stamps === 7;
      return {
        stamps: newStamps,
        ...(earnedFreeDrink && { 
          pointHistory: [...state.pointHistory, {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            description: 'Free drink earned with 8 stamps',
            points: 0,
            type: 'reward'
          }]
        })
      };
    }),
  addPoints: (amount, description) =>
    set((state) => ({
      points: state.points + amount,
      pointHistory: [
        ...state.pointHistory,
        {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          description,
          points: amount,
          type: 'earned'
        }
      ]
    })),
  redeemPoints: (amount, description) =>
    set((state) => ({
      points: Math.max(0, state.points - amount),
      pointHistory: [
        ...state.pointHistory,
        {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          description,
          points: -amount,
          type: 'redeemed'
        }
      ]
    })),
  
  // Orders Management
  currentOrders: [],
  orderHistory: [],
  placeOrder: (items) => {
    const orderId = Date.now().toString();
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const pointsEarned = Math.floor(totalAmount * 5); // 1$ = 5 points
    
    set((state) => {
      const newOrder = {
        id: orderId,
        items: items,
        totalAmount,
        status: 'in-process',
        orderDate: new Date().toISOString(),
        estimatedTime: '15-20 mins'
      };
      
      return {
        currentOrders: [...state.currentOrders, newOrder],
        cartItems: [],
        stamps: (state.stamps + 1) % 8,
        points: state.points + pointsEarned,
        pointHistory: [
          ...state.pointHistory,
          {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            description: `Order #${orderId.slice(-4)} - ${items.length} items`,
            points: pointsEarned,
            type: 'earned'
          }
        ]
      };
    });
    
    return orderId;
  },
  
  completeOrder: (orderId) =>
    set((state) => {
      const order = state.currentOrders.find(o => o.id === orderId);
      if (!order) return state;
      return {
        currentOrders: state.currentOrders.filter(o => o.id !== orderId),
        orderHistory: [...state.orderHistory, { ...order, status: 'completed', completedDate: new Date().toISOString() }]
      };
    }),
    
  cancelOrder: (orderId) =>
    set((state) => {
      const order = state.currentOrders.find(o => o.id === orderId);
      if (!order) return state;
      
      return {
        currentOrders: state.currentOrders.filter(o => o.id !== orderId),
        orderHistory: [...state.orderHistory, { ...order, status: 'cancelled', cancelledDate: new Date().toISOString() }]
      };
    }),
}));
