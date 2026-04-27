// src/screens/ProductDetailScreen.tsx

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

import { GET_PRODUCT_BY_HANDLE } from '../lib/shopify/queries/product';
import { shopifyRequest } from '../api/shopify'; // ← migrated client
import ImageCarousel from '../components/ImageCarousel';
import { useCart } from '../context/CartContext';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Colors, Typography, Spacing, CommonStyles } from '../styles/Theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');
const H_PAD = Spacing.md;

// Minimal response typing for fields we use
type ProductResponse = {
  productByHandle: {
    id: string;
    title: string;
    descriptionHtml: string;
    images: { edges: { node: { url: string } }[] };
    variants: {
      edges: {
        node: {
          id: string; // variant (merchandiseId for Cart API)
          title: string;
          price: { amount: string; currencyCode: string };
        };
      }[];
    };
  } | null;
};

export default function ProductDetailScreen({ route }: Props) {
  const { handle } = route.params;
  const [product, setProduct] = useState<ProductResponse['productByHandle'] | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  // Toast slide-up
  const [showToast, setShowToast] = useState(false);
  const toastTranslate = useRef(new Animated.Value(50)).current;
  const isFocused = useIsFocused();

  const fetchProduct = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await shopifyRequest<ProductResponse>(GET_PRODUCT_BY_HANDLE, { handle });
      if (!data.productByHandle) {
        setError('Product not found.');
        setProduct(null);
        setSelectedVariantId(null);
      } else {
        const p = data.productByHandle;
        setProduct(p);
        const firstVariant = p.variants.edges[0]?.node?.id ?? null;
        setSelectedVariantId(firstVariant);
      }
    } catch (e) {
      console.error('Product fetch failed', e);
      setError('Unable to load product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [handle]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  useFocusEffect(useCallback(() => () => setShowToast(false), []));

  const triggerToast = () => {
    setShowToast(true);
    toastTranslate.setValue(50);
    Animated.timing(toastTranslate, {
      toValue: 0, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastTranslate, {
          toValue: 50, duration: 200, easing: Easing.in(Easing.ease), useNativeDriver: true,
        }).start(() => setShowToast(false));
      }, 2000);
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={CommonStyles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

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

  if (!product) {
    return (
      <SafeAreaView style={CommonStyles.centeredContainer}>
        <Text style={CommonStyles.errorText}>Product not found.</Text>
      </SafeAreaView>
    );
  }

  const { title, descriptionHtml, images, variants } = product;
  const selectedEdge =
    variants.edges.find((v) => v.node.id === selectedVariantId) ?? variants.edges[0];
  const selectedVariant = selectedEdge?.node;

  const priceAmount = selectedVariant
    ? parseFloat(selectedVariant.price.amount).toFixed(2)
    : '0.00';
  const currencyCode = selectedVariant?.price.currencyCode ?? '';

  // Always allow adding if we have a variant ID; Shopify will reject with userErrors if truly not sellable.
  const canAdd = Boolean(selectedVariant?.id);

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
            style={[
              CommonStyles.primaryButton,
              { marginTop: Spacing.lg },
              (!canAdd || adding) && CommonStyles.primaryButtonDisabled,
            ]}
            disabled={!canAdd || adding}
            onPress={async () => {
              if (!selectedVariant?.id) return;
              try {
                setAdding(true);
                await addToCart(selectedVariant.id, 1); // merchandiseId = variantId
                triggerToast();
              } catch (e) {
                console.error('Add to cart failed', e);
                // Optional: show a banner here if you want user-visible error feedback
              } finally {
                setAdding(false);
              }
            }}
          >
            {adding ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={CommonStyles.primaryButtonText}>+ Add to Cart</Text>
            )}
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
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: Spacing.xl },
  carouselWrapper: { width, height: width * 0.75 },
  infoContainer: { paddingHorizontal: H_PAD, paddingTop: Spacing.lg },
  titleText: { marginBottom: Spacing.sm, color: Colors.textDark },
  descriptionText: { ...Typography.body, marginBottom: Spacing.md, color: Colors.textMuted },
});
