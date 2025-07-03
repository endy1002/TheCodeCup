import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Header({ title, showProfile = false, onProfilePress, showCart = false, onCartPress, cartItemCount = 0 }) {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <Text style={styles.logo}>☕ The Code Cup</Text>
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.rightSection}>
        {showCart && (
          <TouchableOpacity style={styles.iconButton} onPress={onCartPress}>
            <Text style={styles.icon}>🛒</Text>
            {cartItemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItemCount}</Text>
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
    backgroundColor: '#8B4513',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  leftSection: {
    flex: 1,
  },
  logo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
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
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
