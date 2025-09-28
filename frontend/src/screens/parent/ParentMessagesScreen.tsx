import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, SlideInRight, SlideInLeft } from 'react-native-reanimated';
import { AnimatedButton, AnimatedCard, AnimatedNotificationBadge, AnimatedGradientBackground } from '../../components/AnimatedComponents';
import FeedbackService from '../../services/feedback.service';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isUrgent: boolean;
  type: 'text' | 'image' | 'location' | 'emergency';
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  isUrgent: boolean;
}

const ParentMessagesScreen: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      participantId: 'sitter1',
      participantName: 'Sarah Johnson',
      participantAvatar: 'https://example.com/sarah.jpg',
      lastMessage: "I'll be there in 10 minutes!",
      lastMessageTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      unreadCount: 2,
      isOnline: true,
      isUrgent: false,
    },
    {
      id: '2',
      participantId: 'sitter2',
      participantName: 'Michael Chen',
      participantAvatar: 'https://example.com/michael.jpg',
      lastMessage: "Everything is going great with Emma!",
      lastMessageTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      unreadCount: 0,
      isOnline: false,
      isUrgent: false,
    },
    {
      id: '3',
      participantId: 'sitter3',
      participantName: 'Emma Rodriguez',
      participantAvatar: 'https://example.com/emma.jpg',
      lastMessage: "URGENT: Need to contact you immediately",
      lastMessageTime: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      unreadCount: 1,
      isOnline: true,
      isUrgent: true,
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const feedbackService = FeedbackService.getInstance();

  useEffect(() => {
    feedbackService.trackScreen('ParentMessagesScreen');
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      // Load messages for selected conversation
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadMessages = (conversationId: string) => {
    // Mock messages data
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: 'sitter1',
        senderName: 'Sarah Johnson',
        senderAvatar: 'https://example.com/sarah.jpg',
        content: "Hi! I'm on my way to your location.",
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        isRead: true,
        isUrgent: false,
        type: 'text',
      },
      {
        id: '2',
        senderId: 'parent',
        senderName: 'You',
        senderAvatar: 'https://example.com/parent.jpg',
        content: "Perfect! See you soon.",
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        isRead: true,
        isUrgent: false,
        type: 'text',
      },
      {
        id: '3',
        senderId: 'sitter1',
        senderName: 'Sarah Johnson',
        senderAvatar: 'https://example.com/sarah.jpg',
        content: "I'll be there in 10 minutes!",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        isRead: false,
        isUrgent: false,
        type: 'text',
      },
    ];
    
    setMessages(mockMessages);
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Mark messages as read
    if (conversation.unreadCount > 0) {
      setConversations(prev => prev.map(conv => 
        conv.id === conversation.id 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    }
    
    feedbackService.trackAction('conversation_opened', 'ParentMessagesScreen', {
      conversationId: conversation.id,
      participantId: conversation.participantId,
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'parent',
      senderName: 'You',
      senderAvatar: 'https://example.com/parent.jpg',
      content: newMessage.trim(),
      timestamp: new Date(),
      isRead: false,
      isUrgent: false,
      type: 'text',
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Update conversation
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id
        ? { ...conv, lastMessage: newMessage.trim(), lastMessageTime: new Date() }
        : conv
    ));

    feedbackService.trackAction('message_sent', 'ParentMessagesScreen', {
      conversationId: selectedConversation.id,
      messageLength: newMessage.length,
    });
  };

  const handleCall = () => {
    if (!selectedConversation) return;
    Alert.alert('Voice Call', `Starting a secure call with ${selectedConversation.participantName}.`);
  };

  const handleVideoCall = () => {
    if (!selectedConversation) return;
    Alert.alert('Video Call', `Opening a live video session with ${selectedConversation.participantName}.`);
  };

  const handleAttachment = () => {
    Alert.alert('Add Attachment', 'Attachment tools will let you share files, locations, and caregiver checklists.');
  };

  const handleCamera = () => {
    Alert.alert('Camera', 'Camera access will allow quick photo or video updates during sessions.');
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setMessages([]);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const renderConversationsList = () => (
    <Animated.View entering={FadeInUp.delay(100)} style={styles.conversationsContainer}>
      <Text style={styles.sectionTitle}>Messages</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {conversations.map((conversation, index) => (
          <AnimatedCard
            key={conversation.id}
            direction="up"
            delay={index * 100}
            style={[
              styles.conversationCard,
              conversation.isUrgent && styles.urgentConversation,
            ]}
          >
            <TouchableOpacity
              style={styles.conversationContent}
              onPress={() => handleConversationSelect(conversation)}
              activeOpacity={0.7}
            >
              <View style={styles.conversationHeader}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={24} color="#3A7DFF" />
                  </View>
                  {conversation.isOnline && (
                    <View style={styles.onlineIndicator} />
                  )}
                </View>
                
                <View style={styles.conversationInfo}>
                  <View style={styles.conversationHeaderRow}>
                    <Text style={styles.participantName}>{conversation.participantName}</Text>
                    <Text style={styles.lastMessageTime}>
                      {formatTime(conversation.lastMessageTime)}
                    </Text>
                  </View>
                  
                  <View style={styles.conversationFooter}>
                    <Text 
                      style={[
                        styles.lastMessage,
                        conversation.isUrgent && styles.urgentMessage,
                      ]}
                      numberOfLines={1}
                    >
                      {conversation.lastMessage}
                    </Text>
                    
                    {conversation.unreadCount > 0 && (
                      <AnimatedNotificationBadge
                        count={conversation.unreadCount}
                        size="small"
                        style={styles.unreadBadge}
                      />
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </AnimatedCard>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderChatHeader = () => (
    <Animated.View entering={SlideInRight.delay(100)} style={styles.chatHeader}>
      <TouchableOpacity onPress={handleBackToConversations} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      <View style={styles.chatHeaderInfo}>
        <View style={styles.chatAvatar}>
          <Ionicons name="person" size={24} color="#3A7DFF" />
        </View>
        <View style={styles.chatHeaderText}>
          <Text style={styles.chatParticipantName}>{selectedConversation?.participantName}</Text>
          <Text style={styles.chatStatus}>
            {selectedConversation?.isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>
      
      <View style={styles.chatActions}>
        <TouchableOpacity style={styles.chatActionButton} onPress={handleCall}>
          <Ionicons name="call" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatActionButton} onPress={handleVideoCall}>
          <Ionicons name="videocam" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderMessages = () => (
    <Animated.View entering={SlideInRight.delay(200)} style={styles.messagesContainer}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message, index) => (
          <Animated.View
            key={message.id}
            entering={SlideInLeft.delay(index * 50)}
            style={[
              styles.messageContainer,
              message.senderId === 'parent' ? styles.sentMessage : styles.receivedMessage,
            ]}
          >
            <View style={[
              styles.messageBubble,
              message.senderId === 'parent' ? styles.sentBubble : styles.receivedBubble,
              message.isUrgent && styles.urgentBubble,
            ]}>
              <Text style={[
                styles.messageText,
                message.isUrgent && styles.urgentMessageText,
              ]}>
                {message.content}
              </Text>
              <Text style={styles.messageTime}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderMessageInput = () => (
    <Animated.View entering={SlideInRight.delay(300)} style={styles.messageInputContainer}>
      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.inputAction} onPress={handleAttachment}>
          <Ionicons name="add" size={24} color="#6B7280" />
        </TouchableOpacity>
        
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
            maxLength={500}
          />
        </View>
        
        <TouchableOpacity style={styles.inputAction} onPress={handleCamera}>
          <Ionicons name="camera" size={24} color="#6B7280" />
        </TouchableOpacity>
        
        <AnimatedButton
          title="Send"
          onPress={handleSendMessage}
          variant="primary"
          size="small"
          disabled={!newMessage.trim()}
        />
      </View>
    </Animated.View>
  );

  return (
    <AnimatedGradientBackground>
      <SafeAreaView style={styles.container}>
        {selectedConversation ? (
          <>
            {renderChatHeader()}
            {renderMessages()}
            {renderMessageInput()}
          </>
        ) : (
          renderConversationsList()
        )}
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  conversationsContainer: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20 },
  conversationCard: { marginBottom: 12 },
  urgentConversation: { borderLeftWidth: 4, borderLeftColor: '#EF4444' },
  conversationContent: { padding: 16 },
  conversationHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative', marginRight: 12 },
  avatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: '#F3F4F6', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationInfo: { flex: 1 },
  conversationHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 4 
  },
  participantName: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  lastMessageTime: { fontSize: 12, color: '#FFFFFF', opacity: 0.7 },
  conversationFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  lastMessage: { 
    flex: 1, 
    fontSize: 14, 
    color: '#FFFFFF', 
    opacity: 0.8,
    marginRight: 8,
  },
  urgentMessage: { color: '#EF4444', fontWeight: '600' },
  unreadBadge: { marginLeft: 8 },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: { marginRight: 16 },
  chatHeaderInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  chatAvatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#F3F4F6', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 12,
  },
  chatHeaderText: { flex: 1 },
  chatParticipantName: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  chatStatus: { fontSize: 12, color: '#FFFFFF', opacity: 0.7 },
  chatActions: { flexDirection: 'row', gap: 12 },
  chatActionButton: { padding: 8 },
  messagesContainer: { flex: 1 },
  messagesList: { flex: 1 },
  messagesContent: { padding: 16 },
  messageContainer: { marginBottom: 12 },
  sentMessage: { alignItems: 'flex-end' },
  receivedMessage: { alignItems: 'flex-start' },
  messageBubble: { 
    maxWidth: '80%', 
    padding: 12, 
    borderRadius: 16,
  },
  sentBubble: { backgroundColor: '#3A7DFF' },
  receivedBubble: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  urgentBubble: { backgroundColor: '#EF4444' },
  messageText: { fontSize: 14, color: '#FFFFFF', marginBottom: 4 },
  urgentMessageText: { fontWeight: '600' },
  messageTime: { fontSize: 10, color: '#FFFFFF', opacity: 0.6 },
  messageInputContainer: { 
    padding: 16, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255, 255, 255, 0.1)' 
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  inputAction: { padding: 8 },
  textInputContainer: { 
    flex: 1, 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    borderRadius: 20, 
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: { 
    fontSize: 16, 
    color: '#FFFFFF', 
    maxHeight: 100,
    textAlignVertical: 'top',
  },
});

export default ParentMessagesScreen; 
