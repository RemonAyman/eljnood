import React, { useState, useEffect } from 'react';
import { ScoutProvider, useScout } from './context/ScoutContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthModal } from './components/auth/AuthModal';

import { GroupLanding } from './components/landing/GroupLanding';
import { Dashboard } from './components/dashboard/Dashboard';
import { DigitalCardModule } from './components/attendance/DigitalCardModule';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { SubscriptionsModule } from './components/subscriptions/SubscriptionsModule';
import { PriceListModule } from './components/subscriptions/PriceListModule';

import { BibleModule } from './components/bible/BibleModule';
import { VisitationModule } from './components/visitation/VisitationModule';
import { ChatModule } from './components/chat/ChatModule';
import { HallsReservationModule } from './components/logistics/HallsReservationModule';
import { InventoryModule } from './components/logistics/InventoryModule';
import { MemoriesModule } from './components/memories/MemoriesModule';
import { ParentPortal } from './components/parent/ParentPortal';
import { AnnualScheduleModule } from './components/schedule/AnnualScheduleModule';
import { DetailedProgramModule } from './components/schedule/DetailedProgramModule';
import { MemberAuditHistoryModule } from './components/members/MemberAuditHistoryModule';
import { LeaderFieldVisitationModule } from './components/visitation/LeaderFieldVisitationModule';

function AppContent() {
  const { currentUser } = useScout();
  const role = currentUser?.role || 'admin';

  // Default initial page is the Group Landing Page ('about-group')
  const [activeTab, setActiveTab] = useState('about-group');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Redirect unauthorized users away from restricted pages
  useEffect(() => {
    if (role === 'guest' && activeTab !== 'about-group') {
      setActiveTab('about-group');
    }

    if (role !== 'guest' && role !== 'admin' && activeTab === 'dashboard') {
      if (role === 'parent') setActiveTab('parent');
      else if (role === 'sub_officer') setActiveTab('price-list');
      else setActiveTab('annual-schedule');
    }

    if (activeTab === 'smart-attendance' && role !== 'admin' && role !== 'sector_head' && role !== 'festival_leader') {
      setActiveTab('digital-card');
    }
  }, [role, activeTab]);

  // Smooth scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const hideSidebar = role === 'guest';

  const getTabTitle = (tab) => {
    switch (tab) {
      case 'about-group': return 'عن مجموعة جنود المسيح الكشفية';
      case 'dashboard': return 'الرئيسية / لوحة القيادة';
      case 'member-audit-history': return 'سجل الاستعلام الشامل للأعضاء والقادة';
      case 'annual-schedule': return 'خطة الأيام الكشفية والموسم السنوي';
      case 'detailed-programs': return 'برامج واجتماعات القطاعات والعهد الكشفية والمعسكرات';
      case 'digital-card': return 'الكارنيه الكشفي الرقمي';
      case 'smart-attendance': return 'تسجيل الحضور والغياب الذكي';
      case 'finances-and-dues': return 'الاشتراكات والماليات';
      case 'price-list': return 'لائحة الأسعار والتحصيل الرسمية';

      case 'bible-and-competitions': return 'المسابقات الكتابية ودراسة الإنجيل';
      case 'care-and-visitation': return 'إدارة وتوزيع افتقاد المخدومين (رؤساء القطاعات)';
      case 'field-visitations': return 'التكليفات والافتقاد الميداني (القادة والجوالة)';
      case 'communications-chat': return 'غرف التواصل والإعلانات';
      case 'halls-reservation': return 'حجز وتنسيق قاعات ومقرات الخدمة';
      case 'inventory-and-equipment': return 'طلب العهد والمهمات والمخازن الكشفية';
      case 'logistics-and-inventory': return 'تنسيق قاعات ومقرات الخدمة والعهد';
      case 'memory-box-exhibitions': return 'صندوق الذكريات والأرشيف';
      case 'parent': return 'بوابة ولي الأمر';
      default: return 'عن مجموعة جنود المسيح';
    }
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'about-group':
        return (
          <GroupLanding
            onOpenAuth={() => setIsAuthOpen(true)}
            onEnterDashboard={() => setActiveTab('dashboard')}
          />
        );
      case 'dashboard':
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'member-audit-history':
        return <MemberAuditHistoryModule />;
      case 'annual-schedule':
        return <AnnualScheduleModule onNavigate={(tab) => setActiveTab(tab)} />;
      case 'detailed-programs':
        return <DetailedProgramModule defaultTab="all_programs" />;
      case 'sector-meetings':
        return <DetailedProgramModule defaultTab="sector_meetings" />;
      case 'digital-card':
        return <DigitalCardModule />;
      case 'smart-attendance':
        return <AttendanceModule />;
      case 'finances-and-dues':
        return <SubscriptionsModule />;
      case 'price-list':
        return <PriceListModule />;

      case 'bible-and-competitions':
        return <BibleModule />;
      case 'care-and-visitation':
        return <VisitationModule />;
      case 'field-visitations':
        return <LeaderFieldVisitationModule />;
      case 'communications-chat':
        return <ChatModule />;
      case 'halls-reservation':
        return <HallsReservationModule />;
      case 'inventory-and-equipment':
        return <InventoryModule />;
      case 'logistics-and-inventory':
        return <HallsReservationModule />;
      case 'memory-box-exhibitions':
        return <MemoriesModule />;
      case 'parent':
        return <ParentPortal />;
      default:
        return (
          <GroupLanding
            onOpenAuth={() => setIsAuthOpen(true)}
            onEnterDashboard={() => setActiveTab('dashboard')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fcf9f4] text-[#1c1c19] font-['Tajawal',sans-serif]">
      {/* Sidebar rendered for all authenticated members */}
      {!hideSidebar && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeTabTitle={getTabTitle(activeTab)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          hideSidebarToggle={hideSidebar}
        />

        <main className={`flex-1 bg-[#fcf9f4] overflow-x-hidden ${hideSidebar ? 'p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full' : 'p-3 sm:p-6 lg:p-8'}`}>
          {renderActiveModule()}
        </main>

        <footer className="py-6 text-center text-xs text-[#8e706b] bg-[#f6f3ee] border-t border-[#e5e2dd]">
          <div className="max-w-4xl mx-auto px-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-[#610000] font-black">
              <img src="/logo.png" alt="logo" className="w-5 h-5 object-contain" />
              <span>مجموعة جنود المسيح الكشفية</span>
            </div>
            <p>© 2026 جميع الحقوق محفوظة • جمعية ومجموعة جنود المسيح الكشفية</p>
          </div>
        </footer>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ScoutProvider>
      <AppContent />
    </ScoutProvider>
  );
}
