// src/screens/SearchScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { shopifyRequest } from '../api/shopify';
import { GET_SEARCH_PRODUCTS } from '../api/queries';
import { ProductCard, Product } from '../components/ProductCard';

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { RootTabParamList }      from '../navigation/AppNavigator';

// Import theme
import { Colors, Typography, Spacing, CommonStyles } from '../styles/Theme';

type SearchProps = BottomTabScreenProps<RootTabParamList, 'Search'>;

export default function SearchScreen({ navigation }: SearchProps) {
  const [query, setQuery]         = useState<string>('');
  const [results, setResults]     = useState<Product[]>([]);
  const [loading, setLoading]     = useState<boolean>(false);
  const [error, setError]         = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const onSearch = useCallback(async () => {
    // Dismiss keyboard
    Keyboard.dismiss();
    if (!query.trim()) {
      setError('Please enter a search term.');
      return;
    }

    setHasSearched(true);
    setLoading(true);
    setError(null);

    try {
      const data: any = await shopifyRequest(GET_SEARCH_PRODUCTS, { query: query.trim() });
      const edges = data.products.edges as any[];
      const mapped: Product[] = edges.map((edge) => {
        const node = edge.node;
        return {
          id:     node.id,
          name:   node.title,
          handle: node.handle,
          image:  node.featuredImage?.url || '',
          price:  parseFloat(node.variants.edges[0].node.price.amount),
        };
      });
      setResults(mapped);
    } catch (e) {
      console.error('Search fetch failed', e);
      setError('Unable to fetch search results. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => navigation.getParent()?.navigate('ProductDetail', { handle: item.handle })}
    >
      <ProductCard product={item} style={{ marginBottom: Spacing.sm }} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={onSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={CommonStyles.centeredContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {!loading && error && (
        <View style={CommonStyles.centeredContainer}>
          <Text style={CommonStyles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && hasSearched && results.length === 0 && (
        <View style={CommonStyles.centeredContainer}>
          <Text style={[Typography.body, { color: Colors.textMuted }]}>
            No results found for “{query}”.
          </Text>
        </View>
      )}

      {!loading && !error && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: Colors.backgroundAlt,
  },

  searchBarContainer: {
    flexDirection:    'row',
    padding:          Spacing.md,
    backgroundColor:  Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    flex:            1,
    height:          40,
    borderRadius:    8,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: Spacing.sm,
    color:           Colors.textDark,
  },
  searchButton: {
    marginLeft:       Spacing.sm,
    backgroundColor:  Colors.primary,
    borderRadius:     8,
    paddingHorizontal: Spacing.md,
    justifyContent:   'center',
  },
  searchButtonText: {
    color:      '#FFFFFF',
    fontWeight: '600',
  },

  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop:        Spacing.sm,
  },
});
