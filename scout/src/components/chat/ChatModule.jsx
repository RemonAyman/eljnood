import React, { useState } from 'react';
import { useScout } from '../../context/ScoutContext';

export const ChatModule = () => {
  const { currentUser, messages, addChatMessage } = useScout();
  const role = currentUser?.role || 'admin';

  const channels = [
    { id: 'leaders', name: 'قادة وجوالة القطاع', icon: 'fa-solid fa-medal', count: '24 قائد وجوال', badge: 'تنسيق الميدان', unread: 0, roles: ['admin', 'sector_head', 'leader', 'rovers'] },
    { id: 'heads', name: 'رؤوساء القطاعات ومجلس القيادة', icon: 'fa-solid fa-shield-halved', count: 'مشفرة ومحمية', badge: 'سرية', unread: 2, roles: ['admin', 'sector_head'] },
    { id: 'troop', name: 'طليعة النسر والأنشطة', icon: 'fa-solid fa-feather-pointed', count: '18 عضو', badge: 'أنشطة ومسابقات', unread: 0, roles: ['admin', 'sector_head', 'leader', 'child', 'parent'] },
    { id: 'general', name: 'الكشافة العامة (الجميع)', icon: 'fa-solid fa-users', count: '142 عضو', badge: 'إعلانات وتكريمات', unread: 0, roles: ['admin', 'sector_head', 'festival_leader', 'leader', 'rovers', 'child', 'parent', 'sub_officer'] },
  ];

  const visibleChannels = channels.filter(ch => ch.roles.includes(role));
  const [activeChannel, setActiveChannel] = useState(visibleChannels[0]?.id || 'general');
  const [inputText, setInputText] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    addChatMessage(activeChannel, inputText.trim());
    setInputText('');
  };

  return (
    <div className="space-y-6">

      {/* Top Header Banner matching standard theme */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <i className="fa-solid fa-comments text-[32px]"></i>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-lg sm:text-xl text-[#610000]">مركز غرف المراسلات الكشفية المتخصصة</h1>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowBroadcastModal(true)}
          className="flex items-center gap-2 bg-[#8b0000] hover:bg-[#610000] text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-md transition shrink-0 self-start sm:self-auto"
        >
          <i className="fa-solid fa-bullhorn text-[18px]"></i>
          <span>إرسال تعميم كشفي موجه</span>
        </button>
      </div>

      {/* 2. 3-Column Chat Workstation matching Image 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start h-[680px]">

        {/* Left Column (3 Cols): Room Info, Shared Documents, Online Leaders */}
        <div className="xl:col-span-3 bg-white p-4 rounded-2xl border border-[#e5e2dd] shadow-sm space-y-4 overflow-y-auto h-full">
          {/* Room Profile Card */}
          <div className="text-center p-4 bg-[#fcf9f4] rounded-xl border border-[#e5e2dd] space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#8b0000] text-[#ffddb1] flex items-center justify-center mx-auto shadow border border-[#ffddb1]/30">
              <i className="fa-solid fa-medal text-3xl"></i>
            </div>
            <h3 className="font-extrabold text-sm text-[#610000]">غرفة قادة وجوالة القطاع</h3>
            <p className="text-[10px] text-[#5a403c]">تأسست: سبتمبر 2024</p>
            <p className="text-[11px] text-[#5a403c] leading-relaxed">
              الغرفة الرسمية المعتمدة لإدارة الميدان والمعسكرات وتوزيع المهام.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-[#e5e2dd]">
              <div className="p-2 bg-white rounded-lg">
                <span className="font-extrabold text-[#8b0000] block">24</span>
                <span className="text-[10px] text-[#5a403c]">قائد نشط</span>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <span className="font-extrabold text-[#7e5713] block">38</span>
                <span className="text-[10px] text-[#5a403c]">وثيقة وملف</span>
              </div>
            </div>
          </div>

          {/* Shared Documents Section */}
          <div className="space-y-2 text-xs">
            <span className="font-bold text-[#8e706b] block">الوسائط والمستندات المشتركة (38 ملف):</span>
            <div className="p-2.5 bg-[#f6f3ee] rounded-xl border border-[#e5e2dd] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-file-pdf text-[#8b0000]"></i>
                <div>
                  <h4 className="font-bold text-[#1c1c19] text-[11px]">خريطة طوبوغرافية...</h4>
                  <span className="text-[9px] text-[#5a403c]">5.2 MB • 22 أكتوبر</span>
                </div>
              </div>
              <i className="fa-solid fa-download text-[#7e5713] text-sm cursor-pointer"></i>
            </div>
          </div>

          {/* Active Online Leaders Section */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#8e706b]">القادة الحاضرون بالغرفة:</span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">24 متصل</span>
            </div>

            <div className="space-y-1.5">
              {[
                { name: 'ق. مينا سمير', role: 'قائد عام المجموعة (Admin)', active: true },
                { name: 'ق. بيشوي حنا', role: 'قائد جوالة أول', active: true },
                { name: 'ق. رمزي كميل', role: 'قائد قطاع الأشبال', active: true },
                { name: 'ق. يوسف وهبة', role: 'مساعد قائد معسكر', active: false },
              ].map((l, i) => (
                <div key={i} className="p-2 bg-[#fcf9f4] rounded-lg border border-[#e5e2dd] flex items-center gap-2 text-[11px]">
                  <div className="w-6 h-6 rounded-full bg-[#8b0000] text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    {l.name.charAt(3)}
                  </div>
                  <div className="overflow-hidden">
                    <h5 className="font-bold text-[#1c1c19] truncate">{l.name}</h5>
                    <p className="text-[9px] text-[#5a403c] truncate">{l.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column (6 Cols): Active Chat Stream & Message Input */}
        <div className="xl:col-span-6 bg-white rounded-2xl border border-[#e5e2dd] shadow-sm flex flex-col justify-between overflow-hidden h-full">
          {/* Active Channel Header */}
          <div className="p-4 bg-[#f6f3ee] border-b border-[#e5e2dd] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#8b0000] text-white flex items-center justify-center font-bold shadow">
                <i className="fa-solid fa-medal text-[20px]"></i>
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#610000]">غرفة قادة وجوالة القطاع</h3>
                <p className="text-[10px] text-[#5a403c]">24 قائد وجوال • متصل الآن • معسكر وادي النطرون 2026</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-[#ffddb1] text-[#291800] rounded-full text-[10px] font-bold">
              تشفير كنسي
            </span>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#fcf9f4]">
            {/* Pinned Announcement Message */}
            <div className="p-4 rounded-xl bg-[#ffdad4] border border-[#8b0000]/30 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-[#8b0000]">
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-certificate text-[18px]"></i>
                  أمر قيادي عام من قائد المجموعة
                </span>
                <span className="text-[10px]">09:15 ص</span>
              </div>
              <p className="text-xs font-bold text-[#610000] leading-relaxed">
                تحية كشفية مقدسة ⚜️ .. يُرجى من جميع مسؤولي الطلائع والجوّالة الانتهاء من حصر المهمات وتوزيع النوبتجيات الخاصة بحراسة سارية العلم وحفل السمر غداً في موعد أقصاه الساعة 5 مساءً.
              </p>
              <div className="text-[10px] text-[#7e5713] font-bold text-left pt-1">
                قائد عام الكشافة: ق. مينا سمير
              </div>
            </div>

            {/* Chat Message items */}
            <div className="flex flex-col items-start gap-1 max-w-[85%]">
              <span className="text-[10px] font-bold text-[#5a403c]">ق. بيشوي حنا • قائد جوالة ثاني • 10:05 ص</span>
              <div className="p-3.5 rounded-2xl bg-white border border-[#e5e2dd] text-xs text-[#1c1c19] leading-relaxed shadow-sm">
                سلام ونعمة يا قادة، تم تجهيز خط سير الرحلة الخلوية لنقطة جبل مريم ووضع الإشارات الكشفية السرية على المسار الصخري.
              </div>
            </div>

            <div className="flex flex-col items-start gap-1 max-w-[85%]">
              <span className="text-[10px] font-bold text-[#5a403c]">ق. مينا رمزي • أمين عهدة المخازن • 10:48 ص</span>
              <div className="p-3 rounded-2xl bg-white border border-[#e5e2dd] space-y-2 text-xs">
                <div className="p-2.5 bg-[#f6f3ee] rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-file-pdf text-[#8b0000] text-2xl"></i>
                    <div>
                      <h5 className="font-bold text-[#1c1c19] text-xs">دليل_المعسكر_الكشفي...</h5>
                      <span className="text-[10px] text-[#5a403c]">3.8 ميجابايت • تم التحقق</span>
                    </div>
                  </div>
                  <i className="fa-solid fa-download text-[#7e5713] text-lg"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Message Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#e5e2dd] flex gap-2 items-center">
            <button type="button" onClick={() => alert('إرفاق ملف أو صورة...')} className="p-2 text-[#5a403c] hover:bg-[#f6f3ee] rounded-lg">
              <i className="fa-solid fa-paperclip text-[20px]"></i>
            </button>
            <input
              type="text"
              placeholder="اكتب تعليماتك أو رسالتك للغرفة..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#f6f3ee] px-4 py-2.5 rounded-xl text-xs text-[#1c1c19] border border-[#e5e2dd] focus:outline-none focus:ring-2 focus:ring-[#8b0000]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#8b0000] hover:bg-[#610000] text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1"
            >
              <span>إرسال</span>
              <i className="fa-solid fa-paper-plane text-[16px]"></i>
            </button>
          </form>
        </div>

        {/* Right Column (3 Cols): Channels List & Urgent Alerts */}
        <div className="xl:col-span-3 bg-white p-4 rounded-2xl border border-[#e5e2dd] shadow-sm space-y-4 overflow-y-auto h-full">
          <div className="relative">
            <input
              type="text"
              placeholder="البحث في القنوات..."
              className="w-full bg-[#f6f3ee] px-3 py-2 pr-9 rounded-xl text-xs border border-[#e5e2dd]"
            />
            <i className="fa-solid fa-magnifying-glass text-[18px] text-[#8e706b] absolute right-2.5 top-2.5"></i>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#8e706b] block">الغرف الكشفية الرسمية:</span>
            {visibleChannels.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`w-full text-right p-3 rounded-xl border transition flex items-center gap-3 ${activeChannel === ch.id
                    ? 'bg-[#ffdad4] border-[#8b0000] text-[#610000]'
                    : 'bg-[#fcf9f4] border-[#e5e2dd] text-[#1c1c19] hover:bg-[#f6f3ee]'
                  }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#8b0000] text-white flex items-center justify-center font-bold shrink-0">
                  <i className={`${ch.icon} text-[16px]`}></i>
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-xs truncate">{ch.name}</h4>
                  <p className="text-[10px] text-[#5a403c] truncate">{ch.count}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 bg-[#ffddb1] rounded-xl border border-[#7e5713]/30 text-center space-y-2 text-xs">
            <i className="fa-solid fa-podcast text-2xl text-[#291800]"></i>
            <h4 className="font-bold text-[#291800]">محطة التنبيهات الكشفية العاجلة</h4>
            <p className="text-[10px] text-[#7e5713]">إطلاق نداء طوارئ أو تعليمات تجميع للقطاعات</p>
            <button onClick={() => setShowBroadcastModal(true)} className="w-full py-2 bg-[#8b0000] text-white font-bold rounded-lg text-xs">
              فتح نافذة الإشارة السريعة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
