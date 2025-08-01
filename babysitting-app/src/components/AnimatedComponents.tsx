import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  useDerivedValue,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  interpolate,
  Extrapolate,
  runOnJS,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideInLeft,
  ZoomIn,
  ZoomOut,
  BounceIn,
  BounceOut,
  FlipInXUp,
  FlipOutXDown,
} from 'react-native-reanimated';
import { PanGestureHandler, TapGestureHandler } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 🎯 Animated Button Component
export const AnimatedButton: React.FC<{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  loading = false,
  icon 
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    if (loading) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );
    }
    onPress();
  };

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: 12,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    };

    const sizeStyles = {
      small: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 36 },
      medium: { paddingHorizontal: 24, paddingVertical: 12, minHeight: 48 },
      large: { paddingHorizontal: 32, paddingVertical: 16, minHeight: 56 },
    };

    const variantStyles = {
      primary: { backgroundColor: '#3A7DFF' },
      secondary: { backgroundColor: '#F3F4F6' },
      danger: { backgroundColor: '#EF4444' },
      success: { backgroundColor: '#10B981' },
    };

    return { ...baseStyle, ...sizeStyles[size], ...variantStyles[variant] };
  };

  const getTextStyle = () => {
    const baseStyle = {
      fontWeight: '600' as const,
      textAlign: 'center' as const,
    };

    const sizeStyles = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    };

    const variantStyles = {
      primary: { color: '#FFFFFF' },
      secondary: { color: '#374151' },
      danger: { color: '#FFFFFF' },
      success: { color: '#FFFFFF' },
    };

    return { ...baseStyle, ...sizeStyles[size], ...variantStyles[variant] };
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading && (
          <Animated.View style={{ marginRight: 8 }}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
          </Animated.View>
        )}
        {icon && !loading && (
          <Ionicons 
            name={icon} 
            size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} 
            color={variant === 'secondary' ? '#374151' : '#FFFFFF'} 
            style={{ marginRight: 8 }}
          />
        )}
        <Text style={getTextStyle()}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// 🎯 Animated Card Component
export const AnimatedCard: React.FC<{
  children: React.ReactNode;
  onPress?: () => void;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}> = ({ children, onPress, delay = 0, direction = 'up' }) => {
  const enteringAnimation = {
    up: FadeInUp.delay(delay),
    down: FadeInDown.delay(delay),
    left: SlideInLeft.delay(delay),
    right: SlideInRight.delay(delay),
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <Animated.View
      entering={enteringAnimation[direction]}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      <CardComponent onPress={onPress} activeOpacity={0.8}>
        {children}
      </CardComponent>
    </Animated.View>
  );
};

// 🎯 Animated Progress Bar
export const AnimatedProgressBar: React.FC<{
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  animated?: boolean;
}> = ({ 
  progress, 
  height = 8, 
  backgroundColor = '#E5E7EB', 
  progressColor = '#3A7DFF',
  animated = true 
}) => {
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progressWidth.value = withSpring(progress, {
        damping: 20,
        stiffness: 100,
      });
    } else {
      progressWidth.value = progress;
    }
  }, [progress, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  return (
    <View
      style={{
        height,
        backgroundColor,
        borderRadius: height / 2,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: progressColor,
            borderRadius: height / 2,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

// 🎯 Animated Loading Spinner
export const AnimatedSpinner: React.FC<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}> = ({ size = 24, color = '#3A7DFF', strokeWidth = 3 }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: `${color}20`,
          borderTopColor: color,
        }}
      />
    </Animated.View>
  );
};

// 🎯 Animated Floating Action Button
export const AnimatedFAB: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  size?: number;
}> = ({ icon, onPress, color = '#3A7DFF', size = 56 }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    rotation.value = withSequence(
      withTiming(45, { duration: 200 }),
      withTiming(0, { duration: 200 })
    );
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons name={icon} size={size * 0.4} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
};

// 🎯 Animated Tab Bar
export const AnimatedTabBar: React.FC<{
  tabs: Array<{ key: string; title: string; icon: keyof typeof Ionicons.glyphMap }>;
  activeTab: string;
  onTabPress: (tabKey: string) => void;
}> = ({ tabs, activeTab, onTabPress }) => {
  const indicatorPosition = useSharedValue(0);

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.key === activeTab);
    indicatorPosition.value = withSpring(activeIndex, {
      damping: 20,
      stiffness: 100,
    });
  }, [activeTab, tabs]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value * (screenWidth / tabs.length) }],
  }));

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingBottom: 20,
        paddingTop: 10,
      }}
    >
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab.key}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: 8,
          }}
          onPress={() => onTabPress(tab.key)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={tab.icon}
            size={24}
            color={activeTab === tab.key ? '#3A7DFF' : '#9CA3AF'}
          />
          <Text
            style={{
              fontSize: 12,
              marginTop: 4,
              color: activeTab === tab.key ? '#3A7DFF' : '#9CA3AF',
              fontWeight: activeTab === tab.key ? '600' : '400',
            }}
          >
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            width: screenWidth / tabs.length,
            height: 3,
            backgroundColor: '#3A7DFF',
            borderRadius: 2,
          },
          indicatorStyle,
        ]}
      />
    </View>
  );
};

// 🎯 Animated Notification Badge
export const AnimatedNotificationBadge: React.FC<{
  count: number;
  size?: number;
  color?: string;
}> = ({ count, size = 20, color = '#EF4444' }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (count > 0) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 300 })
      );
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withSpring(0, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [count]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (count === 0) return null;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: -5,
          right: -5,
          minWidth: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 4,
        },
        animatedStyle,
      ]}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 10,
          fontWeight: '600',
        }}
      >
        {count > 99 ? '99+' : count.toString()}
      </Text>
    </Animated.View>
  );
};

// 🎯 Animated Swipeable Card
export const AnimatedSwipeableCard: React.FC<{
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}> = ({ children, onSwipeLeft, onSwipeRight, threshold = 100 }) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context: any) => {
      translateX.value = context.startX + event.translationX;
      opacity.value = interpolate(
        Math.abs(translateX.value),
        [0, threshold],
        [1, 0.5],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event) => {
      if (Math.abs(event.translationX) > threshold) {
        if (event.translationX > 0 && onSwipeRight) {
          translateX.value = withTiming(screenWidth, { duration: 300 });
          opacity.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(onSwipeRight)();
          });
        } else if (event.translationX < 0 && onSwipeLeft) {
          translateX.value = withTiming(-screenWidth, { duration: 300 });
          opacity.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(onSwipeLeft)();
          });
        }
      } else {
        translateX.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

// 🎯 Animated Pulse Effect
export const AnimatedPulse: React.FC<{
  children: React.ReactNode;
  duration?: number;
  scale?: number;
}> = ({ children, duration = 2000, scale = 1.1 }) => {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(scale, { duration: duration / 2 }),
        withTiming(1, { duration: duration / 2 })
      ),
      -1,
      true
    );
  }, [duration, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

// 🎯 Animated Shake Effect
export const AnimatedShake: React.FC<{
  children: React.ReactNode;
  trigger?: boolean;
  intensity?: number;
}> = ({ children, trigger = false, intensity = 10 }) => {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      translateX.value = withSequence(
        withTiming(-intensity, { duration: 100 }),
        withTiming(intensity, { duration: 100 }),
        withTiming(-intensity, { duration: 100 }),
        withTiming(intensity, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }
  }, [trigger, intensity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

// 🎯 Animated Counter
export const AnimatedCounter: React.FC<{
  value: number;
  duration?: number;
  style?: any;
}> = ({ value, duration = 1000, style }) => {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration });
  }, [value, duration]);

  const animatedText = useDerivedValue(() => {
    return Math.round(animatedValue.value).toString();
  });

  return (
    <Animated.Text style={style}>
      {animatedText}
    </Animated.Text>
  );
};

// 🎯 Animated Gradient Background
export const AnimatedGradientBackground: React.FC<{
  children: React.ReactNode;
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}> = ({ 
  children, 
  colors = ['#3A7DFF', '#FF7DB9'], 
  start = { x: 0, y: 0 }, 
  end = { x: 1, y: 1 } 
}) => {
  const gradientOpacity = useSharedValue(0);

  useEffect(() => {
    gradientOpacity.value = withTiming(1, { duration: 1000 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: gradientOpacity.value,
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        style={{ flex: 1 }}
      >
        {children}
      </LinearGradient>
    </Animated.View>
  );
};

export default {
  AnimatedButton,
  AnimatedCard,
  AnimatedProgressBar,
  AnimatedSpinner,
  AnimatedFAB,
  AnimatedTabBar,
  AnimatedNotificationBadge,
  AnimatedSwipeableCard,
  AnimatedPulse,
  AnimatedShake,
  AnimatedCounter,
  AnimatedGradientBackground,
}; 