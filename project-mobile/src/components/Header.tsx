// src/components/Header.tsx

import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useCart } from '../context/CartContext';
import type { RootTabParamList } from '../navigation/AppNavigator';

type HeaderNavProp = BottomTabNavigationProp<RootTabParamList, 'Home'>;

export const Header: React.FC = () => {
  const navigation = useNavigation<HeaderNavProp>();
  const { items } = useCart();

  // Sum up total quantity across all cart items
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      {/* left: home/logo */}
      <TouchableOpacity
        style={styles.leftAction}
        onPress={() => navigation.navigate('Home')}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* right: search + cart */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="cart-outline" size={24} color="#fff" />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: '#E76F51',
    justifyContent: 'center', // vertically center children
  },
  leftAction: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  rightActions: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 24,
    height: 24,
  },
  iconButton: {
    marginLeft: 16,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
