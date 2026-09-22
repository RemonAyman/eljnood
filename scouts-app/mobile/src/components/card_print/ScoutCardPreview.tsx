import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Member } from '../../types';

interface ScoutCardPreviewProps {
  member: Member;
  onPrint?: () => void;
}

export const ScoutCardPreview: React.FC<ScoutCardPreviewProps> = ({ member, onPrint }) => {
  const getScarfBadge = () => {
    switch (member.scarfStatus) {
      case 'RECEIVED':
        return { text: '🧣 استلم المنديل', bg: '#D1FAE5', color: '#065F46' };
      case 'NOT_RECEIVED':
        return { text: '❌ لم يستلم المنديل', bg: '#FEF3C7', color: '#92400E' };
      case 'WITHDRAWN':
        return { text: '⚠️ مسحوب المنديل', bg: '#FEE2E2', color: '#991B1B' };
    }
  };

  const scarf = getScarfBadge();

  return (
    <View style={styles.cardContainer}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <Text style={styles.groupTitle}>مجموعة جنود المسيح الكشفية</Text>
        <Text style={styles.churchTitle}>كنيسة السيدة العذراء مريم - الفوج الأول</Text>
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

        {/* Photo */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: member.avatarBase64 || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
        </View>
      </View>

      {/* Details Row */}
      <View style={styles.detailsBox}>
        <Text style={styles.detailText}>📞 ولي الأمر: {member.guardianPhone}</Text>
        {member.phone && <Text style={styles.detailText}>📱 الطفل: {member.phone}</Text>}
      </View>

      {/* QR Code Placeholder */}
      <View style={styles.qrSection}>
        <View style={styles.qrBox}>
          <Text style={styles.qrCodeIcon}>🏁 QR CODE</Text>
          <Text style={styles.qrSubText}>{member.code}</Text>
        </View>
      </View>

      {/* Action Button */}
      {onPrint && (
        <TouchableOpacity style={styles.printBtn} onPress={onPrint} activeOpacity={0.8}>
          <Text style={styles.printBtnText}>🖨️ طباعة الكارنيه مباشرة</Text>
        </TouchableOpacity>
      )}
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
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4A359',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
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
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    alignItems: 'center',
    width: 140,
  },
  qrCodeIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  qrSubText: {
    fontSize: 10,
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
});
