// src/styles/Theme.ts

import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

//
// 1) Colors
//
export const Colors = {
  primary:       '#F97316',  // Orange-500
  primaryLight:  '#FDE6D0',  // Orange-200
  primaryDark:   '#EA580C',  // Orange-600
  secondary:     '#10B981',  // Emerald-500
  secondaryLight: '#D1FAE5', // Emerald-200
  background:    '#FFFFFF',
  backgroundAlt: '#F5F5F5',  // Gray-100
  surface:       '#FAFAFA',  // Gray-50
  border:        '#E5E5E5',
  borderLight:   '#F3F4F6',  // Gray-100
  textDark:      '#1F2937',
  textMuted:     '#6B7280',
  textLight:     '#9CA3AF',  // Gray-400
  accent:        '#007AFF',  // (optional “link”/“filter” text)
  error:         '#DC2626',
  errorLight:    '#FEF2E2',
  success:       '#10B981',
  successLight:  '#D1FAE5',
  warning:       '#F59E0B',
  warningLight:  '#FEF3C7',
  shadow:        '#000000',
};

//
// 2) Typography (font sizes + weights)
//
export const Typography = {
  h1:    { fontSize: 32, fontWeight: '700', lineHeight: 40 } as TextStyle,
  h2:    { fontSize: 28, fontWeight: '700', lineHeight: 36 } as TextStyle,
  h3:    { fontSize: 24, fontWeight: '600', lineHeight: 32 } as TextStyle,
  h4:    { fontSize: 20, fontWeight: '600', lineHeight: 28 } as TextStyle,
  body:  { fontSize: 16, fontWeight: '400', lineHeight: 24 } as TextStyle,
  bodyLarge: { fontSize: 18, fontWeight: '400', lineHeight: 26 } as TextStyle,
  label: { fontSize: 14, fontWeight: '500', lineHeight: 20 } as TextStyle,
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 } as TextStyle,
  small: { fontSize: 10, fontWeight: '400', lineHeight: 14 } as TextStyle,
};

//
// 3) Spacing (multiples of 4px)
//
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

//
// 4) Reusable fragments (CommonStyles)
//
export const CommonStyles = StyleSheet.create({
  //
  // 4a) A full-screen, centered container for loading/error/empty states
  //
  centeredContainer: {
    flex:              1,
    justifyContent:    'center',
    alignItems:        'center',
    backgroundColor:   Colors.background,
    paddingHorizontal: Spacing.md,
  } as ViewStyle,

  //
  // 4b) A semi-transparent overlay (for spinners, modals, etc.)
  //
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent:  'center',
    alignItems:      'center',
  } as ViewStyle,

  //
  // 4c) A “pill” style for price tags / badges
  //
  pricePill: {
    alignSelf:         'flex-start',
    backgroundColor:   Colors.primary,
    borderRadius:      18,
    paddingVertical:   Spacing.xs * 1.5,   // ≈6px
    paddingHorizontal: Spacing.sm * 0.75,  // ≈6px
    marginBottom:      Spacing.sm,
  } as ViewStyle,
  pricePillText: {
    color:      '#FFFFFF',
    fontSize:   15,
    fontWeight: '600',
  } as TextStyle,

  //
  // 4d) A primary “orange” button (and its disabled state)
  //
  primaryButton: {
    backgroundColor:   Colors.primary,
    borderRadius:      30,
    alignItems:        'center',
    justifyContent:    'center',
    paddingVertical:   Spacing.sm * 2,     // 16px vertically
    paddingHorizontal: Spacing.md * 2,     // ← add generous horizontal padding
    marginVertical:    Spacing.md,         // Vertical spacing around every primary button
    elevation:         2,                  // Android shadow
    shadowColor:       '#000',             // iOS shadow
    shadowOffset:      { width: 0, height: 2 },
    shadowOpacity:     0.15,
    shadowRadius:      4,
  } as ViewStyle,
  
  primaryButtonDisabled: {
    backgroundColor: Colors.primaryLight,
  } as ViewStyle,

  primaryButtonText: {
    color:      '#FFFFFF',
    fontSize:   16,
    fontWeight: '600',
  } as TextStyle,

  //
  // 4e) A light-gray footer container that sticks to the bottom
  //
  footerContainer: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    backgroundColor: Colors.backgroundAlt,
    borderTopWidth:  1,
    borderTopColor:  Colors.border,
    padding:         Spacing.md,
  } as ViewStyle,

  //
  // 4f) A light-colored, semi-transparent error banner
  //
  errorBanner: {
    backgroundColor:   Colors.errorLight,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
    paddingVertical:   Spacing.sm,
    paddingHorizontal: Spacing.sm,
  } as ViewStyle,
  errorText: {
    color:     Colors.error,
    textAlign: 'center',
  } as TextStyle,

  //
  // 4g) A simple “empty state” text style (optional)
  //
  emptyText: {
    ...Typography.body,
    color:        Colors.textMuted,
    textAlign:    'center',
    marginBottom: Spacing.md,
  } as TextStyle,

  //
  // 4h) Toast container & text (for "added to cart" slide-up)
  //
  toastContainer: {
    position:         'absolute',
    left:             0,
    right:            0,
    bottom:           0,
    backgroundColor:  Colors.primary,      // orange background
    paddingVertical:  Spacing.sm,
    alignItems:       'center',
  } as ViewStyle,
  toastText: {
    color:      '#FFFFFF',
    fontSize:   16,
    fontWeight: '500',
  } as TextStyle,

  //
  // 4i) Enhanced card styles with better shadows and animations
  //
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.sm,
    margin: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,

  cardPressed: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    transform: [{ scale: 0.98 }],
  } as ViewStyle,

  //
  // 4j) Secondary button styles
  //
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm * 1.5,
    paddingHorizontal: Spacing.md * 2,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.sm,
  } as ViewStyle,

  secondaryButtonText: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,

  //
  // 4k) Quick add button for product cards
  //
  quickAddButton: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,

  quickAddButtonText: {
    color: Colors.background,
    fontSize: 20,
    fontWeight: '700',
  } as TextStyle,

  //
  // 4l) Skeleton loading styles
  //
  skeleton: {
    backgroundColor: Colors.borderLight,
    borderRadius: 8,
  } as ViewStyle,

  skeletonText: {
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    height: 16,
    marginVertical: 2,
  } as TextStyle,

  });

//
// 5) Animation durations
//
export const Animations = {
  fast: 150,
  normal: 300,
  slow: 500,
};
