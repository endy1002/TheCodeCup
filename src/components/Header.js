import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function Header({ title, showProfile = false, onProfilePress, showCart = false, onCartPress, cartItemCount = 0 }) {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.header, { backgroundColor: theme.primary, borderBottomColor: theme.border }]}>
      <View style={styles.leftSection}>
      </View>
      
      <Text style={[styles.title, { color: theme.buttonText }]}>{title}</Text>
      
      <View style={styles.rightSection}>
        {showCart && (
          <TouchableOpacity style={styles.iconButton} onPress={onCartPress}>
            <Text style={styles.icon}>🛒</Text>
            {cartItemCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.accent }]}>
                <Text style={[styles.badgeText, { color: theme.buttonText }]}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        {showProfile && (
          <TouchableOpacity style={styles.iconButton} onPress={onProfilePress}>
            <Text style={styles.icon}>👤</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leftSection: {
    flex: 1,
  },
  logo: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  icon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
