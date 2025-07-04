# The Code Cup ☕

A modern React Native coffee shop mobile application with comprehensive ordering, membership, rewards system, and robust data persistence.

## 📱 Features

### Core Functionality
- **Multi-screen Navigation**: Seamless navigation between different sections
- **Coffee Menu**: Browse through various coffee drinks with detailed descriptions
- **Order Management**: Add items to cart, customize drinks, and place orders
- **Real-time Order Tracking**: Track order status from placement to completion
- **Data Persistence**: Complete state preservation across app sessions

### Membership & Rewards
- **Stamp System**: Earn 1 stamp per drink ordered (8 stamps = 1 free drink)
- **Points System**: Earn 5 points per $1 spent, redeem for rewards
- **Points History**: Track all point transactions and rewards earned
- **Smart Reward Logic**: Stamps and points only awarded when orders are completed

### User Experience
- **Profile Management**: Edit personal information with automatic saving
- **Order History**: View past orders with detailed information
- **Customization Options**: Size, sweetness level, and ice preferences for drinks
- **Cart Management**: Add, remove, and modify items before ordering
- **Data Backup/Restore**: Export and import user data for backup purposes

### Data Persistence Features 💾
- **Automatic State Saving**: All user actions are automatically saved
- **Background Sync**: Data saves automatically every 30 seconds and when app goes to background
- **Robust Storage**: Intelligent fallback from AsyncStorage to memory storage
- **Cross-Session Persistence**: Cart items, profile, and progress maintained between app launches
- **Data Export/Import**: Complete backup and restore functionality
- **Storage Status Indicator**: Visual feedback on storage method being used

## 🏗️ Architecture

### State Management
- **Zustand**: Lightweight state management for cart, orders, and user data
- **Persistent Storage**: Complete app state maintained across sessions with fallback support
- **Memory Storage Fallback**: Graceful degradation when persistent storage is unavailable

### Data Persistence System
- **Primary Storage**: AsyncStorage for device-persistent data
- **Fallback Storage**: In-memory storage for development and error scenarios
- **Automatic Migration**: Data migration handling for app updates
- **Error Recovery**: Graceful handling of storage failures

### Navigation
- **React Navigation**: Stack navigator for smooth screen transitions
- **Deep Linking**: Support for navigation from order success to specific tabs

### UI/UX Design
- **Modern Interface**: Clean, coffee-themed design with brown color palette
- **Responsive Layout**: Optimized for mobile devices
- **Interactive Elements**: Touch-friendly buttons and smooth animations
- **Storage Feedback**: Real-time storage status indicators

## 📂 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── AppInitializer.js   # App initialization and loading
│   ├── CoffeeCard.js       # Individual coffee item display
│   ├── Header.js           # App header with navigation
│   └── StorageStatusIndicator.js # Storage method indicator
├── hooks/                  # Custom React hooks
│   └── useDataPersistence.js # Background data persistence logic
├── models/                 # Data models and constants
│   └── Coffee.js           # Coffee data and configuration
├── navigation/             # Navigation configuration
│   └── AppNavigator.js     # Stack navigator setup
├── services/               # Data and business logic services
│   ├── DataPersistenceService.js # Main persistence service
│   ├── MemoryStorage.js    # Memory storage implementation
│   └── RobustStorageService.js   # Intelligent storage wrapper
├── utils/                  # Utility functions
│   └── storageUtils.js     # Storage operation helpers
├── viewmodels/             # State management
│   └── useCartViewModel.js # Enhanced Zustand store with persistence
└── views/                  # Screen components
    ├── CartScreen.js       # Shopping cart and checkout
    ├── DetailsScreen.js    # Coffee customization
    ├── HomeScreen.js       # Main app interface
    ├── OrderSuccessScreen.js # Order confirmation
    ├── ProfileScreen.js    # User profile management
    └── SettingsScreen.js   # Data management and settings
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Expo CLI
- React Native development environment

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TheCodeCup.git
   cd TheCodeCup
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Install Expo Go app on your mobile device
   - Scan the QR code displayed in terminal
   - Or press `i` for iOS simulator, `a` for Android emulator

## 🛠️ Technologies Used

### Frontend Framework
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and toolchain

### Navigation & UI
- **React Navigation**: Navigation library for React Native
- **React Native Elements**: UI component library

### State Management & Persistence
- **Zustand**: Modern state management solution
- **AsyncStorage**: React Native persistent storage (v1.21.0)
- **Custom Memory Storage**: Fallback storage solution

### Development Tools
- **JavaScript (ES6+)**: Primary programming language
- **JSON**: Data storage and configuration

## 💾 Data Persistence & Initialization

### Storage Strategy
The app implements a comprehensive data persistence strategy that ensures user data is preserved across app sessions:

#### **Robust Storage System**
- **Primary**: AsyncStorage for persistent device storage
- **Fallback**: In-memory storage for development/simulator issues
- **Safe Operations**: Non-blocking storage with graceful error handling

#### **Complete State Persistence**
- User profile information
- Cart items between sessions
- Points, stamps, and loyalty data
- Order history and current orders
- App preferences and settings

#### **Automatic Background Sync**
- Auto-save every 30 seconds when app is active
- Immediate save when app goes to background
- Force save for critical operations (like placing orders)

#### **User Data Management**
- Settings screen with export/import functionality
- Data backup and restore capabilities
- Clear all data option
- Data summary display

### Data Structure

#### **Persisted Data Types**

1. **User Profile**
   ```javascript
   {
     name: string,
     dateOfBirth: string,
     phoneNumber: string,
     email: string,
     address: string
   }
   ```

2. **Cart Items**
   ```javascript
   [
     {
       id: string,
       name: string,
       price: number,
       quantity: number,
       totalPrice: number,
       // ... other coffee item properties
     }
   ]
   ```

3. **Points & Stamps**
   ```javascript
   {
     points: number,
     stamps: number,
     pointHistory: [
       {
         id: string,
         date: string,
         description: string,
         points: number,
         type: 'earned' | 'redeemed' | 'reward'
       }
     ]
   }
   ```

4. **Orders**
   ```javascript
   {
     currentOrders: [...],
     orderHistory: [
       {
         id: string,
         items: [...],
         totalAmount: number,
         status: 'in-process' | 'completed' | 'cancelled',
         orderDate: string,
         completedDate?: string,
         cancelledDate?: string
       }
     ]
   }
   ```

### Storage Implementation Details

#### **Storage Keys**
All data is stored with prefixed keys to avoid conflicts:
- `@CodeCup:userProfile`
- `@CodeCup:cartItems`
- `@CodeCup:stamps`
- `@CodeCup:points`
- `@CodeCup:pointHistory`
- `@CodeCup:currentOrders`
- `@CodeCup:orderHistory`
- `@CodeCup:appInitialized`
- `@CodeCup:lastAppVersion`
- `@CodeCup:userPreferences`

#### **Error Handling**
- All storage operations include try-catch blocks
- Graceful fallback to default values on read errors
- Console logging for debugging (dev mode only)
- User-friendly error messages in UI

#### **Performance Optimization**
- Batch operations using Promise.all() where possible
- Auto-save throttling (30-second intervals)
- Background saves on app state changes
- Minimal storage calls during normal operation

### Data Management Features

#### **Settings Screen**
Access via Profile → ⚙️ button for:
- **Data Export**: Create backup of all user data
- **Data Import**: Restore from previously exported data
- **Manual Save**: Force save current state
- **Clear Data**: Reset app to initial state
- **Storage Status**: View current storage method and statistics

#### **Storage Status Indicator**
Visual indicator showing:
- 💾 **Persistent Storage**: AsyncStorage is working (production)
- 📝 **Memory Storage**: Fallback mode (development/simulator)

## 📱 Screenshots

### Main Features
- **Home Screen**: Coffee menu with bottom tab navigation
- **Order Process**: Drink customization and cart management
- **Membership**: Stamps and points tracking system
- **Profile**: User information management
- **Settings**: Data management and storage options

## 🎯 Business Logic

### Order Flow
1. **Browse Menu**: Select coffee from categorized list
2. **Customize**: Choose size, sweetness, and ice level
3. **Add to Cart**: Specify quantity and add to cart (auto-saved)
4. **Checkout**: Review order and place it (auto-saved)
5. **Track Order**: Monitor order status and estimated time
6. **Complete**: Mark as received to earn rewards (auto-saved)

### Reward System
- **Stamps**: 1 stamp per drink (not per order)
- **Points**: 5 points per $1 spent
- **Free Drinks**: Every 8 stamps earns a free drink
- **Point Redemption**: 100 points = 1 free small coffee

### Order States
- **In Process**: Order placed, awaiting completion
- **Completed**: Order received, rewards awarded
- **Cancelled**: Order cancelled, no rewards given

### Data Persistence Behavior
- **Development/Simulator**: Uses memory storage (data lost on app restart)
- **Production/Real Device**: Uses AsyncStorage (data persists between sessions)
- **Automatic Fallback**: Seamlessly switches storage methods if needed

## 🔧 Configuration

### Coffee Menu
Edit `src/models/Coffee.js` to modify:
- Coffee items and prices
- Size multipliers
- Sweetness and ice options

### Rewards Settings
Modify reward rates in `src/viewmodels/useCartViewModel.js`:
- Points per dollar ratio
- Stamps per drink
- Redemption thresholds

### Storage Settings
Configure persistence in `src/services/DataPersistenceService.js`:
- Auto-save intervals
- Storage keys
- Migration logic

## 🧪 Testing Data Persistence

### Manual Testing
1. Add items to cart
2. Update profile information
3. Place an order
4. Force close app
5. Reopen app
6. Verify all data is preserved

### Storage Testing
1. Go to Settings screen
2. Export data to create backup
3. Clear all data
4. Import the exported data
5. Verify all data is restored correctly

## 🚨 Troubleshooting

### Common Issues

1. **Data not persisting**
   - Check if using simulator (memory storage is normal)
   - Verify storage operations in Settings screen
   - Check console for storage status messages

2. **Storage errors in simulator**
   - Normal behavior - app uses memory storage fallback
   - Data will persist properly on real devices
   - Look for "📝 Using memory storage fallback" messages

3. **Performance issues**
   - Check auto-save frequency in console
   - Monitor storage operation timing
   - Disable debug logging for production

### Debug Mode
Storage status is visible in:
- Console logs (development mode)
- Settings screen storage status
- Visual storage indicator (development mode)

## 📝 Code Quality

### Best Practices
- **Component Separation**: Reusable components for maintainability
- **State Management**: Centralized state with Zustand and persistence
- **Error Handling**: Proper error boundaries and user feedback
- **Performance**: Optimized rendering, navigation, and storage operations
- **Data Integrity**: Robust storage with fallback mechanisms

### Features Implemented
- ✅ Multi-screen application
- ✅ State management with Zustand
- ✅ User input validation and event handling
- ✅ Business logic implementation
- ✅ Comprehensive data persistence system
- ✅ Automatic background data synchronization
- ✅ Storage fallback mechanisms
- ✅ Data export/import functionality
- ✅ Clean, readable code structure

## 🔮 Future Enhancements

### Planned Features
1. **Cloud Sync**: Integrate with Firebase for cross-device sync
2. **Data Compression**: Implement data compression for large datasets
3. **Encryption**: Add data encryption for sensitive information
4. **Offline Queue**: Queue operations when offline and sync when online
5. **Performance Monitoring**: Add metrics for storage operation timing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

