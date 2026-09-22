# 📱 تطبيق جنود المسيح الكشفية - الشامل
## Architecture & Detailed System Specification Document

---

## 🎯 نظرة عامة على التطبيق

تطبيق موبايل ولوحة إدارة ويب متكاملة لإدارة مجموعة **جنود المسيح الكشفية**، يعمل على Android وiOS وWeb. يشمل التطبيق إدارة الأعضاء الشاملة من مرحلة (Kg حتى خريج)، نظام غياب متعدد (بصمة + QR Code) لمختلف الفعاليات والاجتماعات، نظام ماليات واشتراكات متعدد السنوات، طباعة الكارنيهات، إدارة العهد والمخازن، حجوزات القاعات والغرف، الافتقاد، المناهج، الكتاب المقدس والمسابقات الأونلاين، الشات والتنبيهات، صندوق الذكريات، وتتبع أولياء الأمور.

---

## ⚙️ Stack التقنية المقترحة (مع الأسباب)

### 📱 Frontend - Mobile App
| التقنية | السبب |
|---------|--------|
| **React Native + Expo** | تطبيق واحد يشتغل على Android وiOS، دعم ممتاز للـ Camera والـ Native Print |
| **TypeScript** | لمنع الأخطاء وتنظيم الكود بشكل قوي |
| **Zustand** | إدارة الـ State بشكل سريع وخفيف |
| **React Navigation** | التنقل السلس بين الشاشات والـ Modals |
| **TanStack Query** | جلب وتخزين البيانات المؤقتة (Caching) من السيرفر |
| **NativeWind** | تصميم واجهات حديثة وسريعة باستخدام TailwindCSS |
| **Expo Camera + BarCodeScanner** | مسح QR Code للغياب بسرعة عالية |
| **Expo Print / Thermal Printer SDK** | طباعة الإيصالات والكارنيهات المباشرة |

### 🖥️ Backend - API Server
| التقنية | السبب |
|---------|--------|
| **NestJS (Node.js)** | معماري موحد للمشاريع الكبيرة، دعم TypeScript كاملاً |
| **PostgreSQL** | قاعدة بيانات علائقية قوية وموثوقة |
| **Prisma ORM** | التعامل مع الداتابيز بسهولة وأمان عالي |
| **Firebase Realtime DB / WebSockets** | الشات الفوري (Real-time Chat Rooms) |
| **Firebase Storage / S3** | رفع واستضافة الصور والفيديوهات والـ PDFs والملفات الصوتية |
| **JWT + Refresh Tokens + PIN Validation** | المصادقة والأمان للرقم السري وأدوار المستخدمين |
| **Redis** | كاش، إدارة الجلسات، وقفل حجوزات القاعات في الوقت الفعلي |
| **Bull Queue** | إرسال الإشعارات والرسائل النصية بدون تأخير |
| **Firebase Cloud Messaging (FCM)** | الإشعارات اللحظية (Push Notifications) |

### 🌐 Admin Panel & Print Server - لوحة الإدارة والطباعة
| التقنية | السبب |
|---------|--------|
| **Next.js 14 (App Router)** | لوحة ويب سريعة جداً ومناسبة للتحكم الشامل للـ Admin |
| **Shadcn/ui + TailwindCSS** | تصميم احترافي متجاوب مع الشاشات |
| **Node-Printer / Web-Print Bridge** | الربط المباشر مع ماكينات طباعة الكارنيهات (Card Printers) |
| **Recharts** | تقارير وبيانات إحصائية مالية وحضور |

---

## 🗂️ هيكل المجلدات (Folder Structure)

```
scouts-app/
│
├── 📁 mobile/                          # React Native App
│   ├── 📁 src/
│   │   ├── 📁 screens/
│   │   │   ├── 📁 auth/
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   ├── RegisterScreen.tsx
│   │   │   │   └── RoleSelectScreen.tsx
│   │   │   ├── 📁 child/
│   │   │   │   ├── ChildHomeScreen.tsx
│   │   │   │   ├── ChildAttendanceScreen.tsx
│   │   │   │   └── ChildProfileScreen.tsx
│   │   │   ├── 📁 parent/
│   │   │   │   ├── ParentHomeScreen.tsx
│   │   │   │   └── ChildTrackingScreen.tsx
│   │   │   ├── 📁 leader/
│   │   │   │   ├── LeaderHomeScreen.tsx
│   │   │   │   ├── AttendanceManageScreen.tsx
│   │   │   │   ├── QRScannerScreen.tsx
│   │   │   │   └── FollowUpScreen.tsx
│   │   │   ├── 📁 shared/
│   │   │   │   ├── ChatRoomsScreen.tsx
│   │   │   │   ├── BibleScreen.tsx
│   │   │   │   ├── CurriculaScreen.tsx
│   │   │   │   ├── MemoriesScreen.tsx
│   │   │   │   ├── SubscriptionsScreen.tsx
│   │   │   │   ├── InventoryRequestScreen.tsx
│   │   │   │   ├── RoomReservationScreen.tsx
│   │   │   │   └── ScoutingPlanScreen.tsx
│   │   ├── 📁 components/
│   │   │   ├── 📁 ui/                  # Reusable UI components
│   │   │   ├── 📁 attendance/
│   │   │   ├── 📁 chat/
│   │   │   ├── 📁 subscriptions/
│   │   │   ├── 📁 card_print/          # معاينة وطباعة الكارنيه
│   │   │   ├── 📁 inventory/           # طلبات العهدة
│   │   │   └── 📁 reservations/        # حجوزات القاعات
│   │   ├── 📁 navigation/
│   │   │   ├── RootNavigator.tsx
│   │   │   ├── AdminNavigator.tsx
│   │   │   ├── LeaderNavigator.tsx
│   │   │   ├── ChildNavigator.tsx
│   │   │   └── ParentNavigator.tsx
│   │   ├── 📁 services/               # API calls
│   │   │   ├── auth.service.ts
│   │   │   ├── members.service.ts
│   │   │   ├── attendance.service.ts
│   │   │   ├── subscriptions.service.ts
│   │   │   ├── card_print.service.ts
│   │   │   ├── inventory.service.ts
│   │   │   ├── reservations.service.ts
│   │   │   ├── chat.service.ts
│   │   │   └── content.service.ts
│   │   ├── 📁 store/                  # Zustand stores
│   │   │   ├── auth.store.ts
│   │   │   ├── attendance.store.ts
│   │   │   ├── reservations.store.ts
│   │   │   └── chat.store.ts
│   │   ├── 📁 hooks/
│   │   ├── 📁 utils/
│   │   └── 📁 types/
│   ├── app.json
│   └── package.json
│
├── 📁 backend/                         # NestJS API
│   ├── 📁 src/
│   │   ├── 📁 modules/
│   │   │   ├── 📁 auth/               # تسجيل الدخول والتسجيل
│   │   │   ├── 📁 users/              # إدارة المستخدمين
│   │   │   ├── 📁 members/            # بيانات الأعضاء والمراحل والتنقيل
│   │   │   ├── 📁 sections/           # القطاعات والفرق
│   │   │   ├── 📁 attendance/         # الغياب والبصمة والـ QR
│   │   │   ├── 📁 subscriptions/      # الاشتراكات والسنوات والأكواد والخصومات
│   │   │   ├── 📁 cards/              # توليد وطباعة الكارنيهات
│   │   │   ├── 📁 followup/           # الافتقاد والخدم
│   │   │   ├── 📁 curricula/          # المناهج والخمسة أقسام
│   │   │   ├── 📁 bible/              # الإصحاح اليومي والتأملات والمسابقات
│   │   │   ├── 📁 broadcast/          # الرسائل والتنبيهات الموجهة
│   │   │   ├── 📁 memories/           # صندوق الذكريات بأقسامه الـ 7
│   │   │   ├── 📁 chat/               # الشات رومز
│   │   │   ├── 📁 inventory/          # إدارة العهدة وطلبات الاستلام والتسليم
│   │   │   ├── 📁 reservations/       # حجوزات القاعات والغرف والخدمات
│   │   │   ├── 📁 scouting_plan/      # خطة الأيام الكشفية
│   │   │   ├── 📁 parents/            # تتبع أولياء الأمور
│   │   │   └── 📁 admin/              # لوحة الإدارة والتقرير والـ Activity Log
│   │   ├── 📁 common/
│   │   │   ├── 📁 guards/
│   │   │   ├── 📁 decorators/
│   │   │   ├── 📁 filters/
│   │   │   └── 📁 interceptors/
│   │   ├── 📁 database/
│   │   │   └── prisma.service.ts
│   │   └── main.ts
│   ├── 📁 prisma/
│   │   ├── schema.prisma             # Database schema الشامل
│   │   └── 📁 migrations/
│   └── package.json
│
├── 📁 admin-panel/                     # Next.js Admin Dashboard
│   ├── 📁 src/
│   │   ├── 📁 app/
│   │   │   ├── 📁 dashboard/
│   │   │   ├── 📁 members/
│   │   │   ├── 📁 card-printing/       # ربط ماكينة طباعة الكارنيهات
│   │   │   ├── 📁 attendance/
│   │   │   ├── 📁 subscriptions/
│   │   │   ├── 📁 inventory/
│   │   │   ├── 📁 reservations/
│   │   │   ├── 📁 content/
│   │   │   └── 📁 activity-log/
│   │   ├── 📁 components/
│   │   └── 📁 lib/
│   └── package.json
│
└── 📁 docs/                            # وثائق المشروع
    ├── api-docs.md
    ├── database-schema.md
    └── deployment-guide.md
```

---

## 🗄️ Database Schema الشاملة (قاعدة البيانات)

```sql
-- المستخدمون (كل الأدوار)
Users {
  id, email, password_hash, role (CHILD | PARENT | LEADER | JOWALAH | SECTION_LEADER | GROUP_MANAGER | ADMIN),
  created_at, last_login, is_active
}

-- بيانات الأطفال والأعضاء الشاملة (من KG حتى خريج)
Members {
  id, user_id, code (كود الطفل الفريد), name,
  gender (MALE | FEMALE),
  birth_date, admission_year,
  current_grade (KG1 | KG2 | GRADE_1..12 | COLLEGE_1..4 | GRADUATE), 
  section_id (auto-updated), squad_id (auto-updated),
  squad_name (براعم | أشبال | زهرات | كشاف | مرشدات | متقدم | رائدات | جوالة | قادة),
  phone, guardian_phone (required), 
  region, building_no, street, address_description,
  created_at, updated_at
}

-- القطاعات والفرق
Sections {
  id, name (براعم | أشبال | زهرات | كشاف | مرشدات | متقدم | رائدات | جوالة | قادة), 
  leader_id, gender_type
}

Squads {
  id, name, section_id, leader_id
}

-- الغياب الشامل (أيام كشفية، معسكرات، درس كتاب، تسبحة، اجتماعات قادة وجوالة)
Attendance {
  id, member_id, date,
  event_type (SCOUTING_DAY | CAMP | BIBLE_STUDY | TASBEHA | LEADERS_MEETING | JOWALAH_MEETING | SECTIONS_JOINT_MEETING),
  status (PRESENT | ABSENT | EXCUSED),
  recorded_by, method (QR | FINGERPRINT_EXCEL | MANUAL), notes
}

-- الماليات والاشتراكات لسنوات متتالية (2026, 2027, 2028, 2029...)
Subscriptions {
  id, member_id, year (2026 | 2027 | 2028 | 2029),
  is_new_member (boolean),
  annual_sub (boolean),
  festival_sub (boolean),
  promise_party_sub (boolean),
  scarf_replacement (boolean),  -- بدل فاقد المنديل الكشفي
  wajla (boolean),               -- وجلة
  badges (boolean),              -- شارات القميص الكشفي
  subtotal, discount_code_id, discount_amount, manager_pin_applied (boolean), total_paid,
  receipt_number, receipt_url,
  recorded_by, created_at
}

-- أكواد الخصم والرموز السرية لمدير المجموعة
DiscountCodes {
  id, code, percentage (10-90), secret_pin_required (boolean),
  is_active, max_uses, used_count,
  created_by, expires_at
}

-- الأسعار القابلة للتغير من الأدمن
Pricing {
  id, item_key (ANNUAL | FESTIVAL | PROMISE_PARTY | SCARF | WAJLA | BADGES), item_name, price, is_active, updated_by
}

-- طباعة الكارنيهات
MemberCards {
  id, member_id, card_code, qr_code_url,
  issue_date, status (PENDING | PRINTED), printed_at, printed_by
}

-- الافتقاد (يدعم خادم أو أكثر معاً)
FollowUps {
  id, member_id, main_leader_id, 
  co_leaders_ids, -- قائمة الخدام المشاركين في الافتقاد
  type (PHONE | VISIT | OCCASION),
  occasion_details, notes, follow_up_date, created_at
}

-- المناهج الـ 5 أقسام والـ 4 أنواع ملفات
Curricula {
  id, title, section_id, grade_level,
  category (SPIRITUAL | SCOUTING | PSYCHO_EDUCATIONAL | THAMAR | SEMINARS),
  file_type (PDF | VIDEO | AUDIO | IMAGE),
  file_url, uploaded_by, created_at
}

-- الكتاب المقدس والمسابقات الأونلاين
BibleDaily {
  id, date, chapter_name, chapter_text,
  pdf_url, audio_url, video_url, created_at
}

BibleContests {
  id, title, description, start_date, end_date,
  questions_json, is_active, created_by
}

BibleContestSubmissions {
  id, contest_id, member_id, answers_json, score, submitted_at
}

-- التنبيهات والرسائل الموجهة (Broadcast Messages)
BroadcastMessages {
  id, title, content, target_type (SECTION_LEADERS | LEADERS_JOWALAH | SECTION_KIDS | ALL_GROUP),
  target_section_id (nullable), sender_id, created_at
}

-- صندوق الذكريات الأقسام الـ 7
Memories {
  id, title, category (SCOUTING_TESTS | SCOUTING_DAYS | CAMPS | PROMISE_PARTIES | FESTIVALS | AGAPE | OCCASIONS),
  media_type (IMAGE | VIDEO), media_url, thumbnail_url,
  uploaded_by, is_visible, created_at
}

-- شات الرومز
ChatRooms {
  id, name, type (SECTION_LEADERS | LEADERS_JOWALAH | SECTION_KIDS | ALL_GROUP),
  section_id (nullable)
}

Messages {
  id, room_id, sender_id, content, media_url, message_type, created_at
}

-- عهدة الأدوات والمعدات (10 أقسام عهدة)
InventoryCategories {
  id, name (THEATER | RIYADI | GAMES | KITCHEN_TOOLS | KITCHEN_EQUIPMENT | AUDIO_VISUAL | COMPUTER_WIRELESS | OFFICE | ELECTRICAL | TOOLS)
}

InventoryItems {
  id, category_id, item_name, total_quantity, available_quantity, condition_status
}

InventoryRequests {
  id, item_id, service_name, requester_id,
  pickup_datetime, return_datetime,
  status (PENDING | APPROVED | DELIVERED | RETURNED | REJECTED),
  approved_by, notes, created_at
}

-- حجوزات القاعات والغرف (12 خدمة + 10 قاعات وغرف)
Rooms {
  id, name (UPPER_HALL | LOWER_HALL | ROOFTOP | ABONA_FALTAOUS | PAPA_SHENOUDA | NURSERY | PROF_ROMEL | PROF_GEORGE | SCOUT_LAB | TECH_LANG_LAB)
}

RoomReservations {
  id, room_id, service_name (SUNDAY_SCHOOL | ALHAN | REMEDIAL_CLASSES | TASBEHA | BIBLE_STUDY | MEDIA | MARCH | CHORUS | THEATER | MOTION_CHORUS | PRESENTATION | COURSES),
  reservation_date, start_hour (8..23), end_hour (8..23),
  reserved_by, notes, status (CONFIRMED | CANCELLED), created_at
}

-- خطة الأيام الكشفية
ScoutingPlans {
  id, title, year, file_url, description, uploaded_by, created_at
}

-- سجل النشاط للأدمن
ActivityLog {
  id, user_id, action, details, ip_address, created_at
}

-- أعذار الغياب
AbsenceExcuses {
  id, member_id, attendance_id, reason, status, reviewed_by, reviewed_at
}
```

---

## 📌 تفاصيل الـ 13 وحدة المطلوبة في التطبيق

### 1️⃣ بيانات الأولاد (الأعضاء)
- **النطاق العمري والمراحل**: من مرحلة (Kg1 حتى 4 كلية وخريج).
- **التنقيل الأوتوماتيكي**: بإدخال تاريخ الميلاد والسنة الدراسية والنوع (ذكر/أنثى)، يتم ترقية العضو وتغيير فريقه وقطاعه أوتوماتيكياً مع بداية كل عام دراسي:
  - براعم ➡️ أشبال (ذكور) / زهرات (إناث) عند الوصول لـ 3 ابتدائي.
  - أشبال/زهرات ➡️ كشاف (ذكور) / مرشدات (إناث) عند الوصول لـ 1 إعدادي.
  - كشاف/مرشدات ➡️ كشاف متقدم (ذكور) / رائدات (إناث) عند الوصول لـ 1 ثانوي.
  - كشاف متقدم/رائدات ➡️ جوالة (ذكور وإناث) عند الوصول لـ 1 كلية.
  - القادة والخدام المستمرون.
- **الحقول الإجبارية**: الاسم، الكود، السنة الدراسية، النوع، رقم موبايل ولي الأمر.
- **الحقول الاختيارية**: رقم موبايل الطفل، المنطقة، رقم العمارة، الشارع، وصف المكان.

---

### 2️⃣ الغياب الشامل
- **البصمة**: دعم رفع شيت Excel البصمة من أجهزة الحضور أو الربط المباشر بـ API أجهزة البصمة.
- **QR Code**: توليد رمز QR ثابت فريد لكل فرد في التطبيق وتسهيل أخذ الغياب عبر كاميرا موبايل القائد المسؤول.
- **فعاليات الغياب**: (أيام كشفية - معسكرات - درس كتاب - تسبحة).
- **اجتماعات القادة والجوالة**: غياب اجتماع القادة، غياب اجتماع الجوالة، غياب اجتماعات قادة وجوالة القطاعات المختلفة.

---

### 3️⃣ الماليات والاشتراكات
- **البحث**: بحث سريع برقم الكود أو بالاسم.
- **السنوات المنسدلة**: تحديد السنة المالية (2026 - 2027 - 2028 - 2029) لمعرفة حالة السداد والتأخيرات.
- **نسبة الخصم برقم سري**: خصومات مخصصة (10% إلى 90%) تتطلب PIN سري خاص بمدير المجموعة.
- **بنود السداد المحسوبة أوتوماتيكياً**:
  - اشتراك سنوي
  - اشتراك مهرجان
  - اشتراك حفلة الوعد
  - بدل فاقد المنديل الكشفي
  - وجلة
  - شارات القميص الكشفي
- **طباعة الإيصال والتقارير**: توليد إيصال مالي ورقي/PDF فور التحصيل مع إمكانية استخراج تقارير المبالغ المحصلة حسب القطاع أو الفعالية.

---

### 4️⃣ طباعة الكارنيه (Card Printing)
- **تصميم الكارنيه**: يحتوي على (الاسم - القطاع - الرقم الكودي - QR Code للغياب - رقم ولي الأمر).
- **الإدخال التلقائي**: سحب بيانات الفرد فوراً من الداتابيز وتوليد الكارنيه تلقائياً.
- **الربط مع الماكينة**: إمكانية إرسال أمر الطباعة المباشرة لماكينات طباعة الكارنيهات البلاستيكية (ID Card Printers).

---

### 5️⃣ الافتقاد
- تسجيل اسم الطفل المستهدف.
- اختيار الخادم المفتقد أو **أكثر من خادم** في نفس الافتقاد.
- تسجيل تاريخ وتوقيت الافتقاد.
- **نوع الافتقاد**: تليفون / زيارة منزلية / مناسبة (عملية، إصابة، كسر، نجاح...) مع الملاحظات.

---

### 6️⃣ المناهج
- مقسمة حسب القطاع والمرحلة.
- **المحاور الـ 5**: (روحي - كشفي - نفسي تربوي - ثمر - ندوات).
- **صيغ الملفات الـ 4**: (PDF - فيديو - صوت - صور) مع إمكانية التحميل والمعاينة من داخل التطبيق.

---

### 7️⃣ الكتاب المقدس والمسابقات
- رفع وقراءة الإصحاح اليومي لجميع أفراد المجموعة.
- محتوى إضافي للتأمل (فيديو، صوت، PDF).
- **المسابقات الأونلاين**: إنشاء مسابقات وتأملات تفاعلية وحساب النتائج والدرجات أوتوماتيكياً.

---

### 8️⃣ الرسائل والتنبيهات الموجهة
- إرسال رسائل Push Notifications وإشعارات نصية موجهة لـ:
  1. رؤساء القطاعات
  2. قادة وجوالة القطاع
  3. أولاد كل قطاع على حدة
  4. أولاد المجموعة ككل

---

### 9️⃣ صندوق الذكريات (7 أقسام)
مستودع وسائط (صور وفيديوهات) مقسم إلى:
1. الاختبارات الكشفية
2. الأيام الكشفية
3. المعسكرات
4. حفلات الوعد
5. المهرجانات
6. الأغابي
7. حفلات المناسبات

---

### 🔟 الشات رووم (Chat Rooms)
غرف شات فورية مخصصة لـ:
- غرف لرؤساء القطاعات
- غرف لقادة وجوالة القطاع
- غرف لأولاد كل قطاع على حدة
- غرفة عامة لأولاد الكشافة ككل

---

### 1️⃣1️⃣ طلب عهدة والمخازن (Inventory Management)
- تسجيل تاريخ ووقت الاستلام وتاريخ ووقت التسليم واسم الخدمة والعهدة المطلوبة.
- **أقسام العهدة الـ 10** (قائمة منسدلة لكل قسم):
  1. عهدة مسرح
  2. عهدة ريادي
  3. عهدة ألعاب
  4. عهدة أدوات مطبخ
  5. عهدة أجهزة مطبخ
  6. عهدة أجهزة صوتية ومرئية
  7. عهدة أجهزة كمبيوتر ولاسلكي
  8. عهدة أدوات مكتبية
  9. عهدة عدة كهربائية
  10. عهدة عدة

---

### 1️⃣2️⃣ حجوزات القاعات والغرف
- قائمة منسدلة باليوم والتاريخ، والساعات المتاحة (من 8 صباحاً حتى 11 مساءً).
- **قائمة الخدمات الـ 12**: (مدارس أحدث - ألحان - فصول تقوية - تسبحة - درس كتاب - إعلام - مارش - كورال - مسرح - كورال حركات - تقديم - كورسات).
- **قائمة القاعات والغرف الـ 10**:
  1. القاعة العليا
  2. القاعة السفلية
  3. السطوح
  4. غرفة أبونا فلتاؤوس
  5. غرفة البابا شنودة
  6. غرفة الحضانة
  7. غرفة أستاذ روميل
  8. غرفة أستاذ جورج رزيق
  9. غرفة معمل الكشافة
  10. غرفة معمل التكنولوجيا واللغات

---

### 1️⃣3️⃣ خطة الأيام الكشفية
- قسم مخصص لتحميل وعرض خطة الأيام الكشفية والجدول الزمني للأنشطة طوال العام.

---

## 🎫 أكواد الخصم والرموز السرية

| الكود | نسبة الخصم | يتطلب PIN سري من المدير؟ |
|-------|------------|-------------------------|
| `JNOOD-D10` | 10% خصم | نعم |
| `JNOOD-D20` | 20% خصم | نعم |
| `JNOOD-D30` | 30% خصم | نعم |
| `JNOOD-D40` | 40% خصم | نعم |
| `JNOOD-D50` | 50% خصم | نعم |
| `JNOOD-D60` | 60% خصم | نعم |
| `JNOOD-D70` | 70% خصم | نعم |
| `JNOOD-D80` | 80% خصم | نعم |
| `JNOOD-D90` | 90% خصم | نعم |

---

## 📋 قائمة التسكات الشاملة (Tasks Breakdown)

### 🔴 Phase 1 - الأساس والداتا والغياب والاشتراكات
- [ ] **T01**: إعداد مشروع NestJS + PostgreSQL + Prisma
- [ ] **T02**: إنشاء داتابيز الأعضاء والترقية الأوتوماتيكية من KG حتى خريج
- [ ] **T03**: نظام المصادقة والأدوار والأرقام السرية (JWT + PIN)
- [ ] **T04**: API الغياب والبصمة ورفع شيتات Excel
- [ ] **T05**: مولد وراداء الـ QR Code الخاص بكل فرد
- [ ] **T06**: API الاشتراكات والسنوات المنسدلة (2026-2029) والخصومات
- [ ] **T07**: توليد الإيصالات المالية وطباعتها
- [ ] **T08**: وحدة طباعة الكارنيهات والربط مع ماكينة الطباعة
- [ ] **T09**: تطبيق الموبايل - الشاشات الأساسية والدخول والتسجيل
- [ ] **T10**: تطبيق الموبايل - ماسح QR Code والشاشات المالية

### 🟡 Phase 2 - الخدمة والمحتوى والتواصل
- [ ] **T11**: الشات الفوري والغرف الـ 4 المخصصة (Firebase/WebSockets)
- [ ] **T12**: وحدة الافتقاد وتعدد الخدام المفتقدين
- [ ] **T13**: وحدة المناهج المحاور الـ 5 والملفات الـ 4
- [ ] **T14**: الكتاب المقدس والإصحاح اليومي والمسابقات التفاعلية
- [ ] **T15**: نظام إرسال الرسائل والتنبيهات الموجهة (Broadcast)
- [ ] **T16**: صندوق الذكريات والأقسام الـ 7
- [ ] **T17**: تتبع ولي الأمر لابنه بالاشتراك والكود
- [ ] **T18**: شاشات المناهج والذكريات والكتاب المقدس في الموبايل

### 🟢 Phase 3 - العهدة والحجوزات والإدارة الشاملة
- [ ] **T19**: نظام طلبات العهدة وأقسامها الـ 10
- [ ] **T20**: نظام حجوزات القاعات والغرف (الـ 12 خدمة والـ 10 قاعات)
- [ ] **T21**: رفع وتصفح خطة الأيام الكشفية
- [ ] **T22**: لوحة تحكم الأدمن (Next.js Admin Dashboard)
- [ ] **T23**: سجل النشاط التفصيلي (Activity Log)
- [ ] **T24**: تقارير الماليات والغياب والطباعة والعهدة
- [ ] **T25**: اختبارات النظام الشاملة وإطلاق التطبيق

---

*وثيقة معمارية شاملة ومحدثة - تطبيق جنود المسيح الكشفية | 2026*
