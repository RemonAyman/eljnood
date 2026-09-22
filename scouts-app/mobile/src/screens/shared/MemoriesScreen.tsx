import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { IconCardSelector } from '../../components/ui/IconCardSelector';

interface MemoryItem {
  id: string;
  category: string;
  title: string;
  eventDate: string;
  location: string;
  likesCount: number;
  commentsCount: number;
  type: 'PHOTO' | 'VIDEO' | 'ALBUM';
  coverEmoji: string;
  coverImageUrl?: string;
  description: string;
}

const MEMORY_CATEGORIES = [
  { id: 'CAMPS', title: 'المعسكرات', icon: '🏕️', subtitle: 'معسكرات الخلاء والبراري' },
  { id: 'PARTIES', title: 'حفلات الوعد', icon: '🎖️', subtitle: 'حفلات أداء الوعد والترقي' },
  { id: 'TRIPS', title: 'الرحلات الكشفية', icon: '🚌', subtitle: 'رحلات الأديرة والمعالم' },
  { id: 'COMPETITIONS', title: 'المسابقات والمهرجانات', icon: '🏆', subtitle: 'مهرجانات الكرازة' },
  { id: 'TASBEHA', title: 'التسبحة والقداسات', icon: '🕯️', subtitle: 'سهرات كيهك والصلوات' },
  { id: 'SPIRITUAL', title: 'الأيام الروحية', icon: '🕊️', subtitle: 'الخلوات والمؤتمرات' },
  { id: 'GROUP_PHOTOS', title: 'صور المجموعة التذكارية', icon: '📸', subtitle: 'أرشيف جنود المسيح' },
];

const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'm1',
    category: 'CAMPS',
    title: 'معسكر كشافة وادي النطرون السنوي',
    eventDate: 'يوليو 2026',
    location: 'دير البراموس - وادي النطرون',
    likesCount: 142,
    commentsCount: 28,
    type: 'ALBUM',
    coverEmoji: '🏕️',
    coverImageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    description: 'أجمل ٤ أيام من التخييم، طهي الخلاء، السمر الكشفي، وحفلات السمر حول النار.',
  },
  {
    id: 'm2',
    category: 'PARTIES',
    title: 'حفل أداء الوعد وتسليم المناديل الكشفية',
    eventDate: 'مايو 2026',
    location: 'مسرح الكنيسة الكبير',
    likesCount: 98,
    commentsCount: 15,
    type: 'PHOTO',
    coverEmoji: '🧣',
    coverImageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
    description: 'تسليم المنديل الكشفي لدفعة البراعم والأشبال الجدد مع تكريم القادة المتميزين.',
  },
  {
    id: 'm3',
    category: 'TRIPS',
    title: 'رحلة قطاع المرشدات إلى دير الأنبا أنطونيوس',
    eventDate: 'أبريل 2026',
    location: 'دير الأنبا أنطونيوس - البحر الأحمر',
    likesCount: 115,
    commentsCount: 19,
    type: 'ALBUM',
    coverEmoji: '🚌',
    coverImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    description: 'صعود مغارة الأنبا أنطونيوس وأخذ بركة القديس مع يوم روحي وتاريخي لا ينسى.',
  },
  {
    id: 'm4',
    category: 'COMPETITIONS',
    title: 'الفوز بالمركز الأول في مسابقة المعارض الكشفية',
    eventDate: 'فبراير 2026',
    location: 'مهرجان إيبارشية الكرازة',
    likesCount: 184,
    commentsCount: 42,
    type: 'PHOTO',
    coverEmoji: '🏆',
    coverImageUrl: 'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?w=800&q=80',
    description: 'فريق كشافة جنود المسيح يحصد كأس الريادة والابتكار الكشفي للمرة الثالثة على التوالي.',
  },
  {
    id: 'm5',
    category: 'TASBEHA',
    title: 'سهرة كيهكية وتسبحة نصف الليل الكشفية',
    eventDate: 'ديسمبر 2025',
    location: 'كاتدرائية رئيس الملائكة ميخائيل',
    likesCount: 88,
    commentsCount: 12,
    type: 'PHOTO',
    coverEmoji: '🕯️',
    coverImageUrl: 'https://images.unsplash.com/photo-1510973005906-c5b1a0d6c5f4?w=800&q=80',
    description: 'صلاة وتسبحة خاشعة بمشاركة جميع فرق البراعم، الأشبال، الكشاف، والجوالة.',
  },
  {
    id: 'm6',
    category: 'SPIRITUAL',
    title: 'خلوة قطاع الجوالة الروحية السنوية',
    eventDate: 'مارس 2026',
    location: 'دير الأنبا بيشوي - وادي النطرون',
    likesCount: 73,
    commentsCount: 9,
    type: 'ALBUM',
    coverEmoji: '🕊️',
    coverImageUrl: 'https://images.unsplash.com/photo-1476611338391-6f395a0dd82e?w=800&q=80',
    description: 'يوم روحي متكامل للجوالة والقادة مع القسيس المرشد وجلسات التأمل والصلاة.',
  },
  {
    id: 'm7',
    category: 'GROUP_PHOTOS',
    title: 'صورة المجموعة التذكارية - اليوم الكشفي 2026',
    eventDate: 'سبتمبر 2026',
    location: 'ساحة الكنيسة الكبرى',
    likesCount: 256,
    commentsCount: 68,
    type: 'PHOTO',
    coverEmoji: '📸',
    coverImageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    description: 'الصورة التذكارية الرسمية لأسرة مجموعة جنود المسيح الكشفية في اليوم الكشفي السنوي.',
  },
];

export const MemoriesScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('CAMPS');
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  // Lightbox Modal
  const [activeMemory, setActiveMemory] = useState<MemoryItem | null>(null);

  // Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const filteredMemories = memories.filter((m) => m.category === selectedCategory);

  const toggleLike = (id: string) => {
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
    setMemories((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isLiked = !likedIds[id];
          return {
            ...item,
            likesCount: isLiked ? item.likesCount + 1 : item.likesCount - 1,
          };
        }
        return item;
      })
    );
  };

  const handleAddMemory = () => {
    if (!newTitle.trim()) {
      Alert.alert('تنبيه', 'من فضلك أدخل عنوان الذكرى أو المعسكر');
      return;
    }

    const newItem: MemoryItem = {
      id: `m_${Date.now()}`,
      category: selectedCategory,
      title: newTitle.trim(),
      eventDate: 'الآن (سبتمبر 2026)',
      location: newLocation.trim() || 'كنيسة رئيس الملائكة ميخائيل',
      likesCount: 1,
      commentsCount: 0,
      type: 'PHOTO',
      coverEmoji: '📸',
      description: newDesc.trim() || 'ذكرى جديدة تمت إضافتها لأرشيف الكشافة.',
    };

    setMemories([newItem, ...memories]);
    setShowUploadModal(false);
    setNewTitle('');
    setNewLocation('');
    setNewDesc('');
    Alert.alert('تم بنجاح 🎉', 'تم حفظ ومشاركة الذكرى الكشفية بنجاح!');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>مجموعة جنود المسيح الكشفية</Text>
        <Text style={styles.headerTitle}>أرشيف الذكريات والمعسكرات الكشفية 📸</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Category Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1️⃣ اختر قسم الذكريات</Text>
          <IconCardSelector
            options={MEMORY_CATEGORIES}
            selectedId={selectedCategory}
            onSelect={(id) => setSelectedCategory(id)}
          />
        </View>

        {/* Upload Memory Trigger Button */}
        <TouchableOpacity style={styles.uploadTriggerBtn} onPress={() => setShowUploadModal(true)}>
          <Text style={styles.uploadTriggerBtnText}>➕ مشاركة صورة أو ذكرى جديدة في الأرشيف</Text>
        </TouchableOpacity>

        {/* Gallery Grid */}
        <View style={styles.galleryList}>
          {filteredMemories.length === 0 ? (
            <View style={styles.emptyGallery}>
              <Text style={styles.emptyIcon}>🖼️</Text>
              <Text style={styles.emptyText}>لا توجد ذكريات مسجلة في هذا القسم بعد</Text>
              <Text style={styles.emptySubText}>كن أول من يوثق لحظات المعسكر والنشاط!</Text>
            </View>
          ) : (
            filteredMemories.map((item) => {
              const isLiked = !!likedIds[item.id];

              return (
                <View key={item.id} style={styles.memoryCard}>
                  {/* Photo Visual Banner */}
                  <TouchableOpacity
                    style={styles.photoBanner}
                    activeOpacity={0.8}
                    onPress={() => setActiveMemory(item)}
                  >
                    {item.coverImageUrl ? (
                      <Image
                        source={{ uri: item.coverImageUrl }}
                        style={styles.coverImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.photoEmoji}>{item.coverEmoji}</Text>
                    )}
                    <View style={styles.photoBadge}>
                      <Text style={styles.photoBadgeText}>
                        {item.type === 'ALBUM' ? '📁 ألبوم كامل' : item.type === 'VIDEO' ? '🎥 فيديو' : '📷 صورة'}
                      </Text>
                    </View>
                    <View style={styles.photoOverlayEmoji}>
                      <Text>{item.coverEmoji}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Details Body */}
                  <View style={styles.cardBody}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemMeta}>
                      📅 {item.eventDate} • 📍 {item.location}
                    </Text>
                    <Text style={styles.itemDesc}>{item.description}</Text>

                    {/* Social Stats Row */}
                    <View style={styles.socialRow}>
                      <TouchableOpacity
                        style={[styles.likeBtn, isLiked && styles.likeBtnActive]}
                        onPress={() => toggleLike(item.id)}
                      >
                        <Text style={styles.likeIcon}>{isLiked ? '❤️' : '🤍'}</Text>
                        <Text style={[styles.likeCount, isLiked && styles.likeCountActive]}>
                          {item.likesCount} إعجاب
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.commentsBox}>
                        <Text style={styles.commentIcon}>💬</Text>
                        <Text style={styles.commentCount}>{item.commentsCount} تعليق</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Lightbox Detail Modal */}
      <Modal visible={!!activeMemory} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.lightboxCard}>
            <View style={styles.lightboxVisual}>
              {activeMemory?.coverImageUrl ? (
                <Image
                  source={{ uri: activeMemory.coverImageUrl }}
                  style={{ width: '100%', height: '100%', borderRadius: 14 }}
                  resizeMode="cover"
                />
              ) : (
                <Text style={{ fontSize: 60 }}>{activeMemory?.coverEmoji}</Text>
              )}
              <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 11 }}>
                  {activeMemory?.type === 'ALBUM' ? '📁 ألبوم' : activeMemory?.type === 'VIDEO' ? '🎥 فيديو' : '📷 صورة'}
                </Text>
              </View>
            </View>
            <Text style={styles.lightboxTitle}>{activeMemory?.title}</Text>
            <Text style={styles.lightboxMeta}>
              📍 {activeMemory?.location} • 📅 {activeMemory?.eventDate}
            </Text>
            <Text style={styles.lightboxDesc}>{activeMemory?.description}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 14 }}>
              <Text style={{ fontWeight: 'bold', color: '#DC2626' }}>❤️ {activeMemory?.likesCount} إعجاب</Text>
              <Text style={{ fontWeight: 'bold', color: '#6B7280' }}>💬 {activeMemory?.commentsCount} تعليق</Text>
            </View>
            <TouchableOpacity style={styles.lightboxCloseBtn} onPress={() => setActiveMemory(null)}>
              <Text style={styles.lightboxCloseBtnText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Upload Memory Modal */}
      <Modal visible={showUploadModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.uploadModalCard}>
            <Text style={styles.modalTitle}>📸 إضافة ذكرى كشفية جديدة</Text>
            <Text style={styles.modalSubtitle}>وثّق لحظات معسكرات وفعاليات المجموعة الكشفية</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="عنوان الفعالية / المعسكر (مثال: سمر معسكر الصيف)"
              placeholderTextColor="#888"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="المكان (مثال: دير مارمينا، مسرح الكنيسة)"
              placeholderTextColor="#888"
              value={newLocation}
              onChangeText={setNewLocation}
            />

            <TextInput
              style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
              placeholder="وصف تفصيلي للذكرى وأبرز المواقف الكشفية..."
              placeholderTextColor="#888"
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleAddMemory}>
                <Text style={styles.modalConfirmBtnText}>نشر ومشاركة 🚀</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowUploadModal(false)}>
                <Text style={styles.modalCancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 40 },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#8B0000', marginBottom: 10 },
  uploadTriggerBtn: {
    backgroundColor: '#8B0000',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
  },
  uploadTriggerBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  galleryList: { marginBottom: 20 },
  emptyGallery: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyIcon: { fontSize: 44, marginBottom: 8 },
  emptyText: { fontSize: 15, fontWeight: 'bold', color: '#4B5563' },
  emptySubText: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  memoryCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EADBC8',
    overflow: 'hidden',
    elevation: 2,
  },
  photoBanner: {
    height: 160,
    backgroundColor: '#1E1B4B',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  coverImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  photoEmoji: { fontSize: 60 },
  photoOverlayEmoji: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  photoBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  photoBadgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  cardBody: { padding: 16 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', textAlign: 'right', marginBottom: 4 },
  itemMeta: { fontSize: 12, color: '#8B0000', fontWeight: 'bold', textAlign: 'right', marginBottom: 8 },
  itemDesc: { fontSize: 13, color: '#4B5563', textAlign: 'right', lineHeight: 20, marginBottom: 12 },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  likeBtnActive: { backgroundColor: '#FEE2E2', borderColor: '#DC2626' },
  likeIcon: { fontSize: 14, marginRight: 6 },
  likeCount: { fontSize: 12, color: '#4B5563', fontWeight: 'bold' },
  likeCountActive: { color: '#DC2626' },
  commentsBox: { flexDirection: 'row', alignItems: 'center' },
  commentIcon: { fontSize: 14, marginRight: 4 },
  commentCount: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lightboxCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  lightboxVisual: {
    width: '100%',
    height: 180,
    backgroundColor: '#1E1B4B',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  lightboxTitle: { fontSize: 17, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 6 },
  lightboxMeta: { fontSize: 12, color: '#8B0000', fontWeight: 'bold', marginBottom: 10 },
  lightboxDesc: { fontSize: 13, color: '#4B5563', textAlign: 'right', lineHeight: 20, marginBottom: 16 },
  lightboxCloseBtn: {
    backgroundColor: '#8B0000',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  lightboxCloseBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  uploadModalCard: { width: '100%', backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#8B0000', textAlign: 'center', marginBottom: 4 },
  modalSubtitle: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 16 },
  modalInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D4A359',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    marginBottom: 12,
  },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#8B0000',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 6,
  },
  modalConfirmBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 6,
  },
  modalCancelBtnText: { color: '#374151', fontWeight: 'bold', fontSize: 14 },
});
