import React, { useState } from 'react';
import { useScout } from '../../context/ScoutContext';

export const LeaderFieldVisitationModule = () => {
  const {
    currentUser,
    visitationAssignments,
    completeVisitationTask
  } = useScout();

  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'completed'
  const [selectedTask, setSelectedTask] = useState(null);

  // Form completion state
  const [completionForm, setCompletionForm] = useState({
    visitationType: 'زيارة منزلية',
    feedback: '',
    updatedChildPhone: '',
    updatedParentPhone: '',
    updatedAddress: '',
    giftDelivered: false
  });

  // Filter tasks assigned to the logged-in leader or rover
  const myAssignedTasks = (visitationAssignments || []).filter(task => {
    // Show tasks assigned to current user name or role
    const matchUser = task.assignedToName?.includes(currentUser.name) ||
                      task.assignedToId === currentUser.id ||
                      currentUser.role === 'admin' ||
                      (currentUser.role === 'leader') ||
                      (currentUser.role === 'sector_head' && currentUser.sector === task.sector);
    
    if (!matchUser) return false;
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    return true;
  });

  const handleOpenCompleteModal = (task) => {
    setSelectedTask(task);
    setCompletionForm({
      visitationType: task.visitationType || 'زيارة منزلية',
      feedback: task.feedback || '',
      updatedChildPhone: task.updatedChildPhone || '',
      updatedParentPhone: task.updatedParentPhone || '',
      updatedAddress: task.updatedAddress || '',
      giftDelivered: task.giftDelivered || false
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!completionForm.feedback.trim()) {
      alert('يرجى كتابة ملاحظات وتأثير الافتقاد في الخانة المخصصة.');
      return;
    }

    completeVisitationTask(selectedTask.id, completionForm);
    setSelectedTask(null);
    alert('تم إنجاز التكليف وإرسال تقرير الافتقاد وتحديث البيانات بنجاح!');
  };

  return (
    <div className="space-y-6 text-right pb-10" dir="rtl">
      {/* 1. Header Banner */}
      <div className="bg-white p-5 rounded-3xl border border-[#e5e2dd] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#8b0000] text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <i className="fa-solid fa-person-walking text-[32px]"></i>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-lg sm:text-xl text-[#610000]">
                مهام افتقاد المخدومين والزيارات الميدانية
              </h1>
              <span className="bg-[#ffddb1] text-[#291800] text-xs px-2.5 py-0.5 rounded-full font-black border border-amber-300">
                صفحة القادة والجوالة 🏃‍♂️
              </span>
              <span className="bg-sky-100 text-sky-900 text-xs px-2.5 py-0.5 rounded-full font-black border border-sky-300">
                حساب: {currentUser.name} ⚜️
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-[#e5e2dd] shadow-sm flex flex-wrap items-center gap-2 text-xs font-bold">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-[#8b0000] text-white shadow-sm font-black'
              : 'bg-[#f6f3ee] text-[#5a403c] hover:bg-[#ebe8e3]'
          }`}
        >
          <span>جميع التكليفات ({myAssignedTasks.length})</span>
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            filterStatus === 'pending'
              ? 'bg-[#8b0000] text-white shadow-sm font-black'
              : 'bg-[#f6f3ee] text-[#5a403c] hover:bg-[#ebe8e3]'
          }`}
        >
          <span>قيد الانتظار ⏳ ({(visitationAssignments || []).filter(t => t.status === 'pending').length})</span>
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
            filterStatus === 'completed'
              ? 'bg-[#8b0000] text-white shadow-sm font-black'
              : 'bg-[#f6f3ee] text-[#5a403c] hover:bg-[#ebe8e3]'
          }`}
        >
          <span>تم الافتقاد ✅ ({(visitationAssignments || []).filter(t => t.status === 'completed').length})</span>
        </button>
      </div>

      {/* Task Cards Grid */}
      {myAssignedTasks.length === 0 ? (
        <div className="bg-[#fcf9f4] border border-[#e5e2dd] rounded-3xl p-12 text-center text-gray-500 space-y-3">
          <i className="fa-solid fa-clipboard-check text-6xl text-amber-700/40"></i>
          <h3 className="text-lg font-bold text-gray-700">لا توجد تكليفات افتقاد حالية متطابقة</h3>
          <p className="text-sm text-gray-500">سوف تظهر هنا أسماء المخدومين المكلف بافتقادهم فور توزيعهم من رئيس القطاع.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myAssignedTasks.map((task) => {
            const isDone = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`bg-[#fcf9f4] border rounded-3xl shadow-sm p-6 space-y-4 transition ${
                  isDone ? 'border-emerald-300 bg-emerald-50/20' : 'border-[#e5e2dd] hover:border-amber-400'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-300">
                        {task.sectorName || task.sector}
                      </span>
                      <span className="text-xs font-mono font-black text-amber-800">#{task.memberCode}</span>
                      {!isDone && (
                        <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-rose-700 shadow-2xs flex items-center gap-1 animate-pulse">
                          <i className="fa-solid fa-triangle-exclamation text-xs"></i>
                          🚨 متأخر 30+ يوم
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-xl text-gray-900 mt-1">{task.memberName}</h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    <i className={`${isDone ? 'fa-solid fa-circle-check text-emerald-600' : 'fa-solid fa-clock text-amber-600'} text-sm`}></i>
                    {isDone ? 'تم الافتقاد ✅' : 'قيد التنفيذ ⏳'}
                  </span>
                </div>

                {/* Visitation Details */}
                <div className="space-y-2 text-xs font-medium text-gray-700">
                  <p className="flex items-center gap-2">
                    <i className="fa-solid fa-location-arrow text-amber-800 text-base"></i>
                    <span className="font-bold text-gray-900">الوسيلة المطلوبة:</span> {task.visitationType}
                  </p>
                  <p className="flex items-center gap-2">
                    <i className="fa-solid fa-calendar text-amber-800 text-base"></i>
                    <span className="font-bold text-gray-900">تاريخ الاستهداف:</span> {task.targetDate || 'خلال هذا الأسبوع'}
                  </p>
                </div>

                {/* Feedback Report Box (if completed) */}
                {isDone && task.feedback && (
                  <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 space-y-1.5 text-xs">
                    <span className="font-extrabold text-emerald-900 block flex items-center gap-1">
                      <i className="fa-solid fa-comment-dots text-base"></i>
                      تقرير وفيدباك الافتقاد المرفوع:
                    </span>
                    <p className="text-gray-700 leading-relaxed font-semibold">{task.feedback}</p>
                    {task.giftDelivered && (
                      <span className="inline-block bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-purple-200 mt-1">
                        🎁 تم تسليم الهدايا / الكارنيه
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenCompleteModal(task)}
                    className={`w-full py-3 rounded-2xl font-black text-xs transition flex items-center justify-center gap-2 shadow cursor-pointer ${
                      isDone
                        ? 'bg-white hover:bg-gray-100 text-emerald-800 border border-emerald-300'
                        : 'bg-[#8b0000] hover:bg-[#610000] text-white shadow-lg'
                    }`}
                  >
                    <i className={`${isDone ? 'fa-solid fa-pen-nib text-emerald-800' : 'fa-solid fa-circle-check text-white'} text-base`}></i>
                    <span>{isDone ? 'تعديل الفيدباك والتفاصيل' : 'تسجيل وتأكيد الافتقاد ✅'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMPLETION MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-amber-300 my-auto">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div>
                <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {selectedTask.sectorName}
                </span>
                <h3 className="text-lg font-extrabold text-[#8b0000] mt-1">
                  تسجيل فيدباك افتقاد: {selectedTask.memberName}
                </h3>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-bold">
              {/* Visitation Method */}
              <div>
                <label className="block text-gray-700 mb-1">وسيلة الافتقاد المنفذة:</label>
                <select
                  value={completionForm.visitationType}
                  onChange={(e) => setCompletionForm(prev => ({ ...prev, visitationType: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl bg-gray-50 text-xs font-bold"
                >
                  <option value="زيارة منزلية">زيارة منزلية 🏠</option>
                  <option value="مكالمة تليفونية">مكالمة تليفونية 📞</option>
                  <option value="لقاء بالكنيسة">لقاء بالكنيسة ⛪</option>
                  <option value="مناسبة وافتقاد صحي">مناسبة وافتقاد صحي 🏥</option>
                </select>
              </div>

              {/* Feedback Text */}
              <div>
                <label className="block text-gray-700 mb-1">تقرير وفيدباك الافتقاد والملاحظات:</label>
                <textarea
                  rows="3"
                  placeholder="تم التواصل مع العضو/الأهل... الروح المعنوية ممتازة، ووعد بالحضور الأسبوع القادم..."
                  value={completionForm.feedback}
                  onChange={(e) => setCompletionForm(prev => ({ ...prev, feedback: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-2xl text-xs leading-relaxed"
                  required
                ></textarea>
              </div>

              {/* Checkbox for Gift / Deliverables */}
              <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200">
                <label className="flex items-center gap-2 text-purple-950 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={completionForm.giftDelivered}
                    onChange={(e) => setCompletionForm(prev => ({ ...prev, giftDelivered: e.target.checked }))}
                    className="accent-purple-700 w-4 h-4"
                  />
                  <span>🎁 تم تسليم هدية العيد / المنديل الكشفي / مستلزمات الخدمة</span>
                </label>
              </div>

              {/* Contact Information Updates (Phone & Address) */}
              <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 space-y-2">
                <span className="font-extrabold text-amber-900 block flex items-center gap-1">
                  <i className="fa-solid fa-phone-volume text-base"></i>
                  تحديث بيانات الاتصال (إذا تغيرت لدى الأهل/العضو):
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-600 block">راتف العضو الجديد:</label>
                    <input
                      type="text"
                      placeholder="01xxxxxxxxx"
                      value={completionForm.updatedChildPhone}
                      onChange={(e) => setCompletionForm(prev => ({ ...prev, updatedChildPhone: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-xl text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-600 block">هاتف ولي الأمر الجديد:</label>
                    <input
                      type="text"
                      placeholder="01xxxxxxxxx"
                      value={completionForm.updatedParentPhone}
                      onChange={(e) => setCompletionForm(prev => ({ ...prev, updatedParentPhone: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-xl text-xs bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-600 block">العنوان والتفاصيل الجديدة:</label>
                  <input
                    type="text"
                    placeholder="شارع / منطقة / رقم شقة جديد..."
                    value={completionForm.updatedAddress}
                    onChange={(e) => setCompletionForm(prev => ({ ...prev, updatedAddress: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-xl text-xs bg-white"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-black text-[#3d0000] bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md"
                >
                  حفظ الفيدباك وتحديث البيانات ✅
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderFieldVisitationModule;
