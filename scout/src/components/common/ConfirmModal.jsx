import React from 'react';

export const ConfirmModal = ({ isOpen, title, message, confirmText, cancelText, type = 'danger', onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const isDanger = type === 'danger' || type === 'delete';
  const isWarning = type === 'warning';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div 
        className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#e5e2dd] shadow-2xl relative space-y-4 my-auto text-center transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#f6f3ee] text-[#5a403c] hover:bg-red-50 hover:text-red-700 font-bold flex items-center justify-center transition border border-[#e5e2dd] cursor-pointer"
          title="إغلاق"
        >
          ✕
        </button>

        {/* Header Icon */}
        <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-inner ${
          isDanger 
            ? 'bg-red-100 text-[#8b0000] border border-red-200' 
            : isWarning 
            ? 'bg-amber-100 text-[#7e5713] border border-amber-200' 
            : 'bg-blue-100 text-blue-900 border border-blue-200'
        }`}>
          <i className={`text-[32px] ${isDanger ? 'fa-solid fa-trash-can' : isWarning ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-question'} text-[36px]`}></i>
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          <h3 className="font-black text-lg text-[#610000]">
            {title || (isDanger ? 'تأكيد الحذف' : 'تأكيد الإجراء')}
          </h3>
          <p className="text-xs sm:text-sm text-[#5a403c] font-medium leading-relaxed px-2">
            {message || 'هل أنت تأكد من رغبتك في إتمام هذا الإجراء؟'}
          </p>
        </div>

        {/* Actions Buttons: Confirm (OK) & Cancel */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#f6f3ee] hover:bg-[#ebe8e3] text-[#5a403c] font-bold text-xs sm:text-sm border border-[#e5e2dd] shadow-sm transition cursor-pointer"
          >
            {cancelText || 'إلغاء (Cancel)'}
          </button>
          
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm text-white shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
              isDanger
                ? 'bg-[#8b0000] hover:bg-[#610000]'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            <i className={`text-[16px] ${isDanger ? 'fa-solid fa-circle-check' : 'fa-solid fa-check'} text-[18px]`}></i>
            <span>{confirmText || (isDanger ? 'تأكيد الحذف (OK)' : 'موافق (OK)')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
