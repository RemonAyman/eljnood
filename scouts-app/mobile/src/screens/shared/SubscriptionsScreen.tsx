import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator 
} from 'react-native';
import { useSubscriptionsStore } from '../../store/subscriptionsStore';
import { useMembersStore } from '../../store/membersStore';
import { useAuthStore } from '../../store/authStore';
import { 
  saveSubscriptionToFirestore, 
  saveMemberToFirestore, 
  fetchAllSubscriptionsFromFirestore 
} from '../../services/firebaseService';
import { Member, SquadName, SubscriptionRecord } from '../../types';
import { exportSubscriptionsReport } from '../../utils/reportExportUtils';

const FIXED_DISCOUNT_OPTIONS = [
  0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 
  110, 120, 130, 140, 150, 160, 170, 180, 190, 200
];

export const SubscriptionsScreen = () => {
  const { members, loadMembersFromFirestore, addMember } = useMembersStore();
  const currentUser = useAuthStore((s) => s.user);
  const { 
    prices, 
    customItems, 
    records, 
    applyDiscountCode, 
    calculateTotal, 
    addRecord, 
    updatePrices, 
    addCustomItem, 
    setRecords 
  } = useSubscriptionsStore();

  const isCashierOrLeader = useMemo(() => {
    const role = currentUser?.role;
    return role === 'ADMIN' || role === 'SECTION_LEADER' || role === 'LEADER' || role === 'GROUP_MANAGER';
  }, [currentUser]);

  const [activeTab, setActiveTab] = useState<'NEW_PAYMENT' | 'ARCHIVE'>(
    currentUser?.role === 'ADMIN' || currentUser?.role === 'SECTION_LEADER' || currentUser?.role === 'LEADER' ? 'NEW_PAYMENT' : 'ARCHIVE'
  );

  // Member selection mode: EXISTING (قديم) vs NEW (جديد)
  const [memberMode, setMemberMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // New member fields
  const [manualName, setManualName] = useState('');
  const [manualCode, setManualCode] = useState(`JS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [manualSquad, setManualSquad] = useState<SquadName>('أشبال');
  const [manualGuardianPhone, setManualGuardianPhone] = useState('');
  
  // Member Picker
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [showMemberPicker, setShowMemberPicker] = useState(false);

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  
  // Selected items checkboxes state (Default items + Custom Items)
  const [items, setItems] = useState<Record<string, boolean>>({
    annualSub: true,
    festivalSub: false,
    promisePartySub: false,
    scarfReplacement: false,
    wajla: false,
    badges: false,
  });

  // Discount States (No fake defaults)
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [selectedFixedDiscountEgp, setSelectedFixedDiscountEgp] = useState<number>(0);

  // Secret PIN modal
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');

  // Receipt Modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<SubscriptionRecord | null>(null);

  // Price & Custom Item Editor Modal (Admin / Cashier)
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [tempPrices, setTempPrices] = useState({ ...prices });
  const [newCustomTitle, setNewCustomTitle] = useState('');
  const [newCustomPrice, setNewCustomPrice] = useState('');
  const [newCustomDesc, setNewCustomDesc] = useState('');

  // Archive search
  const [archiveSearch, setArchiveSearch] = useState('');
  const [loadingArchive, setLoadingArchive] = useState(false);

  useEffect(() => {
    loadMembersFromFirestore();
    setLoadingArchive(true);
    fetchAllSubscriptionsFromFirestore().then((cloudRecords) => {
      if (cloudRecords && cloudRecords.length > 0) {
        setRecords(cloudRecords);
      }
      setLoadingArchive(false);
    });
  }, []);

  useEffect(() => {
    if (members.length > 0 && !selectedMember) {
      setSelectedMember(members[0]);
    }
  }, [members]);

  const toggleItem = (key: string) => {
    setItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Live Total Calculation combining Percentage Discount Code AND Fixed EGP Discount
  const { subtotal, percentDiscountAmount, fixedDiscountEgp, discountAmount, totalPaid } = calculateTotal(
    items, 
    discountApplied ? discountPercent : 0, 
    selectedFixedDiscountEgp
  );

  const handleApplyDiscount = () => {
    if (!discountCodeInput.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال كود الخصم كنسبة مئوية (مثال: SCOUT10 أو 20%)');
      return;
    }
    setShowPinModal(true);
  };

  const verifyPinAndApply = () => {
    const res = applyDiscountCode(discountCodeInput, pinInput);
    if (res.success) {
      setDiscountPercent(res.percentage);
      setDiscountApplied(true);
      setShowPinModal(false);
      setPinInput('');
      Alert.alert('تم بنجاح ✅', `تم تفعيل خصم ${res.percentage}% المئوي بنجاح ببركة الخزينة! 🔑`);
    } else {
      Alert.alert('خطأ في الاعتماد ❌', res.error || 'فشل تطبيق الخصم');
    }
  };

  const handleSavePrices = () => {
    updatePrices(tempPrices);
    setShowPriceModal(false);
    Alert.alert('تم بنجاح ✅', 'تم تحديث لائحة أسعار الاشتراكات الرسمية بنجاح!');
  };

  const handleAddNewCustomItem = () => {
    if (!newCustomTitle.trim() || !newCustomPrice.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة عنوان وتكلفة بند الاشتراك الجديد');
      return;
    }
    const parsedPrice = parseInt(newCustomPrice, 10);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('تنبيه', 'يرجى إدخال مبلغ صحيح بالجنيه');
      return;
    }

    addCustomItem({
      title: newCustomTitle.trim(),
      price: parsedPrice,
      desc: newCustomDesc.trim() || 'بند اشتراك مخصص جديد',
    });

    setNewCustomTitle('');
    setNewCustomPrice('');
    setNewCustomDesc('');
    Alert.alert('تم الإضافة 🎉', `تم إضافة بند الاشتراك الجديد "${newCustomTitle}" بسعر ${parsedPrice} ج.م بنجاح!`);
  };

  const handleConfirmPayment = async () => {
    let memberName = '';
    let memberCode = '';
    let memberId = '';

    if (memberMode === 'EXISTING') {
      if (!selectedMember) {
        Alert.alert('تنبيه', 'يرجى اختيار العضو المسجل لإصدار الإيصال');
        return;
      }
      memberName = selectedMember.name;
      memberCode = selectedMember.code;
      memberId = selectedMember.id;
    } else {
      // NEW MEMBER
      if (!manualName.trim()) {
        Alert.alert('تنبيه', 'يرجى كتابة اسم العضو الجديد لإصدار الإيصال');
        return;
      }
      memberName = manualName.trim();
      memberCode = manualCode.trim() || `JS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      memberId = `m_${Date.now()}`;

      // Save new member to local store & Cloud Firestore
      const newMemData: Member = {
        id: memberId,
        code: memberCode,
        name: memberName,
        gender: 'MALE',
        scarfStatus: 'NOT_RECEIVED',
        birthDate: '2015-01-01',
        gradeLevel: 'GRADE_4',
        squadName: manualSquad,
        guardianPhone: manualGuardianPhone.trim() || '01200000000',
        createdAt: new Date().toISOString(),
      };

      addMember(newMemData);
      await saveMemberToFirestore(newMemData);
    }

    if (totalPaid <= 0 && subtotal <= 0) {
      Alert.alert('تنبيه', 'يرجى اختيار بند واحد على الأقل للتحصيل');
      return;
    }

    const newRecord = addRecord({
      memberId,
      memberCode,
      memberName,
      year: selectedYear,
      annualSub: !!items.annualSub,
      festivalSub: !!items.festivalSub,
      promisePartySub: !!items.promisePartySub,
      scarfReplacement: !!items.scarfReplacement,
      wajla: !!items.wajla,
      badges: !!items.badges,
      subtotal,
      discountPercentage: discountApplied ? discountPercent : 0,
      fixedDiscountEgp: selectedFixedDiscountEgp,
      totalPaid,
    });

    // Sync receipt to Cloud Firestore
    await saveSubscriptionToFirestore(newRecord);

    setLastReceipt(newRecord);
    setShowReceiptModal(true);

    // Reset manual input fields if new
    if (memberMode === 'NEW') {
      setManualName('');
      setManualCode(`JS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setManualGuardianPhone('');
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter((m) =>
      m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(memberSearchQuery.toLowerCase())
    );
  }, [members, memberSearchQuery]);

  const filteredArchive = useMemo(() => {
    return records.filter((r) =>
      r.memberName.toLowerCase().includes(archiveSearch.toLowerCase()) ||
      r.memberCode.toLowerCase().includes(archiveSearch.toLowerCase()) ||
      r.receiptNumber.toLowerCase().includes(archiveSearch.toLowerCase())
    );
  }, [records, archiveSearch]);

  const squadOptions: SquadName[] = ['براعم', 'أشبال', 'زهرات', 'كشاف', 'مرشدات', 'متقدم', 'رائدات', 'جوالة'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.badgePill}>
          <Text style={styles.badgePillText}>🔒 خزينة ومصروفات معتمدة - مسؤولو الاشتراكات المعمل</Text>
        </View>
        <Text style={styles.headerTitle}>الماليات وحساب الاشتراكات 💰</Text>
        <Text style={styles.headerSub}>تحصيل الدفعات، خصومات النسبة + المبلغ المالي، وإصدار الإيصالات الرسمية</Text>
        
        <View style={styles.headerStatsRow}>
          <View style={styles.headerStatBox}>
            <Text style={styles.statVal}>{records.length > 0 ? `${records.reduce((a, b) => a + (b.totalPaid || 0), 0)} ج.م` : '0 ج.م'}</Text>
            <Text style={styles.statLbl}>إجمالي المحصل الفعلي</Text>
          </View>
          <View style={styles.headerStatBox}>
            <Text style={styles.statVal}>{records.length} إيصال</Text>
            <Text style={styles.statLbl}>إيصالات مسجلة</Text>
          </View>
          {isCashierOrLeader && (
            <View style={styles.headerStatBox}>
              <TouchableOpacity 
                style={styles.priceEditBtn} 
                onPress={() => { setTempPrices({ ...prices }); setShowPriceModal(true); }}
              >
                <Text style={styles.priceEditBtnText}>⚙️ إدارة الأسعار</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.priceEditBtn, { backgroundColor: '#D1FAE5', marginTop: 4 }]} 
                onPress={() => exportSubscriptionsReport(records)}
              >
                <Text style={[styles.priceEditBtnText, { color: '#065F46' }]}>📊 تصدير CSV/PDF</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Navigation Tabs (New Payment vs Archive) */}
      <View style={styles.topNavigationTabs}>
        <TouchableOpacity
          style={[styles.topTabBtn, activeTab === 'NEW_PAYMENT' && styles.topTabBtnActive]}
          onPress={() => setActiveTab('NEW_PAYMENT')}
          activeOpacity={0.8}
        >
          <Text style={[styles.topTabBtnText, activeTab === 'NEW_PAYMENT' && styles.topTabBtnTextActive]}>
            🧾 إصدار إيصال سداد جديد
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topTabBtn, activeTab === 'ARCHIVE' && styles.topTabBtnActive]}
          onPress={() => setActiveTab('ARCHIVE')}
          activeOpacity={0.8}
        >
          <Text style={[styles.topTabBtnText, activeTab === 'ARCHIVE' && styles.topTabBtnTextActive]}>
            📚 أرشيف الإيصالات ({records.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'NEW_PAYMENT' ? (
        <>
          {/* Member Selection / Manual Mode */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>١. نوع العضو الكشفي والسنة المالية</Text>

            <View style={styles.modeTabsRow}>
              <TouchableOpacity 
                style={[styles.modeTab, memberMode === 'EXISTING' && styles.modeTabActive]}
                onPress={() => setMemberMode('EXISTING')}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeTabText, memberMode === 'EXISTING' && styles.modeTabTextActive]}>
                  👤 فرد قديم (مسجل سابقاً)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modeTab, memberMode === 'NEW' && styles.modeTabActive]}
                onPress={() => setMemberMode('NEW')}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeTabText, memberMode === 'NEW' && styles.modeTabTextActive]}>
                  ✨ فرد جديد (تسجيل وتسديد)
                </Text>
              </TouchableOpacity>
            </View>

            {memberMode === 'EXISTING' ? (
              <>
                {selectedMember ? (
                  <TouchableOpacity 
                    style={styles.memberSelectRow}
                    onPress={() => setShowMemberPicker(!showMemberPicker)}
                  >
                    <View style={styles.memberAvatarCircle}>
                      <Text style={styles.memberAvatarText}>⚜️</Text>
                    </View>
                    <View style={styles.memberDetailsCol}>
                      <Text style={styles.selectedMemberName}>{selectedMember.name}</Text>
                      <Text style={styles.selectedMemberSub}>
                        فرقة {selectedMember.squadName} ({selectedMember.code}) • اضغط لتغيير العضو 🔄
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.emptyMemberPickBtn}
                    onPress={() => setShowMemberPicker(true)}
                  >
                    <Text style={styles.emptyMemberPickText}>🔍 اضغط هنا لاختيار كشاف مسجل من القائمة</Text>
                  </TouchableOpacity>
                )}

                {showMemberPicker && (
                  <View style={styles.pickerBox}>
                    <TextInput
                      style={styles.pickerSearchInput}
                      placeholder="🔍 ابحث بالاسم أو كود العضوية..."
                      placeholderTextColor="#888"
                      value={memberSearchQuery}
                      onChangeText={setMemberSearchQuery}
                    />
                    <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
                      {filteredMembers.length > 0 ? (
                        filteredMembers.map((m) => (
                          <TouchableOpacity
                            key={m.id}
                            style={styles.pickerRow}
                            onPress={() => {
                              setSelectedMember(m);
                              setShowMemberPicker(false);
                            }}
                          >
                            <Text style={styles.pickerRowName}>{m.name}</Text>
                            <Text style={styles.pickerRowSub}>فرقة {m.squadName} • {m.code}</Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <Text style={styles.pickerEmptyText}>لا توجد نتائج مطابقة</Text>
                      )}
                    </ScrollView>
                  </View>
                )}
              </>
            ) : (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.inputLabel}>اسم العضو الجديد بالكامل *</Text>
                <TextInput
                  style={styles.manualInput}
                  placeholder="مثال: بيتر يوسف فايز"
                  value={manualName}
                  onChangeText={setManualName}
                />
                
                <View style={{ flexDirection: 'row-reverse', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>الكود الكشفي *</Text>
                    <TextInput
                      style={styles.manualInput}
                      placeholder="JS-2026-XXX"
                      value={manualCode}
                      onChangeText={setManualCode}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>رقم موبايل ولي الأمر *</Text>
                    <TextInput
                      style={styles.manualInput}
                      placeholder="012XXXXXXXX"
                      keyboardType="phone-pad"
                      value={manualGuardianPhone}
                      onChangeText={setManualGuardianPhone}
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>الفرقة / القطاع المنضم إليه *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
                  {squadOptions.map((sq) => (
                    <TouchableOpacity
                      key={sq}
                      style={[styles.squadChip, manualSquad === sq && styles.squadChipActive]}
                      onPress={() => setManualSquad(sq)}
                    >
                      <Text style={[styles.squadChipText, manualSquad === sq && styles.squadChipTextActive]}>
                        {sq}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Year Pills (2026 - 2029) */}
            <Text style={styles.subLabel}>اختر السنة المالية للمطابقة:</Text>
            <View style={styles.yearsRow}>
              {[2026, 2027, 2028, 2029].map((year) => {
                const isSelected = selectedYear === year;
                return (
                  <TouchableOpacity
                    key={year}
                    style={[styles.yearPill, isSelected && styles.yearPillActive]}
                    onPress={() => setSelectedYear(year)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.yearPillText, isSelected && styles.yearPillTextActive]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Items Calculation Checklist */}
          <View style={styles.card}>
            <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.cardTitle, { marginBottom: 0 }]}>٢. حاسبة البنود والاشتراكات المقررة</Text>
              {isCashierOrLeader && (
                <TouchableOpacity
                  onPress={() => {
                    setTempPrices({ ...prices });
                    setShowPriceModal(true);
                  }}
                  style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: '#8B0000' }}
                >
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#8B0000' }}>⚙️ إدارة الأسعار والبنود</Text>
                </TouchableOpacity>
              )}
            </View>

            {[
              { key: 'annualSub', title: 'اشتراك سنوي كشفي', desc: 'يشمل التأمين الكشفي وشهادة العضوية السنوية', price: prices.annualSub },
              { key: 'festivalSub', title: 'اشتراك مهرجان الكرازة الكشفي', desc: 'مقرر الأنشطة والتدريبات الكشفية الصيفية', price: prices.festivalSub },
              { key: 'promisePartySub', title: 'اشتراك حفلة الوعد الكبرى', desc: 'حضور الحفل والمشروبات وإصدار العهد الكشفي', price: prices.promisePartySub },
              { key: 'wajla', title: 'وجلة خشبية محفورة', desc: 'عقدة المنديل الكشفي الرسمية محفورة باسم الخدمة', price: prices.wajla },
              { key: 'scarfReplacement', title: 'بدل فاقد المنديل الكشفي الحريري', desc: 'استعاضة المنديل المفقود بالشارة الرسمية', price: prices.scarfReplacement },
              { key: 'badges', title: 'شارات وترقيات القميص الكشفي', desc: 'شارات الهواية والأوسمة المعتمدة للفوج الكشفي', price: prices.badges },
            ].map((item) => {
              const checked = !!items[item.key];
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.itemRow, checked && styles.itemRowChecked]}
                  onPress={() => toggleItem(item.key)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked && <Text style={styles.checkIcon}>✓</Text>}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemDesc}>{item.desc}</Text>
                  </View>
                  <View style={styles.itemPriceBadge}>
                    <Text style={styles.itemPriceText}>{item.price} ج.م</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Custom Created Subscription Items */}
            {customItems.length > 0 && (
              <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                <Text style={styles.subLabel}>البنود والخدمات المخصصة المضافة:</Text>
                {customItems.map((c) => {
                  const checked = !!items[c.id];
                  const currentPrice = prices[c.id] !== undefined ? prices[c.id] : c.price;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.itemRow, checked && styles.itemRowChecked, { borderColor: '#D4A359' }]}
                      onPress={() => toggleItem(c.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.checkbox, checked && styles.checkboxChecked, { borderColor: '#D4A359' }]}>
                        {checked && <Text style={styles.checkIcon}>✓</Text>}
                      </View>
                      <View style={styles.itemInfo}>
                        <Text style={[styles.itemTitle, { color: '#8B0000' }]}>⭐ {c.title}</Text>
                        <Text style={styles.itemDesc}>{c.desc}</Text>
                      </View>
                      <View style={[styles.itemPriceBadge, { backgroundColor: '#FEF3C7' }]}>
                        <Text style={[styles.itemPriceText, { color: '#92400E' }]}>{currentPrice} ج.م</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Combined Discounts Section (Code Discount + Fixed EGP Discount) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>٣. منظومة الخصومات والتخفيضات الكشفية 🏷️</Text>
            
            {/* A) Fixed Amount Discount Selector (10 EGP up to 200 EGP) */}
            <Text style={styles.subLabel}>أ) اختر خصم مالي مباشر بالجنيه (من 10 ج إلى 200 ج):</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
              {FIXED_DISCOUNT_OPTIONS.map((amt) => {
                const isSelected = selectedFixedDiscountEgp === amt;
                return (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.fixedDiscountChip, isSelected && styles.fixedDiscountChipActive]}
                    onPress={() => setSelectedFixedDiscountEgp(amt)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.fixedDiscountChipText, isSelected && styles.fixedDiscountChipTextActive]}>
                      {amt === 0 ? 'بدون خصم مالي' : `-${amt} ج.م`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* B) Code Percentage Discount */}
            <Text style={[styles.subLabel, { marginTop: 12 }]}>ب) أدخل كود خصم كنسبة مئوية (مثال: SCOUT10 - SCOUT90 أو 50%):</Text>
            <View style={styles.discountInputRow}>
              <TextInput
                style={styles.discountInput}
                placeholder="كود الخصم (SCOUT10 - SCOUT90)..."
                value={discountCodeInput}
                onChangeText={setDiscountCodeInput}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyDiscount}>
                <Text style={styles.applyBtnText}>تطبيق الكود</Text>
              </TouchableOpacity>
            </View>

            {/* Summary Tag of Applied Discounts */}
            {(discountApplied || selectedFixedDiscountEgp > 0) && (
              <View style={styles.discountSuccessTag}>
                <Text style={styles.discountSuccessText}>
                  ✓ الخصم المفعل: {discountApplied ? `كود مئوي (${discountPercent}%)` : ''} 
                  {discountApplied && selectedFixedDiscountEgp > 0 ? ' + ' : ''}
                  {selectedFixedDiscountEgp > 0 ? `خصم مالي (-${selectedFixedDiscountEgp} ج.م)` : ''}
                  {` | إجمالي التخفيض: ${discountAmount} ج.م`}
                </Text>
              </View>
            )}
          </View>

          {/* Live Total Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>ملخص الحساب الإجمالي المباشر 💰</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryVal}>{subtotal} ج.م</Text>
              <Text style={styles.summaryLbl}>المجموع الإجمالي (قبل الخصم):</Text>
            </View>

            {percentDiscountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryVal, { color: '#059669' }]}>-{percentDiscountAmount} ج.م ({discountPercent}%)</Text>
                <Text style={styles.summaryLbl}>خصم كود النسبة المئوية:</Text>
              </View>
            )}

            {fixedDiscountEgp > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryVal, { color: '#059669' }]}>-{fixedDiscountEgp} ج.م</Text>
                <Text style={styles.summaryLbl}>خصم المبلغ المالي المباشر:</Text>
              </View>
            )}

            {discountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryVal, { color: '#059669', fontSize: 16 }]}>-{discountAmount} ج.م</Text>
                <Text style={styles.summaryLbl}>إجمالي الخصم المعتمد:</Text>
              </View>
            )}

            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalNetVal}>{totalPaid} ج.م</Text>
              <Text style={styles.totalNetLbl}>المبلغ المطلوب تحصيله الآن:</Text>
            </View>

            <TouchableOpacity 
              style={styles.confirmPayBtn} 
              onPress={handleConfirmPayment}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmPayBtnText}>💰 تحصيل الدفعة وإصدار الإيصال الرسمي</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        /* ARCHIVE TAB */
        <View style={styles.card}>
          <Text style={styles.cardTitle}>أرشيف الإيصالات والسجلات الكشفية المسجلة 📚</Text>
          <TextInput
            style={styles.pickerSearchInput}
            placeholder="🔍 ابحث برقم الإيصال أو اسم الكشاف أو كود العضوية..."
            value={archiveSearch}
            onChangeText={setArchiveSearch}
          />

          {loadingArchive ? (
            <ActivityIndicator size="large" color="#8B0000" style={{ marginVertical: 20 }} />
          ) : filteredArchive.length > 0 ? (
            filteredArchive.map((rec) => (
              <TouchableOpacity
                key={rec.id}
                style={styles.archiveRowCard}
                onPress={() => {
                  setLastReceipt(rec);
                  setShowReceiptModal(true);
                }}
              >
                <View style={styles.archiveRowHeader}>
                  <Text style={styles.archiveReceiptNum}>{rec.receiptNumber}</Text>
                  <Text style={styles.archiveMemberName}>{rec.memberName}</Text>
                </View>
                <View style={styles.archiveRowFooter}>
                  <Text style={styles.archiveTotal}>{rec.totalPaid} ج.م</Text>
                  <Text style={styles.archiveDate}>
                    سنة {rec.year} • {rec.discountPercentage > 0 ? `خصم %${rec.discountPercentage}` : 'كامل'} {rec.fixedDiscountEgp ? `+ ${rec.fixedDiscountEgp}ج` : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 30 }}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🧾</Text>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#6B7280' }}>لا توجد إيصالات مسجلة سابقة في الأرشيف</Text>
            </View>
          )}
        </View>
      )}

      {/* Secret PIN Modal for Code Discount */}
      <Modal visible={showPinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>🔑</Text>
            <Text style={styles.modalHeading}>إدخال رمز تفويض الخصم</Text>
            <Text style={styles.modalSubtitle}>
              كود الخصم يتطلب إدخال الرمز السري الخاص بأمين الصندوق أو مسؤول الخزينة (1234 أو 0000)
            </Text>

            <TextInput
              style={styles.pinInputField}
              placeholder="••••"
              value={pinInput}
              onChangeText={setPinInput}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnCancel]} 
                onPress={() => setShowPinModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnConfirm]} 
                onPress={verifyPinAndApply}
              >
                <Text style={styles.modalBtnConfirmText}>اعتماد الخصم</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Price & Custom Item Editor Modal (Admin / Cashier / Leader) */}
      <Modal visible={showPriceModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { width: '94%', maxHeight: '88%' }]}>
            <Text style={styles.modalIcon}>⚙️</Text>
            <Text style={styles.modalHeading}>تعديل وإضافة بنود الاشتراكات</Text>
            <Text style={styles.modalSubtitle}>
              تخصيص وتعديل أسعار بنود الخدمة أو إضافة بنود مخصصة جديدة
            </Text>

            <ScrollView style={{ width: '100%', marginVertical: 10 }}>
              <Text style={[styles.subLabel, { color: '#8B0000', fontWeight: 'bold' }]}>١) تعديل أسعار البنود الرئيسية:</Text>
              {[
                { key: 'annualSub' as const, title: 'اشتراك سنوي كشفي' },
                { key: 'festivalSub' as const, title: 'اشتراك مهرجان الكرازة' },
                { key: 'promisePartySub' as const, title: 'اشتراك حفلة الوعد' },
                { key: 'wajla' as const, title: 'وجلة خشبية' },
                { key: 'scarfReplacement' as const, title: 'بدل فاقد المنديل' },
                { key: 'badges' as const, title: 'شارات وترقيات' },
              ].map((pItem) => (
                <View key={pItem.key} style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#374151' }}>{pItem.title}</Text>
                  <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
                    <TextInput
                      style={{ backgroundColor: '#FAF7F2', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, width: 80, textAlign: 'center', fontWeight: 'bold', color: '#8B0000', fontSize: 14 }}
                      keyboardType="numeric"
                      value={String(tempPrices[pItem.key] !== undefined ? tempPrices[pItem.key] : prices[pItem.key])}
                      onChangeText={(val) => setTempPrices(prev => ({ ...prev, [pItem.key]: parseInt(val, 10) || 0 }))}
                    />
                    <Text style={{ fontSize: 12, color: '#6B7280', marginRight: 6 }}>ج.م</Text>
                  </View>
                </View>
              ))}

              <Text style={[styles.subLabel, { color: '#8B0000', fontWeight: 'bold', marginTop: 16 }]}>٢) إضافة بند اشتراك / خدمة مخصصة جديدة ✨:</Text>
              <View style={{ backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FDE68A', marginVertical: 6 }}>
                <TextInput
                  style={styles.manualInput}
                  placeholder="عنوان بند الاشتراك الجديد (مثال: اشتراك معسكر الشتاء)..."
                  value={newCustomTitle}
                  onChangeText={setNewCustomTitle}
                />
                <TextInput
                  style={styles.manualInput}
                  placeholder="السعر بالجنيه (مثال: 250)..."
                  keyboardType="numeric"
                  value={newCustomPrice}
                  onChangeText={setNewCustomPrice}
                />
                <TextInput
                  style={styles.manualInput}
                  placeholder="وصف وتفاصيل البند..."
                  value={newCustomDesc}
                  onChangeText={setNewCustomDesc}
                />
                <TouchableOpacity
                  style={[styles.applyBtn, { backgroundColor: '#8B0000', marginTop: 6, alignSelf: 'stretch' }]}
                  onPress={handleAddNewCustomItem}
                >
                  <Text style={styles.applyBtnText}>+ إضافة بند جديد للخدمة</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnCancel]} 
                onPress={() => setShowPriceModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnConfirm]} 
                onPress={handleSavePrices}
              >
                <Text style={styles.modalBtnConfirmText}>حفظ الأسعار</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Printable Thermal Receipt Modal */}
      <Modal visible={showReceiptModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.receiptBox}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptGroup}>مجموعة جنود المسيح الكشفية ⚜️</Text>
              <Text style={styles.receiptChurch}>مجموعة جنود المسيح الكشفية</Text>
              <Text style={styles.receiptType}>🧾 إيصال تحصيل اشتراكات رسمي</Text>
            </View>

            <View style={styles.receiptDivider} />

            {lastReceipt && (
              <View style={styles.receiptBody}>
                <View style={styles.receiptLine}>
                  <Text style={styles.receiptLineVal}>{lastReceipt.receiptNumber}</Text>
                  <Text style={styles.receiptLineLbl}>رقم الإيصال:</Text>
                </View>
                <View style={styles.receiptLine}>
                  <Text style={styles.receiptLineVal}>{lastReceipt.memberName}</Text>
                  <Text style={styles.receiptLineLbl}>اسم الكشاف:</Text>
                </View>
                <View style={styles.receiptLine}>
                  <Text style={styles.receiptLineVal}>{lastReceipt.memberCode}</Text>
                  <Text style={styles.receiptLineLbl}>كود العضوية:</Text>
                </View>
                <View style={styles.receiptLine}>
                  <Text style={styles.receiptLineVal}>{lastReceipt.year}</Text>
                  <Text style={styles.receiptLineLbl}>السنة المالية:</Text>
                </View>

                <View style={styles.receiptDivider} />

                <Text style={styles.receiptItemsTitle}>البنود المسددة:</Text>
                {lastReceipt.annualSub && <Text style={styles.receiptItem}>• اشتراك سنوي كشفي ({prices.annualSub} ج.م)</Text>}
                {lastReceipt.festivalSub && <Text style={styles.receiptItem}>• اشتراك مهرجان الكرازة ({prices.festivalSub} ج.م)</Text>}
                {lastReceipt.promisePartySub && <Text style={styles.receiptItem}>• اشتراك حفلة الوعد ({prices.promisePartySub} ج.م)</Text>}
                {lastReceipt.wajla && <Text style={styles.receiptItem}>• وجلة خشبية ({prices.wajla} ج.م)</Text>}
                {lastReceipt.scarfReplacement && <Text style={styles.receiptItem}>• بدل فاقد المنديل ({prices.scarfReplacement} ج.م)</Text>}
                {lastReceipt.badges && <Text style={styles.receiptItem}>• شارات وترقيات ({prices.badges} ج.م)</Text>}

                <View style={styles.receiptDivider} />

                <View style={styles.receiptLine}>
                  <Text style={styles.receiptLineVal}>{lastReceipt.subtotal} ج.م</Text>
                  <Text style={styles.receiptLineLbl}>الإجمالي قبل الخصم:</Text>
                </View>
                {lastReceipt.discountPercentage > 0 && (
                  <View style={styles.receiptLine}>
                    <Text style={[styles.receiptLineVal, { color: '#059669' }]}>%{lastReceipt.discountPercentage}</Text>
                    <Text style={styles.receiptLineLbl}>نسبة الخصم المعتمدة:</Text>
                  </View>
                )}
                {lastReceipt.fixedDiscountEgp ? (
                  <View style={styles.receiptLine}>
                    <Text style={[styles.receiptLineVal, { color: '#059669' }]}>-{lastReceipt.fixedDiscountEgp} ج.م</Text>
                    <Text style={styles.receiptLineLbl}>خصم مالي مباشر:</Text>
                  </View>
                ) : null}
                <View style={styles.receiptLine}>
                  <Text style={[styles.receiptLineVal, styles.receiptTotalText]}>{lastReceipt.totalPaid} ج.م</Text>
                  <Text style={[styles.receiptLineLbl, styles.receiptTotalText]}>الصافي المدفوع:</Text>
                </View>

                <View style={styles.receiptFooter}>
                  <Text style={styles.receiptFooterText}>توقيع أمين الصندوق / مسؤول الخزينة الكشفية</Text>
                  <Text style={styles.receiptDateText}>
                    {new Date(lastReceipt.createdAt || Date.now()).toLocaleDateString('ar-EG')} - {new Date(lastReceipt.createdAt || Date.now()).toLocaleTimeString('ar-EG')}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.receiptActions}>
              <TouchableOpacity 
                style={styles.receiptCloseBtn} 
                onPress={() => setShowReceiptModal(false)}
              >
                <Text style={styles.receiptCloseBtnText}>إغلاق</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.receiptPrintBtn} 
                onPress={() => {
                  Alert.alert('طباعة 🖨️', 'تم إرسال الإيصال لماكينة الطباعة الحرارية بنجاح!');
                  setShowReceiptModal(false);
                }}
              >
                <Text style={styles.receiptPrintBtnText}>🖨️ طباعة الإيصال</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#8B0000',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
  },
  badgePill: {
    backgroundColor: 'rgba(212, 163, 89, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 6,
  },
  badgePillText: {
    color: '#D4A359',
    fontSize: 11,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSub: {
    color: '#F3F4F6',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  headerStatsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  headerStatBox: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statLbl: {
    color: '#D4A359',
    fontSize: 10,
    marginTop: 2,
  },
  priceEditBtn: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  priceEditBtnText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: 'bold',
  },
  topNavigationTabs: {
    flexDirection: 'row-reverse',
    marginBottom: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    padding: 4,
  },
  topTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  topTabBtnActive: {
    backgroundColor: '#8B0000',
  },
  topTabBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  topTabBtnTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 12,
    textAlign: 'right',
  },
  modeTabsRow: {
    flexDirection: 'row-reverse',
    marginBottom: 12,
    gap: 8,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D4A359',
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  modeTabTextActive: {
    color: '#92400E',
  },
  memberSelectRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 12,
  },
  memberAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  memberAvatarText: {
    fontSize: 20,
  },
  memberDetailsCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  selectedMemberName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  selectedMemberSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyMemberPickBtn: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#D4A359',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyMemberPickText: {
    color: '#8B0000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  pickerBox: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  pickerSearchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'right',
  },
  pickerRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  pickerRowName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  pickerRowSub: {
    fontSize: 10,
    color: '#6B7280',
  },
  pickerEmptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    paddingVertical: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'right',
  },
  manualInput: {
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'right',
  },
  squadChip: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginLeft: 6,
  },
  squadChipActive: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  squadChipText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  squadChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  subLabel: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 8,
    textAlign: 'right',
  },
  yearsRow: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  yearPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  yearPillActive: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  yearPillText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  yearPillTextActive: {
    color: '#FFFFFF',
  },
  itemRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemRowChecked: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D4A359',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  checkboxChecked: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  itemInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  itemDesc: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  itemPriceBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemPriceText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
  },
  fixedDiscountChip: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  fixedDiscountChipActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  fixedDiscountChipText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
  },
  fixedDiscountChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  discountInputRow: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  discountInput: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    textAlign: 'right',
  },
  applyBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  discountSuccessTag: {
    backgroundColor: '#D1FAE5',
    borderRadius: 10,
    padding: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  discountSuccessText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#8B0000',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    color: '#D4A359',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLbl: {
    color: '#F3F4F6',
    fontSize: 12,
  },
  summaryVal: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 10,
  },
  totalNetLbl: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalNetVal: {
    color: '#D4A359',
    fontSize: 22,
    fontWeight: 'bold',
  },
  confirmPayBtn: {
    backgroundColor: '#D4A359',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  confirmPayBtnText: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 14,
  },
  archiveRowCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  archiveRowHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  archiveReceiptNum: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  archiveMemberName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  archiveRowFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  archiveTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
  },
  archiveDate: {
    fontSize: 11,
    color: '#6B7280',
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
    borderRadius: 24,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 36,
    marginBottom: 6,
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  pinInputField: {
    backgroundColor: '#FAF7F2',
    borderWidth: 2,
    borderColor: '#8B0000',
    borderRadius: 14,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 10,
    width: 140,
    paddingVertical: 8,
    marginBottom: 14,
  },
  modalBtnRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#F3F4F6',
  },
  modalBtnCancelText: {
    color: '#4B5563',
    fontWeight: 'bold',
  },
  modalBtnConfirm: {
    backgroundColor: '#8B0000',
  },
  modalBtnConfirmText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  receiptBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    width: '100%',
  },
  receiptHeader: {
    alignItems: 'center',
  },
  receiptGroup: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  receiptChurch: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  receiptType: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#D4A359',
    marginTop: 4,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  receiptBody: {},
  receiptLine: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  receiptLineLbl: {
    fontSize: 12,
    color: '#6B7280',
  },
  receiptLineVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  receiptItemsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8B0000',
    textAlign: 'right',
    marginBottom: 4,
  },
  receiptItem: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'right',
    marginBottom: 2,
  },
  receiptTotalText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#8B0000',
  },
  receiptFooter: {
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  receiptFooterText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  receiptDateText: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 2,
  },
  receiptActions: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginTop: 14,
  },
  receiptCloseBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  receiptCloseBtnText: {
    color: '#4B5563',
    fontWeight: 'bold',
  },
  receiptPrintBtn: {
    flex: 1,
    backgroundColor: '#8B0000',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  receiptPrintBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
