import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  TextInput,
  Modal,
} from 'react-native';
import { useAppStore } from '../viewmodels/useCartViewModel';

const SettingsScreen = ({ navigation }) => {
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [importData, setImportData] = useState('');
  const { 
    clearAllData, 
    exportUserData, 
    importUserData, 
    saveAppState,
    userProfile,
    points,
    stamps,
    orderHistory
  } = useAppStore();

  const handleExportData = async () => {
    try {
      const exportedData = await exportUserData();
      if (exportedData) {
        setIsExportModalVisible(true);
        // Also offer to share the data
        Share.share({
          message: 'Here is my Code Cup app data backup:\n\n' + exportedData,
          title: 'Code Cup Data Backup',
        });
      } else {
        Alert.alert('Error', 'Failed to export data');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data: ' + error.message);
    }
  };

  const handleImportData = async () => {
    if (!importData.trim()) {
      Alert.alert('Error', 'Please enter the import data');
      return;
    }

    try {
      const success = await importUserData(importData);
      if (success) {
        Alert.alert('Success', 'Data imported successfully!', [
          { text: 'OK', onPress: () => setIsImportModalVisible(false) }
        ]);
        setImportData('');
      } else {
        Alert.alert('Error', 'Failed to import data. Please check the format.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to import data: ' + error.message);
    }
  };

  const handleSaveData = async () => {
    try {
      const success = await saveAppState();
      if (success) {
        Alert.alert('Success', 'App data saved successfully!');
      } else {
        Alert.alert('Error', 'Failed to save app data');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save data: ' + error.message);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all app data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert('Success', 'All data cleared successfully!');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const getDataSummary = () => {
    return {
      totalOrders: orderHistory.length,
      totalPoints: points,
      stamps: stamps,
      userName: userProfile.name
    };
  };

  const dataSummary = getDataSummary();

  const handleClearDataForLogin = () => {
    Alert.alert(
      'Switch User Session',
      'This will clear all user data including cart, orders, points, stamps, and profile information. This is useful when switching to a different user account.\n\nAre you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear & Switch User',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert(
                'Session Cleared', 
                'All user data has been cleared. You can now set up a new user session.',
                [
                  {
                    text: 'Go to Profile',
                    onPress: () => {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Profile' }],
                      });
                    }
                  },
                  {
                    text: 'Go to Home',
                    onPress: () => {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Home' }],
                      });
                    }
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to clear user session: ' + error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Data & Settings</Text>
      
      {/* Data Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Data Summary</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>User: {dataSummary.userName}</Text>
          <Text style={styles.summaryText}>Total Orders: {dataSummary.totalOrders}</Text>
          <Text style={styles.summaryText}>Points: {dataSummary.totalPoints}</Text>
          <Text style={styles.summaryText}>Stamps: {dataSummary.stamps}/8</Text>
        </View>
      </View>

      {/* User Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Management</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={[styles.buttonText, styles.primaryText]}>👤 Manage User Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.warningButton]} 
          onPress={handleClearDataForLogin}
        >
          <Text style={[styles.buttonText, styles.warningText]}>🔄 Switch User / Clear Session</Text>
        </TouchableOpacity>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleSaveData}>
          <Text style={styles.buttonText}>💾 Save Current Data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleExportData}>
          <Text style={styles.buttonText}>📤 Export Data (Backup)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => setIsImportModalVisible(true)}>
          <Text style={styles.buttonText}>📥 Import Data (Restore)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearData}>
          <Text style={[styles.buttonText, styles.dangerText]}>🗑️ Clear All Data</Text>
        </TouchableOpacity>
      </View>

      {/* Data Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Data Persistence</Text>
        <Text style={styles.infoText}>
          Your app data is automatically saved locally on your device. This includes:
        </Text>
        <Text style={styles.bulletText}>• Your profile information</Text>
        <Text style={styles.bulletText}>• Order history and current orders</Text>
        <Text style={styles.bulletText}>• Points and stamps progress</Text>
        <Text style={styles.bulletText}>• Cart items (saved between sessions)</Text>
        <Text style={styles.infoText}>
          Use the export feature to create backups that you can restore later.
        </Text>
      </View>

      {/* Import Modal */}
      <Modal
        visible={isImportModalVisible}
        animationType="slide"
        onRequestClose={() => setIsImportModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Import Data</Text>
          <Text style={styles.modalText}>
            Paste your exported data below to restore your app state:
          </Text>
          
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={10}
            placeholder="Paste your exported data here..."
            value={importData}
            onChangeText={setImportData}
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={() => setIsImportModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={handleImportData}>
              <Text style={styles.buttonText}>Import</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 10,
  },
  summaryCard: {
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#8B4513',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: '#DC3545',
  },
  dangerText: {
    color: 'white',
  },
  cancelButton: {
    backgroundColor: '#6C757D',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  bulletText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    marginBottom: 5,
  },
  storageCard: {
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
  },
  storageText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  warningText: {
    fontSize: 12,
    color: '#FF6B35',
    fontStyle: 'italic',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5DC',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 40,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 15,
    fontSize: 14,
    textAlignVertical: 'top',
    flex: 1,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  recoveryButton: {
    backgroundColor: '#2196F3',
    marginTop: 10,
  },
  diagnosticsButton: {
    backgroundColor: '#9C27B0',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  warningButton: {
    backgroundColor: '#FFC107',
  },
  warningText: {
    color: '#8B4513',
  },
});

export default SettingsScreen;
