import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppStore } from '../viewmodels/useCartViewModel';

export default function OrderSuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { stamps, points } = useAppStore();
  const orderId = route.params?.orderId;

  const handleTrackOrder = () => {
    navigation.navigate('Home', { initialTab: 'orders' });
  };

  const handleContinueShopping = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../../assets/take-away.png')} 
          style={styles.successIcon}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Order Placed Successfully!</Text>
        
        {orderId && (
          <Text style={styles.orderNumber}>Order #{orderId.slice(-4)}</Text>
        )}
        
        <Text style={styles.subtitle}>
          Thank you for your order! We're preparing your delicious coffee.
        </Text>
        
        <View style={styles.estimateContainer}>
          <Text style={styles.estimateText}>📍 Estimated pickup time</Text>
          <Text style={styles.estimateTime}>15-20 minutes</Text>
        </View>
        
        <View style={styles.rewardsContainer}>
          <Text style={styles.rewardsTitle}>Rewards to be Earned!</Text>
          <Text style={styles.rewardsSubtitle}>Complete your order to earn rewards</Text>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardIcon}>⭐</Text>
            <Text style={styles.rewardText}>Stamps to earn when completed</Text>
          </View>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardIcon}>🎯</Text>
            <Text style={styles.rewardText}>Points to earn when completed</Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.trackButton]}
            onPress={handleTrackOrder}
          >
            <Text style={styles.trackButtonText}>Track My Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.shopButton]}
            onPress={handleContinueShopping}
          >
            <Text style={styles.shopButtonText}>Continue Shopping</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successIcon: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 18,
    color: '#8B4513',
    fontWeight: '600',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  estimateContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  estimateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  estimateTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  rewardsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rewardsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  rewardsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  rewardText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  trackButton: {
    backgroundColor: '#8B4513',
  },
  shopButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  shopButtonText: {
    color: '#8B4513',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
  },
});
