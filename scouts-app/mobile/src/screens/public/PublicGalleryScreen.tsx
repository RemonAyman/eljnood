import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

type MediaFilter = 'ALL' | 'PHOTOS' | 'VIDEOS';

interface GalleryItem {
  id: string;
  type: 'PHOTO' | 'VIDEO';
  title: string;
  category: string;
  date: string;
  icon: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  { id: '1', type: 'PHOTO', title: 'سهرة السمر حول نار المخيم', category: 'معسكر الصيف', date: '2026', icon: '🔥' },
  { id: '2', type: 'PHOTO', title: 'طابور تحية العلم الكشفي الصباحي', category: 'الأنشطة الأسبوعية', date: '2026', icon: '🇪🇬' },
  { id: '3', type: 'VIDEO', title: 'فيديو بناء الأبراج بالرمال والحبال', category: 'فنون الريادة', date: '2026', icon: '🏗️' },
  { id: '4', type: 'PHOTO', title: 'توزيع شارات التفوق والترقيات', category: 'تكريم الكشافة', date: '2026', icon: '🎖️' },
  { id: '5', type: 'PHOTO', title: 'القداس الإلهي في الهواء الطلق', category: 'الروحانيات', date: '2026', icon: '⛪' },
  { id: '6', type: 'VIDEO', title: 'وثائقي استكشاف مغارات وادي النطرون', category: 'رحلات الجبال', date: '2026', icon: '🧗' },
  { id: '7', type: 'PHOTO', title: 'دورة الإسعافات الأولية الميدانية', category: 'تأهيل طبي', date: '2026', icon: '🩹' },
  { id: '8', type: 'PHOTO', title: 'حفل تخرج جوالة الفوج الأول', category: 'مراسم التخرج', date: '2026', icon: '🎓' },
];

export const PublicGalleryScreen = ({ navigation }: any) => {
  const [filter, setFilter] = useState<MediaFilter>('ALL');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const filteredItems = useMemo(() => {
    if (filter === 'ALL') return GALLERY_ITEMS;
    if (filter === 'PHOTOS') return GALLERY_ITEMS.filter((i) => i.type === 'PHOTO');
    return GALLERY_ITEMS.filter((i) => i.type === 'VIDEO');
  }, [filter]);

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>معرض الصور والفيديوهات</Text>
        <Text style={styles.headerSub}>ألبوم يوثق أجمل لحظات وذكريات الفوج الكشفي</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, filter === 'ALL' && styles.tabBtnActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.tabText, filter === 'ALL' && styles.tabTextActive]}>
            🌟 الكل ({GALLERY_ITEMS.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, filter === 'PHOTOS' && styles.tabBtnActive]}
          onPress={() => setFilter('PHOTOS')}
        >
          <Text style={[styles.tabText, filter === 'PHOTOS' && styles.tabTextActive]}>
            📷 صور
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, filter === 'VIDEOS' && styles.tabBtnActive]}
          onPress={() => setFilter('VIDEOS')}
        >
          <Text style={[styles.tabText, filter === 'VIDEOS' && styles.tabTextActive]}>
            🎬 فيديوهات
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grid List with Virtualization */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setActiveItem(item)}
            activeOpacity={0.85}
          >
            <View style={styles.cardVisual}>
              <Text style={styles.cardIcon}>{item.icon}</Text>
              {item.type === 'VIDEO' && (
                <View style={styles.videoBadge}>
                  <Text style={styles.videoBadgeText}>▶ تشغيل</Text>
                </View>
              )}
            </View>

            <View style={styles.cardMeta}>
              <Text style={styles.categoryBadge}>{item.category}</Text>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.cardDate}>📅 {item.date}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Lightbox / Preview Modal */}
      <Modal visible={!!activeItem} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {activeItem && (
              <>
                <View style={styles.modalVisual}>
                  <Text style={styles.modalBigIcon}>{activeItem.icon}</Text>
                  <Text style={styles.modalTypeTag}>
                    {activeItem.type === 'VIDEO' ? 'مقطع فيديو كشفي' : 'صورة تذكارية كشفية'}
                  </Text>
                </View>

                <Text style={styles.modalTitle}>{activeItem.title}</Text>
                <Text style={styles.modalCategory}>القسم: {activeItem.category}</Text>
                <Text style={styles.modalYear}>سنة التوثيق: {activeItem.date}</Text>

                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={() => setActiveItem(null)}
                >
                  <Text style={styles.modalBtnText}>إغلاق المعاينة</Text>
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
  tabText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
  },
  cardVisual: {
    height: 110,
    backgroundColor: '#FAF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardIcon: {
    fontSize: 44,
  },
  videoBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(139, 0, 0, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  videoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardMeta: {
    padding: 10,
    alignItems: 'flex-end',
  },
  categoryBadge: {
    fontSize: 10,
    color: '#8B0000',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'right',
    lineHeight: 16,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  modalVisual: {
    width: '100%',
    height: 160,
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalBigIcon: {
    fontSize: 64,
  },
  modalTypeTag: {
    marginTop: 8,
    color: '#8B0000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  modalYear: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 18,
  },
  modalBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
