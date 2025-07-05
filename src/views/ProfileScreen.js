import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Alert, Modal, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../viewmodels/useCartViewModel';
import { useTheme } from '../contexts/ThemeContext';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { 
    userProfile, 
    updateProfile,
    clearAllData
  } = useAppStore();
  
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleEditProfile = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSaveProfile = () => {
    updateProfile(editingField, editValue);
    setEditingField(null);
    setEditValue('');
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleSwitchUser = () => {
    Alert.alert(
      'Switch User',
      'This will clear all current user data including cart, orders, points, and stamps. Are you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch User',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert(
                'Success', 
                'All data cleared! You can now set up a new user profile.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Reset navigation to Home screen
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Home' }],
                      });
                    }
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to switch user: ' + error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.background} />
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { color: theme.primary }]}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        </View>
        <View style={styles.headerRight}>
        </View>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: theme.background }]}>
        {/* Theme Toggle Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
          <View style={styles.profileRow}>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileLabel, { color: theme.text }]}>Dark Mode</Text>
              <Text style={[styles.profileValue, { color: theme.textSecondary }]}>
                {isDarkMode ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.themeToggleButton, { backgroundColor: isDarkMode ? theme.accent : theme.border }]}
              onPress={toggleTheme}
            >
              <View style={[
                styles.themeToggleCircle, 
                { 
                  backgroundColor: theme.surface,
                  transform: [{ translateX: isDarkMode ? 20 : 0 }]
                }
              ]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Information Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Information</Text>
          {Object.entries(userProfile).map(([key, value]) => (
            <View key={key} style={styles.profileRow}>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileLabel, { color: theme.text }]}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <Text style={[styles.profileValue, { color: theme.textSecondary }]}>{value}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.editButton, { backgroundColor: theme.primary }]}
                onPress={() => handleEditProfile(key, value)}
              >
                <Text style={[styles.editButtonText, { color: theme.buttonText }]}>Edit</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        
        {/* User Management Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>User Management</Text>
          <TouchableOpacity 
            style={[styles.switchUserButton, { backgroundColor: theme.error }]}
            onPress={handleSwitchUser}
          >
            <Text style={[styles.switchUserButtonText, { color: theme.buttonText }]}>🔄 Switch User</Text>
            <Text style={[styles.switchUserSubtext, { color: '#FFE4E1' }]}>Clear all data and start fresh</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editingField !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Edit {editingField?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </Text>
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.inputBorder,
                color: theme.text 
              }]}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`Enter new ${editingField}`}
              placeholderTextColor={theme.textMuted}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelModalButton, { borderColor: theme.border }]}
                onPress={() => setEditingField(null)}
              >
                <Text style={[styles.cancelModalButtonText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveModalButton, { backgroundColor: theme.primary }]}
                onPress={handleSaveProfile}
              >
                <Text style={[styles.saveModalButtonText, { color: theme.buttonText }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 56, // Ensure consistent height across platforms
  },
  headerLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileInfo: {
    flex: 1,
  },
  profileLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Theme toggle styles
  themeToggleButton: {
    width: 50,
    height: 26,
    borderRadius: 13,
    padding: 3,
    justifyContent: 'center',
  },
  themeToggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelModalButton: {
    borderWidth: 1,
  },
  saveModalButton: {
    // backgroundColor will be set dynamically
  },
  cancelModalButtonText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  saveModalButtonText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  switchUserButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FF3D00',
  },
  switchUserButtonText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  switchUserSubtext: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },
});
