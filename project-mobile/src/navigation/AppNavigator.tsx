// src/navigation/AppNavigator.tsx (when you move NavigationContainer up)

import React from 'react';
import { createNativeStackNavigator }     from '@react-navigation/native-stack';
import { createBottomTabNavigator }       from '@react-navigation/bottom-tabs';
import { Ionicons }                       from '@expo/vector-icons';

import HomeScreen          from '../screens/HomeScreen';
import SearchScreen        from '../screens/SearchScreen';
import CartScreen          from '../screens/CartScreen';
import CategoryScreen      from '../screens/CategoryScreen';
import ProductListScreen   from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import PromoScreen         from '../screens/PromoScreen';
import CheckoutScreen      from '../screens/CheckoutScreen';
import SettingsScreen      from '../screens/SettingsScreen';

export type RootStackParamList = {
  Tabs:           undefined;
  ProductDetail:  { handle: string };
  Promo:          undefined;
  Checkout:       undefined;
};

export type RootTabParamList = {
  Home:       undefined;
  Search:     undefined;
  Cart:       undefined;
  Category:   { categoryId: string };
  Products:   undefined;
  Settings:   undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<RootTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: { flex: 1, alignItems: 'center' },
        tabBarIcon: ({ color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse-outline';
          switch (route.name) {
            case 'Home':     iconName = 'home-outline';     break;
            case 'Search':   iconName = 'search-outline';   break;
            case 'Cart':     iconName = 'cart-outline';     break;
            case 'Category': iconName = 'list-outline';     break;
            case 'Products': iconName = 'pricetag-outline'; break;
            case 'Settings': iconName = 'settings-outline'; break;
          }
          return <Ionicons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor:   '#E76F51',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 64,
          paddingTop: 8,
          backgroundColor: '#fff',
          borderTopColor: '#eee',
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
      <Tab.Screen name="Products" component={ProductListScreen} />
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
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerShown: true, title: 'Details' }}
      />
      <Stack.Screen
        name="Promo"
        component={PromoScreen}
        options={{ headerShown: true, title: 'Promotions' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: true, title: 'Checkout' }}
      />
    </Stack.Navigator>
  );
}
