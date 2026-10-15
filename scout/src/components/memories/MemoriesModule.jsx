import React, { useState } from 'react';

export const MemoriesModule = () => {
  const [activeTab, setActiveTab] = useState('الكل');

  const albums = [
    {
      id: 'a1',
      title: 'حفل الوعد الكشفي وتفنيد منديل الكشافة لدفعة القديس موريس',
      desc: 'لحظات التأهيل الروحي، وأداء القسم الكشفي أمام المذبح...',
      photosCount: '48 صورة',
      date: '12 مايو 2026',
      badge: 'حفلات الوعد',
      author: 'ق. سيمون عاطف',
      img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'a2',
      title: 'يوم الريادة الكبرى: تشييد برج المراقبة والجسور المعلقة',
      desc: 'تطبيق عملي لعقد الدورات والحبال والجسور بالأنشطة...',
      photosCount: '52 لقطة',
      date: '28 أبريل 2026',
      badge: 'الأيام الكشفية',
      author: 'ق. رامي وجدي',
      img: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'a3',
      title: 'مهرجان الكرازة المرقسية: كورال الكشافة يحصد درع التميز',
      desc: 'تغطية حية لفقرات الترانيم التراثية، المعرض الكشفي...',
      photosCount: '75 صورة',
      date: '16 مارس 2026',
      badge: 'المعسكرات',
      author: 'ق. صاموئيل زكريا',
      img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'a4',
      title: 'مائدة الأبوة والمحبة الأخوية بمناسبة بدء الصوم المقدس',
      desc: 'لقاء المشاركة الكشفي السنوي لتعزيز روح المحبة وبناء الروح...',
      photosCount: '16 صورة',
      date: '04 مارس 2026',
      badge: 'لقاءات الكشافة',
      author: 'ق. مينا سمير',
      img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'a5',
      title: 'اختبارات شارات الحداقة: الإسعافات الأولية والبوصلة',
      desc: 'محطات عملية لتقييم اجتياز شارة الإسعاف ودليل الخرائط...',
      photosCount: '34 صورة',
      date: '19 فبراير 2026',
      badge: 'شارات الهواية',
      author: 'ق. جون عماد',
      img: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'a6',
      title: 'رحلة الاستكشاف والتسير الطويل: وادي دجلة والمهارات',
      desc: 'مسيرة استكشافية لبث روح المسئولية والملاحة الجغرافية...',
      photosCount: '8 مقاطع + 50 لقطة',
      date: '08 يناير 2026',
      badge: 'معسكرات الخلاء',
      author: 'ق. ميلاد أسعد',
      img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'a7',
      title: 'حفل تكريم القادة الرواد وأوائل المسابقات الثقافية والروحية',
      desc: 'أمسية وفاء لقادة الخدمة الكشفية ومؤسسي الكشافة...',
      photosCount: '42 صورة',
      date: '25 ديسمبر 2025',
      badge: 'التكريم والذكريات',
      author: 'ق. بيشوي كمال',
      img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'a8',
      title: 'مهرجان الألعاب الحركية وبناء الشخصية لشبل المستقبل',
      desc: 'فعاليات اليوم الترفيهي المفتوح لفرق الأشبال والزهرات...',
      photosCount: '18 صورة',
      date: '15 نوفمبر 2025',
      badge: 'الأشبال والزهرات',
      author: 'ق. سارة يوسف',
      img: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="space-y-6">

      {/* Top Header Banner matching standard theme */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[32px]">photo_library</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-lg sm:text-xl text-[#610000]">صندوق الذكريات والأرشيف المرئي</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 bg-[#f6f3ee] px-4 py-2 rounded-xl border border-[#e5e2dd] text-xs">
            <div><span className="font-extrabold text-[#8b0000] block">1,480+</span><span className="text-[10px] text-[#5a403c]">صورة موثقة</span></div>
            <div className="w-px h-6 bg-[#e5e2dd]"></div>
            <div><span className="font-extrabold text-[#7e5713] block">85</span><span className="text-[10px] text-[#5a403c]">فيديو HD</span></div>
            <div className="w-px h-6 bg-[#e5e2dd]"></div>
            <div><span className="font-extrabold text-[#8b0000] block">12</span><span className="text-[10px] text-[#5a403c]">معسكر صيفي</span></div>
          </div>

          <button onClick={() => alert('رفع وسائط جديدة...')} className="bg-[#8b0000] hover:bg-[#610000] text-white px-4 py-2.5 rounded-full text-xs font-bold shadow transition flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
            <span>رفع وسائط جديدة</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Tabs Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#e5e2dd] shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
        <div className="flex flex-wrap gap-2">
          {['الكل الوسائط', 'الأيام الكشفية', 'المعسكرات السنوية', 'حفلات الوعد', 'اختبارات الاستحقاق'].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-xl transition ${activeTab === t ? 'bg-[#8b0000] text-white shadow' : 'bg-[#f6f3ee] text-[#5a403c] hover:bg-[#ebe8e3]'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select className="bg-[#f6f3ee] px-3 py-1.5 rounded-xl border border-[#e5e2dd] text-xs font-bold text-[#1c1c19]">
            <option>الموسم: 2026/2027</option>
            <option>2025</option>
            <option>2024</option>
            <option>الأرشيف القديم</option>
          </select>
        </div>
      </div>

      {/* 3. Featured Video Hero Card matching Image 2 */}
      <div className="bg-white rounded-2xl border border-[#e5e2dd] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 relative h-72 lg:h-auto overflow-hidden group">
          <img src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80" alt="Video thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <button onClick={() => alert('تشغيل فيلم المعسكر السنوي...')} className="w-16 h-16 rounded-full bg-[#8b0000] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition">
              <span className="material-symbols-outlined text-3xl">play_arrow</span>
            </button>
          </div>
          <span className="absolute top-4 right-4 bg-black/60 text-amber-300 px-3 py-1 rounded-full text-xs font-bold backdrop-blur">
            فيلم المعسكر السنوي التوثيقي • 14:20 دقيقة HD
          </span>
        </div>

        <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded bg-rose-100 text-[#8b0000] text-[10px] font-bold">المعسكر التدريبي الصيفي للكشافة 2026</span>
            <h2 className="font-extrabold text-lg text-[#610000] leading-snug">
              شعلة الإيمان والخدمة: ملحمة معسكر "كونوا مستعدين"
            </h2>
            <p className="text-xs text-[#5a403c] leading-relaxed">
              التوثيق السينمائي الشامل لفعاليات المعسكر السنوي الذي استمر 4 أيام بمشاركة 210 كشاف ومُرشدة، متضمناً طابور العرض العام، ألعاب الخلاء الليلية، وتخريج دفعة وسام القديس موريس.
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#f0ede9]">
            <div className="flex justify-between text-xs text-[#5a403c]">
              <span>إشراف الإعلام والتراسل: ق. ميكائيل إبراهيم</span>
              <span>تاريخ الفعالية: 15 - 19 يوليو 2026</span>
            </div>

            <div className="flex gap-2">
              <button onClick={() => alert('تشغيل فيلم المعسكر السنوي...')} className="flex-1 py-2.5 rounded-xl bg-[#8b0000] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow">
                <span className="material-symbols-outlined text-[18px]">play_circle</span>
                <span>تشغيل العرض</span>
              </button>
              <button onClick={() => alert('تحميل الفيديو بدقة عالية...')} className="px-4 py-2.5 rounded-xl bg-[#f6f3ee] text-[#5a403c] text-xs font-bold border border-[#e5e2dd]">
                <span className="material-symbols-outlined text-[18px]">download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Grid of Photo Albums (8 Cards matching Image 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {albums.map(alb => (
          <div key={alb.id} className="bg-white rounded-2xl border border-[#e5e2dd] shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
            <div className="relative h-44 overflow-hidden group">
              <img src={alb.img} alt={alb.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <span className="absolute top-3 right-3 bg-black/60 backdrop-blur text-amber-300 text-[10px] px-2.5 py-0.5 rounded font-bold">
                {alb.badge}
              </span>
              <span className="absolute bottom-3 right-3 text-white text-xs font-extrabold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                {alb.photosCount}
              </span>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-xs text-[#1c1c19] leading-snug line-clamp-2">{alb.title}</h3>
                <p className="text-[11px] text-[#5a403c] line-clamp-2 mt-1">{alb.desc}</p>
              </div>

              <div className="pt-2 border-t border-[#f0ede9] flex items-center justify-between text-[10px] text-[#8e706b]">
                <span>{alb.author}</span>
                <span>{alb.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
