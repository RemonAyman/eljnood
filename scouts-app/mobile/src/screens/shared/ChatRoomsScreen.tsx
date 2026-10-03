import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { useChatStore, getAvailableChatRoomsForUser } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { IconCardSelector } from '../../components/ui/IconCardSelector';
import { ChatMessage, Role } from '../../types';
import {
  subscribeToChatMessages,
  sendChatMessageToFirestore,
  sendNotificationToFirestore,
} from '../../services/firebaseService';
import { BottomNavBar } from '../../components/navigation/BottomNavBar';

const getRoleBadge = (role: Role) => {
  switch (role) {
    case 'ADMIN':
      return { label: 'مسؤول عام 👑', bg: '#DC2626' };
    case 'GROUP_MANAGER':
      return { label: 'قائد عام المجموعة ⚜️', bg: '#8B0000' };
    case 'SECTION_LEADER':
      return { label: 'رئيس قطاع 🛡️', bg: '#7C3AED' };
    case 'LEADER':
      return { label: 'قائد فرقة 🌟', bg: '#D97706' };
    case 'JOWALAH':
      return { label: 'جوال 🧭', bg: '#2563EB' };
    case 'PARENT':
      return { label: 'ولي أمر 👨‍👩‍👦', bg: '#059669' };
    default:
      return { label: 'كشاف ⛺', bg: '#4B5563' };
  }
};

const ChatBubbleItem = React.memo(({ msg, isMe }: { msg: ChatMessage; isMe: boolean }) => {
  const roleBadge = getRoleBadge(msg.senderRole);
  const timeFormatted = useMemo(() => {
    if (!msg.createdAt) return '';
    try {
      const d = new Date(msg.createdAt);
      return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }, [msg.createdAt]);

  return (
    <View
      style={[
        styles.messageWrapper,
        isMe ? styles.myMessageWrapper : styles.otherMessageWrapper,
      ]}
    >
      {!isMe && (
        <View style={styles.senderHeader}>
          <Text style={styles.senderName}>{msg.senderName}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleBadge.bg }]}>
            <Text style={styles.roleBadgeText}>{roleBadge.label}</Text>
          </View>
        </View>
      )}

      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessageBubble : styles.otherMessageBubble,
        ]}
      >
        {msg.mediaType === 'IMAGE' && (
          <View style={styles.mediaImagePlaceholder}>
            <Text style={styles.mediaIcon}>🖼️</Text>
            <Text style={styles.mediaText}>صورة مرفقة من النشاط</Text>
          </View>
        )}
        {msg.mediaType === 'AUDIO' && (
          <View style={styles.voiceNoteRow}>
            <Text style={styles.voiceNotePlay}>▶️</Text>
            <View style={styles.voiceNoteWaveform} />
            <Text style={styles.voiceNoteDuration}>0:14</Text>
          </View>
        )}
        <Text
          style={[
            styles.messageContent,
            isMe ? styles.myMessageContent : styles.otherMessageContent,
          ]}
        >
          {msg.content}
        </Text>
        {timeFormatted ? (
          <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.otherTimeText]}>
            {timeFormatted}
          </Text>
        ) : null}
      </View>
    </View>
  );
});

export const ChatRoomsScreen = ({ navigation }: { navigation?: any }) => {
  const { currentRoomId, messages, sendMessage, setRoom } = useChatStore();
  const currentUser = useAuthStore((s) => s.user);

  const [firestoreMessages, setFirestoreMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Dynamically compute rooms available for current logged-in user
  const userAvailableRooms = useMemo(() => {
    return getAvailableChatRoomsForUser(currentUser);
  }, [currentUser]);

  const roomOptions = useMemo(() => {
    return userAvailableRooms.map((r) => ({
      id: r.id,
      title: r.title,
      icon: r.icon,
      subtitle: r.subtitle,
    }));
  }, [userAvailableRooms]);

  // Ensure current room is valid for this user
  useEffect(() => {
    const isCurrentValid = userAvailableRooms.some((r) => r.id === currentRoomId);
    if (!isCurrentValid && userAvailableRooms.length > 0) {
      setRoom(userAvailableRooms[0].id);
    }
  }, [userAvailableRooms, currentRoomId, setRoom]);

  // Subscribe to real-time messages in Cloud Firestore
  useEffect(() => {
    const unsubscribe = subscribeToChatMessages(currentRoomId, (cloudMsgs) => {
      if (cloudMsgs && cloudMsgs.length > 0) {
        setFirestoreMessages(cloudMsgs as ChatMessage[]);
      } else {
        setFirestoreMessages([]);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [currentRoomId]);

  const displayMessages = useMemo(() => {
    const localRoomMsgs = messages.filter((m) => m.roomId === currentRoomId);
    if (firestoreMessages.length > 0) {
      // Merge unique messages
      const map = new Map<string, ChatMessage>();
      localRoomMsgs.forEach((m) => map.set(m.id, m));
      firestoreMessages.forEach((m) => map.set(m.id, m));
      return Array.from(map.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    return localRoomMsgs;
  }, [messages, firestoreMessages, currentRoomId]);

  const handleSend = useCallback(async () => {
    if (!inputMessage.trim()) return;

    const newMsgData = {
      roomId: currentRoomId,
      senderId: currentUser?.id || `u_${Date.now()}`,
      senderName: currentUser?.name || 'عضو كشفي',
      senderRole: (currentUser?.role as Role) || 'CHILD',
      content: inputMessage.trim(),
    };

    // 1. Local update
    sendMessage(newMsgData);

    // 2. Cloud Firestore Real-time push
    sendChatMessageToFirestore(newMsgData).catch((e) =>
      console.warn('Chat firestore sync:', e)
    );

    // 3. Central Push Notification Broadcast
    sendNotificationToFirestore({
      title: 'رسالة جديدة في الشات 💬',
      body: `${currentUser?.name || 'عضو'}: ${inputMessage.trim()}`,
      type: 'CHAT',
      senderId: currentUser?.id,
      senderName: currentUser?.name,
      roomId: currentRoomId,
    });

    setInputMessage('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [inputMessage, currentRoomId, currentUser, sendMessage]);

  const handleSendVoiceNote = useCallback(() => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const voiceData = {
        roomId: currentRoomId,
        senderId: currentUser?.id || `u_${Date.now()}`,
        senderName: currentUser?.name || 'عضو كشفي',
        senderRole: (currentUser?.role as Role) || 'CHILD',
        content: '🎙️ تسجيل صوتي (0:14 ثانية)',
        mediaType: 'AUDIO' as const,
      };

      sendMessage(voiceData);
      sendChatMessageToFirestore(voiceData);
      Alert.alert('تم بنجاح', 'تم إرسال التسجيل الصوتي 🎙️');
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 1200);
  }, [currentRoomId, currentUser, sendMessage]);

  const handleAttachImage = useCallback(() => {
    Alert.alert('إرفاق وسائط 📷', 'اختر نوع الوسائط للإرسال:', [
      {
        text: 'صورة من المعرض',
        onPress: () => {
          const imgData = {
            roomId: currentRoomId,
            senderId: currentUser?.id || `u_${Date.now()}`,
            senderName: currentUser?.name || 'عضو كشفي',
            senderRole: (currentUser?.role as Role) || 'CHILD',
            content: '📸 أرسل صورة من نشاط اليوم الكشفي',
            mediaType: 'IMAGE' as const,
          };
          sendMessage(imgData);
          sendChatMessageToFirestore(imgData);
          flatListRef.current?.scrollToEnd({ animated: true });
        },
      },
      {
        text: 'مستند PDF',
        onPress: () => {
          const docData = {
            roomId: currentRoomId,
            senderId: currentUser?.id || `u_${Date.now()}`,
            senderName: currentUser?.name || 'عضو كشفي',
            senderRole: (currentUser?.role as Role) || 'CHILD',
            content: '📑 مرفق: جدول الأنشطة الأسبوعية.pdf',
            mediaType: 'DOCUMENT' as const,
          };
          sendMessage(docData);
          sendChatMessageToFirestore(docData);
          flatListRef.current?.scrollToEnd({ animated: true });
        },
      },
      { text: 'إلغاء', style: 'cancel' },
    ]);
  }, [currentRoomId, currentUser, sendMessage]);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const isMe = item.senderId === currentUser?.id;
      return <ChatBubbleItem msg={item} isMe={isMe} />;
    },
    [currentUser]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>مجموعة جنود المسيح الكشفية</Text>
        <Text style={styles.headerTitle}>غرف التواصل والشات اللحظي 💬</Text>
        {currentUser?.sectionName ? (
          <Text style={styles.headerUserTag}>
            قطاعك الحالي: {currentUser.sectionName}
          </Text>
        ) : null}
      </View>

      {/* Room Selector using IconCardSelector */}
      <View style={styles.roomSelectorCard}>
        <Text style={styles.sectionTitle}>اختر الغرفة الكشفية:</Text>
        <IconCardSelector
          options={roomOptions}
          selectedId={currentRoomId}
          onSelect={(id) => setRoom(id)}
        />
      </View>

      {/* Messages Stream - Virtualized FlatList */}
      <FlatList
        ref={flatListRef}
        data={displayMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messagesContainer}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>لا توجد رسائل سابقة في هذه الغرفة</Text>
            <Text style={styles.emptySubText}>كن أول من يشارك ويبدأ المحادثة الآن!</Text>
          </View>
        }
      />

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={handleAttachImage}
          activeOpacity={0.7}
        >
          <Text style={styles.mediaButtonText}>📎</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="اكتب رسالتك الكشفية..."
          placeholderTextColor="#9CA3AF"
          value={inputMessage}
          onChangeText={setInputMessage}
          multiline
        />

        <TouchableOpacity
          style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
          onPress={handleSendVoiceNote}
          activeOpacity={0.7}
        >
          <Text style={styles.voiceButtonText}>{isRecording ? '🔴' : '🎙️'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendButton, !inputMessage.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputMessage.trim()}
          activeOpacity={0.7}
        >
          <Text style={styles.sendButtonText}>إرسال</Text>
        </TouchableOpacity>
      </View>
      <BottomNavBar navigation={navigation} currentRoute="ChatRooms" />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  header: {
    backgroundColor: '#8B0000',
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerSubtitle: {
    color: '#D4A359',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerUserTag: {
    color: '#E5E7EB',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  roomSelectorCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 6,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8B0000',
    textAlign: 'right',
    marginBottom: 6,
  },
  messagesContainer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexGrow: 1,
  },
  emptyMessages: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  messageWrapper: {
    marginVertical: 4,
    maxWidth: '82%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-start',
  },
  otherMessageWrapper: {
    alignSelf: 'flex-end',
  },
  senderHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  myMessageBubble: {
    backgroundColor: '#8B0000',
    borderBottomLeftRadius: 2,
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomRightRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageContent: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
  },
  myMessageContent: {
    color: '#FFFFFF',
  },
  otherMessageContent: {
    color: '#1F2937',
  },
  timeText: {
    fontSize: 9,
    marginTop: 4,
    textAlign: 'left',
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimeText: {
    color: '#9CA3AF',
  },
  mediaImagePlaceholder: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 6,
  },
  mediaIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  mediaText: {
    fontSize: 11,
    color: '#4B5563',
  },
  voiceNoteRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  voiceNotePlay: {
    fontSize: 18,
  },
  voiceNoteWaveform: {
    flex: 1,
    height: 4,
    backgroundColor: '#D4A359',
    borderRadius: 2,
  },
  voiceNoteDuration: {
    fontSize: 10,
    color: '#D4A359',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 68,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 6,
  },
  mediaButton: {
    padding: 6,
  },
  mediaButtonText: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxHeight: 80,
    textAlign: 'right',
    fontSize: 13,
    color: '#1F2937',
  },
  voiceButton: {
    padding: 6,
    borderRadius: 16,
  },
  voiceButtonRecording: {
    backgroundColor: '#FEE2E2',
  },
  voiceButtonText: {
    fontSize: 18,
  },
  sendButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
