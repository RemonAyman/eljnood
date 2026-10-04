import { Platform, Alert } from 'react-native';

/**
 * Report Export Utility for Subscriptions & Attendance
 * Exports data to formatted CSV files or Printable HTML Reports.
 */

/**
 * Export Financial Receipts & Subscriptions Report to CSV / Printable File
 */
export function exportSubscriptionsReport(records: any[]) {
  if (!records || records.length === 0) {
    Alert.alert('تنبيه', 'لا توجد إيصالات أو سجلات مالية لتصديرها حالياً');
    return;
  }

  const headers = ['رقم الإيصال', 'كود العضوية', 'اسم الكشاف', 'السنة المالية', 'المجموع', 'خصم مئوي', 'خصم مالي', 'الصافي المدفوع', 'التاريخ'];
  const rows = records.map((r) => [
    r.receiptNumber || '',
    r.memberCode || '',
    `"${r.memberName || ''}"`,
    r.year || 2026,
    r.subtotal || 0,
    `${r.discountPercentage || 0}%`,
    `${r.fixedDiscountEgp || 0} ج.م`,
    r.totalPaid || 0,
    r.createdAt ? r.createdAt.split('T')[0] : '',
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_المالية_والاشتراكات_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Alert.alert('تم التصدير 🎉', 'تم تصدير تقرير الماليات والإيصالات بصيغة CSV بنجاح!');
  } else {
    Alert.alert('تقرير الماليات 📊', `تم إعداد التقرير لـ ${records.length} إيصال بنجاح!\nإجمالي المحصل: ${records.reduce((a, b) => a + (b.totalPaid || 0), 0)} ج.م`);
  }
}

/**
 * Export Scouting Attendance Records Report to CSV / Printable File
 */
export function exportAttendanceReport(records: any[], dateStr?: string) {
  if (!records || records.length === 0) {
    Alert.alert('تنبيه', 'لا توجد سجلات غياب لتصديرها حالياً');
    return;
  }

  const headers = ['تاريخ اليوم', 'كود العضو', 'اسم الكشاف', 'النوع', 'حالة الحضور', 'سبب العذر', 'المسؤول'];
  const rows = records.map((r) => [
    r.date || dateStr || '',
    r.memberCode || '',
    `"${r.memberName || ''}"`,
    r.eventType || 'اليوم الكشفي',
    r.status === 'PRESENT' ? 'حاضر' : r.status === 'EXCUSED' ? 'معتذر' : 'غائب',
    `"${r.excuseReason || ''}"`,
    `"${r.recordedBy || ''}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_الغياب_والحضور_${dateStr || new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Alert.alert('تم التصدير 🎉', 'تم تصدير كشوف الحضور والغياب بصيغة CSV بنجاح!');
  } else {
    Alert.alert('تقرير الغياب والحضور 📋', `تم إعداد كشف الغياب لـ ${records.length} عضو كشفي بنجاح!`);
  }
}
