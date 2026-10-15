import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useScout } from '../../context/ScoutContext';

export const DigitalCardModule = () => {
  const { currentUser, members, updateMemberPhoto, updateMemberDetails } = useScout();
  const role = currentUser?.role || 'admin';

  // Available sectors list matching user's specific request
  const sectorOptions = [
    { id: 'all', name: 'جميع القطاعات', adminOnly: true },
    { id: 'sprouts', name: 'قطاع البراعم', adminOnly: false },
    { id: 'cubs', name: 'قطاع الأشبال', adminOnly: false },
    { id: 'scouts', name: 'قطاع الكشاف', adminOnly: false },
    { id: 'senior_scouts', name: 'قطاع المتقدم', adminOnly: false },
    { id: 'guides', name: 'قطاع المرشدات', adminOnly: false },
    { id: 'rangers', name: 'قطاع الرائدات', adminOnly: false },
    { id: 'rovers', name: 'قطاع الجوالة', adminOnly: false },
    { id: 'leaders', name: 'قطاع القادة', adminOnly: true },
  ];

  // Sector Head default sector (e.g., 'senior_scouts' or user's assigned sector)
  const defaultSector = role === 'sector_head' ? (currentUser?.sector || 'senior_scouts') : 'all';
  const [selectedSector, setSelectedSector] = useState(defaultSector);

  const getSectorDisplay = (m) => {
    if (!m?.sectorName) return 'قطاع الكشافة';
    if (m.sectorName.startsWith('قطاع')) return m.sectorName;
    return `قطاع ${m.sectorName}`;
  };

  const getMemberClassification = (m) => {
    if (!m) return 'مخدوم';
    if (m.sector === 'leaders' || m.role === 'leader' || m.role === 'sector_head' || m.rank?.includes('قائد') || m.grade?.includes('قائد')) {
      return 'قائد';
    }
    if (m.sector === 'rovers' || m.grade?.includes('جامعة') || m.grade?.includes('خريج')) {
      return 'جوالة';
    }
    return 'مخدوم';
  };

  // Filter members based on role & selected sector
  const allowedMembers = useMemo(() => {
    let list = members || [];

    if (role === 'sector_head') {
      const mySector = currentUser?.sector || 'senior_scouts';
      const sectorMembers = (members || []).filter(m => m.sector === mySector && m.sector !== 'leaders');
      
      let headMember = (members || []).find(m => m.id === currentUser?.id || m.name === currentUser?.name);
      if (!headMember) {
        headMember = {
          id: currentUser?.id || 'head_card',
          code: 'HEAD-2026',
          name: currentUser?.name || 'القائد رئيس القطاع',
          grade: 'قيادة وتدريب القطاع',
          sector: mySector,
          sectorName: currentUser?.sectorName || 'قطاع الكشاف المتقدم',
          rank: 'رئيس قطاع معتمد ⚜️',
          bloodType: '+O',
          gender: 'ذكر',
          childPhone: currentUser?.phone || '01229876543',
          parentPhone: '01229876543',
          buildingNo: '12',
          street: 'شارع الكنيسة الرئيسي',
          addressDetails: 'مقر قيادة القطاع الكشفي',
          attendanceCount: 14,
          totalSessions: 14,
          privileges: ['إدارة ومتابعة كشافة القطاع', 'معاينة واعتماد الكارنيهات الكشفية'],
        };
      }

      list = [headMember, ...sectorMembers.filter(m => m.id !== headMember.id)];
    } else if (role === 'admin' || role === 'sub_officer') {
      if (selectedSector !== 'all') {
        list = list.filter(m => m.sector === selectedSector);
      }
    } else {
      list = list.filter(m => m.id === currentUser?.id || m.name === currentUser?.name);
      if (list.length === 0) list = [members[0]];
    }

    return list.length > 0 ? list : [members[0]];
  }, [members, role, selectedSector, currentUser]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return allowedMembers;
    const q = searchQuery.trim().toLowerCase();
    return allowedMembers.filter(m =>
      m.code?.toLowerCase().includes(q) ||
      m.name?.toLowerCase().includes(q) ||
      m.id?.toString().includes(q)
    );
  }, [allowedMembers, searchQuery]);

  useEffect(() => {
    if (currentIndex >= allowedMembers.length) {
      setCurrentIndex(0);
    }
  }, [allowedMembers, currentIndex]);

  useEffect(() => {
    if (searchQuery.trim() && filteredMembers.length > 0) {
      const isCurrentInFiltered = filteredMembers.some(m => allowedMembers.indexOf(m) === currentIndex);
      if (!isCurrentInFiltered) {
        setCurrentIndex(allowedMembers.indexOf(filteredMembers[0]));
      }
    }
  }, [searchQuery, filteredMembers, allowedMembers, currentIndex]);

  const currentMember = allowedMembers[currentIndex] || allowedMembers[0] || members[0];

  const fileInputRef = useRef(null);
  const [localAvatarMap, setLocalAvatarMap] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Roles permissions check:
  // Every member can change their OWN profile picture
  // admin & sub_officer can edit any member's picture/data
  // sector_head can edit members in their sector
  const isSelf = currentUser?.id === currentMember?.id || currentUser?.code === currentMember?.code || currentUser?.name === currentMember?.name;
  const isSectorHeadOfMember = role === 'sector_head' && (currentMember?.sector === currentUser?.sector || !currentMember?.sector);
  const isPrivilegedRole = role === 'admin' || role === 'sub_officer' || isSectorHeadOfMember;

  const canEditPhoto = isSelf || isPrivilegedRole;
  const canEditMemberData = isPrivilegedRole;
  const canBrowse = role === 'admin' || role === 'sector_head' || role === 'sub_officer' || role === 'leader' || role === 'rovers';
  const canPrintCards = role === 'admin' || role === 'sub_officer';

  const handlePhotoUploadClick = (e) => {
    if (e) e.stopPropagation();
    if (canEditPhoto) {
      fileInputRef.current?.click();
    } else {
      alert('يمكنك تغيير صورتك الشخصية الخاصة بك فقط، أو طلب تعديلها من رئيس القطاع / الأدمن / مسئول الاشتراكات.');
    }
  };

  const handleOpenEditModal = () => {
    if (!currentMember) return;
    setEditFormData({
      name: currentMember.name || '',
      rank: currentMember.rank || '',
      grade: currentMember.grade || '',
      phone: currentMember.phone || currentMember.childPhone || '',
      address: currentMember.address || currentMember.addressDetails || '',
      bloodType: currentMember.bloodType || '+O إيجابي',
      nationalId: currentMember.nationalId || '',
      notes: currentMember.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveMemberDetails = (e) => {
    e.preventDefault();
    if (updateMemberDetails && currentMember) {
      updateMemberDetails(currentMember.id, editFormData);
    }
    setIsEditModalOpen(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!canEditPhoto) {
      alert('غير مسموح لك بتغيير صورة هذا العضو.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميجابايت.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      if (currentMember) {
        if (updateMemberPhoto) {
          updateMemberPhoto(currentMember.id, base64Url);
        }
        setLocalAvatarMap(prev => ({
          ...prev,
          [currentMember.id]: base64Url,
          [currentMember.code]: base64Url,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const memberAvatar = localAvatarMap[currentMember?.id] || localAvatarMap[currentMember?.code] || currentMember?.avatarUrl;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allowedMembers.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + allowedMembers.length) % allowedMembers.length);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Top Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[32px]">badge</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-lg sm:text-xl text-[#610000]">الكارنيه الكشفي الرقمي</h1>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Admin & Sector Head Search Toolbar */}
      {canBrowse && (
        <div className="bg-[#fcf9f4] p-4 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 flex-wrap">
            
            {/* Sector Selector */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-extrabold text-[#7e5713] flex items-center gap-1 shrink-0">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                <span>القطاع الكشفي:</span>
              </span>

              {role === 'admin' ? (
                <select
                  value={selectedSector}
                  onChange={(e) => {
                    setSelectedSector(e.target.value);
                    setSearchQuery('');
                    setCurrentIndex(0);
                  }}
                  className="bg-white border border-[#e5e2dd] text-[#1c1c19] text-xs font-bold rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000] w-full md:w-56 shadow-2xs cursor-pointer"
                >
                  {sectorOptions.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2 bg-white border border-[#e5e2dd] px-3.5 py-1.5 rounded-2xl text-xs font-bold text-[#610000]">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>{currentUser?.sectorName || 'قطاع الكشاف المتقدم'} (كارنيه رئيس القطاع + المخدومين)</span>
                </div>
              )}
            </div>

            {/* Search Input Bar & Member Selector Dropdown */}
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto flex-1 md:flex-initial">
              
              {/* Search Bar Input */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="بحث بالـ ID أو اسم العضو..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#e5e2dd] text-[#1c1c19] text-xs font-bold rounded-2xl pr-9 pl-7 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000] shadow-2xs"
                />
                <span className="material-symbols-outlined absolute right-2.5 top-2 text-[#8e706b] text-[18px]">
                  search
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-2.5 top-2 text-xs font-bold text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Dropdown Member Selector */}
              <select
                value={currentIndex}
                onChange={(e) => setCurrentIndex(Number(e.target.value))}
                className="bg-white border border-[#e5e2dd] text-[#1c1c19] text-xs font-extrabold rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8b0000] w-full sm:w-auto shadow-2xs cursor-pointer"
              >
                {filteredMembers.map((m) => (
                  <option key={m.id} value={allowedMembers.indexOf(m)}>
                    #{m.code} - {m.name} ({m.sectorName})
                  </option>
                ))}
                {filteredMembers.length === 0 && (
                  <option value="" disabled>لا توجد نتائج بحث</option>
                )}
              </select>

            </div>

          </div>
        </div>
      )}

      {/* 3. Digital Scout Pass Widescreen View */}
      <div className="space-y-6">
        <div className={`grid grid-cols-1 ${canPrintCards ? 'lg:grid-cols-12' : 'max-w-4xl mx-auto'} gap-6 items-start`}>
          
          {/* Right Column: Main Scout Pass Card */}
          <div className={`${canPrintCards ? 'lg:col-span-7' : 'w-full'} bg-white p-6 sm:p-7 rounded-3xl border border-[#e5e2dd] shadow-lg space-y-6 relative overflow-hidden`}>
            
            {/* Church & Badge Title Header */}
            <div className="flex items-center justify-between border-b border-[#f0ede9] pb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="شعار مجموعة جنود المسيح"
                  className="w-12 h-12 rounded-2xl object-contain bg-white shadow-sm border border-[#e5e2dd] p-0.5"
                />
                <div>
                  <h2 className="font-black text-base sm:text-lg text-[#610000]">مجموعة جنود المسيح الكشفية</h2>
                </div>
              </div>
              <span className="px-3 py-1 bg-[#ffddb1] text-[#291800] rounded-full text-xs font-black border border-[#7e5713]/20 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>عضوية معتمدة</span>
              </span>
            </div>

            {/* Scout Avatar & Profile Details */}
            <div className="flex items-center gap-5 flex-col sm:flex-row text-center sm:text-right">
              {/* Hidden File Input for Avatar Upload */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div
                onClick={handlePhotoUploadClick}
                className={`relative shrink-0 group ${canEditPhoto ? 'cursor-pointer' : 'cursor-default'}`}
                title={canEditPhoto ? 'اضغط لرفع / تغيير الصورة الشخصية' : 'صورة مالك الكارنيه'}
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-100 border-2 border-[#7e5713] flex items-center justify-center overflow-hidden shadow-md relative">
                  {memberAvatar ? (
                    <img
                      src={memberAvatar}
                      alt={currentMember.name}
                      className="w-full h-full object-cover transition transform group-hover:scale-105"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-6xl text-slate-600">person</span>
                  )}

                  {/* Hover Camera Overlay */}
                  {canEditPhoto && (
                    <div className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col items-center justify-center gap-1 rounded-xl">
                      <span className="material-symbols-outlined text-2xl">photo_camera</span>
                      <span className="text-[10px] font-bold">تغيير الصورة</span>
                    </div>
                  )}
                </div>

                {/* Camera upload badge icon */}
                {canEditPhoto && (
                  <button
                    type="button"
                    onClick={handlePhotoUploadClick}
                    className="absolute -top-2 -right-2 bg-amber-500 hover:bg-amber-400 text-[#3d0000] p-1.5 rounded-full border-2 border-white shadow-md transition flex items-center justify-center cursor-pointer"
                    title="رفع صورة جديدة"
                  >
                    <span className="material-symbols-outlined text-xs font-bold block">photo_camera</span>
                  </button>
                )}

                {/* Blood Type Badge as shown in screenshot */}
                <span className="absolute -bottom-2 -left-2 bg-[#8b0000] text-white font-mono font-black text-xs px-2.5 py-0.5 rounded-full border-2 border-white shadow">
                  {currentMember.bloodType || '+O إيجابي'}
                </span>
              </div>

              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h3 className="font-black text-xl sm:text-2xl text-[#1c1c19]">{currentMember.name}</h3>
                  {currentMember.sector === 'leaders' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#8b0000] text-white font-black text-[10px]">
                      قائد معتمد ⚜️
                    </span>
                  )}

                  {/* Edit Member Details Button for Admin, Sector Head, Sub Officer */}
                  {canEditMemberData && (
                    <button
                      onClick={handleOpenEditModal}
                      className="px-3 py-1 bg-[#8b0000] hover:bg-[#610000] text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1 cursor-pointer"
                      title="تعديل بيانات العضو"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span>تعديل البيانات</span>
                    </button>
                  )}
                </div>

                <p className="text-xs font-bold text-[#7e5713] flex items-center justify-center sm:justify-start gap-1">
                  <span className="material-symbols-outlined text-[16px]">military_tech</span>
                  <span>{getSectorDisplay(currentMember)} • {getMemberClassification(currentMember)} {currentMember.rank ? `(${currentMember.rank})` : ''}</span>
                </p>

                {/* Code & Grade Info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs justify-center sm:justify-start pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#5a403c]">كود العضوية / الكارنيه:</span>
                    <span className="font-mono font-black text-[#8b0000] text-sm">#{currentMember.code}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#5a403c]">المرحلة / الصف:</span>
                    <span className="font-bold text-[#1c1c19]">{currentMember.grade || 'جامعة / خريجين'}</span>
                  </div>
                </div>

                {/* Age & Birth Year Info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs justify-center sm:justify-start">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#5a403c]">السن الحالي:</span>
                    <span className="font-bold text-[#1c1c19]">
                      {currentMember.birthYear ? (new Date().getFullYear() - Number(currentMember.birthYear)) : (currentMember.birthDate ? (new Date().getFullYear() - Number(currentMember.birthDate.substring(0, 4))) : '14')} سنة
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#5a403c]">سنة الميلاد:</span>
                    <span className="font-bold text-[#1c1c19]">
                      مواليد {currentMember.birthYear || (currentMember.birthDate ? currentMember.birthDate.substring(0, 4) : '2012')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Member Contact, Address & Subscription Status Strip (Replacing Expiry Date) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#fcf9f4] p-4 rounded-2xl border border-[#e5e2dd] text-xs">
              
              {/* Phone Numbers Block */}
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#7e5713] text-[20px] mt-0.5">call</span>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#8e706b] block font-bold">أرقام التليفون والتواصل</span>
                  {(currentMember.childPhone || currentMember.phone) && (
                    <span className="font-mono font-bold text-[#1c1c19] block">
                      📱 العضو: {currentMember.childPhone || currentMember.phone}
                    </span>
                  )}
                  <span className="font-mono font-bold text-[#1c1c19] block">
                    ☎️ ولي الأمر: {currentMember.parentPhone || '01229876543'}
                  </span>
                </div>
              </div>

              {/* Annual Subscription Status Block (Replacing Expiry Date) */}
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#7e5713] text-[20px] mt-0.5">payments</span>
                <div>
                  <span className="text-[10px] text-[#8e706b] block font-bold">اشتراك السنة الكشفي</span>
                  {currentMember.annualFeePaid !== false && currentMember.annualFeePaid !== 'unpaid' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[11px] border border-emerald-300 shadow-2xs mt-0.5">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      <span>مسدد الاشتراك السنوي ✅</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 font-extrabold text-[11px] border border-rose-300 shadow-2xs mt-0.5">
                      <span className="material-symbols-outlined text-xs">warning</span>
                      <span>غير مسدد اشتراك السنة ⚠️</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Detailed Address Block */}
              <div className="sm:col-span-2 flex items-start gap-2.5 border-t border-[#e5e2dd] pt-2.5">
                <span className="material-symbols-outlined text-[#7e5713] text-[20px] mt-0.5">home_pin</span>
                <div>
                  <span className="text-[10px] text-[#8e706b] block font-bold">العنوان السكني التفصيلي</span>
                  <span className="font-bold text-[#1c1c19] block leading-relaxed">
                    {currentMember.addressDetails || currentMember.address || 'شارع الكنيسة الرئيسي، المقر الكشفي، القاهرة'}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code & Barcode Display Box */}
            <div className="bg-[#f6f3ee] p-5 rounded-2xl border border-[#e5e2dd] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white p-2 rounded-xl border border-[#e5e2dd] shadow-sm flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-6xl text-[#1c1c19]">qr_code_2</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#8e706b] tracking-wider block">رمز الاستجابة السريعة (QR)</span>
                  <h4 className="font-mono font-black text-sm text-[#8b0000] mt-0.5">#{currentMember.code}</h4>
                </div>
              </div>

              <div className="text-center sm:text-left shrink-0">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  حالة الكارت: مفعل ونشط
                </span>
              </div>
            </div>

          </div>

          {/* Left Column: Printer (5 Cols) - Only visible to Admin and Subscriptions/Finance Officer */}
          {canPrintCards && (
            <div className="lg:col-span-5 space-y-5">
              
              {/* Direct Printer Connection Status */}
              <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="font-extrabold text-xs text-[#610000] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#8b0000]">print</span>
                    <span>طباعة الكارنيهات الكشفية</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Zebra ZC300</span>
                </div>

                <div className="p-3 bg-[#fcf9f4] rounded-2xl border border-[#e5e2dd] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse"></span>
                    <div>
                      <h4 className="font-extrabold text-xs text-[#1c1c19]">طابعة الكروت متصلة ومستعدة</h4>
                      <p className="text-[10px] text-[#5a403c]">Zebra ZC300 Card Studio (Wi-Fi)</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => alert(`جاري إرسال أمر طباعة كارت ${currentMember.name} لطابعة Zebra ZC300...`)}
                  className="w-full py-3 bg-[#8b0000] hover:bg-[#610000] text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  <span>طباعة مباشرة لكارت ({currentMember.name})</span>
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Edit Member Details Modal (Admin, Sector Head, Sub Officer) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-amber-300 animate-in fade-in zoom-in-95 my-auto text-right" dir="rtl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8b0000] text-2xl">edit_note</span>
                <h3 className="font-black text-lg text-[#610000]">تعديل بيانات العضو (#{currentMember.code})</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMemberDetails} className="space-y-4 text-xs font-bold text-gray-700">
              {/* Member Sector & Name Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-800">الاسم بالكامل:</label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full p-2.5 bg-[#fcf9f4] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-800 flex items-center justify-between">
                    <span>القطاع الكشفي:</span>
                    <span className="text-[10px] text-amber-700 font-bold">🔒 آلي</span>
                  </label>
                  <input
                    type="text"
                    value={currentMember.sectorName || 'قطاع الكشافة'}
                    disabled
                    className="w-full p-2.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-xl cursor-not-allowed font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-800">الرتبة الكشفية:</label>
                  <input
                    type="text"
                    value={editFormData.rank || ''}
                    onChange={e => setEditFormData({ ...editFormData, rank: e.target.value })}
                    className="w-full p-2.5 bg-[#fcf9f4] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-800 flex items-center justify-between">
                    <span>المرحلة / الصف الدراسي:</span>
                    {role === 'sector_head' && (
                      <span className="text-[10px] text-amber-700 font-bold">🔒 تلقائي</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={editFormData.grade || ''}
                    onChange={e => setEditFormData({ ...editFormData, grade: e.target.value })}
                    disabled={role === 'sector_head'}
                    className={`w-full p-2.5 border rounded-xl font-bold ${
                      role === 'sector_head'
                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                        : 'bg-[#fcf9f4] border-gray-300 focus:ring-[#8b0000]'
                    }`}
                  />
                  {role === 'sector_head' && (
                    <span className="text-[9px] text-amber-700 font-bold block mt-0.5">
                      بيتحدث تلقائياً مع السجل السنوي
                    </span>
                  )}
                </div>
              </div>

              {/* Editable Fields for Sector Head: Phone & Blood Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-800">رقم الهاتف (للتواصل):</label>
                  <input
                    type="text"
                    value={editFormData.phone || ''}
                    onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="مثال: 01221234567"
                    className="w-full p-2.5 bg-[#fcf9f4] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-800">فصيلة الدم:</label>
                  <select
                    value={editFormData.bloodType || '+O إيجابي'}
                    onChange={e => setEditFormData({ ...editFormData, bloodType: e.target.value })}
                    className="w-full p-2.5 bg-[#fcf9f4] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                  >
                    <option value="+O إيجابي">+O إيجابي</option>
                    <option value="-O سلبى">-O سلبي</option>
                    <option value="+A إيجابي">+A إيجابي</option>
                    <option value="-A سلبى">-A سلبي</option>
                    <option value="+B إيجابي">+B إيجابي</option>
                    <option value="-B سلبى">-B سلبي</option>
                    <option value="+AB إيجابي">+AB إيجابي</option>
                    <option value="-AB سلبى">-AB سلبي</option>
                  </select>
                </div>
              </div>

              {/* Editable Field for Sector Head: Address */}
              <div>
                <label className="block mb-1 text-gray-800">العنوان السكني التفصيلي:</label>
                <input
                  type="text"
                  value={editFormData.address || editFormData.addressDetails || ''}
                  onChange={e => setEditFormData({ ...editFormData, address: e.target.value, addressDetails: e.target.value })}
                  placeholder="رقم المبنى، اسم الشارع، المنطقة"
                  className="w-full p-2.5 bg-[#fcf9f4] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-800">الرقم القومي:</label>
                <input
                  type="text"
                  value={editFormData.nationalId || ''}
                  onChange={e => setEditFormData({ ...editFormData, nationalId: e.target.value })}
                  className="w-full p-2.5 bg-[#fcf9f4] border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8b0000] hover:bg-[#610000] text-white rounded-xl font-extrabold shadow transition cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
