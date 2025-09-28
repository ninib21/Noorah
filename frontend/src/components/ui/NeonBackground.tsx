import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { theme } from '../../styles/theme';

interface NeonBackgroundProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  gradient?: readonly [string, string, string];
}

const orbSizes = [220, 320, 280];

export const NeonBackground: React.FC<NeonBackgroundProps> = ({
  children,
  style,
  gradient,
}) => {
  const colors = gradient ?? theme.colors.gradientAurora;

  const offsets = orbSizes.map(() => useSharedValue(Math.random() * 360));

  useEffect(() => {
    offsets.forEach(offset => {
      offset.value = withRepeat(withTiming(360, { duration: 18000 }), -1, false);
    });
  }, []);

  const orbStyles = offsets.map((offset, index) =>
    useAnimatedStyle(() => ({
      transform: [
        {
          rotate: `${offset.value}deg`,
        },
      ],
    }))
  );

  return (
    <View style={[styles.container, style]}>
      <LinearGradient colors={colors} style={StyleSheet.absoluteFillObject} />
      {orbSizes.map((size, index) => (
        <Animated.View
          key={size}
          style={[
            styles.orb,
            orbStyles[index],
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              top: -size * 0.25,
              left: index === 0 ? -size * 0.25 : index === 1 ? size * 0.2 : undefined,
              right: index === 2 ? -size * 0.4 : undefined,
              backgroundColor:
                index === 0
                  ? 'rgba(124, 58, 237, 0.25)'
                  : index === 1
                  ? 'rgba(14, 165, 233, 0.22)'
                  : 'rgba(236, 72, 153, 0.2)',
            },
          ]}
        />
      ))}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  orb: {
    position: 'absolute',
    opacity: 0.55,
  },
  content: {
    flex: 1,
  },
});

export default NeonBackground;
