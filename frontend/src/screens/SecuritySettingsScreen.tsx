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
    <Card variant="elevated" style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
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
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        {icon && (
          <Ionicons name={icon as any} size={20} color="#3A7DFF" className="mr-3" />
        )}
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
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
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#3A7DFF', '#FF7DB9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loadingContainer}
        >
          <Text style={styles.loadingText}>Loading security settings...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!config) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#3A7DFF', '#FF7DB9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loadingContainer}
        >
          <Text style={styles.loadingText}>Failed to load security settings</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3A7DFF', '#FF7DB9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.content}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Security Settings</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
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
              style={styles.settingItem}
              onPress={setupMFA}
            >
              <View style={styles.settingContent}>
                <Ionicons name="shield-checkmark" size={20} color="#3A7DFF" className="mr-3" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                  <Text style={styles.settingDescription}>Add an extra layer of security</Text>
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
              style={styles.settingItem}
              onPress={() => setShowGeoFencingModal(true)}
            >
              <View style={styles.settingContent}>
                <Ionicons name="map" size={20} color="#3A7DFF" className="mr-3" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Allowed Regions</Text>
                  <Text style={styles.settingDescription}>
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
              style={styles.settingItem}
              onPress={() => setShowEmergencyContactsModal(true)}
            >
              <View style={styles.settingContent}>
                <Ionicons name="people" size={20} color="#3A7DFF" className="mr-3" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Emergency Contacts</Text>
                  <Text style={styles.settingDescription}>
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
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Security Status</Text>
          <View style={styles.section}>
            <View style={styles.settingItem}>
              <Text style={styles.settingDescription}>HTTPS Enforcement</Text>
              <View style={[styles.statusBadge, config.enforceHTTPS ? styles.statusActive : styles.statusInactive]}>
                <Text style={[styles.statusText, config.enforceHTTPS ? styles.statusTextActive : styles.statusTextInactive]}>
                  {config.enforceHTTPS ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingDescription}>Encryption</Text>
              <View style={[styles.statusBadge, config.encryptionEnabled ? styles.statusActive : styles.statusInactive]}>
                <Text style={[styles.statusText, config.encryptionEnabled ? styles.statusTextActive : styles.statusTextInactive]}>
                  {config.encryptionEnabled ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingDescription}>Geo-fencing</Text>
              <View style={[styles.statusBadge, config.geoFencingEnabled ? styles.statusActive : styles.statusInactive]}>
                <Text style={[styles.statusText, config.geoFencingEnabled ? styles.statusTextActive : styles.statusTextInactive]}>
                  {config.geoFencingEnabled ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingDescription}>Biometric Auth</Text>
              <View style={[styles.statusBadge, biometricEnabled ? styles.statusActive : styles.statusInactive]}>
                <Text style={[styles.statusText, biometricEnabled ? styles.statusTextActive : styles.statusTextInactive]}>
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
        <View style={styles.modalContent}>
          <Text style={styles.manualCodeText}>
            Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </Text>
          <View style={styles.qrCodeContainer}>
            <Text style={styles.qrCodeText}>QR Code Placeholder</Text>
          </View>
          <Text style={styles.manualCodeText}>
            Or enter this code manually: <Text style={styles.codeText}>JBSWY3DPEHPK3PXP</Text>
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
        <View style={styles.modalContent}>
          <Text style={styles.manualCodeText}>
            Configure regions where the app can be used
          </Text>
          {config.allowedRegions.length === 0 ? (
            <Text style={styles.qrCodeText}>No regions configured</Text>
          ) : (
            config.allowedRegions.map((region) => (
              <View key={region.id} style={styles.regionItem}>
                <Text style={styles.regionName}>{region.name}</Text>
                <Text style={styles.regionDetails}>
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
        <View style={styles.modalContent}>
          <Text style={styles.manualCodeText}>
            Configure contacts to notify in emergency situations
          </Text>
          {config.emergencyContacts.length === 0 ? (
            <Text style={styles.qrCodeText}>No emergency contacts configured</Text>
          ) : (
            config.emergencyContacts.map((contact) => (
              <View key={contact.id} style={styles.regionItem}>
                <Text style={styles.regionName}>{contact.name}</Text>
                <Text style={styles.regionDetails}>{contact.phone}</Text>
                <Text style={styles.contactRelationship}>{contact.relationship}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusInactive: {
    backgroundColor: '#fef2f2',
  },
  statusTextActive: {
    color: '#166534',
  },
  statusTextInactive: {
    color: '#991b1b',
  },
  modalContent: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  qrCodeContainer: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  qrCodeText: {
    textAlign: 'center',
    color: '#6b7280',
  },
  manualCodeText: {
    color: '#6b7280',
    marginBottom: 16,
  },
  codeText: {
    fontFamily: 'monospace',
  },
  regionItem: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  regionName: {
    fontWeight: '500',
  },
  regionDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  contactItem: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  contactName: {
    fontWeight: '500',
  },
  contactPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  contactRelationship: {
    fontSize: 12,
    color: '#9ca3af',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
  },
});

export default SecuritySettingsScreen; 
