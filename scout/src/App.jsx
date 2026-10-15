import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ScoutProvider, useScout } from './context/ScoutContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthModal } from './components/auth/AuthModal';

// Lazy load page modules for optimized performance & code splitting
const GroupLanding = lazy(() => import('./components/landing/GroupLanding').then(m => ({ default: m.GroupLanding })));
const DigitalCardModule = lazy(() => import('./components/attendance/DigitalCardModule').then(m => ({ default: m.DigitalCardModule })));
const AttendanceModule = lazy(() => import('./components/attendance/AttendanceModule').then(m => ({ default: m.AttendanceModule })));
const SubscriptionsModule = lazy(() => import('./components/subscriptions/SubscriptionsModule').then(m => ({ default: m.SubscriptionsModule })));
const PriceListModule = lazy(() => import('./components/subscriptions/PriceListModule').then(m => ({ default: m.PriceListModule })));
const BibleModule = lazy(() => import('./components/bible/BibleModule').then(m => ({ default: m.BibleModule })));
const VisitationModule = lazy(() => import('./components/visitation/VisitationModule').then(m => ({ default: m.VisitationModule })));
const ChatModule = lazy(() => import('./components/chat/ChatModule').then(m => ({ default: m.ChatModule })));
const HallsReservationModule = lazy(() => import('./components/logistics/HallsReservationModule').then(m => ({ default: m.HallsReservationModule })));
const InventoryModule = lazy(() => import('./components/logistics/InventoryModule').then(m => ({ default: m.InventoryModule })));
const MemoriesModule = lazy(() => import('./components/memories/MemoriesModule').then(m => ({ default: m.MemoriesModule })));
const ParentPortal = lazy(() => import('./components/parent/ParentPortal').then(m => ({ default: m.ParentPortal })));
const AnnualScheduleModule = lazy(() => import('./components/schedule/AnnualScheduleModule').then(m => ({ default: m.AnnualScheduleModule })));
const DetailedProgramModule = lazy(() => import('./components/schedule/DetailedProgramModule').then(m => ({ default: m.DetailedProgramModule })));
const MemberAuditHistoryModule = lazy(() => import('./components/members/MemberAuditHistoryModule').then(m => ({ default: m.MemberAuditHistoryModule })));
const LeaderFieldVisitationModule = lazy(() => import('./components/visitation/LeaderFieldVisitationModule').then(m => ({ default: m.LeaderFieldVisitationModule })));

function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-4">
      <div className="w-10 h-10 rounded-full border-4 border-[#8b0000] border-t-transparent animate-spin"></div>
      <p className="text-xs font-black text-[#610000]">جاري تحميل الصفحة الكشفية...</p>
    </div>
  );
}

function AppContent() {
  const { currentUser } = useScout();
  const role = currentUser?.role || 'admin';
  const location = useLocation();
  const navigate = useNavigate();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Redirect unauthorized users away from restricted pages
  useEffect(() => {
    const path = location.pathname;

    if (role === 'guest' && path !== '/' && path !== '/about-group') {
      navigate('/', { replace: true });
    } else if (path === '/annual-schedule' && role !== 'admin' && role !== 'sector_head') {
      navigate('/', { replace: true });
    } else if (path === '/smart-attendance' && role !== 'admin' && role !== 'sector_head' && role !== 'festival_leader') {
      navigate('/digital-card', { replace: true });
    }
  }, [role, location.pathname, navigate]);

  // Smooth scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const hideSidebar = role === 'guest';

  const handleNavigate = (targetPath) => {
    const cleanPath = targetPath.startsWith('/') ? targetPath : '/' + targetPath;
    navigate(cleanPath);
  };

  return (
    <div className="min-h-screen flex bg-[#fcf9f4] text-[#1c1c19] font-['Tajawal',sans-serif]">
      {/* Sidebar rendered for all authenticated members */}
      {!hideSidebar && (
        <Sidebar
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          hideSidebarToggle={hideSidebar}
        />

        <main className={`flex-1 bg-[#fcf9f4] overflow-x-hidden ${hideSidebar ? 'p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full' : 'p-3 sm:p-6 lg:p-8'}`}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<GroupLanding onOpenAuth={() => setIsAuthOpen(true)} />} />
              <Route path="/about-group" element={<GroupLanding onOpenAuth={() => setIsAuthOpen(true)} />} />
              <Route path="/member-audit-history" element={<MemberAuditHistoryModule />} />
              <Route path="/annual-schedule" element={<AnnualScheduleModule onNavigate={handleNavigate} />} />
              <Route path="/detailed-programs" element={<DetailedProgramModule defaultTab="all_programs" />} />
              <Route path="/sector-meetings" element={<DetailedProgramModule defaultTab="sector_meetings" />} />
              <Route path="/digital-card" element={<DigitalCardModule />} />
              <Route path="/smart-attendance" element={<AttendanceModule />} />
              <Route path="/finances-and-dues" element={<SubscriptionsModule />} />
              <Route path="/price-list" element={<PriceListModule />} />
              <Route path="/bible-and-competitions" element={<BibleModule />} />
              <Route path="/care-and-visitation" element={<VisitationModule />} />
              <Route path="/field-visitations" element={<LeaderFieldVisitationModule />} />
              <Route path="/communications-chat" element={<ChatModule />} />
              <Route path="/halls-reservation" element={<HallsReservationModule />} />
              <Route path="/inventory-and-equipment" element={<InventoryModule />} />
              <Route path="/logistics-and-inventory" element={<HallsReservationModule />} />
              <Route path="/memory-box-exhibitions" element={<MemoriesModule />} />
              <Route path="/parent" element={<ParentPortal />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
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

import { ConfirmProvider } from './context/ConfirmContext';

export default function App() {
  return (
    <ScoutProvider>
      <ConfirmProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ConfirmProvider>
    </ScoutProvider>
  );
}
