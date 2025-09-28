import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../components/Button';
import { NeonBackground } from '../../components/ui/NeonBackground';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedCard, AnimatedNotificationBadge } from '../../components/AnimatedComponents';
import FeedbackService from '../../services/feedback.service';
import { theme } from '../../styles/theme';

type MessageType = 'text' | 'image' | 'location' | 'emergency';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isUrgent: boolean;
  type: MessageType;
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

const now = Date.now();

const initialConversations: Conversation[] = [
  {
    id: '1',
    participantId: 'sitter1',
    participantName: 'Sarah Johnson',
    participantAvatar: 'https://i.pravatar.cc/120?img=47',
    lastMessage: 'Finishing story time now - lights out in 10.',
    lastMessageTime: new Date(now - 5 * 60 * 1000),
    unreadCount: 2,
    isOnline: true,
    isUrgent: false,
  },
  {
    id: '2',
    participantId: 'sitter2',
    participantName: 'Emily Chen',
    participantAvatar: 'https://i.pravatar.cc/120?img=32',
    lastMessage: 'Uploading tonight\'s activity log for you.',
    lastMessageTime: new Date(now - 40 * 60 * 1000),
    unreadCount: 0,
    isOnline: false,
    isUrgent: false,
  },
  {
    id: '3',
    participantId: 'sitter3',
    participantName: 'Marcus Lee',
    participantAvatar: 'https://i.pravatar.cc/120?img=15',
    lastMessage: 'Urgent: Liam spiked a fever, calling now.',
    lastMessageTime: new Date(now - 2 * 60 * 1000),
    unreadCount: 1,
    isOnline: true,
    isUrgent: true,
  },
];

const ParentMessagesScreen: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>(() => initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messageListRef = useRef<ScrollView | null>(null);
  const feedbackService = useMemo(() => FeedbackService.getInstance(), []);

  const mockMessagesByConversation = useMemo<Record<string, Message[]>>(() => {
    const reference = Date.now();
    return {
      '1': [
        {
          id: '1-1',
          senderId: 'sitter1',
          senderName: 'Sarah Johnson',
          senderAvatar: 'https://i.pravatar.cc/120?img=47',
          content: 'Hi! The concierge let me in, heading up the elevator now.',
          timestamp: new Date(reference - 35 * 60 * 1000),
          isRead: true,
          isUrgent: false,
          type: 'text',
        },
        {
          id: '1-2',
          senderId: 'parent',
          senderName: 'You',
          senderAvatar: 'https://i.pravatar.cc/120?img=5',
          content: 'Great! Door code is still 5120. Emma is working on her coloring book.',
          timestamp: new Date(reference - 32 * 60 * 1000),
          isRead: true,
          isUrgent: false,
          type: 'text',
        },
        {
          id: '1-3',
          senderId: 'sitter1',
          senderName: 'Sarah Johnson',
          senderAvatar: 'https://i.pravatar.cc/120?img=47',
          content: 'All settled! We just finished dinner and are starting the bedtime routine.',
          timestamp: new Date(reference - 14 * 60 * 1000),
          isRead: false,
          isUrgent: false,
          type: 'text',
        },
        {
          id: '1-4',
          senderId: 'sitter1',
          senderName: 'Sarah Johnson',
          senderAvatar: 'https://i.pravatar.cc/120?img=47',
          content: 'Sent you a quick snap of Emma\'s galaxy drawing - so proud!',
          timestamp: new Date(reference - 12 * 60 * 1000),
          isRead: false,
          isUrgent: false,
          type: 'image',
        },
      ],
      '2': [
        {
          id: '2-1',
          senderId: 'sitter2',
          senderName: 'Emily Chen',
          senderAvatar: 'https://i.pravatar.cc/120?img=32',
          content: 'Uploaded the STEM activity summary and snack log to your dashboard.',
          timestamp: new Date(reference - 48 * 60 * 1000),
          isRead: true,
          isUrgent: false,
          type: 'text',
        },
        {
          id: '2-2',
          senderId: 'parent',
          senderName: 'You',
          senderAvatar: 'https://i.pravatar.cc/120?img=5',
          content: 'Perfect, thank you! Can you share their location check-in before bedtime?',
          timestamp: new Date(reference - 46 * 60 * 1000),
          isRead: true,
          isUrgent: false,
          type: 'text',
        },
        {
          id: '2-3',
          senderId: 'sitter2',
          senderName: 'Emily Chen',
          senderAvatar: 'https://i.pravatar.cc/120?img=32',
          content: 'Location ping shared - we\'re back home and starting wind-down yoga.',
          timestamp: new Date(reference - 42 * 60 * 1000),
          isRead: true,
          isUrgent: false,
          type: 'location',
        },
      ],
      '3': [
        {
          id: '3-1',
          senderId: 'sitter3',
          senderName: 'Marcus Lee',
          senderAvatar: 'https://i.pravatar.cc/120?img=15',
          content: 'Liam feels warm - temp is 100.4 F. Starting a cool cloth now.',
          timestamp: new Date(reference - 8 * 60 * 1000),
          isRead: false,
          isUrgent: true,
          type: 'text',
        },
        {
          id: '3-2',
          senderId: 'sitter3',
          senderName: 'Marcus Lee',
          senderAvatar: 'https://i.pravatar.cc/120?img=15',
          content: 'Emergency protocol triggered. Connecting you in a video call.',
          timestamp: new Date(reference - 2 * 60 * 1000),
          isRead: false,
          isUrgent: true,
          type: 'emergency',
        },
      ],
    };
  }, []);

  useEffect(() => {
    feedbackService.trackScreen('ParentMessagesScreen');
  }, [feedbackService]);

  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  const loadMessages = useCallback(
    (conversationId: string) => {
      const preset = mockMessagesByConversation[conversationId] ?? [];
      const cloned = preset.map(message => ({ ...message, timestamp: new Date(message.timestamp) }));
      setMessages(cloned);
    },
    [mockMessagesByConversation],
  );

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      setConversations(prev =>
        prev.map(conversation =>
          conversation.id === selectedConversation.id
            ? { ...conversation, unreadCount: 0, isUrgent: false }
            : conversation,
        ),
      );
    }
  }, [selectedConversation, loadMessages]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const formatRelativeTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / (60 * 1000));
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatMessageTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation({ ...conversation, unreadCount: 0, isUrgent: false });
  };

  const handleSendMessage = () => {
    if (!selectedConversation || !newMessage.trim()) {
      return;
    }

    const trimmed = newMessage.trim();
    const timestamp = new Date();
    const outgoing: Message = {
      id: `${selectedConversation.id}-${timestamp.getTime()}`,
      senderId: 'parent',
      senderName: 'You',
      senderAvatar: 'https://i.pravatar.cc/120?img=5',
      content: trimmed,
      timestamp,
      isRead: true,
      isUrgent: false,
      type: 'text',
    };

    setMessages(prev => [...prev, outgoing]);
    setNewMessage('');
    setIsTyping(false);

    setConversations(prev =>
      prev.map(conversation =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              lastMessage: trimmed,
              lastMessageTime: timestamp,
              unreadCount: 0,
              isUrgent: false,
            }
          : conversation,
      ),
    );

    setSelectedConversation(prev =>
      prev
        ? {
            ...prev,
            lastMessage: trimmed,
            lastMessageTime: timestamp,
            unreadCount: 0,
            isUrgent: false,
          }
        : prev,
    );
  };

  const handleStartVideoCall = () => {
    if (!selectedConversation) return;
    Alert.alert('Launching Video Call', `Connecting you with ${selectedConversation.participantName} now.`);
  };

  const handleShareLocation = () => {
    Alert.alert('Share Location', 'Real-time location stream is active for the sitter.');
  };

  const handleQuickCheckIn = () => {
    if (!selectedConversation) return;
    setNewMessage('How are things going right now?');
    setIsTyping(true);
  };

  const handleAttachment = () => {
    Alert.alert('Attachment', 'Attachment composer coming soon.');
  };

  const renderConversationCard = (conversation: Conversation) => {
    const isActive = selectedConversation?.id === conversation.id;
    return (
      <AnimatedCard key={conversation.id} direction="right">
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.conversationCard,
            isActive && styles.conversationCardActive,
            conversation.isUrgent && styles.conversationCardUrgent,
          ]}
          onPress={() => handleSelectConversation(conversation)}
        >
          <View style={styles.avatarContainer}>
            <Image source={{ uri: conversation.participantAvatar }} style={styles.avatar} />
            {conversation.isOnline && <View style={styles.onlineDot} />}
            <AnimatedNotificationBadge count={conversation.unreadCount} style={styles.badge} />
          </View>
          <View style={styles.conversationInfo}>
            <View style={styles.conversationTopRow}>
              <Text style={styles.participantName}>{conversation.participantName}</Text>
              <Text style={styles.conversationTime}>{formatRelativeTime(conversation.lastMessageTime)}</Text>
            </View>
            <Text
              numberOfLines={1}
              style={[styles.lastMessage, conversation.isUrgent && styles.lastMessageUrgent]}
            >
              {conversation.lastMessage}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Ionicons name="shield-checkmark" size={14} color={theme.colors.accent} />
                <Text style={styles.metaPillText}>Verified sitter</Text>
              </View>
              {conversation.isUrgent && (
                <View style={styles.metaPillUrgent}>
                  <Ionicons name="warning" size={14} color={theme.colors.white} />
                  <Text style={styles.metaPillUrgentText}>Urgent</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </AnimatedCard>
    );
  };

  const renderMessageBubble = (message: Message) => {
    const isParent = message.senderId === 'parent';
    return (
      <View
        key={message.id}
        style={[styles.messageRow, isParent ? styles.messageRowOutgoing : styles.messageRowIncoming]}
      >
        {!isParent && <Image source={{ uri: message.senderAvatar }} style={styles.messageAvatar} />}
        <View>
          <View
            style={[
              styles.messageBubble,
              isParent ? styles.bubbleOutgoing : styles.bubbleIncoming,
              message.isUrgent && styles.bubbleUrgent,
            ]}
          >
            <Text style={styles.messageText}>{message.content}</Text>
            <View style={styles.messageMetaRow}>
              {message.type === 'location' && (
                <View style={styles.metaIconRow}>
                  <Ionicons name="location" size={14} color={theme.colors.white} />
                  <Text style={styles.metaIconText}>Location ping</Text>
                </View>
              )}
              {message.type === 'image' && (
                <View style={styles.metaIconRow}>
                  <Ionicons name="image" size={14} color={theme.colors.white} />
                  <Text style={styles.metaIconText}>Media shared</Text>
                </View>
              )}
              {message.type === 'emergency' && (
                <View style={styles.metaIconRow}>
                  <Ionicons name="warning" size={14} color={theme.colors.white} />
                  <Text style={styles.metaIconText}>Emergency</Text>
                </View>
              )}
              <Text style={styles.messageTimestamp}>{formatMessageTime(message.timestamp)}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    return (
      <View style={[styles.messageRow, styles.messageRowOutgoing]}>
        <View style={[styles.messageBubble, styles.bubbleOutgoing, styles.typingBubble]}>
          <View style={styles.typingDots}>
            <View style={styles.typingDot} />
            <View style={[styles.typingDot, styles.typingDotMiddle]} />
            <View style={styles.typingDot} />
          </View>
          <Text style={styles.typingText}>Drafting message...</Text>
        </View>
      </View>
    );
  };

  const renderChatComposer = () => (
    <View style={styles.composerContainer}>
      <TouchableOpacity style={styles.composerIconButton} onPress={handleAttachment}>
        <Ionicons name="add" size={20} color={theme.colors.white} />
      </TouchableOpacity>
      <View style={styles.inputWrapper}>
        <TextInput
          value={newMessage}
          onChangeText={text => {
            setNewMessage(text);
            setIsTyping(text.length > 0);
          }}
          placeholder="Send a luminous update..."
          placeholderTextColor="rgba(226,232,240,0.5)"
          multiline
          style={styles.textInput}
        />
      </View>
      <TouchableOpacity
        style={[styles.composerIconButton, styles.sendButton]}
        onPress={handleSendMessage}
      >
        <Ionicons name="send" size={18} color={theme.colors.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <NeonBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard style={styles.headerCard} intensity="bold">
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>Guardian Messages</Text>
                <Text style={styles.subtitle}>
                  Coordinate with sitters, receive emergency alerts, and sync session insights in real-time.
                </Text>
              </View>
              <View style={styles.headerActions}>
                <Button
                  title="SOS"
                  variant="secondary"
                  size="small"
                  onPress={() => Alert.alert('Guardian SOS', 'Emergency macro dispatched to on-call sitters.')}
                />
                <Button
                  title="Check-In"
                  variant="primary"
                  size="small"
                  onPress={handleQuickCheckIn}
                />
              </View>
            </View>
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>03</Text>
                <Text style={styles.metricLabel}>Active threads</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>02</Text>
                <Text style={styles.metricLabel}>Unread alerts</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>Live</Text>
                <Text style={styles.metricLabel}>Telemetry feed</Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Conversations</Text>
                <Text style={styles.sectionSubtitle}>Prioritize urgent pings and keep your sitter network glowing.</Text>
              </View>
              <TouchableOpacity style={styles.filterPill} onPress={handleShareLocation}>
                <Ionicons name="navigate" size={16} color={theme.colors.white} />
                <Text style={styles.filterPillText}>Share travel path</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.conversationList}>
              {conversations.map(renderConversationCard)}
            </View>
          </GlassCard>

          {selectedConversation && (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
              style={styles.keyboardAvoid}
            >
              <GlassCard style={styles.sectionCard} intensity="soft">
                <View style={styles.chatHeader}>
                  <View style={styles.chatIdentity}>
                    <Image
                      source={{ uri: selectedConversation.participantAvatar }}
                      style={styles.chatAvatar}
                    />
                    <View>
                      <Text style={styles.chatName}>{selectedConversation.participantName}</Text>
                      <Text style={styles.chatStatus}>
                        {selectedConversation.isOnline ? 'Online now - Live telemetry synced' : 'Offline - Last seen ' + formatRelativeTime(selectedConversation.lastMessageTime)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.chatActions}>
                    <TouchableOpacity style={styles.chatActionButton} onPress={handleStartVideoCall}>
                      <Ionicons name="videocam" size={18} color={theme.colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.chatActionButton} onPress={handleShareLocation}>
                      <Ionicons name="navigate" size={18} color={theme.colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.chatActionButton} onPress={() => Alert.alert('Archive', 'Conversation archived to your records.') }>
                      <Ionicons name="archive" size={18} color={theme.colors.white} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.messageContainer}>
                  <ScrollView
                    ref={ref => {
                      messageListRef.current = ref;
                    }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.messageContent}
                  >
                    {messages.map(renderMessageBubble)}
                    {renderTypingIndicator()}
                  </ScrollView>
                </View>

                {renderChatComposer()}
              </GlassCard>
            </KeyboardAvoidingView>
          )}
        </ScrollView>
      </SafeAreaView>
    </NeonBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  headerCard: {
    gap: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
  },
  headerActions: {
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.bold,
  },
  subtitle: {
    marginTop: 6,
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(226,232,240,0.72)',
    lineHeight: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  metricItem: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  metricValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  metricLabel: {
    marginTop: 4,
    fontSize: theme.typography.fontSize.xs,
    color: 'rgba(226,232,240,0.65)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionCard: {
    gap: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(226,232,240,0.7)',
    lineHeight: 20,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  filterPillText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  conversationList: {
    gap: theme.spacing.md,
  },
  conversationCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(8, 5, 36, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
  },
  conversationCardActive: {
    borderColor: 'rgba(124, 58, 237, 0.6)',
    shadowColor: 'rgba(124, 58, 237, 0.55)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
  },
  conversationCardUrgent: {
    borderColor: 'rgba(248, 113, 113, 0.7)',
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  conversationInfo: {
    flex: 1,
    gap: 6,
  },
  conversationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  conversationTime: {
    fontSize: theme.typography.fontSize.xs,
    color: 'rgba(226,232,240,0.6)',
  },
  lastMessage: {
    color: 'rgba(226,232,240,0.75)',
    fontSize: theme.typography.fontSize.sm,
  },
  lastMessageUrgent: {
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
  },
  metaPillText: {
    color: theme.colors.accent,
    fontSize: theme.typography.fontSize.xs,
  },
  metaPillUrgent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(248, 113, 113, 0.28)',
  },
  metaPillUrgentText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  keyboardAvoid: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  chatName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  chatStatus: {
    marginTop: 4,
    fontSize: theme.typography.fontSize.xs,
    color: 'rgba(226,232,240,0.6)',
  },
  chatActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  chatActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    maxHeight: 420,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(8, 5, 36, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  messageContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  messageRowOutgoing: {
    justifyContent: 'flex-end',
  },
  messageRowIncoming: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginTop: 4,
  },
  messageBubble: {
    maxWidth: 260,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bubbleOutgoing: {
    backgroundColor: 'rgba(124, 58, 237, 0.45)',
  },
  bubbleIncoming: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  bubbleUrgent: {
    backgroundColor: 'rgba(248, 113, 113, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.9)',
  },
  messageText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  messageMetaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIconText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
  },
  messageTimestamp: {
    color: 'rgba(226,232,240,0.65)',
    fontSize: theme.typography.fontSize.xs,
    marginLeft: 'auto',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.white,
    opacity: 0.6,
  },
  typingDotMiddle: {
    opacity: 1,
  },
  typingText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    padding: 12,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(8, 5, 36, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
  },
  composerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    backgroundColor: theme.colors.accent,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textInput: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
    maxHeight: 120,
  },
});

export default ParentMessagesScreen;



