import React, { useState } from 'react';
import confetti from 'canvas-confetti';

export const HallsReservationModule = () => {
  const [selectedSector, setSelectedSector] = useState('فريق المارش الكشفي والطبول');
  const [selectedHall, setSelectedHall] = useState('القاعة العليا (مجهزة بنظام صوتي وعارض)');
  const [selectedSlots, setSelectedSlots] = useState(['04:00 م', '07:00 م']);
  const [reservationConfirmed, setReservationConfirmed] = useState(false);

  const timeSlots = [
    { time: '08:00 ص', status: 'available' },
    { time: '09:00 ص', status: 'available' },
    { time: '10:00 ص', status: 'booked', note: 'مدارس أحد' },
    { time: '11:00 ص', status: 'booked', note: 'مدارس أحد' },
    { time: '12:00 ظ', status: 'available' },
    { time: '01:00 م', status: 'available' },
    { time: '02:00 م', status: 'available' },
    { time: '03:00 م', status: 'available' },
    { time: '04:00 م', status: 'selected' },
    { time: '05:00 م', status: 'booked', note: 'تسبحة' },
    { time: '06:00 م', status: 'booked', note: 'تسبحة' },
    { time: '07:00 م', status: 'selected' },
    { time: '08:00 م', status: 'available' },
    { time: '09:00 م', status: 'available' },
    { time: '10:00 م', status: 'available' },
  ];

  const toggleSlot = (time, status) => {
    if (status === 'booked') return;
    if (selectedSlots.includes(time)) {
      setSelectedSlots(selectedSlots.filter(t => t !== time));
    } else {
      setSelectedSlots([...selectedSlots, time]);
    }
  };

  const handleConfirmReservation = () => {
    if (selectedSlots.length === 0) {
      alert('برجاء اختيار فترة زمنية واحدة على الأقل');
      return;
    }
    setReservationConfirmed(true);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  return (
    <div className="space-y-6 text-right pb-10" dir="rtl">
      {/* Top Header Banner matching standard theme */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[32px]">meeting_room</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-lg sm:text-xl text-[#610000]">تنسيق قاعات ومقرات الخدمة</h1>
            </div>
          </div>
        </div>

        <span className="px-3.5 py-1.5 bg-[#ffddb1] text-[#291800] rounded-full text-xs font-black border border-amber-300 self-start sm:self-auto">
          الجمعة، 24 مايو 2026
        </span>
      </div>

      {/* Main Form Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-5">
        {/* Sector Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#5a403c]">
            👥 قطاع الخدمة التابع له الحجز (12 خدمة):
          </label>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full p-3.5 bg-[#f6f3ee] rounded-2xl border border-[#e5e2dd] text-xs font-extrabold text-[#1c1c19] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
          >
            <option value="فريق المارش الكشفي والطبول">فريق المارش الكشفي والطبول</option>
            <option value="فرقة الأشبال والزهرات">فرقة الأشبال والزهرات</option>
            <option value="فرقة الكشافة والمرشدات">فرقة الكشافة والمرشدات</option>
            <option value="فرقة المتقدم والجوالة">فرقة المتقدم والجوالة</option>
            <option value="مجلس القيادة الأعلى">مجلس القيادة الأعلى</option>
          </select>
        </div>

        {/* Hall Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#5a403c]">
            🏛️ القاعة / الغرفة المراد حجزها (10 قاعات):
          </label>
          <select
            value={selectedHall}
            onChange={(e) => setSelectedHall(e.target.value)}
            className="w-full p-3.5 bg-[#f6f3ee] rounded-2xl border border-[#e5e2dd] text-xs font-extrabold text-[#1c1c19] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
          >
            <option value="القاعة العليا (مجهزة بنظام صوتي وعارض)">القاعة العليا (مجهزة بنظام صوتي وعارض)</option>
            <option value="قاعة مارجرجس المفتوحة">قاعة مارجرجس المفتوحة</option>
            <option value="مسرح الكنيسة الرئيسي">مسرح الكنيسة الرئيسي</option>
            <option value="غرفة الاجتماعات المركزية">غرفة الاجتماعات المركزية</option>
          </select>
        </div>

        {/* Capacity Strip Pill */}
        <div className="p-4 bg-[#ffddb1]/40 rounded-2xl border border-[#7e5713]/30 flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-[#291800]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7e5713]">info</span>
            <span>السعة الاستيعابية: <strong className="font-mono text-sm text-[#8b0000]">120 مقعد</strong></span>
          </div>
          <span className="px-3 py-1 bg-white rounded-full text-[#7e5713] border border-[#7e5713]/20">
            تكييف مركزي + داتاشو
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 p-3 bg-[#fcf9f4] rounded-2xl border border-[#e5e2dd] text-xs font-bold text-[#5a403c] flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> 🟢 متاح</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#8b0000]"></span> 🔴 محدد لك</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-300"></span> ⚪ محجوز مسبقاً</span>
        </div>

        {/* Time Slots Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-xs text-[#1c1c19] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#7e5713]">schedule</span>
              <span>الفترات الزمنية (8 ص - 11 م)</span>
            </h4>
            <span className="text-xs font-extrabold text-[#8b0000] bg-[#ffdad4] px-3 py-1 rounded-full">
              {selectedSlots.length} ساعات مختارة
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 text-xs font-bold">
            {timeSlots.map((slot, idx) => {
              const isSelected = selectedSlots.includes(slot.time);
              const isBooked = slot.status === 'booked';
              return (
                <button
                  key={idx}
                  disabled={isBooked}
                  onClick={() => toggleSlot(slot.time, slot.status)}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    isBooked
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-80'
                      : isSelected
                      ? 'bg-[#8b0000] text-white border-[#8b0000] shadow-md scale-102 font-black'
                      : 'bg-[#f6f3ee] text-[#1c1c19] border-[#e5e2dd] hover:bg-[#ebe8e3]'
                  }`}
                >
                  <span className="font-mono text-sm">{slot.time}</span>
                  <span className="text-[10px] mt-0.5">
                    {isBooked ? slot.note : isSelected ? 'محدد لك ✓' : 'متاح 🟢'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirmReservation}
          className="w-full py-4 rounded-2xl bg-[#8b0000] hover:bg-[#610000] text-white font-extrabold text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">check_circle</span>
          <span>تأكيد حجز القاعة فورياً</span>
        </button>

        {reservationConfirmed && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold text-center space-y-1">
            <p>✅ تم تأكيد حجز ({selectedHall}) لقطاع ({selectedSector}) بنجاح!</p>
            <p className="text-[11px] text-emerald-800">تم إرسال إشعار التأكيد لمسؤول القاعات في الكنيسة.</p>
          </div>
        )}
      </div>
    </div>
  );
};
