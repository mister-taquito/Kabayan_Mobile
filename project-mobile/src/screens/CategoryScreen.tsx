// src/screens/CategoryScreen.tsx

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Button,
  Dimensions,
  ScrollView,
} from 'react-native';
import { shopifyRequest } from '../lib/shopify';
import { GET_PRODUCTS_BY_COLLECTION_BY_HANDLE } from '../lib/shopify/queries/products-by-collection-by-handle';
import { Header } from '../components/Header';
import { ProductCard, Product } from '../components/ProductCard';

import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp }      from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp }    from '@react-navigation/native-stack';
import type { RootTabParamList, RootStackParamList } from '../navigation/AppNavigator';
import type { ShopifyProduct } from '../lib/shopify/types';

import { Colors, Typography, Spacing, CommonStyles } from '../styles/Theme';

//
// 1) Navigation & Route types
//
type CategoryScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'Category'>,
  NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>
>;

type CategoryScreenRouteProp = RouteProp<RootTabParamList, 'Category'>;

type Props = {
  navigation: CategoryScreenNavigationProp;
  route:      CategoryScreenRouteProp;
};

//
// 2) “Tabs” of categories. Each handle must match a Shopify collection handle.
//    If you add more categories later, they will scroll horizontally here.
//
const ALL_CATEGORIES: Array<{
  handle: string;
  title:  string;
  banner: any; // placeholder for any collection‐specific banner (currently unused)
}> = [
  {
    handle: 'snacks',
    title:  'Snacks',
    banner: require('../../assets/SnS banner.png'),
  },
  {
    handle: 'sauces-and-condiments',
    title:  'Sauces',
    banner: require('../../assets/CnS banner.png'),
  },
  {
    handle: 'alcohol-and-tobacco',
    title:  'Alcohol',
    banner: require('../../assets/AT Banner.png'),
  },
  // (Add additional categories here; they will scroll off‐screen.)
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CategoryScreen({ route, navigation }: Props) {
  // 3) “Lift” the incoming route param into local state so taps can override it:
  const initialHandle = route.params.categoryId || ALL_CATEGORIES[0].handle;
  const [currentHandle, setCurrentHandle] = useState<string>(initialHandle);

  // 4) Local UI state
  const [products, setProducts]           = useState<Product[]>([]);
  const [isLoading, setIsLoading]         = useState<boolean>(true);
  const [error, setError]                 = useState<string | null>(null);
  const [title, setTitle]                 = useState<string>('');
  const [filterVisible, setFilterVisible] = useState<boolean>(false);

  // 5) Sorting
  type SortOption =
    | 'relevance'
    | 'trending'
    | 'latest'
    | 'priceLowHigh'
    | 'priceHighLow';

  const [sortOption, setSortOption] = useState<SortOption>('relevance');

  const SORT_LABELS: Record<SortOption, string> = {
    relevance:    'Relevance',
    trending:     'Trending',
    latest:       'Latest arrivals',
    priceLowHigh: 'Price: Low to high',
    priceHighLow: 'Price: High to low',
  };

  //
  // 6) Re‐fetch products whenever `currentHandle` changes
  //
  const fetchProductsByCollection = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await shopifyRequest<{
        collectionByHandle: {
          title: string;
          products: { edges: Array<{ node: ShopifyProduct }> };
        } | null;
      }>(GET_PRODUCTS_BY_COLLECTION_BY_HANDLE, { handle: currentHandle });

      if (!response.collectionByHandle) {
        setError('Collection not found.');
      } else {
        setTitle(response.collectionByHandle.title);

        const mapped: Product[] = response.collectionByHandle.products.edges.map(
          (edge) => {
            const node: ShopifyProduct = edge.node;
            return {
              id:     node.id,
              name:   node.title,
              handle: node.handle,
              image:  node.featuredImage?.url || '',
              price:  parseFloat(node.variants.edges[0].node.price.amount),
            };
          }
        );
        setProducts(mapped);
      }
    } catch (e) {
      console.error('Collection fetch failed', e);
      setError('Unable to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentHandle]);

  useEffect(() => {
    fetchProductsByCollection();
  }, [fetchProductsByCollection]);

  //
  // 7) Compute the sortedList in memory
  //
  const sortedProducts = useMemo(() => {
    const arr = [...products];
    switch (sortOption) {
      case 'relevance':
        return arr;
      case 'trending':
        return arr; // treat same as relevance for now
      case 'latest':
        return [...arr].reverse();
      case 'priceLowHigh':
        return [...arr].sort((a, b) => a.price - b.price);
      case 'priceHighLow':
        return [...arr].sort((a, b) => b.price - a.price);
      default:
        return arr;
    }
  }, [products, sortOption]);

  //
  // 8) Loading state
  //
  if (isLoading) {
    return (
      <SafeAreaView style={CommonStyles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  //
  // 9) Error state
  //
  if (error) {
    return (
      <SafeAreaView style={CommonStyles.centeredContainer}>
        <Text
          style={[
            Typography.body,
            {
              color:        Colors.error,
              marginBottom: Spacing.md,
              textAlign:    'center',
            },
          ]}
        >
          {error}
        </Text>
        <TouchableOpacity
          style={CommonStyles.primaryButton}
          onPress={() => fetchProductsByCollection()}
        >
          <Text style={CommonStyles.primaryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  //
  // 10) Empty state (no products in this category)
  //
  if (products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />

        <View style={CommonStyles.centeredContainer}>
          <Text style={CommonStyles.emptyText}>
            No products in this category.
          </Text>
          <TouchableOpacity
            style={CommonStyles.primaryButton}
            onPress={() => {
              // Reset back to the first tab if there are no products
              const firstHandle = ALL_CATEGORIES[0].handle;
              setCurrentHandle(firstHandle);
            }}
          >
            <Text style={CommonStyles.primaryButtonText}>
              View Other Categories
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  //
  // 11) Normal state: render the tabs, title, and product grid
  //
  return (
    <SafeAreaView style={styles.container}>
      {/* 11a) App Header */}
      <Header />

      {/* 11b) Category “tab” row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryTabRow}
      >
        {ALL_CATEGORIES.map((cat) => {
          const isActive = cat.handle === currentHandle;
          return (
            <TouchableOpacity
              key={cat.handle}
              style={[
                styles.categoryTabItem,
                isActive && styles.categoryTabItemActive,
              ]}
              onPress={() => {
                if (cat.handle !== currentHandle) {
                  setSortOption('relevance'); // reset any prior sort
                  setCurrentHandle(cat.handle);
                }
              }}
            >
              <Text
                style={[
                  {
                    fontSize:   16,       // slightly larger than Typography.label
                    fontWeight: isActive ? '700' : '500',
                    color:      isActive ? Colors.background : Colors.primary,
                  },
                ]}
                numberOfLines={1}
              >
                {cat.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 11c) Title + “Filter” button */}
      <View style={styles.titleRow}>
        <Text style={[Typography.h2, styles.titleText]}>{title}</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}
        >
          <Text
            style={[
              Typography.label,
              { color: Colors.primary, textDecorationLine: 'underline' },
            ]}
          >
            Filter
          </Text>
        </TouchableOpacity>
      </View>

      {/* 11d) Product grid (sortedProducts) */}
      <FlatList
        data={sortedProducts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardWrapper}
            onPress={() =>
              navigation
                .getParent()
                ?.navigate('ProductDetail', { handle: item.handle })
            }
          >
            <ProductCard product={item} />
          </TouchableOpacity>
        )}
      />

      {/* 11e) Filters modal */}
      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[Typography.h2, { marginBottom: Spacing.md }]}>
              Filters
            </Text>

            {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.filterOptionRow}
                onPress={() => {
                  setSortOption(opt);
                  setFilterVisible(false);
                }}
              >
                <Text
                  style={[
                    Typography.body,
                    {
                      color:
                        sortOption === opt
                          ? Colors.textDark
                          : Colors.textMuted,
                      textDecorationLine:
                        sortOption === opt ? 'underline' : 'none',
                    },
                  ]}
                >
                  {SORT_LABELS[opt]}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={{ height: Spacing.lg }} />
            <Button title="Close" onPress={() => setFilterVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

//
// 12) Styles for CategoryScreen
//
const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: Colors.backgroundAlt,
  },

  //
  // 12a) Horizontal “tabs” row
  //
  categoryTabRow: {
    flexDirection:     'row',
    paddingHorizontal: Spacing.sm,
    paddingVertical:   Spacing.xs,
    backgroundColor:   Colors.background,
  },

  //
  // 12b) Each tab item: larger padding + minWidth so they’re easy to see and tap
  //
  categoryTabItem: {
    marginRight:       Spacing.md,
    paddingVertical:   Spacing.md,   // ≈16px vertical padding
    paddingHorizontal: Spacing.lg,   // ≈24px horizontal padding
    minWidth:          100,          // ensures each tab is wide enough
    borderRadius:      20,
    backgroundColor:   Colors.background,
    borderWidth:       1,
    borderColor:       Colors.primary,
  },
  categoryTabItemActive: {
    backgroundColor: Colors.primary,
    borderColor:     Colors.primary,
  },

  //
  // 12c) Title + Filter row
  //
  titleRow: {
    flexDirection:      'row',
    alignItems:         'center',
    justifyContent:     'space-between',
    paddingHorizontal:  Spacing.md,
    marginBottom:       Spacing.sm,
    backgroundColor:    Colors.background,
    paddingVertical:    Spacing.sm,
  },
  titleText: {
    color: Colors.textDark,
  },
  filterButton: {
    paddingVertical:   Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },

  //
  // 12d) Grid container
  //
  grid: {
    paddingHorizontal: Spacing.sm,
    paddingBottom:     Spacing.xl,
  },
  cardWrapper: {
    flex:     1,
    margin:   Spacing.sm,
    maxWidth: (SCREEN_WIDTH - Spacing.sm * 6) / 2,
    // (2 columns: total horizontal margins = 3 * Spacing.sm * 2 = 48px)
  },

  //
  // 12e) Modal overlay + content
  //
  modalOverlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent:  'center',
    alignItems:      'center',
  },
  modalContent: {
    width:           '80%',
    backgroundColor: Colors.background,
    borderRadius:    8,
    padding:         Spacing.md,
    alignItems:      'flex-start',
    elevation:       4,
  },
  filterOptionRow: {
    paddingVertical: Spacing.sm,
  },
});
