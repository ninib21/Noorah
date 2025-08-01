import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Ionicons } from '@expo/vector-icons';

// Parent Screens
import ParentHomeScreen from '../screens/parent/ParentHomeScreen';
import ParentBookScreen from '../screens/parent/ParentBookScreen';
import ParentMySittersScreen from '../screens/parent/ParentMySittersScreen';
import ParentMessagesScreen from '../screens/parent/ParentMessagesScreen';
import ParentProfileScreen from '../screens/parent/ParentProfileScreen';

// Sitter Screens
import SitterHomeScreen from '../screens/sitter/SitterHomeScreen';
import SitterJobsScreen from '../screens/sitter/SitterJobsScreen';
import SitterEarningsScreen from '../screens/sitter/SitterEarningsScreen';
import SitterMessagesScreen from '../screens/sitter/SitterMessagesScreen';
import SitterProfileScreen from '../screens/sitter/SitterProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isParent = user?.userType === 'parent';

  if (isParent) {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Book') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'MySitters') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Messages') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3A7DFF',
          tabBarInactiveTintColor: '#6B7280',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={ParentHomeScreen} />
        <Tab.Screen name="Book" component={ParentBookScreen} />
        <Tab.Screen name="MySitters" component={ParentMySittersScreen} />
        <Tab.Screen name="Messages" component={ParentMessagesScreen} />
        <Tab.Screen name="Profile" component={ParentProfileScreen} />
      </Tab.Navigator>
    );
  } else {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Jobs') {
              iconName = focused ? 'briefcase' : 'briefcase-outline';
            } else if (route.name === 'Earnings') {
              iconName = focused ? 'wallet' : 'wallet-outline';
            } else if (route.name === 'Messages') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3A7DFF',
          tabBarInactiveTintColor: '#6B7280',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={SitterHomeScreen} />
        <Tab.Screen name="Jobs" component={SitterJobsScreen} />
        <Tab.Screen name="Earnings" component={SitterEarningsScreen} />
        <Tab.Screen name="Messages" component={SitterMessagesScreen} />
        <Tab.Screen name="Profile" component={SitterProfileScreen} />
      </Tab.Navigator>
    );
  }
};

export default TabNavigator; 