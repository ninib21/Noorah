import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Auth Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import UserTypeSelectionScreen from '../screens/UserTypeSelectionScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';

// Main App Screens
import TabNavigator from './TabNavigator';

// Emergency Screen
import EmergencySOSScreen from '../screens/EmergencySOSScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  UserTypeSelection: undefined;
  Login: undefined;
  ProfileSetup: undefined;
  Main: undefined;
  EmergencySOS: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          // Auth Flow
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          </>
        ) : (
          // Main App Flow
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="EmergencySOS" 
              component={EmergencySOSScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 