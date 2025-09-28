import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import type { RootStackParamList } from './src/navigation/types';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';

// Import screens (web-compatible versions)
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import AuthScreen from './src/screens/AuthScreen';
import SignupScreen from './src/screens/SignupScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import UserTypeSelectionScreen from './src/screens/UserTypeSelectionScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import BookingFlowScreen from './src/screens/parent/BookingFlowScreen';
import EmergencySOSScreen from './src/screens/EmergencySOSScreen';
import SecurityDemoScreen from './src/screens/SecurityDemoScreen';
import NavigationTestScreen from './src/screens/NavigationTestScreen';
import QuickTestScreen from './src/screens/QuickTestScreen';
import BackendTestScreen from './src/screens/BackendTestScreen';
import PricingScreen from './src/screens/PricingScreen';

// Import simplified tab navigators for web
import ParentTabNavigator from './src/navigation/ParentTabNavigator';
import SitterTabNavigator from './src/navigation/SitterTabNavigator';
import { DEV_BYPASS_AUTH, DEV_BYPASS_TARGET } from './src/config/features';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const initialRoute = DEV_BYPASS_AUTH ? DEV_BYPASS_TARGET : 'Splash';

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0],
                        }),
                      },
                    ],
                  },
                };
              },
            }}
          >
            {/* Auth & Onboarding Flow */}
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="BookingFlow" component={BookingFlowScreen} />
            <Stack.Screen name="EmergencySOS" component={EmergencySOSScreen} />
            <Stack.Screen name="SecurityDemo" component={SecurityDemoScreen} />

            {/* Main App Flows */}
            <Stack.Screen name="ParentTabs" component={ParentTabNavigator} />
            <Stack.Screen name="SitterTabs" component={SitterTabNavigator} />

            {/* Marketing / Info */}
            <Stack.Screen name="Pricing" component={PricingScreen} />

            {/* Testing Screens */}
            <Stack.Screen name="NavigationTest" component={NavigationTestScreen} />
            <Stack.Screen name="QuickTest" component={QuickTestScreen} />
            <Stack.Screen name="BackendTest" component={BackendTestScreen} />

            {/* Individual Parent Screens (for direct navigation) */}
            <Stack.Screen name="ParentHome" component={ParentTabNavigator} />
            <Stack.Screen name="ParentBook" component={ParentTabNavigator} />
            <Stack.Screen name="ParentMySitters" component={ParentTabNavigator} />
            <Stack.Screen name="ParentMessages" component={ParentTabNavigator} />
            <Stack.Screen name="ParentProfile" component={ParentTabNavigator} />

            {/* Individual Sitter Screens (for direct navigation) */}
            <Stack.Screen name="SitterHome" component={SitterTabNavigator} />
            <Stack.Screen name="SitterJobs" component={SitterTabNavigator} />
            <Stack.Screen name="SitterMessages" component={SitterTabNavigator} />
            <Stack.Screen name="SitterEarnings" component={SitterTabNavigator} />
            <Stack.Screen name="SitterProfile" component={SitterTabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

