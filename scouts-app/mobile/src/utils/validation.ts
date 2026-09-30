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

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateRegisterForm(data: {
  role?: 'CHILD' | 'PARENT' | 'LEADER' | 'SECTION_LEADER';
  name: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  guardianPhone?: string;
  phone?: string;
  code?: string;
  sonName?: string;
  sonCode?: string;
  sectionName?: string;
  sectionLeaderName?: string;
  addressDescription?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isValidName(data.name)) {
    errors.name = ValidationMessages.invalidName;
  }

  if (data.email !== undefined) {
    if (!isRequired(data.email)) {
      errors.email = ValidationMessages.required('البريد الإلكتروني');
    } else if (!isValidEmail(data.email)) {
      errors.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }
  }

  if (data.password !== undefined) {
    if (!isRequired(data.password)) {
      errors.password = ValidationMessages.required('كلمة المرور');
    } else if (!isValidPassword(data.password)) {
      errors.password = ValidationMessages.passwordTooShort;
    }
  }

  if (data.confirmPassword !== undefined) {
    if (!isRequired(data.confirmPassword)) {
      errors.confirmPassword = ValidationMessages.required('تأكيد كلمة المرور');
    } else if (data.confirmPassword !== data.password) {
      errors.confirmPassword = 'كلمات المرور غير متطابقة';
    }
  }

  if (data.role === 'PARENT') {
    if (!isRequired(data.sonName)) {
      errors.sonName = ValidationMessages.required('اسم الابن');
    }
    if (!isRequired(data.sonCode)) {
      errors.sonCode = ValidationMessages.required('كود الابن');
    }
    if (!isRequired(data.guardianPhone)) {
      errors.guardianPhone = ValidationMessages.required('رقم موبايل ولي الأمر');
    } else if (!isValidEgyptPhone(data.guardianPhone)) {
      errors.guardianPhone = ValidationMessages.invalidPhone;
    }
  } else if (data.role === 'LEADER') {
    if (!isRequired(data.phone)) {
      errors.phone = ValidationMessages.required('رقم الموبايل');
    } else if (!isValidEgyptPhone(data.phone)) {
      errors.phone = ValidationMessages.invalidPhone;
    }
    if (!isRequired(data.sectionLeaderName)) {
      errors.sectionLeaderName = ValidationMessages.required('اسم رئيس القطاع');
    }
  } else if (data.role === 'SECTION_LEADER') {
    if (!isRequired(data.phone)) {
      errors.phone = ValidationMessages.required('رقم الموبايل');
    } else if (!isValidEgyptPhone(data.phone)) {
      errors.phone = ValidationMessages.invalidPhone;
    }
  } else {
    // Child
    if (!isRequired(data.guardianPhone)) {
      errors.guardianPhone = ValidationMessages.required('رقم موبايل ولي الأمر');
    } else if (!isValidEgyptPhone(data.guardianPhone)) {
      errors.guardianPhone = ValidationMessages.invalidPhone;
    }

    if (data.addressDescription !== undefined && !isRequired(data.addressDescription)) {
      errors.addressDescription = ValidationMessages.required('تفاصيل العنوان');
    }

    if (data.phone && data.phone.trim() && !isValidEgyptPhone(data.phone)) {
      errors.phone = ValidationMessages.invalidPhone;
    }

    if (data.code && !isValidScoutCode(data.code)) {
      errors.code = ValidationMessages.invalidScoutCode;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
