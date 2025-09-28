import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ParentHomeScreen from '../screens/parent/ParentHomeScreen';
import ParentBookScreen from '../screens/parent/ParentBookScreen';
import ParentMySittersScreen from '../screens/parent/ParentMySittersScreen';
import ParentMessagesScreen from '../screens/parent/ParentMessagesScreen';
import ParentProfileScreen from '../screens/parent/ParentProfileScreen';
import { theme } from '../styles/theme';

const Tab = createBottomTabNavigator();

const ParentTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'ParentHome') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ParentBook') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'ParentMySitters') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'ParentMessages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'ParentProfile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
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
        name="ParentHome" 
        component={ParentHomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="ParentBook" 
        component={ParentBookScreen}
        options={{ tabBarLabel: 'Book' }}
      />
      <Tab.Screen 
        name="ParentMySitters" 
        component={ParentMySittersScreen}
        options={{ tabBarLabel: 'My Sitters' }}
      />
      <Tab.Screen 
        name="ParentMessages" 
        component={ParentMessagesScreen}
        options={{ tabBarLabel: 'Chat' }}
      />
      <Tab.Screen 
        name="ParentProfile" 
        component={ParentProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default ParentTabNavigator; 

