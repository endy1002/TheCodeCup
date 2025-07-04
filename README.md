# The Code Cup ☕

A modern React Native coffee shop mobile application with comprehensive ordering, membership, and rewards system.

## 📱 Features

### Core Functionality
- **Multi-screen Navigation**: Seamless navigation between different sections
- **Coffee Menu**: Browse through various coffee drinks with detailed descriptions
- **Order Management**: Add items to cart, customize drinks, and place orders
- **Real-time Order Tracking**: Track order status from placement to completion

### Membership & Rewards
- **Stamp System**: Earn 1 stamp per drink ordered (8 stamps = 1 free drink)
- **Points System**: Earn 5 points per $1 spent, redeem for rewards
- **Points History**: Track all point transactions and rewards earned
- **Smart Reward Logic**: Stamps and points only awarded when orders are completed

### User Experience
- **Profile Management**: Edit personal information (name, phone, email, address)
- **Order History**: View past orders with detailed information
- **Customization Options**: Size, sweetness level, and ice preferences for drinks
- **Cart Management**: Add, remove, and modify items before ordering

## 🏗️ Architecture

### State Management
- **Zustand**: Lightweight state management for cart, orders, and user data
- **Persistent Storage**: User profile and order history maintained across sessions

### Navigation
- **React Navigation**: Stack navigator for smooth screen transitions
- **Deep Linking**: Support for navigation from order success to specific tabs

### UI/UX Design
- **Modern Interface**: Clean, coffee-themed design with brown color palette
- **Responsive Layout**: Optimized for mobile devices
- **Interactive Elements**: Touch-friendly buttons and smooth animations

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CoffeeCard.js   # Individual coffee item display
│   └── Header.js       # App header with navigation
├── models/             # Data models and constants
│   └── Coffee.js       # Coffee data and configuration
├── navigation/         # Navigation configuration
│   └── AppNavigator.js # Stack navigator setup
├── viewmodels/         # State management
│   └── useCartViewModel.js # Zustand store for app state
└── views/              # Screen components
    ├── CartScreen.js   # Shopping cart and checkout
    ├── DetailsScreen.js # Coffee customization
    ├── HomeScreen.js   # Main app interface
    ├── OrderSuccessScreen.js # Order confirmation
    └── ProfileScreen.js # User profile management
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

### State Management
- **Zustand**: Modern state management solution

### Development Tools
- **JavaScript (ES6+)**: Primary programming language
- **JSON**: Data storage and configuration

## 📱 Screenshots

### Main Features
- **Home Screen**: Coffee menu with bottom tab navigation
- **Order Process**: Drink customization and cart management
- **Membership**: Stamps and points tracking system
- **Profile**: User information management

## 🎯 Business Logic

### Order Flow
1. **Browse Menu**: Select coffee from categorized list
2. **Customize**: Choose size, sweetness, and ice level
3. **Add to Cart**: Specify quantity and add to cart
4. **Checkout**: Review order and place it
5. **Track Order**: Monitor order status and estimated time
6. **Complete**: Mark as received to earn rewards

### Reward System
- **Stamps**: 1 stamp per drink (not per order)
- **Points**: 5 points per $1 spent
- **Free Drinks**: Every 8 stamps earns a free drink
- **Point Redemption**: 100 points = 1 free small coffee

### Order States
- **In Process**: Order placed, awaiting completion
- **Completed**: Order received, rewards awarded
- **Cancelled**: Order cancelled, no rewards given

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

## 📝 Code Quality

### Best Practices
- **Component Separation**: Reusable components for maintainability
- **State Management**: Centralized state with Zustand
- **Error Handling**: Proper error boundaries and user feedback
- **Performance**: Optimized rendering and navigation

### Features Implemented
- ✅ Multi-screen application
- ✅ State management with Zustand
- ✅ User input validation and event handling
- ✅ Business logic implementation
- ✅ Local data storage simulation
- ✅ Clean, readable code structure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


