import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import type { RootStackParamList } from './navigation/types';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';

import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import AuthScreen from './screens/AuthScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import UserTypeSelectionScreen from './screens/UserTypeSelectionScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import BookingFlowScreen from './screens/parent/BookingFlowScreen';
import EmergencySOSScreen from './screens/EmergencySOSScreen';
import SecurityDemoScreen from './screens/SecurityDemoScreen';
import NavigationTestScreen from './screens/NavigationTestScreen';
import QuickTestScreen from './screens/QuickTestScreen';
import BackendTestScreen from './screens/BackendTestScreen';
import PricingScreen from './screens/PricingScreen';

import ParentTabNavigator from './navigation/ParentTabNavigator';
import SitterTabNavigator from './navigation/SitterTabNavigator';
import { DEV_BYPASS_AUTH, DEV_BYPASS_TARGET } from './config/features';

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

            {/* Individual routes can point to tab navigators for now */}
            <Stack.Screen name="ParentHome" component={ParentTabNavigator} />
            <Stack.Screen name="ParentBook" component={ParentTabNavigator} />
            <Stack.Screen name="ParentMySitters" component={ParentTabNavigator} />
            <Stack.Screen name="ParentMessages" component={ParentTabNavigator} />
            <Stack.Screen name="ParentProfile" component={ParentTabNavigator} />

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

