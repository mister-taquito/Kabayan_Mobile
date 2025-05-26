import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import axios from 'axios';
import productsStub from '../data/products.json';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export default function HomeScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get<Product[]>('https://example.com/api/products');
        setProducts(res.data);
      } catch (err) {
        // Fallback to stub data on error
        setProducts(productsStub);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>New Arrivals</Text>
      <FlatList
        horizontal
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Details', { productId: item.id })}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>₱{item.price}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '600', marginLeft: 16, marginBottom: 8 },
  card: {
    width: 120,
    marginHorizontal: 8,
    alignItems: 'center'
  },
  image: { width: 100, height: 100, borderRadius: 8 },
  name: { marginTop: 8, fontSize: 14 },
  price: { fontSize: 14, fontWeight: '500', marginTop: 4 }
});
