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
import { Button } from '../components/ui/Button';
import { theme } from '../styles/theme';

interface AuthScreenProps {
  navigation: any;
  route: any;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ navigation, route }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const userMode = route.params?.mode || 'parent';

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin && (!firstName || !lastName)) {
      Alert.alert('Error', 'Please fill in all fields');
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
        // Store token and navigate to dashboard
        Alert.alert('Success', data.message);
        navigation.navigate('Dashboard');
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🍼 NannyRadar</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome back!' : `Join as ${userMode}`}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {!isLogin && (
              <>
                <View style={styles.nameRow}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                      style={styles.input}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Enter first name"
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                      style={styles.input}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Enter last name"
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <Button
              title={isLogin ? 'Sign In' : 'Create Account'}
              onPress={handleAuth}
              variant="primary"
              size="large"
              style={styles.authButton}
              disabled={loading}
            />

            {/* Social Login */}
            <View style={styles.socialSection}>
              <Text style={styles.orText}>Or continue with</Text>
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
                  <Text style={styles.socialIcon}>🍎</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Toggle Auth Mode */}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Text style={styles.toggleLink}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  logo: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.primary,
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
  label: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.primary,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.primary,
    backgroundColor: theme.colors.white,
  },
  authButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  socialSection: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  orText: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.primary,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  socialIcon: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  toggleText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.primary,
  },
  toggleLink: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
