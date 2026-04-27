// src/components/ProductCard.tsx

import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  ViewStyle,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

// Theme imports
import { Colors, Typography, Spacing, CommonStyles, Animations } from '../styles/Theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.45;

export interface Product {
  id: string;
  variantId: string;
  name: string;
  price: number;
  image: string;
  handle: string;
}

interface Props {
  product: Product;
  style?: ViewStyle;
  onPress?: () => void;
}

export const ProductCard: React.FC<Props> = ({ product, style, onPress }) => {
  const { addToCart } = useCart();
  const [isPressed, setIsPressed] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handleQuickAdd = async () => {
    setIsAdding(true);
    try {
      await addToCart(product.variantId, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={[styles.card, isPressed && styles.cardPressed]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.quickAddButton}
            onPress={handleQuickAdd}
            disabled={isAdding}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color={Colors.background} />
            ) : (
              <Ionicons name="add" size={20} color={Colors.background} />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text numberOfLines={2} style={styles.name}>
            {product.name}
          </Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    margin: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.sm,
    alignItems: 'flex-start',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardPressed: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: Spacing.sm,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH,
    borderRadius: 8,
  },
  quickAddButton: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  name: {
    ...Typography.label,
    color: Colors.textDark,
    marginBottom: Spacing.xs,
    minHeight: 40,
  },
  price: {
    ...Typography.label,
    color: Colors.primary,
    fontWeight: '700',
  },
});
