import React from 'react';
import { useScout } from '../../context/ScoutContext';

export const Sidebar = ({ activeTab, setActiveTab, isOpenMobile, onCloseMobile, onOpenAuth }) => {
  const { currentUser } = useScout();
  const role = currentUser?.role || 'admin';

  const menuSections = [
    {
      title: 'الإدارة والمتابعة',
      items: [
        {
          id: 'about-group',
          title: 'عن مجموعة جنود المسيح',
          icon: 'church',
          roles: ['admin', 'sector_head', 'festival_leader', 'leader', 'rovers', 'child', 'parent', 'sub_officer'],
        },
        {
          id: 'dashboard',
          title: 'الرئيسية / لوحة القيادة',
          icon: 'grid_view',
          roles: ['admin'],
        },
        {
          id: 'member-audit-history',
          title: 'سجل واستعلام الأعضاء الشامل',
          icon: 'manage_search',
          roles: ['admin', 'sector_head', 'festival_leader'],
        },
        {
          id: 'digital-card',
          title: 'الكارنيه الكشفي الرقمي',
          icon: 'badge',
          roles: ['admin', 'sector_head', 'festival_leader', 'leader', 'rovers', 'child', 'parent', 'sub_officer'],
        },
        {
          id: 'smart-attendance',
          title: 'تسجيل الحضور والغياب الذكي',
          icon: 'qr_code_scanner',
          roles: ['admin', 'sector_head', 'festival_leader'],
        },
        {
          id: 'finances-and-dues',
          title: 'الاشتراكات والماليات',
          icon: 'receipt_long',
          roles: ['admin', 'sub_officer', 'sector_head', 'parent', 'child'],
        },
        {
          id: 'price-list',
          title: 'لائحة الأسعار والتحصيل',
          icon: 'sell',
          roles: ['admin', 'sector_head', 'festival_leader', 'sub_officer', 'leader', 'parent', 'child'],
        },
        {
          id: 'parent',
          title: 'بوابة متابعة أبنائي 👨‍👩‍👧',
          icon: 'family_restroom',
          roles: ['parent', 'admin'],
        }
      ]
    },
    {
      title: 'الأنشطة والتربية',
      items: [
        {
          id: 'annual-schedule',
          title: 'خطة الأيام الكشفية والموسم السنوي',
          icon: 'calendar_month',
          roles: ['admin', 'sector_head', 'festival_leader', 'leader', 'rovers', 'child', 'parent', 'sub_officer'],
        },
        {
          id: 'detailed-programs',
          title: 'برامج واجتماعات القطاعات والعهدة',
          icon: 'assignment',
          roles: ['admin', 'sector_head', 'festival_leader', 'leader', 'rovers', 'child', 'parent', 'sub_officer'],
        },

        {
          id: 'bible-and-competitions',
          title: 'الكتاب المقدس والمسابقات',
          icon: 'auto_stories',
          roles: ['admin', 'sector_head', 'festival_leader', 'leader', 'rovers', 'child', 'parent', 'sub_officer'],
        },
        {
          id: 'care-and-visitation',
          title: 'إدارة وتوزيع الافتقاد (رؤساء القطاعات)',
          icon: 'diversity_1',
          roles: ['admin', 'sector_head'],
        },
        {
          id: 'field-visitations',
          title: 'افتفاد القادة والجوالة الميداني',
          icon: 'home_pin',
          roles: ['admin', 'sector_head', 'leader', 'rovers', 'festival_leader'],
        }
      ]
    },
    {
      title: 'العمليات واللوجستيات',
      items: [
        {
          id: 'communications-chat',
          title: 'غرف الشات والمراسلات',
          icon: 'forum',
          roles: ['admin', 'sector_head', 'festival_leader', 'leader', 'rovers', 'child', 'parent', 'sub_officer'],
        },
        {
          id: 'halls-reservation',
          title: 'حجز وتنسيق القاعات والمقرات',
          icon: 'meeting_room',
          roles: ['admin', 'sector_head', 'festival_leader', 'leader', 'rovers', 'child', 'parent', 'sub_officer'],
        },
        {
          id: 'inventory-and-equipment',
          title: 'طلب العهد والمهمات والمخازن',
          icon: 'inventory_2',
          roles: ['admin', 'sector_head', 'festival_leader', 'leader', 'sub_officer'],
        }
      ]
    }
  ];

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
              <span className="material-symbols-outlined text-xl">close</span>
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
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right ${
                        isActive
                          ? 'bg-[#8b0000] text-white shadow-[0_4px_12px_rgba(139,0,0,0.25)]'
                          : 'text-[#5a403c] hover:bg-[#ebe8e3] hover:text-[#1c1c19]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span className="flex-1">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Action: Instant Registration Button pinned at the bottom */}
      <div className="p-4 border-t border-[#f0ede9] bg-[#fcf9f4] shrink-0">
        <button
          onClick={() => {
            if (onOpenAuth) onOpenAuth();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full py-3 rounded-2xl bg-[#8b0000] hover:bg-[#610000] text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer border border-amber-400/30"
        >
          <span className="material-symbols-outlined text-[20px]">add_task</span>
          <span>تسجيل فوري</span>
        </button>
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
