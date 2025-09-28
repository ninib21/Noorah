import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const gradientByVariant = {
  primary: theme.colors.gradientAurora,
  secondary: theme.colors.gradientNebula,
} as const;

const sizeStyles = {
  small: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 40,
  },
  medium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 52,
  },
  large: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: 62,
  },
} as const;

const textSizeStyles = {
  small: { fontSize: theme.typography.fontSize.sm },
  medium: { fontSize: theme.typography.fontSize.base },
  large: { fontSize: theme.typography.fontSize.lg },
} as const;

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  accessibilityHint,
  accessibilityLabel,
}) => {
  const isGradient = variant === 'primary' || variant === 'secondary';

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.white}
        />
      );
    }

    return (
      <View style={styles.content}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text
          style={[
            styles.textBase,
            textSizeStyles[size],
            variant === 'outline' || variant === 'ghost'
              ? styles.textOutline
              : styles.textFilled,
            textStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.touchable, style, disabled && styles.touchableDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      {isGradient ? (
        <LinearGradient
          colors={
            variant === 'primary'
              ? gradientByVariant.primary
              : gradientByVariant.secondary
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradientButton,
            sizeStyles[size],
            disabled && styles.gradientDisabled,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.solidButton,
            sizeStyles[size],
            variant === 'outline' ? styles.outline : styles.ghost,
            disabled && styles.solidDisabled,
          ]}
        >
          {renderContent()}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  touchableDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.glow,
  },
  gradientDisabled: {
    opacity: 0.7,
  },
  solidButton: {
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  solidDisabled: {
    opacity: 0.65,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  textBase: {
    fontFamily: theme.typography.fontFamily.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  textFilled: {
    color: theme.colors.white,
  },
  textOutline: {
    color: theme.colors.primary,
  },
});

