import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useScout } from '../../context/ScoutContext';

export const Sidebar = ({ isOpenMobile, onCloseMobile, onOpenAuth }) => {
  const { currentUser, logoutUser } = useScout();
  const role = currentUser?.role || 'admin';
  const location = useLocation();
  const navigate = useNavigate();

  const menuSections = [
    {
      title: 'الإدارة والمتابعة',
      items: [
        {
          id: 'about-group',
          path: '/',
          title: 'عن مجموعة جنود المسيح',
          icon: 'fa-solid fa-church',
          roles: ['admin', 'sector_head', 'festival_leader', 'leader', 'rovers', 'child', 'parent', 'sub_officer'],
        },
        {
          id: 'member-audit-history',
          path: '/member-audit-history',
          title: 'سجل واستعلام الأعضاء الشامل',
          icon: 'fa-solid fa-magnifying-glass-chart',
          roles: ['admin', 'sector_head', 'festival_leader'],
        },
        {
          id: 'digital-card',
          path: '/digital-card',
          title: 'الكارنيه الكشفي الرقمي',
          icon: 'fa-solid fa-id-badge',
          roles: ['admin', 'sector_head', 'festival_leader', 'leader', 'rovers', 'child', 'parent', 'sub_officer'],
        },
        {
          id: 'smart-attendance',
          path: '/smart-attendance',
          title: 'تسجيل الحضور والغياب الذكي',
          icon: 'fa-solid fa-qrcode',
          roles: ['admin', 'sector_head', 'festival_leader'],
        },
        {
          id: 'finances-and-dues',
          path: '/finances-and-dues',
          title: 'الاشتراكات والماليات',
          icon: 'fa-solid fa-receipt',
          roles: ['admin', 'sub_officer', 'sector_head', 'parent', 'child'],
        },
        {
          id: 'price-list',
          path: '/price-list',
          title: 'لائحة الأسعار والتحصيل',
          icon: 'fa-solid fa-tags',
          roles: ['admin', 'sector_head', 'festival_leader', 'sub_officer', 'leader', 'parent', 'child'],
        },
        {
          id: 'parent',
          path: '/parent',
          title: 'بوابة متابعة أبنائي',
          icon: 'fa-solid fa-people-roof',
          roles: ['parent', 'admin'],
        }
      ]
    },
    {
      title: 'الأنشطة والتربية',
      items: [
        {
          id: 'detailed-programs',
          path: '/detailed-programs',
          title: 'برامج واجتماعات القطاعات والعهدة',
          icon: 'fa-solid fa-clipboard-list',
          roles: ['admin', 'sector_head', 'festival_leader', 'leader', 'rovers', 'child', 'parent', 'sub_officer'],
        },
        {
          id: 'annual-schedule',
          path: '/annual-schedule',
          title: 'خطة الأيام الكشفية والموسم السنوي',
          icon: 'fa-solid fa-calendar-days',
          roles: ['admin', 'sector_head'],
        },

        {
          id: 'bible-and-competitions',
          path: '/bible-and-competitions',
          title: 'الكتاب المقدس والمسابقات',
          icon: 'fa-solid fa-book-bible',
          roles: ['admin', 'sector_head', 'festival_leader', 'leader', 'rovers', 'child', 'parent', 'sub_officer'],
        },
        {
          id: 'care-and-visitation',
          path: '/care-and-visitation',
          title: 'إدارة وتوزيع الافتقاد (رؤساء القطاعات)',
          icon: 'fa-solid fa-users-line',
          roles: ['admin', 'sector_head'],
        },
        {
          id: 'field-visitations',
          path: '/field-visitations',
          title: 'افتفاد القادة والجوالة الميداني',
          icon: 'fa-solid fa-location-dot',
          roles: ['admin', 'sector_head', 'leader', 'rovers', 'festival_leader'],
        }
      ]
    },
    {
      title: 'العمليات واللوجستيات',
      items: [
        {
          id: 'communications-chat',
          path: '/communications-chat',
          title: 'غرف الشات والمراسلات',
          icon: 'fa-solid fa-comments',
          roles: ['admin', 'sector_head', 'festival_leader', 'leader', 'rovers', 'child', 'parent', 'sub_officer'],
        },
        {
          id: 'halls-reservation',
          path: '/halls-reservation',
          title: 'حجز وتنسيق القاعات والمقرات',
          icon: 'fa-solid fa-door-open',
          roles: ['admin', 'sector_head', 'festival_leader', 'leader', 'rovers', 'child', 'parent', 'sub_officer'],
        },
        {
          id: 'inventory-and-equipment',
          path: '/inventory-and-equipment',
          title: 'طلب العهد والمهمات والمخازن',
          icon: 'fa-solid fa-boxes-stacked',
          roles: ['admin', 'sector_head', 'festival_leader', 'leader', 'sub_officer'],
        }
      ]
    }
  ];

  const isPathActive = (itemPath) => {
    const curPath = location.pathname;
    if (itemPath === '/') {
      return curPath === '/' || curPath === '/about-group';
    }
    return curPath === itemPath || curPath.startsWith(itemPath + '/');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Scrollable Top Portion: Brand Header + Nav */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="h-[72px] px-4 flex items-center justify-between bg-[#f6f3ee] border-b border-[#e5e2dd] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="شعار مجموعة جنود المسيح"
              className="w-10 h-10 rounded-xl object-contain bg-white shadow-sm border border-[#e5e2dd] p-0.5"
            />
            <div className="flex flex-col">
              <span className="font-bold text-[#610000] text-base leading-tight">مجموعة جنود المسيح</span>
            </div>
          </div>

          {/* Close button for mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#5a403c] hover:bg-[#ebe8e3]"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="px-3 py-2 flex flex-col gap-1">
          {menuSections.map((section, idx) => {
            const visibleItems = section.items.filter(item => item.roles.includes(role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <div className="px-3 pt-3 pb-1">
                  <span className="text-[11px] font-bold text-[#8e706b] uppercase tracking-wider">
                    {section.title}
                  </span>
                </div>

                {visibleItems.map(item => {
                  const isActive = isPathActive(item.path);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right cursor-pointer ${
                        isActive
                          ? 'bg-[#8b0000] text-white shadow-[0_4px_12px_rgba(139,0,0,0.25)]'
                          : 'text-[#5a403c] hover:bg-[#ebe8e3] hover:text-[#1c1c19]'
                      }`}
                    >
                      <i className={`${item.icon.startsWith('fa-') ? item.icon : `fa-solid fa-${item.icon}`} text-[18px] w-5 text-center`}></i>
                      <span className="flex-1">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Action: Active Profile & Logout / Login Button */}
      <div className="p-3.5 border-t border-[#f0ede9] bg-[#fcf9f4] shrink-0 space-y-2">
        {role !== 'guest' ? (
          <div className="space-y-2">
            <div className="p-2.5 bg-white rounded-xl border border-[#e5e2dd] shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="w-7 h-7 rounded-full bg-amber-100 text-[#8b0000] font-black flex items-center justify-center text-xs shrink-0 border border-amber-300">
                  {currentUser.name ? currentUser.name[0] : '👤'}
                </span>
                <div className="truncate">
                  <h5 className="font-extrabold text-xs text-[#610000] truncate">{currentUser.name}</h5>
                  <p className="text-[10px] text-[#7e5713] font-bold truncate">{currentUser.email || currentUser.sectorName || 'حساب كشفي'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logoutUser();
                navigate('/');
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-[#8b0000] font-black text-xs transition border border-red-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-right-from-bracket text-[18px]"></i>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              if (onOpenAuth) onOpenAuth();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full py-3 rounded-2xl bg-[#8b0000] hover:bg-[#610000] text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer border border-amber-400/30"
          >
            <i className="fa-solid fa-right-to-bracket text-[20px]"></i>
            <span>تسجيل الدخول للكشافة</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-72 bg-[#ffffff] h-screen sticky top-0 z-30 flex-col shadow-[0_4px_24px_rgba(139,0,0,0.06)] shrink-0 border-l border-[#f0ede9] overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          ></div>

          <aside className="relative right-0 w-80 max-w-[85vw] bg-[#ffffff] h-full z-50 flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
