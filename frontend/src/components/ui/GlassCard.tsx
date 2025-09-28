import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: 'soft' | 'bold';
  gradient?: readonly [string, string];
}

const gradients: Record<'soft' | 'bold', readonly [string, string]> = {
  soft: ['rgba(148, 163, 184, 0.16)', 'rgba(15, 23, 42, 0.4)'],
  bold: ['rgba(124, 58, 237, 0.35)', 'rgba(14, 165, 233, 0.25)'],
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 'soft',
  gradient,
}) => {
  const gradientColors = gradient ?? gradients[intensity];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      <View style={styles.overlay}>{children}</View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    shadowColor: theme.shadows.glow.shadowColor,
    shadowOffset: theme.shadows.glow.shadowOffset,
    shadowOpacity: theme.shadows.glow.shadowOpacity,
    shadowRadius: theme.shadows.glow.shadowRadius,
  },
  overlay: {
    backgroundColor: 'rgba(8, 5, 36, 0.35)',
    borderRadius: theme.borderRadius.lg,
  },
});

export default GlassCard;
