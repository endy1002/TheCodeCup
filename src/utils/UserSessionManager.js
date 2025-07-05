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
                await clearAllDataFn();
                
                if (navigationFn) {
                  navigationFn();
                }
                
                resolve(true);
              } catch (error) {
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
      await clearAllDataFn();
      return true;
    } catch (error) {
      return false;
    }
  }

  static shouldPromptDataClear() {
    return false;
  }

  static logLoginEvent(userProfile) {
  }
}

export default UserSessionManager;
