import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function CoffeeCard({ coffee, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(coffee)}>
      <View style={styles.imageContainer}>
        {coffee.image ? (
          <Image source={coffee.image} style={styles.coffeeImage} />
        ) : (
          <Text style={styles.imagePlaceholder}>☕</Text>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{coffee.name}</Text>
        <Text style={styles.description}>{coffee.description}</Text>
        <Text style={styles.category}>{coffee.category}</Text>
        <Text style={styles.price}>${coffee.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
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
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '600',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
});
