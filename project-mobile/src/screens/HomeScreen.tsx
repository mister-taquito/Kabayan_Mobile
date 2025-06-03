// src/screens/HomeScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { shopifyRequest }        from '../api/shopify';
import { GET_HOME_PRODUCTS }     from '../api/queries';
import { Header }                from '../components/Header';
import { ProductCard, Product }  from '../components/ProductCard';

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { RootTabParamList }       from '../navigation/AppNavigator';

type HomeProps = BottomTabScreenProps<RootTabParamList, 'Home'>;

const { width } = Dimensions.get('window');
const WRAPPER_MARGIN = 16;
const IMAGE_WIDTH    = width - WRAPPER_MARGIN * 2;
const HERO_ASPECT    = 2;        // width : height ratio
const HERO_HEIGHT    = IMAGE_WIDTH / HERO_ASPECT;
const CARD_WIDTH     = width * 0.45;

const categories = [
  { id: 'snacks',  title: 'Snacks',  image: require('../../assets/SnS banner.png') },
  { id: 'sauces-and-condiments',  title: 'Sauces',  image: require('../../assets/CnS banner.png') },
  { id: 'alcohol-and-tobacco', title: 'Alcohol', image: require('../../assets/AT Banner.png') },
];

export default function HomeScreen({ navigation }: HomeProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data: any = await shopifyRequest(GET_HOME_PRODUCTS);
        const mapped: Product[] = data.products.edges.map((e: any) => {
          const node = e.node;
          return {
            id:     node.id,
            name:   node.title,
            image:  node.featuredImage?.url || '',
            price:  parseFloat(node.variants.edges[0].node.price.amount),
            handle: node.handle,
          };
        });
        setProducts(mapped);
      } catch (err) {
        console.error('Shopify fetch error', err);
        setError('Unable to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
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
      >
        {/* Hero Banner: push “Promo” onto the stack */}
        <TouchableOpacity
          style={styles.heroWrapper}
          onPress={() => navigation.getParent()?.navigate('Promo')}
        >
          <Image
            source={require('../../assets/banner.png')}
            style={styles.heroImage}
          />
        </TouchableOpacity>

        {/* Categories: switch tabs to “Category” */}
        <View style={styles.categoryWrapper}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryButton}
              onPress={() =>
                // ← Use navigation.navigate because Category is a Tab screen:
                navigation.navigate('Category', { categoryId: cat.id })
              }
            >
              <Image source={cat.image} style={styles.categoryImage} />
              <Text style={styles.categoryText}>{cat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* New Arrivals: push “ProductDetail” onto the stack */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New Arrivals</Text>
          <FlatList
            horizontal
            data={newArrivals}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
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
        </View>

        {/* Trending: same pattern */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending</Text>
          <FlatList
            horizontal
            data={trending}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#fafafa' },
  scrollContent: { paddingBottom: 32 },

  center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText:     { fontSize: 16, color: '#900', textAlign: 'center', padding: 16 },

  heroWrapper: {
    marginTop: WRAPPER_MARGIN,
    marginHorizontal: WRAPPER_MARGIN,
    marginBottom: 24,
    alignItems: 'center',
  },
  heroImage: {
    width: IMAGE_WIDTH,
    height: HERO_HEIGHT,
    borderRadius: 16,
  },

  categoryWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: WRAPPER_MARGIN,
    marginBottom: 32,
  },
  categoryButton: { alignItems: 'center', width: 80 },
  categoryImage:  { width: 64, height: 64, borderRadius: 32, marginBottom: 8 },
  categoryText:   { fontSize: 14, fontWeight: '500', textAlign: 'center' },

  section:        { marginBottom: 32 },
  sectionTitle:   {
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: WRAPPER_MARGIN,
    marginBottom: 12,
  },

  carousel:      { paddingLeft: WRAPPER_MARGIN },
});
