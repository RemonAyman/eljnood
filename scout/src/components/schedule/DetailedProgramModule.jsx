import React, { useState } from 'react';
import { useScout } from '../../context/ScoutContext';

const PRESET_INVENTORY_ITEMS = [
  { id: 'shoum', label: 'عصا كشفية / شوم (زوان)', defaultQty: '20' },
  { id: 'ropes_thick', label: 'حبل كشفي سميك (15 متر)', defaultQty: '8' },
  { id: 'ropes_thin', label: 'حبال رفيعة / رباطات كشفية', defaultQty: '12' },
  { id: 'balls', label: 'كور قدم / كور طائرة (ألعاب خلاء)', defaultQty: '5' },
  { id: 'cards', label: 'كروت التقييم التجميعية للطلائع', defaultQty: '4 sets' },
  { id: 'first_aid', label: 'حقيبة الإسعافات الأولية الميدانية', defaultQty: '1' },
  { id: 'cones', label: 'أقماع كشفية / علامات تدريب', defaultQty: '15' },
  { id: 'tents', label: 'خيام كشفية / سارية علم', defaultQty: '4' },
  { id: 'pegs', label: 'أوتاد خيام وشواكيش', defaultQty: '20' },
  { id: 'whistles', label: 'صافرات وأعلام إشارات', defaultQty: '6' },
  { id: 'speakers', label: 'سماعات ومكبر صوت ميداني', defaultQty: '1' },
  { id: 'custom', label: 'أخرى (أداة مخصصة)', defaultQty: '1' },
];

export const DetailedProgramModule = ({ defaultTab = 'all_programs' }) => {
  const {
    currentUser,
    sectorPrograms,
    addSectorProgram,
    updateSectorProgram,
    deleteSectorProgram,
    approveSectorProgram,
    roversMeeting,
    updateRoversMeeting,
    addRoversOccasionalEvent,
    festivalPlan,
    updateFestivalPlan,
    addFestivalChallenge,
    deleteFestivalChallenge,
    sectorMeetings,
    updateSectorMeeting,
    addSectorMeeting,
    deleteSectorMeeting,
    SECTORS
  } = useScout();

  const [activeTab, setActiveTab] = useState(defaultTab); // 'all_programs', 'sector_meetings', 'rovers', 'festival'
  const [selectedSector, setSelectedSector] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [isRoversEditOpen, setIsRoversEditOpen] = useState(false);
  const [isFestivalModalOpen, setIsFestivalModalOpen] = useState(false);

  // Sector Meetings Modal & Form State
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [meetingFormData, setMeetingFormData] = useState({
    sector: currentUser.sector !== 'all' ? currentUser.sector : 'scouts',
    sectorName: 'قطاع الكشاف (فتيان إعدادي)',
    dayOfWeek: 'كل يوم جمعة أسبوعياً',
    time: '04:00 م - 07:30 م',
    location: 'الفناء الكشفي والمبنى الرئيسي',
    leaderInCharge: '',
    topics: '',
    prepNotes: '',
    status: 'ready'
  });

  // Form State for Sector Program Modal
  const [formData, setFormData] = useState({
    sector: currentUser.sector !== 'all' ? currentUser.sector : 'scouts',
    title: '',
    date: '',
    assemblyTime: '04:00 م',
    departureTime: '08:00 م',
    location: '',
    leaderNotes: '',
    agenda: [
      { time: '04:00 م - 04:30 م', title: 'التجمع وطابور الصباح وتحية العلم', details: 'تفتيش الزي والطلائع' },
      { time: '04:30 م - 06:30 م', title: 'الأنشطة والتدريب الكشفي', details: 'تطبيق الفقرات والمهارات' },
      { time: '06:30 م - 08:00 م', title: 'ختام اليوم والانصراف', details: 'تقييم اليوم والانصراف النظامي' }
    ],
    inventoryRequests: [
      'عصا كشفية / شوم (زوان) - عدد 20',
      'حبل كشفي سميك (15 متر) - عدد 8',
      'كروت التقييم التجميعية للطلائع - عدد 4 sets',
      'حقيبة الإسعافات الأولية الميدانية'
    ]
  });

  // Form state for new Agenda item & Inventory picker
  const [newAgendaItem, setNewAgendaItem] = useState({ time: '', title: '', details: '' });
  const [selectedInvCategory, setSelectedInvCategory] = useState(PRESET_INVENTORY_ITEMS[0].label);
  const [invQty, setInvQty] = useState(PRESET_INVENTORY_ITEMS[0].defaultQty);
  const [customInvText, setCustomInvText] = useState('');

  // Rovers Form State
  const [roversForm, setRoversForm] = useState({
    dayOfWeek: roversMeeting.dayOfWeek || 'كل يوم خميس أسبوعياً',
    time: roversMeeting.time || 'من 07:00 م حتى 09:30 م',
    location: roversMeeting.location || 'مقر عشيرة الجوالة',
    focusTopics: roversMeeting.focusTopics || ''
  });

  const [roversEventForm, setRoversEventForm] = useState({
    title: '',
    date: '',
    assemblyTime: '08:00 ص',
    location: '',
    reqs: ''
  });

  // Festival Challenge Form State
  const [festForm, setFestForm] = useState({
    title: '',
    targetSectors: 'جميع القطاعات',
    date: '',
    time: '03:00 م - 06:00 م',
    location: 'قاعات الخدمات والمسرح الكبير',
    inventoryNeeded: ''
  });

  // Filter Logic
  const filteredPrograms = sectorPrograms.filter(prog => {
    if (selectedSector !== 'all' && prog.sector !== selectedSector) return false;
    if (statusFilter !== 'all' && prog.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = prog.title.toLowerCase().includes(q);
      const matchLoc = (prog.location || '').toLowerCase().includes(q);
      const matchSector = (prog.sectorName || '').toLowerCase().includes(q);
      return matchTitle || matchLoc || matchSector;
    }
    return true;
  });

  const filteredSectorMeetings = (sectorMeetings || []).filter(meet => {
    if (selectedSector !== 'all' && meet.sector !== selectedSector) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchSector = (meet.sectorName || '').toLowerCase().includes(q);
      const matchTopics = (meet.topics || '').toLowerCase().includes(q);
      const matchLeader = (meet.leaderInCharge || '').toLowerCase().includes(q);
      return matchSector || matchTopics || matchLeader;
    }
    return true;
  });

  const handleOpenMeetingModal = (meetToEdit = null) => {
    if (meetToEdit) {
      setEditingMeeting(meetToEdit);
      setMeetingFormData({
        sector: meetToEdit.sector,
        sectorName: meetToEdit.sectorName,
        dayOfWeek: meetToEdit.dayOfWeek || 'كل يوم جمعة أسبوعياً',
        time: meetToEdit.time || '04:00 م - 07:30 م',
        location: meetToEdit.location || 'المبنى الرئيسي',
        leaderInCharge: meetToEdit.leaderInCharge || '',
        topics: meetToEdit.topics || '',
        prepNotes: meetToEdit.prepNotes || '',
        status: meetToEdit.status || 'ready'
      });
    } else {
      setEditingMeeting(null);
      const matchedSec = SECTORS.find(s => s.id === (currentUser.sector !== 'all' ? currentUser.sector : 'scouts'));
      setMeetingFormData({
        sector: currentUser.sector !== 'all' ? currentUser.sector : 'scouts',
        sectorName: matchedSec ? matchedSec.name : 'قطاع الكشاف (فتيان)',
        dayOfWeek: 'كل يوم جمعة أسبوعياً',
        time: '04:00 م - 07:30 م',
        location: 'المبنى الكشفي الرئيسي',
        leaderInCharge: '',
        topics: '',
        prepNotes: '',
        status: 'ready'
      });
    }
    setIsMeetingModalOpen(true);
  };

  const handleSaveSectorMeeting = (e) => {
    e.preventDefault();
    const matchedSec = SECTORS.find(s => s.id === meetingFormData.sector);
    const secName = matchedSec ? matchedSec.name : meetingFormData.sector;

    const payload = {
      ...meetingFormData,
      sectorName: secName,
    };

    if (editingMeeting) {
      updateSectorMeeting(editingMeeting.id, payload);
    } else {
      addSectorMeeting(payload);
    }

    setIsMeetingModalOpen(false);
  };

  const handleDeleteSectorMeeting = (id) => {
    if (window.confirm('هل أنت تأكد من حذف خطة وتفاصيل هذا الاجتماع؟')) {
      deleteSectorMeeting(id);
    }
  };

  const handleOpenAddModal = (progToEdit = null) => {
    setSelectedInvCategory(PRESET_INVENTORY_ITEMS[0].label);
    setInvQty(PRESET_INVENTORY_ITEMS[0].defaultQty);
    setCustomInvText('');
    if (progToEdit) {
      setEditingProgram(progToEdit);
      setFormData({
        sector: progToEdit.sector,
        title: progToEdit.title,
        date: progToEdit.date,
        assemblyTime: progToEdit.assemblyTime,
        departureTime: progToEdit.departureTime,
        location: progToEdit.location,
        leaderNotes: progToEdit.leaderNotes || '',
        agenda: progToEdit.agenda || [],
        inventoryRequests: progToEdit.inventoryRequests || []
      });
    } else {
      setEditingProgram(null);
      setFormData({
        sector: currentUser.sector !== 'all' ? currentUser.sector : 'scouts',
        title: '',
        date: new Date().toISOString().substring(0, 10),
        assemblyTime: '04:00 م',
        departureTime: '08:00 م',
        location: 'المقرات الكشفية - المبنى الرئيسي',
        leaderNotes: '',
        agenda: [
          { time: '04:00 م - 04:30 م', title: 'التجمع وطابور الصباح وتحية العلم', details: 'تفتيش الزي والطلائع' },
          { time: '04:30 م - 06:30 م', title: 'الأنشطة والتدريب الكشفي التفصيلي', details: 'تطبيق المهارات والفقرات' },
          { time: '06:30 م - 08:00 م', title: 'ختام اليوم وتقييم السداسيات والانصراف', details: 'انصراف نظامي' }
        ],
        inventoryRequests: [
          'عصا كشفية / شوم (زوان) - عدد 20',
          'حبل كشفي سميك (15 متر) - عدد 8',
          'كروت التقييم التجميعية للطلائع - عدد 4 sets',
          'حقيبة الإسعافات الأولية الميدانية'
        ]
      });
    }
    setIsAddModalOpen(true);
  };

  const handleSaveProgram = (e) => {
    e.preventDefault();
    const matchedSec = SECTORS.find(s => s.id === formData.sector);
    const secName = matchedSec ? matchedSec.name : formData.sector;

    const programPayload = {
      ...formData,
      sectorName: secName,
    };

    if (editingProgram) {
      updateSectorProgram(editingProgram.id, programPayload);
    } else {
      addSectorProgram(programPayload);
    }

    setIsAddModalOpen(false);
  };

  const handleAddAgendaRow = () => {
    if (!newAgendaItem.title) return;
    setFormData(prev => ({
      ...prev,
      agenda: [...prev.agenda, { ...newAgendaItem }]
    }));
    setNewAgendaItem({ time: '', title: '', details: '' });
  };

  const handleRemoveAgendaRow = (idx) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== idx)
    }));
  };

  const handleAddInvItem = () => {
    let itemName = selectedInvCategory;
    if (selectedInvCategory === 'أخرى (أداة مخصصة)') {
      itemName = customInvText.trim();
    }
    if (!itemName) return;

    const quantityStr = invQty && invQty.trim() ? ` - عدد ${invQty.trim()}` : '';
    const formattedItem = `${itemName}${quantityStr}`;

    setFormData(prev => ({
      ...prev,
      inventoryRequests: [...prev.inventoryRequests, formattedItem]
    }));

    if (selectedInvCategory === 'أخرى (أداة مخصصة)') {
      setCustomInvText('');
    }
  };

  const handleRemoveInvItem = (idx) => {
    setFormData(prev => ({
      ...prev,
      inventoryRequests: prev.inventoryRequests.filter((_, i) => i !== idx)
    }));
  };

  const handleSaveRoversMeeting = (e) => {
    e.preventDefault();
    updateRoversMeeting(roversForm);
    setIsRoversEditOpen(false);
  };

  const handleAddRoversEvent = (e) => {
    e.preventDefault();
    if (!roversEventForm.title) return;
    addRoversOccasionalEvent(roversEventForm);
    setRoversEventForm({ title: '', date: '', assemblyTime: '08:00 ص', location: '', reqs: '' });
  };

  const handleSaveFestivalChallenge = (e) => {
    e.preventDefault();
    if (!festForm.title) return;
    addFestivalChallenge(festForm);
    setFestForm({
      title: '',
      targetSectors: 'جميع القطاعات',
      date: '',
      time: '03:00 م - 06:00 م',
      location: 'قاعات الخدمات والمسرح الكبير',
      inventoryNeeded: ''
    });
    setIsFestivalModalOpen(false);
  };

  return (
    <div className="space-y-6 text-right pb-10" dir="rtl">
      {/* Top Header Banner matching standard theme */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[32px]">assignment</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-lg sm:text-xl text-[#610000]">
                خطة الأيام والمعسكرات وتفاصيل فقرات اليوم والعهدة
              </h1>
              {currentUser.role === 'admin' && (
                <span className="bg-[#ffddb1] text-[#291800] text-xs px-2.5 py-0.5 rounded-full font-black border border-amber-300">
                  أدمن النظام العام 👑
                </span>
              )}
              {currentUser.role === 'sector_head' && (
                <span className="bg-[#ffddb1] text-[#291800] text-xs px-2.5 py-0.5 rounded-full font-black border border-amber-300">
                  رئيس قطاع: {currentUser.sectorName} 🚩
                </span>
              )}
              {currentUser.role === 'festival_leader' && (
                <span className="bg-purple-100 text-purple-900 text-xs px-2.5 py-0.5 rounded-full font-black border border-purple-300">
                  قائد المهرجان 🏆
                </span>
              )}
            </div>
            <p className="text-xs text-[#5a403c] mt-1 font-bold">
              إدخال ومتابعة خطط الأيام الكشفية لكل قطاع، توقيتات التجمع والانصراف، توزيع الفقرات التفصيلية قبل اليوم، وحصر طلبات العهدة والمعدات المطلوبة.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {(currentUser.role === 'admin' || currentUser.role === 'sector_head') && (
            <button
              onClick={() => handleOpenAddModal(null)}
              className="px-4 py-2.5 bg-[#8b0000] hover:bg-[#610000] text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>إضافة يوم / معسكر جديد</span>
            </button>
          )}

          {currentUser.role === 'festival_leader' && (
            <button
              onClick={() => setIsFestivalModalOpen(true)}
              className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
              <span>إضافة مسابقة / تحدي بالمهرجان</span>
            </button>
          )}
        </div>
      </div>

      {/* View Switcher Tabs Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#e5e2dd] shadow-sm flex flex-wrap items-center gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('all_programs')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'all_programs'
              ? 'bg-[#8b0000] text-white shadow-sm font-black'
              : 'bg-[#f6f3ee] text-[#5a403c] hover:bg-[#ebe8e3]'
          }`}
        >
          <span className="material-symbols-outlined text-base">format_list_bulleted</span>
          <span>جدول القطاعات والأيام الكشفية ({sectorPrograms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sector_meetings')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'sector_meetings'
              ? 'bg-[#8b0000] text-white shadow-sm font-black'
              : 'bg-[#f6f3ee] text-[#5a403c] hover:bg-[#ebe8e3]'
          }`}
        >
          <span className="material-symbols-outlined text-base">forum</span>
          <span>اجتماعات ومحاور القطاعات الأسبوعية 📋 ({sectorMeetings ? sectorMeetings.length : 0})</span>
        </button>

        {(currentUser.role === 'admin' || currentUser.role === 'rovers' || (currentUser.role === 'sector_head' && currentUser.sector === 'rovers') || currentUser.sector === 'rovers') && (
          <button
            onClick={() => setActiveTab('rovers')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'rovers'
                ? 'bg-[#8b0000] text-white shadow-sm font-black'
                : 'bg-[#f6f3ee] text-[#5a403c] hover:bg-[#ebe8e3]'
            }`}
          >
            <span className="material-symbols-outlined text-base">groups</span>
            <span>اجتماع وفاعليات الجوالة (خطة استثنائية)</span>
          </button>
        )}

        {(currentUser.role === 'admin' || currentUser.role === 'festival_leader') && (
          <button
            onClick={() => setActiveTab('festival')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'festival'
                ? 'bg-[#8b0000] text-white shadow-sm font-black'
                : 'bg-[#f6f3ee] text-[#5a403c] hover:bg-[#ebe8e3]'
            }`}
          >
            <span className="material-symbols-outlined text-base">emoji_events</span>
            <span>خطة وتحديات قائد المهرجان 🏆</span>
          </button>
        )}
      </div>

      {/* TAB 1: ALL SECTORS DETAILED PROGRAMS */}
      {activeTab === 'all_programs' && (
        <div className="space-y-6">
          {/* Controls Bar: Filters & Search */}
          <div className="bg-[#fcf9f4] border border-[#e5e2dd] rounded-3xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Sector Filter */}
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-1.5 shadow-sm text-sm">
                <span className="material-symbols-outlined text-amber-700 text-lg">filter_alt</span>
                <span className="text-gray-600 font-bold text-xs">القطاع:</span>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="bg-transparent font-bold text-gray-800 outline-none cursor-pointer"
                >
                  <option value="all">جميع القطاعات الكشفية</option>
                  {SECTORS.map(sec => (
                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-1.5 shadow-sm text-sm">
                <span className="material-symbols-outlined text-amber-700 text-lg">verified</span>
                <span className="text-gray-600 font-bold text-xs">الحالة:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent font-bold text-gray-800 outline-none cursor-pointer"
                >
                  <option value="all">الكل (معتمد ومراجعة)</option>
                  <option value="approved">معتمد رسمياً</option>
                  <option value="pending">قيد مراجعة الأدمن</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute right-3 top-2.5 text-gray-400 text-lg">search</span>
              <input
                type="text"
                placeholder="بحث بالعنوان، المكان، أو القطاع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>
          </div>

          {/* Programs Cards Grid */}
          {filteredPrograms.length === 0 ? (
            <div className="bg-[#fcf9f4] border border-[#e5e2dd] rounded-3xl p-12 text-center text-gray-500 space-y-3">
              <span className="material-symbols-outlined text-6xl text-amber-700/40">event_busy</span>
              <h3 className="text-lg font-bold text-gray-700">لا توجد برامج تفصيلية مطابقة للبحث أو الفلتر</h3>
              <p className="text-sm text-gray-500">قم بإضافة يوم كشفي جديد أو اختبر تحديد قطاع آخر.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredPrograms.map((prog) => {
                const isApproved = prog.status === 'approved';
                const canManage = currentUser.role === 'admin' || (currentUser.role === 'sector_head' && currentUser.sector === prog.sector);

                return (
                  <div
                    key={prog.id}
                    className="bg-[#fcf9f4] border border-[#e5e2dd] hover:border-amber-400 rounded-3xl shadow-sm hover:shadow-md transition duration-200 overflow-hidden"
                  >
                    {/* Program Header */}
                    <div className="bg-[#8b0000] text-white p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-amber-400 text-[#3d0000] p-2 rounded-2xl font-black text-sm flex items-center justify-center min-w-10">
                          {prog.date ? prog.date.substring(5) : 'اليوم'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-amber-100/20 text-amber-200 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-300/30">
                              {prog.sectorName || prog.sector}
                            </span>
                            {isApproved ? (
                              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">check_circle</span>
                                معتمد من المدير العام
                              </span>
                            ) : (
                              <span className="bg-amber-500/20 text-amber-200 border border-amber-400/40 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">pending</span>
                                قيد المراجعة والاعتماد
                              </span>
                            )}
                          </div>
                          <h2 className="text-lg font-bold text-amber-100 mt-1">{prog.title}</h2>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-2 self-end md:self-auto">
                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => approveSectorProgram(prog.id, isApproved ? 'pending' : 'approved')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                              isApproved
                                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-md'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isApproved ? 'undo' : 'verified'}
                            </span>
                            {isApproved ? 'إلغاء الاعتماد' : 'اعتماد وتصديق الخطة'}
                          </button>
                        )}

                        {canManage && (
                          <>
                            <button
                              onClick={() => handleOpenAddModal(prog)}
                              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl text-xs font-bold transition"
                              title="تعديل تفاصيل اليوم والعهدة"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('هل أنت تأكد من حذف خطة هذا اليوم الكشفي؟')) {
                                  deleteSectorProgram(prog.id);
                                }
                              }}
                              className="bg-red-500/20 hover:bg-red-500/40 text-red-200 p-2 rounded-xl text-xs font-bold transition"
                              title="حذف اليوم"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 space-y-6">
                      {/* Overview Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-[#e5e2dd] rounded-2xl p-4 shadow-sm text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                            <span className="material-symbols-outlined">location_on</span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs block font-bold">مكان التجمع واليوم:</span>
                            <span className="font-extrabold text-gray-800">{prog.location || 'غير محدد'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-800">
                            <span className="material-symbols-outlined">schedule</span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs block font-bold">ساعة التجمع:</span>
                            <span className="font-extrabold text-sky-900">{prog.assemblyTime || '04:00 م'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                            <span className="material-symbols-outlined">flag</span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs block font-bold">ساعة الانصراف والختام:</span>
                            <span className="font-extrabold text-emerald-900">{prog.departureTime || '08:00 م'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Agenda Timeline & Inventory Dual Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Day Shape / Agenda (2 Cols) */}
                        <div className="lg:col-span-2 space-y-3">
                          <h3 className="font-extrabold text-gray-800 flex items-center gap-2 text-base">
                            <span className="material-symbols-outlined text-amber-700">view_timeline</span>
                            شكل فقرات اليوم والتوقيت التفصيلي:
                          </h3>

                          {prog.agenda && prog.agenda.length > 0 ? (
                            <div className="space-y-2">
                              {prog.agenda.map((ag, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white border-r-4 border-r-amber-700 border border-gray-200 rounded-2xl p-3 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="bg-amber-100 text-amber-900 font-black px-2.5 py-1 rounded-xl whitespace-nowrap">
                                      {ag.time}
                                    </span>
                                    <div>
                                      <span className="font-bold text-gray-800 text-sm block">{ag.title}</span>
                                      <span className="text-gray-600 text-xs">{ag.details}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">لم يتم إدخال تفاصيل الفقرات لهذا اليوم بعد.</p>
                          )}
                        </div>

                        {/* Inventory & Logistics Request (1 Col) */}
                        <div className="space-y-3">
                          <h3 className="font-extrabold text-gray-800 flex items-center gap-2 text-base">
                            <span className="material-symbols-outlined text-amber-700">inventory_2</span>
                            العهدة والمعدات المطلوبة:
                          </h3>

                          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-2">
                            {prog.inventoryRequests && prog.inventoryRequests.length > 0 ? (
                              <ul className="space-y-2 text-xs font-semibold text-gray-800">
                                {prog.inventoryRequests.map((inv, idx) => (
                                  <li key={idx} className="flex items-start gap-2 bg-white/80 p-2 rounded-xl border border-amber-200/50">
                                    <span className="material-symbols-outlined text-amber-700 text-base">check_box</span>
                                    <span>{inv}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-amber-800/70 italic">لا توجد طلبات عهدة خاصة لهذا اليوم.</p>
                            )}

                            {prog.leaderNotes && (
                              <div className="mt-3 pt-3 border-t border-amber-200 text-xs">
                                <span className="font-bold text-amber-900 block mb-1">💡 ملاحظة القائد المسؤول:</span>
                                <p className="text-gray-700 leading-relaxed bg-white p-2.5 rounded-xl border border-amber-100">
                                  {prog.leaderNotes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROVERS SPECIAL CASE VIEW */}
      {activeTab === 'rovers' && (currentUser.role === 'admin' || currentUser.role === 'rovers' || (currentUser.role === 'sector_head' && currentUser.sector === 'rovers') || currentUser.sector === 'rovers') && (
        <div className="space-y-6">
          {/* Rovers Special Notice Box */}
          <div className="bg-sky-50 border border-sky-200 rounded-3xl p-6 text-sky-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-2xl">info</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-sky-900">نظام خطة عشيرة الجوالة في فصل الصيف</h3>
                <p className="text-sm text-sky-800/90 mt-1 max-w-3xl leading-relaxed">
                  قطاع الجوالة ليس لديه برنامج معسكرات أسبوعي ثابت في الصيف، بل ينظمون يوم أو يومين استثنائيين، بالإضافة إلى **الاجتماع الأسبوعي الثابت** الذي يحددون فيه الميعاد، المكان، وأهداف الخدمة.
                </p>
              </div>
            </div>

            {(currentUser.role === 'admin' || (currentUser.role === 'sector_head' && currentUser.sector === 'rovers')) && (
              <button
                onClick={() => setIsRoversEditOpen(true)}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2.5 rounded-2xl shadow transition text-sm flex items-center gap-2 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
                تعديل ميعاد اجتماع الجوالة الثابت
              </button>
            )}
          </div>

          {/* Rovers Standing Meeting Main Card */}
          <div className="bg-[#fcf9f4] border border-[#e5e2dd] rounded-3xl shadow-sm p-6 space-y-6">
            <div className="border-b border-[#e5e2dd] pb-4 flex justify-between items-center">
              <h2 className="text-xl font-extrabold text-[#3d0000] flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-700">event_repeat</span>
                الاجتماع الأسبوعي الثابت لعشيرة الجوالة
              </h2>
              <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-300">
                اجتماع ثابت أسبوعياً
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-gray-500 text-xs font-bold block">📅 اليوم والتكرار:</span>
                <span className="text-lg font-extrabold text-gray-800 block">{roversMeeting.dayOfWeek}</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-gray-500 text-xs font-bold block">⏰ التوقيت المحدد:</span>
                <span className="text-lg font-extrabold text-sky-900 block">{roversMeeting.time}</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-1">
                <span className="text-gray-500 text-xs font-bold block">📍 المكان والمقر:</span>
                <span className="text-lg font-extrabold text-amber-900 block">{roversMeeting.location}</span>
              </div>
            </div>

            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
              <h4 className="font-extrabold text-amber-900 text-sm mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-base">psychology</span>
                محاور واهتمامات الاجتماع الأسبوعي:
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                {roversMeeting.focusTopics || 'تنسيق الخدمات اللوجستية للمجموعة الكشفية ودراسة مشروعات خدمة البيئة.'}
              </p>
            </div>
          </div>

          {/* Occasional Rovers Summer Events */}
          <div className="bg-[#fcf9f4] border border-[#e5e2dd] rounded-3xl shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-extrabold text-[#3d0000] flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-700">hiking</span>
              الأيام والفاعليات الاستثنائية للجوالة خلال الصيف
            </h2>

            {/* Add Occasional Event Form */}
            {(currentUser.role === 'admin' || (currentUser.role === 'sector_head' && currentUser.sector === 'rovers')) && (
              <form onSubmit={handleAddRoversEvent} className="bg-white p-4 rounded-2xl border border-gray-200 space-y-4">
                <h4 className="font-bold text-sm text-gray-800">تسجيل يوم / فاعلية استثنائية جديدة للجوالة:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="عنوان الفاعلية / الخدمة"
                    value={roversEventForm.title}
                    onChange={(e) => setRoversEventForm(prev => ({ ...prev, title: e.target.value }))}
                    className="p-2.5 border border-gray-300 rounded-xl text-sm"
                    required
                  />
                  <input
                    type="date"
                    value={roversEventForm.date}
                    onChange={(e) => setRoversEventForm(prev => ({ ...prev, date: e.target.value }))}
                    className="p-2.5 border border-gray-300 rounded-xl text-sm"
                    required
                  />
                  <input
                    type="text"
                    placeholder="ساعة التجمع والمكان"
                    value={roversEventForm.location}
                    onChange={(e) => setRoversEventForm(prev => ({ ...prev, location: e.target.value }))}
                    className="p-2.5 border border-gray-300 rounded-xl text-sm"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="العهدة والمعدات المطلوبة للفاعلية"
                    value={roversEventForm.reqs}
                    onChange={(e) => setRoversEventForm(prev => ({ ...prev, reqs: e.target.value }))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm"
                  />
                  <button
                    type="submit"
                    className="bg-amber-800 hover:bg-amber-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm whitespace-nowrap"
                  >
                    حفظ الفاعلية
                  </button>
                </div>
              </form>
            )}

            {/* Events List */}
            <div className="space-y-3">
              {roversMeeting.occasionalEvents && roversMeeting.occasionalEvents.length > 0 ? (
                roversMeeting.occasionalEvents.map((ev) => (
                  <div key={ev.id} className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
                          {ev.date}
                        </span>
                        <h4 className="font-extrabold text-gray-800 text-base">{ev.title}</h4>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">📍 {ev.location} | ⏰ التجمع: {ev.assemblyTime || '08:00 ص'}</p>
                      {ev.reqs && (
                        <p className="text-xs text-amber-900 bg-amber-50 p-2 rounded-xl mt-2 border border-amber-200">
                          📦 العهدة المطلوبة: {ev.reqs}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">لا توجد فاعليات استثنائية مسجلة للجوالة حالياً.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FESTIVAL LEADER VIEW */}
      {activeTab === 'festival' && (currentUser.role === 'admin' || currentUser.role === 'festival_leader') && (
        <div className="space-y-6">
          {/* Festival Banner Header */}
          <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-800 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                <span className="material-symbols-outlined text-[32px]">emoji_events</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-black text-lg sm:text-xl text-purple-950">{festivalPlan.seasonTitle}</h2>
                  <span className="bg-purple-100 text-purple-900 border border-purple-300 text-xs px-2.5 py-0.5 rounded-full font-black">
                    خطة وقادة مهرجان الكرازة والمسابقات 🏆
                  </span>
                </div>
                <p className="text-xs text-[#5a403c] mt-1 font-bold">
                  إشراف: {festivalPlan.leaderName} • الحالة: {festivalPlan.status}
                </p>
              </div>
            </div>

            {(currentUser.role === 'admin' || currentUser.role === 'festival_leader') && (
              <button
                onClick={() => setIsFestivalModalOpen(true)}
                className="px-4 py-2.5 bg-purple-800 hover:bg-purple-900 text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>إضافة مسابقة / تحدي جديد</span>
              </button>
            )}
          </div>

          {/* Festival Challenges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {festivalPlan.challenges && festivalPlan.challenges.length > 0 ? (
              festivalPlan.challenges.map((ch) => (
                <div key={ch.id} className="bg-[#fcf9f4] border border-[#e5e2dd] rounded-3xl p-6 shadow-sm space-y-4 hover:border-purple-400 transition">
                  <div className="flex justify-between items-start gap-2 border-b border-gray-200 pb-3">
                    <div>
                      <span className="bg-purple-100 text-purple-900 text-xs px-2.5 py-0.5 rounded-full font-bold border border-purple-300">
                        {ch.targetSectors}
                      </span>
                      <h3 className="font-extrabold text-gray-800 text-lg mt-1">{ch.title}</h3>
                    </div>

                    {(currentUser.role === 'admin' || currentUser.role === 'festival_leader') && (
                      <button
                        onClick={() => deleteFestivalChallenge(ch.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold"
                        title="حذف التحدي"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 text-xs font-medium text-gray-700">
                    <p className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-700 text-base">calendar_month</span>
                      <span className="font-bold text-gray-900">التاريخ:</span> {ch.date} | {ch.time}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-700 text-base">location_on</span>
                      <span className="font-bold text-gray-900">المكان:</span> {ch.location}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200 text-xs">
                    <span className="font-extrabold text-purple-950 block mb-1">📦 العهدة ومستلزمات التحدي المطلوبة:</span>
                    <p className="text-purple-900 font-medium">{ch.inventoryNeeded || 'كتيبات المسابقة وشيتات التحكيم.'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 bg-[#fcf9f4] border border-[#e5e2dd] rounded-3xl p-8 text-center text-gray-500">
                لا توجد مسابقات مسجلة بجدول المهرجان حالياً.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SECTOR WEEKLY MEETINGS & PREPARATION */}
      {activeTab === 'sector_meetings' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-[#fcf9f4] border border-[#e5e2dd] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center shrink-0 shadow-md">
                <span className="material-symbols-outlined text-2xl">forum</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#610000]">جدول ومتابعة اجتماعات القطاعات الأسبوعية</h3>
                <p className="text-xs text-gray-600 mt-1 max-w-3xl leading-relaxed">
                  متابعة وتجهيزات اللقاء الأسبوعي لجميع القطاعات (المواعيد الثابتة، المقرات، القادة المسؤولين، ومحاور الاجتماع والتجهيزات).
                </p>
              </div>
            </div>

            {(currentUser.role === 'admin' || currentUser.role === 'sector_head') && (
              <button
                onClick={() => handleOpenMeetingModal(null)}
                className="bg-[#8b0000] hover:bg-[#610000] text-white font-extrabold px-4 py-2.5 rounded-2xl shadow transition text-xs flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                <span>إضافة / تحضير اجتماع قطاع جديد</span>
              </button>
            )}
          </div>

          {/* Sector Filter Bar */}
          <div className="bg-white border border-[#e5e2dd] rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-700 text-lg">filter_alt</span>
              <span className="font-bold text-gray-700">تصفية القطاع:</span>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-[#fcf9f4] border border-gray-300 rounded-xl px-3 py-1.5 font-bold text-gray-800 outline-none cursor-pointer"
              >
                <option value="all">جميع قطاعات الخدمة ({sectorMeetings ? sectorMeetings.length : 0})</option>
                {SECTORS.map(sec => (
                  <option key={sec.id} value={sec.id}>{sec.name}</option>
                ))}
              </select>
            </div>

            <div className="text-gray-500 font-medium">
              يظهر للأدمن المتابعة الشاملة ولرؤساء القطاعات إمكانية تعديل وتحضير الاجتماعات.
            </div>
          </div>

          {/* Meetings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSectorMeetings.length > 0 ? (
              filteredSectorMeetings.map((meet) => {
                const canEdit = currentUser.role === 'admin' || (currentUser.role === 'sector_head' && currentUser.sector === meet.sector);
                return (
                  <div key={meet.id} className="bg-white border border-[#e5e2dd] rounded-3xl shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                    <div className="p-5 space-y-4">
                      {/* Top Sector Header */}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#8b0000]"></span>
                          <h4 className="font-black text-base text-[#610000]">{meet.sectorName}</h4>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-black border ${
                          meet.status === 'ready'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}>
                          {meet.status === 'ready' ? 'جاهز ومكتمل ✅' : 'قيد التحضير ⏳'}
                        </span>
                      </div>

                      {/* Info Cards */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-[#fcf9f4] p-3 rounded-xl border border-amber-100/80">
                          <span className="text-gray-500 font-bold block mb-0.5">📅 اليوم والتكرار:</span>
                          <span className="font-extrabold text-gray-800 block">{meet.dayOfWeek}</span>
                        </div>
                        <div className="bg-[#fcf9f4] p-3 rounded-xl border border-amber-100/80">
                          <span className="text-gray-500 font-bold block mb-0.5">⏰ التوقيت:</span>
                          <span className="font-extrabold text-amber-900 block">{meet.time}</span>
                        </div>
                        <div className="bg-[#fcf9f4] p-3 rounded-xl border border-amber-100/80">
                          <span className="text-gray-500 font-bold block mb-0.5">📍 المكان والمقر:</span>
                          <span className="font-extrabold text-gray-800 block">{meet.location}</span>
                        </div>
                        <div className="bg-[#fcf9f4] p-3 rounded-xl border border-amber-100/80">
                          <span className="text-gray-500 font-bold block mb-0.5">👤 القائد المسؤول:</span>
                          <span className="font-extrabold text-gray-800 block">{meet.leaderInCharge || 'رئيس القطاع'}</span>
                        </div>
                      </div>

                      {/* Agenda / Topics */}
                      <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/70 space-y-1">
                        <span className="font-extrabold text-amber-950 text-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">psychology</span>
                          محاور وموضوعات اجتماع هذا الأسبوع:
                        </span>
                        <p className="text-xs text-gray-700 leading-relaxed font-medium">
                          {meet.topics || 'لم يتم إضافة المحاور بعد.'}
                        </p>
                      </div>

                      {/* Prep Notes */}
                      {meet.prepNotes && (
                        <div className="bg-sky-50/50 p-3.5 rounded-2xl border border-sky-200/70 space-y-1">
                          <span className="font-extrabold text-sky-950 text-xs flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">construction</span>
                            تجهيزات وتحضيرات الخدمة والعهدة:
                          </span>
                          <p className="text-xs text-sky-900 leading-relaxed font-medium">
                            {meet.prepNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    {canEdit && (
                      <div className="bg-[#fcf9f4] px-5 py-3 border-t border-gray-100 flex justify-end gap-2 text-xs font-bold">
                        <button
                          onClick={() => handleOpenMeetingModal(meet)}
                          className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          تعديل الاجتماع
                        </button>
                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => handleDeleteSectorMeeting(meet.id)}
                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            حذف
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-white p-12 rounded-3xl border border-[#e5e2dd] text-center text-gray-500">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">event_busy</span>
                <p className="font-bold text-sm">لا توجد اجتماعات مضافة لهذا القطاع حالياً.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD/EDIT SECTOR PROGRAM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl border border-amber-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
              <h3 className="text-xl font-extrabold text-[#8b0000] flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600">edit_calendar</span>
                {editingProgram ? 'تعديل تفاصيل اليوم والعهدة' : 'إضافة يوم / معسكر جديد للقطاع'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">القطاع الكشفي المسؤول:</label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm font-bold bg-gray-50"
                    required
                  >
                    {SECTORS.map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">تاريخ اليوم الكشفي:</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm font-bold"
                    required
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">عنوان اليوم أو المعسكر:</label>
                <input
                  type="text"
                  placeholder="مثال: يوم تدريب الريادة والعقد الكشفية"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm font-bold"
                  required
                />
              </div>

              {/* Location & Times */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">مكان التجمع والمقر:</label>
                  <input
                    type="text"
                    placeholder="مثال: أرض المبنى الكشفي"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">توقيت التجمع (من):</label>
                  <input
                    type="text"
                    placeholder="04:00 م"
                    value={formData.assemblyTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, assemblyTime: e.target.value }))}
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">توقيت الانصراف (إلى):</label>
                  <input
                    type="text"
                    placeholder="08:00 م"
                    value={formData.departureTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, departureTime: e.target.value }))}
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                    required
                  />
                </div>
              </div>

              {/* Agenda Builder (شكل اليوم والفقرات) */}
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 space-y-3">
                <h4 className="font-extrabold text-amber-900 text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">view_timeline</span>
                  شكل الفقرات والجدول التفصيلي لليوم:
                </h4>

                <div className="space-y-2">
                  {formData.agenda.map((ag, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-gray-200 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-amber-900">{ag.time}</span> - <span className="font-bold">{ag.title}</span> ({ag.details})
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAgendaRow(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new agenda row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="التوقيت (04:00 - 05:00)"
                    value={newAgendaItem.time}
                    onChange={(e) => setNewAgendaItem(prev => ({ ...prev, time: e.target.value }))}
                    className="p-2 border border-gray-300 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="عنوان الفقرة"
                    value={newAgendaItem.title}
                    onChange={(e) => setNewAgendaItem(prev => ({ ...prev, title: e.target.value }))}
                    className="p-2 border border-gray-300 rounded-xl text-xs"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="تفاصيل الفقرة"
                      value={newAgendaItem.details}
                      onChange={(e) => setNewAgendaItem(prev => ({ ...prev, details: e.target.value }))}
                      className="p-2 border border-gray-300 rounded-xl text-xs w-full"
                    />
                    <button
                      type="button"
                      onClick={handleAddAgendaRow}
                      className="bg-amber-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold shrink-0"
                    >
                      إضافة
                    </button>
                  </div>
                </div>
              </div>

              {/* Inventory Requests (تحديد العهدة المطلوبة) */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-3">
                <h4 className="font-extrabold text-amber-900 text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">inventory_2</span>
                  تحديد العهدة والمعدات المطلوبة:
                </h4>

                <div className="flex flex-wrap gap-2">
                  {formData.inventoryRequests.map((inv, idx) => (
                    <span key={idx} className="bg-white border border-amber-300 text-amber-950 text-xs px-3 py-1 rounded-xl font-bold flex items-center gap-1 shadow-sm">
                      {inv}
                      <button
                        type="button"
                        onClick={() => handleRemoveInvItem(idx)}
                        className="text-red-500 hover:text-red-700 font-extrabold text-sm mr-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2 border-t border-amber-200/80 items-end">
                  <div className={selectedInvCategory === 'أخرى (أداة مخصصة)' ? "sm:col-span-5" : "sm:col-span-6"}>
                    <label className="block text-[11px] font-bold text-amber-950 mb-1">اختر نوع المعدة / العهدة:</label>
                    <select
                      value={selectedInvCategory}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedInvCategory(val);
                        const found = PRESET_INVENTORY_ITEMS.find(p => p.label === val);
                        if (found) setInvQty(found.defaultQty);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-xl text-xs bg-white font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {PRESET_INVENTORY_ITEMS.map((item) => (
                        <option key={item.id} value={item.label}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedInvCategory === 'أخرى (أداة مخصصة)' && (
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-amber-950 mb-1">اسم الأدوات / العهدة:</label>
                      <input
                        type="text"
                        placeholder="أدخل اسم العهدة"
                        value={customInvText}
                        onChange={(e) => setCustomInvText(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-xl text-xs bg-white"
                      />
                    </div>
                  )}

                  <div className={selectedInvCategory === 'أخرى (أداة مخصصة)' ? "sm:col-span-3" : "sm:col-span-3"}>
                    <label className="block text-[11px] font-bold text-amber-950 mb-1">العدد / الكمية:</label>
                    <input
                      type="text"
                      placeholder="عدد (مثال: 20)"
                      value={invQty}
                      onChange={(e) => setInvQty(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-xl text-xs bg-white text-center font-extrabold text-amber-900"
                    />
                  </div>

                  <div className={selectedInvCategory === 'أخرى (أداة مخصصة)' ? "sm:col-span-12" : "sm:col-span-3"}>
                    <button
                      type="button"
                      onClick={handleAddInvItem}
                      className="w-full bg-amber-700 hover:bg-amber-800 text-white text-xs py-2 px-3 rounded-xl font-extrabold flex items-center justify-center gap-1 shadow transition"
                    >
                      <span className="material-symbols-outlined text-sm">add_circle</span>
                      + إضافة للعهدة
                    </button>
                  </div>
                </div>
              </div>

              {/* Leader Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">تعليمات وملاحظات القائد المسؤول:</label>
                <textarea
                  rows="2"
                  placeholder="ملاحظات حول الزي، أدوات الأعضاء، أو استقبال أولياء الأمور..."
                  value={formData.leaderNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, leaderNotes: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-extrabold text-[#3d0000] bg-amber-400 hover:bg-amber-300 rounded-2xl shadow-lg"
                >
                  حفظ الخطة وتحديد العهدة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ROVERS MEETING EDIT MODAL */}
      {isRoversEditOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-sky-300">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-lg font-extrabold text-sky-900">تعديل الترتيبات الثابتة لاجتماع الجوالة</h3>
              <button onClick={() => setIsRoversEditOpen(false)} className="text-gray-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveRoversMeeting} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اليوم والتكرار:</label>
                <input
                  type="text"
                  value={roversForm.dayOfWeek}
                  onChange={(e) => setRoversForm(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الميعاد المحدد:</label>
                <input
                  type="text"
                  value={roversForm.time}
                  onChange={(e) => setRoversForm(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">المكان والمقر:</label>
                <input
                  type="text"
                  value={roversForm.location}
                  onChange={(e) => setRoversForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">المحاور والخدمات الرئيسية:</label>
                <textarea
                  rows="3"
                  value={roversForm.focusTopics}
                  onChange={(e) => setRoversForm(prev => ({ ...prev, focusTopics: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRoversEditOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-700 rounded-xl"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD FESTIVAL CHALLENGE */}
      {isFestivalModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-purple-300">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-lg font-extrabold text-purple-950">إضافة مسابقة / تحدي جديد بالمهرجان</h3>
              <button onClick={() => setIsFestivalModalOpen(false)} className="text-gray-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveFestivalChallenge} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اسم المسابقة / التحدي:</label>
                <input
                  type="text"
                  placeholder="مثال: مسابقة الكشوف الروحية والملاحة"
                  value={festForm.title}
                  onChange={(e) => setFestForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">القطاعات المشاركة:</label>
                <input
                  type="text"
                  placeholder="مثال: الكشاف، المرشدات، الأشبال"
                  value={festForm.targetSectors}
                  onChange={(e) => setFestForm(prev => ({ ...prev, targetSectors: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">التاريخ:</label>
                  <input
                    type="date"
                    value={festForm.date}
                    onChange={(e) => setFestForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">التوقيت:</label>
                  <input
                    type="text"
                    value={festForm.time}
                    onChange={(e) => setFestForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">المكان:</label>
                <input
                  type="text"
                  value={festForm.location}
                  onChange={(e) => setFestForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">العهدة والمستلزمات المطلوبة للمسابقة:</label>
                <textarea
                  rows="2"
                  placeholder="مثال: كتيبات الأسئلة، أدوات تحكيم، شاشات عرض..."
                  value={festForm.inventoryNeeded}
                  onChange={(e) => setFestForm(prev => ({ ...prev, inventoryNeeded: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsFestivalModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow"
                >
                  إضافة التحدي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: SECTOR MEETING ADD/EDIT MODAL */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-amber-300" dir="rtl">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="font-extrabold text-lg text-[#610000] flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-700">edit_calendar</span>
                {editingMeeting ? 'تعديل خطة واجتماع القطاع' : 'إضافة اجتماع قطاع جديد'}
              </h3>
              <button onClick={() => setIsMeetingModalOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-full p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveSectorMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">القطاع الكشفي:</label>
                <select
                  value={meetingFormData.sector}
                  onChange={(e) => {
                    const secId = e.target.value;
                    const found = SECTORS.find(s => s.id === secId);
                    setMeetingFormData(prev => ({
                      ...prev,
                      sector: secId,
                      sectorName: found ? found.name : secId
                    }));
                  }}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm font-bold bg-white"
                >
                  {SECTORS.map(sec => (
                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">اليوم والتكرار:</label>
                  <input
                    type="text"
                    placeholder="مثال: كل يوم جمعة أسبوعياً"
                    value={meetingFormData.dayOfWeek}
                    onChange={(e) => setMeetingFormData(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">التوقيت المحدد:</label>
                  <input
                    type="text"
                    placeholder="مثال: 04:00 م - 07:30 م"
                    value={meetingFormData.time}
                    onChange={(e) => setMeetingFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">المكان والمقر:</label>
                  <input
                    type="text"
                    placeholder="مثال: المبنى الكشفي - قاعة الأشبال"
                    value={meetingFormData.location}
                    onChange={(e) => setMeetingFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">القائد المسؤول عن الاجتماع:</label>
                  <input
                    type="text"
                    placeholder="مثال: القائد بيشوي سامي"
                    value={meetingFormData.leaderInCharge}
                    onChange={(e) => setMeetingFormData(prev => ({ ...prev, leaderInCharge: e.target.value }))}
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">حالة الاجتماع والانعقاد:</label>
                <select
                  value={meetingFormData.status}
                  onChange={(e) => setMeetingFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm font-bold bg-white"
                >
                  <option value="ready">جاهز ومكتمل ✅</option>
                  <option value="preparing">قيد التحضير ⏳</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">محاور وموضوعات اجتماع هذا الأسبوع:</label>
                <textarea
                  rows="3"
                  placeholder="اكتب النقاط والموضوعات والفقرات بالتفصيل..."
                  value={meetingFormData.topics}
                  onChange={(e) => setMeetingFormData(prev => ({ ...prev, topics: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">التجهيزات والتحضيرات والعهدة المطلوبة:</label>
                <textarea
                  rows="2"
                  placeholder="أدوات التدريب، المواد، وأي طلبات عهدة..."
                  value={meetingFormData.prepNotes}
                  onChange={(e) => setMeetingFormData(prev => ({ ...prev, prepNotes: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-extrabold text-white bg-[#8b0000] hover:bg-[#610000] rounded-2xl shadow"
                >
                  حفظ تفاصيل الاجتماع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedProgramModule;
