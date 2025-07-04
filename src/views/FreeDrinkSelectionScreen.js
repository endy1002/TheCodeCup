import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Alert, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../viewmodels/useCartViewModel';
import { useTheme } from '../contexts/ThemeContext';
import { COFFEE_DATA } from '../models/Coffee';

export default function FreeDrinkSelectionScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { 
    addFreeDrinkToCart, 
    cancelFreeDrinkSelection,
    pendingFreeDrinks,
    isSelectingFreeDrink,
    isFavorite,
    toggleFavorite
  } = useAppStore();

  const handleSelectFreeDrink = async (coffee) => {
    const success = await addFreeDrinkToCart(coffee);
    if (success) {
      Alert.alert(
        'Free Drink Added!',
        `Your free ${coffee.name} (Small) has been added to your cart.`,
        [
          {
            text: 'Continue Shopping',
            onPress: () => navigation.navigate('Home')
          },
          {
            text: 'View Cart',
            onPress: () => navigation.navigate('Cart')
          }
        ]
      );
    } else {
      Alert.alert('Error', 'Unable to add free drink to cart.');
    }
  };

  const handleCancel = () => {
    cancelFreeDrinkSelection();
    navigation.goBack();
  };

  if (!isSelectingFreeDrink || pendingFreeDrinks <= 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No free drinks available</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.background} />
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={[styles.cancelButtonText, { color: theme.error }]}>✕ Cancel</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Select Your Free Drink</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Size: Small Only | Quantity: 1</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={[styles.rewardBanner, { backgroundColor: theme.freeBackground }]}>
        <Text style={[styles.rewardText, { color: theme.freeText }]}>🎉 Congratulations!</Text>
        <Text style={[styles.rewardSubtext, { color: theme.freeText }]}>You have {pendingFreeDrinks} free drink{pendingFreeDrinks > 1 ? 's' : ''} to redeem</Text>
      </View>

      <ScrollView style={[styles.menuContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose Your Free Drink</Text>
        <View style={styles.coffeeGrid}>
          {COFFEE_DATA.map((coffee) => (
            <TouchableOpacity
              key={coffee.id}
              style={[styles.coffeeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => handleSelectFreeDrink(coffee)}
            >
              <TouchableOpacity 
                style={styles.favoriteButton}
                onPress={() => toggleFavorite(coffee)}
              >
                <Text style={[styles.favoriteIcon, { color: isFavorite(coffee.id) ? '#FFD700' : theme.textMuted }]}>
                  {isFavorite(coffee.id) ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
              <Image source={coffee.image} style={styles.coffeeImage} />
              <View style={styles.coffeeInfo}>
                <Text style={[styles.coffeeName, { color: theme.text }]}>{coffee.name}</Text>
                <Text style={[styles.coffeeDescription, { color: theme.textSecondary }]}>{coffee.description}</Text>
                <View style={styles.priceContainer}>
                  <Text style={[styles.originalPrice, { color: theme.textMuted }]}>${coffee.price.toFixed(2)}</Text>
                  <Text style={[styles.freePrice, { color: theme.freeText }]}>FREE</Text>
                </View>
                <Text style={[styles.sizeInfo, { color: theme.textMuted }]}>Small Size Only</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButton: {
    flex: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  rewardBanner: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  rewardSubtext: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  coffeeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  coffeeCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  coffeeImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  coffeeInfo: {
    alignItems: 'center',
  },
  coffeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  coffeeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  freePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  sizeInfo: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#6B4E3D',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 18,
  },
});
