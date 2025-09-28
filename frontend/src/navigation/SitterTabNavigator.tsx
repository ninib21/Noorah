import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import SitterHomeScreen from '../screens/sitter/SitterHomeScreen';
import SitterJobsScreen from '../screens/sitter/SitterJobsScreen';
import SitterMessagesScreen from '../screens/sitter/SitterMessagesScreen';
import SitterEarningsScreen from '../screens/sitter/SitterEarningsScreen';
import SitterProfileScreen from '../screens/sitter/SitterProfileScreen';
import { theme } from '../styles/theme';

const Tab = createBottomTabNavigator();

const SitterTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'SitterHome') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'SitterJobs') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'SitterMessages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'SitterEarnings') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'SitterProfile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: 'rgba(148, 163, 184, 0.14)',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: theme.typography.fontWeight.medium,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="SitterHome" 
        component={SitterHomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="SitterJobs" 
        component={SitterJobsScreen}
        options={{ tabBarLabel: 'Jobs' }}
      />
      <Tab.Screen 
        name="SitterMessages" 
        component={SitterMessagesScreen}
        options={{ tabBarLabel: 'Chat' }}
      />
      <Tab.Screen 
        name="SitterEarnings" 
        component={SitterEarningsScreen}
        options={{ tabBarLabel: 'Earnings' }}
      />
      <Tab.Screen 
        name="SitterProfile" 
        component={SitterProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default SitterTabNavigator; 

