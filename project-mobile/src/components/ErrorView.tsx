// src/components/ErrorView.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Theme imports
import { Colors, Typography, Spacing, CommonStyles } from '../styles/Theme';

interface ErrorViewProps {
  error?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  subtitle?: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  error = 'Something went wrong',
  onRetry,
  isRetrying = false,
  icon = 'alert-circle-outline',
  title = 'Oops!',
  subtitle,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons 
          name={icon} 
          size={64} 
          color={Colors.textMuted} 
          style={styles.icon}
        />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {subtitle || error}
        </Text>
        
        {onRetry && (
          <TouchableOpacity
            style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
            onPress={onRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color={Colors.background} />
            ) : (
              <>
                <Ionicons 
                  name="refresh-outline" 
                  size={20} 
                  color={Colors.background} 
                  style={styles.retryIcon}
                />
                <Text style={styles.retryText}>Try Again</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

interface NetworkErrorProps {
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ 
  onRetry, 
  isRetrying 
}) => (
  <ErrorView
    icon="wifi-outline"
    title="No Connection"
    subtitle="Please check your internet connection and try again."
    onRetry={onRetry}
    isRetrying={isRetrying}
  />
);

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  subtitle?: string;
  action?: {
    text: string;
    onPress: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'basket-outline',
  title = 'Nothing here',
  subtitle = 'Check back later for new items.',
  action,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons 
          name={icon} 
          size={64} 
          color={Colors.textMuted} 
          style={styles.icon}
        />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        
        {action && (
          <TouchableOpacity style={styles.actionButton} onPress={action.onPress}>
            <Text style={styles.actionText}>{action.text}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  icon: {
    marginBottom: Spacing.lg,
    opacity: 0.6,
  },
  title: {
    ...Typography.h3,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  retryButton: {
    ...CommonStyles.primaryButton,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonDisabled: {
    ...CommonStyles.primaryButtonDisabled,
  },
  retryIcon: {
    marginRight: Spacing.xs,
  },
  retryText: {
    ...CommonStyles.primaryButtonText,
  },
  actionButton: {
    ...CommonStyles.secondaryButton,
  },
  actionText: {
    ...CommonStyles.secondaryButtonText,
  },
});
