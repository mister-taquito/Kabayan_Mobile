// src/screens/SettingsScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Typography, Spacing, CommonStyles } from '../styles/Theme';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Example handler for “Change Password”
  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Redirect to change password flow.');
  };

  // Example handler for “Privacy Policy”
  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Open privacy policy link.');
  };

  // Example handler for “Sign Out”
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => {/* sign out logic */} },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header */}
        <Text style={styles.header}>Settings</Text>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              thumbColor={darkMode ? Colors.primary : '#f4f3f4'}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Enable Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              thumbColor={notifications ? Colors.primary : '#f4f3f4'}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            />
          </View>
          <TouchableOpacity style={styles.linkRow} onPress={() => Alert.alert('Notification Settings', 'Open system notification settings.')}>
            <Text style={styles.linkText}>Notification Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.linkRow} onPress={handleChangePassword}>
            <Text style={styles.linkText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => Alert.alert('Manage Email', 'Open email management flow.')}>
            <Text style={styles.linkText}>Manage Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => Alert.alert('Manage Payment', 'Open payment methods.')}>
            <Text style={styles.linkText}>Payment Methods</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <TouchableOpacity style={styles.linkRow} onPress={handlePrivacyPolicy}>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => Alert.alert('Terms of Service', 'Open terms of service link.')}>
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
          <View style={styles.versionRow}>
            <Text style={styles.label}>App Version</Text>
            <Text style={[Typography.body, { color: Colors.textMuted }]}>1.0.0</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <TouchableOpacity style={CommonStyles.primaryButton} onPress={handleSignOut}>
            <Text style={CommonStyles.primaryButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: Colors.backgroundAlt,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl, // Extra bottom padding for scroll
  },
  header: {
    ...Typography.h1,
    color:        Colors.textDark,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
    color:        Colors.textDark,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingVertical:  Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: {
    ...Typography.body,
    color: Colors.textDark,
  },
  linkRow: {
    paddingVertical:  Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  linkText: {
    ...Typography.body,
    color: Colors.accent,
  },
  versionRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  signOutSection: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
});
