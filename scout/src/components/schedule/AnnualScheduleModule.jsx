import React, { useState } from 'react';

export const AnnualScheduleModule = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSector, setSelectedSector] = useState('all');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeDetailsModal, setActiveDetailsModal] = useState(null);

  const categories = [
    { id: 'all', name: 'الكل' },
    { id: 'camps', name: 'المعسكرات السنوية' },
    { id: 'promise', name: 'حفلات الوعد' },
    { id: 'days', name: 'الأيام الكشفية' },
    { id: 'badges', name: 'اختبارات الاستحقاق' },
  ];

  const sectors = [
    { id: 'all', name: 'جميع القطاعات' },
    { id: 'sprouts', name: 'براعم' },
    { id: 'cubs', name: 'أشبال' },
    { id: 'boys', name: 'فتيان' },
    { id: 'advanced', name: 'متقدم' },
    { id: 'guides', name: 'مرشدات' },
    { id: 'rovers', name: 'جوالة' },
  ];

  const scheduleEvents = [
    {
      id: 'ev1',
      month: 'مايو 2026',
      monthLabel: 'شهر مايو 2026',
      tag: 'اشتراكات ومهارات',
      day: '24',
      monthShort: 'مايو',
      dayOfWeek: 'الجمعة',
      time: '04:00 م - 08:00 م',
      category: 'days',
      sector: 'boys',
      title: 'يوم كشفي وتدريب العقد والريادة',
      badgeText: '⛺ يوم كشفي مدمج',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      location: 'أرض الفناء بالمقر والمبنى الكشفي',
      target: 'جميع أفراد الكشافة والفتيان',
      reqs: 'المهمات: الحبل الكشفي، الدليل الكشفي الكامل، العصا الكشفية.',
      btnText: 'عرض التفاصيل والتعليمات ➔',
      details: 'يتضمن اليوم ورش عمل مصورة لبناء الجسور وتدريب الريادة الكشفية مع اختيار عراف الطلائع المتميزين.'
    },
    {
      id: 'ev2',
      month: 'مايو 2026',
      monthLabel: 'شهر مايو 2026',
      tag: 'اختبارات شارات',
      day: '31',
      monthShort: 'مايو',
      dayOfWeek: 'الجمعة',
      time: '04:00 م - 07:30 م',
      category: 'badges',
      sector: 'cubs',
      title: 'اختبارات شارات الهوايات والمرحلة الأولى',
      badgeText: '🎖️ اختبار رسمي',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      location: 'الكنيسة الكبرى - قاعات الخدمات',
      target: 'مرحلة الأشبال والزهرات',
      reqs: 'المهمات: كشكول التدريب الكشفي، كارت التقييم التجميعي، التثبيت.',
      btnText: 'عرض جدول الاختبارات ولجان التحكيم ➔',
      details: 'تقييم شامل لـ 14 مهارة كشفية وروحية تحت إشراف لجنة التقييم العليا لمجالس القطاعات.'
    },
    {
      id: 'ev3',
      month: 'يونيو 2026',
      monthLabel: 'شهر يونيو 2026',
      tag: 'معسكرات تدريبية',
      day: '12 - 15',
      monthShort: 'يونيو',
      dayOfWeek: '4 أيام - 3 ليالٍ',
      time: 'إقامة كاملة',
      category: 'camps',
      sector: 'advanced',
      title: 'معسكر الإعداد القيادي الجماعي لطلائع المجموعة',
      badgeText: '⛺ معسكر تدريبي محترف',
      badgeColor: 'bg-amber-50 text-[#7e5713] border-amber-300',
      location: 'سفير الوادي الكشفي - وادي الريان (محمية طبيعية)',
      target: 'قادة الطلائع وأفراد المتقدم والجوالة',
      reqs: 'المهمات: حقيبة المعسكر الكشفية، كيس النوم (Sleeping Bag)، كشاف رأس، الزي الرسمي.',
      btnText: 'عرض ضوابط المعسكر ➔',
      details: 'برنامج تدريبي مغلق يشمل السير الخلوي، الملاحة بالنجوم والبوصلة، وبناء المخيمات الكشفية.'
    },
    {
      id: 'ev4',
      month: 'يوليو 2026',
      monthLabel: 'شهر يوليو 2026',
      tag: 'الحدث الأضخم',
      day: '20 - 25',
      monthShort: 'يوليو',
      dayOfWeek: '6 أيام معتمدة',
      time: 'معسكر عام مغلق',
      category: 'camps',
      sector: 'all',
      title: 'المعسكر السنوي العام لمجموعة جنود المسيح',
      badgeText: '🔥 حدث الموسم السنوي',
      badgeColor: 'bg-[#8b0000] text-white border-red-900',
      isMajor: true,
      description: 'الحدث الأضخم لكافة قطاعات المجموعة ورابطة الخدمة. يتضمن منافسات درع المجموعة، مسابقات السمر، وأمسيات روحية وثقافية مكثفة.',
      location: 'أرض المعسكر الكشفي الدائم - الإسكندرية',
      target: 'مفتوح لجميع القطاعات والأعضاء المسددين',
      btnText: 'حجز المعسكر والاشتراك ➔',
      details: 'يتضمن المعسكر مسابقة درع المجموعة الكنسية، حفلات السمر الكبرى، ورش الحرف اليدوية، والرحلات البحرية.'
    },
    {
      id: 'ev5',
      month: 'أغسطس 2026',
      monthLabel: 'شهر أغسطس 2026',
      tag: 'حفلات رسمية',
      day: '15',
      monthShort: 'أغسطس',
      dayOfWeek: 'يوم العذراء',
      time: '04:00 م - 09:00 م',
      category: 'promise',
      sector: 'all',
      title: 'حفل الوعد الكشفي السنوي وتوزيع المناديل والأوسمة',
      badgeText: '🔴 حفل الوعد الرسمي',
      badgeColor: 'bg-red-50 text-[#8b0000] border-red-200',
      location: 'المسرح الرئيسي بالبقاع البابوية - كنيسة العذراء',
      target: 'تقييم مجالس الكشافة والمناديل المعتمدة',
      reqs: 'التزام كامل بالزي الكشفي الرسمي الموحد (المنديل والشارات المعتمدة).',
      btnText: 'قوائم المرشحين لأداء الوعد ➔',
      details: 'تأدية قسم الوعد الكشفي أمام راعي الكنيسة والمجلس الأعلى، وتوزيع المناديل الكشفية الجديدة والشارات.'
    },
    {
      id: 'ev6',
      month: 'سبتمبر 2026',
      monthLabel: 'شهر سبتمبر 2026',
      tag: 'ختام النشاط الصيفي',
      day: '18',
      monthShort: 'سبتمبر',
      dayOfWeek: 'الجمعة - ختام الموسم',
      time: '05:00 م - 09:30 م',
      category: 'days',
      sector: 'all',
      title: 'مهرجان التفوق الدراسي والدرامي وختام النشاط',
      badgeText: '🏆 أحدث ومهرجان',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      location: 'القاعة الكبرى والساحة الخارجية',
      target: 'جميع الأسر والكشافة وأولياء الأمور',
      reqs: 'شهادات النجاح والدرجات للتحقق والتكريم بالدرع الكشفي.',
      btnText: 'برنامج الحفل وتوزيع الجوائز ➔',
      details: 'تكريم الحاصلين على المراكز الأولى في المدارس والجامعات، وعرض مسرحي درامي كشفي.'
    }
  ];

  const filteredEvents = scheduleEvents.filter(ev => {
    const matchCat = selectedCategory === 'all' || ev.category === selectedCategory;
    const matchSec = selectedSector === 'all' || ev.sector === 'all' || ev.sector === selectedSector;
    return matchCat && matchSec;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Top Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[32px]">calendar_month</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-lg sm:text-xl text-[#610000]">خطة الأيام الكشفية والموسم السنوي</h1>
            </div>
            <p className="text-xs text-[#5a403c] mt-1 font-bold">
              مواعيد المعسكرات الكشفية، الاختبارات السنوية، وحفلات الوعد الرسمية
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onNavigate && (
            <button
              onClick={() => onNavigate('detailed-programs')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#3d0000] font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2 cursor-pointer border border-amber-400"
            >
              <span className="material-symbols-outlined text-[18px]">assignment</span>
              <span>برامج الأيام والعهد التفصيلية ➔</span>
            </button>
          )}
          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-4 py-2.5 bg-[#8b0000] hover:bg-[#610000] text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            <span>تحميل الخطة الرسمية PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Category Tabs & Sector Filter Bar matching Image 1 */}
      <div className="bg-white rounded-2xl p-4 border border-[#e5e2dd] shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-[#5a403c] shrink-0">تصفية المواعيد:</span>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#8b0000] text-white shadow-sm'
                    : 'bg-[#f6f3ee] text-[#5a403c] hover:bg-[#ebe8e3]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5a403c]">القطاع:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#f6f3ee] border border-[#e5e2dd] text-xs font-bold text-[#1c1c19] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
            >
              {sectors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Monthly Timeline Event Cards List matching Image 1 */}
      <div className="space-y-6">
        {filteredEvents.map(event => (
          <div key={event.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#8b0000]"></span>
              <h3 className="font-black text-sm text-[#610000]">{event.monthLabel}</h3>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-[#7e5713] text-[10px] font-bold border border-amber-200">
                {event.tag}
              </span>
            </div>

            <div className={`bg-white rounded-3xl p-5 border shadow-md space-y-4 transition hover:shadow-lg ${
              event.isMajor ? 'border-[#8b0000] ring-1 ring-[#8b0000]/20' : 'border-[#e5e2dd]'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Date Badge Box */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#8b0000] text-white flex flex-col items-center justify-center shrink-0 shadow-md p-1 text-center">
                    <span className="text-lg sm:text-2xl font-black leading-tight">{event.day}</span>
                    <span className="text-[10px] sm:text-xs font-bold opacity-90">{event.monthShort}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${event.badgeColor}`}>
                        {event.badgeText}
                      </span>
                      <span className="text-xs text-[#7e5713] font-bold">⏰ {event.time}</span>
                    </div>
                    <h4 className="font-extrabold text-base sm:text-lg text-[#1c1c19]">{event.title}</h4>
                    <div className="flex flex-wrap gap-3 text-xs text-[#5a403c] pt-0.5">
                      <span>📍 {event.location}</span>
                      <span>•</span>
                      <span>👥 {event.target}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Button */}
                <button
                  onClick={() => setActiveDetailsModal(event)}
                  className={`px-5 py-3 rounded-2xl font-extrabold text-xs transition flex items-center justify-center gap-2 shadow shrink-0 ${
                    event.isMajor
                      ? 'bg-[#8b0000] hover:bg-[#610000] text-white'
                      : 'bg-[#f6f3ee] hover:bg-[#ebe8e3] text-[#610000] border border-[#e5e2dd]'
                  }`}
                >
                  <span>{event.btnText}</span>
                </button>
              </div>

              {/* Requirement Strip */}
              {event.reqs && (
                <div className="p-3 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] text-xs font-bold text-[#5a403c] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#7e5713]">inventory_2</span>
                  <span>{event.reqs}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Bottom Annual Achievements Summary Card matching Image 1 */}
      <div className="bg-white rounded-3xl p-6 border border-[#e5e2dd] shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-[#610000] flex items-center gap-2 border-b pb-3">
          <span className="material-symbols-outlined text-[22px] text-[#8b0000]">analytics</span>
          إحصائيات الإنجاز السنوي المخطط 2026 - 2027
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-[#fcf9f4] rounded-2xl border border-[#e5e2dd]">
            <span className="text-2xl font-black text-[#8b0000] block">16</span>
            <span className="text-xs font-bold text-[#5a403c]">يوماً كشفياً</span>
          </div>
          <div className="p-4 bg-[#fcf9f4] rounded-2xl border border-[#e5e2dd]">
            <span className="text-2xl font-black text-[#7e5713] block">4</span>
            <span className="text-xs font-bold text-[#5a403c]">معسكرات سنوية</span>
          </div>
          <div className="p-4 bg-[#fcf9f4] rounded-2xl border border-[#e5e2dd]">
            <span className="text-2xl font-black text-amber-700 block">2</span>
            <span className="text-xs font-bold text-[#5a403c]">حفلات وعد وتكريم</span>
          </div>
          <div className="p-4 bg-[#fcf9f4] rounded-2xl border border-[#e5e2dd]">
            <span className="text-2xl font-black text-emerald-800 block">100%</span>
            <span className="text-xs font-bold text-[#5a403c]">نسبة تنفيذ الخطة</span>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-[#e5e2dd] shadow-2xl relative space-y-4 my-auto">
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-4 left-4 w-9 h-9 rounded-full bg-red-50 text-[#8b0000] font-black flex items-center justify-center border border-red-200"
            >
              ✕
            </button>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[32px] text-[#8b0000]">picture_as_pdf</span>
              <div>
                <h3 className="font-extrabold text-lg text-[#610000]">معاينة وثيقة الخطة السنوية</h3>
                <p className="text-xs text-[#5a403c]">المسودة الرسمية المعتمدة لعام 2026/2027</p>
              </div>
            </div>

            <div className="p-5 bg-[#f6f3ee] rounded-2xl border border-[#e5e2dd] space-y-3 text-xs leading-relaxed text-[#1c1c19] max-h-[60vh] overflow-y-auto">
              <h4 className="font-black text-sm text-[#8b0000]">جدول الأنشطة والمعسكرات المعتمدة:</h4>
              <p>• مايو 2026: بدء اختبارات المستوى والتحضير لطابور العرض الكشفي.</p>
              <p>• يونيو 2026: معسكر الإعداد القيادي في وادي الريان وتدريب الخيام.</p>
              <p>• يوليو 2026: المعسكر السنوي العام لجميع قطاعات المجموعة بالإسكندرية.</p>
              <p>• أغسطس 2026: حفل الوعد الكشفي الرسمي وتوزيع الشارات المناديل.</p>
              <p>• سبتمبر 2026: ختام الموسم الكشفي والاحتفال بالتفوق العلمي والدرامي.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { alert('جاري تحميل الملف...'); setShowPreviewModal(false); }}
                className="flex-1 py-3 rounded-xl bg-[#8b0000] text-white font-bold text-xs shadow"
              >
                تحميل النسخة المعتمدة (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {activeDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#e5e2dd] shadow-2xl relative space-y-4 my-auto">
            <button
              onClick={() => setActiveDetailsModal(null)}
              className="absolute top-4 left-4 w-9 h-9 rounded-full bg-red-50 text-[#8b0000] font-black flex items-center justify-center border border-red-200"
            >
              ✕
            </button>
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-[#7e5713] text-[10px] font-bold">
                {activeDetailsModal.badgeText}
              </span>
              <h3 className="font-extrabold text-lg text-[#610000]">{activeDetailsModal.title}</h3>
              <p className="text-xs text-[#5a403c]">{activeDetailsModal.monthLabel} • {activeDetailsModal.time}</p>
            </div>

            <div className="p-4 bg-[#fcf9f4] rounded-2xl border border-[#e5e2dd] space-y-3 text-xs">
              <div>
                <span className="font-bold text-[#7e5713] block">المكان المستهدف:</span>
                <span className="text-[#1c1c19]">{activeDetailsModal.location}</span>
              </div>
              <div>
                <span className="font-bold text-[#7e5713] block">التفاصيل والتعليمات:</span>
                <p className="text-[#1c1c19] leading-relaxed mt-1">{activeDetailsModal.details}</p>
              </div>
              {activeDetailsModal.reqs && (
                <div>
                  <span className="font-bold text-[#7e5713] block">المستلزمات المطلوبة:</span>
                  <span className="text-[#8b0000] font-bold">{activeDetailsModal.reqs}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => { alert('تم تسجيل اهتمامك بالفعالية ومزاجنة جدولك الكشفي!'); setActiveDetailsModal(null); }}
              className="w-full py-3 rounded-xl bg-[#8b0000] text-white font-bold text-xs shadow"
            >
              تأكيد المشاركة وتنزيل التذكير
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
