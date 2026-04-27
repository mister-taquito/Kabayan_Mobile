// src/screens/HomeScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { shopifyRequest }    from '../api/shopify';
import { GET_HOME_PRODUCTS } from '../api/queries';
import { Header }            from '../components/Header';
import { ProductCard, Product }  from '../components/ProductCard';
import { SkeletonCard, SkeletonList, SkeletonCategory } from '../components/SkeletonLoader';
import { ErrorView, NetworkError, EmptyState } from '../components/ErrorView';
import { AnimatedButton } from '../components/AnimatedButton';

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { RootTabParamList }       from '../navigation/AppNavigator';

// Theme imports
import { Colors, Typography, Spacing, CommonStyles, Animations } from '../styles/Theme';

type HomeProps = BottomTabScreenProps<RootTabParamList, 'Home'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WRAPPER_MARGIN = Spacing.md;    // 16
const IMAGE_WIDTH    = SCREEN_WIDTH - WRAPPER_MARGIN * 2;
const HERO_ASPECT    = 2;            // 2:1 ratio
const HERO_HEIGHT    = IMAGE_WIDTH / HERO_ASPECT;
const CARD_WIDTH     = SCREEN_WIDTH * 0.45;

const categories = [
  { id: 'snacks',  title: 'Snacks',  image: require('../../assets/SnS banner.png') },
  { id: 'sauces-and-condiments',  title: 'Sauces',  image: require('../../assets/CnS banner.png') },
  { id: 'alcohol-and-tobacco', title: 'Alcohol', image: require('../../assets/AT Banner.png') },
];

export default function HomeScreen({ navigation }: HomeProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const data: any = await shopifyRequest(GET_HOME_PRODUCTS);
      const mapped: Product[] = data.products.edges.map((edge: any) => {
        const node = edge.node;
        return {
          id:     node.id,
          variantId: node.variants.edges[0].node.id,
          name:   node.title,
          image:  node.featuredImage?.url || '',
          price:  parseFloat(node.variants.edges[0].node.price.amount),
          handle: node.handle,
        };
      });
      setProducts(mapped);
      setError(null);
    } catch (err) {
      console.error('Shopify fetch error', err);
      setError('Unable to load products. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    fetchProducts();
  }, [fetchProducts]);

  // Initial loading state
  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Skeleton */}
          <View style={styles.heroWrapper}>
            <View style={styles.skeletonHero} />
          </View>

          {/* Categories Skeleton */}
          <View style={styles.categoryWrapper}>
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCategory key={index} />
            ))}
          </View>

          {/* New Arrivals Skeleton */}
          <View style={styles.section}>
            <View style={styles.skeletonSectionTitle} />
            <SkeletonList count={3} horizontal />
          </View>

          {/* Trending Skeleton */}
          <View style={styles.section}>
            <View style={styles.skeletonSectionTitle} />
            <SkeletonList count={3} horizontal />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <NetworkError onRetry={handleRetry} isRetrying={loading} />
        </View>
      </SafeAreaView>
    );
  }

  const newArrivals = products.slice(0, 5);
  const trending    = products.slice(5, 10);

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Hero Banner (unclickable for now) */}
        <View style={styles.heroWrapper}>
          <Image
            source={require('../../assets/banner.png')}
            style={styles.heroImage}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoryWrapper}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryButton}
              onPress={() =>
                navigation.navigate('Category', { categoryId: cat.id })
              }
            >
              <Image source={cat.image} style={styles.categoryImage} />
              <Text style={[Typography.label, styles.categoryText]}>
                {cat.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* New Arrivals */}
        <View style={styles.section}>
          <Text style={[Typography.h2, styles.sectionTitle]}>New Arrivals</Text>
          <FlatList
            horizontal
            data={newArrivals}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
            snapToInterval={CARD_WIDTH + Spacing.sm * 2}
            decelerationRate="fast"
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() =>
                  navigation.getParent()?.navigate('ProductDetail', { handle: item.handle })
                }
              />
            )}
          />
        </View>

        {/* Trending */}
        <View style={styles.section}>
          <Text style={[Typography.h2, styles.sectionTitle]}>Trending</Text>
          <FlatList
            horizontal
            data={trending}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
            snapToInterval={CARD_WIDTH + Spacing.sm * 2}
            decelerationRate="fast"
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() =>
                  navigation.getParent()?.navigate('ProductDetail', { handle: item.handle })
                }
              />
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: Colors.backgroundAlt,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },

  heroWrapper: {
    marginTop:        Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom:     Spacing.lg,
    alignItems:       'center',
  },
  heroImage: {
    width:        IMAGE_WIDTH,
    height:       HERO_HEIGHT,
    borderRadius: 16,
  },

  categoryWrapper: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom:     Spacing.lg,
  },
  categoryButton: {
    alignItems: 'center',
    width:      80,
  },
  categoryImage: {
    width:        64,
    height:       64,
    borderRadius: 32,
    marginBottom: Spacing.sm,
  },
  categoryText: {
    color: Colors.textDark,
  },

  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginHorizontal: Spacing.md,
    marginBottom:     Spacing.sm,
    color:            Colors.textDark,
  },

  carousel: {
    paddingLeft: Spacing.md - 8,
  },

  // Skeleton styles
  skeletonHero: {
    width: IMAGE_WIDTH,
    height: HERO_HEIGHT,
    borderRadius: 16,
    backgroundColor: Colors.borderLight,
  },
  skeletonSectionTitle: {
    width: 150,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
