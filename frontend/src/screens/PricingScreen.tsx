import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedGradientBackground, AnimatedCard } from '../components/AnimatedComponents';
import { Button } from '../components/ui/Button';
import { pricingTiers } from '../data/pricing';
import { theme } from '../styles/theme';

const PricingScreen: React.FC = () => {
  return (
    <AnimatedGradientBackground colors={theme.colors.gradientNebula}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.kicker}>Noorah Pricing Matrix</Text>
            <Text style={styles.title}>Choose your constellation of care</Text>
            <Text style={styles.subtitle}>
              Every tier stacks enhancements from the one before it. Quantum-grade safety, immersive play, and
              generational family intelligence—customised for whatever orbit your family lives in.
            </Text>
          </View>

          <View style={styles.tierGrid}>
            {pricingTiers.map((tier, index) => (
              <AnimatedCard key={tier.id} direction="up" delay={index * 120} style={[styles.card, { borderColor: tier.color }]}> 
                <View style={styles.cardHeader}>
                  <Text style={styles.tierName}>{tier.name}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{tier.price}</Text>
                    <Text style={styles.billing}>{tier.billing}</Text>
                  </View>
                  <Text style={styles.description}>{tier.description}</Text>
                  {tier.popular && (
                    <View style={styles.popularPill}>
                      <Ionicons name="sparkles" size={14} color={theme.colors.white} />
                      <Text style={styles.popularText}>Most adopted by cosmic families</Text>
                    </View>
                  )}
                </View>

                {tier.categories.map((category) => (
                  <View key={`${tier.id}-${category.title}`} style={styles.category}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    {category.items.map((item) => (
                      <View key={`${tier.id}-${category.title}-${item}`} style={styles.featureRow}>
                        <Ionicons name="checkmark-circle" size={18} color={tier.color} />
                        <Text style={styles.featureText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                ))}

                <Button
                  title={tier.cta}
                  onPress={() => {}}
                  variant={tier.popular ? 'secondary' : 'outline'}
                  size="medium"
                  style={styles.ctaButton}
                  accessibilityLabel={`Choose the ${tier.name} plan`}
                />
              </AnimatedCard>
            ))}
          </View>

          <View style={styles.footerNote}>
            <Ionicons name="infinite" size={22} color={theme.colors.white} />
            <Text style={styles.footerText}>
              All tiers ride on Noorah’s guardian infrastructure. Need a bespoke orbit? Tap the Unicorn Infinity team and we’ll co-design it live.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
  },
  header: {
    marginTop: theme.spacing['2xl'],
    marginBottom: theme.spacing['2xl'],
    alignItems: 'flex-start',
  },
  kicker: {
    color: 'rgba(226, 232, 240, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontFamily: theme.typography.fontFamily.display,
    fontSize: theme.typography.fontSize['3xl'],
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: 'rgba(226, 232, 240, 0.75)',
    fontSize: theme.typography.fontSize.base,
    maxWidth: 600,
    lineHeight: 22,
  },
  tierGrid: {
    gap: theme.spacing['2xl'],
  } as any,
  card: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    padding: theme.spacing['2xl'],
  },
  cardHeader: {
    marginBottom: theme.spacing.lg,
  },
  tierName: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: theme.spacing.sm,
  },
  price: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.black,
    marginRight: theme.spacing.sm,
  },
  billing: {
    color: 'rgba(226, 232, 240, 0.6)',
    fontSize: theme.typography.fontSize.sm,
  },
  description: {
    color: 'rgba(226, 232, 240, 0.75)',
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    lineHeight: 22,
  },
  popularPill: {
    marginTop: theme.spacing.md,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(236, 72, 153, 0.35)',
    gap: 8,
  } as any,
  popularText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  category: {
    marginTop: theme.spacing.lg,
  },
  categoryTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  featureText: {
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  ctaButton: {
    marginTop: theme.spacing['2xl'],
  },
  footerNote: {
    marginTop: theme.spacing['3xl'],
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(226, 232, 240, 0.75)',
    marginLeft: theme.spacing.md,
    lineHeight: 20,
    flex: 1,
  },
});

export default PricingScreen;
