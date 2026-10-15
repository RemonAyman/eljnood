import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useScout } from '../../context/ScoutContext';
import { getFaClass } from '../common/Icon';

export const SubscriptionsModule = () => {
  const { currentUser, members, addSubscriptionReceipt, priceList, subscriptions } = useScout();
  const role = currentUser?.role || 'admin';
  const canManagePayments = role === 'admin' || role === 'sub_officer';

  const [searchMemberCode, setSearchMemberCode] = useState('JS-2026-104');
  const [selectedMember, setSelectedMember] = useState({
    code: 'JS-2026-104',
    name: 'مارك ميخائيل تادرس',
    patrol: 'طليعة النسر',
    stage: 'فرقة المتقدم',
    badge: 'درجة ثانية',
  });

  const feesConfig = priceList && priceList.length > 0 ? priceList : [
    { id: 'annual', title: 'اشتراك سنوي كشفي', desc: 'يشمل التأمين الكشفي وبطاقة الاتحاد', price: 250, icon: 'fa-solid fa-id-card' },
    { id: 'festival', title: 'اشتراك مهرجان الكرازة الكشفي', desc: 'كتيب الأنشطة والمسابقات الكرازية', price: 200, icon: 'fa-solid fa-medal' },
    { id: 'oathParty', title: 'اشتراك حفلة الوعد الكبرى', desc: 'حضور الحفل + المشروبات وتذكار الوعد', price: 150, icon: 'fa-solid fa-award' },
    { id: 'scarfReplacement', title: 'بدل فاقد المنديل الكشفي الحريري', desc: 'منديل الطائفة المطرز مع الشارة الرسمية', price: 80, icon: 'fa-solid fa-vest' },
    { id: 'trousers', title: 'وجلة خشبية محفورة', desc: 'عقدة المنديل الجلدية/الخشبية باسم المجموعة', price: 40, icon: 'fa-solid fa-shapes' },
    { id: 'badges', title: 'شارات وترقيات القميص الكشفي', desc: 'شارة الهواية والرتبة المتقدمة للعام الجديد', price: 70, icon: 'fa-solid fa-tag' },
  ];

  const [selectedItems, setSelectedItems] = useState(() => {
    const initial = {};
    feesConfig.forEach(item => {
      initial[item.id] = true;
    });
    return initial;
  });

  // Promo discount & Leader PIN
  const [promoCode, setPromoCode] = useState('JNOOD-D20');
  const [discountPercent, setDiscountPercent] = useState(20);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [receipt, setReceipt] = useState(null);

  // Dynamic Collection Filter States
  // Modes: 'today', 'yesterday', 'this_week', 'this_month', 'specific_date', 'all'
  const [collectionFilterMode, setCollectionFilterMode] = useState('today');
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  // Dates calculation helper strings
  const todayStr = new Date().toISOString().substring(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().substring(0, 10);
  const sevenDaysAgoStr = new Date(Date.now() - 7 * 86400000).toISOString().substring(0, 10);
  const currentMonthStr = todayStr.substring(0, 7);

  // Filter subscriptions based on selected collection filter
  const filteredReceipts = (subscriptions || []).filter(r => {
    if (!r.date) return false;
    if (collectionFilterMode === 'today') return r.date === todayStr;
    if (collectionFilterMode === 'yesterday') return r.date === yesterdayStr;
    if (collectionFilterMode === 'this_week') return r.date >= sevenDaysAgoStr && r.date <= todayStr;
    if (collectionFilterMode === 'this_month') return r.date.startsWith(currentMonthStr);
    if (collectionFilterMode === 'specific_date') return r.date === customDate;
    if (collectionFilterMode === 'all') return true;
    return true;
  });

  const filteredTotal = filteredReceipts.reduce((sum, r) => sum + (Number(r.total) || 0), 0);

  const toggleSelectAll = () => {
    const allSelected = feesConfig.every(item => selectedItems[item.id]);
    const updated = {};
    feesConfig.forEach(item => {
      updated[item.id] = !allSelected;
    });
    setSelectedItems(updated);
  };

  // Subtotal & Calculations
  const subtotal = feesConfig.reduce((sum, item) => {
    return selectedItems[item.id] ? sum + Number(item.price || 0) : sum;
  }, 0);

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalTotal = subtotal - discountAmount;

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'JNOOD-D20') {
      setDiscountPercent(20);
      alert('تم تطبيق خصم الإخوة بنسبة 20% بنجاح!');
    } else {
      alert('كود الخصم غير صحيح');
    }
  };

  const handleAuthorizePin = () => {
    if (pinCode === '1234' || pinCode === '2026') {
      setDiscountPercent(50);
      setShowPinModal(false);
      alert('تم تفعيل صلاحية القائد الكشفي بنجاح (خصم 50%)!');
    } else {
      alert('رمز الـ PIN غير صحيح (جرب 1234)');
    }
  };

  const handleConfirmPayment = () => {
    if (subtotal === 0) {
      alert('برجاء اختيار بند واحد على الأقل للحساب');
      return;
    }

    const selectedTitles = feesConfig
      .filter(item => selectedItems[item.id])
      .map(item => `${item.title} (${item.price} ج.م)`);

    const newReceipt = addSubscriptionReceipt({
      memberCode: selectedMember.code,
      memberName: selectedMember.name,
      sectorName: selectedMember.stage,
      items: selectedTitles,
      discountPercent,
      subtotal,
      discountAmount,
      total: finalTotal,
      paymentMethod: 'نقدي',
    });

    setReceipt(newReceipt);

    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* Top Header Banner matching standard theme in Image 2 & Image 3 */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <i className="fa-solid fa-wallet text-[32px]"></i>
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-black text-xl sm:text-2xl text-[#610000]">الماليات وحساب الاشتراكات</h1>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Collection Pill Widget */}
        <div className="z-10 flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setShowCollectionModal(true)}
            className="px-4 py-2.5 rounded-full bg-[#f6f3ee] hover:bg-[#ebe8e3] text-[#610000] text-xs font-black border border-[#e5e2dd] flex items-center gap-2.5 shadow-2xs transition cursor-pointer group"
            title="انقر لتعديل الفترة أو اختيار تاريخ سابق ورؤية التقارير"
          >
            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <i className="fa-solid fa-money-bill-wave text-[18px]"></i>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#5a403c] font-bold">
                {collectionFilterMode === 'today' && 'تحصيل اليوم:'}
                {collectionFilterMode === 'yesterday' && 'تحصيل الأمس:'}
                {collectionFilterMode === 'this_week' && 'تحصيل الأسبوع:'}
                {collectionFilterMode === 'this_month' && 'تحصيل الشهر:'}
                {collectionFilterMode === 'specific_date' && `تحصيل يوم (${customDate}):`}
                {collectionFilterMode === 'all' && 'إجمالي التحصيل العام:'}
              </span>
              <span className="font-mono font-black text-sm text-[#8b0000]">
                {filteredTotal.toLocaleString()} ج.م
              </span>
            </div>
            <i className="fa-solid fa-sliders text-[18px] text-[#7e5713] group-hover:scale-110 transition"></i>
          </button>
        </div>
      </div>

      {/* Card 1: بيانات الكشاف */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#f0ede9] pb-3">
          <h3 className="font-black text-sm sm:text-base text-[#610000] flex items-center gap-2">
            <i className="fa-solid fa-user-gear text-[#7e5713]"></i>
            <span>بيانات الكشاف والاستعلام المباشر</span>
          </h3>
          <span className="px-3.5 py-1 rounded-full bg-[#ffddb1] text-[#291800] text-xs font-black border border-amber-300">
            كود العضوية النشط
          </span>
        </div>

        {/* Search Input with Scanner Button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchMemberCode}
              onChange={(e) => setSearchMemberCode(e.target.value)}
              placeholder="ابحث بالاسم أو كود الكشاف..."
              className="w-full bg-[#f6f3ee] text-[#1c1c19] text-xs font-bold rounded-2xl py-3 pr-4 pl-10 border border-[#e5e2dd] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-[#7e5713]"></i>
          </div>
          <button className="px-5 py-3 bg-[#8b0000] text-white rounded-2xl flex items-center gap-2 text-xs font-black shadow hover:bg-[#610000] transition cursor-pointer shrink-0 border border-amber-400/30">
            <i className="fa-solid fa-qrcode text-[20px]"></i>
            <span className="hidden sm:inline">مسح الكارنيه</span>
          </button>
        </div>

        {/* Selected Scout Info Card */}
        <div className="bg-[#fcf9f4] p-4 rounded-2xl border border-[#e5e2dd] flex items-center justify-between flex-wrap gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#ffddb1] text-[#7e5713] flex items-center justify-center font-black text-lg border border-[#7e5713]/30 shadow-2xs">
              م
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[#1c1c19]">{selectedMember.name}</h4>
              <p className="text-xs text-[#5a403c] font-medium">
                {selectedMember.patrol} • {selectedMember.stage}
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-[#ffddb1] text-[#291800] text-xs font-black border border-[#7e5713]/20 shadow-2xs">
            {selectedMember.badge}
          </span>
        </div>
      </div>

      {/* Card 2: حاسبة البنود والاشتراكات المقررة */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#f0ede9] pb-3">
          <h3 className="font-black text-sm sm:text-base text-[#610000] flex items-center gap-2">
            <i className="fa-solid fa-list-check text-[#7e5713]"></i>
            <span>حاسبة البنود والاشتراكات المقررة</span>
          </h3>
          <button
            onClick={toggleSelectAll}
            className="px-3 py-1 rounded-full bg-[#f6f3ee] hover:bg-[#ebe8e3] text-xs font-bold text-[#8b0000] border border-[#e5e2dd] transition cursor-pointer"
          >
            {feesConfig.every(item => selectedItems[item.id]) ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
          </button>
        </div>

        {/* Fee Items List */}
        <div className="space-y-3">
          {feesConfig.map(fee => {
            const isChecked = Boolean(selectedItems[fee.id]);
            return (
              <label
                key={fee.id}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all shadow-2xs ${
                  isChecked
                    ? 'bg-[#ffdad4]/40 border-[#8b0000] shadow-sm'
                    : 'bg-[#fcf9f4] border-[#e5e2dd] hover:bg-[#f6f3ee]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setSelectedItems({ ...selectedItems, [fee.id]: e.target.checked })}
                    className="w-5 h-5 accent-[#8b0000] rounded-lg cursor-pointer shrink-0"
                  />
                  
                  {/* Beige Rounded Icon Box matching Image 1 */}
                  <div className="w-10 h-10 rounded-2xl bg-[#ffddb1]/80 text-[#7e5713] border border-[#7e5713]/25 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                    <i className={`${getFaClass(fee.icon || 'sell')} text-[20px]`}></i>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#1c1c19]">{fee.title}</h4>
                    <p className="text-[11px] sm:text-xs text-[#5a403c] font-medium mt-0.5">{fee.desc}</p>
                  </div>
                </div>
                <span className="font-black text-sm sm:text-base text-[#8b0000] font-mono px-3.5 py-1.5 bg-white rounded-xl border border-[#e5e2dd] shadow-2xs shrink-0">
                  {fee.price} ج.م
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Card 3: نظام الخصومات والمنح الكشفية */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-4">
        <h3 className="font-black text-sm sm:text-base text-[#610000] flex items-center gap-2 border-b border-[#f0ede9] pb-3">
          <i className="fa-solid fa-tags text-[#7e5713]"></i>
          <span>نظام الخصومات والمنح الكشفية</span>
        </h3>

        <div className="p-4 rounded-2xl bg-[#ffddb1]/40 border border-[#7e5713]/30 flex items-center justify-between shadow-2xs">
          <span className="text-xs font-bold text-[#7e5713]">خصم الإخوة 20% مفعل</span>
          <i className="fa-solid fa-circle-check text-[#7e5713] text-[20px]"></i>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="أدخل كود الخصم (مثال: JNOOD-D20)..."
            className="flex-1 bg-[#f6f3ee] text-xs font-mono font-bold px-4 py-3 rounded-2xl border border-[#e5e2dd] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
          />
          <button
            onClick={handleApplyPromo}
            className="px-6 py-3 bg-[#7e5713] hover:bg-[#5a403c] text-white font-black text-xs rounded-2xl shadow transition cursor-pointer"
          >
            تطبيق
          </button>
        </div>

        {/* Leader Permission Override Button */}
        <div className="p-4 bg-[#fcf9f4] rounded-2xl border border-[#e5e2dd] flex items-center justify-between flex-wrap gap-3 shadow-2xs">
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm text-[#1c1c19] flex items-center gap-1.5">
              <i className="fa-solid fa-key text-[18px] text-[#8b0000]"></i>
              <span>صلاحية القائد الكشفي الاستثنائية</span>
            </h4>
            <p className="text-[11px] text-[#5a403c] font-medium mt-0.5">إعفاء جزئي أو كلي للحالات الخاصة (PIN)</p>
          </div>
          <button
            onClick={() => setShowPinModal(true)}
            className="px-5 py-2.5 bg-[#8b0000] hover:bg-[#610000] text-white font-extrabold text-xs rounded-2xl shadow transition cursor-pointer border border-amber-400/30"
          >
            فتح الصلاحية
          </button>
        </div>
      </div>

      {/* Card 4: ملخص الحساب الإجمالي المباشر */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-4">
        <h3 className="font-black text-sm sm:text-base text-[#610000] flex items-center gap-2 border-b border-[#f0ede9] pb-3">
          <i className="fa-solid fa-receipt text-[#7e5713]"></i>
          <span>ملخص الحساب الإجمالي المباشر</span>
        </h3>

        <div className="space-y-3 text-xs font-bold text-[#5a403c]">
          <div className="flex justify-between py-2 border-b border-[#f0ede9]">
            <span>المجموع الإجمالي لبنود المختار:</span>
            <span className="font-mono text-sm text-[#1c1c19]">{subtotal} ج.م</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between py-2 border-b border-[#f0ede9] text-[#8b0000]">
              <span>قيمة الخصم المعتمد ({discountPercent}%):</span>
              <span className="font-mono text-sm">-{discountAmount} ج.م</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-2">
            <div>
              <span className="text-base font-black text-[#1c1c19] block">الصافي المطلوب تحصيله:</span>
              <span className="text-[11px] text-[#7e5713] font-bold">مباشرة لخزينة صندوق الكشافة</span>
            </div>
            <span className="text-3xl font-black text-[#8b0000] font-mono">{finalTotal} ج.م</span>
          </div>
        </div>

        <button
          onClick={handleConfirmPayment}
          className="w-full py-4 rounded-2xl bg-[#8b0000] hover:bg-[#610000] text-white font-extrabold text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer border border-amber-400/30"
        >
          <i className="fa-solid fa-print text-[22px]"></i>
          <span>تأكيد السداد وطباعة الإيصال الفوري</span>
        </button>
      </div>

      {/* Card 5: إيصالات التحصيل المسجلة حديثاً */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#f0ede9] pb-3">
          <h3 className="font-black text-sm sm:text-base text-[#610000] flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-[#7e5713]"></i>
            <span>إيصالات التحصيل المسجلة حديثاً</span>
          </h3>
          <span className="px-3 py-1 rounded-full bg-[#f6f3ee] text-[#8e706b] text-xs font-bold border border-[#e5e2dd]">
            المسجلة بالنظام
          </span>
        </div>

        <div className="space-y-3">
          {(subscriptions || []).slice(0, 5).map((rec, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] flex items-center justify-between flex-wrap gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ffddb1] text-[#7e5713] flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-file-invoice-dollar text-[20px]"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#1c1c19]">{rec.memberName}</h4>
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#ebe8e3] font-mono text-[10px] text-[#5a403c] font-bold">{rec.id || 'TRX'}</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#5a403c] font-medium mt-0.5">
                    {Array.isArray(rec.items) ? rec.items.join(' ، ') : rec.items} • {rec.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-black text-sm sm:text-base text-[#8b0000] font-mono">{rec.total} ج.م</span>
                <button
                  onClick={() => alert(`إعادة طباعة الإيصال ${rec.id}`)}
                  className="p-2 bg-white rounded-xl border border-[#e5e2dd] text-[#7e5713] hover:bg-[#ffddb1] transition cursor-pointer"
                  title="طباعة"
                >
                  <i className="fa-solid fa-print text-[18px]"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collection Filter & Financial Audit Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e5e2dd] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-bold">
                  <i className="fa-solid fa-chart-line text-[26px]"></i>
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-[#610000]">تقرير ومستندات التحصيل المالي</h3>
                  <p className="text-xs text-[#5a403c] font-bold">تدقيق المبالغ المحصلة لخزينة الكشافة بحسب التواريخ والفترات</p>
                </div>
              </div>
              <button
                onClick={() => setShowCollectionModal(false)}
                className="w-9 h-9 rounded-full bg-red-50 text-red-600 font-bold hover:bg-red-100 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Filter Pills Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#5a403c]">اختر نطاق التحصيل المطلوب عرضه:</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'today', label: 'تحصيل اليوم ☀️', desc: todayStr },
                  { id: 'yesterday', label: 'تحصيل الأمس 🕒', desc: yesterdayStr },
                  { id: 'this_week', label: 'هذا الأسبوع 📅', desc: 'آخر 7 أيام' },
                  { id: 'this_month', label: 'هذا الشهر 🗓️', desc: currentMonthStr },
                  { id: 'specific_date', label: 'تاريخ محدد 📌', desc: customDate },
                  { id: 'all', label: 'إجمالي التحصيل العام 🏆', desc: 'جميع الأوقات' },
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setCollectionFilterMode(mode.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition flex flex-col items-center justify-center cursor-pointer border shadow-2xs ${
                      collectionFilterMode === mode.id
                        ? 'bg-[#8b0000] text-white border-[#8b0000] shadow-md'
                        : 'bg-[#f6f3ee] text-[#5a403c] border-[#e5e2dd] hover:bg-[#ebe8e3]'
                    }`}
                  >
                    <span>{mode.label}</span>
                    <span className="text-[10px] opacity-80 font-mono">{mode.desc}</span>
                  </button>
                ))}
              </div>

              {/* Specific Date Picker Selector (if specific_date selected) */}
              {collectionFilterMode === 'specific_date' && (
                <div className="p-3 bg-[#fcf9f4] rounded-2xl border border-[#e5e2dd] flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[#7e5713] flex items-center gap-1">
                    <i className="fa-solid fa-calendar-day text-[18px]"></i>
                    حدد تاريخ اليوم المطلوب للاستعلام:
                  </span>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="bg-white text-xs font-mono font-bold py-2 px-3 rounded-xl border border-[#e5e2dd] text-[#1c1c19] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                  />
                </div>
              )}
            </div>

            {/* Financial Summary Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#ffdad4]/40 p-4 rounded-2xl border border-[#8b0000]/30 text-center space-y-1">
                <span className="text-[11px] font-bold text-[#5a403c] block">إجمالي التحصيل للفترة</span>
                <span className="text-2xl font-black text-[#8b0000] font-mono block">
                  {filteredTotal.toLocaleString()} ج.م
                </span>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center space-y-1">
                <span className="text-[11px] font-bold text-emerald-900 block">عدد الإيصالات المحصلة</span>
                <span className="text-2xl font-black text-emerald-800 font-mono block">
                  {filteredReceipts.length} إيصال
                </span>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center space-y-1">
                <span className="text-[11px] font-bold text-amber-900 block">متوسط قيمة العملية</span>
                <span className="text-2xl font-black text-[#7e5713] font-mono block">
                  {filteredReceipts.length ? Math.round(filteredTotal / filteredReceipts.length) : 0} ج.م
                </span>
              </div>
            </div>

            {/* Detailed Receipts List */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-[#610000] flex items-center justify-between border-b pb-2">
                <span>كشف إيصالات التحصيل بالفترة ({filteredReceipts.length}):</span>
                <span className="text-[11px] text-[#8e706b]">الخزينة المعتمدة</span>
              </h4>

              {filteredReceipts.length === 0 ? (
                <div className="p-8 text-center bg-[#fcf9f4] rounded-2xl border border-[#e5e2dd] space-y-2">
                  <i className="fa-solid fa-receipt text-[36px] text-[#8e706b]"></i>
                  <p className="text-xs font-bold text-[#5a403c]">لا توجد إيصالات تحصيل مسجلة للفترة المختارة</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {filteredReceipts.map((rec, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] flex items-center justify-between flex-wrap gap-2 text-xs font-bold">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#ffddb1] text-[#7e5713] flex items-center justify-center font-black">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#1c1c19] font-black">{rec.memberName}</span>
                            <span className="px-2 py-0.5 rounded bg-[#ebe8e3] text-[10px] font-mono">{rec.memberCode || rec.id}</span>
                          </div>
                          <span className="text-[11px] text-[#5a403c] block font-medium mt-0.5">
                            {Array.isArray(rec.items) ? rec.items.join(' • ') : rec.items} | التاريخ: {rec.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-[#8b0000] font-mono">{rec.total} ج.م</span>
                        <button
                          onClick={() => alert(`إعادة طباعة إيصال ${rec.memberName} بقيمة ${rec.total} ج.م`)}
                          className="px-3 py-1.5 bg-white border border-[#e5e2dd] rounded-xl text-[11px] text-[#7e5713] hover:bg-[#ffddb1] transition flex items-center gap-1"
                        >
                          <i className="fa-solid fa-print text-[16px]"></i>
                          <span>طباعة</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#e5e2dd]">
              <button
                onClick={() => setShowCollectionModal(false)}
                className="w-full py-3 rounded-2xl bg-[#8b0000] hover:bg-[#610000] text-white text-xs font-black shadow transition cursor-pointer"
              >
                تم والرجوع لشاشة الاشتراكات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leader PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e2dd] pb-3">
              <h3 className="font-black text-sm text-[#610000]">إدخال رمز القائد الكشفي (PIN)</h3>
              <button onClick={() => setShowPinModal(false)} className="w-7 h-7 rounded-full bg-red-50 text-red-600 font-bold hover:bg-red-100 flex items-center justify-center transition">✕</button>
            </div>
            <p className="text-xs text-[#5a403c] font-bold">
              برجاء أدخل كلمة سر الاعتماد الاستثنائي لمنح إعفاء جزئي أو كلي للحالة:
            </p>
            <input
              type="password"
              placeholder="••••"
              maxLength={4}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="w-full text-center text-2xl font-mono tracking-widest py-3 bg-[#f6f3ee] border border-[#e5e2dd] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowPinModal(false)}
                className="flex-1 py-3 rounded-2xl border border-[#e5e2dd] text-xs font-bold text-[#5a403c] hover:bg-[#f6f3ee] transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleAuthorizePin}
                className="flex-1 py-3 rounded-2xl bg-[#8b0000] hover:bg-[#610000] text-white text-xs font-extrabold shadow transition cursor-pointer"
              >
                اعتماد PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
