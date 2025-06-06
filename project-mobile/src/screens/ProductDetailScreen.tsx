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
  Easing,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useCallback as useCb } from 'react';

import { GET_PRODUCT_BY_HANDLE } from '../lib/shopify/queries/product';
import { shopifyRequest } from '../lib/shopify';
import ImageCarousel from '../components/ImageCarousel';
import { useCart } from '../context/CartContext';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { ShopifyProduct } from '../lib/shopify/types';

import { Colors, Typography, Spacing, CommonStyles } from '../styles/Theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');
const H_PAD = Spacing.md; // 16

export default function ProductDetailScreen({ route }: Props) {
  const { handle } = route.params;
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  // Toast slide-up setup
  const [showToast, setShowToast] = useState<boolean>(false);
  const toastTranslate = React.useRef(new Animated.Value(50)).current;

  // Track whether this screen is focused
  const isFocused = useIsFocused();

  // Fetch product by handle
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

  // On mount (and whenever handle changes), fetch the product
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Prevent toast from lingering when navigating away
  useFocusEffect(
    useCb(() => {
      return () => {
        setShowToast(false);
      };
    }, [])
  );

  // Slide-up toast animation
  const triggerToast = () => {
    setShowToast(true);

    toastTranslate.setValue(50);
    Animated.timing(toastTranslate, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastTranslate, {
          toValue: 50,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(() => setShowToast(false));
      }, 2000);
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={CommonStyles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={CommonStyles.centeredContainer}>
        <Text style={CommonStyles.errorText}>{error}</Text>
        <TouchableOpacity
          style={[CommonStyles.primaryButton, { marginTop: Spacing.md }]}
          onPress={fetchProduct}
        >
          <Text style={CommonStyles.primaryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // If product is still null
  if (!product) {
    return (
      <SafeAreaView style={CommonStyles.centeredContainer}>
        <Text style={CommonStyles.errorText}>Product not found.</Text>
      </SafeAreaView>
    );
  }

  // Destructure product fields
  const { title, descriptionHtml, images, variants } = product;
  const selectedVariant =
    variants.edges.find((v) => v.node.id === selectedVariantId) ||
    variants.edges[0];
  const priceAmount = parseFloat(selectedVariant.node.price.amount).toFixed(2);
  const currencyCode = selectedVariant.node.price.currencyCode;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Carousel */}
        <View style={styles.carouselWrapper}>
          <ImageCarousel images={images.edges.map((e) => e.node.url)} />
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={[Typography.h1, styles.titleText]}>{title}</Text>

          <View style={CommonStyles.pricePill}>
            <Text style={CommonStyles.pricePillText}>
              {priceAmount} {currencyCode}
            </Text>
          </View>

          <Text style={styles.descriptionText}>
            {descriptionHtml.replace(/<\/?[^>]+(>|$)/g, '')}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[CommonStyles.primaryButton, { marginTop: Spacing.lg }]}
            onPress={() => {
              if (selectedVariantId) {
                addToCart(selectedVariantId, 1);
                triggerToast();
              }
            }}
          >
            <Text style={CommonStyles.primaryButtonText}>+ Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Toast Slide-Up Message (only when screen is focused) */}
      {showToast && isFocused && (
        <Animated.View
          style={[
            CommonStyles.toastContainer,
            { transform: [{ translateY: toastTranslate }] },
          ]}
        >
          <Text style={CommonStyles.toastText}>Product added to cart</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xl, // leave room for toast
  },
  carouselWrapper: {
    width: width,
    height: width * 0.75, // 4:3 aspect ratio
  },
  infoContainer: {
    paddingHorizontal: H_PAD,
    paddingTop: Spacing.lg,
  },
  titleText: {
    marginBottom: Spacing.sm,
    color: Colors.textDark,
  },
  descriptionText: {
    ...Typography.body,
    marginBottom: Spacing.md,
    color: Colors.textMuted,
  },
});
