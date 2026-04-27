// src/components/SkeletonLoader.tsx

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';

// Theme imports
import { Colors, Spacing, Typography } from '../styles/Theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.45;

interface SkeletonCardProps {
  style?: any;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, []);

  const interpolatedColor = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [Colors.borderLight, Colors.surface, Colors.borderLight],
  });

  return (
    <View style={[styles.card, style]}>
      <Animated.View style={[styles.image, { backgroundColor: interpolatedColor }]} />
      <Animated.View style={[styles.text, { backgroundColor: interpolatedColor }]} />
      <Animated.View style={[styles.price, { backgroundColor: interpolatedColor }]} />
    </View>
  );
};

interface SkeletonCategoryProps {
  style?: any;
}

export const SkeletonCategory: React.FC<SkeletonCategoryProps> = ({ style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, []);

  const interpolatedColor = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [Colors.borderLight, Colors.surface, Colors.borderLight],
  });

  return (
    <View style={[styles.categoryContainer, style]}>
      <Animated.View style={[styles.categoryImage, { backgroundColor: interpolatedColor }]} />
      <Animated.View style={[styles.categoryText, { backgroundColor: interpolatedColor }]} />
    </View>
  );
};

interface SkeletonListProps {
  count?: number;
  horizontal?: boolean;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ 
  count = 3, 
  horizontal = false 
}) => {
  return (
    <View style={[horizontal && styles.horizontalList]}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    margin: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.sm,
    alignItems: 'flex-start',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  text: {
    width: '100%',
    height: 20,
    borderRadius: 4,
    marginBottom: Spacing.xs,
  },
  price: {
    width: '60%',
    height: 16,
    borderRadius: 4,
  },
  categoryContainer: {
    alignItems: 'center',
    width: 80,
  },
  categoryImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: Spacing.sm,
  },
  categoryText: {
    width: 50,
    height: 14,
    borderRadius: 4,
  },
  horizontalList: {
    flexDirection: 'row',
  },
});
