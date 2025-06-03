// src/screens/CategoryScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import { shopifyRequest } from '../lib/shopify';
import { GET_PRODUCTS_BY_COLLECTION_BY_HANDLE } from '../lib/shopify/queries/products-by-collection-by-handle';
import { Header } from '../components/Header';
import { ProductCard, Product } from '../components/ProductCard';

import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp }       from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp }     from '@react-navigation/native-stack';
import type { RootTabParamList, RootStackParamList } from '../navigation/AppNavigator';
import type { ShopifyProduct } from '../lib/shopify/types';

type CategoryScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, 'Category'>,
  NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>
>;

type CategoryScreenRouteProp = RouteProp<RootTabParamList, 'Category'>;

type Props = {
  navigation: CategoryScreenNavigationProp;
  route:      CategoryScreenRouteProp;
};

export default function CategoryScreen({ route, navigation }: Props) {
  // Now this “collectionId” really is a “handle” (slug) like "snacks" or "sauces"
  const collectionHandle = route.params?.categoryId ?? '';

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [filterVisible, setFilterVisible] = useState<boolean>(false);

  const fetchProductsByCollection = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await shopifyRequest<{
        collectionByHandle: {
          title: string;
          products: { edges: Array<{ node: ShopifyProduct }> };
        } | null;
      }>(GET_PRODUCTS_BY_COLLECTION_BY_HANDLE, { handle: collectionHandle });

      if (!response.collectionByHandle) {
        setError('Collection not found.');
      } else {
        setTitle(response.collectionByHandle.title);

        // Map ShopifyProduct → UI Product
        const mapped: Product[] = response.collectionByHandle.products.edges.map((e: any) => {
          const node: ShopifyProduct = e.node;
          return {
            id:     node.id,
            name:   node.title,
            handle: node.handle,
            image:  node.featuredImage?.url || '',
            price:  parseFloat(node.variants.edges[0].node.price.amount),
          };
        });
        setProducts(mapped);
      }
    } catch (e) {
      console.error('Collection fetch failed', e);
      setError('Unable to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [collectionHandle]);

  useEffect(() => {
    fetchProductsByCollection();
  }, [fetchProductsByCollection]);

  // 1) Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" style={styles.center} />
      </SafeAreaView>
    );
  }

  // 2) Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={fetchProductsByCollection} />
        </View>
      </SafeAreaView>
    );
  }

  // 3) Empty‐state
  if (!products.length) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.center}>
          <Text style={styles.errorText}>
            No products in this category.
          </Text>
          <Button title="Back to Categories" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  // 4) Normal state
  return (
    <SafeAreaView style={styles.container}>
      <Header />

      {/* Title + Filter */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}
        >
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.getParent()?.navigate('ProductDetail', { handle: item.handle })
            }
          >
            <ProductCard product={item} />
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={filterVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filters coming soon</Text>
            <Button title="Close" onPress={() => setFilterVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  title:       { fontSize: 20, fontWeight: '600' },
  filterButton: { padding: 4 },
  filterText:   { color: '#007aff', fontSize: 16 },
  grid:        {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
});
