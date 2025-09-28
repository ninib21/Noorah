import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { AnimatedGradientBackground } from '../components/AnimatedComponents';
import { theme } from '../styles/theme';

export interface AuthScreenProps {
  navigation: any;
  route: any;
}

const TEST_ACCOUNTS: Array<{
  email: string;
  password: string;
  mode: 'parent' | 'sitter';
  firstName: string;
  lastName: string;
}> = [
  {
    email: 'parent@noorah.io',
    password: 'Parent#123',
    mode: 'parent',
    firstName: 'Aurora',
    lastName: 'Parent',
  },
  {
    email: 'sitter@noorah.io',
    password: 'Sitter#123',
    mode: 'sitter',
    firstName: 'Nova',
    lastName: 'Guardian',
  },
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ navigation, route }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const userMode = route.params?.mode || 'parent';

  const navigateToMode = (mode: 'parent' | 'sitter') => {
    if (mode === 'sitter') {
      navigation.navigate('SitterTabs');
    } else {
      navigation.navigate('ParentTabs');
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin && (!firstName || !lastName)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const testAccount = TEST_ACCOUNTS.find(
      (account) => account.email === normalizedEmail && account.password === password,
    );

    if (testAccount) {
      Alert.alert(
        'Success',
        `Welcome back, ${testAccount.firstName}! You are signed in as a ${testAccount.mode}.`,
      );
      navigateToMode(testAccount.mode);
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email, password }
        : { email, password, firstName, lastName, role: userMode };

      const response = await fetch(`http://localhost:3002${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', data.message);
        navigateToMode(userMode === 'sitter' ? 'sitter' : 'parent');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Coming Soon', `${provider} login will be available soon!`);
  };

  return (
    <AnimatedGradientBackground colors={theme.colors.gradientMidnight}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.overlay}>
            <View style={styles.contentCard}>
              <View style={styles.header}>
                <Text style={styles.badge}>{isLogin ? 'Portal Access' : `Join as ${userMode}`}</Text>
                <Text style={styles.logo}>✨ Noorah</Text>
                <Text style={styles.subtitle}>
                  {isLogin
                    ? 'Enter the luminous care hub'
                    : 'Craft your quantum caregiver profile'}
                </Text>
              </View>

              <View style={styles.form}>
                {!isLogin && (
                  <View style={styles.nameRow}>
                    <View style={[styles.inputGroup, styles.inputHalfRight]}>
                      <Text style={styles.label}>First Name</Text>
                      <TextInput
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Enter first name"
                        placeholderTextColor="rgba(226, 232, 240, 0.4)"
                        autoCapitalize="words"
                      />
                    </View>
                    <View style={[styles.inputGroup, styles.inputHalfLeft]}>
                      <Text style={styles.label}>Last Name</Text>
                      <TextInput
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Enter last name"
                        placeholderTextColor="rgba(226, 232, 240, 0.4)"
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(226, 232, 240, 0.4)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Minimum 8 characters"
                    placeholderTextColor="rgba(226, 232, 240, 0.4)"
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <Button
                  title={isLogin ? 'Sign In' : 'Create Quantum Account'}
                  onPress={handleAuth}
                  variant="primary"
                  size="large"
                  style={styles.authButton}
                  disabled={loading}
                  loading={loading}
                  accessibilityLabel={isLogin ? 'Sign in to your account' : 'Create a new account'}
                />

                <View style={styles.socialSection}>
                  <Text style={styles.orText}>Or accelerate with</Text>
                  <View style={styles.socialButtons}>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => handleSocialLogin('Google')}
                    >
                      <Text style={styles.socialIcon}>G</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => handleSocialLogin('Facebook')}
                    >
                      <Text style={styles.socialIcon}>f</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.socialButton}
                      onPress={() => handleSocialLogin('Apple')}
                    >
                      <Ionicons name="logo-apple" size={18} color={theme.colors.white} />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => setIsLogin(!isLogin)}
                >
                  <Text style={styles.toggleText}>
                    {isLogin ? "Don't have an account? " : 'Already registered? '}
                    <Text style={styles.toggleLink}>
                      {isLogin ? 'Create one' : 'Sign in'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing['2xl'],
    justifyContent: 'center',
  },
  contentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    ...theme.shadows.md,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing['2xl'],
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  },
  logo: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.display,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.lg,
    color: 'rgba(226, 232, 240, 0.8)',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputHalfRight: {
    flex: 1,
    marginRight: 8,
  },
  inputHalfLeft: {
    flex: 1,
    marginLeft: 8,
  },
  label: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.primary,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    color: theme.colors.white,
  },
  authButton: {
    marginTop: theme.spacing.md,
  },
  socialSection: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  orText: {
    color: 'rgba(226, 232, 240, 0.7)',
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.primary,
  },
  socialButtons: {
    flexDirection: 'row',
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  socialIcon: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  toggleText: {
    color: 'rgba(226, 232, 240, 0.75)',
    fontFamily: theme.typography.fontFamily.primary,
  },
  toggleLink: {
    color: theme.colors.accent,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

export default AuthScreen;


