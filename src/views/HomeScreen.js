import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, Image, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppStore } from '../viewmodels/useCartViewModel';
import { useTheme } from '../contexts/ThemeContext';
import { COFFEE_DATA } from '../models/Coffee';
import CoffeeCard from '../components/CoffeeCard';
import Header from '../components/Header';

export default function HomeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { 
    cartItems,
    stamps, 
    points, 
    pointHistory,
    currentOrders,
    orderHistory,
    completeOrder,
    cancelOrder,
    redeemPoints,
    redeemPointsForFreeDrink,
    startFreeDrinkSelection,
    pendingFreeDrinks
  } = useAppStore();

  const [activeBottomTab, setActiveBottomTab] = useState('menu');

  // Handle navigation from OrderSuccessScreen
  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveBottomTab(route.params.initialTab);
    }
  }, [route.params]);

  const handleCoffeePress = (coffee) => {
    navigation.navigate('Details', { coffee });
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  const handleOrderAction = (orderId, action) => {
    const actionText = action === 'complete' ? 'mark as received' : 'cancel';
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${actionText} this order?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          onPress: () => {
            if (action === 'complete') {
              completeOrder(orderId);
            } else {
              cancelOrder(orderId);
            }
          }
        }
      ]
    );
  };

  const handleRedeemPoints = () => {
    if (points < 100) {
      Alert.alert('Insufficient Points', 'You need at least 100 points to redeem a reward.');
      return;
    }
    
    Alert.alert(
      'Redeem Points',
      'Redeem 100 points for a free small coffee?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Redeem', 
          onPress: async () => {
            const success = await redeemPointsForFreeDrink();
            if (success) {
              navigation.navigate('FreeDrinkSelection');
            } else {
              Alert.alert('Error', 'Failed to redeem points. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleRedeemFreeDrink = () => {
    if (pendingFreeDrinks > 0) {
      const success = startFreeDrinkSelection();
      if (success) {
        navigation.navigate('FreeDrinkSelection');
      }
    } else {
      Alert.alert('No Free Drinks', 'You don\'t have any free drinks available to redeem.');
    }
  };

  const renderMenuSection = () => (
    <View style={[styles.menuSection, { backgroundColor: theme.background }]}>
      <View style={[styles.welcomeTextBox, { backgroundColor: theme.surface }]}>
        <Text style={[styles.welcomeText, { color: theme.text }]}>Welcome to The Code Cup</Text>
      </View>
      
      <FlatList
        data={COFFEE_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CoffeeCard 
            coffee={item} 
            onPress={handleCoffeePress}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderMembershipSection = () => (
    <ScrollView style={[styles.section, { backgroundColor: theme.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Membership</Text>
      
      {/* Stamps Section */}
      <View style={[styles.membershipCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.membershipCardTitle, { color: theme.text }]}>Coffee Stamps</Text>
        <View style={styles.stampsContainer}>
          {Array.from({ length: 8 }, (_, index) => (
            <View key={index} style={[styles.stamp, { borderColor: theme.border }, index < stamps && { backgroundColor: theme.primary }]}>
              <Text style={[styles.stampText, { color: index < stamps ? theme.buttonText : theme.textMuted }]}>{index < stamps ? '☕' : '○'}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.stampsProgress, { color: theme.textSecondary }]}>{stamps}/8 stamps - {8 - stamps} more for a free drink!</Text>
      </View>

      {/* Points Section */}
      <View style={[styles.membershipCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.membershipCardTitle, { color: theme.text }]}>Loyalty Points</Text>
        <Text style={[styles.pointsDisplay, { color: theme.primary }]}>{points} points</Text>
        <View style={[styles.pointsBar, { backgroundColor: theme.border }]}>
          <View style={[styles.pointsProgress, { backgroundColor: theme.accent, width: `${Math.min(100, (points / 500) * 100)}%` }]} />
        </View>
        <Text style={[styles.pointsText, { color: theme.textSecondary }]}>Earn 5 points for every $1 spent</Text>
        
        {points >= 100 && (
          <TouchableOpacity style={[styles.redeemButton, { backgroundColor: theme.accent }]} onPress={handleRedeemPoints}>
            <Text style={[styles.redeemButtonText, { color: theme.buttonText }]}>Redeem 100 Points for Free Coffee</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Free Drinks Section */}
      {pendingFreeDrinks > 0 && (
        <View style={[styles.membershipCard, styles.freeDrinkCard, { backgroundColor: theme.freeBackground, borderColor: theme.freeBorder }]}>
          <Text style={[styles.membershipCardTitle, { color: theme.freeText }]}>🎉 Free Drinks Available!</Text>
          <Text style={[styles.freeDrinkCount, { color: theme.freeText }]}>
            You have {pendingFreeDrinks} free drink{pendingFreeDrinks > 1 ? 's' : ''} ready to redeem
          </Text>
          <TouchableOpacity style={[styles.redeemFreeDrinkButton, { backgroundColor: theme.freeBorder }]} onPress={handleRedeemFreeDrink}>
            <Text style={[styles.redeemFreeDrinkButtonText, { color: theme.buttonText }]}>Select Your Free Drink</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Points History */}
      <View style={styles.membershipCard}>
        <Text style={styles.membershipCardTitle}>Points History</Text>
        {pointHistory.length === 0 ? (
          <Text style={styles.emptyText}>No point history yet</Text>
        ) : (
          <View>
            {pointHistory.slice(-5).map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <View>
                  <Text style={styles.historyDescription}>{item.description}</Text>
                  <Text style={styles.historyDate}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <Text style={[styles.historyPoints, { color: item.points > 0 ? '#2E8B57' : '#ff4444' }]}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderOrdersSection = () => (
    <ScrollView style={styles.section}>
      <Text style={styles.sectionTitle}>Orders</Text>
      
      {/* Current Orders */}
      <View style={styles.orderCard}>
        <Text style={styles.orderCardTitle}>In Process ({currentOrders.length})</Text>
        {currentOrders.length === 0 ? (
          <Text style={styles.emptyText}>No orders in process</Text>
        ) : (
          currentOrders.map((order) => (
            <View key={order.id} style={styles.orderItem}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderNumber}>Order #{order.id.slice(-4)}</Text>
                <Text style={styles.orderDate}>{new Date(order.orderDate).toLocaleDateString()}</Text>
                <Text style={styles.orderItems}>{order.items.length} items - ${order.totalAmount.toFixed(2)}</Text>
                <Text style={styles.orderTime}>Est. {order.estimatedTime}</Text>
              </View>
              <View style={styles.orderActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.completeButton]}
                  onPress={() => handleOrderAction(order.id, 'complete')}
                >
                  <Text style={styles.actionButtonText}>Received</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => handleOrderAction(order.id, 'cancel')}
                >
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Order History */}
      <View style={styles.orderCard}>
        <Text style={styles.orderCardTitle}>History ({orderHistory.length})</Text>
        {orderHistory.length === 0 ? (
          <Text style={styles.emptyText}>No order history</Text>
        ) : (
          orderHistory.slice(-5).map((order) => (
            <View key={order.id} style={styles.orderItem}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderNumber}>Order #{order.id.slice(-4)}</Text>
                <Text style={styles.orderDate}>{new Date(order.orderDate).toLocaleDateString()}</Text>
                <Text style={styles.orderItems}>{order.items.length} items - ${order.totalAmount.toFixed(2)}</Text>
                <Text style={[styles.orderStatus, { color: order.status === 'completed' ? '#2E8B57' : '#ff4444' }]}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.background} />
      <Header 
        title="The Code Cup"
        showProfile={true}
        showCart={true}
        onProfilePress={handleProfilePress}
        onCartPress={handleCartPress}
        cartItemCount={cartItems.length}
      />
      
      <View style={[styles.content, { backgroundColor: theme.background }]}>
        {activeBottomTab === 'menu' && renderMenuSection()}
        {activeBottomTab === 'membership' && renderMembershipSection()}
        {activeBottomTab === 'orders' && renderOrdersSection()}

        <View style={[styles.bottomNavigation, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <TouchableOpacity 
            style={[styles.navButton, activeBottomTab === 'menu' && { backgroundColor: theme.primary }]}
            onPress={() => setActiveBottomTab('menu')}
          >
            <Text style={[styles.navTextIcon, { color: activeBottomTab === 'menu' ? theme.buttonText : theme.textSecondary }]}>☕</Text>
            <Text style={[styles.navLabel, { color: activeBottomTab === 'menu' ? theme.buttonText : theme.textSecondary }]}>Menu</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, activeBottomTab === 'membership' && { backgroundColor: theme.primary }]}
            onPress={() => setActiveBottomTab('membership')}
          >
            <Text style={[styles.navTextIcon, { color: activeBottomTab === 'membership' ? theme.buttonText : theme.textSecondary }]}>⭐</Text>
            <Text style={[styles.navLabel, { color: activeBottomTab === 'membership' ? theme.buttonText : theme.textSecondary }]}>Membership</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navButton, activeBottomTab === 'orders' && { backgroundColor: theme.primary }]}
            onPress={() => setActiveBottomTab('orders')}
          >
            <Image 
              source={require('../../assets/orders.png')} 
              style={[styles.navIcon, { tintColor: activeBottomTab === 'orders' ? theme.buttonText : theme.textSecondary }]} 
            />
            <Text style={[styles.navLabel, { color: activeBottomTab === 'orders' ? theme.buttonText : theme.textSecondary }]}>Orders</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  welcomeTextBox: {
    borderWidth: 2,
    borderColor: '#8B4513',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 100,
  },
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minHeight: 60,
  },
  navIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
    resizeMode: 'contain',
  },
  navTextIcon: {
    fontSize: 24,
    marginBottom: 4,
    lineHeight: 24,
    textAlign: 'center',
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  activeNavButton: {
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
  },
  activeNavIcon: {
    tintColor: '#6B4E3D',
  },
  activeNavTextIcon: {
    color: '#6B4E3D',
  },
  activeNavLabel: {
    color: '#6B4E3D',
    fontWeight: 'bold',
  },
  menuSection: {
    flex: 1,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  membershipCard: {
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  freeDrinkCard: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  membershipCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  stampsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stamp: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  stampFilled: {
    backgroundColor: '#007bff',
  },
  stampText: {
    color: '#fff',
    fontSize: 16,
  },
  stampsProgress: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
  pointsDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  pointsBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
    marginBottom: 8,
  },
  pointsProgress: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#007bff',
  },
  pointsText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
  redeemButton: {
    backgroundColor: '#007bff',
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  redeemButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  freeDrinkCount: {
    fontSize: 16,
    textAlign: 'center',
    color: '#2E7D32',
    marginBottom: 12,
    fontWeight: '500',
  },
  redeemFreeDrinkButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  redeemFreeDrinkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  historyDescription: {
    fontSize: 14,
    color: '#333',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
  },
  historyPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  orderCard: {
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  orderCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  orderItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  orderInfo: {
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  orderItems: {
    fontSize: 14,
    color: '#333',
  },
  orderTime: {
    fontSize: 12,
    color: '#999',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  completeButton: {
    backgroundColor: '#2E8B57',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  stampsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  stamp: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampFilled: {
    backgroundColor: '#6B4E3D',
  },
  stampText: {
    fontSize: 16,
    color: '#fff',
  },
  stampsProgress: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  pointsDisplay: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B4E3D',
    textAlign: 'center',
    marginVertical: 8,
  },
  pointsBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginVertical: 8,
  },
  pointsProgress: {
    height: 8,
    backgroundColor: '#6B4E3D',
    borderRadius: 4,
  },
  pointsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  redeemButton: {
    backgroundColor: '#6B4E3D',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 12,
  },
  redeemButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  historyDescription: {
    fontSize: 14,
    color: '#333',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
  },
  historyPoints: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
