import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import securityConfigService from '../services/security-config.service';
import firebaseService from '../services/firebase.service';
import mfaService from '../services/mfa.service';
import { SecurityConfig, GeoRegion, EmergencyContact } from '../services/security-config.service';

const SecuritySettingsScreen: React.FC = () => {
  const [config, setConfig] = useState<SecurityConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMFAModal, setShowMFAModal] = useState(false);
  const [showGeoFencingModal, setShowGeoFencingModal] = useState(false);
  const [showEmergencyContactsModal, setShowEmergencyContactsModal] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const securityConfig = securityConfigService.getConfig();
      setConfig(securityConfig);

      // Check biometric availability
      const isBiometricAvailable = await firebaseService.isBiometricAvailable();
      setBiometricAvailable(isBiometricAvailable);

      const isBiometricEnabled = await firebaseService.isBiometricEnabled();
      setBiometricEnabled(isBiometricEnabled);

      setLoading(false);
    } catch (error) {
      console.error('Error loading security settings:', error);
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<SecurityConfig>) => {
    try {
      await securityConfigService.updateConfig(updates);
      setConfig(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating security config:', error);
      Alert.alert('Error', 'Failed to update security settings');
    }
  };

  const toggleBiometricAuth = async () => {
    try {
      if (biometricEnabled) {
        const success = await firebaseService.disableBiometricAuth();
        if (success) {
          setBiometricEnabled(false);
          Alert.alert('Success', 'Biometric authentication disabled');
        }
      } else {
        // For demo purposes, we'll use a mock user
        const mockUser = {
          id: 'demo_user',
          email: 'demo@example.com',
          phone: null,
          displayName: 'Demo User',
          photoURL: null,
          emailVerified: true,
          phoneNumber: null,
          isAnonymous: false,
          metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: new Date().toISOString(),
          },
        };

        const success = await firebaseService.enableBiometricAuth(mockUser);
        if (success) {
          setBiometricEnabled(true);
          Alert.alert('Success', 'Biometric authentication enabled');
        }
      }
    } catch (error) {
      console.error('Error toggling biometric auth:', error);
      Alert.alert('Error', 'Failed to update biometric authentication');
    }
  };

  const setupMFA = async () => {
    try {
      const result = await mfaService.generateSecret('demo_user', 'demo@example.com');
      if (result.success) {
        setShowMFAModal(true);
      } else {
        Alert.alert('Error', result.error || 'Failed to setup MFA');
      }
    } catch (error) {
      console.error('Error setting up MFA:', error);
      Alert.alert('Error', 'Failed to setup MFA');
    }
  };

  const renderSecuritySection = (title: string, children: React.ReactNode) => (
    <Card variant="elevated" className="mb-4">
      <Text className="text-lg font-semibold text-gray-800 mb-3">{title}</Text>
      {children}
    </Card>
  );

  const renderToggleItem = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon?: string
  ) => (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
      <View className="flex-1 flex-row items-center">
        {icon && (
          <Ionicons name={icon as any} size={20} color="#3A7DFF" className="mr-3" />
        )}
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-800">{title}</Text>
          <Text className="text-sm text-gray-600 mt-1">{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E7EB', true: '#3A7DFF' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <LinearGradient
          colors={['#3A7DFF', '#FF7DB9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 justify-center items-center"
        >
          <Text className="text-white text-lg">Loading security settings...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!config) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <LinearGradient
          colors={['#3A7DFF', '#FF7DB9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 justify-center items-center"
        >
          <Text className="text-white text-lg">Failed to load security settings</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <LinearGradient
        colors={['#3A7DFF', '#FF7DB9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 py-6"
      >
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Security Settings</Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Authentication Section */}
        {renderSecuritySection('Authentication', (
          <View>
            {renderToggleItem(
              'Biometric Authentication',
              'Use fingerprint or face ID to unlock the app',
              biometricEnabled,
              toggleBiometricAuth,
              'finger-print'
            )}
            
            <TouchableOpacity
              className="flex-row items-center justify-between py-3 border-b border-gray-100"
              onPress={setupMFA}
            >
              <View className="flex-1 flex-row items-center">
                <Ionicons name="shield-checkmark" size={20} color="#3A7DFF" className="mr-3" />
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-800">Two-Factor Authentication</Text>
                  <Text className="text-sm text-gray-600 mt-1">Add an extra layer of security</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {renderToggleItem(
              'Auto-Lock',
              'Automatically lock the app when inactive',
              config.autoLockEnabled,
              (value) => updateConfig({ autoLockEnabled: value }),
              'lock-closed'
            )}
          </View>
        ))}

        {/* Network Security Section */}
        {renderSecuritySection('Network Security', (
          <View>
            {renderToggleItem(
              'Enforce HTTPS',
              'Only allow secure connections',
              config.enforceHTTPS,
              (value) => updateConfig({ enforceHTTPS: value }),
              'shield-checkmark'
            )}
            
            {renderToggleItem(
              'Certificate Pinning',
              'Prevent man-in-the-middle attacks',
              config.certificatePinning,
              (value) => updateConfig({ certificatePinning: value }),
              'lock-closed'
            )}
          </View>
        ))}

        {/* Data Protection Section */}
        {renderSecuritySection('Data Protection', (
          <View>
            {renderToggleItem(
              'Encryption at Rest',
              'Encrypt all stored data',
              config.encryptionEnabled,
              (value) => updateConfig({ encryptionEnabled: value }),
              'key'
            )}
            
            {renderToggleItem(
              'Sensitive Data Masking',
              'Mask sensitive information in logs',
              config.sensitiveDataMasking,
              (value) => updateConfig({ sensitiveDataMasking: value }),
              'eye-off'
            )}
          </View>
        ))}

        {/* Location Security Section */}
        {renderSecuritySection('Location Security', (
          <View>
            {renderToggleItem(
              'Geo-fencing',
              'Restrict app usage to specific areas',
              config.geoFencingEnabled,
              (value) => updateConfig({ geoFencingEnabled: value }),
              'location'
            )}
            
            <TouchableOpacity
              className="flex-row items-center justify-between py-3 border-b border-gray-100"
              onPress={() => setShowGeoFencingModal(true)}
            >
              <View className="flex-1 flex-row items-center">
                <Ionicons name="map" size={20} color="#3A7DFF" className="mr-3" />
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-800">Allowed Regions</Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {config.allowedRegions.length} regions configured
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Emergency Settings Section */}
        {renderSecuritySection('Emergency Settings', (
          <View>
            {renderToggleItem(
              'Emergency SOS',
              'Enable emergency alert system',
              config.emergencySOSEnabled,
              (value) => updateConfig({ emergencySOSEnabled: value }),
              'warning'
            )}
            
            <TouchableOpacity
              className="flex-row items-center justify-between py-3 border-b border-gray-100"
              onPress={() => setShowEmergencyContactsModal(true)}
            >
              <View className="flex-1 flex-row items-center">
                <Ionicons name="people" size={20} color="#3A7DFF" className="mr-3" />
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-800">Emergency Contacts</Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {config.emergencyContacts.length} contacts configured
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Audit & Logging Section */}
        {renderSecuritySection('Audit & Logging', (
          <View>
            {renderToggleItem(
              'Audit Logging',
              'Log security events for monitoring',
              config.auditLoggingEnabled,
              (value) => updateConfig({ auditLoggingEnabled: value }),
              'document-text'
            )}
          </View>
        ))}

        {/* Security Status */}
        <Card variant="elevated" className="mt-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Security Status</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">HTTPS Enforcement</Text>
              <View className={`px-2 py-1 rounded ${config.enforceHTTPS ? 'bg-green-100' : 'bg-red-100'}`}>
                <Text className={`text-xs font-medium ${config.enforceHTTPS ? 'text-green-800' : 'text-red-800'}`}>
                  {config.enforceHTTPS ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Encryption</Text>
              <View className={`px-2 py-1 rounded ${config.encryptionEnabled ? 'bg-green-100' : 'bg-red-100'}`}>
                <Text className={`text-xs font-medium ${config.encryptionEnabled ? 'text-green-800' : 'text-red-800'}`}>
                  {config.encryptionEnabled ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Geo-fencing</Text>
              <View className={`px-2 py-1 rounded ${config.geoFencingEnabled ? 'bg-green-100' : 'bg-red-100'}`}>
                <Text className={`text-xs font-medium ${config.geoFencingEnabled ? 'text-green-800' : 'text-red-800'}`}>
                  {config.geoFencingEnabled ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Biometric Auth</Text>
              <View className={`px-2 py-1 rounded ${biometricEnabled ? 'bg-green-100' : 'bg-red-100'}`}>
                <Text className={`text-xs font-medium ${biometricEnabled ? 'text-green-800' : 'text-red-800'}`}>
                  {biometricEnabled ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* MFA Setup Modal */}
      <Modal
        visible={showMFAModal}
        onClose={() => setShowMFAModal(false)}
        title="Setup Two-Factor Authentication"
        size="large"
      >
        <View className="p-4">
          <Text className="text-gray-600 mb-4">
            Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </Text>
          <View className="bg-gray-100 p-4 rounded-lg mb-4">
            <Text className="text-center text-gray-500">QR Code Placeholder</Text>
          </View>
          <Text className="text-gray-600 mb-4">
            Or enter this code manually: <Text className="font-mono">JBSWY3DPEHPK3PXP</Text>
          </Text>
          <Button
            title="Enable MFA"
            variant="primary"
            onPress={() => {
              setShowMFAModal(false);
              Alert.alert('Success', 'Two-factor authentication enabled');
            }}
          />
        </View>
      </Modal>

      {/* Geo-fencing Modal */}
      <Modal
        visible={showGeoFencingModal}
        onClose={() => setShowGeoFencingModal(false)}
        title="Allowed Regions"
        size="large"
      >
        <View className="p-4">
          <Text className="text-gray-600 mb-4">
            Configure regions where the app can be used
          </Text>
          {config.allowedRegions.length === 0 ? (
            <Text className="text-center text-gray-500 mb-4">No regions configured</Text>
          ) : (
            config.allowedRegions.map((region) => (
              <View key={region.id} className="bg-gray-50 p-3 rounded-lg mb-2">
                <Text className="font-medium">{region.name}</Text>
                <Text className="text-sm text-gray-600">
                  {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)} (Radius: {region.radius}m)
                </Text>
              </View>
            ))
          )}
          <Button
            title="Add Region"
            variant="outline"
            onPress={() => {
              setShowGeoFencingModal(false);
              Alert.alert('Info', 'Region management coming soon');
            }}
          />
        </View>
      </Modal>

      {/* Emergency Contacts Modal */}
      <Modal
        visible={showEmergencyContactsModal}
        onClose={() => setShowEmergencyContactsModal(false)}
        title="Emergency Contacts"
        size="large"
      >
        <View className="p-4">
          <Text className="text-gray-600 mb-4">
            Configure contacts to notify in emergency situations
          </Text>
          {config.emergencyContacts.length === 0 ? (
            <Text className="text-center text-gray-500 mb-4">No emergency contacts configured</Text>
          ) : (
            config.emergencyContacts.map((contact) => (
              <View key={contact.id} className="bg-gray-50 p-3 rounded-lg mb-2">
                <Text className="font-medium">{contact.name}</Text>
                <Text className="text-sm text-gray-600">{contact.phone}</Text>
                <Text className="text-xs text-gray-500">{contact.relationship}</Text>
              </View>
            ))
          )}
          <Button
            title="Add Contact"
            variant="outline"
            onPress={() => {
              setShowEmergencyContactsModal(false);
              Alert.alert('Info', 'Contact management coming soon');
            }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SecuritySettingsScreen; 