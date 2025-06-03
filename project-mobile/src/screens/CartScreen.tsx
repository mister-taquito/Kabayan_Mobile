// src/screens/CartScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useCart, CartItem } from '../context/CartContext';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootTabParamList, RootStackParamList } from '../navigation/AppNavigator';

type CartTabProps = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Cart'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function CartScreen({ navigation }: CartTabProps) {
  const { items, updateItem, removeItem, checkoutUrl } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate subtotal
  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
    0
  );

  // 1) Empty‐state placeholder
  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty.</Text>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.continueButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // 2) Render each line item with quantity controls
  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.itemRow}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.itemDetail}>Qty: {item.quantity}</Text>
        <Text style={styles.itemDetail}>
          {parseFloat(item.price.amount).toFixed(2)} {item.price.currencyCode}
        </Text>
      </View>

      <View style={styles.itemControls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            (item.quantity <= 1 || isUpdating) && styles.controlButtonDisabled,
          ]}
          disabled={isUpdating || item.quantity <= 1}
          onPress={async () => {
            setIsUpdating(true);
            setError(null);
            try {
              await updateItem(item.id, item.quantity - 1);
            } catch {
              setError('Unable to update quantity. Try again.');
            } finally {
              setIsUpdating(false);
            }
          }}
        >
          <Text
            style={[
              styles.controlButtonText,
              (item.quantity <= 1 || isUpdating) && styles.textDisabled,
            ]}
          >
            –
          </Text>
        </TouchableOpacity>

        {/* Space between “–” and “+” */}
        <View style={{ width: 12 }} />

        <TouchableOpacity
          style={[styles.controlButton, isUpdating && styles.controlButtonDisabled]}
          disabled={isUpdating}
          onPress={async () => {
            setIsUpdating(true);
            setError(null);
            try {
              await updateItem(item.id, item.quantity + 1);
            } catch {
              setError('Unable to update quantity. Try again.');
            } finally {
              setIsUpdating(false);
            }
          }}
        >
          <Text style={[styles.controlButtonText, isUpdating && styles.textDisabled]}>
            +
          </Text>
        </TouchableOpacity>

        {/* Space between “+” and “Remove” */}
        <View style={{ width: 12 }} />

        <TouchableOpacity
          style={styles.removeButton}
          disabled={isUpdating}
          onPress={async () => {
            setIsUpdating(true);
            setError(null);
            try {
              await removeItem(item.id);
            } catch {
              setError('Unable to remove item. Try again.');
            } finally {
              setIsUpdating(false);
            }
          }}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 3) Error banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 4) List of cart items */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={<View style={{ height: 1 }} />}
      />

      {/* 5) Subtotal + “Proceed to Checkout” footer */}
      <View style={styles.footer}>
        <Text style={styles.subtotalText}>
          Subtotal: {subtotal.toFixed(2)} {items[0]?.price.currencyCode}
        </Text>
        {!checkoutUrl && (
          <Text style={styles.warningText}>
            Add at least one item to enable checkout.
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            (!checkoutUrl || isUpdating) && styles.checkoutButtonDisabled,
          ]}
          disabled={!checkoutUrl || isUpdating}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>

      {/* 6) Overlay spinner while updating */}
      {isUpdating && (
        <View style={styles.updatingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </SafeAreaView>
  );
}

//
// Styles
//
const ORANGE = '#F97316';
const GRAY_LIGHT = '#F5F5F5';
const GRAY_BORDER = '#E5E5E5';
const TEXT_DARK = '#1F2937';
const TEXT_MUTED = '#6B7280';
const ERROR_RED = '#DC2626';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    flexGrow: 0,         // allow the list to shrink‐wrap its items
    paddingBottom: 100,  // leave vertical space for footer
  },

  //
  // Empty‐state
  //
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: TEXT_MUTED,
    marginBottom: 20,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: ORANGE,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  //
  // Error banner
  //
  errorBanner: {
    backgroundColor: '#FEF2F2', // very light red
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  errorText: {
    color: ERROR_RED,
    textAlign: 'center',
  },

  //
  // Item row
  //
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 8,   // slightly reduced padding
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 2,  // smaller gap
  },
  itemDetail: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: ORANGE,
    borderRadius: 20,
    width: 32,     // corrected (no stray “thirtytwo”)
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    backgroundColor: '#FDE6D0', // lighter orange
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 20,
  },
  textDisabled: {
    color: '#F9C2A3', // pale text
  },
  removeButton: {
    marginLeft: 12, // same horizontal spacing as between “–” and “+”
  },
  removeButtonText: {
    color: ERROR_RED,
    fontSize: 14,
    fontWeight: '600',
  },

  //
  // Footer (sticky at bottom)
  //
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: GRAY_BORDER,
    backgroundColor: GRAY_LIGHT,
  },
  subtotalText: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: ERROR_RED,
    marginBottom: 8,
  },
  checkoutButton: {
    backgroundColor: ORANGE,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#FDE6D0',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  //
  // Updating overlay
  //
  updatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
