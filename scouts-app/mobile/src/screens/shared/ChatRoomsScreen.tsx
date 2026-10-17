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
  Image,
  Modal,
  Keyboard,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useChatStore, getAvailableChatRoomsForUser } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { useMembersStore } from '../../store/membersStore';
import { IconCardSelector } from '../../components/ui/IconCardSelector';
import { pickImageFromGallery, takePhotoWithCamera } from '../../utils/imagePickerHelper';
import { ChatMessage, Role } from '../../types';
import {
  subscribeToChatMessages,
  sendChatMessageToFirestore,
  sendNotificationToFirestore,
} from '../../services/firebaseService';
import { BottomNavBar } from '../../components/navigation/BottomNavBar';

const { width: screenWidth } = Dimensions.get('window');

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

interface ChatBubbleProps {
  msg: ChatMessage;
  isMe: boolean;
  currentUserAvatar?: string;
  memberAvatar?: string;
  onImagePress?: (uri: string) => void;
}

const ChatBubbleItem = React.memo(({ msg, isMe, currentUserAvatar, memberAvatar, onImagePress }: ChatBubbleProps) => {
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

  const senderInitial = useMemo(() => {
    if (msg.senderName && msg.senderName.trim().length > 0) {
      return msg.senderName.trim().charAt(0);
    }
    return '⚜️';
  }, [msg.senderName]);

  const resolvedAvatar = useMemo(() => {
    if (msg.senderAvatar && msg.senderAvatar.trim().length > 0) {
      return msg.senderAvatar;
    }
    if (isMe && currentUserAvatar) {
      return currentUserAvatar;
    }
    if (memberAvatar) {
      return memberAvatar;
    }
    return null;
  }, [msg.senderAvatar, isMe, currentUserAvatar, memberAvatar]);

  return (
    <View
      style={[
        styles.messageRow,
        isMe ? styles.myMessageRow : styles.otherMessageRow,
      ]}
    >
      {/* Sender Avatar Circle for Other users (shown on the left) */}
      {!isMe && (
        <View style={styles.avatarWrap}>
          {resolvedAvatar ? (
            <Image
              source={{ uri: resolvedAvatar }}
              style={styles.avatarImg}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: roleBadge.bg }]}>
              <Text style={styles.avatarInitialText}>{senderInitial}</Text>
            </View>
          )}
        </View>
      )}

      {/* Message Bubble Container */}
      <View
        style={[
          styles.messageWrapper,
          isMe ? styles.myMessageWrapper : styles.otherMessageWrapper,
        ]}
      >
        {/* Sender Header with Name & Role Badge for BOTH Me and Others */}
        <View
          style={[
            styles.senderHeader,
            isMe ? styles.mySenderHeader : styles.otherSenderHeader,
          ]}
        >
          <Text style={[styles.senderName, isMe ? styles.mySenderName : styles.otherSenderName]}>
            {isMe ? `${msg.senderName || 'أنت'} (أنت)` : msg.senderName}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: roleBadge.bg }]}>
            <Text style={styles.roleBadgeText}>{roleBadge.label}</Text>
          </View>
        </View>

        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          {/* Attached Image with click to enlarge */}
          {msg.mediaType === 'IMAGE' && (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => msg.mediaBase64 && onImagePress && onImagePress(msg.mediaBase64)}
              style={styles.mediaImageContainer}
            >
              {msg.mediaBase64 ? (
                <View style={styles.imageCard}>
                  <Image
                    source={{ uri: msg.mediaBase64 }}
                    style={styles.chatMediaImage}
                    resizeMode="cover"
                  />
                  <View style={styles.zoomBadge}>
                    <Text style={styles.zoomBadgeText}>🔍 اضغط للتكبير</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.mediaImagePlaceholder}>
                  <Text style={styles.mediaIcon}>🖼️</Text>
                  <Text style={styles.mediaText}>صورة مرفقة من النشاط</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Voice note indicator */}
          {msg.mediaType === 'AUDIO' && (
            <View style={styles.voiceNoteRow}>
              <Text style={styles.voiceNotePlay}>▶️</Text>
              <View style={styles.voiceNoteWaveform} />
              <Text style={styles.voiceNoteDuration}>0:14</Text>
            </View>
          )}

          {/* Text Message Content */}
          {msg.content ? (
            <Text
              style={[
                styles.messageContent,
                isMe ? styles.myMessageContent : styles.otherMessageContent,
              ]}
            >
              {msg.content}
            </Text>
          ) : null}

          {/* Timestamp */}
          {timeFormatted ? (
            <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.otherTimeText]}>
              {timeFormatted}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Avatar for My Messages (Shows user's avatar on the right) */}
      {isMe && (
        <View style={styles.avatarWrap}>
          {resolvedAvatar ? (
            <Image
              source={{ uri: resolvedAvatar }}
              style={styles.avatarImg}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: roleBadge.bg }]}>
              <Text style={styles.avatarInitialText}>{senderInitial}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
});

export const ChatRoomsScreen = ({ navigation }: { navigation?: any }) => {
  const {
    currentRoomId,
    messages,
    sendMessage,
    setRoom,
    lockedRooms,
    mutedRooms,
    toggleLockRoom,
    toggleMuteRoom,
  } = useChatStore();
  const currentUser = useAuthStore((s) => s.user);
  const members = useMembersStore((s) => s.members);

  const isAdmin = currentUser?.role === 'ADMIN';
  const isSectionLeader = currentUser?.role === 'SECTION_LEADER';
  const canManageRoom = isAdmin || isSectionLeader;
  const isRoomLocked = !!lockedRooms[currentRoomId];
  const isRoomMuted = !!mutedRooms[currentRoomId];
  const isGeneralBroadcastOnly = currentRoomId === 'GENERAL';
  const canSendInCurrentRoom = isGeneralBroadcastOnly ? isAdmin : (!isRoomLocked || canManageRoom);

  const [firestoreMessages, setFirestoreMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const membersAvatarMap = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach((m) => {
      if (m.avatarBase64) {
        map.set(m.id, m.avatarBase64);
        map.set(m.name, m.avatarBase64);
      }
    });
    return map;
  }, [members]);

  // Monitor keyboard visibility so we can hide BottomNavBar and adjust padding
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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

    const text = inputMessage.trim();
    const newMsgData = {
      roomId: currentRoomId,
      senderId: currentUser?.id || `u_${Date.now()}`,
      senderName: currentUser?.name || 'عضو كشفي',
      senderRole: (currentUser?.role as Role) || 'CHILD',
      content: text,
      senderAvatar: currentUser?.avatarBase64 || (currentUser as any)?.avatar || '',
    };

    // 1. Local update
    sendMessage(newMsgData);

    // 2. Cloud Firestore Real-time push
    sendChatMessageToFirestore(newMsgData).catch((e) =>
      console.warn('Chat firestore sync:', e)
    );

    // 3. Central Push Notification Broadcast (Sender excluded by senderId)
    sendNotificationToFirestore({
      title: 'رسالة جديدة في الشات 💬',
      body: `${currentUser?.name || 'عضو'}: ${text}`,
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
        senderAvatar: currentUser?.avatarBase64 || (currentUser as any)?.avatar || '',
      };

      sendMessage(voiceData);
      sendChatMessageToFirestore(voiceData);
      sendNotificationToFirestore({
        title: 'تسجيل صوتي جديد في الشات 🎙️',
        body: `${currentUser?.name || 'عضو'}: أرسل تسجيلاً صوتياً`,
        type: 'CHAT',
        senderId: currentUser?.id,
        senderName: currentUser?.name,
        roomId: currentRoomId,
      });
      Alert.alert('تم بنجاح', 'تم إرسال التسجيل الصوتي 🎙️');
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 1200);
  }, [currentRoomId, currentUser, sendMessage]);

  const handleAttachImage = useCallback(() => {
    Alert.alert('إرفاق وسائط 📷', 'اختر مصدر الصورة للإرسال في الشات:', [
      {
        text: '🖼️ صورة من المعرض',
        onPress: async () => {
          setIsUploadingMedia(true);
          try {
            const base64Data = await pickImageFromGallery({
              allowsEditing: true,
              quality: 0.4,
            });
            if (base64Data) {
              const imgData = {
                roomId: currentRoomId,
                senderId: currentUser?.id || `u_${Date.now()}`,
                senderName: currentUser?.name || 'عضو كشفي',
                senderRole: (currentUser?.role as Role) || 'CHILD',
                content: '📸 صورة مرفقة من نشاط الكشافة',
                mediaBase64: base64Data,
                mediaType: 'IMAGE' as const,
                senderAvatar: currentUser?.avatarBase64 || (currentUser as any)?.avatar || '',
              };

              sendMessage(imgData);
              sendChatMessageToFirestore(imgData);

              sendNotificationToFirestore({
                title: 'صورة جديدة في الشات 📸',
                body: `${currentUser?.name || 'عضو'}: أرسل صورة جديدة في الشات`,
                type: 'CHAT',
                senderId: currentUser?.id,
                senderName: currentUser?.name,
                roomId: currentRoomId,
              });

              setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
            }
          } catch (err: any) {
            Alert.alert('خطأ', 'تعذر إرفاق الصورة: ' + (err?.message || ''));
          } finally {
            setIsUploadingMedia(false);
          }
        },
      },
      {
        text: '📸 التقاط صورة بالكاميرا الحية',
        onPress: async () => {
          setIsUploadingMedia(true);
          try {
            const base64Data = await takePhotoWithCamera({
              allowsEditing: true,
              quality: 0.4,
            });
            if (base64Data) {
              const imgData = {
                roomId: currentRoomId,
                senderId: currentUser?.id || `u_${Date.now()}`,
                senderName: currentUser?.name || 'عضو كشفي',
                senderRole: (currentUser?.role as Role) || 'CHILD',
                content: '📸 صورة ملتقطة بالكاميرا الحية',
                mediaBase64: base64Data,
                mediaType: 'IMAGE' as const,
                senderAvatar: currentUser?.avatarBase64 || (currentUser as any)?.avatar || '',
              };

              sendMessage(imgData);
              sendChatMessageToFirestore(imgData);

              sendNotificationToFirestore({
                title: 'صورة جديدة بالكاميرا 📸',
                body: `${currentUser?.name || 'عضو'}: أرسل صورة ملتقطة بالكاميرا`,
                type: 'CHAT',
                senderId: currentUser?.id,
                senderName: currentUser?.name,
                roomId: currentRoomId,
              });

              setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
            }
          } catch (err: any) {
            Alert.alert('خطأ', 'تعذر التقاط الصورة: ' + (err?.message || ''));
          } finally {
            setIsUploadingMedia(false);
          }
        },
      },
      {
        text: '📑 مستند PDF',
        onPress: () => {
          const docData = {
            roomId: currentRoomId,
            senderId: currentUser?.id || `u_${Date.now()}`,
            senderName: currentUser?.name || 'عضو كشفي',
            senderRole: (currentUser?.role as Role) || 'CHILD',
            content: '📑 مرفق: جدول الأنشطة الأسبوعية.pdf',
            mediaType: 'DOCUMENT' as const,
            senderAvatar: currentUser?.avatarBase64 || (currentUser as any)?.avatar || '',
          };
          sendMessage(docData);
          sendChatMessageToFirestore(docData);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
        },
      },
      { text: 'إلغاء', style: 'cancel' },
    ]);
  }, [currentRoomId, currentUser, sendMessage]);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const isMe = item.senderId === currentUser?.id;
      const memberAvatar = membersAvatarMap.get(item.senderId) || membersAvatarMap.get(item.senderName);
      return (
        <ChatBubbleItem
          msg={item}
          isMe={isMe}
          currentUserAvatar={currentUser?.avatarBase64 || (currentUser as any)?.avatar}
          memberAvatar={memberAvatar}
          onImagePress={(uri) => setPreviewImageUri(uri)}
        />
      );
    },
    [currentUser, membersAvatarMap]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
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

      {/* Room Controls Bar (Mute Notifications + Lock/Unlock Room) */}
      <View style={styles.roomControlsBar}>
        <TouchableOpacity
          style={[styles.controlPill, isRoomMuted && styles.controlPillActive]}
          onPress={() => toggleMuteRoom(currentRoomId)}
          activeOpacity={0.7}
        >
          <Text style={styles.controlPillIcon}>{isRoomMuted ? '🔕' : '🔔'}</Text>
          <Text style={[styles.controlPillText, isRoomMuted && styles.controlPillTextActive]}>
            {isRoomMuted ? 'تم كتم الإشعارات' : 'كتم الإشعارات'}
          </Text>
        </TouchableOpacity>

        {isGeneralBroadcastOnly ? (
          <View style={styles.broadcastNoticePill}>
            <Text style={styles.broadcastNoticeText}>📢 قناة إعلانات عامة (المسؤول العام فقط)</Text>
          </View>
        ) : canManageRoom ? (
          <TouchableOpacity
            style={[styles.controlPill, isRoomLocked && styles.controlPillLocked]}
            onPress={() => toggleLockRoom(currentRoomId)}
            activeOpacity={0.7}
          >
            <Text style={styles.controlPillIcon}>{isRoomLocked ? '🔒' : '🔓'}</Text>
            <Text style={[styles.controlPillText, isRoomLocked && styles.controlPillTextLocked]}>
              {isRoomLocked ? 'الغرفة مغلقة (اضغط للفتح)' : 'قفل الغرفة'}
            </Text>
          </TouchableOpacity>
        ) : isRoomLocked ? (
          <View style={styles.lockedNoticePill}>
            <Text style={styles.lockedNoticeText}>🔒 الغرفة مغلقة بواسطة القائد</Text>
          </View>
        ) : null}
      </View>

      {/* Messages Stream - Virtualized FlatList */}
      <FlatList
        ref={flatListRef}
        data={displayMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.messagesContainer,
          { paddingBottom: isKeyboardVisible ? 16 : 80 },
        ]}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>لا توجد رسائل سابقة في هذه الغرفة</Text>
            <Text style={styles.emptySubText}>كن أول من يشارك ويبدأ المحادثة الآن!</Text>
          </View>
        }
      />

      {/* Loading overlay for image processing */}
      {isUploadingMedia && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="small" color="#8B0000" />
          <Text style={styles.uploadingText}>جاري معالجة وإرفاق الصورة...</Text>
        </View>
      )}

      {/* Input Bar or Restricted/Locked Message */}
      {!canSendInCurrentRoom ? (
        <View style={[styles.inputContainer, styles.restrictedContainer]}>
          <Text style={styles.restrictedText}>
            {isGeneralBroadcastOnly
              ? '📢 هذه قناة إعلانات مخصصة للمسؤول العام فقط للإرسال.'
              : '🔒 تم إغلاق المحادثة في هذه الغرفة بواسطة رئيس القطاع / المسؤول.'}
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.inputContainer,
            { paddingBottom: isKeyboardVisible ? (Platform.OS === 'ios' ? 10 : 8) : 68 },
          ]}
        >
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={handleAttachImage}
            activeOpacity={0.7}
            disabled={isUploadingMedia}
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
            onFocus={() => {
              setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 250);
            }}
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
      )}

      {/* Full-screen Image Preview Modal */}
      <Modal
        visible={!!previewImageUri}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImageUri(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setPreviewImageUri(null)}
            activeOpacity={0.8}
          >
            <Text style={styles.modalCloseText}>✕ إغلاق المعاينة</Text>
          </TouchableOpacity>
          {previewImageUri && (
            <Image
              source={{ uri: previewImageUri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Render Floating BottomNavBar ONLY when keyboard is hidden */}
      {!isKeyboardVisible && (
        <BottomNavBar navigation={navigation} currentRoute="ChatRooms" />
      )}
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
    paddingHorizontal: 10,
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
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: 4,
    gap: 8,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#D4A359',
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  avatarInitialText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  messageWrapper: {
    maxWidth: '78%',
  },
  myMessageWrapper: {
    alignItems: 'flex-end',
  },
  otherMessageWrapper: {
    alignItems: 'flex-start',
  },
  senderHeader: {
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  mySenderHeader: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  otherSenderHeader: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  mySenderName: {
    color: '#8B0000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  otherSenderName: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 12,
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
    borderBottomRightRadius: 2,
    borderBottomLeftRadius: 14,
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageContent: {
    fontSize: 13,
    lineHeight: 19,
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
  mediaImageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 6,
  },
  imageCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#111827',
  },
  chatMediaImage: {
    width: Math.min(screenWidth * 0.65, 250),
    height: 180,
    borderRadius: 12,
  },
  zoomBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  zoomBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
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
  uploadingOverlay: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F59E0B',
  },
  uploadingText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingTop: 8,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#8B0000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  fullScreenImage: {
    width: '94%',
    height: '80%',
    borderRadius: 12,
  },
  roomControlsBar: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  controlPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  controlPillActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
  },
  controlPillLocked: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  controlPillIcon: {
    fontSize: 12,
  },
  controlPillText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  controlPillTextActive: {
    color: '#DC2626',
  },
  controlPillTextLocked: {
    color: '#B45309',
  },
  broadcastNoticePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  broadcastNoticeText: {
    fontSize: 10,
    color: '#1D4ED8',
    fontWeight: 'bold',
  },
  lockedNoticePill: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  lockedNoticeText: {
    fontSize: 10,
    color: '#B91C1C',
    fontWeight: 'bold',
  },
  restrictedContainer: {
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
  },
  restrictedText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
});

