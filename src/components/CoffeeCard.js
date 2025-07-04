import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function CoffeeCard({ coffee, onPress }) {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.shadow }]} onPress={() => onPress(coffee)}>
      <View style={[styles.imageContainer, { backgroundColor: theme.inputBackground }]}>
        {coffee.image ? (
          <Image source={coffee.image} style={styles.coffeeImage} />
        ) : (
          <Text style={styles.imagePlaceholder}>☕</Text>
        )}
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, { color: theme.text }]}>{coffee.name}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>{coffee.description}</Text>
        <Text style={[styles.category, { color: theme.textMuted }]}>{coffee.category}</Text>
        <Text style={[styles.price, { color: theme.primary }]}>${coffee.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  coffeeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    fontSize: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
