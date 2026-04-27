// src/components/AnimatedButton.tsx

import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Theme imports
import { Colors, Typography, Spacing, CommonStyles, Animations } from '../styles/Theme';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [opacityAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: Animations.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: Animations.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: Animations.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: Animations.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (disabled || loading) return;
    onPress();
  };

  const getButtonStyle = () => {
    const baseStyle = [
      styles.button,
      styles[variant],
      styles[size],
      { transform: [{ scale: scaleAnim }] },
      { opacity: opacityAnim },
      disabled && styles.disabled,
      style,
    ];
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [
      styles.text,
      styles[`${variant}Text`],
      styles[`${size}Text`],
      disabled && styles.disabledText,
      textStyle,
    ];
    return baseStyle;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? Colors.background : Colors.primary} 
        />
      );
    }

    const iconElement = icon ? (
      <Ionicons 
        name={icon} 
        size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
        color={variant === 'primary' ? Colors.background : Colors.primary}
        style={[styles.icon, iconPosition === 'right' && styles.iconRight]}
      />
    ) : null;

    return (
      <>
        {iconPosition === 'left' && iconElement}
        <Text style={getTextStyle()}>{title}</Text>
        {iconPosition === 'right' && iconElement}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base button styles
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    flexDirection: 'row',
  },

  // Variants
  primary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  secondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  // Sizes
  small: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 56,
  },

  // Disabled state
  disabled: {
    backgroundColor: Colors.borderLight,
    borderColor: Colors.borderLight,
    shadowColor: 'transparent',
    elevation: 0,
  },

  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: Colors.background,
  },
  secondaryText: {
    color: Colors.textDark,
  },
  outlineText: {
    color: Colors.primary,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    color: Colors.textMuted,
  },

  // Icon styles
  icon: {
    marginRight: Spacing.xs,
  },
  iconRight: {
    marginRight: 0,
    marginLeft: Spacing.xs,
  },
});
