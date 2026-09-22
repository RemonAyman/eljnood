import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { IconCardSelector } from '../../components/ui/IconCardSelector';
import { ChatMessage, Role } from '../../types';

const ROOM_OPTIONS = [
  { id: 'GENERAL', title: 'الغرفة العامة', icon: '📢', subtitle: 'إعلانات وأنشطة المجموعة' },
  { id: 'LEADERS', title: 'غرفة القادة', icon: '⚜️', subtitle: 'الاجتماعات والتنسيق الداخلي' },
  { id: 'SQUAD', title: 'غرفة الفرقة', icon: '⛺', subtitle: 'أنشطة الطليعة والفرقة' },
  { id: 'PARENTS', title: 'أولياء الأمور', icon: '👨‍👩‍👧', subtitle: 'التواصل والاستفسارات' },
];

export const ChatRoomsScreen = () => {
  const { currentRoomId, messages, sendMessage, setRoom } = useChatStore();
  const currentUser = useAuthStore((s) => s.user);

  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const roomMessages = messages.filter((m) => m.roomId === currentRoomId);

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    sendMessage({
      roomId: currentRoomId,
      senderId: currentUser?.id || 'u1',
      senderName: currentUser?.name || 'كشاف نشط',
      senderRole: (currentUser?.role as Role) || 'CHILD',
      content: inputMessage.trim(),
    });

    setInputMessage('');
  };

  const handleSendVoiceNote = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      sendMessage({
        roomId: currentRoomId,
        senderId: currentUser?.id || 'u1',
        senderName: currentUser?.name || 'كشاف نشط',
        senderRole: (currentUser?.role as Role) || 'CHILD',
        content: '🎙️ تسجيل صوتي (0:14 ثانية)',
        mediaType: 'AUDIO',
      });
      Alert.alert('تم بنجاح', 'تم إرسال التسجيل الصوتي 🎙️');
    }, 1500);
  };

  const handleAttachImage = () => {
    Alert.alert('إرفاق وسائط 📷', 'اختر نوع الوسائط للإرسال:', [
      {
        text: 'صورة من المعرض',
        onPress: () => {
          sendMessage({
            roomId: currentRoomId,
            senderId: currentUser?.id || 'u1',
            senderName: currentUser?.name || 'كشاف نشط',
            senderRole: (currentUser?.role as Role) || 'CHILD',
            content: '📸 أرسل صورة من نشاط اليوم',
            mediaType: 'IMAGE',
          });
        },
      },
      {
        text: 'مستند PDF',
        onPress: () => {
          sendMessage({
            roomId: currentRoomId,
            senderId: currentUser?.id || 'u1',
            senderName: currentUser?.name || 'كشاف نشط',
            senderRole: (currentUser?.role as Role) || 'CHILD',
            content: '📑 مرفق: جدول الفعاليات الأسبوعي.pdf',
            mediaType: 'DOCUMENT',
          });
        },
      },
      { text: 'إلغاء', style: 'cancel' },
    ]);
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'مسؤول عام 👑', bg: '#DC2626' };
      case 'GROUP_MANAGER':
        return { label: 'قائد عام المجموعة ⚜️', bg: '#8B0000' };
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>مجموعة جنود المسيح الكشفية</Text>
        <Text style={styles.headerTitle}>غرف التواصل والدردشة الكشفية 💬</Text>
      </View>

      {/* Room Selector using IconCardSelector */}
      <View style={styles.roomSelectorCard}>
        <Text style={styles.sectionTitle}>1️⃣ اختر الغرفة</Text>
        <IconCardSelector
          options={ROOM_OPTIONS}
          selectedId={currentRoomId}
          onSelect={(id) => setRoom(id)}
        />
      </View>

      {/* Messages Stream */}
      <ScrollView
        contentContainerStyle={styles.messagesContainer}
        ref={(ref) => ref?.scrollToEnd({ animated: true })}
      >
        {roomMessages.length === 0 ? (
          <View style={styles.emptyMessages}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>لا توجد رسائل سابقة في هذه الغرفة</Text>
            <Text style={styles.emptySubText}>كن أول من يبدأ المحادثة الآن!</Text>
          </View>
        ) : (
          roomMessages.map((msg) => {
            const isMe = msg.senderId === (currentUser?.id || 'u1');
            const roleBadge = getRoleBadge(msg.senderRole);

            return (
              <View
                key={msg.id}
                style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.otherMessageWrapper]}
              >
                {!isMe && (
                  <View style={styles.senderHeader}>
                    <Text style={styles.senderName}>{msg.senderName}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: roleBadge.bg }]}>
                      <Text style={styles.roleBadgeText}>{roleBadge.label}</Text>
                    </View>
                  </View>
                )}

                <View style={[styles.messageBubble, isMe ? styles.myMessageBubble : styles.otherMessageBubble]}>
                  {msg.mediaType === 'IMAGE' && (
                    <View style={styles.mediaImagePlaceholder}>
                      <Text style={styles.mediaIcon}>🖼️</Text>
                      <Text style={styles.mediaText}>صورة مرفقة</Text>
                    </View>
                  )}
                  {msg.mediaType === 'AUDIO' && (
                    <View style={styles.voiceNoteRow}>
                      <Text style={styles.voiceNotePlay}>▶️</Text>
                      <View style={styles.voiceNoteWaveform} />
                      <Text style={styles.voiceNoteDuration}>0:14</Text>
                    </View>
                  )}
                  <Text style={[styles.messageContent, isMe ? styles.myMessageContent : styles.otherMessageContent]}>
                    {msg.content}
                  </Text>
                  <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.otherMessageTime]}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Chat Input Bar */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachBtn} onPress={handleAttachImage}>
          <Text style={styles.attachBtnIcon}>📎</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.inputField}
          placeholder="اكتب رسالتك الكشفية هنا..."
          placeholderTextColor="#888"
          value={inputMessage}
          onChangeText={setInputMessage}
          multiline
        />

        {inputMessage.trim().length > 0 ? (
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendBtnText}>إرسال 🚀</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.voiceBtn, isRecording && styles.voiceBtnRecording]}
            onPress={handleSendVoiceNote}
          >
            <Text style={styles.voiceBtnIcon}>{isRecording ? '🔴' : '🎙️'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  header: {
    backgroundColor: '#8B0000',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerSubtitle: { color: '#D4A359', fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  headerTitle: { color: '#FFF', fontSize: 19, fontWeight: 'bold' },
  roomSelectorCard: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EADBC8',
  },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#8B0000', marginBottom: 8 },
  messagesContainer: { padding: 16, paddingBottom: 20 },
  emptyMessages: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },
  emptyIcon: { fontSize: 44, marginBottom: 8 },
  emptyText: { fontSize: 15, fontWeight: 'bold', color: '#6B7280' },
  emptySubText: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  messageWrapper: { marginBottom: 12, maxWidth: '80%' },
  myMessageWrapper: { alignSelf: 'flex-start' },
  otherMessageWrapper: { alignSelf: 'flex-end' },
  senderHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, justifyContent: 'flex-end' },
  senderName: { fontSize: 12, fontWeight: 'bold', color: '#374151', marginRight: 6 },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  roleBadgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },
  messageBubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, elevation: 1 },
  myMessageBubble: { backgroundColor: '#8B0000', borderBottomLeftRadius: 4 },
  otherMessageBubble: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', borderBottomRightRadius: 4 },
  messageContent: { fontSize: 14, lineHeight: 20, textAlign: 'right' },
  myMessageContent: { color: '#FFF' },
  otherMessageContent: { color: '#1F2937' },
  messageTime: { fontSize: 10, marginTop: 4, textAlign: 'left' },
  myMessageTime: { color: 'rgba(255,255,255,0.7)' },
  otherMessageTime: { color: '#9CA3AF' },
  mediaImagePlaceholder: {
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  mediaIcon: { fontSize: 30 },
  mediaText: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  voiceNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
    padding: 8,
    borderRadius: 10,
    marginBottom: 6,
  },
  voiceNotePlay: { fontSize: 16, marginRight: 8 },
  voiceNoteWaveform: { flex: 1, height: 4, backgroundColor: '#D4A359', borderRadius: 2, marginHorizontal: 8 },
  voiceNoteDuration: { fontSize: 11, fontWeight: 'bold', color: '#888' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EADBC8',
  },
  attachBtn: { padding: 8, marginRight: 6 },
  attachBtnIcon: { fontSize: 22 },
  inputField: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D4A359',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    maxHeight: 90,
  },
  sendBtn: { backgroundColor: '#8B0000', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, marginLeft: 8 },
  sendBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  voiceBtn: {
    backgroundColor: '#FEF3C7',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#D4A359',
  },
  voiceBtnRecording: { backgroundColor: '#FEE2E2', borderColor: '#DC2626' },
  voiceBtnIcon: { fontSize: 18 },
});
