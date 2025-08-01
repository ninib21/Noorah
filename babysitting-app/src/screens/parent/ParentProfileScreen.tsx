import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';
import Button from '../../components/Button';

const ParentProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [guardianModeEnabled, setGuardianModeEnabled] = useState(true);

  // Mock data
  const profileData = {
    name: 'Jennifer Smith',
    email: 'jennifer.smith@email.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://via.placeholder.com/100',
    children: [
      { name: 'Emma', age: 5, avatar: 'https://via.placeholder.com/50' },
      { name: 'Liam', age: 3, avatar: 'https://via.placeholder.com/50' },
    ],
    address: '123 Main Street, New York, NY 10001',
    emergencyContacts: [
      { name: 'John Smith', relationship: 'Spouse', phone: '+1 (555) 987-6543' },
      { name: 'Sarah Johnson', relationship: 'Sitter', phone: '+1 (555) 456-7890' },
    ],
  };

  const menuItems = [
    {
      id: '1',
      title: 'Personal Information',
      icon: 'person',
      color: '#3A7DFF',
      onPress: () => {},
    },
    {
      id: '2',
      title: 'Children',
      icon: 'people',
      color: '#FF7DB9',
      onPress: () => {},
    },
    {
      id: '3',
      title: 'Emergency Contacts',
      icon: 'call',
      color: '#EF4444',
      onPress: () => {},
    },
    {
      id: '4',
      title: 'Payment Methods',
      icon: 'card',
      color: '#10B981',
      onPress: () => {},
    },
    {
      id: '5',
      title: 'Booking History',
      icon: 'time',
      color: '#F59E0B',
      onPress: () => {},
    },
    {
      id: '6',
      title: 'Safety Settings',
      icon: 'shield-checkmark',
      color: '#8B5CF6',
      onPress: () => navigation.navigate('SecurityDemo' as never),
    },
  ];

  const renderMenuItem = (item: any) => (
    <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon as any} size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.menuTitle}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3A7DFF', '#FF7DB9']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <Image source={{ uri: profileData.avatar }} style={styles.profileAvatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profileData.name}</Text>
              <Text style={styles.profileEmail}>{profileData.email}</Text>
              <Text style={styles.profilePhone}>{profileData.phone}</Text>
            </View>
          </View>

          {/* Children Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Children</Text>
            <View style={styles.childrenContainer}>
              {profileData.children.map((child, index) => (
                <Card key={index} style={styles.childCard}>
                  <Image source={{ uri: child.avatar }} style={styles.childAvatar} />
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childAge}>{child.age} years old</Text>
                  </View>
                  <TouchableOpacity style={styles.editChildButton}>
                    <Ionicons name="create" size={16} color="#64748B" />
                  </TouchableOpacity>
                </Card>
              ))}
              <TouchableOpacity style={styles.addChildButton}>
                <Ionicons name="add" size={24} color="#3A7DFF" />
                <Text style={styles.addChildText}>Add Child</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <Card style={styles.settingsCard}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="notifications" size={20} color="#64748B" />
                  <Text style={styles.settingText}>Push Notifications</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#E2E8F0', true: '#3A7DFF' }}
                  thumbColor="#FFFFFF"
                />
              </View>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="location" size={20} color="#64748B" />
                  <Text style={styles.settingText}>Location Services</Text>
                </View>
                <Switch
                  value={locationEnabled}
                  onValueChange={setLocationEnabled}
                  trackColor={{ false: '#E2E8F0', true: '#3A7DFF' }}
                  thumbColor="#FFFFFF"
                />
              </View>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="shield-checkmark" size={20} color="#64748B" />
                  <Text style={styles.settingText}>Guardian Mode</Text>
                </View>
                <Switch
                  value={guardianModeEnabled}
                  onValueChange={setGuardianModeEnabled}
                  trackColor={{ false: '#E2E8F0', true: '#3A7DFF' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </Card>
          </View>

          {/* Menu Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <Card style={styles.menuCard}>
              {menuItems.map(renderMenuItem)}
            </Card>
          </View>

          {/* Emergency Contacts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <Card style={styles.emergencyCard}>
              {profileData.emergencyContacts.map((contact, index) => (
                <View key={index} style={styles.contactItem}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                  <TouchableOpacity style={styles.callButton}>
                    <Ionicons name="call" size={20} color="#10B981" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addContactButton}>
                <Ionicons name="add" size={20} color="#3A7DFF" />
                <Text style={styles.addContactText}>Add Emergency Contact</Text>
              </TouchableOpacity>
            </Card>
          </View>

          {/* Logout Button */}
          <View style={styles.section}>
            <Button
              title="Logout"
              variant="outline"
              onPress={() => navigation.navigate('Login' as never)}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 16,
    color: '#64748B',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  childrenContainer: {
    gap: 12,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  childAge: {
    fontSize: 14,
    color: '#64748B',
  },
  editChildButton: {
    padding: 8,
  },
  addChildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  addChildText: {
    fontSize: 16,
    color: '#3A7DFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  settingsCard: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
  },
  menuCard: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    color: '#1E293B',
  },
  emergencyCard: {
    padding: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#64748B',
  },
  callButton: {
    padding: 8,
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  addContactText: {
    fontSize: 16,
    color: '#3A7DFF',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default ParentProfileScreen; 