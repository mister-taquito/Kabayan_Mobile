// src/screens/CheckoutScreen.tsx

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Button,
  Linking,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useCart } from '../context/CartContext';
import { AnimatedButton } from '../components/AnimatedButton';
import { Colors, Typography, Spacing } from '../styles/Theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export default function CheckoutScreen({ navigation, route }: Props) {
  const { checkoutUrl: contextUrl, loading, items } = useCart();
  const [isAttempting, setIsAttempting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefer a deep-linked URL passed in from navigation; otherwise use the cart context.
  const checkoutUrl = useMemo(
    () => route.params?.url ?? contextUrl ?? null,
    [route.params?.url, contextUrl]
  );

  // Calculate subtotal
  const { subtotal, itemCount, currency } = useMemo(() => {
    const sum = items.reduce(
      (acc, item) => acc + parseFloat(item.price.amount) * item.quantity,
      0
    );
    const count = items.reduce((acc, item) => acc + item.quantity, 0);
    return { 
      subtotal: sum, 
      itemCount: count,
      currency: items[0]?.price.currencyCode || 'USD'
    };
  }, [items]);

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
              onPress={() => navigation.navigate('Tabs' as never)}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // C: We have a valid checkoutUrl
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          {/* Cart Items */}
          <View style={styles.itemsList}>
            {items.map((item, index) => (
              <View key={item.id} style={styles.summaryItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemDetails}>
                    {item.quantity} × {parseFloat(item.price.amount).toFixed(2)} {currency}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {(parseFloat(item.price.amount) * item.quantity).toFixed(2)} {currency}
                </Text>
              </View>
            ))}
          </View>

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total ({itemCount} items)</Text>
            <Text style={styles.totalAmount}>
              {subtotal.toFixed(2)} {currency}
            </Text>
          </View>
        </View>

        {/* Checkout Button */}
        <View style={styles.checkoutSection}>
          {isAttempting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.background} />
              <Text style={styles.loadingText}>Opening checkout...</Text>
            </View>
          ) : (
            <AnimatedButton
              title="Proceed to Checkout"
              onPress={openCheckout}
              icon="arrow-forward-outline"
              iconPosition="right"
              loading={isAttempting}
              style={styles.checkoutButton}
            />
          )}
        </View>
      </ScrollView>

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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.textDark,
    fontWeight: '600',
  },
  // Summary Card
  summaryCard: {
    backgroundColor: Colors.background,
    margin: Spacing.md,
    borderRadius: 12,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryTitle: {
    ...Typography.h3,
    color: Colors.textDark,
    fontWeight: '600',
  },
  itemCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  itemCountText: {
    ...Typography.label,
    color: Colors.primary,
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },
  // Items List
  itemsList: {
    marginBottom: Spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  itemInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemName: {
    ...Typography.body,
    color: Colors.textDark,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  itemDetails: {
    ...Typography.label,
    color: Colors.textMuted,
  },
  itemTotal: {
    ...Typography.body,
    color: Colors.textDark,
    fontWeight: '600',
  },
  // Pricing
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  subtotalLabel: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  subtotalAmount: {
    ...Typography.body,
    color: Colors.textDark,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  totalLabel: {
    ...Typography.h3,
    color: Colors.textDark,
    fontWeight: '600',
  },
  totalAmount: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '700',
  },
  // Checkout Section
  checkoutSection: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.background,
    marginLeft: Spacing.sm,
    fontWeight: '600',
  },
  checkoutButton: {
    marginBottom: Spacing.sm,
  },
  // Error Banner
  errorBanner: {
    backgroundColor: Colors.errorLight,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    borderRadius: 8,
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.md,
    right: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    textAlign: 'center',
    fontWeight: '500',
  },
});
