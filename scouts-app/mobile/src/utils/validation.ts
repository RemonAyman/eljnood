/**
 * Validation utilities for مجموعة جنود المسيح الكشفية app
 */

// ─── Phone validation ────────────────────────────────────────────────────────
/** Egyptian mobile number: 01[0,1,2,5] followed by 8 digits */
const EGYPT_PHONE_REGEX = /^01[0125]\d{8}$/;

export function isValidEgyptPhone(phone: string): boolean {
  return EGYPT_PHONE_REGEX.test(phone.trim().replace(/\s/g, ''));
}

export function formatPhone(phone: string): string {
  return phone.trim().replace(/\s/g, '');
}

// ─── Scout code validation ────────────────────────────────────────────────────
/** Scout code format: JS-YYYY-NNN */
const SCOUT_CODE_REGEX = /^JS-\d{4}-\d{3}$/;

export function isValidScoutCode(code: string): boolean {
  return SCOUT_CODE_REGEX.test(code.trim());
}

// ─── Name validation ─────────────────────────────────────────────────────────
export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 3 && trimmed.length <= 100;
}

// ─── Password validation ─────────────────────────────────────────────────────
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

// ─── Required field ───────────────────────────────────────────────────────────
export function isRequired(value: string | undefined | null): boolean {
  return !!(value && value.trim().length > 0);
}

// ─── OTP / PIN validation ─────────────────────────────────────────────────────
export function isValidOTP(otp: string, length = 4): boolean {
  return otp.trim().length === length && /^\d+$/.test(otp.trim());
}

// ─── Error message helpers ───────────────────────────────────────────────────
export const ValidationMessages = {
  required: (field: string) => `يرجى إدخال ${field}`,
  invalidPhone: 'رقم الموبايل غير صحيح، يجب أن يبدأ بـ 01 ويكون 11 رقم',
  invalidScoutCode: 'كود الكشاف غير صحيح، الصيغة الصحيحة: JS-2026-123',
  invalidName: 'الاسم يجب أن يكون بين 3 و 100 حرف',
  passwordTooShort: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
  invalidOTP: 'كود التحقق يجب أن يكون 4 أرقام',
  pinIncorrect: 'الرمز السري غير صحيح',
} as const;

// ─── Form validation result ──────────────────────────────────────────────────
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateLoginForm(identifier: string, password: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isRequired(identifier)) {
    errors.identifier = ValidationMessages.required('كود الكشاف أو البريد الإلكتروني');
  }

  if (!isRequired(password)) {
    errors.password = ValidationMessages.required('كلمة المرور');
  } else if (!isValidPassword(password)) {
    errors.password = ValidationMessages.passwordTooShort;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateRegisterForm(data: {
  name: string;
  guardianPhone: string;
  phone?: string;
  code: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isValidName(data.name)) {
    errors.name = ValidationMessages.invalidName;
  }

  if (!isRequired(data.guardianPhone)) {
    errors.guardianPhone = ValidationMessages.required('رقم موبايل ولي الأمر');
  } else if (!isValidEgyptPhone(data.guardianPhone)) {
    errors.guardianPhone = ValidationMessages.invalidPhone;
  }

  if (data.phone && data.phone.trim() && !isValidEgyptPhone(data.phone)) {
    errors.phone = ValidationMessages.invalidPhone;
  }

  if (!isValidScoutCode(data.code)) {
    errors.code = ValidationMessages.invalidScoutCode;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
