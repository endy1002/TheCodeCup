import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert, Image, StatusBar } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppStore } from '../viewmodels/useCartViewModel';
import { useTheme } from '../contexts/ThemeContext';
import { DRINK_SIZES, SWEETNESS_LEVELS, ICE_LEVELS } from '../models/Coffee';

export default function DetailsScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { addToCart, isFavorite, toggleFavorite } = useAppStore();
  
  const coffee = params?.coffee;
  
  const [selectedSize, setSelectedSize] = useState(DRINK_SIZES[0]);
  const [selectedSweetness, setSelectedSweetness] = useState(SWEETNESS_LEVELS[1]);
  const [selectedIce, setSelectedIce] = useState(ICE_LEVELS[2]);
  const [quantity, setQuantity] = useState(1);

  if (!coffee) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No coffee selected</Text>
      </SafeAreaView>
    );
  }

  const calculatePrice = () => {
    return (coffee.price * selectedSize.multiplier * quantity).toFixed(2);
  };

  const handleAddToCart = () => {
    const customizedCoffee = {
      ...coffee,
      size: selectedSize,
      sweetness: selectedSweetness,
      ice: selectedIce,
      quantity,
      totalPrice: parseFloat(calculatePrice()),
      customization: `${selectedSize.name}, ${selectedSweetness.name}, ${selectedIce.name}`
    };
    
    addToCart(customizedCoffee);
    Alert.alert(
      'Added to Cart!',
      `${quantity}x ${coffee.name} has been added to your cart.`,
      [
        {
          text: 'Continue Shopping',
          onPress: () => navigation.goBack()
        },
        {
          text: 'View Cart',
          onPress: () => navigation.navigate('Cart')
        }
      ]
    );
  };

  const OptionSelector = ({ title, options, selectedOption, onSelect, keyExtractor = 'id', labelExtractor = 'name' }) => (
    <View style={styles.optionSection}>
      <Text style={styles.optionTitle}>{title}</Text>
      <View style={styles.optionContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option[keyExtractor]}
            style={[
              styles.optionButton,
              selectedOption[keyExtractor] === option[keyExtractor] && styles.selectedOption
            ]}
            onPress={() => onSelect(option)}
          >
            <Text style={[
              styles.optionText,
              selectedOption[keyExtractor] === option[keyExtractor] && styles.selectedOptionText
            ]}>
              {option[labelExtractor]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.background} />
      <ScrollView style={[styles.scrollView, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { color: theme.primary }]}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(coffee)}
          >
            <Text style={[styles.favoriteIcon, { color: isFavorite(coffee.id) ? '#FFD700' : theme.textMuted }]}>
              {isFavorite(coffee.id) ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.coffeeInfo, { backgroundColor: theme.surface }]}>
          <View style={[styles.imageContainer, { backgroundColor: theme.inputBackground }]}>
            {coffee.image ? (
              <Image source={coffee.image} style={styles.coffeeImage} />
            ) : (
              <Text style={styles.coffeeEmoji}>☕</Text>
            )}
          </View>
          <Text style={[styles.coffeeName, { color: theme.text }]}>{coffee.name}</Text>
          <Text style={[styles.coffeeDescription, { color: theme.textSecondary }]}>{coffee.description}</Text>
          <Text style={[styles.coffeeCategory, { color: theme.textMuted }]}>{coffee.category}</Text>
          <Text style={[styles.basePrice, { color: theme.primary }]}>Base Price: ${coffee.price.toFixed(2)}</Text>
        </View>

        <OptionSelector
          title="Size"
          options={DRINK_SIZES}
          selectedOption={selectedSize}
          onSelect={setSelectedSize}
        />

        <OptionSelector
          title="Sweetness Level"
          options={SWEETNESS_LEVELS}
          selectedOption={selectedSweetness}
          onSelect={setSelectedSweetness}
        />

        <OptionSelector
          title="Ice Level"
          options={ICE_LEVELS}
          selectedOption={selectedIce}
          onSelect={setSelectedIce}
        />

        <View style={styles.quantitySection}>
          <Text style={styles.optionTitle}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Price:</Text>
          <Text style={styles.totalPrice}>${calculatePrice()}</Text>
        </View>
        
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Add to Cart - ${calculatePrice()}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  coffeeInfo: {
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  coffeeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coffeeEmoji: {
    fontSize: 60,
  },
  coffeeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  coffeeDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  coffeeCategory: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  basePrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f8f8',
  },
  selectedOption: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  quantitySection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 24,
    color: '#333',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  addToCartButton: {
    backgroundColor: '#8B4513',
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

