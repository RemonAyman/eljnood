import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import { Member } from '../../types';

interface ScoutCardPreviewProps {
  member: Member;
  onPrint?: () => void;
}

export const ScoutCardPreview: React.FC<ScoutCardPreviewProps> = ({ member, onPrint }) => {
  const [showQrModal, setShowQrModal] = useState(false);

  const getScarfBadge = () => {
    switch (member.scarfStatus) {
      case 'RECEIVED':
        return { text: '🧣 استلم المنديل', bg: '#D1FAE5', color: '#065F46' };
      case 'NOT_RECEIVED':
        return { text: '❌ لم يستلم المنديل', bg: '#FEF3C7', color: '#92400E' };
      case 'WITHDRAWN':
        return { text: '⚠️ مسحوب المنديل', bg: '#FEE2E2', color: '#991B1B' };
      default:
        return { text: '🧣 عضو كشفي معتمد', bg: '#D1FAE5', color: '#065F46' };
    }
  };

  const scarf = getScarfBadge();
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(member.code)}`;

  return (
    <View style={styles.cardContainer}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <Text style={styles.groupTitle}>مجموعة جنود المسيح الكشفية</Text>
        <Text style={styles.churchTitle}>بطاقة العضوية والرمز الكشفي الرسمي</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.profileRow}>
        <View style={styles.infoCol}>
          <Text style={styles.memberName}>{member.name}</Text>
          <View style={styles.squadPill}>
            <Text style={styles.squadText}>⚜️ فرقة {member.squadName}</Text>
          </View>
          <Text style={styles.codeText}>كود العضوية: {member.code}</Text>
          
          <View style={[styles.scarfBadge, { backgroundColor: scarf.bg }]}>
            <Text style={[styles.scarfText, { color: scarf.color }]}>{scarf.text}</Text>
          </View>
        </View>

        {/* Photo with fallback */}
        <View style={styles.avatarContainer}>
          {member.avatarBase64 ? (
            <Image source={{ uri: member.avatarBase64 }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarEmoji}>{member.gender === 'FEMALE' ? '👧' : '👦'}</Text>
              <Text style={styles.avatarBadgeText}>كشاف</Text>
            </View>
          )}
        </View>
      </View>

      {/* Details Row */}
      <View style={styles.detailsBox}>
        <Text style={styles.detailText}>📞 ولي الأمر: {member.guardianPhone}</Text>
        {member.phone && <Text style={styles.detailText}>📱 الطفل: {member.phone}</Text>}
      </View>

      {/* Real QR Code Section with tap to zoom */}
      <TouchableOpacity 
        style={styles.qrSection} 
        onPress={() => setShowQrModal(true)}
        activeOpacity={0.85}
      >
        <View style={styles.qrBox}>
          <Image
            source={{ uri: qrUrl }}
            style={styles.qrImage}
            resizeMode="contain"
          />
          <Text style={styles.qrSubText}>{member.code}</Text>
          <Text style={styles.qrTapHint}>🔍 اضغط لتكبير الـ QR لتسجيل الحضور</Text>
        </View>
      </TouchableOpacity>

      {/* Action Button */}
      {onPrint && (
        <TouchableOpacity style={styles.printBtn} onPress={onPrint} activeOpacity={0.8}>
          <Text style={styles.printBtnText}>🧾 سداد الاشتراكات والإيصالات</Text>
        </TouchableOpacity>
      )}

      {/* QR Code Fullscreen Modal */}
      <Modal visible={showQrModal} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowQrModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>كود الحضور الكشفي (QR Code)</Text>
            <Text style={styles.modalSub}>{member.name} • {member.squadName}</Text>
            <View style={styles.modalQrWrapper}>
              <Image
                source={{ uri: qrUrl }}
                style={styles.modalQrImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.modalCodeText}>{member.code}</Text>
            <Text style={styles.modalInstruction}>
              قرّب هذا الكود من جهاز قارئ الباركود أو كاميرا قائد القطاع لتسجيل حضورك
            </Text>
            <TouchableOpacity 
              style={styles.modalCloseBtn}
              onPress={() => setShowQrModal(false)}
            >
              <Text style={styles.modalCloseBtnText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#8B0000',
    padding: 16,
    marginVertical: 12,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  headerBanner: {
    backgroundColor: '#8B0000',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  groupTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  churchTitle: {
    color: '#D4A359',
    fontSize: 11,
    marginTop: 2,
  },
  profileRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    alignItems: 'flex-end',
    paddingLeft: 10,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'right',
  },
  squadPill: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginVertical: 4,
  },
  squadText: {
    color: '#8B0000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  codeText: {
    fontSize: 12,
    color: '#6B7280',
    marginVertical: 2,
  },
  scarfBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  scarfText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  avatarContainer: {
    width: 80,
    height: 90,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D4A359',
    overflow: 'hidden',
    backgroundColor: '#FEF2F2',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
  },
  avatarEmoji: {
    fontSize: 34,
  },
  avatarBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8B0000',
    marginTop: 2,
  },
  detailsBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
    alignItems: 'flex-end',
  },
  detailText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    marginVertical: 2,
  },
  qrSection: {
    alignItems: 'center',
    marginVertical: 8,
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 12,
    alignItems: 'center',
    width: 170,
  },
  qrImage: {
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
  },
  qrSubText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8B0000',
    marginTop: 6,
  },
  qrTapHint: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 4,
  },
  printBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  printBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 16,
  },
  modalQrWrapper: {
    padding: 12,
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D4A359',
    marginBottom: 12,
  },
  modalQrImage: {
    width: 220,
    height: 220,
  },
  modalCodeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    letterSpacing: 2,
    marginBottom: 8,
  },
  modalInstruction: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 16,
  },
  modalCloseBtn: {
    backgroundColor: '#8B0000',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
