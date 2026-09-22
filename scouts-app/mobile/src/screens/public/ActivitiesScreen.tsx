import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';

type ActivityCategory = 'ALL' | 'CAMPS' | 'COURSES' | 'EVENTS';

interface ActivityItem {
  id: string;
  category: ActivityCategory;
  dateBadge: string;
  title: string;
  desc: string;
  location: string;
  details: string;
  icon: string;
}

const ACTIVITIES_DATA: ActivityItem[] = [
  {
    id: '1',
    category: 'CAMPS',
    dateBadge: '15 أغسطس',
    title: 'مخيم الصيف الكشفي السنوي',
    desc: 'أيام مليئة بالأنشطة والمغامرات والروحانية في وادي النطرون.',
    location: 'وادي النطرون - بيت الكرمة',
    details: 'يشمل المخيم دورات في فنون الريادة، إشعال النيران، المسابقات الليلية، والقداسات الإلهية اليومية.',
    icon: '⛺',
  },
  {
    id: '2',
    category: 'EVENTS',
    dateBadge: '10 أغسطس',
    title: 'لقاء روحي وتربوي للشباب',
    desc: 'معاً نقترب من الله في محبة وخدمة ودراسة كلمة الله الحية.',
    location: 'قاعة القديس أثناسيوس الرسولي بالكاتدرائية',
    details: 'محاضرات روحية تفاعلية مع الآباء الكهنة، ورش عمل لبناء الشخصية، وترانيم كشفية وروحية.',
    icon: '✝️',
  },
  {
    id: '3',
    category: 'CAMPS',
    dateBadge: '2 أغسطس',
    title: 'رحلة الجبال والاستكشاف الكشفي',
    desc: 'تجربة جديدة من التحدي والمغامرة واكتشاف الطبيعة وتسلق المسارات الآمنة.',
    location: 'دير درنكة - مسار المغارات الجبلية',
    details: 'تدريب على قراءة الخرائط والبوصلة وتتبع الأثر واستخدام الشيفرات الكشفية العالمية.',
    icon: '🧗',
  },
  {
    id: '4',
    category: 'COURSES',
    dateBadge: '25 يوليو',
    title: 'دورة الإسعافات الأولية والشارات الكشفية',
    desc: 'تأهيل الكشافين للتعامل مع الطوارئ والإصابات والحصول على شارة المسعف.',
    location: 'مقر الفوج الكشفي بالكنيسة',
    details: 'تدريب عملي مع أطباء متخصصين على الإنعاش القلبي الرئوي وتضميد الجروح والجبائر.',
    icon: '🩹',
  },
  {
    id: '5',
    category: 'EVENTS',
    dateBadge: '12 يوليو',
    title: 'حفل ترقية الرتب وتسليم المناديل الكشفية',
    desc: 'تكريم الكشافين المتميزين واحتفال رسمي بتقليد المناديل والشارات الجديدة.',
    location: 'المسرح الكبير للكنيسة',
    details: 'بحضور قدس الأب الراعي وقادة القطاعات، مع عرض موسيقي واستعراضي لفرقة المارش الكشفية.',
    icon: '🧣',
  },
];

const TABS: { key: ActivityCategory; label: string; icon: string }[] = [
  { key: 'ALL', label: 'الكل', icon: '🌟' },
  { key: 'CAMPS', label: 'مخيمات', icon: '⛺' },
  { key: 'COURSES', label: 'دورات', icon: '📚' },
  { key: 'EVENTS', label: 'فعاليات', icon: '🎉' },
];

export const ActivitiesScreen = ({ navigation }: any) => {
  const [selectedTab, setSelectedTab] = useState<ActivityCategory>('ALL');
  const [selectedItem, setSelectedItem] = useState<ActivityItem | null>(null);

  const filteredData = useMemo(() => {
    if (selectedTab === 'ALL') return ACTIVITIES_DATA;
    return ACTIVITIES_DATA.filter((item) => item.category === selectedTab);
  }, [selectedTab]);

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>أنشطة وفعاليات الفوج</Text>
        <Text style={styles.headerSub}>
          مخيمات، لقاءات روحية، ودورات تدريبية متخصصة على مدار العام
        </Text>
      </View>

      {/* Horizontal Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const active = selectedTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
              onPress={() => setSelectedTab(tab.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>
                {tab.icon} {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Activities FlatList (Optimized Virtualized List) */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        initialNumToRender={5}
        maxToRenderPerBatch={8}
        windowSize={5}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setSelectedItem(item)}
            activeOpacity={0.85}
          >
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeText}>{item.dateBadge}</Text>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardIcon}>{item.icon}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>

              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.desc}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.readMoreBtn}>تفاصيل الفعالية ➔</Text>
                <Text style={styles.locationText}>📍 {item.location}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Activity Detail Modal */}
      <Modal visible={!!selectedItem} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalIcon}>{selectedItem.icon}</Text>
                  <View style={styles.modalTitleWrap}>
                    <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                    <Text style={styles.modalDate}>📅 {selectedItem.dateBadge}</Text>
                  </View>
                </View>

                <View style={styles.detailDivider} />

                <Text style={styles.modalSectionLabel}>المكان والتجمع:</Text>
                <Text style={styles.modalLocation}>📍 {selectedItem.location}</Text>

                <Text style={styles.modalSectionLabel}>عن الفعالية:</Text>
                <Text style={styles.modalDesc}>{selectedItem.desc}</Text>

                <Text style={styles.modalSectionLabel}>تفاصيل وبرنامج النشاط:</Text>
                <Text style={styles.modalDetails}>{selectedItem.details}</Text>

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedItem(null)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalCloseText}>إغلاق النافذة</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  header: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSub: {
    color: '#D4A359',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  tabsRow: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabBtnActive: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  tabBtnText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: 'bold',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderColor: '#8B0000',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  dateBadgeText: {
    color: '#8B0000',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardContent: {
    alignItems: 'flex-end',
  },
  cardTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardIcon: {
    fontSize: 18,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
  },
  cardDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    textAlign: 'right',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  locationText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  readMoreBtn: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    width: '100%',
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  modalIcon: {
    fontSize: 32,
  },
  modalTitleWrap: {
    flex: 1,
    alignItems: 'flex-end',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
    textAlign: 'right',
  },
  modalDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'right',
    marginTop: 8,
    marginBottom: 4,
  },
  modalLocation: {
    fontSize: 12,
    color: '#8B0000',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  modalDesc: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    textAlign: 'right',
  },
  modalDetails: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    textAlign: 'right',
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 10,
  },
  modalCloseBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
