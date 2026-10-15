import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useScout } from '../../context/ScoutContext';

export const CurriculumModule = () => {
  const { currentUser } = useScout();
  const isSectorHead = currentUser?.role === 'sector_head';
  const sectorName = currentUser?.sectorName || 'قطاع الكشاف المتقدم';

  const getStageFromSector = (sec) => {
    switch (sec) {
      case 'sprouts': return 'براعم';
      case 'cubs': return 'أشبال';
      case 'blossoms': return 'زهرات';
      case 'scouts': return 'كشاف';
      case 'guides': return 'مرشدات';
      case 'senior_scouts': return 'متقدم';
      case 'rangers': return 'رائدات';
      case 'rovers': return 'جوالة';
      default: return 'متقدم';
    }
  };

  const [selectedCategory, setSelectedCategory] = useState('روحي');
  const [selectedStage, setSelectedStage] = useState(() => getStageFromSector(currentUser?.sector));
  const [selectedAnswer, setSelectedAnswer] = useState('ب');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    if (isSectorHead && currentUser?.sector) {
      setSelectedStage(getStageFromSector(currentUser.sector));
    }
  }, [currentUser?.sector, isSectorHead]);

  const handleAnswerSubmit = (optionKey) => {
    setSelectedAnswer(optionKey);
    setQuizSubmitted(true);
    if (optionKey === 'ب') {
      try {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner matching standard theme */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[32px]">auto_stories</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-lg sm:text-xl text-[#610000]">المناهج والمسابقات الكشفية</h1>
              {isSectorHead && (
                <span className="px-3 py-1 rounded-full bg-[#ffddb1] text-[#291800] text-xs font-black border border-amber-300">
                  خاص بـ: {sectorName}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-2xl bg-[#ffddb1] text-[#291800] text-xs font-black border border-amber-300 flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">emoji_events</span>
            <span>148 وجبة كشفية</span>
          </span>
        </div>
      </div>

      {/* Category Filter Tags & Stage Selector matching Image 3 */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-4">
        {/* Category tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'روحي', icon: 'church', label: 'روحي ✝️' },
            { id: 'كشفي', icon: 'military_tech', label: 'كشفي ⚜️' },
            { id: 'تنموي', icon: 'psychology', label: 'تنموي تربوي 🧠' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-[#8b0000] text-white shadow-md'
                  : 'bg-[#f6f3ee] text-[#5a403c] hover:bg-[#ebe8e3]'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Stage Selector buttons */}
        <div>
          <label className="block text-xs font-bold text-[#5a403c] mb-2">تحديد المرحلة الكشفية:</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs font-bold">
            {['براعم', 'أشبال', 'كشاف', 'مرشدات', 'متقدم', 'جوالة'].map(stg => (
              <button
                key={stg}
                onClick={() => setSelectedStage(stg)}
                className={`py-2 rounded-xl border text-center transition ${
                  selectedStage === stg
                    ? 'bg-[#ffddb1] text-[#291800] border-[#7e5713] font-black'
                    : 'bg-[#f6f3ee] text-[#5a403c] border-[#e5e2dd]'
                }`}
              >
                {stg} {stg === 'متقدم' ? '🏆' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 1: الحقيبة التعليمية والوسائط (9 وسائط معتمدة) matching Image 3 */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#f0ede9] pb-3">
          <h3 className="font-black text-sm text-[#610000] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7e5713]">folder_open</span>
            <span>الحقيبة التعليمية والوسائط (9 وسائط معتمدة)</span>
          </h3>
          <span className="text-xs font-bold text-[#7e5713] bg-[#ffddb1] px-3 py-1 rounded-full">
            مرحلة المتقدم
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: PDF Guide */}
          <div className="p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-red-100 text-red-800 font-mono font-bold text-[10px]">
                  PDF دليل 4.8 ميجابايت
                </span>
                <span className="material-symbols-outlined text-red-700">picture_as_pdf</span>
              </div>
              <h4 className="font-extrabold text-sm text-[#1c1c19]">دليل الريادة والعقد والربطات الكشفية</h4>
              <p className="text-xs text-[#5a403c]">
                شرح مصور لـ 24 عقدة ودورة كشفية لبناء الجسور والجمال الكشفية
              </p>
            </div>
            <div className="flex gap-2 pt-2 border-t border-[#e5e2dd]">
              <button onClick={() => alert('جاري فتح الدليل المباشر...')} className="flex-1 py-2 bg-[#8b0000] text-white text-xs font-bold rounded-xl shadow hover:bg-[#610000]">
                قراءة فورية
              </button>
              <button onClick={() => alert('جاري التحميل...')} className="px-3 py-2 bg-[#f6f3ee] text-[#5a403c] text-xs font-bold rounded-xl border border-[#e5e2dd]">
                تحميل
              </button>
            </div>
          </div>

          {/* Card 2: Practical Video */}
          <div className="p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-32 rounded-xl bg-slate-900 text-white relative overflow-hidden flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-amber-300 opacity-90 hover:scale-110 transition cursor-pointer">
                  play_circle
                </span>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white font-mono text-[10px]">
                  13:24
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-[#1c1c19]">فيديو عملي: نصب الخيمة وسارية العلم</h4>
              <p className="text-xs text-[#5a403c]">
                خطوات تثبيت الأوتاد وشذ الحبال العرفية ورفع علم الطليعة بأية السارية الثلاثية - القائد بيشوي نصر
              </p>
            </div>
            <button onClick={() => alert('جاري تشغيل الشرح...')} className="w-full py-2 bg-[#7e5713] text-white text-xs font-bold rounded-xl shadow hover:bg-[#5a403c] flex items-center justify-center gap-1">
              <span>مشاهدة الشرح</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Card 3: Audio Commentary */}
          <div className="p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                تسجيل صوتي • ألحان كنسية
              </span>
              <span className="material-symbols-outlined text-[#7e5713]">graphic_eq</span>
            </div>
            <h4 className="font-extrabold text-sm text-[#1c1c19]">شرح ألحان وثانون الكشافة الأرثوذكسية</h4>
            <div className="p-3 bg-white rounded-xl border border-[#e5e2dd] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="w-10 h-10 rounded-full bg-[#8b0000] text-white flex items-center justify-center shadow"
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {isPlayingAudio ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <div>
                  <h5 className="font-bold text-xs text-[#1c1c19]">عقيدة مجموعة جنود المسيح</h5>
                  <span className="text-[10px] text-[#8e706b] font-mono">02:45 / 04:30</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[40, 70, 30, 90, 60, 80, 50, 90, 40].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`w-1 rounded-full ${isPlayingAudio ? 'bg-[#8b0000] animate-pulse' : 'bg-[#e5e2dd]'}`}
                  ></span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: Photo Atlas */}
          <div className="p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px]">
                معرض صور • 12 مخطط فوتوغرافي
              </span>
              <span className="material-symbols-outlined text-blue-700">photo_library</span>
            </div>
            <h4 className="font-extrabold text-sm text-[#1c1c19]">أطلس النوافد والنيران الميدانية</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-20 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-[11px] p-2 text-center border">
                فرقة الطليعة الأولى
              </div>
              <div className="h-20 rounded-xl bg-amber-900 text-white flex items-center justify-center font-bold text-[11px] p-2 text-center border">
                موقد الطبخ الطيني
              </div>
            </div>
            <button onClick={() => alert('جاري فتح الألبوم الكامل...')} className="w-full py-2 bg-white text-[#1c1c19] text-xs font-bold rounded-xl border border-[#e5e2dd]">
              فتح الألبوم والصور بالتفصيل 🖼️
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: الإنجيل والمسابقات اليومية (لوقا 10) matching Image 3 */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#f0ede9] pb-3">
          <h3 className="font-black text-sm text-[#610000] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7e5713]">menu_book</span>
            <span>الإنجيل والمسابقات اليومية (الأسبوع الثالث)</span>
          </h3>
          <span className="text-xs font-mono font-bold text-[#8b0000]">لوقا - الأصحاح 10</span>
        </div>

        {/* Verse Highlight Card matching Image 3 */}
        <div className="p-6 rounded-3xl bg-[#fcf9f4] border-2 border-[#7e5713]/30 text-center space-y-3 relative shadow-inner">
          <span className="text-xs font-extrabold text-[#7e5713] bg-[#ffddb1] px-3 py-1 rounded-full border border-[#7e5713]/20 inline-block">
            آية اليوم المحفوظة (لوقا 10: 20)
          </span>
          <blockquote className="text-base sm:text-lg font-black text-[#610000] leading-relaxed">
            «وَلَكِنْ لاَ تَفْرَحُوا بِهذَا: أَنَّ الأَرْوَاحَ تَخْضَعُ لَكُمْ، بَلِ افْرَحُوا بِالْحَرِيِّ أَنَّ أَسْمَاءَكُمْ كُتِبَتْ فِي السَّمَاوَاتِ»
          </blockquote>
          <div className="flex justify-center gap-3 pt-2">
            <button onClick={() => alert('مشاهدة فيديو التأمل (12 دقيقة)...')} className="px-4 py-2 bg-[#8b0000] text-white text-xs font-bold rounded-xl shadow">
              فيديو تأمل 12 دقيقة
            </button>
            <button onClick={() => alert('تحميل ملخص دراسي PDF...')} className="px-4 py-2 bg-white text-[#5a403c] text-xs font-bold rounded-xl border border-[#e5e2dd]">
              ملخص دراسي PDF
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: مسابقة إنجيل لوقا الأسبوعية (50 نقطة) matching Image 3 */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#f0ede9] pb-3">
          <h3 className="font-black text-sm text-[#610000] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7e5713]">quiz</span>
            <span>مسابقة إنجيل لوقا الأسبوعية (50 نقطة)</span>
          </h3>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            السؤال التفاعلي 3 من 5
          </span>
        </div>

        {/* Timer Strip */}
        <div className="bg-[#610000] text-white p-4 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-center">
          <span className="text-xs font-bold text-amber-200">الوقت المتبقي لانتهاء المسابقة:</span>
          <div className="flex items-center gap-2 font-mono font-black text-sm">
            <span className="bg-white/20 px-2.5 py-1 rounded-lg">02 يوم</span>
            <span>:</span>
            <span className="bg-white/20 px-2.5 py-1 rounded-lg">14 ساعة</span>
            <span>:</span>
            <span className="bg-white/20 px-2.5 py-1 rounded-lg">35 دقيقة</span>
            <span>:</span>
            <span className="bg-white/20 px-2.5 py-1 rounded-lg">42 ثانية</span>
          </div>
        </div>

        {/* Question Card matching Image 3 */}
        <div className="p-5 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-4">
          <h4 className="font-black text-sm text-[#1c1c19] leading-relaxed">
            في مثل السامري الصالح (لوقا 10)، من هو الشخص الأول الذي رأى الجريح وجتاز مقابله دون أن يسعفه؟
          </h4>

          <div className="space-y-2.5 text-xs font-bold">
            {[
              { key: 'أ', label: 'أ) اللاوي الخادم' },
              { key: 'ب', label: 'ب) الكاهن (الإجابة الصحيحة)' },
              { key: 'ج', label: 'ج) صاحب الفندق' },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => handleAnswerSubmit(opt.key)}
                className={`w-full text-right p-3.5 rounded-2xl border transition ${
                  selectedAnswer === opt.key
                    ? 'bg-[#ffddb1] text-[#291800] border-[#7e5713] font-black shadow-sm'
                    : 'bg-white text-[#5a403c] border-[#e5e2dd] hover:bg-[#f6f3ee]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {quizSubmitted && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold text-center">
              🎉 أحسنت! إجابة صحيحة +25 نقطة تمت إضافتها لرصيدك الكشفي!
            </div>
          )}
        </div>
      </div>

      {/* Section 4: صدارة المتسابقين الكشفية matching Image 3 */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-4">
        <h3 className="font-black text-sm text-[#610000] flex items-center gap-2 border-b border-[#f0ede9] pb-3">
          <span className="material-symbols-outlined text-[#7e5713]">leaderboard</span>
          <span>صدارة المتسابقين الكشفية</span>
        </h3>

        <div className="space-y-2.5">
          {[
            { rank: '1', name: 'مارك أشرف جرجس', patrol: 'طليعة النسر • متقدم', pts: '490', badge: 'الوسام الذهبي 🥇', bg: 'bg-[#ffddb1] text-[#291800] border-[#7e5713]' },
            { rank: '2', name: 'كيرلس عادل فريد', patrol: 'طليعة الفهد • كشاف', pts: '465', badge: 'الوسام الفضي 🥈', bg: 'bg-slate-100 text-slate-800 border-slate-300' },
            { rank: '3', name: 'مارينا سامح وديع', patrol: 'طليعة الفراشات', pts: '440', badge: 'الوسام البرونزي 🥉', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
          ].map(user => (
            <div key={user.rank} className={`p-3.5 rounded-2xl border flex items-center justify-between ${user.bg}`}>
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-base">#{user.rank}</span>
                <div>
                  <h4 className="font-extrabold text-xs">{user.name}</h4>
                  <p className="text-[11px] opacity-80">{user.patrol}</p>
                </div>
              </div>
              <div className="text-left font-mono">
                <span className="font-black text-sm block">{user.pts} نقطة</span>
                <span className="text-[10px] font-bold">{user.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
