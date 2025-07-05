import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Image, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../viewmodels/useCartViewModel';
import { useDataPersistence } from '../hooks/useDataPersistence';
import { useTheme } from '../contexts/ThemeContext';

export default function CartScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { cartItems, removeFromCart, placeOrder } = useAppStore();
  const { forceSave } = useDataPersistence();

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0).toFixed(2);
  };

  const calculateRewards = () => {
    const paidItems = cartItems.filter(item => !item.isFree);
    const freeItems = cartItems.filter(item => item.isFree);
    const totalPaidAmount = paidItems.reduce((total, item) => total + item.totalPrice, 0);
    const totalPaidCups = paidItems.reduce((total, item) => total + item.quantity, 0);
    const pointsToEarn = Math.floor(totalPaidAmount * 5);
    
    return {
      paidItems: paidItems.length,
      freeItems: freeItems.length,
      totalPaidAmount,
      totalPaidCups,
      pointsToEarn,
      stampsToEarn: totalPaidCups
    };
  };

  const handleRemoveItem = (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => removeFromCart(itemId) }
      ]
    );
  };

  const handleMakeOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before placing an order.');
      return;
    }

    Alert.alert(
      'Confirm Order',
      `Place order for ${cartItems.length} items?\nTotal: $${calculateTotal()}`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          onPress: async () => {
            const orderId = await placeOrder(cartItems);
            await forceSave(); // Force save after placing order
            navigation.navigate('OrderSuccess', { orderId });
          }
        }
      ]
    );
  };

  const renderCartItem = ({ item }) => (
    <View style={[styles.cartItem, item.isFree && styles.freeCartItem]}>
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={item.image} style={styles.coffeeImage} />
        ) : (
          <Text style={styles.imagePlaceholder}>☕</Text>
        )}
        {item.isFree && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>FREE</Text>
          </View>
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCustomization}>{item.customization}</Text>
        <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
        {item.isFree && (
          <Text style={styles.noRewardsText}>⚠️ No points/stamps earned</Text>
        )}
      </View>
      <View style={styles.itemActions}>
        <Text style={[styles.itemPrice, item.isFree && styles.freePriceText]}>
          {item.isFree ? 'FREE' : `$${item.totalPrice.toFixed(2)}`}
        </Text>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.id)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some delicious coffee to get started!</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={[styles.headerTitle, { color: theme.text }]}>Your Cart ({cartItems.length})</Text>
        </View>
        <View style={styles.headerRight}>
        </View>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContainer}
        style={{ backgroundColor: theme.background }}
      />

      {/* Rewards Summary */}
      {cartItems.length > 0 && (
        <View style={styles.rewardsSummary}>
          <Text style={styles.rewardsSummaryTitle}>Rewards for this order:</Text>
          {(() => {
            const rewards = calculateRewards();
            return (
              <View style={styles.rewardsDetails}>
                {rewards.paidItems > 0 ? (
                  <>
                    <Text style={styles.rewardsText}>
                      ☕ {rewards.stampsToEarn} stamp{rewards.stampsToEarn !== 1 ? 's' : ''} from {rewards.paidItems} paid item{rewards.paidItems !== 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.rewardsText}>
                      💰 {rewards.pointsToEarn} points from ${rewards.totalPaidAmount.toFixed(2)}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.noRewardsText}>
                    ⚠️ No rewards earned (only free items)
                  </Text>
                )}
                {rewards.freeItems > 0 && (
                  <Text style={styles.freeItemsNote}>
                    🎁 {rewards.freeItems} free item{rewards.freeItems !== 1 ? 's' : ''} (no rewards)
                  </Text>
                )}
              </View>
            );
          })()}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${calculateTotal()}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.orderButton}
          onPress={handleMakeOrder}
        >
          <Text style={styles.orderButtonText}>Make Order</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 56,
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
  listContainer: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  coffeeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemCustomization: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  orderButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Free drink styles
  freeCartItem: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: '#F1F8E9',
  },
  freeBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  freeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  noRewardsText: {
    fontSize: 11,
    color: '#FF6B4A',
    fontStyle: 'italic',
    marginTop: 2,
  },
  freePriceText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  // Rewards summary styles
  rewardsSummary: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2E8B57',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  rewardsSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  rewardsDetails: {
    marginLeft: 8,
  },
  rewardsText: {
    fontSize: 14,
    color: '#2E8B57',
    marginBottom: 4,
  },
  freeItemsNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
