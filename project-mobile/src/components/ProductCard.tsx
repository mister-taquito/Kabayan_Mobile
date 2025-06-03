// src/components/ProductCard.tsx

import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.45;

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  handle: string;    // ← added handle property
}

interface Props {
  product: Product;
  style?: ViewStyle;
}

export const ProductCard: React.FC<Props> = ({ product, style }) => (
  <View style={[styles.card, style]}>
    <Image
      source={{ uri: product.image }}
      style={styles.image}
      resizeMode="cover"
    />
    <Text numberOfLines={1} style={styles.name}>
      {product.name}
    </Text>
    <Text style={styles.price}>${product.price.toFixed(2)}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android elevation
    elevation: 3,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
});
