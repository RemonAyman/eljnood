import React, { useState } from 'react';
import { useScout } from '../../context/ScoutContext';

export const ParentPortal = () => {
  const { currentUser, members, subscriptions, addExcuse } = useScout();

  const [childCodeInput, setChildCodeInput] = useState(currentUser.childCode || 'JS-2026-448');
  const [showChildSelectModal, setShowChildSelectModal] = useState(false);
  const [showExcuseModal, setShowExcuseModal] = useState(false);
  const [excuseForm, setExcuseForm] = useState({ date: '2026-05-24', reason: 'ظروف امتحان مدرسي حتمي' });

  const [linkedChild, setLinkedChild] = useState(() => {
    return members.find(m => m.code === (currentUser.childCode || 'JS-2026-448')) || members[0] || {
      name: 'كيرلس مينا شنودة',
      code: 'JS-2026-448',
      grade: 'الصف الأول الإعدادي',
      sectorName: 'كشاف فتيان (دفعة القديس موريس)',
      parentPhone: '01229876543',
      addressDetails: 'شارع الكنيسة، عمارة الأمل، بني الجمهورية',
      attendanceCount: 18,
      totalSessions: 19,
    };
  });

  const handleLinkChild = (e) => {
    e.preventDefault();
    const found = members.find(m => m.code === childCodeInput.trim());
    if (found) {
      setLinkedChild(found);
      setShowChildSelectModal(false);
      alert(`تم التبديل لمتابعة الابن: ${found.name}`);
    } else {
      alert(`كود الابن #${childCodeInput} غير مسجل بالنظام`);
    }
  };

  const handleExcuseSubmit = (e) => {
    e.preventDefault();
    addExcuse({
      leaderName: linkedChild.name,
      sectorName: linkedChild.sectorName || 'فرقة الفتيان',
      date: excuseForm.date,
      reason: excuseForm.reason,
    });
    alert('تم إرسال طلب عذر الغياب إلى قائد الفرقة للمراجعة والاعتماد!');
    setShowExcuseModal(false);
  };

  const attendancePct = linkedChild?.totalSessions > 0 
    ? Math.round((linkedChild.attendanceCount / linkedChild.totalSessions) * 100) 
    : 96;

  return (
    <div className="space-y-6">
      {/* Top Header Banner matching standard theme */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[32px]">family_history</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-lg sm:text-xl text-[#610000]">بوابة ولي الأمر والخدمة العائلية</h1>
            </div>
            <p className="text-xs text-[#5a403c] mt-1 font-bold">
              متابعة حضور الأبناء، تقديم أعذار الغياب، واستعراض الاشتراكات والبطاقة الرقمية
            </p>
          </div>
        </div>
      </div>

      {/* 1. Selected Child Top Selector Strip matching Image 2 */}
      <div className="bg-[#f6f3ee] p-3.5 sm:p-4 rounded-2xl border border-[#e5e2dd] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8b0000] text-white flex items-center justify-center font-bold shadow">
            <span className="material-symbols-outlined text-[22px]">family_history</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#7e5713] block">الابن المختار للمتابعة الأسرية:</span>
            <h2 className="font-black text-sm sm:text-base text-[#610000]">{linkedChild.name} ({linkedChild.code})</h2>
          </div>
        </div>

        <button
          onClick={() => setShowChildSelectModal(true)}
          className="px-4 py-2 rounded-xl bg-white hover:bg-amber-50 text-[#7e5713] font-bold text-xs border border-[#7e5713]/30 shadow-xs transition flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">published_with_changes</span>
          <span>تبديل الابن ➔</span>
        </button>
      </div>

      {/* 2. Scout Profile Card matching Image 2 */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e5e2dd] shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-right">
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#f6f3ee] border-4 border-amber-400 p-1 shadow-lg overflow-hidden flex items-center justify-center text-[#8b0000] font-black text-2xl">
              <span className="material-symbols-outlined text-[48px]">person</span>
            </div>
            <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white text-[12px] font-bold">
              ✓
            </span>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="font-black text-lg sm:text-xl text-[#610000]">{linkedChild.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-[#7e5713] font-mono font-bold text-xs border border-amber-300">
                كود: {linkedChild.code}
              </span>
            </div>

            <p className="text-xs font-bold text-[#7e5713]">
              🛡️ {linkedChild.sectorName || 'كشاف فتيان (دفعة القديس موريس)'} • {linkedChild.grade || 'الصف الأول الإعدادي'}
            </p>

            {/* Scarf Status Banner */}
            <div className="p-3 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] flex items-center gap-3 text-xs font-bold text-[#1c1c19]">
              <span className="material-symbols-outlined text-[24px] text-amber-600">workspace_premium</span>
              <div>
                <span className="text-[#8b0000] font-black block">أدى الوعد الكشفي الرسمي 🎖️</span>
                <span className="text-[11px] text-[#5a403c]">استلم المنديل الكشفي الموحد ومستمر بالالتزام والانضباط.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Discipline & Attendance Gauge Card matching Image 2 */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e5e2dd] shadow-md space-y-5">
        <h3 className="font-extrabold text-base text-[#610000] flex items-center gap-2 border-b pb-3">
          <span className="material-symbols-outlined text-[22px] text-[#8b0000]">trending_up</span>
          مؤشر الانضباط والحضور العام
        </h3>

        <div className="p-5 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Gauge Meter */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full border-8 border-amber-400 border-t-[#8b0000] flex items-center justify-center shadow-inner shrink-0">
              <span className="text-xl font-black text-[#610000]">{attendancePct}%</span>
            </div>
            <div>
              <div className="flex items-center gap-1 text-emerald-800 font-black text-sm">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>ممتاز ومؤهل للمعسكر السنوي</span>
              </div>
              <p className="text-xs text-[#5a403c] mt-0.5 leading-relaxed">
                استوفى الكشاف كيرلس جميع شروط الحضور والأنشطة الروحية والكشفية المعتمدة.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Metrics Grid matching Image 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#f6f3ee] rounded-2xl border border-[#e5e2dd] text-center space-y-1">
            <span className="material-symbols-outlined text-[#8b0000] text-[20px]">flag</span>
            <span className="text-[11px] text-[#5a403c] block font-bold">الأيام الكشفية</span>
            <span className="text-base font-black text-[#610000]">18 / 19 يوم</span>
          </div>

          <div className="p-3.5 bg-[#f6f3ee] rounded-2xl border border-[#e5e2dd] text-center space-y-1">
            <span className="material-symbols-outlined text-[#7e5713] text-[20px]">church</span>
            <span className="text-[11px] text-[#5a403c] block font-bold">القداسات والتناول</span>
            <span className="text-base font-black text-[#7e5713]">12 / 12 قداس</span>
          </div>

          <div className="p-3.5 bg-[#f6f3ee] rounded-2xl border border-[#e5e2dd] text-center space-y-1">
            <span className="material-symbols-outlined text-amber-700 text-[20px]">cabin</span>
            <span className="text-[11px] text-[#5a403c] block font-bold">المعسكرات والرحلات</span>
            <span className="text-base font-black text-amber-900">4 / 4 معسكر</span>
          </div>

          <div className="p-3.5 bg-[#f6f3ee] rounded-2xl border border-[#e5e2dd] text-center space-y-1">
            <span className="material-symbols-outlined text-emerald-800 text-[20px]">menu_book</span>
            <span className="text-[11px] text-[#5a403c] block font-bold">درس الكتاب والافتثاد</span>
            <span className="text-base font-black text-emerald-900">8 / 8 لقاء</span>
          </div>
        </div>
      </div>

      {/* 4. Recent Attendance Log List matching Image 2 */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e5e2dd] shadow-md space-y-4">
        <div className="flex items-center justify-between border-b pb-3 flex-wrap gap-2">
          <h3 className="font-extrabold text-base text-[#610000] flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#8b0000]">edit_calendar</span>
            سجل الحضور الأخير
          </h3>

          <button
            onClick={() => setShowExcuseModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#8b0000] hover:bg-[#610000] text-white font-extrabold text-xs shadow transition flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ تقديم عذر غياب</span>
          </button>
        </div>

        <div className="space-y-3">
          {/* Item 1 */}
          <div className="p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                ✓
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-[#1c1c19]">طابور الجمعة والتدريب الميداني</h4>
                <p className="text-[11px] text-[#5a403c]">الجمعة 17 مايو 2026 • تم المسح بالباركود (07:15 ص)</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] border border-emerald-300">
              حاضر 🟢
            </span>
          </div>

          {/* Item 2 */}
          <div className="p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                ✓
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-[#1c1c19]">درس الكتاب والمسابقة الأسبوعية</h4>
                <p className="text-[11px] text-[#5a403c]">الجمعة 10 مايو 2026 • سجل كامل ومشاركة فعالة</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] border border-emerald-300">
              حاضر 🟢
            </span>
          </div>

          {/* Item 3 */}
          <div className="p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
                !
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-[#1c1c19]">طابور الجمعة والأنشطة العامة</h4>
                <p className="text-[11px] text-[#5a403c]">الجمعة 3 مايو 2026 • عذر مرضي معتمد من القائد بيتر</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] border border-amber-300">
              عذر مقبول 🟡
            </span>
          </div>

          {/* Item 4 */}
          <div className="p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-200 text-slate-950 flex items-center justify-center font-bold shrink-0">
                ⭐
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-[#1c1c19]">معسكر وادي النطرون الاستكشافي</h4>
                <p className="text-[11px] text-[#5a403c]">25 - 27 أبريل 2026 • مشاركة كاملة واجتياز شارات المهارة</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-200 text-slate-950 font-black text-[10px]">
              ممتاز ⭐
            </span>
          </div>
        </div>
      </div>

      {/* 5. Financial Status & Subscriptions Card matching Image 2 */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e5e2dd] shadow-md space-y-4">
        <h3 className="font-extrabold text-base text-[#610000] flex items-center gap-2 border-b pb-3">
          <span className="material-symbols-outlined text-[22px] text-[#8b0000]">receipt_long</span>
          موقف الاشتراكات والماليات
        </h3>

        <div className="p-5 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#5a403c] block">الاشتراك السنوي الكشفي (2026 / 2027):</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#610000]">648 جنيه مصري</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                مسدد بالكامل ✓
              </span>
            </div>
            <p className="text-[11px] text-[#5a403c] mt-1 font-mono">إيصال رسمي رقم: REC-8849</p>
          </div>

          <button
            onClick={() => alert('جاري طباعة وتحميل الإيصال الحراري الرسمي (REC-8849)...')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-[#8b0000] font-bold text-xs border border-[#8b0000]/30 shadow-xs transition flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>تحميل الإيصال الحراري</span>
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>✅ لا توجد أي متأخرات أو مستحقات مالية على الكشاف كيرلس.</span>
        </div>
      </div>

      {/* 6. Direct Leader Contact Card matching Image 2 */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e5e2dd] shadow-md space-y-4">
        <h3 className="font-extrabold text-base text-[#610000] flex items-center gap-2 border-b pb-3">
          <span className="material-symbols-outlined text-[22px] text-[#8b0000]">contact_phone</span>
          التواصل المباشر مع قيادة الفرقة
        </h3>

        <div className="p-4 rounded-2xl bg-[#f6f3ee] border border-[#e5e2dd] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#8b0000] text-white flex items-center justify-center font-black text-base shadow">
              بيتر
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[#1c1c19]">القائد بيتر يوسف</h4>
              <p className="text-xs text-[#5a403c]">قائد فرقة كشاف الفتيان</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => window.open('tel:01229876543')}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#8b0000] hover:bg-[#610000] text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              <span>اتصال مباشر</span>
            </button>
            <button
              onClick={() => window.open('https://wa.me/201229876543', '_blank')}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>واتساب</span>
            </button>
          </div>
        </div>
      </div>

      {/* Child Switcher Modal */}
      {showChildSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#e5e2dd] shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-[#610000]">مزامنة وتبديل الابن للمتابعة</h3>
            <form onSubmit={handleLinkChild} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#5a403c] mb-1">أدخل كود الابن الكشفي:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: JS-2026-448"
                  value={childCodeInput}
                  onChange={(e) => setChildCodeInput(e.target.value)}
                  className="w-full p-3 bg-[#f6f3ee] rounded-xl border text-xs font-mono font-bold"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-3 rounded-xl bg-[#8b0000] text-white font-bold text-xs">
                  مزامنة المتابعة
                </button>
                <button type="button" onClick={() => setShowChildSelectModal(false)} className="py-3 px-4 rounded-xl bg-[#f6f3ee] font-bold text-xs">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excuse Modal */}
      {showExcuseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#e5e2dd] shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-[#610000]">تقديم طلب عذر غياب لليوم الكشفي</h3>
            <form onSubmit={handleExcuseSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#5a403c] mb-1">تاريخ اليوم الكشفي المعني:</label>
                <input
                  type="date"
                  required
                  value={excuseForm.date}
                  onChange={(e) => setExcuseForm({ ...excuseForm, date: e.target.value })}
                  className="w-full p-3 bg-[#f6f3ee] rounded-xl border text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5a403c] mb-1">سبب العذر والتوضيح:</label>
                <textarea
                  rows={3}
                  required
                  value={excuseForm.reason}
                  onChange={(e) => setExcuseForm({ ...excuseForm, reason: e.target.value })}
                  className="w-full p-3 bg-[#f6f3ee] rounded-xl border text-xs font-bold"
                ></textarea>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-3 rounded-xl bg-[#8b0000] text-white font-bold text-xs">
                  إرسال العذر للقائد
                </button>
                <button type="button" onClick={() => setShowExcuseModal(false)} className="py-3 px-4 rounded-xl bg-[#f6f3ee] font-bold text-xs">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
