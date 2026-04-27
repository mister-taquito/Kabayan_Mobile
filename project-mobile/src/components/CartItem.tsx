// src/components/CartItem.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CartItem as CartItemType } from '../context/CartContext';
import { Colors, Typography, Spacing, Animations } from '../styles/Theme';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  isUpdating?: boolean;
}

export const CartItemComponent: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const scaleAnim = new Animated.Value(1);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 99 || isUpdating) return;
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: Animations.fast,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: Animations.fast,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await onUpdateQuantity(item.id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemove = async () => {
    if (isUpdating || isDeleting) return;
    
    setIsDeleting(true);
    
    Animated.timing(scaleAnim, {
      toValue: 0.8,
      duration: Animations.normal,
      useNativeDriver: true,
    }).start();

    try {
      await onRemove(item.id);
    } catch (error) {
      console.error('Error removing item:', error);
      // Reset animation if removal failed
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: Animations.normal,
        useNativeDriver: true,
      }).start();
      setIsDeleting(false);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: isDeleting ? 0.5 : 1,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.itemPrice}>
            {parseFloat(item.price.amount).toFixed(2)} {item.price.currencyCode}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              (item.quantity <= 1 || isUpdating) && styles.quantityButtonDisabled,
            ]}
            disabled={item.quantity <= 1 || isUpdating}
            onPress={() => handleQuantityChange(item.quantity - 1)}
          >
            <Ionicons
              name="remove-outline"
              size={20}
              color={
                item.quantity <= 1 || isUpdating
                  ? Colors.textMuted
                  : Colors.primary
              }
            />
          </TouchableOpacity>

          <View style={styles.quantityContainer}>
            <Text style={styles.quantityText}>{item.quantity}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.quantityButton,
              isUpdating && styles.quantityButtonDisabled,
            ]}
            disabled={isUpdating}
            onPress={() => handleQuantityChange(item.quantity + 1)}
          >
            <Ionicons
              name="add-outline"
              size={20}
              color={isUpdating ? Colors.textMuted : Colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            disabled={isUpdating}
            onPress={handleRemove}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    ...Typography.caption,
    color: Colors.background,
    marginTop: Spacing.xs,
  },
  content: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.background,
  },
  itemInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  itemTitle: {
    ...Typography.body,
    color: Colors.textDark,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  itemVariant: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  itemPrice: {
    ...Typography.label,
    color: Colors.primary,
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: Spacing.xs,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityContainer: {
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  quantityText: {
    ...Typography.label,
    color: Colors.textDark,
    fontWeight: '600',
  },
  removeButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
