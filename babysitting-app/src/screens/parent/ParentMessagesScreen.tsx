import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Tabs from '../../components/Tabs';

const ParentMessagesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const conversations = [
    {
      id: '1',
      sitterName: 'Sarah Johnson',
      sitterAvatar: 'https://via.placeholder.com/60',
      lastMessage: "I'll be there in 10 minutes!",
      timestamp: '2 min ago',
      unreadCount: 2,
      isOnline: true,
      lastBooking: 'Today, 2:00 PM',
    },
    {
      id: '2',
      sitterName: 'Emily Chen',
      sitterAvatar: 'https://via.placeholder.com/60',
      lastMessage: 'The kids had a great time today!',
      timestamp: '1 hour ago',
      unreadCount: 0,
      isOnline: false,
      lastBooking: 'Yesterday, 9:00 AM',
    },
    {
      id: '3',
      sitterName: 'Maria Rodriguez',
      sitterAvatar: 'https://via.placeholder.com/60',
      lastMessage: 'Can you confirm the time for tomorrow?',
      timestamp: '3 hours ago',
      unreadCount: 1,
      isOnline: true,
      lastBooking: 'Tomorrow, 3:00 PM',
    },
  ];

  const tabs = [
    { key: 'all', title: 'All' },
    { key: 'unread', title: 'Unread' },
    { key: 'favorites', title: 'Favorites' },
  ];

  const renderConversationItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.conversationItem}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.sitterAvatar }} style={styles.avatar} />
        <View style={[
          styles.onlineIndicator,
          { backgroundColor: item.isOnline ? '#10B981' : '#94A3B8' }
        ]} />
      </View>
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.sitterName}>{item.sitterName}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.lastBooking}>Last booking: {item.lastBooking}</Text>
      </View>
    </TouchableOpacity>
  );

  const getFilteredConversations = () => {
    switch (activeTab) {
      case 'unread':
        return conversations.filter(conv => conv.unreadCount > 0);
      case 'favorites':
        return conversations.filter(conv => conv.sitterName.includes('Sarah')); // Mock favorites
      default:
        return conversations;
    }
  };

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
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity style={styles.newMessageButton}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search conversations..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabPress={setActiveTab}
              variant="pills"
            />
          </View>

          {/* Conversations List */}
          <View style={styles.conversationsContainer}>
            {getFilteredConversations().length > 0 ? (
              <FlatList
                data={getFilteredConversations()}
                renderItem={renderConversationItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.conversationsList}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles" size={64} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptySubtitle}>
                  {activeTab === 'unread' 
                    ? 'You\'re all caught up!'
                    : 'Start a conversation with your sitters'
                  }
                </Text>
                <Button
                  title="Find Sitters"
                  variant="primary"
                  onPress={() => navigation.navigate('ParentBook' as never)}
                />
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Card style={styles.quickActionsCard}>
              <Text style={styles.quickActionsTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity style={styles.quickAction}>
                  <Ionicons name="calendar" size={24} color="#3A7DFF" />
                  <Text style={styles.quickActionText}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction}>
                  <Ionicons name="star" size={24} color="#FF7DB9" />
                  <Text style={styles.quickActionText}>Rate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction}>
                  <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                  <Text style={styles.quickActionText}>Safety</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction}>
                  <Ionicons name="help-circle" size={24} color="#F59E0B" />
                  <Text style={styles.quickActionText}>Help</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        </View>
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
  newMessageButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  searchContainer: {
    padding: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  conversationsContainer: {
    flex: 1,
  },
  conversationsList: {
    paddingHorizontal: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sitterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  timestamp: {
    fontSize: 12,
    color: '#64748B',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#3A7DFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  lastBooking: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  quickActions: {
    padding: 20,
  },
  quickActionsCard: {
    padding: 20,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ParentMessagesScreen; 