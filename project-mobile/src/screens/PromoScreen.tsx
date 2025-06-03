// src/screens/PromoScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function PromoScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Special Promotion!</Text>
      {/* ...your promo content... */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700' },
});
