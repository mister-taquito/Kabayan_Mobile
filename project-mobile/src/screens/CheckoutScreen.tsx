// src/screens/CheckoutScreen.tsx

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Button,
  Linking,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useCart } from '../context/CartContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export default function CheckoutScreen({ navigation, route }: Props) {
  const { checkoutUrl: contextUrl, loading } = useCart();
  const [isAttempting, setIsAttempting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefer a deep-linked URL passed in from navigation; otherwise use the cart context.
  const checkoutUrl = useMemo(
    () => route.params?.url ?? contextUrl ?? null,
    [route.params?.url, contextUrl]
  );

  const openCheckout = useCallback(async () => {
    if (!checkoutUrl) return;
    setIsAttempting(true);
    setError(null);
    try {
      const supported = await Linking.canOpenURL(checkoutUrl);
      if (!supported) throw new Error('Cannot open this URL.');
      await Linking.openURL(checkoutUrl);
    } catch (err) {
      console.error('Linking error', err);
      setError('Unable to open checkout. Please try again.');
    } finally {
      setIsAttempting(false);
    }
  }, [checkoutUrl]);

  // ---- States --------------------------------------------------------------

  // A: Still preparing/bootstrapping the cart and we don't yet have a URL
  if (loading && !checkoutUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={[styles.infoText, { marginTop: 12 }]}>
            Preparing your cart…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // B: No checkout URL => empty cart (or not initialized)
  if (!checkoutUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.infoText}>
            Add at least one item to begin checkout.
          </Text>
          <View style={{ marginTop: 12 }}>
            <Button
              title="Back to Cart"
              onPress={() => navigation.getParent()?.navigate('Cart')}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // C: We have a valid checkoutUrl
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        {isAttempting ? (
          <ActivityIndicator size="large" />
        ) : (
          <Button title="Open Checkout" onPress={openCheckout} />
        )}
      </View>

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

/**
 * If you prefer an in-app experience, install:
 *   npx expo install react-native-webview
 * and render <WebView source={{ uri: checkoutUrl }} /> instead of Linking.
 */

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
