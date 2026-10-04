import React, { useState } from 'react';
import { useScout } from '../../context/ScoutContext';

export const AuthModal = ({ isOpen, onClose }) => {
  const { addMember, switchUserRole, logActivity, scoutYear } = useScout();

  // Navigation views: 'login', 'account_type', 'register_form', 'reset_password'
  const [viewMode, setViewMode] = useState('login');
  const [selectedRole, setSelectedRole] = useState('child'); // 'child', 'leader', 'sector_head', 'parent'

  // Login credentials state matching Image 1
  const [loginForm, setLoginForm] = useState({
    codeOrEmail: 'JS-2026-448',
    password: '',
    showPassword: false,
    pinCode: '',
  });

  // Password Reset / OTP state matching Image 4
  const [resetStep, setResetStep] = useState(1); // 1: identify, 2: otp, 3: new_pass, 4: success
  const [resetCodeInput, setResetCodeInput] = useState('JS-2026-0842');
  const [otpDigits, setOtpDigits] = useState(['9', '2', '4', '7']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Registration Form state
  const [childForm, setChildForm] = useState({
    fullName: 'كيرلس مينا شنودة فرج',
    code: 'JS-2026-448',
    birthDate: '2013-08-15',
    gender: 'ذكر',
    grade: 'الصف الأول الإعدادي',
    scarfStatus: 'استلم المنديل',
    phone: '01012345678',
    whatsappPhone: '01012345678',
    parentPhone: '01229876543',
    parentWhatsappPhone: '01229876543',
    childPhone: '01012345678',
    childWhatsappPhone: '01012345678',
    buildingNo: '5',
    streetName: 'شارع الكنيسة',
    addressDetails: 'بني الجمهورية، منفرع من شارع الكنيسة، عمارة الأمل، الدور الثالث، شقة 5',
    leaderSector: 'قطاع الكشاف (فتيان إعدادي)',
    leaderRole: 'قائد فرقة / مساعد قائد',
    relationToChild: 'أب',
    linkedChildName: '',
    linkedChildCode: '',
  });

  const calculateScoutSector = (gender, grade) => {
    const isFemale = gender === 'أنثى';

    if (['كيجي 1', 'كيجي 2', 'الصف الأول الابتدائي', 'الصف الثاني الابتدائي'].includes(grade)) {
      return 'قطاع براعم 🔴';
    }
    if (['الصف الثالث الابتدائي', 'الصف الرابع الابتدائي', 'الصف الخامس الابتدائي', 'الصف السادس الابتدائي'].includes(grade)) {
      return isFemale ? 'قطاع الزهرات 🌸' : 'قطاع الأشبال 🟡';
    }
    if (['الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي'].includes(grade)) {
      return isFemale ? 'قطاع المرشدات 🌸' : 'قطاع الكشاف 🟢';
    }
    if (['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'].includes(grade)) {
      return isFemale ? 'قطاع الرائدات 🟣' : 'قطاع المتقدم 🔵';
    }

    return 'قطاع الكشاف 🟢';
  };

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const val = loginForm.codeOrEmail.toLowerCase().trim();

    if (val === 'admin' || val.includes('admin')) {
      switchUserRole('admin');
    } else if (val.includes('festival') || val.includes('مهرجان')) {
      switchUserRole('festival_leader');
    } else if (val === 'sub' || val.includes('sub')) {
      switchUserRole('sub_officer');
    } else if (val.includes('sprouts')) {
      switchUserRole('sector_head', { sector: 'sprouts' });
    } else if (val.includes('cubs')) {
      switchUserRole('sector_head', { sector: 'cubs' });
    } else if (val.includes('blossom')) {
      switchUserRole('sector_head', { sector: 'blossoms' });
    } else if (val.includes('scout') && !val.includes('senior')) {
      switchUserRole('sector_head', { sector: 'scouts' });
    } else if (val.includes('guide')) {
      switchUserRole('sector_head', { sector: 'guides' });
    } else if (val.includes('senior')) {
      switchUserRole('sector_head', { sector: 'senior_scouts' });
    } else if (val.includes('ranger')) {
      switchUserRole('sector_head', { sector: 'rangers' });
    } else if (val.includes('rover')) {
      switchUserRole('sector_head', { sector: 'rovers' });
    } else if (val.includes('leader_head')) {
      switchUserRole('sector_head', { sector: 'leaders' });
    } else if (val.includes('head')) {
      switchUserRole('sector_head', { sector: 'cubs' });
    } else if (val.includes('parent') || val.includes('0122')) {
      switchUserRole('parent');
    } else if (val === '1001' || val.includes('448') || val.includes('child')) {
      switchUserRole('child');
    } else {
      switchUserRole('leader');
    }

    logActivity(`تسجيل دخول بالحساب: ${loginForm.codeOrEmail}`);
    onClose();
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!childForm.fullName || !childForm.code || !childForm.addressDetails) {
      alert('برجاء استكمال البيانات الإجبارية');
      return;
    }

    if (selectedRole === 'leader' && (!childForm.phone || !childForm.whatsappPhone)) {
      alert('برجاء إدخال رقم الموبايل ورقم الواتساب الإجباريين للقائد');
      return;
    }

    if (selectedRole === 'parent' && (!childForm.parentPhone || !childForm.parentWhatsappPhone)) {
      alert('برجاء إدخال رقم موبايل ولي الأمر ورقم الواتساب الإجباريين');
      return;
    }

    if (selectedRole === 'child' && !childForm.parentPhone) {
      alert('برجاء إدخال رقم موبايل ولي الأمر الإجباري');
      return;
    }

    const fullAddr = [
      childForm.buildingNo ? `عمارة ${childForm.buildingNo}` : '',
      childForm.streetName ? `شارع ${childForm.streetName}` : '',
      childForm.addressDetails
    ].filter(Boolean).join('، ');

    const newM = addMember({
      name: childForm.fullName,
      code: childForm.code,
      grade: childForm.grade,
      gender: childForm.gender,
      sector: calculateScoutSector(childForm.gender, childForm.grade),
      parentPhone: selectedRole === 'leader' ? childForm.phone : childForm.parentPhone,
      childPhone: selectedRole === 'parent' ? '' : (childForm.childPhone || childForm.phone),
      addressDetails: fullAddr,
    });

    switchUserRole(selectedRole, newM);
    alert('تم اعتماد وقيد الكشاف وإصدار الكارنيه بنجاح!');
    onClose();
  };

  return (
    /* Outer Overlay with responsive scrolling & padding */
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-4 md:p-6 flex justify-center items-start sm:items-center cursor-pointer min-h-screen py-6 sm:py-10"
    >
      {/* Inner Dialog Box with responsive max-height and inner scroll */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl relative border border-[#e5e2dd] text-[#1c1c19] cursor-default my-auto max-h-[88vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Top Header Bar with Close Modal Button */}
        <div className="px-4 sm:px-5 py-3 flex items-center justify-between bg-white border-b border-[#e5e2dd] shrink-0 z-30">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8b0000] animate-pulse"></span>
            <span className="text-xs font-black text-[#610000]">مجموعة جنود المسيح الكشفية</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-red-50 hover:bg-[#8b0000] hover:text-white text-[#8b0000] border border-red-200 shadow-xs font-black text-sm flex items-center justify-center transition cursor-pointer"
            title="إغلاق النافذة"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Inner Container with generous internal padding on text, inputs and scrollbar */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-4 sm:space-y-5 max-h-full py-4 sm:py-5">

        {/* ---------------------------------------------------- */}
        {/* VIEW MODE 1: LOGIN SCREEN                            */}
        {/* ---------------------------------------------------- */}
        {viewMode === 'login' && (
          <div className="space-y-4 sm:space-y-5">
            {/* Header Banner - Side by Side Logo & Title */}
            <div className="flex items-center justify-center gap-3 pb-2 border-b border-[#e5e2dd]">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 p-1 shadow-sm border-2 border-amber-400 flex items-center justify-center shrink-0 transition hover:scale-105">
                <img
                  src="/logo.png"
                  alt="شعار مجموعة جنود المسيح"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="font-black text-base sm:text-lg text-[#610000]">تسجيل الدخول للكشافة</h2>
                <span className="mt-1 px-3 py-0.5 rounded-full bg-amber-100/80 text-[#7e5713] text-[10px] sm:text-xs font-black border border-amber-300 inline-flex items-center gap-1.5">
                  <span>أهلاً بعودتك يا بطل</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </span>
              </div>
            </div>

            {/* Login Card Form */}
            <div className="space-y-3.5 sm:space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-3 sm:space-y-3.5">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-[#5a403c] mb-1">كود الكشاف أو البريد:</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="مثال: JS-2026-448 أو name@scouts.org"
                      value={loginForm.codeOrEmail}
                      onChange={(e) => setLoginForm({ ...loginForm, codeOrEmail: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-[#f6f3ee] rounded-2xl border border-[#e5e2dd] text-xs font-bold text-[#1c1c19] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-2.5 sm:top-3 text-[#8e706b] text-[18px]">badge</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] sm:text-xs font-bold text-[#5a403c]">كلمة المرور:</label>
                    <button
                      type="button"
                      onClick={() => setViewMode('reset_password')}
                      className="text-[10px] sm:text-[11px] font-bold text-[#8b0000] hover:underline"
                    >
                      نسيت كلمة السر؟
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={loginForm.showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-[#f6f3ee] rounded-2xl border border-[#e5e2dd] text-xs font-bold text-[#1c1c19] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
                    />
                    <button
                      type="button"
                      onClick={() => setLoginForm({ ...loginForm, showPassword: !loginForm.showPassword })}
                      className="material-symbols-outlined absolute left-3 top-2.5 sm:top-3 text-[#8e706b] text-[18px]"
                    >
                      {loginForm.showPassword ? 'visibility_off' : 'visibility'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 sm:py-3.5 rounded-2xl bg-[#8b0000] hover:bg-[#610000] text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2"
                >
                  <span>تسجيل الدخول إلى حسابك</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                </button>
              </form>



              {/* Account type registration link */}
              <div className="text-center pt-2 text-xs">
                <span className="text-[#5a403c]">ليس لديك حساب كشفي؟ </span>
                <button
                  type="button"
                  onClick={() => setViewMode('register_form')}
                  className="font-black text-[#8b0000] hover:underline"
                >
                  سجل الآن وانضم للفرقة ➔
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW MODE: REGISTER FORM WITH EMBEDDED ROLE SELECTOR */}
        {/* ---------------------------------------------------- */}
        {(viewMode === 'register_form' || viewMode === 'account_type') && (
          <div className="space-y-4 sm:space-y-5">
            {/* Header Banner - Minimalist (No background, No border) */}
            <div className="space-y-3 pb-3 border-b border-[#e5e2dd]">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="px-3 py-1.5 rounded-xl bg-[#f6f3ee] hover:bg-[#e5e2dd] text-[#8b0000] font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer border border-[#e5e2dd]"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  <span>رجوع لتسجيل الدخول</span>
                </button>

                <span className="px-3 py-1 rounded-full bg-amber-100 text-[#7e5713] font-black text-[10px] border border-amber-300">
                  السنة الكشفية {scoutYear}
                </span>
              </div>

              <div className="flex items-center justify-center gap-3 pt-1">
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-amber-50 p-1 shadow-sm border-2 border-amber-400 flex items-center justify-center shrink-0">
                  <img
                    src="/logo.png"
                    alt="شعار مجموعة جنود المسيح"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="font-black text-base sm:text-lg text-[#610000]">انضم لأسرة جنود المسيح الكشفية</h2>
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 sm:space-y-4">
              
              {/* Section 0: Top Segmented Tab Switcher */}
              <div className="bg-[#f6f3ee] p-1.5 rounded-2xl border border-[#e5e2dd] grid grid-cols-3 gap-1.5 text-center text-xs font-bold shadow-xs">
                {[
                  { id: 'child', title: 'عضو كشفي', icon: 'badge' },
                  { id: 'leader', title: 'قائد / جوالة', icon: 'military_tech' },
                  { id: 'parent', title: 'ولي أمر الكشاف', icon: 'family_restroom' },
                ].map((roleTab) => (
                  <button
                    key={roleTab.id}
                    type="button"
                    onClick={() => setSelectedRole(roleTab.id)}
                    className={`py-2.5 px-1 sm:px-2 rounded-xl transition flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
                      selectedRole === roleTab.id
                        ? 'bg-[#8b0000] text-white shadow-md font-black'
                        : 'text-[#5a403c] hover:bg-[#e5e2dd]/60'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{roleTab.icon}</span>
                    <span className="text-[11px] sm:text-xs leading-tight">{roleTab.title}</span>
                  </button>
                ))}
              </div>

              {/* Section 1: البيانات الشخصية بناءً على المسار المختار */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-3">
                <h4 className="font-black text-xs text-[#610000] border-b pb-2 flex justify-between items-center">
                  <span>
                    {selectedRole === 'child' && '1. البيانات الشخصية للكشاف'}
                    {selectedRole === 'leader' && '1. البيانات الشخصية للقائد / الجوال'}
                    {selectedRole === 'parent' && '1. بيانات ولي الأمر والأبناء'}
                  </span>
                  <span className="text-[10px] text-[#8e706b]">حقول أساسية</span>
                </h4>

                {/* --- CHILD FIELDS --- */}
                {selectedRole === 'child' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-[#5a403c] mb-1">الاسم الرباعي للكشاف (إجباري):</label>
                      <input
                        type="text"
                        required
                        value={childForm.fullName}
                        onChange={(e) => setChildForm({ ...childForm, fullName: e.target.value })}
                        className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-bold text-[#1c1c19]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#5a403c] mb-1">الكود الكشفي (إجباري):</label>
                        <input
                          type="text"
                          required
                          value={childForm.code}
                          onChange={(e) => setChildForm({ ...childForm, code: e.target.value })}
                          className="w-full p-2.5 bg-amber-50 rounded-xl border border-amber-300 text-xs font-mono font-black text-[#8b0000]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#5a403c] mb-1">تاريخ الميلاد (إجباري):</label>
                        <input
                          type="date"
                          required
                          value={childForm.birthDate}
                          onChange={(e) => setChildForm({ ...childForm, birthDate: e.target.value })}
                          className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-bold text-[#1c1c19]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-[#5a403c]">النوع (إجباري):</label>
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                        {['ذكر', 'أنثى'].map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setChildForm({ ...childForm, gender: g })}
                            className={`py-2 rounded-xl border transition ${
                              childForm.gender === g
                                ? 'bg-[#8b0000] text-white border-[#8b0000] font-black'
                                : 'bg-white text-[#5a403c] border-[#e5e2dd]'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#5a403c] mb-1">المرحلة الدراسية الحالية:</label>
                        <select
                          value={childForm.grade}
                          onChange={(e) => setChildForm({ ...childForm, grade: e.target.value })}
                          className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-bold text-[#1c1c19]"
                        >
                          <option value="كيجي 1">كيجي 1 (رياض الأطفال)</option>
                          <option value="كيجي 2">كيجي 2 (رياض الأطفال)</option>
                          <option value="الصف الأول الابتدائي">الصف الأول الابتدائي</option>
                          <option value="الصف الثاني الابتدائي">الصف الثاني الابتدائي</option>
                          <option value="الصف الثالث الابتدائي">الصف الثالث الابتدائي</option>
                          <option value="الصف الرابع الابتدائي">الصف الرابع الابتدائي</option>
                          <option value="الصف الخامس الابتدائي">الصف الخامس الابتدائي</option>
                          <option value="الصف السادس الابتدائي">الصف السادس الابتدائي</option>
                          <option value="الصف الأول الإعدادي">الصف الأول الإعدادي</option>
                          <option value="الصف الثاني الإعدادي">الصف الثاني الإعدادي</option>
                          <option value="الصف الثالث الإعدادي">الصف الثالث الإعدادي</option>
                          <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                          <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                          <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#5a403c] mb-1">القطاع الكشفي التلقائي:</label>
                        <input
                          type="text"
                          readOnly
                          value={calculateScoutSector(childForm.gender, childForm.grade)}
                          className="w-full p-2.5 bg-amber-50/90 rounded-xl border border-amber-300 text-xs font-black text-[#8b0000] cursor-not-allowed shadow-xs"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* --- LEADER / ROVER FIELDS --- */}
                {selectedRole === 'leader' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-[#5a403c] mb-1">الاسم الرباعي للقائد / الجوال (إجباري):</label>
                      <input
                        type="text"
                        required
                        value={childForm.fullName}
                        onChange={(e) => setChildForm({ ...childForm, fullName: e.target.value })}
                        className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-bold text-[#1c1c19]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#5a403c] mb-1">كود القائد / رقم القيد (إجباري):</label>
                        <input
                          type="text"
                          required
                          value={childForm.code}
                          onChange={(e) => setChildForm({ ...childForm, code: e.target.value })}
                          className="w-full p-2.5 bg-amber-50 rounded-xl border border-amber-300 text-xs font-mono font-black text-[#8b0000]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#5a403c] mb-1">تاريخ الميلاد (إجباري):</label>
                        <input
                          type="date"
                          required
                          value={childForm.birthDate}
                          onChange={(e) => setChildForm({ ...childForm, birthDate: e.target.value })}
                          className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-bold text-[#1c1c19]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-[#5a403c]">النوع (إجباري):</label>
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                        {['ذكر', 'أنثى'].map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setChildForm({ ...childForm, gender: g })}
                            className={`py-2 rounded-xl border transition ${
                              childForm.gender === g
                                ? 'bg-[#8b0000] text-white border-[#8b0000] font-black'
                                : 'bg-white text-[#5a403c] border-[#e5e2dd]'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#5a403c] mb-1">القطاع الكشفي التابع له:</label>
                      <select
                        value={childForm.leaderSector}
                        onChange={(e) => setChildForm({ ...childForm, leaderSector: e.target.value })}
                        className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-bold text-[#1c1c19]"
                      >
                        <option value="قطاع البراعم (ابتدائي)">قطاع البراعم (ابتدائي)</option>
                        <option value="قطاع الأشبال والزهرات">قطاع الأشبال والزهرات</option>
                        <option value="قطاع الكشاف (فتيان إعدادي)">قطاع الكشاف (فتيان إعدادي)</option>
                        <option value="قطاع المرشدات (فتيات)">قطاع المرشدات (فتيات)</option>
                        <option value="قطاع الكشاف المتقدم (ثانوي)">قطاع الكشاف المتقدم (ثانوي)</option>
                        <option value="عشيرة الجوالة والجوالات (جامعي)">عشيرة الجوالة والجوالات (جامعي)</option>
                        <option value="قيادة المجموعة العامة">قيادة المجموعة العامة</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#5a403c] mb-1">الصفة / المهمة الكشفية:</label>
                      <select
                        value={childForm.leaderRole}
                        onChange={(e) => setChildForm({ ...childForm, leaderRole: e.target.value })}
                        className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-bold text-[#1c1c19]"
                      >
                        <option value="قائد قطاع / مسكون بالخدمة">قائد قطاع / مسكون بالخدمة</option>
                        <option value="قائد فرقة / مساعد قائد">قائد فرقة / مساعد قائد</option>
                        <option value="جوال ممارس / عضو عشيرة">جوال ممارس / عضو عشيرة</option>
                        <option value="قائد مسؤول نشاط / لوجستيات">قائد مسؤول نشاط / لوجستيات</option>
                      </select>
                    </div>
                  </>
                )}

                {/* --- PARENT FIELDS --- */}
                {selectedRole === 'parent' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-[#5a403c] mb-1">الاسم الرباعي لولي الأمر (إجباري):</label>
                      <input
                        type="text"
                        required
                        value={childForm.fullName}
                        onChange={(e) => setChildForm({ ...childForm, fullName: e.target.value })}
                        className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-bold text-[#1c1c19]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#5a403c] mb-1">صلة القرابة (إجباري):</label>
                        <select
                          value={childForm.relationToChild}
                          onChange={(e) => setChildForm({ ...childForm, relationToChild: e.target.value })}
                          className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-bold text-[#1c1c19]"
                        >
                          <option value="أب">أب</option>
                          <option value="أم">أم</option>
                          <option value="وصي شرعي">وصي شرعي / ولي أمر</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#5a403c] mb-1">كود ولي الأمر (إجباري):</label>
                        <input
                          type="text"
                          required
                          value={childForm.code}
                          onChange={(e) => setChildForm({ ...childForm, code: e.target.value })}
                          className="w-full p-2.5 bg-amber-50 rounded-xl border border-amber-300 text-xs font-mono font-black text-[#8b0000]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#5a403c] mb-1">اسم الكشاف التابع (إجباري):</label>
                        <input
                          type="text"
                          required
                          placeholder="اسم الابن/الابنة الكشاف"
                          value={childForm.linkedChildName}
                          onChange={(e) => setChildForm({ ...childForm, linkedChildName: e.target.value })}
                          className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-bold text-[#1c1c19]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#5a403c] mb-1">كود الكشاف التابع (إجباري):</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: JS-2026-448"
                          value={childForm.linkedChildCode}
                          onChange={(e) => setChildForm({ ...childForm, linkedChildCode: e.target.value })}
                          className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-mono font-bold text-[#1c1c19]"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Section 2: حالة المنديل الكشفي (تظهر فقط للأعضاء الكشفيين) */}
              {selectedRole === 'child' && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-3">
                  <h4 className="font-black text-xs text-[#610000] border-b pb-2 flex justify-between">
                    <span>2. حالة المنديل الكشفي</span>
                    <span className="text-[10px] text-[#7e5713]">ميثاق الوعد</span>
                  </h4>

                  <div className="space-y-2 text-xs font-bold">
                    {[
                      { id: 'استلم المنديل', title: 'استلم المنديل', bg: 'bg-[#8b0000] text-white' },
                      { id: 'لم يستلم المنديل', title: 'لم يستلم المنديل', bg: 'bg-white text-[#1c1c19] border-[#e5e2dd]' },
                    ].map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setChildForm({ ...childForm, scarfStatus: s.id })}
                        className={`w-full text-right p-2.5 sm:p-3 rounded-xl border transition ${
                          childForm.scarfStatus === s.id ? s.bg + ' font-black shadow' : 'bg-white text-[#5a403c] border-[#e5e2dd]'
                        }`}
                      >
                        <h5 className="font-extrabold text-xs">{s.title}</h5>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: بيانات التواصل والعنوان */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-3">
                <h4 className="font-black text-xs text-[#610000] border-b pb-2 flex justify-between items-center">
                  <span>
                    {selectedRole === 'child' ? '3. بيانات التواصل والعنوان' : '2. بيانات التواصل والعنوان'}
                  </span>
                  <span className="text-[10px] text-[#7e5713]">
                    {selectedRole === 'leader' && 'حساب قائد / جوالة'}
                    {selectedRole === 'parent' && 'حساب ولي أمر'}
                    {selectedRole === 'child' && 'حساب عضو كشفي'}
                  </span>
                </h4>

                {/* Dynamic Phone Fields based on selectedRole */}
                {selectedRole === 'leader' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-[#5a403c] mb-1">
                        رقم الموبايل الشخصي (إجباري):
                      </label>
                      <input
                        type="tel"
                        required
                        value={childForm.phone}
                        onChange={(e) => setChildForm({ ...childForm, phone: e.target.value })}
                        placeholder="مثال: 01012345678"
                        className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-mono font-bold text-[#1c1c19]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#5a403c] mb-1">
                        رقم الموبايل (واتساب) (إجباري):
                      </label>
                      <input
                        type="tel"
                        required
                        value={childForm.whatsappPhone}
                        onChange={(e) => setChildForm({ ...childForm, whatsappPhone: e.target.value })}
                        placeholder="مثال: 01012345678"
                        className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-mono font-bold text-[#1c1c19]"
                      />
                    </div>
                  </>
                )}

                {selectedRole === 'parent' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-[#5a403c] mb-1">
                        رقم موبايل ولي الأمر (إجباري):
                      </label>
                      <input
                        type="tel"
                        required
                        value={childForm.parentPhone}
                        onChange={(e) => setChildForm({ ...childForm, parentPhone: e.target.value })}
                        placeholder="مثال: 01229876543"
                        className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-mono font-bold text-[#1c1c19]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#5a403c] mb-1">
                        رقم موبايل ولي الأمر (واتساب) (إجباري):
                      </label>
                      <input
                        type="tel"
                        required
                        value={childForm.parentWhatsappPhone}
                        onChange={(e) => setChildForm({ ...childForm, parentWhatsappPhone: e.target.value })}
                        placeholder="مثال: 01229876543"
                        className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-mono font-bold text-[#1c1c19]"
                      />
                    </div>
                  </>
                )}

                {selectedRole === 'child' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-[#5a403c] mb-1">
                        رقم موبايل الكشاف الشخصي (اختياري):
                      </label>
                      <input
                        type="tel"
                        value={childForm.childPhone}
                        onChange={(e) => setChildForm({ ...childForm, childPhone: e.target.value })}
                        placeholder="مثال: 01012345678"
                        className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-mono font-bold text-[#1c1c19]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#5a403c] mb-1">
                        رقم موبايل الكشاف (واتساب) (اختياري):
                      </label>
                      <input
                        type="tel"
                        value={childForm.childWhatsappPhone}
                        onChange={(e) => setChildForm({ ...childForm, childWhatsappPhone: e.target.value })}
                        placeholder="مثال: 01012345678"
                        className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-mono font-bold text-[#1c1c19]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#5a403c] mb-1">
                        رقم موبايل ولي الأمر (إجباري):
                      </label>
                      <input
                        type="tel"
                        required
                        value={childForm.parentPhone}
                        onChange={(e) => setChildForm({ ...childForm, parentPhone: e.target.value })}
                        placeholder="مثال: 01229876543"
                        className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-mono font-bold text-[#1c1c19]"
                      />
                    </div>
                  </>
                )}

                {/* Address Section */}
                <div className="pt-2 border-t border-[#e5e2dd] space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#5a403c] mb-1">
                        رقم العمارة (اختياري):
                      </label>
                      <input
                        type="text"
                        value={childForm.buildingNo}
                        onChange={(e) => setChildForm({ ...childForm, buildingNo: e.target.value })}
                        placeholder="مثال: 5 أو عمارة الأمل"
                        className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-bold text-[#1c1c19]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#5a403c] mb-1">
                        اسم الشارع (اختياري):
                      </label>
                      <input
                        type="text"
                        value={childForm.streetName}
                        onChange={(e) => setChildForm({ ...childForm, streetName: e.target.value })}
                        placeholder="مثال: شارع الكنيسة"
                        className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-bold text-[#1c1c19]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#5a403c] mb-1">
                      تفاصيل العنوان (إجباري):
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={childForm.addressDetails}
                      onChange={(e) => setChildForm({ ...childForm, addressDetails: e.target.value })}
                      placeholder="مثال: بني الجمهورية، الدور الثالث، شقة 5"
                      className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-bold text-[#1c1c19]"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#8b0000] hover:bg-[#610000] text-white font-extrabold text-xs shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>
                    {selectedRole === 'child' && 'اعتماد وقيد الكشاف وإصدار الكارنيه ➔'}
                    {selectedRole === 'leader' && 'اعتماد قيد القائد/الجوال وتسجيل الحساب ➔'}
                    {selectedRole === 'parent' && 'اعتماد قيد ولي الأمر ومتابعة الأبناء ➔'}
                  </span>
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW MODE 4: PASSWORD RESET & OTP                   */}
        {/* ---------------------------------------------------- */}
        {viewMode === 'reset_password' && (
          <div className="space-y-4 sm:space-y-5">
            {/* Header Banner - Minimalist (No background, No border) */}
            <div className="space-y-3 pb-3 border-b border-[#e5e2dd]">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="px-3 py-1.5 rounded-xl bg-[#f6f3ee] hover:bg-[#e5e2dd] text-[#8b0000] font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer border border-[#e5e2dd]"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  <span>رجوع لتسجيل الدخول</span>
                </button>

                <span className="px-3 py-1 rounded-full bg-amber-100 text-[#7e5713] font-black text-[10px] border border-amber-300">
                  منظومة أمان الكشافة
                </span>
              </div>

              <div className="flex items-center justify-center gap-3 pt-1">
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-amber-50 p-1 shadow-sm border-2 border-amber-400 flex items-center justify-center shrink-0">
                  <img
                    src="/logo.png"
                    alt="شعار مجموعة جنود المسيح"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h2 className="font-black text-base sm:text-lg text-[#610000]">رحلة استعادة كلمة السر</h2>
              </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-around p-2 bg-[#f6f3ee] rounded-2xl text-xs font-bold border flex-wrap gap-1">
              <span className={`px-2.5 py-1 rounded-xl ${resetStep >= 1 ? 'bg-[#8b0000] text-white' : 'text-[#8e706b]'}`}>
                1. إدخال الكود ✓
              </span>
              <span className={`px-2.5 py-1 rounded-xl ${resetStep >= 2 ? 'bg-[#7e5713] text-white' : 'text-[#8e706b]'}`}>
                2. كود التحقق 💬
              </span>
              <span className={`px-2.5 py-1 rounded-xl ${resetStep >= 3 ? 'bg-emerald-700 text-white' : 'text-[#8e706b]'}`}>
                3. كلمة السر 🔑
              </span>
            </div>

            {/* Step 1: Identify Account */}
            {resetStep === 1 && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-3">
                <h4 className="font-black text-xs text-[#610000]">الخطوة 1: تحديد الحساب الكشفي</h4>
                <p className="text-xs text-[#5a403c]">
                  أدخل كود الطفل/العضو الكشفي أو رقم موبايل ولي الأمر لاستلام رمز التحقق الفوري.
                </p>

                <input
                  type="text"
                  value={resetCodeInput}
                  onChange={(e) => setResetCodeInput(e.target.value)}
                  placeholder="كود الكشاف أو رقم الموبايل..."
                  className="w-full p-3 bg-white rounded-xl border border-[#e5e2dd] text-xs font-mono font-bold text-[#1c1c19]"
                />

                <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold">
                  ✓ تم التعرف على الكشاف: كيرلس مينا وجيه (فرقة الفتيان)
                </div>

                <button
                  onClick={() => setResetStep(2)}
                  className="w-full py-3 rounded-xl bg-[#8b0000] text-white font-bold text-xs shadow hover:bg-[#610000]"
                >
                  إرسال رمز التحقق OTP ➔
                </button>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {resetStep === 2 && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-black text-xs text-[#610000]">الخطوة 2: كود التحقق السريع</h4>
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">مباشر</span>
                </div>

                <p className="text-xs text-[#5a403c] leading-relaxed">
                  تم إرسال رمز أمان مكون من 4 أرقام عبر SMS وواتساب للرقم المسجل (0122****) الخاص بولي أمر الكشاف.
                </p>

                <div className="flex justify-center gap-2 sm:gap-3 dir-ltr">
                  {otpDigits.map((d, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={d}
                      onChange={(e) => {
                        const newD = [...otpDigits];
                        newD[i] = e.target.value;
                        setOtpDigits(newD);
                      }}
                      className="w-10 h-12 sm:w-12 sm:h-14 bg-red-100 text-[#8b0000] border border-red-300 rounded-2xl text-center font-mono font-black text-xl sm:text-2xl shadow-inner"
                    />
                  ))}
                </div>

                <div className="text-center text-xs font-bold text-[#7e5713]">
                  ⏱️ إعادة الإرسال بعد: 00:45 | <button onClick={() => alert('تم إعادة إرسال الرمز')} className="text-[#8b0000] underline">إعادة إرسال الآن</button>
                </div>

                <button
                  onClick={() => setResetStep(3)}
                  className="w-full py-3 rounded-xl bg-[#8b0000] text-white font-bold text-xs shadow hover:bg-[#610000]"
                >
                  تأكيد كود التحقق 🔗
                </button>
              </div>
            )}

            {/* Step 3: Set New Password */}
            {resetStep === 3 && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-3">
                <h4 className="font-black text-xs text-[#610000]">الخطوة 3: تعيين كلمة المرور الجديدة</h4>
                <p className="text-xs text-[#5a403c]">
                  يرجى اختيار كلمة سر قوية للحفاظ على بيانات شارات وسجلات الكشاف.
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-[#5a403c] mb-1">كلمة السر الجديدة:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-bold text-[#1c1c19]"
                  />
                  <div className="flex items-center gap-1.5 pt-1 text-[10px] text-emerald-700 font-bold">
                    <span>قوة كلمة المرور: قوية جداً ✓</span>
                    <div className="flex-1 flex gap-1 h-1.5">
                      <span className="flex-1 bg-emerald-600 rounded"></span>
                      <span className="flex-1 bg-emerald-600 rounded"></span>
                      <span className="flex-1 bg-emerald-600 rounded"></span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#5a403c] mb-1">تأكيد كلمة السر الجديدة:</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-[#e5e2dd] text-xs font-bold text-[#1c1c19]"
                  />
                </div>

                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-[#7e5713] font-bold space-y-1">
                  <div>✓ 8 أحرف على الأقل</div>
                  <div>✓ رقم واحد على الأقل</div>
                  <div>✓ رمز خاص ($#@)</div>
                </div>

                <button
                  onClick={() => setResetStep(4)}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow"
                >
                  حفظ كلمة السر الجديدة 💾
                </button>
              </div>
            )}

            {/* Step 4: Reset Success */}
            {resetStep === 4 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-amber-800">workspace_premium</span>
                <h4 className="font-black text-sm text-[#8b0000]">تم تغيير كلمة السر بنجاح! 🚀</h4>
                <p className="text-xs leading-relaxed">
                  تم تحديث كلمة المرور الخاصة بحسابك في مجموعة جنود المسيح. يمكنك الآن تسجيل الدخول لمتابعة التقييمات والشارات الأسبوعية.
                </p>
                <button
                  onClick={() => { setViewMode('login'); setResetStep(1); }}
                  className="w-full py-3 rounded-xl bg-[#8b0000] text-white font-bold text-xs shadow hover:bg-[#610000]"
                >
                  الانتقال لشاشة الدخول المباشر ➔
                </button>
              </div>
            )}

            <div className="text-center text-[10px] text-[#8e706b]">
              ❓ تواجه مشكلة في استلام الكود؟ <button onClick={() => alert('التواصل مع قائد الفرقة')} className="text-[#8b0000] font-bold underline">تواصل مع قائد الفرقة الكشفية</button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
