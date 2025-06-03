// src/screens/CheckoutScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Linking,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useCart } from '../context/CartContext';

export default function CheckoutScreen({ navigation }: any) {
  const { checkoutUrl } = useCart();
  const [isAttempting, setIsAttempting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const openCheckout = async () => {
    if (!checkoutUrl) return;
    setIsAttempting(true);
    setError(null);

    try {
      const supported = await Linking.canOpenURL(checkoutUrl);
      if (!supported) {
        throw new Error('Cannot open this URL.');
      }
      await Linking.openURL(checkoutUrl);
    } catch (err) {
      console.error('Linking error', err);
      setError('Unable to open checkout. Please try again.');
    } finally {
      setIsAttempting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!checkoutUrl && (
        <View style={styles.center}>
          <Text style={styles.infoText}>
            Add at least one item to begin checkout.
          </Text>
          <View style={{ marginTop: 12 }}>
            <Button title="Back to Cart" onPress={() => navigation.navigate('Cart')} />
          </View>
        </View>
      )}

      {checkoutUrl && (
        <View style={styles.center}>
          {isAttempting ? (
            <ActivityIndicator size="large" />
          ) : (
            <Button title="Open Checkout" onPress={openCheckout} />
          )}
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <View style={{ marginTop: 8 }}>
            <Button title="Retry" onPress={openCheckout} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#fff' },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoText:    { fontSize: 16, color: '#666', textAlign: 'center', paddingHorizontal: 16 },
  errorBanner: {
    backgroundColor: '#fee',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 4,
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  errorText:   { color: '#900', textAlign: 'center' },
});
