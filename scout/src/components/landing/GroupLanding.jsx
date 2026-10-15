import React, { useState } from 'react';
import { useScout } from '../../context/ScoutContext';

export const GroupLanding = ({ onOpenAuth }) => {
  const { currentUser } = useScout();
  const isGuest = currentUser?.role === 'guest';
  const [activePhotoCategory, setActivePhotoCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  // Dynamic years of service calculation based on founding year 2004
  const foundingYear = 2004;
  const currentYear = new Date().getFullYear();
  const yearsOfService = currentYear - foundingYear;

  // Gallery Data
  const galleryItems = [
    {
      id: 1,
      category: 'promise_ceremonies',
      title: 'حفل الوعد الرسمي وتقليّد الأوسمة الكشفية',
      subtitle: 'حضور الآباء الكهنة وقادة المجموعة 2025',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
      badge: 'حفلات الوعد'
    },
    {
      id: 2,
      category: 'scout_days',
      title: 'الافتتاح الرسمي لليوم الكشفي وطابور العلم',
      subtitle: 'استعراض موسيقار الكشافة وطابور العلم',
      image: 'https://images.unsplash.com/photo-1517457210348-703079e57d4b?auto=format&fit=crop&w=800&q=80',
      badge: 'أيام كشفية'
    },
    {
      id: 3,
      category: 'festival',
      title: 'المشاركة في مهرجان الكرازة السنوي والعروض',
      subtitle: 'تدريب فرقة الأشبال والكشاف وتحديات الكرازة',
      image: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=800&q=80',
      badge: 'المهرجان'
    },
    {
      id: 4,
      category: 'scout_days',
      title: 'إيقاد نار المخيم والسمر في اليوم الكشفي',
      subtitle: 'أمسية الأناشيد والفقرات الروحية الكشفية',
      image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80',
      badge: 'أيام كشفية'
    },
    {
      id: 5,
      category: 'festival',
      title: 'دراسة الكتاب ومسابقات الألحان بالمهرجان',
      subtitle: 'لقاء الأسبوع الروحي واختبارات المهرجان',
      image: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=800&q=80',
      badge: 'المهرجان'
    },
    {
      id: 6,
      category: 'promise_ceremonies',
      title: 'توزيع شارات الوعد وتكريم الكشافين المميزين',
      subtitle: 'مغامرات وحفلات الوعد السنوية',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
      badge: 'حفلات الوعد'
    }
  ];

  const filteredGallery = activePhotoCategory === 'all'
    ? galleryItems
    : galleryItems.filter(item => item.category === activePhotoCategory);

  return (
    <div className="space-y-12 pb-12 text-[#1c1c19]">
      
      {/* 1. HERO BANNER SECTION */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#8b0000] via-[#610000] to-[#3a0000] text-white p-6 sm:p-10 lg:p-14 overflow-hidden shadow-2xl border border-amber-500/20">
        {/* Background decorative circles & watermark logo */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-red-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-10 bottom-4 opacity-5 pointer-events-none hidden lg:block">
          <img src="/logo.png" alt="watermark" className="w-96 h-96 object-contain" />
        </div>

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-200 text-xs font-black backdrop-blur-md shadow-inner">
            <i className="fa-solid fa-certificate text-[18px]"></i>
            <span>الموقع الرسمي • مجموعة جنود المسيح الكشفية</span>
          </div>

          {/* Group Header & Title */}
          <div className="flex flex-row items-center gap-3 sm:gap-5">
            <img
              src="/logo.png"
              alt="شعار مجموعة جنود المسيح"
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-white p-2 shadow-2xl border-2 border-amber-400 shrink-0 object-contain"
            />
            <div>
              <h1 className="text-xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-md">
                مجموعة جنود المسيح الكشفية
              </h1>
              <p className="text-amber-200 font-extrabold text-xs sm:text-lg mt-1 flex items-center gap-1.5 sm:gap-2">
                <i className="fa-solid fa-church text-[16px] sm:text-[20px]"></i>
                <span>جمعية جنود المسيح</span>
              </p>
            </div>
          </div>

          {/* Intro Description */}
          <p className="text-amber-100/90 text-sm sm:text-base font-bold leading-relaxed max-w-2xl">
            مرحبا بكم في الصفحة الرسمية لمجموعة جنود المسيح الكشفية. نسعى لإعداد جيل مؤمن، متميز انضباطاً وروحاً، متسلح بالمهارات الكشفية والقيم المسيحية السامية لخدمة الكنيسة والوطن والمجتمع.
          </p>



          {/* Fast Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-center">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="block text-2xl font-black text-amber-300">{foundingYear}</span>
              <span className="text-[11px] font-bold text-amber-100/80">تاريخ التأسيس</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="block text-2xl font-black text-amber-300">+450</span>
              <span className="text-[11px] font-bold text-amber-100/80">كشاف وقائد نشط</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="block text-2xl font-black text-amber-300">6</span>
              <span className="text-[11px] font-bold text-amber-100/80">قطاعات كشفية</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="block text-2xl font-black text-amber-300">+{yearsOfService}</span>
              <span className="text-[11px] font-bold text-amber-100/80">عاماً من الخدمة والعطاء</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT ASSOCIATION & LOCATION SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: About Association & History */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#e5e2dd] shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#8b0000]/10 text-[#8b0000] flex items-center justify-center font-bold">
                <i className="fa-solid fa-building text-[28px]"></i>
              </div>
              <div>
                <h2 className="font-black text-xl text-[#610000]">عن جمعية ومجموعة جنود المسيح</h2>
                <span className="text-xs text-[#7e5713] font-bold">تاريخ عريق ورسالة تربوية كنسية</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#5a403c] font-bold leading-relaxed">
              تأسست جمعية ومجموعة جنود المسيح الكشفية لتكون منارة تربوية وروحية تخدم الأجيال المتعاقبة. نؤمن بأن الحركة الكشفية هي أداة عظيمة لبناء شخصية الفتى والفتاة على أسس من الإيمان الصادق، والاعتماد على النفس، والانضباط الكشفي الأصيل.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-1.5">
                <div className="flex items-center gap-2 text-[#8b0000] font-black text-sm">
                  <i className="fa-solid fa-shield-halved text-[20px]"></i>
                  <span>الوعد والقانون الكشفي</span>
                </div>
                <p className="text-xs text-[#5a403c] font-bold leading-relaxed">
                  نغرس في أبنائنا الالتزام بالوعد الكشفي: "أعد أن أبذل جهدي في أن أقوم بواجبي نحو الله ثم الوطن وأساعد الناس في كل وقت وأعمل بقانون الكشافة".
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-1.5">
                <div className="flex items-center gap-2 text-[#7e5713] font-black text-sm">
                  <i className="fa-solid fa-timeline text-[20px]"></i>
                  <span>بدايات الكشافة بالمجموعة</span>
                </div>
                <p className="text-xs text-[#5a403c] font-bold leading-relaxed">
                  بدأت الخدمة الكشفية بالجمعية منذ عام 2004 بطليعة صغيرة نمت وتوسعت لتضم اليوم كافة المراحل من البراعم والأشبال والزهرات وحتى الجوالة والقادة.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-[#7e5713] font-bold flex items-center gap-3">
            <i className="fa-solid fa-award text-[#8b0000] text-[24px]"></i>
            <span>المجموعة مسجلة ومعتمدة ضمن الكشافة والمرشدات المصرية والخدمات الكنسية المعتمدة.</span>
          </div>
        </div>

        {/* Right Column: Location & Contact Card */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#f6f3ee] to-[#ffffff] rounded-3xl p-6 sm:p-8 border border-[#e5e2dd] shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#7e5713]/10 text-[#7e5713] flex items-center justify-center font-bold">
                <i className="fa-solid fa-location-pin text-[28px]"></i>
              </div>
              <div>
                <h3 className="font-black text-lg text-[#610000]">المقر وأرض التجمع</h3>
                <span className="text-xs text-[#5a403c] font-bold">العنوان ومواعيد الاستقبال</span>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm font-bold text-[#1c1c19]">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-[#e5e2dd]">
                <i className="fa-solid fa-map-pin text-[#8b0000] text-[22px] shrink-0 mt-0.5"></i>
                <div>
                  <span className="block font-black text-[#610000]">العنوان الرئيسي:</span>
                  <span className="text-[#5a403c]">مقر جمعية وكنيسة جنود المسيح - أرض الملعب الكشفي، القاهرة، مصر.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-[#e5e2dd]">
                <i className="fa-solid fa-clock text-[#7e5713] text-[22px] shrink-0 mt-0.5"></i>
                <div>
                  <span className="block font-black text-[#610000]">الأيام الكشفية:</span>
                  <span className="text-[#5a403c]">كل يوم ثلاثاء وجمعة من كل أسبوع.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-[#e5e2dd]">
                <i className="fa-solid fa-phone text-emerald-800 text-[22px] shrink-0 mt-0.5"></i>
                <div>
                  <span className="block font-black text-[#610000]">للتواصل والتعميمات:</span>
                  <span className="text-[#5a403c]">مكتب قادة الأمانة العامة الكشفية بالجمعية.</span>
                </div>
              </div>
            </div>
          </div>

          {isGuest && (
            <div className="pt-2">
              <button
                onClick={onOpenAuth}
                className="w-full py-3.5 rounded-2xl bg-[#8b0000] hover:bg-[#610000] text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-user-plus text-[20px]"></i>
                <span>تسجيل عضو جديد أو التواصل مع القادة</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. WHAT IS SCOUTING & THE SECTORS */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full bg-[#ffddb1] text-[#7e5713] font-black text-xs">
            القطاعات والمراحل الكشفية
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#610000]">
            ما هي الكشافة؟ وما هي قطاعات مجموعة جنود المسيح؟
          </h2>
          <p className="text-xs sm:text-sm font-bold text-[#5a403c]">
            نستقبل الأعضاء من سن المبكرة (البراعم) وحتى مرحلة الشباب والجوالة والقادة.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Sector 1: Cubs & Blossoms */}
          <div className="bg-white rounded-3xl p-6 border border-[#e5e2dd] shadow-sm hover:shadow-md transition space-y-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#7e5713] flex items-center justify-center font-bold">
              <i className="fa-solid fa-child text-[28px]"></i>
            </div>
            <div>
              <span className="text-[11px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                المرحلة الابتدائي (3 - 6 ابتدائي)
              </span>
              <h3 className="font-black text-lg text-[#610000] mt-1">قطاع البراعم والأشبال والزهرات</h3>
              <p className="text-xs text-[#5a403c] font-bold mt-2 leading-relaxed">
                غرس القيم الأولى، التعاون والتآخي، مهارات البقاء البسيطة والقصص الهادفة مع العائلة الكشفية.
              </p>
            </div>
            <div className="pt-2 border-t border-[#f0ede9] text-[11px] font-bold text-[#7e5713]">
              <span>فرقة البراعم • الأشبال • الزهرات</span>
            </div>
          </div>

          {/* Sector 2: Scouts & Guides */}
          <div className="bg-white rounded-3xl p-6 border border-[#e5e2dd] shadow-sm hover:shadow-md transition space-y-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
              <i className="fa-solid fa-person-hiking text-[28px]"></i>
            </div>
            <div>
              <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                المرحلة الإعدادية
              </span>
              <h3 className="font-black text-lg text-[#610000] mt-1">قطاع الكشاف والمرشدات</h3>
              <p className="text-xs text-[#5a403c] font-bold mt-2 leading-relaxed">
                تعلم مهارات الخلاء، بناء المواقد والعقد والتربيطات، البوصلة والرحلات الخلوية والانضباط في الطليعة.
              </p>
            </div>
            <div className="pt-2 border-t border-[#f0ede9] text-[11px] font-bold text-blue-900">
              <span>فرقة الفتيان • المرشدات</span>
            </div>
          </div>

          {/* Sector 3: Senior Scouts & Rangers */}
          <div className="bg-white rounded-3xl p-6 border border-[#e5e2dd] shadow-sm hover:shadow-md transition space-y-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
              <i className="fa-solid fa-tree text-[28px]"></i>
            </div>
            <div>
              <span className="text-[11px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                المرحلة الثانوية
              </span>
              <h3 className="font-black text-lg text-[#610000] mt-1">قطاع الكشاف المتقدم والرائدات</h3>
              <p className="text-xs text-[#5a403c] font-bold mt-2 leading-relaxed">
                اختراعات الخلاء الكبيرة، المعسكرات التدريبية المتقدمة، الإسعافات الأولية والتخطيط للمشاريع.
              </p>
            </div>
            <div className="pt-2 border-t border-[#f0ede9] text-[11px] font-bold text-purple-900">
              <span>فرقة المتقدم • الرائدات</span>
            </div>
          </div>

          {/* Sector 4: Rovers & Leaders */}
          <div className="bg-white rounded-3xl p-6 border border-[#e5e2dd] shadow-sm hover:shadow-md transition space-y-4 relative overflow-hidden group sm:col-span-2 lg:col-span-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#8b0000] flex items-center justify-center font-bold shrink-0">
                  <i className="fa-solid fa-medal text-[28px]"></i>
                </div>
                <div>
                  <span className="text-[11px] font-black text-[#8b0000] bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                    مرحلة الشباب والجامعة والخدمة
                  </span>
                  <h3 className="font-black text-lg text-[#610000]">عشيرة الجوالة ومجلس القيادة</h3>
                  <p className="text-xs text-[#5a403c] font-bold mt-1">
                    خدمة المجتمع، تنظيم الفعاليات الكبرى، إعداد القادة والتدريب القيادي المتخصص.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. SCOUT ACTIVITIES & PROGRAM SEGMENTS */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e5e2dd] shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#f0ede9] pb-6">
          <div>
            <span className="text-xs font-black text-[#7e5713] uppercase tracking-wider">أنشطة المجموعة</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#610000] mt-1">
              الفقرات والبرامج التي تقدمها المجموعة
            </h2>
          </div>
          <span className="text-xs font-bold text-[#5a403c]">
            تكامل رائع بين المهارة الكشفية والدراسة الروحية والتنمية الاجتماعية
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-5 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#8b0000] text-white flex items-center justify-center font-bold">
              <i className="fa-solid fa-campground text-[24px]"></i>
            </div>
            <h4 className="font-black text-base text-[#610000]">مهارات الخلاء والمعسكرات</h4>
            <p className="text-xs text-[#5a403c] font-bold leading-relaxed">
              تعلم نصَب الخيام، حياكة العقد الكشفية، إشعال النيران وتأمين أرض المعسكر والطبخ الخلوي.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#7e5713] text-white flex items-center justify-center font-bold">
              <i className="fa-solid fa-book-open text-[24px]"></i>
            </div>
            <h4 className="font-black text-base text-[#610000]">الدراسات الكتابية والروحية</h4>
            <p className="text-xs text-[#5a403c] font-bold leading-relaxed">
              دراسة أسفار الكتاب المقدس، الأنشطة الكنسية، المسابقات الكتابية والأناشيد الروحية.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold">
              <i className="fa-solid fa-handshake-angle text-[24px]"></i>
            </div>
            <h4 className="font-black text-base text-[#610000]">اللياقة البدنية والألعاب</h4>
            <p className="text-xs text-[#5a403c] font-bold leading-relaxed">
              ألعاب المهارة والذكاء الكشفي، اختراق الضاحية، اللياقة البدنية ومهرجانات الألعاب الكبرى.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900 text-white flex items-center justify-center font-bold">
              <i className="fa-solid fa-music text-[24px]"></i>
            </div>
            <h4 className="font-black text-base text-[#610000]">موسيقى واستعراضات العرض</h4>
            <p className="text-xs text-[#5a403c] font-bold leading-relaxed">
              طابور الصباح الكشفي، المارشات النحاسية، استعراضات رفع العلم وإعلانات المجموعة.
            </p>
          </div>

        </div>
      </section>

      {/* 5. SCOUT DAYS TIMELINE SECTION */}
      <section id="scout-days" className="bg-gradient-to-br from-[#f6f3ee] to-[#ffffff] rounded-3xl p-6 sm:p-10 border border-[#e5e2dd] shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-bold shadow-md">
            <i className="fa-solid fa-calendar-check text-[28px]"></i>
          </div>
          <div>
            <h2 className="font-black text-2xl text-[#610000]">جدول اليوم الكشفي الأسبوعي</h2>
            <span className="text-xs text-[#7e5713] font-bold">برنامج يوم الجمعة بملعب جمعية جنود المسيح</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
          
          <div className="p-4 rounded-2xl bg-white border border-[#e5e2dd] space-y-2 relative">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ffddb1] text-[#7e5713] text-[10px] font-black">02:30 عصراً</span>
            <h4 className="font-extrabold text-sm text-[#1c1c19]">التجمع والتسجيل</h4>
            <p className="text-[11px] text-[#5a403c] font-bold">وصول الفرق الكشفية واستلام بطاقات الحضور بالـ QR.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e5e2dd] space-y-2 relative">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ffddb1] text-[#7e5713] text-[10px] font-black">03:00 عصراً</span>
            <h4 className="font-extrabold text-sm text-[#1c1c19]">طابور الصباح ورفع العلم</h4>
            <p className="text-[11px] text-[#5a403c] font-bold">مراسم رفع العلم الكشفي والمارشات وإعلان برنامج اليوم.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e5e2dd] space-y-2 relative">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ffddb1] text-[#7e5713] text-[10px] font-black">03:45 عصراً</span>
            <h4 className="font-extrabold text-sm text-[#1c1c19]">فقرة الشعار والروحيات</h4>
            <p className="text-[11px] text-[#5a403c] font-bold">درس الإنجيل الروحي والتربية الكنسية والشعار التنافسي.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e5e2dd] space-y-2 relative">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ffddb1] text-[#7e5713] text-[10px] font-black">04:45 عصراً</span>
            <h4 className="font-extrabold text-sm text-[#1c1c19]">ورش المهارات الكشفية</h4>
            <p className="text-[11px] text-[#5a403c] font-bold">العقد والبوصلة والإسعافات والألعاب الكشفية بالمجموعات.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#e5e2dd] space-y-2 relative">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ffddb1] text-[#7e5713] text-[10px] font-black">06:30 مساءً</span>
            <h4 className="font-extrabold text-sm text-[#1c1c19]">الانقضاء والتنظيف</h4>
            <p className="text-[11px] text-[#5a403c] font-bold">تسليم العهد، النظافة العامة والصلاة الختامية.</p>
          </div>

        </div>
      </section>

      {/* 6. PHOTO GALLERY SHOWCASE */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black text-[#7e5713] uppercase tracking-wider">معرض اللقطات</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#610000] mt-1">
              صور من أنشطة ومعسكرات جنود المسيح
            </h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#e5e2dd]">
            <button
              onClick={() => setActivePhotoCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${activePhotoCategory === 'all' ? 'bg-[#8b0000] text-white' : 'text-[#5a403c] hover:bg-[#f6f3ee]'}`}
            >
              الكل
            </button>
            <button
              onClick={() => setActivePhotoCategory('promise_ceremonies')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${activePhotoCategory === 'promise_ceremonies' ? 'bg-[#8b0000] text-white' : 'text-[#5a403c] hover:bg-[#f6f3ee]'}`}
            >
              حفلات الوعد
            </button>
            <button
              onClick={() => setActivePhotoCategory('scout_days')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${activePhotoCategory === 'scout_days' ? 'bg-[#8b0000] text-white' : 'text-[#5a403c] hover:bg-[#f6f3ee]'}`}
            >
              ايام كشفية
            </button>
            <button
              onClick={() => setActivePhotoCategory('festival')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${activePhotoCategory === 'festival' ? 'bg-[#8b0000] text-white' : 'text-[#5a403c] hover:bg-[#f6f3ee]'}`}
            >
              المهرجان
            </button>
          </div>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="bg-white rounded-3xl overflow-hidden border border-[#e5e2dd] shadow-sm hover:shadow-xl transition group cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-52 overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-200 text-[10px] font-black border border-white/20">
                  {item.badge}
                </span>
              </div>
              <div className="p-5 space-y-1.5">
                <h4 className="font-black text-sm text-[#1c1c19] group-hover:text-[#8b0000] transition">
                  {item.title}
                </h4>
                <p className="text-xs font-bold text-[#5a403c]">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. BOTTOM CALL TO ACTION BANNER (Only for Guests) */}
      {isGuest && (
        <section className="bg-gradient-to-r from-[#610000] to-[#8b0000] rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              جاهز للانضمام لأسرة مجموعة جنود المسيح؟
            </h2>
            <p className="text-amber-100 font-bold text-sm sm:text-base leading-relaxed">
              سجل الآن لاستخراج الكارنيه الرقمي، متابعة الحضور والاشتراكات، والاشتراك في الأنشطة والمعسكرات القادمة.
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <button
                onClick={onOpenAuth}
                className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#3a0000] font-black text-sm shadow-2xl hover:scale-[1.03] transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-key text-[24px]"></i>
                <span>تسجيل الدخول</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Lightbox Image Preview Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-black/50 text-white font-bold flex items-center justify-center hover:bg-black/70"
            >
              ✕
            </button>
            <img src={selectedImage.image} alt={selectedImage.title} className="w-full max-h-[70vh] object-cover" />
            <div className="p-5 space-y-1 bg-white">
              <span className="text-xs font-black text-[#7e5713]">{selectedImage.badge}</span>
              <h3 className="font-black text-lg text-[#610000]">{selectedImage.title}</h3>
              <p className="text-xs font-bold text-[#5a403c]">{selectedImage.subtitle}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
