import React from 'react';

export const InventoryModule = () => {
  return (
    <div className="space-y-6 text-right pb-10" dir="rtl">
      {/* Top Header Banner matching standard theme */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[32px]">inventory_2</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-lg sm:text-xl text-[#610000]">طلب العهد والمهمات الكشفية والمخازن</h1>
            </div>
          </div>
        </div>

        <span className="px-3.5 py-1.5 bg-[#ffddb1] text-[#291800] rounded-full text-xs font-black border border-amber-300 self-start sm:self-auto">
          عهدة المجموعة 2026
        </span>
      </div>

      {/* Main Inventory Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#e5e2dd] shadow-sm space-y-5">
        <h3 className="font-black text-sm text-[#610000] flex items-center gap-2 border-b border-[#f0ede9] pb-3">
          <span className="material-symbols-outlined text-[#7e5713]">inventory_2</span>
          <span>قائمة العهد الكشفية المتوفرة بالمخزن</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'خيمة 8 أفراد قماشية', count: '14 متوفرة بالمخزن', icon: 'camping' },
            { title: 'سارية علم ثلاثية ألومنيوم', count: '6 متوفرة بالمخزن', icon: 'flag' },
            { title: 'طقم طبول مارش كشفي (8 قطع)', count: '2 طقم متوفر', icon: 'music_note' },
            { title: 'كشافات إضاءة وسماعات خروج', count: '10 قطع متوفرة', icon: 'speaker' },
            { title: 'عصا كشفية / شوم (زوان)', count: '50 قطعة متوفرة', icon: 'straighten' },
            { title: 'حبال رباطات وسميكة للمعارض', count: '25 حبل متوفر', icon: 'line_style' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#fcf9f4] border border-[#e5e2dd] space-y-3 flex flex-col justify-between hover:border-amber-300 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-[#8b0000] flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#1c1c19]">{item.title}</h4>
                  <span className="text-[11px] text-[#7e5713] font-bold">{item.count}</span>
                </div>
              </div>
              <button
                onClick={() => alert(`تم إرسال طلب استلام (${item.title}) لمسؤول المخزن بنجاح!`)}
                className="w-full py-2.5 bg-[#8b0000] text-white text-xs font-bold rounded-xl shadow hover:bg-[#610000] transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">send</span>
                <span>طلب استلام</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
