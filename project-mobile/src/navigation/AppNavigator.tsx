// src/navigation/AppNavigator.tsx

import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator }   from '@react-navigation/bottom-tabs';
import { Ionicons }                   from '@expo/vector-icons';

import HomeScreen          from '../screens/HomeScreen';
import SearchScreen        from '../screens/SearchScreen';
import CartScreen          from '../screens/CartScreen';
import CategoryScreen      from '../screens/CategoryScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
// import PromoScreen       from '../screens/PromoScreen'; // still disabled
import CheckoutScreen      from '../screens/CheckoutScreen';
import SettingsScreen      from '../screens/SettingsScreen';

// ⬇️ Cart context/hook (from your migration pack or your app)
// If you used the migration pack's hook, use:  import { useCart } from '../hooks/useCart';
import { useCart } from '../context/CartContext';

export type RootStackParamList = {
  Tabs:          undefined;
  ProductDetail: { handle: string; variantId?: string }; // variant optional (Cart API uses variants)
  // Promo:       undefined;
  Checkout:      { url?: string } | undefined;          // checkoutUrl can be passed or read from context
};

export type RootTabParamList = {
  Home:      undefined;
  Search:    undefined;
  Cart:      undefined;
  Category:  { categoryId: string };
  Settings:  undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<RootTabParamList>();

/** Cart icon with live badge (sum of line quantities) */
function CartTabIcon({ color }: { color: string }) {
  // swap to `useCart()` if that's your hook name
  const { cart } = useCart();
  const count =
    cart?.lines?.edges?.reduce((sum: number, e: any) => sum + (e?.node?.quantity ?? 0), 0) ?? 0;

  return (
    <View style={{ width: 30, height: 28, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="cart-outline" size={28} color={color} />
      {count > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -8,
            minWidth: 18,
            height: 18,
            paddingHorizontal: 4,
            borderRadius: 9,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#E76F51',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      )}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown:     false,
        tabBarShowLabel: false,
        tabBarItemStyle: { flex: 1, alignItems: 'center' },
        tabBarIcon: ({ color }) => {
          let icon: keyof typeof Ionicons.glyphMap = 'ellipse-outline';
          switch (route.name) {
            case 'Home':     icon = 'home-outline';    break;
            case 'Search':   icon = 'search-outline';  break;
            case 'Category': icon = 'list-outline';    break;
            case 'Settings': icon = 'settings-outline';break;
            case 'Cart':     return <CartTabIcon color={color} />; // ← Cart with badge
          }
          return <Ionicons name={icon} size={28} color={color} />;
        },
        tabBarActiveTintColor:   '#E76F51',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height:          64,
          paddingTop:      8,
          backgroundColor: '#fff',
          borderTopColor:  '#eee',
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Search"   component={SearchScreen} />
      <Tab.Screen name="Cart"     component={CartScreen} />
      <Tab.Screen
        name="Category"
        component={CategoryScreen}
        initialParams={{ categoryId: '' }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{ headerShown: false }}
    >
      {/* bottom tabs */}
      <Stack.Screen name="Tabs" component={MainTabs} />

      {/* push-ons */}
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerShown: true, title: 'Details' }}
      />

      {/* Checkout opens Shopify checkoutUrl (from param or from cart context) */}
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: true, title: 'Checkout' }}
      />
    </Stack.Navigator>
  );
}
