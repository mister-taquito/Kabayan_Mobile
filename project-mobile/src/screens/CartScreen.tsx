// src/screens/CartScreen.tsx

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart, CartItem } from '../context/CartContext';
import { CartItemComponent } from '../components/CartItem';
import { EmptyState, NetworkError } from '../components/ErrorView';
import { AnimatedButton } from '../components/AnimatedButton';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps }  from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootTabParamList, RootStackParamList } from '../navigation/AppNavigator';

import { Colors, Typography, Spacing, CommonStyles } from '../styles/Theme';

type CartTabProps = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Cart'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function CartScreen({ navigation }: CartTabProps) {
  const { items, updateItem, removeItem, checkoutUrl, loading, refresh } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate subtotal (use unit price x qty from context mapping)
  const { subtotal, currency } = useMemo(() => {
    const sum = items.reduce(
      (acc, it) => acc + parseFloat(it.price.amount) * it.quantity,
      0
    );
    return { subtotal: sum, currency: items[0]?.price.currencyCode ?? '' };
  }, [items]);

  //
  // 0) Initial loading (cart bootstrap)
  //
  if (loading && items.length === 0) {
    return (
      <SafeAreaView style={CommonStyles.centeredContainer}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  //
  // 1) Empty state
  //
  if (!loading && items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="basket-outline"
          title="Your cart is empty"
          subtitle="Add some items to get started!"
          action={{
            text: "Continue Shopping",
            onPress: () => navigation.navigate('Home'),
          }}
        />
      </SafeAreaView>
    );
  }

  // 2) Render each cart item using the enhanced component
  const renderItem = ({ item }: { item: CartItem }) => (
    <CartItemComponent
      item={item}
      onUpdateQuantity={updateItem}
      onRemove={removeItem}
      isUpdating={isUpdating}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 3) Error banner */}
      {error && (
        <View style={CommonStyles.errorBanner}>
          <Text style={CommonStyles.errorText}>{error}</Text>
        </View>
      )}

      {/* 4) List of cart items with pull-to-refresh */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        ListFooterComponent={<View style={{ height: 1 }} />}
      />

      {/* 5) Footer */}
      <View style={styles.footer}>
        <Text style={[Typography.h2, { color: Colors.textDark, marginBottom: Spacing.sm }]}>
          Subtotal: {subtotal.toFixed(2)} {currency}
        </Text>

        {!checkoutUrl && (
          <Text style={[Typography.label, { color: Colors.error, marginBottom: Spacing.sm }]}>
            Add at least one item to enable checkout.
          </Text>
        )}

        <AnimatedButton
          title={isUpdating ? 'Processing...' : 'Checkout'}
          onPress={() => navigation.getParent()?.navigate('Checkout', { url: checkoutUrl ?? undefined })}
          disabled={!checkoutUrl || isUpdating}
          loading={isUpdating}
          icon="arrow-forward-outline"
          iconPosition="right"
          style={{ marginTop: Spacing.sm }}
        />
      </View>

      {/* 6) Overlay spinner for line updates */}
      {isUpdating && (
        <View style={styles.updatingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: Colors.background,
  },
  listContent: {
    flexGrow:      0,
    paddingBottom: Spacing.xl,
  },

  // Item Row
  itemRow: {
    flexDirection:     'row',
    paddingVertical:   Spacing.sm * 1.5,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems:        'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    ...Typography.body,
    fontWeight:   '600',
    color:        Colors.textDark,
    marginBottom: Spacing.xs,
  },
  itemDetail: {
    ...Typography.label,
    color: Colors.textMuted,
  },
  itemControls: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  controlButton: {
    backgroundColor: Colors.primary,
    borderRadius:    20,
    width:           32,
    height:          32,
    justifyContent:  'center',
    alignItems:      'center',
  },
  controlButtonDisabled: {
    backgroundColor: Colors.primaryLight,
  },
  controlButtonText: {
    color:      '#FFFFFF',
    fontSize:   20,
    fontWeight: '600',
    lineHeight: 20,
  },
  textDisabled: {
    color: Colors.primaryLight,
  },
  removeButton: {
    marginLeft: Spacing.sm * 1.5,
  },
  removeButtonText: {
    ...Typography.label,
    color:      Colors.error,
    fontWeight: '600',
  },

  // Footer
  footer: {
    position:         'absolute',
    bottom:           0,
    left:             0,
    right:            0,
    backgroundColor:  Colors.backgroundAlt,
    borderTopWidth:   1,
    borderTopColor:   Colors.border,
    padding:          Spacing.md,
  },

  // Overlay spinner
  updatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent:  'center',
    alignItems:      'center',
  },
});
