// Utility to detect iOS Simulator and provide helpful messages
import { Platform } from 'react-native';

export const PlatformUtils = {
  // Check if running on iOS Simulator
  isIOSSimulator() {
    return Platform.OS === 'ios' && __DEV__;
  },

  // Check if running on Android Emulator
  isAndroidEmulator() {
    return Platform.OS === 'android' && __DEV__;
  },

  // Get platform-specific storage message
  getStorageMessage(storageType) {
    const messages = {
      AsyncStorage: {
        ios: '💾 Persistent storage active - data will be saved',
        android: '💾 Persistent storage active - data will be saved',
        default: '💾 Persistent storage active'
      },
      MemoryStorage: {
        ios: '📱 iOS Simulator mode - data resets on app restart (normal behavior)',
        android: '📝 Memory storage mode - data resets on app restart',
        default: '📝 Memory storage fallback - data resets on app restart'
      }
    };

    const platformMessages = messages[storageType] || messages.MemoryStorage;
    return platformMessages[Platform.OS] || platformMessages.default;
  },

  // Get platform-specific error context
  getErrorContext() {
    if (this.isIOSSimulator()) {
      return {
        platform: 'iOS Simulator',
        expected: true,
        message: 'AsyncStorage limitations in iOS Simulator are normal',
        recommendation: 'Test on real device for persistent storage'
      };
    } else if (this.isAndroidEmulator()) {
      return {
        platform: 'Android Emulator',
        expected: false,
        message: 'AsyncStorage should work in Android Emulator',
        recommendation: 'Check emulator storage permissions'
      };
    } else {
      return {
        platform: 'Real Device',
        expected: false,
        message: 'AsyncStorage failure on real device needs investigation',
        recommendation: 'Check device storage space and permissions'
      };
    }
  },

  // Should we reduce logging based on platform?
  shouldReduceLogging() {
    return this.isIOSSimulator(); // Reduce iOS simulator spam
  }
};

export default PlatformUtils;
