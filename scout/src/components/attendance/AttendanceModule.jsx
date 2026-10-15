import React, { useState, useMemo } from 'react';
import { useScout } from '../../context/ScoutContext';

export const AttendanceModule = () => {
  const {
    currentUser,
    members,
    attendanceScanLogs,
    recordScanAttendance,
    markAttendance,
    logActivity,
    SECTORS,
  } = useScout();

  const isAdmin = currentUser?.role === 'admin';
  const isFestivalLeader = currentUser?.role === 'festival_leader';
  const isSectorHead = currentUser?.role === 'sector_head';
  const mySector = currentUser?.sector || 'cubs';
  const sectorName = currentUser?.sectorName || 'الأشبال';

  // Admin Sector Filter State ('all' or specific sector ID)
  const [adminSelectedSector, setAdminSelectedSector] = useState(isSectorHead ? mySector : 'all');
  
  // Categorization Filter State for Sector Head / Sector View ('all', 'served', 'leaders', 'rovers')
  const [sectorCategoryTab, setSectorCategoryTab] = useState('all');

  // Navigation tabs: 'stream', 'by_date', 'by_sector', 'festival'
  const [activeTab, setActiveTab] = useState(isFestivalLeader ? 'festival' : 'stream');
  
  // Quick Code / Member Scanner State
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [selectedMemberSelect, setSelectedMemberSelect] = useState('');
  const [latestScanCard, setLatestScanCard] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [parsedData, setParsedData] = useState(null);

  // Date expansion state: key is date YYYY-MM-DD -> boolean
  const [expandedDays, setExpandedDays] = useState({});

  // Active sector tab for Sector view
  const [selectedSectorTab, setSelectedSectorTab] = useState(isSectorHead ? mySector : 'cubs');

  // Active effective sector filter for logs & views
  const effectiveSectorFilter = isSectorHead ? mySector : adminSelectedSector;

  // Toggle expand/collapse for a specific day
  const toggleExpandDay = (dateStr) => {
    setExpandedDays(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
  };

  // Perform Scan / Submit Code
  const handleScanSubmit = (codeToSubmit, isFestival = false) => {
    const targetCode = (codeToSubmit || qrCodeInput).trim();
    if (!targetCode) return;

    const foundMember = members.find(m => m.code === targetCode || m.id === targetCode || m.name.includes(targetCode));

    if (!foundMember) {
      alert(`الكود #${targetCode} غير مسجل بالنظام`);
      return;
    }

    // Record Scan Attendance with Timestamp
    const newLogEntry = recordScanAttendance(foundMember.code, new Date().toISOString().substring(0, 10), isFestival || isFestivalLeader);

    if (newLogEntry) {
      setLatestScanCard(newLogEntry);
      setSuccessMsg(`تم تسجيل حضور الكشاف: ${foundMember.name} (${foundMember.sectorName}) - الساعة ${newLogEntry.time}`);
      setQrCodeInput('');
      setSelectedMemberSelect('');
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  // Handle Manual Code Form Submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleScanSubmit(qrCodeInput, isFestivalLeader);
  };

  // Filter logs by effective sector filter
  const filteredScanLogs = useMemo(() => {
    let logs = attendanceScanLogs || [];
    if (effectiveSectorFilter !== 'all') {
      logs = logs.filter(l => l.sector === effectiveSectorFilter);
    }
    return logs;
  }, [attendanceScanLogs, effectiveSectorFilter]);

  // Group Attendance Logs by Date (YYYY-MM-DD)
  const groupedLogsByDate = useMemo(() => {
    const map = {};
    (filteredScanLogs || []).forEach(log => {
      const key = log.date || '2026-09-25';
      if (!map[key]) {
        map[key] = {
          date: key,
          dayLabel: log.dayLabel || key,
          logs: [],
        };
      }
      map[key].logs.push(log);
    });
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredScanLogs]);

  // Sector Members calculation
  const currentTargetSector = isSectorHead ? mySector : selectedSectorTab;

  const membersBySelectedSector = useMemo(() => {
    return (members || []).filter(m => m.sector === currentTargetSector || (isAdmin && currentTargetSector === 'all'));
  }, [members, currentTargetSector, isAdmin]);

  // Categorize members into served, leaders, and rovers
  const servedMembers = useMemo(() => {
    return membersBySelectedSector.filter(m => 
      m.sector !== 'leaders' && m.sector !== 'rovers' && m.role !== 'leader' && m.role !== 'rover' && !m.rank?.includes('قائد')
    );
  }, [membersBySelectedSector]);

  const leadersMembers = useMemo(() => {
    return (members || []).filter(m => 
      (m.sector === currentTargetSector || currentTargetSector === 'all') && 
      (m.sector === 'leaders' || m.role === 'leader' || m.role === 'sector_head' || m.rank?.includes('قائد') || m.grade?.includes('قائد'))
    );
  }, [members, currentTargetSector]);

  const roversMembers = useMemo(() => {
    return (members || []).filter(m => 
      (m.sector === currentTargetSector || currentTargetSector === 'all') && 
      (m.sector === 'rovers' || m.role === 'rover' || m.grade?.includes('جامعة') || m.grade?.includes('خريج'))
    );
  }, [members, currentTargetSector]);

  const displayMembersList = useMemo(() => {
    if (sectorCategoryTab === 'served') return servedMembers;
    if (sectorCategoryTab === 'leaders') return leadersMembers;
    if (sectorCategoryTab === 'rovers') return roversMembers;
    return membersBySelectedSector;
  }, [sectorCategoryTab, servedMembers, leadersMembers, roversMembers, membersBySelectedSector]);

  // Festival-only logs
  const festivalLogs = useMemo(() => {
    return (attendanceScanLogs || []).filter(log => log.isFestival);
  }, [attendanceScanLogs]);

  // Upload Fingerprint Sheet Simulation
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      logActivity(`رفع شيت غياب البصمة الآلي: ${file.name}`);
      setParsedData({
        fileName: file.name,
        count: Math.floor(Math.random() * 12) + 18,
      });
    }
  };

  const confirmFingerprintAttendance = () => {
    logActivity('اعتماد حضور شيت البصمة المرفوع بنجاح');
    alert(`تم اعتماد وتأكيد حضور ${parsedData.count} كشاف من ملف البصمة وتسجيلهم في سجلات اليوم!`);
    setParsedData(null);
  };

  const canViewFestivalTab = isAdmin || isFestivalLeader;

  const availableNavTabs = useMemo(() => {
    const list = [
      { id: 'stream', label: 'البث المباشر والكود السريع', icon: 'fa-solid fa-bolt' },
      { id: 'by_date', label: 'كشوف الغياب اليومية', icon: 'fa-solid fa-calendar-days', badge: groupedLogsByDate.length },
    ];

    if (canViewFestivalTab) {
      list.push({
        id: 'festival',
        label: 'غياب أيام المهرجان العام',
        icon: 'fa-solid fa-trophy',
        badge: festivalLogs.length,
        highlight: isFestivalLeader,
      });
    }

    list.push({
      id: 'by_sector',
      label: 'كشوف غياب القطاعات والفرق',
      icon: 'fa-solid fa-building-columns',
      badge: SECTORS.length,
    });

    return list;
  }, [canViewFestivalTab, groupedLogsByDate.length, festivalLogs.length, isFestivalLeader, SECTORS.length]);

  return (
    <div className="space-y-6">

      {/* 1. Header Banner with Role & Mode Badges */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${isFestivalLeader ? 'bg-[#7e5713]' : 'bg-[#8b0000]'} text-white flex items-center justify-center font-bold shrink-0 shadow-md`}>
            <i className={`fa-solid ${isFestivalLeader ? 'fa-trophy' : 'fa-qrcode'} text-[28px]`}></i>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-lg sm:text-xl text-[#610000]">تسجيل الحضور والغياب الذكي</h1>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs Bar */}
      <div className="bg-white p-2 rounded-2xl border border-[#e5e2dd] shadow-2xs flex items-center gap-2 overflow-x-auto">
        {availableNavTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? tab.highlight
                  ? 'bg-[#7e5713] text-white shadow-md'
                  : 'bg-[#8b0000] text-white shadow-md'
                : 'bg-[#f6f3ee] text-[#5a403c] hover:bg-[#ebe8e3]'
            }`}
          >
            <i className={`${tab.icon} text-[16px]`}></i>
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-black ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#ffddb1] text-[#291800]'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Admin Sector Selection Filter Toolbar */}
      {isAdmin && (
        <div className="bg-white p-4 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-filter text-[#8b0000]"></i>
            <span className="text-xs font-black text-[#610000]">تحديد قطاع العرض والغياب:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
            <button
              onClick={() => setAdminSelectedSector('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition shrink-0 cursor-pointer ${
                adminSelectedSector === 'all'
                  ? 'bg-[#8b0000] text-white shadow-sm'
                  : 'bg-[#f6f3ee] text-[#5a403c] border border-[#e5e2dd] hover:bg-[#ebe8e3]'
              }`}
            >
              جميع القطاعات ⚜️
            </button>

            {SECTORS.map(sec => (
              <button
                key={sec.id}
                onClick={() => setAdminSelectedSector(sec.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition shrink-0 cursor-pointer ${
                  adminSelectedSector === sec.id
                    ? 'bg-[#8b0000] text-white shadow-sm'
                    : 'bg-[#f6f3ee] text-[#5a403c] border border-[#e5e2dd] hover:bg-[#ebe8e3]'
                }`}
              >
                {sec.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sector Head Info Banner */}
      {isSectorHead && (
        <div className="bg-white p-3.5 px-5 rounded-3xl border border-[#e5e2dd] shadow-2xs flex items-center justify-between gap-2 text-xs font-bold text-[#610000]">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-user-shield text-[#8b0000]"></i>
            <span>حساب رئيس القطاع: ({sectorName}) — يتم عرض أعضاء وكروت غياب قطاعك فقط تلقائياً.</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#ffddb1] text-[#291800] text-[11px] font-black">
            {filteredScanLogs.length} سجل ممسوح بالقطاع
          </span>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 1: LIVE SCANNER & RECENT CARDS FEED                             */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'stream' && (
        <div className="space-y-6">
          {/* Scanner Workstation Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Visual Camera Scanner Simulator */}
            <div className="h-64 rounded-3xl bg-[#090d16] border-2 border-dashed border-[#8b0000] flex flex-col items-center justify-center text-white relative overflow-hidden p-5 shadow-inner">
              <div className="w-20 h-20 rounded-full border-2 border-[#ffddb1] border-t-transparent animate-spin mb-3 flex items-center justify-center">
                <i className="fa-solid fa-expand text-amber-300 text-3xl"></i>
              </div>
              <span className="text-xs font-black text-amber-300">كاميرا المسح الضوئي المباشرة نشطة (HD)</span>
              <span className="text-[10px] text-slate-400 mt-1">
                {isFestivalLeader ? 'نموذج مسح المهرجان: متاح لجميع القطاعات' : `نموذج مسح الخدمة: ${sectorName}`}
              </span>

              {/* Quick Preset Selector inside camera simulator */}
              <div className="mt-4 w-full max-w-xs">
                <select
                  value={selectedMemberSelect}
                  onChange={(e) => {
                    setSelectedMemberSelect(e.target.value);
                    if (e.target.value) handleScanSubmit(e.target.value, isFestivalLeader);
                  }}
                  className="w-full bg-slate-900 border border-amber-400/40 text-amber-200 text-xs font-bold rounded-xl p-2 text-center focus:outline-none cursor-pointer"
                >
                  <option value="">-- اختر عضواً لتجربة السكان المباشر --</option>
                  {(members || [])
                    .filter(m => !isSectorHead || m.sector === mySector)
                    .map(m => (
                    <option key={m.id} value={m.code}>
                      #{m.code} - {m.name} ({m.sectorName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Manual Form & Feedback Card */}
            <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-extrabold text-sm text-[#610000] flex items-center gap-2">
                    <i className="fa-solid fa-user-check text-[#8b0000]"></i>
                    <span>محطة الإدخال السريع بالباركود</span>
                  </h3>
                  <span className="text-[10px] font-bold text-[#7e5713] bg-[#ffddb1] px-2.5 py-0.5 rounded-full">
                    {isFestivalLeader ? 'وضع المهرجان' : 'وضع القطاع'}
                  </span>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#5a403c] mb-1.5">
                      أدخل كود الكشاف أو الرقم الكشفي:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="مثال: 1001 أو 1003"
                        value={qrCodeInput}
                        onChange={(e) => setQrCodeInput(e.target.value)}
                        className="w-full pr-10 pl-3.5 py-3 rounded-2xl bg-[#f6f3ee] border border-[#e5e2dd] text-sm font-mono font-black focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                      />
                      <i className="fa-solid fa-id-badge absolute right-3 top-3 text-[#8e706b]"></i>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3.5 rounded-2xl ${isFestivalLeader ? 'bg-[#7e5713] hover:bg-[#5a403c]' : 'bg-[#8b0000] hover:bg-[#610000]'} text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer`}
                  >
                    <i className="fa-solid fa-user-check text-[20px]"></i>
                    <span>تسجيل حضور الفرد ورصد التوقيت</span>
                  </button>
                </form>
              </div>

              {successMsg && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <i className="fa-solid fa-circle-check text-emerald-700"></i>
                  <span>{successMsg}</span>
                </div>
              )}
            </div>
          </div>

          {/* Latest Scanned Card Detailed Display (If Available) */}
          {latestScanCard && (
            <div className="p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-md space-y-3 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="text-xs font-black text-[#610000] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
                  <span>الكارت الممسوح آلياً الآن في المحطة:</span>
                </span>
                <span className="px-3 py-0.5 rounded-full bg-[#8b0000] text-white text-[11px] font-mono font-black">
                  ⏰ الساعة {latestScanCard.time}
                </span>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-14 h-14 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-black text-xl shrink-0 shadow">
                  {latestScanCard.memberName.charAt(0)}
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-base text-[#1c1c19]">{latestScanCard.memberName}</h3>
                    <span className="font-mono font-black text-xs text-[#8b0000]">#{latestScanCard.memberCode}</span>
                  </div>
                  <p className="text-xs text-[#5a403c] font-bold">
                    الصف: {latestScanCard.grade} • القطاع: <span className="text-[#8b0000] font-black">{latestScanCard.sectorName}</span>
                  </p>
                </div>
                <div className="text-left font-bold text-xs space-y-1">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 block text-center">
                    حضور مؤكد ✓
                  </span>
                  <span className="text-[10px] text-[#7e5713] block">بواسطة: {latestScanCard.scannedBy}</span>
                </div>
              </div>
            </div>
          )}

          {/* Stream Feed of All Scanned Cards */}
          <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-[#610000] flex items-center gap-2">
                <i className="fa-solid fa-stream text-[#8b0000]"></i>
                <span>سجل الكروت الممسوحة مباشرة اليوم (الساعة والدقيقة)</span>
              </h3>
              <span className="text-xs font-bold text-[#7e5713]">
                {filteredScanLogs.length} كارت ممسوح
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(filteredScanLogs || []).map(log => (
                <div key={log.id} className="p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-2.5 relative hover:border-[#8b0000] transition">
                  <div className="flex items-center justify-between border-b border-[#e5e2dd] pb-2">
                    <span className="font-mono font-black text-xs text-[#8b0000]">#{log.memberCode}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-black text-[11px] flex items-center gap-1">
                      <i className="fa-solid fa-clock text-[14px]"></i>
                      <span>{log.time}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-[#1c1c19]">{log.memberName}</h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[#5a403c] font-bold">
                      <span className="px-2 py-0.5 rounded bg-[#ffddb1] text-[#291800]">{log.sectorName}</span>
                      <span>•</span>
                      <span>{log.grade}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#f0ede9] text-[10px] text-[#8e706b] font-bold">
                    <span>التاريخ: {log.date}</span>
                    {log.isFestival && (
                      <span className="px-2 py-0.2 rounded bg-amber-200 text-amber-950 font-black">المهرجان 🏆</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 2: GROUPED BY DAY (3 PREVIEW CARDS + EXPAND BUTTON PER DAY)     */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'by_date' && (
        <div className="space-y-6">

          <div className="space-y-6">
            {groupedLogsByDate.map(dayGroup => {
              const dateKey = dayGroup.date;
              const isExpanded = !!expandedDays[dateKey];
              const totalLogs = dayGroup.logs.length;
              const visibleLogs = isExpanded ? dayGroup.logs : dayGroup.logs.slice(0, 3);
              const hiddenCount = totalLogs - 3;

              return (
                <div key={dateKey} className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-4">
                  {/* Day Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#8b0000] text-white flex items-center justify-center font-bold shadow-2xs">
                        <i className="fa-solid fa-calendar-days text-[22px]"></i>
                      </div>
                      <div>
                        <h3 className="font-black text-sm sm:text-base text-[#610000]">{dayGroup.dayLabel}</h3>
                        <span className="text-[11px] text-[#5a403c] font-bold">التاريخ الرسمي: {dateKey}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-300">
                        إجمالي الحاضرين: {totalLogs} كشاف
                      </span>
                    </div>
                  </div>

                  {/* Day Members List Grid (3 Preview or All) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {visibleLogs.map(log => (
                      <div key={log.id} className="p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-2 relative">
                        <div className="flex items-center justify-between border-b pb-1.5">
                          <span className="font-mono font-black text-xs text-[#8b0000]">#{log.memberCode}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-black text-[11px] flex items-center gap-1">
                            <i className="fa-solid fa-clock text-[14px]"></i>
                            <span>الساعة {log.time}</span>
                          </span>
                        </div>

                        <div>
                          <h4 className="font-black text-sm text-[#1c1c19]">{log.memberName}</h4>
                          <p className="text-[11px] text-[#5a403c] font-bold mt-0.5">
                            القطاع: <span className="text-[#8b0000] font-black">{log.sectorName}</span> • {log.grade}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[#8e706b] pt-1.5 border-t border-[#f0ede9]">
                          <span>بواسطة: {log.scannedBy}</span>
                          {log.isFestival && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 font-black">المهرجان</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expand / Collapse Button for this Day */}
                  {totalLogs > 3 && (
                    <div className="pt-2 text-center border-t border-[#f0ede9]">
                      <button
                        onClick={() => toggleExpandDay(dateKey)}
                        className={`px-6 py-2.5 rounded-2xl font-black text-xs transition flex items-center justify-center gap-2 mx-auto cursor-pointer ${
                          isExpanded
                            ? 'bg-[#f6f3ee] text-[#8b0000] border border-[#e5e2dd] hover:bg-[#ebe8e3]'
                            : 'bg-[#8b0000] text-white shadow-md hover:bg-[#610000]'
                        }`}
                      >
                        <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-[18px]`}></i>
                        <span>
                          {isExpanded
                            ? `طي كشف يوم (${dayGroup.dayLabel}) - إظهار 3 أعضاء فقط`
                            : `عرض كافة الحاضرين لهذا اليوم (+${hiddenCount} عضو إضافي) ➔`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 3: FESTIVAL DAYS ATTENDANCE (ADMIN & FESTIVAL LEADER ONLY)    */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'festival' && canViewFestivalTab && (
        <div className="space-y-6">
          <div className="bg-amber-100 p-5 rounded-3xl border border-amber-400 space-y-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#7e5713] text-white flex items-center justify-center font-black shrink-0">
                <i className="fa-solid fa-trophy text-2xl"></i>
              </div>
              <div>
                <h3 className="font-black text-base text-amber-950">منظومة غياب وتفقد أيام المهرجان الكشفي العام</h3>
                <p className="text-xs text-amber-900 font-bold">
                  خاصة بقائد المهرجان والخدام - متاح فيها مسح ورصد حضور جميع القطاعات معاً في وقت واحد
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-[#610000] flex items-center gap-2">
                <i className="fa-solid fa-medal text-[#7e5713]"></i>
                <span>كشف غياب المهرجان (جميع القطاعات)</span>
              </h3>
              <span className="px-3 py-1 rounded-full bg-amber-200 text-amber-950 text-xs font-black">
                {festivalLogs.length} مسجل بالمهرجان
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {festivalLogs.map(log => (
                <div key={log.id} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                    <span className="font-mono font-black text-xs text-[#8b0000]">#{log.memberCode}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-950 font-mono font-black text-[11px] flex items-center gap-1">
                      <i className="fa-solid fa-clock text-[14px]"></i>
                      <span>الساعة {log.time}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-[#1c1c19]">{log.memberName}</h4>
                    <p className="text-[11px] text-[#5a403c] font-bold mt-0.5">
                      القطاع: <span className="text-[#8b0000] font-black">{log.sectorName}</span> • {log.grade}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#7e5713] pt-1.5 border-t border-amber-200 font-bold">
                    <span>بواسطة: {log.scannedBy}</span>
                    <span>{log.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}



      {/* ------------------------------------------------------------------- */}
      {/* TAB 4: SECTOR MEMBERS & CATEGORIZED OVERVIEW                        */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'by_sector' && (
        <div className="space-y-6">
          {/* Sector selection tabstrip (For Admin / Sector Head Overview) */}
          {!isSectorHead && (
            <div className="bg-white p-4 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-[#7e5713] flex items-center gap-1">
                <i className="fa-solid fa-building-columns text-[18px]"></i>
                <span>حدد القطاع لمعاينة أعضائه وحضورهم:</span>
              </h4>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {SECTORS.map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSectorTab(sec.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition shrink-0 cursor-pointer ${
                      selectedSectorTab === sec.id
                        ? 'bg-[#8b0000] text-white shadow'
                        : 'bg-[#f6f3ee] text-[#5a403c] hover:bg-[#ebe8e3]'
                    }`}
                  >
                    {sec.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Members Categorization Toolbar (Served / Leaders / Rovers) */}
          <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-[#610000] flex items-center gap-2">
                  <i className="fa-solid fa-users text-[#8b0000]"></i>
                  <span>كشوف غياب وأعضاء قطاع ({isSectorHead ? sectorName : (SECTORS.find(s => s.id === selectedSectorTab)?.name || 'جميع القطاعات')})</span>
                </h3>
                <p className="text-xs text-[#5a403c] font-bold mt-1">
                  عرض الأعضاء مقسمين حسب الفئات الكشفية (مخدومين، قادة القطاع، والجوالة)
                </p>
              </div>

              {/* Categorization Tabs: All, Served, Leaders, Rovers */}
              <div className="flex items-center gap-1.5 bg-[#f6f3ee] p-1.5 rounded-2xl border border-[#e5e2dd] shrink-0 overflow-x-auto">
                <button
                  onClick={() => setSectorCategoryTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    sectorCategoryTab === 'all' ? 'bg-[#8b0000] text-white shadow' : 'text-[#5a403c] hover:bg-white'
                  }`}
                >
                  الكل ({membersBySelectedSector.length})
                </button>
                <button
                  onClick={() => setSectorCategoryTab('served')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    sectorCategoryTab === 'served' ? 'bg-[#8b0000] text-white shadow' : 'text-[#5a403c] hover:bg-white'
                  }`}
                >
                  🌿 المخدومين ({servedMembers.length})
                </button>
                <button
                  onClick={() => setSectorCategoryTab('leaders')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    sectorCategoryTab === 'leaders' ? 'bg-[#8b0000] text-white shadow' : 'text-[#5a403c] hover:bg-white'
                  }`}
                >
                  ⚜️ القادة ({leadersMembers.length})
                </button>
                <button
                  onClick={() => setSectorCategoryTab('rovers')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    sectorCategoryTab === 'rovers' ? 'bg-[#8b0000] text-white shadow' : 'text-[#5a403c] hover:bg-white'
                  }`}
                >
                  🏃‍♂️ الجوالة ({roversMembers.length})
                </button>
              </div>
            </div>

            {/* Categorized Member Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayMembersList.map(m => {
                const isLeader = m.sector === 'leaders' || m.role === 'leader' || m.rank?.includes('قائد');
                const isRover = m.sector === 'rovers' || m.role === 'rover' || m.grade?.includes('جامعة') || m.grade?.includes('خريج');

                return (
                  <div key={m.id} className="p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-3 flex flex-col justify-between hover:border-amber-400 transition">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-xs text-[#8b0000]">#{m.code}</span>
                        {isLeader ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#8b0000] text-white font-black text-[10px]">
                            ⚜️ قائد
                          </span>
                        ) : isRover ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 font-black text-[10px] border border-amber-400">
                            🏃‍♂️ جوالة
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[10px] border border-emerald-300">
                            🌿 مخدوم
                          </span>
                        )}
                      </div>

                      <h4 className="font-black text-sm text-[#1c1c19]">{m.name}</h4>
                      <p className="text-xs text-[#5a403c] font-bold">
                        الصف: {m.grade || 'كشفي'} • الرتبة: {m.rank || (isLeader ? 'قائد' : isRover ? 'جوال' : 'كشاف')}
                      </p>
                      
                      {m.lastAttendanceDate && (
                        <p className="text-[11px] text-[#7e5713] font-bold flex items-center gap-1">
                          <i className="fa-solid fa-clock text-[14px]"></i>
                          <span>آخر حضور: {m.lastAttendanceDate}</span>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleScanSubmit(m.code, isFestivalLeader)}
                      className="w-full py-2 bg-[#8b0000] hover:bg-[#610000] text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <i className="fa-solid fa-user-check text-[16px]"></i>
                      <span>تسجيل حضور الفرد الآن</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fingerprint Machine Upload Section */}
      <div className="bg-white rounded-3xl p-5 border border-[#e5e2dd] shadow-sm space-y-3">
        <h3 className="font-black text-sm text-[#610000] flex items-center gap-2 border-b pb-3">
          <i className="fa-solid fa-file-arrow-up text-[22px] text-[#7e5713]"></i>
          <span>رفع شيت غياب البصمة (ZKTeco Fingerprint Machine)</span>
        </h3>

        <div className="border-2 border-dashed border-[#e5e2dd] hover:border-[#8b0000] rounded-2xl p-6 text-center bg-[#fcf9f4] transition">
          <i className="fa-solid fa-cloud-arrow-up text-4xl text-[#8b0000] mb-2"></i>
          <h4 className="text-xs font-bold text-[#1c1c19]">اسحب ملف البصمة وأسقطه هنا، أو اضغط للتصفح</h4>
          <p className="text-[11px] text-[#5a403c] mt-0.5">يدعم صيغ CSV, XLSX, ZKTeco logs</p>
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileUpload}
            className="mt-3 block mx-auto text-xs text-[#5a403c]"
          />
        </div>

        {parsedData && (
          <div className="p-4 bg-[#ffddb1] rounded-2xl border border-[#7e5713]/30 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#291800]">تم استخراج {parsedData.count} كشافة من الملف ({parsedData.fileName})</h4>
              <p className="text-[11px] text-[#7e5713]">جاهز للمطابقة الميدانية وتسجيل الحضور</p>
            </div>
            <button
              onClick={confirmFingerprintAttendance}
              className="px-4 py-2 rounded-xl bg-[#8b0000] text-white font-bold text-xs shadow hover:bg-[#610000]"
            >
              اعتماد الحضور
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
