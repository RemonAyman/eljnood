import React, { useState, useMemo } from 'react';
import { useScout } from '../../context/ScoutContext';

export const MemberAuditHistoryModule = () => {
  const {
    members,
    subscriptions,
    attendanceScanLogs,
    excuses,
    visitations,
    SECTORS,
    currentUser
  } = useScout();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [activeTab, setActiveTab] = useState('yearly_log'); // 'yearly_log', 'finance_log', 'attendance_log', 'visitations_log'

  // Enhance members with default joined year & multi-year historical logs
  const enrichedMembers = useMemo(() => {
    return (members || []).map(m => {
      // Joined year calculation (default between 2018 and 2023 based on code/grade)
      const baseYear = m.sector === 'rovers' ? 2018 : (m.sector === 'senior_scouts' || m.sector === 'rangers' ? 2020 : (m.sector === 'scouts' || m.sector === 'guides' ? 2022 : 2024));
      const joinedYear = m.joinedYear || baseYear;
      const currentYearNum = 2026;
      const yearsActive = currentYearNum - joinedYear + 1;

      // Filter member's subscriptions
      const memberSubs = (subscriptions || []).filter(s => s.memberCode === m.code || s.memberName === m.name);
      const totalPaid = memberSubs.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
      const isFestivalRegistered = memberSubs.some(s => (s.items || []).some(item => item.includes('مهرجان') || item.includes('الكرازة'))) || m.privileges?.some(p => p.includes('مهرجان'));

      // Generate yearly activity timeline (from 2026 down to joinedYear)
      const yearlyLogs = [];
      for (let y = 2026; y >= joinedYear; y--) {
        const yearLabel = `${y}/${y + 1}`;
        let sectorInYear = m.sectorName;
        let rankInYear = m.rank || 'كشاف مجتهد';
        let achievements = [];
        let festivalStatus = y === 2026 ? (isFestivalRegistered ? 'مشترك بمهرجان الكرازة 🏆' : 'غير مسجل') : 'شارك بالحفل الختامي وحصل على الشارة';

        if (y === 2026) {
          achievements = ['أداء اختبارات الشارات بنجاح', 'حضور 14/14 اجتماع وطابور كشفي', 'المشاركة في المعسكر السنوي'];
        } else if (y === 2025) {
          achievements = ['اجتياز المستوى الأول في الريادة', 'الفوز بدرع السداسي الكشفي', 'مشاركة في مهرجان الكرازة المركز 1'];
          sectorInYear = m.sector === 'senior_scouts' ? 'الكشاف (فتيان)' : (m.sector === 'rovers' ? 'كشاف متقدم' : 'الأشبال');
        } else if (y === 2024) {
          achievements = ['تأدية قسم الوعد الكشفي الرسمي 🔴', 'حضور معسكر الإعداد القيادي في بوادي الريان'];
          sectorInYear = m.sector === 'rovers' ? 'الكشاف' : 'البراعم والأشبال';
        } else {
          achievements = ['الالتحاق بمجموعة جنود المسيح الكشفية', 'استلام المنديل الكشفي الموحد'];
        }

        yearlyLogs.push({
          year: yearLabel,
          yearNum: y,
          sector: sectorInYear,
          rank: rankInYear,
          attendanceRate: y === 2026 ? `${Math.round(((m.attendanceCount || 12) / (m.totalSessions || 14)) * 100)}%` : '95%',
          financialDues: y === 2026 ? (totalPaid > 0 ? `تم سداد ${totalPaid} ج.م` : 'لم يتم السداد') : 'سداد كامل الاشتراك',
          isPaid: y === 2026 ? totalPaid > 0 : true,
          achievements,
          festivalStatus,
        });
      }

      return {
        ...m,
        joinedYear,
        yearsActive,
        totalPaid,
        isFestivalRegistered,
        memberSubs,
        yearlyLogs,
      };
    });
  }, [members, subscriptions]);

  const isSectorHead = currentUser?.role === 'sector_head';
  const mySector = currentUser?.sector || 'scouts';

  // Filtered members list for dropdown & search
  const filteredMembers = useMemo(() => {
    return enrichedMembers.filter(m => {
      if (isSectorHead && m.sector !== mySector) return false;
      if (!isSectorHead && selectedSector !== 'all' && m.sector !== selectedSector) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (m.name || '').toLowerCase().includes(q);
        const matchCode = (m.code || '').toLowerCase().includes(q);
        const matchPhone = (m.childPhone || '' || m.parentPhone || '').includes(q);
        return matchName || matchCode || matchPhone;
      }
      return true;
    });
  }, [enrichedMembers, selectedSector, isSectorHead, mySector, searchQuery]);

  // Currently selected active member profile
  const activeMember = useMemo(() => {
    if (selectedMemberId) {
      const found = enrichedMembers.find(m => m.id === selectedMemberId || m.code === selectedMemberId);
      if (found) return found;
    }
    return filteredMembers[0] || enrichedMembers[0];
  }, [enrichedMembers, filteredMembers, selectedMemberId]);

  // Active member's scan attendance & visitations & excuses
  const activeScanLogs = useMemo(() => {
    if (!activeMember) return [];
    return (attendanceScanLogs || []).filter(l => l.memberId === activeMember.id || l.memberCode === activeMember.code);
  }, [attendanceScanLogs, activeMember]);

  const activeExcuses = useMemo(() => {
    if (!activeMember) return [];
    return (excuses || []).filter(ex => ex.sector === activeMember.sector || ex.leaderName === activeMember.name);
  }, [excuses, activeMember]);

  const activeVisitations = useMemo(() => {
    if (!activeMember) return [];
    return (visitations || []).filter(v => v.memberId === activeMember.id || v.memberName === activeMember.name);
  }, [visitations, activeMember]);

  const activeMemberLastVisit = useMemo(() => {
    if (!activeMember) return null;
    if (activeMember.lastVisitedDate) return activeMember.lastVisitedDate;
    const completedVisits = (visitations || []).filter(v => 
      (v.memberId === activeMember.id || v.memberName === activeMember.name) && (v.date || v.completedDate)
    );
    if (completedVisits.length > 0) {
      const sorted = [...completedVisits].sort((a, b) => new Date(b.date || b.completedDate) - new Date(a.date || a.completedDate));
      return sorted[0].date || sorted[0].completedDate;
    }
    return null;
  }, [activeMember, visitations]);

  return (
    <div className="space-y-6 text-right pb-12" dir="rtl">
      
      {/* Top Header Banner matching standard theme */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[32px]">manage_search</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-lg sm:text-xl text-[#610000]">
                سجل الاستعلام الشامل للأعضاء والقادة والجوالة
              </h1>
            </div>
          </div>
        </div>


      </div>

      {/* 2. Instant Search & Sector Selection Bar */}
      <div className="bg-[#fcf9f4] border border-[#e5e2dd] rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input Box */}
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute right-3 top-3 text-amber-800 text-xl">search</span>
            <input
              type="text"
              placeholder="ادخل كود العضو (1001)، الاسم، أو رقم الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-11 pl-4 py-2.5 bg-white border border-gray-300 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sector Selector Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
            <span className="text-xs font-bold text-gray-600 shrink-0 flex items-center gap-1">
              <span className="material-symbols-outlined text-amber-800 text-base">filter_list</span>
              القطاع:
            </span>
            {isSectorHead ? (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold rounded-2xl px-3 py-2">
                قطاعك: {currentUser.sectorName || mySector} 🔒
              </span>
            ) : (
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-white border border-gray-300 text-gray-800 text-xs font-extrabold rounded-2xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-700 shadow-2xs cursor-pointer"
              >
                <option value="all">جميع القطاعات والقادة</option>
                {SECTORS.map(sec => (
                  <option key={sec.id} value={sec.id}>{sec.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Member Direct Picker Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-gray-600 shrink-0">اختيار العضو:</span>
            <select
              value={activeMember?.id || ''}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="bg-white border border-amber-300 text-amber-950 font-black text-xs rounded-2xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-700 shadow-sm w-full md:w-64 cursor-pointer"
            >
              {filteredMembers.map(m => (
                <option key={m.id} value={m.id}>
                  #{m.code} - {m.name} ({m.sectorName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Master Member Profile Header Card */}
      {activeMember ? (
        <div className="bg-[#fcf9f4] border border-[#e5e2dd] hover:border-amber-400 rounded-3xl shadow-sm overflow-hidden transition space-y-6">
          
          {/* Header Strip with Member Role & Code */}
          <div className="bg-white border-b border-[#e5e2dd] p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              {/* Member Avatar */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#fcf9f4] text-[#8b0000] border-2 border-amber-300 flex items-center justify-center overflow-hidden shadow-md shrink-0">
                {activeMember.avatarUrl ? (
                  <img src={activeMember.avatarUrl} alt={activeMember.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl">person</span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-[#610000]">{activeMember.name}</h2>
                  <span className="bg-[#8b0000] text-white font-mono font-black text-xs px-3 py-0.5 rounded-full shadow">
                    #{activeMember.code}
                  </span>
                </div>
                <p className="text-[#5a403c] text-xs font-bold mt-1 flex items-center gap-2 flex-wrap">
                  <span>{activeMember.sectorName}</span>
                  <span>•</span>
                  <span>{activeMember.rank || 'عضو معتمد'}</span>
                  <span>•</span>
                  <span>{activeMember.grade || 'المرحلة الكشفية'}</span>
                  <span>•</span>
                  <span className="bg-[#f6f3ee] text-[#7e5713] px-2.5 py-0.5 rounded-full font-bold border border-[#e5e2dd]">
                    آخر افتقاد: {activeMemberLastVisit ? activeMemberLastVisit : 'لم يفتقد بعد'}
                  </span>
                </p>
              </div>
            </div>

            {/* Joined Year & Active Badge */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="bg-[#fcf9f4] border border-[#e5e2dd] px-4 py-2 rounded-2xl text-center shadow-2xs">
                <span className="text-[10px] text-gray-500 block font-bold">سنة الانضمام بالكشافة</span>
                <span className="text-base font-black text-[#8b0000] font-mono">عام {activeMember.joinedYear}</span>
              </div>
              <div className="bg-[#ffddb1]/60 border border-amber-300 text-amber-950 px-4 py-2 rounded-2xl text-center shadow-2xs">
                <span className="text-[10px] text-amber-900 block font-bold">إجمالي سنوات الخدمة</span>
                <span className="text-base font-black text-[#610000] font-mono">{activeMember.yearsActive} سنوات كشفية</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Audit Dashboard (5 Main Indicators) */}
          <div className="px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            
            {/* Metric 1: Joined Year & Service */}
            <div className="bg-white p-4 rounded-2xl border border-[#e5e2dd] shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#5a403c] font-bold">
                <span>سنوات الخدمة</span>
                <span className="material-symbols-outlined text-[#8b0000] text-lg">calendar_today</span>
              </div>
              <span className="text-base font-black text-[#1c1c19] block">انضم منذ {activeMember.yearsActive} سنوات</span>
              <span className="text-xs text-[#7e5713] font-bold block">سنة الانضمام: {activeMember.joinedYear}</span>
            </div>

            {/* Metric 2: Festival Registration Status */}
            <div className="bg-white p-4 rounded-2xl border border-[#e5e2dd] shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#5a403c]">
                <span>المهرجان 2026</span>
                <span className="material-symbols-outlined text-amber-700 text-lg">emoji_events</span>
              </div>
              <span className={`text-sm font-black block ${activeMember.isFestivalRegistered ? 'text-emerald-800' : 'text-[#8b0000]'}`}>
                {activeMember.isFestivalRegistered ? 'مشترك بالمهرجان' : 'غير مشترك حالياً'}
              </span>
              <span className="text-xs text-[#5a403c] font-bold block">
                {activeMember.isFestivalRegistered ? 'مسابقات الكرازة' : 'يمكن التسديد'}
              </span>
            </div>

            {/* Metric 3: Financial Status & Payments */}
            <div className="bg-white p-4 rounded-2xl border border-[#e5e2dd] shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#5a403c]">
                <span>الموقف المالي</span>
                <span className="material-symbols-outlined text-blue-700 text-lg">receipt_long</span>
              </div>
              <span className={`text-sm font-black block ${activeMember.totalPaid > 0 ? 'text-emerald-800' : 'text-[#8b0000]'}`}>
                {activeMember.totalPaid > 0 ? `سداد ${activeMember.totalPaid} ج.م` : 'لم يقم بالسداد'}
              </span>
              <span className="text-xs text-[#5a403c] font-bold block">
                الإيصالات: {activeMember.memberSubs.length} إيصال
              </span>
            </div>

            {/* Metric 4: Attendance & Discipline */}
            <div className="bg-white p-4 rounded-2xl border border-[#e5e2dd] shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#5a403c] font-bold">
                <span>الحضور والإنضباط</span>
                <span className="material-symbols-outlined text-amber-700 text-lg">verified</span>
              </div>
              <span className="text-base font-black text-[#1c1c19] block">
                {Math.round(((activeMember.attendanceCount || 12) / (activeMember.totalSessions || 14)) * 100)}% انضباط
              </span>
              <span className="text-xs text-emerald-800 font-bold block">
                {activeMember.attendanceCount || 12} من {activeMember.totalSessions || 14} يوم
              </span>
            </div>

            {/* Metric 5: Last Visitation Date */}
            <div className="bg-white p-4 rounded-2xl border border-[#e5e2dd] shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#5a403c] font-bold">
                <span>آخر تاريخ افتقاد</span>
                <span className="material-symbols-outlined text-purple-700 text-lg">home_pin</span>
              </div>
              <span className="text-sm font-black text-[#1c1c19] block font-mono">
                {activeMemberLastVisit ? activeMemberLastVisit : 'لم يفتقد بعد'}
              </span>
              <span className="text-xs text-[#7e5713] font-bold block">
                {activeMemberLastVisit ? 'تم الافتقاد والتقرير' : 'في انتظار الافتقاد'}
              </span>
            </div>
          </div>

          {/* Detailed Tabs Control Header */}
          <div className="px-6 pt-2">
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3 text-xs font-bold">
              <button
                onClick={() => setActiveTab('yearly_log')}
                className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-2 ${
                  activeTab === 'yearly_log'
                    ? 'bg-[#8b0000] text-white shadow-md font-black'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <span className="material-symbols-outlined text-base">view_timeline</span>
                السجل الأرشيفي التراكمي لكل سنة ({activeMember.yearlyLogs.length} سنوات)
              </button>

              <button
                onClick={() => setActiveTab('finance_log')}
                className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-2 ${
                  activeTab === 'finance_log'
                    ? 'bg-[#8b0000] text-white shadow-md font-black'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <span className="material-symbols-outlined text-base">payments</span>
                سجل المدفوعات والإيصالات ({activeMember.memberSubs.length})
              </button>

              <button
                onClick={() => setActiveTab('attendance_log')}
                className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-2 ${
                  activeTab === 'attendance_log'
                    ? 'bg-[#8b0000] text-white shadow-md font-black'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                سجل الحضور والغياب الذكي ({activeScanLogs.length})
              </button>

              <button
                onClick={() => setActiveTab('visitations_log')}
                className={`px-4 py-2.5 rounded-2xl transition flex items-center gap-2 ${
                  activeTab === 'visitations_log'
                    ? 'bg-[#8b0000] text-white shadow-md font-black'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <span className="material-symbols-outlined text-base">diversity_1</span>
                سجل الافتقاد والأعذار ({activeVisitations.length + activeExcuses.length})
              </button>
            </div>
          </div>

          {/* Content Area per Tab */}
          <div className="px-6 pb-6 space-y-4">
            
            {/* TAB 1: YEARLY TIMELINE LOG (سجل لكل سنة عمل ايه فيها) */}
            {activeTab === 'yearly_log' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-base text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-800">auto_stories</span>
                  السجل التراكمي لكل سنة خدمها العضو بالمجموعة الكشفية:
                </h3>

                <div className="relative border-r-2 border-amber-700/30 mr-4 pr-6 space-y-6">
                  {activeMember.yearlyLogs.map((log, idx) => (
                    <div key={idx} className="relative bg-white border border-gray-200 hover:border-amber-400 rounded-3xl p-5 shadow-sm space-y-3 transition">
                      {/* Timeline Dot Indicator */}
                      <span className="absolute -right-[33px] top-6 w-5 h-5 rounded-full bg-amber-700 border-4 border-white shadow-md"></span>

                      {/* Top Bar per Year */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="bg-[#8b0000] text-white font-mono font-black text-xs px-3 py-1 rounded-xl shadow-2xs">
                            موسم {log.year}
                          </span>
                          <h4 className="font-extrabold text-base text-gray-900">
                            القطاع: {log.sector} ({log.rank})
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
                            {log.festivalStatus}
                          </span>
                          <span className={`px-3 py-1 rounded-full border ${log.isPaid ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-red-100 text-red-900 border-red-300'}`}>
                            {log.financialDues}
                          </span>
                        </div>
                      </div>

                      {/* Yearly Achievements & Activities List */}
                      <div className="space-y-2">
                        <span className="text-xs font-extrabold text-gray-700 block">🏆 الأنشطة والإنجازات والشارات المحققة بهذا العام:</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {log.achievements.map((ach, aIdx) => (
                            <div key={aIdx} className="bg-amber-50/60 border border-amber-200/80 p-2.5 rounded-2xl text-xs font-semibold text-gray-800 flex items-center gap-2">
                              <span className="material-symbols-outlined text-amber-800 text-base">verified</span>
                              <span>{ach}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: FINANCIAL PAYMENTS & RECEIPTS (سجل السداد والاشتراكات) */}
            {activeTab === 'finance_log' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-base text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-800">receipt_long</span>
                  بيان الإيصالات والمدفوعات الصادرة للعضو:
                </h3>

                {activeMember.memberSubs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeMember.memberSubs.map((sub) => (
                      <div key={sub.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-3">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                          <span className="font-mono font-black text-xs text-[#8b0000]">{sub.id}</span>
                          <span className="text-xs font-bold text-gray-500">📅 {sub.date}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-bold text-gray-600 block">البنود المسددة:</span>
                          <div className="flex flex-wrap gap-1">
                            {(sub.items || []).map((it, iIdx) => (
                              <span key={iIdx} className="bg-amber-100 text-amber-900 font-bold text-[11px] px-2.5 py-0.5 rounded-full border border-amber-200">
                                {it}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-200 text-xs pt-2">
                          <div>
                            <span className="text-gray-500 block text-[10px]">مسؤول التحصيل:</span>
                            <span className="font-bold text-gray-800">{sub.officerName || 'مسؤول الاشتراكات'}</span>
                          </div>
                          <div className="text-left">
                            <span className="text-gray-500 block text-[10px]">المبلغ الإجمالي المسدد:</span>
                            <span className="text-base font-black text-emerald-700 font-mono">{sub.total} ج.م</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center text-gray-500">
                    لا توجد إيصالات سداد مسجلة بهذا الاسم حتى الآن.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SMART ATTENDANCE SCAN LOGS */}
            {activeTab === 'attendance_log' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-base text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-800">qr_code_scanner</span>
                  سجل سحب البصمة والحضور الذكي:
                </h3>

                {activeScanLogs.length > 0 ? (
                  <div className="space-y-2">
                    {activeScanLogs.map((log) => (
                      <div key={log.id} className="bg-white border border-gray-200 p-3.5 rounded-2xl flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                          </span>
                          <div>
                            <span className="font-bold text-gray-800 block text-sm">{log.dayLabel || log.date}</span>
                            <span className="text-gray-500 text-xs">الساعة: {log.time} | مسجل بواسطة: {log.scannedBy}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full font-bold text-[11px] ${log.isFestival ? 'bg-purple-100 text-purple-900 border border-purple-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'}`}>
                          {log.isFestival ? 'مهرجان الكرازة 🏆' : 'حضور كشفي أسبوعي'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center text-gray-500">
                    لم يتم تسجيل غياب أو حضور بالكود لهذه الفترة.
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: VISITATIONS & EXCUSES LOG */}
            {activeTab === 'visitations_log' && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-base text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-800">diversity_1</span>
                  سجلات الافتقاد وأعذار الغياب المعتمدة:
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Visitations */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-gray-700">سجل افتقاد القادة للعضو:</h4>
                    {activeVisitations.length > 0 ? (
                      activeVisitations.map((vis) => (
                        <div key={vis.id} className="bg-white border border-gray-200 p-4 rounded-2xl space-y-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-amber-900">{vis.type}</span>
                            <span className="text-gray-400">{vis.date}</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{vis.notes}</p>
                          <span className="text-[10px] text-gray-500 block pt-1">بواسطة: {vis.leaderName}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">لا توجد سجلات افتقاد سابقة.</p>
                    )}
                  </div>

                  {/* Excuses */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-gray-700">سجل الأعذار المقدمة:</h4>
                    {activeExcuses.length > 0 ? (
                      activeExcuses.map((ex) => (
                        <div key={ex.id} className="bg-white border border-gray-200 p-4 rounded-2xl space-y-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-800">تاريخ العذر: {ex.date}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ex.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {ex.statusLabel || ex.status}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{ex.reason}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">لا توجد أعذار غياب مقدمة.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#fcf9f4] border border-[#e5e2dd] rounded-3xl p-12 text-center text-gray-500 space-y-3">
          <span className="material-symbols-outlined text-6xl text-amber-700/40">search_off</span>
          <h3 className="text-lg font-bold text-gray-700">لم يتم العثور على عضو بهذا الاسم أو الكود</h3>
          <p className="text-sm text-gray-500">تأكد من كتابة الكود الصحيح أو اختبر إلغاء فلتر القطاع.</p>
        </div>
      )}
    </div>
  );
};

export default MemberAuditHistoryModule;
