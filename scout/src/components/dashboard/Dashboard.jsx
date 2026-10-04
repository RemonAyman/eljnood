import React, { useState } from 'react';
import { useScout } from '../../context/ScoutContext';

export const Dashboard = ({ onNavigate }) => {
  const { members, excuses, updateExcuseStatus, logActivity } = useScout();
  const [activeAuditFilter, setActiveAuditFilter] = useState('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [pinInput, setPinInput] = useState('JNOOD-D10..D90');

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    logActivity(`بث تعميم عاجل للكشافة: ${broadcastMessage.trim()}`);
    alert('تم بث التعميم العاجل إلى جميع تطبيقات الأعضاء وأولياء الأمور بنجاح!');
    setBroadcastMessage('');
    setShowBroadcastModal(false);
  };

  const handleExportPDFReport = () => {
    logActivity('تصدير تقرير القيادة والسيطرة الشامل (PDF)');
    alert('جاري إعداد وتوليد التقرير الرقابي الشامل لجميع الأنشطة والاشتراكات بصيغة PDF عالية الجودة...');
  };

  const auditLogEntries = [
    {
      id: 'a1',
      user: 'القائد بيتر يوسف',
      roleTitle: 'أمين الصندوق المركزي',
      type: 'financial',
      action: 'تحصيل اشتراك سنوي (350 ج.م)',
      codeRef: 'كود JS-2026-104',
      sector: 'فرقة الفتيان (متقدم)',
      time: 'منذ دقيقتين',
      status: 'ناجح',
      statusBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      ip: '192.168.1.45',
    },
    {
      id: 'a2',
      user: 'القائد مينا نبيل',
      roleTitle: 'مسؤول الحضور الميداني',
      type: 'attendance',
      action: 'تسجيل حضور ذكي بالباركود (طابور الجمعة)',
      codeRef: 'طابور الصباح',
      sector: 'فرقة الكشاف الأول',
      time: 'منذ 8 دقائق',
      status: 'ناجح',
      statusBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      ip: '192.168.1.22',
    },
    {
      id: 'a3',
      user: 'القائدة مارينا سامح',
      roleTitle: 'سكرتارية شؤون العضوية',
      type: 'printing',
      action: 'إرسال أمر طباعة 15 كارنيه بلاستيكي ملون',
      codeRef: 'طابعة Zebra',
      sector: 'مرحلة الزهرات',
      time: 'منذ 14 دقيقة',
      status: 'قيد التشغيل',
      statusBg: 'bg-amber-100 text-amber-900 border-amber-300',
      ip: '192.168.1.18',
    },
    {
      id: 'a4',
      user: 'القائد جورج نادر',
      roleTitle: 'مسؤول الافتقاد الأسبوعي',
      type: 'visitation',
      action: 'تسجيل زيارة منزلية رعية لمخدوم غائب',
      codeRef: 'افتثاد ميداني',
      sector: 'طليعة النسر (أشبال)',
      time: 'منذ 25 دقيقة',
      status: 'مكتمل',
      statusBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      ip: '192.168.1.30',
    },
    {
      id: 'a5',
      user: 'أمين العهدة أستاذ رفيق',
      roleTitle: 'مسؤول مخازن التخييم',
      type: 'inventory',
      action: 'اعتماد طلب استعارة خيمة سداسية وحبال ريادية',
      codeRef: 'عهدة المخازن',
      sector: 'عمدة المخازن الكشفية',
      time: 'منذ 40 دقيقة',
      status: 'معتمد',
      statusBg: 'bg-purple-100 text-purple-900 border-purple-300',
      ip: '192.168.1.12',
    },
  ];

  const filteredLogs = auditLogEntries.filter(log => {
    const matchType = activeAuditFilter === 'all' || log.type === activeAuditFilter;
    const matchSearch = auditSearchQuery === '' || 
      log.user.includes(auditSearchQuery) || 
      log.action.includes(auditSearchQuery) || 
      log.sector.includes(auditSearchQuery);
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Top Header Action Strip matching Image 3 */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[26px] sm:text-[32px]">church</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-lg sm:text-xl text-[#610000]">الصفحة الرئيسية</h1>
            </div>
            <p className="text-xs text-[#5a403c] mt-1 font-bold">
              لوحة القيادة والسيطرة والرقابة الإدارية المباشرة
            </p>
          </div>
        </div>

        {/* Toolbar Buttons - Grid on mobile, Flex on desktop */}
        <div className="grid grid-cols-1 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full md:w-auto">
          <button
            onClick={handleExportPDFReport}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#8b0000] hover:bg-[#610000] text-white px-4 py-2.5 rounded-2xl sm:rounded-full text-xs font-extrabold shadow-md transition border border-amber-400/40 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            <span>تصدير تقرير شامل PDF</span>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#f6f3ee] hover:bg-[#ebe8e3] text-[#5a403c] px-3.5 py-2.5 rounded-2xl sm:rounded-full text-xs font-bold border border-[#e5e2dd] transition active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
            <span>تحديث الصفحة</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards Row matching Image 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-white rounded-3xl p-5 border border-[#e5e2dd] shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5a403c]">إجمالي الأعضاء والمخدومين</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#7e5713] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">groups</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#610000]">1,248</span>
            <span className="text-xs font-bold text-[#7e5713]">كشاف ومخدوم</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#5a403c] border-t pt-2">
            <span>من 61% حتى خريجين وجوالة</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">+8.4% نمو</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white rounded-3xl p-5 border border-[#e5e2dd] shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5a403c]">نسبة الانضباط والحضور العام</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#610000]">94.2%</span>
            <span className="px-2 py-0.5 rounded bg-amber-200 text-slate-950 font-black text-[10px]">علامة الامتياز</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#5a403c] border-t pt-2">
            <span>معدل حضور طابور الصباح والمخيمات</span>
            <span className="font-bold text-emerald-700">ممتاز جداً</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white rounded-3xl p-5 border border-[#e5e2dd] shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5a403c]">إجمالي الإيرادات والتحصيلات</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#7e5713] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#8b0000]">384,500</span>
            <span className="text-xs font-bold text-[#5a403c]">ج.م</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#5a403c] border-t pt-2">
            <span>سداد 88% من اشتراكات الكشافة</span>
            <span className="font-bold text-[#8b0000]">نشط ورصين</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white rounded-3xl p-5 border border-[#e5e2dd] shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5a403c]">القادة والجوالة النشطين</span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">military_tech</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#610000]">86</span>
            <span className="text-xs font-bold text-[#7e5713]">قائد ومساعد</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#5a403c] border-t pt-2">
            <span>موزعين على 8 قطاعات كشفية</span>
            <span className="font-bold text-purple-800">جاهزية كاملة</span>
          </div>
        </div>
      </div>

      {/* 3. Live Audit Log Table */}
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e5e2dd] shadow-sm space-y-4">
            
            {/* Table Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <h3 className="font-black text-base text-[#610000] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[24px] text-[#8b0000]">admin_panel_settings</span>
                  سجل النشاط المباشر والرقابة الإدارية
                </h3>
                <p className="text-xs text-[#5a403c] mt-0.5">
                  تدقيق لحظي لجميع تحركات القادة، الخزينة، وإجراءات الباركود
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span className="text-xs font-bold text-[#1c1c19]">أخر مزامنة: الآن</span>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'financial', label: 'ماليات' },
                  { id: 'attendance', label: 'حضور وغياب' },
                  { id: 'printing', label: 'طباعة كارنيهات' },
                  { id: 'visitation', label: 'افتقاد وعهد' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAuditFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      activeAuditFilter === tab.id
                        ? 'bg-[#8b0000] text-white shadow-sm'
                        : 'bg-[#f6f3ee] text-[#5a403c] hover:bg-[#ebe8e3]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="بحث باسم المستخدم أو الكود..."
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  className="w-full bg-[#f6f3ee] text-[#1c1c19] text-xs font-bold rounded-xl py-2 pr-9 pl-3 border border-[#e5e2dd] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                />
                <span className="material-symbols-outlined absolute right-2.5 top-2 text-[#8e706b] text-[18px]">
                  search
                </span>
              </div>
            </div>

            {/* Mobile Cards View (Visible on Mobile < 640px) */}
            <div className="block sm:hidden space-y-3">
              {filteredLogs.map(log => (
                <div key={log.id} className="p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-2.5">
                  <div className="flex items-start justify-between gap-2 border-b border-[#e5e2dd] pb-2">
                    <div>
                      <h4 className="font-extrabold text-[#610000] text-sm">{log.user}</h4>
                      <span className="text-[11px] text-[#5a403c] font-bold">{log.roleTitle}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] border shrink-0 ${log.statusBg}`}>
                      {log.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-[#1c1c19] text-xs block leading-snug">{log.action}</span>
                    <span className="text-[11px] text-[#7e5713] font-mono block">{log.codeRef}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#5a403c] pt-1 border-t border-[#f0ede9]">
                    <span className="font-bold text-[#5a403c] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-[#7e5713]">shield</span>
                      {log.sector}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">{log.ip}</span>
                      <span>•</span>
                      <span className="font-bold text-[#8b0000]">{log.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (Visible on Tablet/Desktop >= 640px) */}
            <div className="hidden sm:block overflow-x-auto border border-[#e5e2dd] rounded-2xl">
              <table className="w-full min-w-[680px] text-right text-xs">
                <thead className="bg-[#f6f3ee] text-[#5a403c] font-black border-b border-[#e5e2dd]">
                  <tr>
                    <th className="p-3.5">المستخدم والصفة</th>
                    <th className="p-3.5">نوع الإجراء والبيان</th>
                    <th className="p-3.5">الفرقة / القطاع</th>
                    <th className="p-3.5">التوقيت</th>
                    <th className="p-3.5 text-center">الحالة والـ IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ede9] text-[#1c1c19]">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-[#fcf9f4] transition">
                      <td className="p-3.5">
                        <h4 className="font-extrabold text-[#610000]">{log.user}</h4>
                        <span className="text-[10px] text-[#5a403c] block">{log.roleTitle}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-[#1c1c19] block">{log.action}</span>
                        <span className="text-[10px] text-[#7e5713] font-mono">{log.codeRef}</span>
                      </td>
                      <td className="p-3.5 font-bold text-[#5a403c]">{log.sector}</td>
                      <td className="p-3.5 text-[#5a403c]">{log.time}</td>
                      <td className="p-3.5 text-center space-y-1">
                        <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] border block ${log.statusBg}`}>
                          {log.status}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono block">{log.ip}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Strip matching Image 3 */}
            <div className="flex items-center justify-between text-xs text-[#5a403c] pt-2 flex-wrap gap-2">
              <span>عرض 5 من إجمالي 184 عملية مسجلة اليوم</span>
              <div className="flex items-center gap-1 font-bold">
                <button className="w-7 h-7 rounded-lg bg-[#8b0000] text-white flex items-center justify-center text-xs">1</button>
                <button className="w-7 h-7 rounded-lg bg-[#f6f3ee] hover:bg-[#ebe8e3] text-[#1c1c19] flex items-center justify-center text-xs">2</button>
                <button className="w-7 h-7 rounded-lg bg-[#f6f3ee] hover:bg-[#ebe8e3] text-[#1c1c19] flex items-center justify-center text-xs">3</button>
                <button className="w-7 h-7 rounded-lg bg-[#f6f3ee] hover:bg-[#ebe8e3] text-[#1c1c19] flex items-center justify-center text-xs">›</button>
              </div>
            </div>
          </div>
        </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#e5e2dd] shadow-2xl relative space-y-4">
            <button onClick={() => setShowBroadcastModal(false)} className="absolute top-4 left-4 text-[#5a403c]">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-extrabold text-base text-[#610000] flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-[#8b0000]">emergency_share</span>
              إرسال بث تنبيهي عاجل لجميع التطبيقات
            </h3>
            <form onSubmit={handleBroadcast} className="space-y-3">
              <textarea
                required
                rows="4"
                placeholder="اكتب رسالة التنبيه العاجل هنا..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#f6f3ee] border border-[#e5e2dd] text-xs text-[#1c1c19] focus:outline-none focus:border-[#8b0000]"
              ></textarea>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#8b0000] hover:bg-[#610000] text-white font-bold text-xs shadow transition"
              >
                إرسال البث الفوري الآن ➔
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
