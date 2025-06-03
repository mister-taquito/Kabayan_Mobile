// src/screens/ProductDetailScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GET_PRODUCT_BY_HANDLE } from '../lib/shopify/queries/product';
import { shopifyRequest } from '../lib/shopify';
import ImageCarousel from '../components/ImageCarousel';
// import VariantSelector from '../components/VariantSelector'; // still omitted for now
import { useCart } from '../context/CartContext';

import type { RootStackParamList } from '../navigation/AppNavigator';
import type { ShopifyProduct } from '../lib/shopify/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;

// We’ll use an Animated.Value to fade in/out the “Added to Cart” message
const TOAST_DURATION = 2000; // milliseconds

export default function ProductDetailScreen({ route }: Props) {
  const { handle } = route.params;
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  // State and animation value for the “Added to Cart” toast
  const [toastVisible, setToastVisible] = useState(false);
  const toastOpacity = React.useRef(new Animated.Value(0)).current;

  const showToast = () => {
    setToastVisible(true);
    // Fade in quickly
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // After TOAST_DURATION, fade out
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setToastVisible(false);
        });
      }, TOAST_DURATION);
    });
  };

  const fetchProduct = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await shopifyRequest<{ productByHandle: ShopifyProduct }>(
        GET_PRODUCT_BY_HANDLE,
        { handle }
      );

      if (!data.productByHandle) {
        setError('Product not found.');
      } else {
        setProduct(data.productByHandle);
        const firstVariant = data.productByHandle.variants.edges[0].node.id;
        setSelectedVariantId(firstVariant);
      }
    } catch (e) {
      console.error('Product fetch failed', e);
      setError('Unable to load product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [handle]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProduct}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text style={styles.errorText}>Product not found.</Text>
      </SafeAreaView>
    );
  }

  // Pull fields out of the fetched product
  const { title, descriptionHtml, images, variants } = product;
  const selectedVariant =
    variants.edges.find((v) => v.node.id === selectedVariantId) || variants.edges[0];
  const priceAmount = selectedVariant.node.price.amount;
  const currencyCode = selectedVariant.node.price.currencyCode;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1) Image Carousel */}
        <View style={styles.carouselWrapper}>
          <ImageCarousel images={images.edges.map((e) => e.node.url)} />
        </View>

        {/* 2) Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{title}</Text>

          {/* Price pill */}
          <View style={styles.pricePill}>
            <Text style={styles.pricePillText}>
              {Number(priceAmount).toFixed(2)} {currencyCode}
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            {descriptionHtml.replace(/<\/?[^>]+(>|$)/g, '')}
          </Text>

          {/* VariantSelector (omitted) */}

          {/* “Add to Cart” Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.addToCartButton}
            onPress={() => {
              if (selectedVariantId) {
                addToCart(selectedVariantId, 1);
                showToast(); // trigger toast animation
              }
            }}
          >
            <Text style={styles.addToCartButtonText}>+ Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/** 3) Toast message at the bottom */}
      {toastVisible && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>Added to Cart</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

//
// Styles
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  //
  // Carousel: reduce height slightly so the title sits a bit higher
  //
  carouselWrapper: {
    width: width,
    height: width * 0.75, // 4:3 ratio instead of full square
  },
  //
  // Info container: reduce top padding to pull content up
  //
  infoContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 16, // was 24
  },
  title: {
    fontSize: 26, // slightly smaller so it doesn’t feel too cramped
    fontWeight: '700',
    marginBottom: 8, // reduce margin
    color: '#111827',
  },
  pricePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F97316',
    borderRadius: 18,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  pricePillText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 16,
  },
  addToCartButton: {
    marginTop: 20,
    backgroundColor: '#F97316',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#F97316',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  //
  // Toast container (positioned at bottom center)
  //
  toastContainer: {
    position: 'absolute',
    bottom: 32,
    left: HORIZONTAL_PADDING,
    right: HORIZONTAL_PADDING,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});
