import React, { useState, useEffect } from 'react';
import { useScout } from '../../context/ScoutContext';

export const Navbar = ({ onOpenAuth, onOpenMobileSidebar, activeTabTitle = 'الرئيسية', activeTab, setActiveTab, hideSidebarToggle = false }) => {
  const { currentUser, switchUserRole, SECTOR_HEAD_USERS } = useScout();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);

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
              <span className="material-symbols-outlined text-[26px]">menu</span>
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
          {/* Landing Mode: Show Login Button | System Mode: Show Notifications */}
          {isLanding ? (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#3a0000] text-xs font-black shadow transition flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              <span>تسجيل الدخول</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAnnounceModal(true)}
              className="relative p-1.5 rounded-full text-amber-100 hover:bg-white/10 transition"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#8b0000]"></span>
            </button>
          )}

          {/* User Profile Avatar */}
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white hover:bg-white/30 transition"
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
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
              <span className="material-symbols-outlined text-[20px]">explore</span>
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
          
          {/* Landing Mode Special Login Button */}
          {isLanding && (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-[#3a0000] px-4 py-1.5 rounded-full text-xs font-black shadow-md transition cursor-pointer border border-amber-500/30"
            >
              <span className="material-symbols-outlined text-[18px]">key</span>
              <span>تسجيل الدخول</span>
            </button>
          )}

          {/* Announcements Center Button (Shown only inside system pages) */}
          {!isLanding && (
            <button
              onClick={() => setShowAnnounceModal(true)}
              className="flex items-center gap-2 bg-[#fcf9f4] hover:bg-[#f6f3ee] border border-[#e5e2dd] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#1c1c19] transition cursor-pointer shadow-2xs group"
              title="فتح مركز التعميمات والإعلانات"
            >
              <div className="relative flex items-center justify-center">
                <span className="material-symbols-outlined text-[#8b0000] text-[18px] group-hover:scale-110 transition">notifications</span>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#8b0000] animate-pulse"></span>
              </div>
              <span>التعميمات والتنبيهات</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#ffddb1] text-[#291800] text-[10px] font-black">
                {announcements.length}
              </span>
            </button>
          )}

          {/* Quick Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 bg-[#f6f3ee] hover:bg-[#ebe8e3] border border-[#e5e2dd] px-3 py-1.5 rounded-full text-xs font-bold text-[#1c1c19] transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[#7e5713] text-[18px]">manage_accounts</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${badge.bg}`}>
                {badge.label}
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#8e706b]">arrow_drop_down</span>
            </button>

            {showRoleMenu && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-[#e5e2dd] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
                <div className="px-3 py-1.5 border-b border-[#f0ede9] text-[11px] font-bold text-[#8e706b]">
                  اختر الحساب للتجربة المباشرة:
                </div>
                <div className="space-y-1 mt-1">
                  <button
                    onClick={() => {
                      switchUserRole('guest');
                      if (setActiveTab) setActiveTab('about-group');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between hover:bg-[#f6f3ee] ${currentUser?.role === 'guest' ? 'bg-amber-100 text-amber-900 font-black' : 'text-[#1c1c19]'}`}
                  >
                    <span>👤 زائر غير مسجل (صفحة البداية فقط)</span>
                  </button>
                  <button
                    onClick={() => { switchUserRole('admin'); setShowRoleMenu(false); }}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between hover:bg-[#f6f3ee] ${currentUser?.role === 'admin' ? 'bg-[#ffdad6] text-[#8b0000]' : 'text-[#1c1c19]'}`}
                  >
                    <span>👑 المدير العام (مجلس القيادة الأعلى)</span>
                  </button>
                  <button
                    onClick={() => { switchUserRole('festival_leader'); setShowRoleMenu(false); }}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between hover:bg-[#f6f3ee] ${currentUser?.role === 'festival_leader' ? 'bg-amber-200 text-amber-950 font-black border border-amber-400' : 'text-[#1c1c19]'}`}
                  >
                    <span>🏆 قائد المهرجان (غياب جميع القطاعات)</span>
                  </button>
                  <button
                    onClick={() => { switchUserRole('sub_officer'); setShowRoleMenu(false); }}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between hover:bg-[#f6f3ee] ${currentUser?.role === 'sub_officer' ? 'bg-emerald-100 text-emerald-800' : 'text-[#1c1c19]'}`}
                  >
                    <span>💳 مسؤول الاشتراكات والماليات</span>
                  </button>

                  {/* Section: Sector Heads per Sector */}
                  <div className="border-t border-b border-[#f0ede9] py-1.5 my-1 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-black text-[#7e5713] bg-amber-50 rounded-lg flex items-center justify-between">
                      <span>⚜️ رؤساء القطاعات ({SECTOR_HEAD_USERS?.length || 9} قطاعات):</span>
                      <span className="text-[9px] opacity-80">اختر القطاع</span>
                    </div>
                    {(SECTOR_HEAD_USERS || []).map((headUser) => {
                      const isSelected = currentUser?.role === 'sector_head' && currentUser?.sector === headUser.sector;
                      return (
                        <button
                          key={headUser.id}
                          onClick={() => {
                            switchUserRole('sector_head', { sector: headUser.sector, id: headUser.id });
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-right px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-[#ffddb1] text-[#291800] font-black shadow-2xs border border-amber-300'
                              : 'text-[#1c1c19] hover:bg-[#f6f3ee]'
                          }`}
                        >
                          <span className="truncate">{headUser.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${isSelected ? 'bg-[#7e5713] text-white' : 'bg-amber-100 text-[#7e5713]'}`}>
                            {headUser.sectorName}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => { switchUserRole('leader'); setShowRoleMenu(false); }}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between hover:bg-[#f6f3ee] ${currentUser?.role === 'leader' ? 'bg-blue-100 text-blue-800' : 'text-[#1c1c19]'}`}
                  >
                    <span>⛺ قائد طليعة / جوال</span>
                  </button>
                  <button
                    onClick={() => { switchUserRole('parent'); setShowRoleMenu(false); }}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between hover:bg-[#f6f3ee] ${currentUser?.role === 'parent' ? 'bg-purple-100 text-purple-800' : 'text-[#1c1c19]'}`}
                  >
                    <span>👨‍👩‍👧 ولي أمر (متابعة الابن)</span>
                  </button>
                  <button
                    onClick={() => { switchUserRole('child'); setShowRoleMenu(false); }}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between hover:bg-[#f6f3ee] ${currentUser?.role === 'child' ? 'bg-cyan-100 text-cyan-800' : 'text-[#1c1c19]'}`}
                  >
                    <span>⚜️ كشاف / مخدوم (الكارنيه)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
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
                <span className="material-symbols-outlined text-[24px]">campaign</span>
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

            <button
              onClick={() => setShowAnnounceModal(false)}
              className="w-full py-3 rounded-xl bg-[#8b0000] text-white font-bold text-xs shadow"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      )}
    </>
  );
};
