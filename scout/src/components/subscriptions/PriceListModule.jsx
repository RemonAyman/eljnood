import React, { useState } from 'react';
import { useScout } from '../../context/ScoutContext';

export const PriceListModule = () => {
  const { currentUser, priceList, addPriceListItem, updatePriceListItem, deletePriceListItem } = useScout();

  const role = currentUser?.role || 'admin';
  // Only Admin and Subscriptions/Finance Officer can edit
  const canEdit = role === 'admin' || role === 'sub_officer';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // Form inputs state
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('اشتراكات رئيسية');
  const [formIcon, setFormIcon] = useState('sell');

  const categories = ['الكل', 'اشتراكات رئيسية', 'مهرجانات وأنشطة', 'مستلزمات وأدوات', 'خدمات أخرى'];

  const iconOptions = [
    { value: 'sell', label: 'بطاقة سعر (sell)' },
    { value: 'card_membership', label: 'بطاقة عضوية (card_membership)' },
    { value: 'military_tech', label: 'مهرجان / وسام (military_tech)' },
    { value: 'workspace_premium', label: 'حفل ترقية / شارة (workspace_premium)' },
    { value: 'dry_cleaning', label: 'منديل كشفي (dry_cleaning)' },
    { value: 'interests', label: 'عقدة / وجلة (interests)' },
    { value: 'label', label: 'شارة قميص (label)' },
    { value: 'payments', label: 'رسوم مالية (payments)' },
  ];

  // Open modal for new item
  const openAddModal = () => {
    setFormTitle('');
    setFormPrice('');
    setFormDesc('');
    setFormCategory('اشتراكات رئيسية');
    setFormIcon('sell');
    setShowAddModal(true);
  };

  // Open modal for editing existing item
  const openEditModal = (item) => {
    setEditingItem(item);
    setFormTitle(item.title || '');
    setFormPrice(item.price || '');
    setFormDesc(item.desc || '');
    setFormCategory(item.category || 'اشتراكات رئيسية');
    setFormIcon(item.icon || 'sell');
    setShowEditModal(true);
  };

  // Open modal for deleting item
  const openDeleteModal = (item) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  // Handle Save New Item
  const handleSaveNewItem = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('برجاء إدخال اسم البند');
      return;
    }
    if (!formPrice || isNaN(formPrice) || Number(formPrice) < 0) {
      alert('برجاء إدخال سعر صحيح بالجنيه المصري');
      return;
    }

    addPriceListItem({
      title: formTitle.trim(),
      price: Number(formPrice),
      desc: formDesc.trim(),
      category: formCategory,
      icon: formIcon,
    });

    setShowAddModal(false);
    alert('تم إضافة البند الجديد في لائحة الأسعار بنجاح!');
  };

  // Handle Save Update Item
  const handleSaveUpdateItem = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!formTitle.trim()) {
      alert('برجاء إدخال اسم البند');
      return;
    }
    if (!formPrice || isNaN(formPrice) || Number(formPrice) < 0) {
      alert('برجاء إدخال سعر صحيح بالجنيه المصري');
      return;
    }

    updatePriceListItem(editingItem.id, {
      title: formTitle.trim(),
      price: Number(formPrice),
      desc: formDesc.trim(),
      category: formCategory,
      icon: formIcon,
    });

    setShowEditModal(false);
    setEditingItem(null);
    alert('تم تحديث بيانات البند بنجاح!');
  };

  // Handle Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingItem) return;

    deletePriceListItem(deletingItem.id);
    setShowDeleteModal(false);
    setDeletingItem(null);
    alert('تم حذف البند من لائحة الأسعار بنجاح!');
  };

  // Filter items
  const itemsToDisplay = (priceList || []).filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.desc && item.desc.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'الكل' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const totalItemsCount = (priceList || []).length;
  const maxPrice = priceList && priceList.length > 0
    ? Math.max(...priceList.map(i => Number(i.price) || 0))
    : 0;
  const avgPrice = priceList && priceList.length > 0
    ? Math.round(priceList.reduce((sum, i) => sum + (Number(i.price) || 0), 0) / priceList.length)
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[32px]">sell</span>
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-black text-xl sm:text-2xl text-[#610000]">لائحة الأسعار والتحصيل الرسمية</h1>
            </div>
          </div>
        </div>

        {/* Action Button for Authorized Users */}
        {canEdit && (
          <button
            onClick={openAddModal}
            className="z-10 px-5 py-3 rounded-2xl bg-[#8b0000] hover:bg-[#610000] text-white text-xs font-black shadow-lg transition flex items-center justify-center gap-2 border border-amber-400/30 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>إضافة بند سعر جديد</span>
          </button>
        )}
      </div>



      {/* Stats Quick Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#e5e2dd] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#5a403c] font-bold block">إجمالي البنود المسجلة</span>
            <span className="text-2xl font-black text-[#610000] font-mono">{totalItemsCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#8b0000] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[22px]">format_list_bulleted</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e5e2dd] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#5a403c] font-bold block">أعلى قيمة اشتراك</span>
            <span className="text-2xl font-black text-[#8b0000] font-mono">{maxPrice} ج.م</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#7e5713] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e5e2dd] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-[#5a403c] font-bold block">متوسط رسوم البنود</span>
            <span className="text-2xl font-black text-emerald-800 font-mono">{avgPrice} ج.م</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[22px]">finance</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#8b0000] text-white shadow-sm'
                    : 'bg-[#f6f3ee] text-[#5a403c] hover:bg-[#ebe8e3]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو التفاصيل..."
              className="w-full bg-[#f6f3ee] text-[#1c1c19] text-xs font-bold rounded-2xl py-2.5 pr-4 pl-9 border border-[#e5e2dd] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
            />
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#7e5713] text-[18px]">search</span>
          </div>
        </div>
      </div>

      {/* Price Items Cards Grid */}
      {itemsToDisplay.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#e5e2dd] text-center space-y-3">
          <span className="material-symbols-outlined text-[48px] text-[#8e706b]">sell_off</span>
          <h3 className="font-black text-base text-[#610000]">لا توجد بنود أسعار تطابق بحثك</h3>
          <p className="text-xs text-[#5a403c]">جرب البحث باسم آخر أو اختر تصنيفاً مختلفاً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {itemsToDisplay.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-[#e5e2dd] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
            >
              <div className="space-y-3">
                {/* Card Header: Icon & Category Chip & Actions */}
                <div className="flex items-center justify-between gap-2 border-b border-[#f0ede9] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#ffddb1]/50 text-[#7e5713] border border-[#7e5713]/20 flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-[22px]">{item.icon || 'sell'}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#f6f3ee] text-[#7e5713] text-[10px] font-extrabold border border-[#e5e2dd]">
                      {item.category || 'اشتراكات'}
                    </span>
                  </div>

                  {/* Actions for Admin and Sub Officer */}
                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-xl bg-slate-50 hover:bg-amber-100 text-slate-600 hover:text-[#7e5713] border border-slate-200 transition cursor-pointer"
                        title="تعديل الكلام والأسعار والملاحظات"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => openDeleteModal(item)}
                        className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 border border-red-200 transition cursor-pointer"
                        title="حذف البند"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Title & Notes */}
                <div>
                  <h3 className="font-extrabold text-sm text-[#1c1c19] leading-snug">{item.title}</h3>
                  {item.desc ? (
                    <p className="text-xs text-[#5a403c] font-medium mt-1 leading-relaxed bg-[#fcf9f4] p-2.5 rounded-xl border border-[#e5e2dd]">
                      {item.desc}
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#8e706b] italic mt-1">لا توجد ملاحظات إضافية مدونة</p>
                  )}
                </div>
              </div>

              {/* Price Tag Footer */}
              <div className="pt-3 border-t border-[#f0ede9] flex items-center justify-between">
                <span className="text-xs font-bold text-[#5a403c]">الرسوم المقررة:</span>
                <span className="font-black text-lg text-[#8b0000] font-mono px-3.5 py-1 bg-[#ffdad4]/40 rounded-xl border border-[#8b0000]/30 shadow-2xs">
                  {item.price} ج.م
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#e5e2dd] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#8b0000] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                </div>
                <h3 className="font-black text-base text-[#610000]">إضافة بند سعر جديد للائحة</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-red-50 text-red-600 font-bold hover:bg-red-100 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5a403c] mb-1">اسم البند / الخدمة *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: اشتراك المعسكر الصيفي..."
                  className="w-full bg-[#f6f3ee] text-xs font-bold px-4 py-2.5 rounded-xl border border-[#e5e2dd] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5a403c] mb-1">السعر المقرر (بالجنيه) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="مثال: 250"
                    className="w-full bg-[#f6f3ee] text-xs font-mono font-bold px-4 py-2.5 rounded-xl border border-[#e5e2dd] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5a403c] mb-1">التصنيف</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#f6f3ee] text-xs font-bold px-4 py-2.5 rounded-xl border border-[#e5e2dd] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                  >
                    <option value="اشتراكات رئيسية">اشتراكات رئيسية</option>
                    <option value="مهرجانات وأنشطة">مهرجانات وأنشطة</option>
                    <option value="مستلزمات وأدوات">مستلزمات وأدوات</option>
                    <option value="خدمات أخرى">خدمات أخرى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5a403c] mb-1">ملاحظات أو تفاصيل عن البند</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="اكتب ملاحظة أو توضيح لما يشمله السعر (مثال: يشمل المطبوعات، الزي الرسمي والتأمين)..."
                  className="w-full bg-[#f6f3ee] text-xs font-medium px-4 py-2.5 rounded-xl border border-[#e5e2dd] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5a403c] mb-1">الأيقونة المعروضة</label>
                <select
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  className="w-full bg-[#f6f3ee] text-xs font-bold px-4 py-2.5 rounded-xl border border-[#e5e2dd] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                >
                  {iconOptions.map(ico => (
                    <option key={ico.value} value={ico.value}>{ico.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#e5e2dd]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border border-[#e5e2dd] text-xs font-bold text-[#5a403c] hover:bg-[#f6f3ee] transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#8b0000] hover:bg-[#610000] text-white text-xs font-extrabold shadow transition cursor-pointer"
                >
                  حفظ البند الجديد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#e5e2dd] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#7e5713] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </div>
                <h3 className="font-black text-base text-[#610000]">تعديل بيانات البند والسعر</h3>
              </div>
              <button
                onClick={() => { setShowEditModal(false); setEditingItem(null); }}
                className="w-8 h-8 rounded-full bg-red-50 text-red-600 font-bold hover:bg-red-100 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUpdateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5a403c] mb-1">اسم البند / الكلام *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#f6f3ee] text-xs font-bold px-4 py-2.5 rounded-xl border border-[#e5e2dd] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5a403c] mb-1">السعر المقرر (بالجنيه) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full bg-[#f6f3ee] text-xs font-mono font-bold px-4 py-2.5 rounded-xl border border-[#e5e2dd] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5a403c] mb-1">التصنيف</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#f6f3ee] text-xs font-bold px-4 py-2.5 rounded-xl border border-[#e5e2dd] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                  >
                    <option value="اشتراكات رئيسية">اشتراكات رئيسية</option>
                    <option value="مهرجانات وأنشطة">مهرجانات وأنشطة</option>
                    <option value="مستلزمات وأدوات">مستلزمات وأدوات</option>
                    <option value="خدمات أخرى">خدمات أخرى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5a403c] mb-1">الملاحظة أو التفاصيل</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-[#f6f3ee] text-xs font-medium px-4 py-2.5 rounded-xl border border-[#e5e2dd] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5a403c] mb-1">الأيقونة المعروضة</label>
                <select
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  className="w-full bg-[#f6f3ee] text-xs font-bold px-4 py-2.5 rounded-xl border border-[#e5e2dd] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                >
                  {iconOptions.map(ico => (
                    <option key={ico.value} value={ico.value}>{ico.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#e5e2dd]">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingItem(null); }}
                  className="flex-1 py-3 rounded-xl border border-[#e5e2dd] text-xs font-bold text-[#5a403c] hover:bg-[#f6f3ee] transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#8b0000] hover:bg-[#610000] text-white text-xs font-extrabold shadow transition cursor-pointer"
                >
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {showDeleteModal && deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">delete_forever</span>
            </div>
            <div>
              <h3 className="font-black text-base text-[#610000]">تأكيد حذف البند</h3>
              <p className="text-xs text-[#5a403c] mt-1">
                هل أنت تأكد من رغبتك في حذف البند <strong className="text-[#1c1c19]">"{deletingItem.title}"</strong> ({deletingItem.price} ج.م) من لائحة الأسعار؟
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletingItem(null); }}
                className="flex-1 py-3 rounded-2xl border border-[#e5e2dd] text-xs font-bold text-[#5a403c] bg-[#f6f3ee] hover:bg-[#ebe8e3] transition cursor-pointer shadow-sm"
              >
                إلغاء (Cancel)
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-3 rounded-2xl bg-[#8b0000] hover:bg-[#610000] text-white text-xs font-extrabold shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>تأكيد الحذف (OK)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
