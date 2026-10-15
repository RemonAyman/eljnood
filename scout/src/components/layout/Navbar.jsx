import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useScout } from '../../context/ScoutContext';

export const Navbar = ({ onOpenAuth, onOpenMobileSidebar, hideSidebarToggle = false }) => {
  const { currentUser } = useScout();
  const location = useLocation();
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);

  const getTabTitleByPath = (path) => {
    switch (path) {
      case '/':
      case '/about-group': return 'عن مجموعة جنود المسيح الكشفية';
      case '/member-audit-history': return 'سجل الاستعلام الشامل للأعضاء والقادة';
      case '/annual-schedule': return 'خطة الأيام الكشفية والموسم السنوي';
      case '/detailed-programs': return 'برامج واجتماعات القطاعات والعهد الكشفية والمعسكرات';
      case '/sector-meetings': return 'اجتماعات القطاعات والفرق الكشفية';
      case '/digital-card': return 'الكارنيه الكشفي الرقمي';
      case '/smart-attendance': return 'تسجيل الحضور والغياب الذكي';
      case '/finances-and-dues': return 'الاشتراكات والماليات';
      case '/price-list': return 'لائحة الأسعار والتحصيل الرسمية';
      case '/bible-and-competitions': return 'المسابقات الكتابية ودراسة الإنجيل';
      case '/care-and-visitation': return 'إدارة وتوزيع افتقاد المخدومين (رؤساء القطاعات)';
      case '/field-visitations': return 'التكليفات والافتقاد الميداني (القادة والجوالة)';
      case '/communications-chat': return 'غرف التواصل والإعلانات';
      case '/halls-reservation': return 'حجز وتنسيق قاعات ومقرات الخدمة';
      case '/inventory-and-equipment': return 'طلب العهد والمهمات والمخازن الكشفية';
      case '/memory-box-exhibitions': return 'صندوق الذكريات والأرشيف';
      case '/parent': return 'بوابة ولي الأمر';
      default: return 'عن مجموعة جنود المسيح';
    }
  };

  const activeTabTitle = getTabTitleByPath(location.pathname);

  // Announcements list
  const announcements = [
    '📢 تنبيه عاجل: التجمع لجميع الفرق وطابور الصباح يوم الجمعة 03:00 عصراً بالملعب الكشفي.',
    '⛺ المعسكر السنوي 2026: فتح باب تسجيل الاشتراكات واستكمال استشارات قطاع الفتيان والمتقدم.',
    '🏆 مهرجان الكرازة: بدء تسليم المطبوعات والاختبارات الأسبوعية للخدّام والأعضاء.',
  ];

  const [currentAnnIndex, setCurrentAnnIndex] = useState(0);

  // Auto-cycle announcements
  useEffect(() => {
    const annInterval = setInterval(() => {
      setCurrentAnnIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => {
      clearInterval(annInterval);
    };
  }, [announcements.length]);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { label: 'القائد المسؤول (أدمن)', bg: 'bg-[#8b0000] text-white' };
      case 'festival_leader':
        return { label: '🏆 قائد المهرجان (جميع القطاعات)', bg: 'bg-[#8b0000] text-amber-300 font-black border border-amber-300' };
      case 'sector_head':
        return { label: currentUser?.sectorName ? `رئيس قطاع (${currentUser.sectorName})` : 'رئيس قطاع الكشافة', bg: 'bg-[#7e5713] text-white' };
      case 'sub_officer':
        return { label: 'مسؤول الاشتراكات والماليات', bg: 'bg-emerald-700 text-white' };
      case 'leader':
        return { label: 'قائد طليعة / جوال', bg: 'bg-blue-700 text-white' };
      case 'parent':
        return { label: 'ولي أمر (متابعة الابن)', bg: 'bg-purple-700 text-white' };
      case 'child':
        return { label: 'كشاف / مخدوم', bg: 'bg-cyan-700 text-white' };
      case 'guest':
        return { label: 'زائر غير مسجل (صفحة البداية)', bg: 'bg-[#7e5713] text-white' };
      default:
        return { label: role, bg: 'bg-slate-700 text-white' };
    }
  };

  const badge = getRoleBadge(currentUser?.role);
  const isLanding = currentUser?.role === 'guest';

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#8b0000] text-white px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!hideSidebarToggle && (
            <button
              onClick={onOpenMobileSidebar}
              className="p-1.5 rounded-lg text-white hover:bg-white/10 transition"
              aria-label="القائمة"
            >
              <i className="fa-solid fa-bars text-[26px]"></i>
            </button>
          )}

          <img
            src="/logo.png"
            alt="شعار مجموعة جنود المسيح"
            className="w-8 h-8 rounded-lg object-contain bg-white shrink-0 shadow-sm p-0.5 border border-amber-300"
          />

          <div>
            <h1 className="font-black text-sm text-white leading-tight">
              مجموعة جنود المسيح
            </h1>
            <p className="text-[10px] text-amber-200 font-bold">{activeTabTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLanding && (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#3a0000] font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-user-check text-[18px]"></i>
              <span>تسجيل الدخول</span>
            </button>
          )}
          <button
            onClick={() => setShowAnnounceModal(true)}
            className="relative p-1.5 rounded-full text-amber-100 hover:bg-white/10 transition"
          >
            <i className="fa-solid fa-bell text-[22px]"></i>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#8b0000]"></span>
          </button>
        </div>
      </header>

      {/* Desktop Top Navbar */}
      <header className="hidden lg:flex h-[72px] bg-[#ffffff]/95 backdrop-blur-xl sticky top-0 z-40 shadow-[0_1px_12px_rgba(139,0,0,0.04)] items-center justify-between px-6 border-b border-[#e5e2dd]">
        
        {/* Desktop Left */}
        {isLanding ? (
          /* Landing Page Desktop Left Header: Group Logo + Name */
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="شعار مجموعة جنود المسيح"
              className="w-10 h-10 rounded-xl object-contain bg-white shadow-sm border border-[#e5e2dd] p-0.5"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-[#610000] text-base leading-tight">مجموعة جنود المسيح</span>
              </div>
              <span className="text-[11px] font-bold text-[#8e706b]">الصفحة التعريفية الرسمية للمجموعة</span>
            </div>
          </div>
        ) : (
          /* Original System Desktop Left Header: Breadcrumb + Icon + Active Tab Title */
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#f6f3ee] text-[#8b0000] border border-[#e5e2dd] flex items-center justify-center font-bold shadow-2xs">
              <i className="fa-solid fa-compass text-[20px]"></i>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-[#610000]">{activeTabTitle}</span>
              <span className="text-[#8e706b] text-xs font-bold">•</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#f6f3ee] text-[#7e5713] border border-[#e5e2dd] font-bold text-[11px]">
                منظومة الخدمة الكشفية 2026
              </span>
            </div>
          </div>
        )}

        {/* Desktop Right Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {isLanding && (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#3a0000] font-black text-xs shadow-md hover:scale-105 transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-user-check text-[20px]"></i>
              <span>تسجيل الدخول</span>
            </button>
          )}
          <button
            onClick={() => setShowAnnounceModal(true)}
            className="relative w-10 h-10 rounded-full bg-[#fcf9f4] hover:bg-[#f6f3ee] border border-[#e5e2dd] flex items-center justify-center text-[#8b0000] transition cursor-pointer shadow-2xs group"
            title="فتح مركز التعميمات والإعلانات"
          >
            <i className="fa-solid fa-bell text-[22px] group-hover:scale-110 transition"></i>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#8b0000] ring-2 ring-white animate-pulse"></span>
          </button>
        </div>
      </header>

      {/* Full Announcements List Modal */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#e5e2dd] shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowAnnounceModal(false)}
              className="absolute top-4 left-4 w-9 h-9 rounded-full bg-red-50 text-[#8b0000] font-black flex items-center justify-center border border-red-200"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8b0000] text-white flex items-center justify-center">
                <i className="fa-solid fa-bullhorn text-[24px]"></i>
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#610000]">مركز التعميمات والإعلانات العاجلة</h3>
                <p className="text-xs text-[#5a403c]">جميع التنبيهات المعتمدة الصادرة من مجلس القيادة</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {announcements.map((ann, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#7e5713]">
                    <span>إعلان رقم #{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded bg-[#ffddb1] text-[#291800]">معتمد من القيادة</span>
                  </div>
                  <p className="text-xs font-extrabold text-[#1c1c19] leading-relaxed">{ann}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
