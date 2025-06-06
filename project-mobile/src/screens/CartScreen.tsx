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
import type { BottomTabScreenProps }  from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootTabParamList, RootStackParamList } from '../navigation/AppNavigator';

import { Colors, Typography, Spacing, CommonStyles } from '../styles/Theme';

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

  //
  // 1) Empty‐state
  //
  if (items.length === 0) {
    return (
      <SafeAreaView style={CommonStyles.centeredContainer}>
        <Text style={CommonStyles.emptyText}>
          Your cart is empty.
        </Text>

        {/* “Continue Shopping” now uses the theme’s primaryButton styles,
            including horizontal padding from Theme.ts */}
        <TouchableOpacity
          style={CommonStyles.primaryButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={CommonStyles.primaryButtonText}>
            Continue Shopping
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  //
  // 2) Render each cart item
  //
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

        <View style={{ width: Spacing.sm * 1.5 }} />  {/* 12px */}

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

        <View style={{ width: Spacing.sm * 1.5 }} />  {/* 12px */}

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
        <View style={CommonStyles.errorBanner}>
          <Text style={CommonStyles.errorText}>{error}</Text>
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

      {/* 5) Footer */}
      <View style={styles.footer}>
        <Text style={[Typography.h2, { color: Colors.textDark, marginBottom: Spacing.sm }]}>
          Subtotal: {subtotal.toFixed(2)} {items[0]?.price.currencyCode}
        </Text>
        {!checkoutUrl && (
          <Text style={[Typography.label, { color: Colors.error, marginBottom: Spacing.sm }]}>
            Add at least one item to enable checkout.
          </Text>
        )}
        <TouchableOpacity
          style={[
            CommonStyles.primaryButton,
            (!checkoutUrl || isUpdating) && CommonStyles.primaryButtonDisabled,
          ]}
          disabled={!checkoutUrl || isUpdating}
          onPress={() => navigation.getParent()?.navigate('Checkout')}
        >
          <Text style={CommonStyles.primaryButtonText}>
            Proceed to Checkout
          </Text>
        </TouchableOpacity>
      </View>

      {/* 6) Overlay spinner */}
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
    flexGrow:      0,            // shrink‐wrap items
    paddingBottom: Spacing.xl,   // leave room for footer
  },

  //
  // Item Row
  //
  itemRow: {
    flexDirection:     'row',
    paddingVertical:   Spacing.sm * 1.5,  // 12px
    paddingHorizontal: Spacing.md,        // 16px
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
    marginBottom: Spacing.xs,  // 4px
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
    marginLeft: Spacing.sm * 1.5, // 12px
  },
  removeButtonText: {
    ...Typography.label,
    color:      Colors.error,
    fontWeight: '600',
  },

  //
  // Footer
  //
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

  //
  // Overlay spinner
  //
  updatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent:  'center',
    alignItems:      'center',
  },
});
