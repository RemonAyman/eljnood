import React, { useState, useMemo } from 'react';
import { useScout } from '../../context/ScoutContext';

export const VisitationModule = () => {
  const {
    currentUser,
    members,
    visitations,
    visitationAssignments,
    assignVisitationTask,
    SECTORS
  } = useScout();

  const isSectorHead = currentUser?.role === 'sector_head';
  const mySector = currentUser?.sector || 'cubs';
  const sectorName = currentUser?.sectorName || 'قطاع الأشبال';

  const [selectedSectorFilter, setSelectedSectorFilter] = useState(isSectorHead ? mySector : 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visitationStatusFilter, setVisitationStatusFilter] = useState('all'); // 'all', 'completed', 'pending', 'urgent'

  // Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    memberId: '',
    assignedToName: 'القائد كيرلس جرجس',
    assignedRole: 'leader',
    visitationType: 'زيارة منزلية',
    targetDate: new Date().toISOString().substring(0, 10),
    instructions: ''
  });

  // 1. FILTER ONLY SERVED MEMBERS (مخدومين فقط - استبعاد القادة والجوالة من شيت المخدومين)
  const servedMembers = useMemo(() => {
    return members.filter(m => m.sector !== 'leaders' && m.sector !== 'rovers');
  }, [members]);

  // List of Leaders & Rovers available for assignment (القادة والجوالة المكلفون بالتوزيع)
  const availableLeadersAndRovers = useMemo(() => {
    return members.filter(m => m.sector === 'leaders' || m.sector === 'rovers' || m.role === 'leader' || m.role === 'sector_head');
  }, [members]);

  // Filter served members by sector & search
  const filteredServedMembers = useMemo(() => {
    return servedMembers.filter(m => {
      const targetSector = isSectorHead ? mySector : selectedSectorFilter;
      if (targetSector !== 'all' && m.sector !== targetSector) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        return m.name.toLowerCase().includes(q) || m.code.includes(q) || (m.childPhone || '').includes(q);
      }
      return true;
    });
  }, [servedMembers, isSectorHead, mySector, selectedSectorFilter, searchQuery]);

  // Combine members with their visitation stats & latest assignment
  const memberAuditCards = useMemo(() => {
    return filteredServedMembers.map(m => {
      // Find all completed visits for this member
      const memberVisits = (visitations || []).filter(v => v.memberId === m.id || v.memberName === m.name);
      // Find latest assignment task
      const latestTask = (visitationAssignments || []).find(t => t.memberId === m.id || t.memberCode === m.code);

      const visitCount = memberVisits.length;
      const lastVisit = memberVisits[0] || null;
      const isCompleted = latestTask ? latestTask.status === 'completed' : visitCount > 0;
      const isPending = latestTask ? latestTask.status === 'pending' : visitCount === 0;

      // Calculate days elapsed since last visit
      const lastVisitDateStr = lastVisit?.date || latestTask?.completedDate || null;
      let daysSinceLastVisit = 999;
      if (lastVisitDateStr) {
        const lastDate = new Date(lastVisitDateStr);
        const now = new Date();
        const diffTime = Math.abs(now - lastDate);
        daysSinceLastVisit = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }

      const isOverdue30 = daysSinceLastVisit >= 30 || visitCount === 0;

      return {
        ...m,
        visitCount,
        lastVisit,
        latestTask,
        isCompleted,
        isPending,
        daysSinceLastVisit,
        isOverdue30,
      };
    }).filter(card => {
      if (visitationStatusFilter === 'completed') return card.isCompleted;
      if (visitationStatusFilter === 'pending') return card.isPending;
      if (visitationStatusFilter === 'overdue') return card.isOverdue30;
      return true;
    });
  }, [filteredServedMembers, visitations, visitationAssignments, visitationStatusFilter]);

  // Metrics
  const totalServed = servedMembers.length;
  const totalCompleted = memberAuditCards.filter(c => c.isCompleted).length;
  const totalPending = memberAuditCards.filter(c => c.isPending).length;
  const totalOverdue = useMemo(() => {
    return servedMembers.filter(m => {
      const vList = (visitations || []).filter(v => v.memberId === m.id || v.memberName === m.name);
      if (vList.length === 0) return true;
      const last = vList[0];
      if (!last || !last.date) return true;
      const diff = Math.floor(Math.abs(new Date() - new Date(last.date)) / (1000 * 60 * 60 * 24));
      return diff >= 30;
    }).length;
  }, [servedMembers, visitations]);

  const coveragePercent = totalServed > 0 ? Math.round((totalCompleted / totalServed) * 100) : 0;

  const handleOpenAssignModal = (member = null) => {
    setAssignForm({
      memberId: member ? member.id : (filteredServedMembers[0]?.id || ''),
      assignedToName: availableLeadersAndRovers[0]?.name || 'القائد كيرلس جرجس',
      assignedRole: 'leader',
      visitationType: 'زيارة منزلية',
      targetDate: new Date().toISOString().substring(0, 10),
      instructions: ''
    });
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    const targetMember = servedMembers.find(m => m.id === assignForm.memberId);
    if (!targetMember) return;

    assignVisitationTask({
      memberId: targetMember.id,
      memberName: targetMember.name,
      memberCode: targetMember.code,
      sector: targetMember.sector,
      sectorName: targetMember.sectorName,
      assignedToName: assignForm.assignedToName,
      assignedRole: assignForm.assignedRole,
      visitationType: assignForm.visitationType,
      targetDate: assignForm.targetDate,
      instructions: assignForm.instructions,
    });

    setIsAssignModalOpen(false);
    alert(`تم توزيع وتكليف القائد/الجوال (${assignForm.assignedToName}) بافتقاد العضو (${targetMember.name}) بنجاح!`);
  };

  return (
    <div className="space-y-6 text-right pb-10" dir="rtl">
      
      {/* 1. Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <i className="fa-solid fa-users-line text-[32px]"></i>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-lg sm:text-xl text-[#610000]">
                إدارة وتقسيم الافتقاد وتقارير المخدومين
              </h1>
              <span className="bg-[#ffddb1] text-[#291800] text-xs px-2.5 py-0.5 rounded-full font-black border border-amber-300">
                لوحة الإشراف والتوزيع ⚜️
              </span>
              <span className="bg-emerald-100 text-emerald-900 text-xs px-2.5 py-0.5 rounded-full font-black border border-emerald-300">
                خاص بالمخدومين فقط 🌿
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleOpenAssignModal(null)}
            className="px-4 py-2.5 bg-[#8b0000] hover:bg-[#610000] text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-user-plus text-[18px]"></i>
            <span>توزيع وتكليف بافتقاد عضو 👥</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metrics Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-[#e5e2dd] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold block">إجمالي المخدومين بالقطاعات</span>
            <span className="text-2xl font-black text-[#8b0000]">{totalServed} عضو</span>
            <span className="text-[10px] text-gray-500 block font-bold">مخدومين فقط (دون القادة)</span>
          </div>
          <i className="fa-solid fa-child text-3xl text-amber-800"></i>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-[#e5e2dd] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold block">نسبة تغطية الافتقاد</span>
            <span className="text-2xl font-black text-emerald-700">{coveragePercent}%</span>
            <span className="text-[10px] text-emerald-700 block font-bold">{totalCompleted} مخدوم تم افتقادهم</span>
          </div>
          <i className="fa-solid fa-circle-check text-3xl text-emerald-700"></i>
        </div>

        <div className="p-4 bg-rose-50 rounded-3xl border border-rose-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-rose-800 font-bold block">🚨 متأخرين عن الافتقاد (&gt; 30 يوم)</span>
            <span className="text-2xl font-black text-rose-900">{totalOverdue} مخدوم</span>
            <span className="text-[10px] text-rose-700 block font-bold">تتطلب زيارة عاجلة فورية</span>
          </div>
          <i className="fa-solid fa-triangle-exclamation text-3xl text-rose-700 animate-pulse"></i>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-[#e5e2dd] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold block">القادة والجوالة النشطين</span>
            <span className="text-2xl font-black text-sky-800">{availableLeadersAndRovers.length}</span>
            <span className="text-[10px] text-sky-700 block font-bold">يقومون بالزيارات الميدانية</span>
          </div>
          <i className="fa-solid fa-users text-3xl text-sky-800"></i>
        </div>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="bg-[#fcf9f4] border border-[#e5e2dd] rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Served Member */}
          <div className="relative w-full md:w-80">
            <i className="fa-solid fa-magnifying-glass absolute right-3 top-3 text-amber-800 text-lg"></i>
            <input
              type="text"
              placeholder="بحث باسم المخدوم، الكود، أو رقم الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-white border border-gray-300 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 shadow-2xs"
            />
          </div>

          {/* Sector Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
            <span className="text-xs font-bold text-gray-600 shrink-0">القطاع الكشفي:</span>
            <select
              value={selectedSectorFilter}
              onChange={(e) => setSelectedSectorFilter(e.target.value)}
              className="bg-white border border-gray-300 text-gray-800 text-xs font-extrabold rounded-2xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-amber-700 shadow-2xs cursor-pointer"
            >
              <option value="all">جميع قطاعات المخدومين</option>
              {SECTORS.filter(s => s.id !== 'leaders' && s.id !== 'rovers').map(sec => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setVisitationStatusFilter('all')}
              className={`px-3.5 py-2 rounded-2xl transition ${
                visitationStatusFilter === 'all'
                  ? 'bg-[#8b0000] text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              الكل ({filteredServedMembers.length})
            </button>

            <button
              onClick={() => setVisitationStatusFilter('completed')}
              className={`px-3.5 py-2 rounded-2xl transition ${
                visitationStatusFilter === 'completed'
                  ? 'bg-emerald-700 text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              تم الافتقاد ✅
            </button>
            <button
              onClick={() => setVisitationStatusFilter('pending')}
              className={`px-3.5 py-2 rounded-2xl transition ${
                visitationStatusFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              في الانتظار ⏳
            </button>
          </div>
        </div>
      </div>

      {/* 4. Served Members Master Visitation Table/Cards List */}
      <div className="space-y-4">
        {memberAuditCards.length === 0 ? (
          <div className="bg-[#fcf9f4] border border-[#e5e2dd] rounded-3xl p-12 text-center text-gray-500 space-y-3">
            <i className="fa-solid fa-magnifying-glass-minus text-6xl text-amber-700/40"></i>
            <h3 className="text-lg font-bold text-gray-700">لا يوجد مخدومين متطابقين مع الفلتر الحالي</h3>
          </div>
        ) : (
          memberAuditCards.map((card) => {
            const isCompleted = card.isCompleted;
            const isOverdue = card.isOverdue30;

            return (
              <div
                key={card.id}
                className={`bg-[#fcf9f4] border rounded-3xl shadow-sm p-5 space-y-4 transition ${
                  isOverdue
                    ? 'border-rose-400 bg-rose-50/20 shadow-rose-100 ring-2 ring-rose-500/20'
                    : 'border-[#e5e2dd] hover:border-amber-400'
                }`}
              >
                {/* Header Row: Member Info + Overdue Warning + Status Badge + Action Button */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-amber-300 flex items-center justify-center font-black text-amber-900 overflow-hidden shrink-0 shadow-2xs">
                      {card.avatarUrl ? (
                        <img src={card.avatarUrl} alt={card.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg">{card.name.charAt(0)}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-300">
                          {card.sectorName}
                        </span>
                        <span className="text-xs font-mono font-black text-amber-800">#{card.code}</span>
                        {isOverdue && (
                          <span className="bg-rose-600 text-white text-[11px] font-black px-3 py-0.5 rounded-full border border-rose-700 shadow-sm flex items-center gap-1 animate-pulse">
                            <i className="fa-solid fa-triangle-exclamation text-xs"></i>
                            🚨 متأخر عن الافتقاد (&gt; 30 يوم!)
                          </span>
                        )}
                      </div>
                      <h3 className="font-black text-lg text-gray-900 mt-0.5">{card.name}</h3>
                      <p className="text-xs text-gray-500 font-bold">
                        📞 هاتف المخدوم: {card.childPhone || 'غير مسجل'} | هاتف ولي الأمر: {card.parentPhone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      <i className={`${isCompleted ? 'fa-solid fa-circle-check text-emerald-600' : 'fa-solid fa-hourglass-start text-amber-600'} text-sm`}></i>
                      {isCompleted ? 'تم الافتقاد ✅' : 'في انتظار الافتقاد ⏳'}
                    </span>

                    {/* Assign Button */}
                    <button
                      onClick={() => handleOpenAssignModal(card)}
                      className="bg-amber-500 hover:bg-amber-400 text-[#3d0000] font-black px-4 py-2 rounded-2xl text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-user-plus text-base"></i>
                      <span>توزيع لقائد/جوال</span>
                    </button>
                  </div>
                </div>

                {/* Visitation Stats & Assigned Leader Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-gray-200 text-xs">
                  <div>
                    <span className="text-gray-500 font-bold block text-[10px]">القائد/الجوال المكلف بالزيارة:</span>
                    <span className="font-extrabold text-gray-800 text-sm">
                      {card.latestTask?.assignedToName || (card.lastVisit?.leaderName || 'غير موزع')}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 font-bold block text-[10px]">تاريخ آخر افتقاد:</span>
                    <span className="font-extrabold text-sky-900 text-sm">
                      {card.lastVisit?.date || card.latestTask?.completedDate || 'لم يفتقد بعد'}
                    </span>
                  </div>
                </div>

                {/* Feedback Report Details */}
                {card.latestTask?.feedback || card.lastVisit?.notes ? (
                  <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 text-xs space-y-1">
                    <span className="font-extrabold text-amber-900 block flex items-center gap-1">
                      <i className="fa-solid fa-comment-dots text-base"></i>
                      تقرير الافتقاد والفيدباك الأخير من الميدان:
                    </span>
                    <p className="text-gray-800 leading-relaxed font-semibold">
                      {card.latestTask?.feedback || card.lastVisit?.notes}
                    </p>
                    {card.latestTask?.giftDelivered && (
                      <span className="inline-block bg-purple-100 text-purple-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-300 mt-1">
                        🎁 تم تسليم الهدية / مستلزمات الخدمة
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {/* ASSIGNMENT MODAL (تقسيم وتوزيع الافتقاد على القادة والجوالة) */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-amber-300 my-auto">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-lg font-extrabold text-[#8b0000] flex items-center gap-2">
                <i className="fa-solid fa-user-plus text-amber-700"></i>
                توزيع وتكليف مخدوم لقائد أو جوال
              </h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-3.5 text-xs font-bold">
              {/* Select Served Member */}
              <div>
                <label className="block text-gray-700 mb-1">اسم المخدوم المستهدف بالافتقاد:</label>
                <select
                  value={assignForm.memberId}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, memberId: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl text-xs font-bold bg-gray-50"
                  required
                >
                  {servedMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} (#{m.code} - {m.sectorName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Leader / Rover assigned */}
              <div>
                <label className="block text-gray-700 mb-1">القائد أو الجوال المكلف بالتنفيذ:</label>
                <select
                  value={assignForm.assignedToName}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, assignedToName: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl text-xs font-bold bg-white"
                  required
                >
                  {availableLeadersAndRovers.map(l => (
                    <option key={l.id} value={l.name}>
                      {l.name} ({l.sectorName || 'قائد/جوال'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Visitation Method & Target Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 mb-1">وسيلة الافتقاد:</label>
                  <select
                    value={assignForm.visitationType}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, visitationType: e.target.value }))}
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-xs font-bold"
                  >
                    <option value="زيارة منزلية">زيارة منزلية 🏠</option>
                    <option value="مكالمة تليفونية">مكالمة تليفونية 📞</option>
                    <option value="لقاء بالكنيسة">لقاء بالكنيسة ⛪</option>
                    <option value="مناسبة وافتقاد صحي">مناسبة وافتقاد صحي 🏥</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">تاريخ الاستهداف (الموعد):</label>
                  <input
                    type="date"
                    value={assignForm.targetDate}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, targetDate: e.target.value }))}
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-xs font-bold"
                    required
                  />
                </div>
              </div>

              {/* Instructions / Notes */}
              <div>
                <label className="block text-gray-700 mb-1">تعليمات وملاحظات رئيس القطاع للقائد المكلف:</label>
                <textarea
                  rows="2"
                  placeholder="مثال: يرجى الاطمئنان على حالة المخدوم الصحية وتسليم المنديل الكشفي الجديد..."
                  value={assignForm.instructions}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, instructions: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl text-xs"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-black text-[#3d0000] bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md"
                >
                  تأكيد وإرسال التكليف 👥
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitationModule;
