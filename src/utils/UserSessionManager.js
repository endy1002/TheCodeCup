// User session management utility
import { Alert } from 'react-native';

class UserSessionManager {
  static async promptClearDataOnLogin(clearAllDataFn, navigationFn) {
    return new Promise((resolve) => {
      Alert.alert(
        'New User Session',
        'Would you like to clear all existing data for a fresh start? This is recommended when switching between different users.',
        [
          { 
            text: 'Keep Existing Data', 
            style: 'cancel',
            onPress: () => resolve(false)
          },
          {
            text: 'Clear Data',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('🗑️ Clearing data for new user session...');
                await clearAllDataFn();
                console.log('✅ Data cleared successfully for new session');
                
                if (navigationFn) {
                  navigationFn();
                }
                
                resolve(true);
              } catch (error) {
                console.error('❌ Failed to clear data:', error);
                Alert.alert('Error', 'Failed to clear data: ' + error.message);
                resolve(false);
              }
            },
          },
        ]
      );
    });
  }

  static async clearDataForNewUser(clearAllDataFn) {
    try {
      console.log('🔄 Automatically clearing data for new user...');
      await clearAllDataFn();
      console.log('✅ Data cleared successfully for new user');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear data for new user:', error);
      return false;
    }
  }

  static shouldPromptDataClear() {
    // This could be enhanced to detect various conditions:
    // - App hasn't been used for a long time
    // - Different device characteristics
    // - User preference settings
    // For now, we'll keep it simple and let the user decide
    return false;
  }

  static logLoginEvent(userProfile) {
    console.log('👤 User login/session started:', {
      user: userProfile?.name || 'Unknown',
      email: userProfile?.email || 'No email',
      timestamp: new Date().toISOString()
    });
  }
}

export default UserSessionManager;
