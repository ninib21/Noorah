import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import UserTypeSelectionScreen from './src/screens/UserTypeSelectionScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import NavigationTestScreen from './src/screens/NavigationTestScreen';

// Import additional screens
import BookingFlowScreen from './src/screens/parent/BookingFlowScreen';
import PaymentScreen from './src/screens/parent/PaymentScreen';
import SitterProfileScreen from './src/screens/parent/SitterProfileScreen';
import QuickTestScreen from './src/screens/QuickTestScreen';

// Import tab navigators
import ParentTabNavigator from './src/navigation/ParentTabNavigator';
import SitterTabNavigator from './src/navigation/SitterTabNavigator';

// Import security screens
import EmergencySOSScreen from './src/screens/EmergencySOSScreen';
import SessionMonitoringScreen from './src/screens/SessionMonitoringScreen';
import SecurityTestScreen from './src/screens/SecurityTestScreen';
import SecurityDemoScreen from './src/screens/SecurityDemoScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
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
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />

            {/* Navigation Test */}
            <Stack.Screen name="NavigationTest" component={NavigationTestScreen} />
            <Stack.Screen name="QuickTest" component={QuickTestScreen} />

            {/* Main App Flow */}
            <Stack.Screen name="ParentTabs" component={ParentTabNavigator} />
            <Stack.Screen name="SitterTabs" component={SitterTabNavigator} />

            {/* Security Features */}
            <Stack.Screen name="EmergencySOS" component={EmergencySOSScreen} />
            <Stack.Screen name="SessionMonitoring" component={SessionMonitoringScreen} />
            <Stack.Screen name="SecurityTest" component={SecurityTestScreen} />
            <Stack.Screen name="SecurityDemo" component={SecurityDemoScreen} />

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

            {/* Additional Screens */}
            <Stack.Screen name="BookingFlow" component={BookingFlowScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="SitterProfileView" component={SitterProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}
