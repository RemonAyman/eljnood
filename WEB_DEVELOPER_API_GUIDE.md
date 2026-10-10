# ⚜️ دليل الربط البرمجي ومواصفات الـ API لموقع الويب (Web Integration & API Guide)
### منظومة جنود المسيح الكشفية - تزامن الويب والموبايل بالكامل (Web & Mobile Real-time Sync)

---

## 📌 هل يوجد سيرفر API تقليدي (REST API) خاص بنا؟
**الإجابة باختصار:** 
لا، التطبيق حالياً مبني بأحدث المعماريات السحابية **Serverless / BaaS (Backend-as-a-Service)** بالاعتماد المباشر على **Google Firebase**:
* **قاعدة البيانات اللحظية:** Cloud Firestore (Real-time NoSQL).
* **نظام المصادقة والمستخدمين:** Firebase Authentication.
* **تخزين الصور والملفات:** Firebase Cloud Storage.
* **إشعارات الهواتف المحمولة:** Expo Push Notifications + Google FCM.

> 💡 **الميزة العظمى لهذه المعمارية:** 
> مطور الويب **لا يحتاج لانتظار بناء باك إند تقليدي**! بمجرد ربط موقع الويب بنفس قاعدة بيانات فايربيز، **أي تعديل أو إضافة على الويب ستظهر في الموبايل فوراً في نفس اللحظة (Real-time)**، والعكس صحيح، بما في ذلك رسائل الشات الحية والإشعارات والاشتراكات والحضور!

---

## 🚀 كيفية ربط الويب بالمشروع (خطوتان فقط لمطور الويب)

### 1. تثبيت حزمة الفايربيز في مشروع الويب:
```bash
npm install firebase
```

### 2. استخدام ملف الربط الجاهز:
قمنا بإنشاء ملف كود متكامل يحتوي على كل الدوال والـ Types الجاهزة لمطور الويب:
👉 **[scouts-web-api-client.ts](file:///e:/app/scouts-web-api-client.ts)**

يقوم مطور الويب بنسخ هذا الملف إلى مشروعه (Next.js / React / Vue / Vite) واستدعاء الدوال مباشرة مثل:
```typescript
import { webLogin, fetchAllMembers, subscribeToWebChatMessages, sendWebChatMessage } from './scouts-web-api-client';
```

---

## 🔑 بيانات الاتصال بالفايربيز (Firebase Config)

```javascript
export const firebaseConfig = {
  apiKey: "AIzaSyA7C2nkInbCsxXvbVlQhMUluvvDJpZSg3Y",
  authDomain: "eljnood.firebaseapp.com",
  projectId: "eljnood",
  storageBucket: "eljnood.firebasestorage.app",
  messagingSenderId: "365768489083",
  appId: "1:365768489083:web:13f712b6d768871fb58ade"
};
```

---

## 🗄️ قائمة الجداول والمجموعات (Collections Schema) المشتركة مع الموبايل

| اسم المجموعة (Collection) | الوصف | الحقول الأساسية (Fields) |
|---|---|---|
| `users` | حسابات المستخدمين والقادة | `uid`, `name`, `email`, `role`, `code`, `phone`, `sectionName`, `avatarBase64` |
| `members` | قيود الكشافة والأشبال | `id`, `code`, `name`, `gender`, `squadName`, `gradeLevel`, `scarfStatus`, `guardianPhone` |
| `attendance` | الحضور والغياب والباركود | `memberId`, `memberName`, `memberCode`, `date`, `eventType`, `status`, `recordedBy` |
| `subscriptions` | الاشتراكات والإيصالات والخزينة | `receiptNumber`, `memberCode`, `memberName`, `year`, `subtotal`, `discountPercentage`, `totalPaid` |
| `chat_messages` | رسائل الشات الفورية | `roomId`, `senderId`, `senderName`, `senderRole`, `content`, `mediaType`, `mediaBase64`, `createdAt` |
| `parties_events` | الحفلات والفعاليات الكشفية | `id`, `title`, `eventDate`, `eventTime`, `location`, `targetAudience`, `description` |
| `notifications` | الإشعارات والتنبيهات العامة | `title`, `body`, `type`, `senderId`, `senderName`, `roomId`, `createdAt` |
| `push_tokens` | توكن إشعارات أجهزة الهواتف | `token`, `userId`, `role`, `platform`, `updatedAt` |
| `follow_ups` | سجلات الافتقاد والزيارات | `memberId`, `memberName`, `primaryLeaderName`, `visitType`, `date`, `notes` |
| `room_reservations` | حجوزات قاعات الكنيسة | `roomName`, `serviceName`, `date`, `startHour`, `endHour`, `reservedByName` |
| `inventory_requests` | طلبات العهد والمهمات | `category`, `itemName`, `serviceName`, `pickupDatetime`, `returnDatetime`, `status` |
| `memories` | ألبوم الذكريات والصور | `title`, `caption`, `sector`, `imageBase64`, `uploaderName`, `likesCount`, `createdAt` |
| `curricula` | المناهج والمسابقات الكشفية | `title`, `targetSquad`, `category`, `content`, `authorLeaderName` |
| `scouting_plans` | الخطط السنوية للقطاعات | `sector`, `year`, `month`, `weekNumber`, `objective`, `activityTitle` |

---

## 📡 مواصفات الـ API لو أراد مطور الويب استخدام REST Endpoints (Next.js API Routes / Express)

إذا فضل مطور الويب بناء مسارات REST API تقليدية بدلاً من استدعاء الفايربيز من المتصفح مباشرة، هذه هي المواصفة القياسية:

### 1. مصادقة المستخدمين (Auth)
* **`POST /api/auth/login`**
  * **Request Body:** `{ "identifier": "JS-2026-448", "password": "******" }`
  * **Response:** `{ "success": true, "token": "...", "user": { "id": "...", "name": "...", "role": "..." } }`
* **`POST /api/auth/reset-password`**
  * **Request Body:** `{ "email": "user@example.com" }`

### 2. قيد الكشافة والأعضاء (Members)
* **`GET /api/members`**: جلب جميع الأعضاء.
* **`POST /api/members`**: إضافة عضو جديد.
  * **Body:** `{ "code": "JS-2026-448", "name": "بيتر يوسف", "squadName": "كشاف", "guardianPhone": "012..." }`
* **`PUT /api/members/:code`**: تعديل بيانات عضو.
* **`DELETE /api/members/:code`**: حذف عضو.

### 3. الحضور والغياب (Attendance)
* **`GET /api/attendance?date=2026-10-10`**: جلب حضور يوم محدد.
* **`POST /api/attendance`**: تسجيل حضور أو غياب.
  * **Body:** `{ "memberId": "m1", "memberCode": "JS-2026-448", "date": "2026-10-10", "eventType": "SCOUTING_DAY", "status": "PRESENT" }`

### 4. الاشتراكات والماليات (Subscriptions)
* **`GET /api/subscriptions`**: استعلام إجمالي الاشتراكات والإيرادات.
* **`POST /api/subscriptions`**: إصدار إيصال اشتراك مالي.
  * **Body:** `{ "memberCode": "JS-2026-448", "year": 2026, "annualSub": true, "totalPaid": 350 }`

### 5. الشات اللحظي (Chat)
* **`GET /api/chat/messages?roomId=GENERAL`**: جلب رسائل الغرفة.
* **`POST /api/chat/messages`**: إرسال رسالة.
  * **Body:** `{ "roomId": "GENERAL", "senderId": "u1", "senderName": "مينا نبيل", "content": "سلام ونعمة يا أبطال" }`

### 6. الحفلات والفعاليات (Events)
* **`GET /api/events`**: جلب جميع الحفلات والفعاليات.
* **`POST /api/events`**: إضافة حفلة/معسكر جديد مع إرسال إشعار فوري لجميع الهواتف.
  * **Body:** `{ "title": "معسكر الشتاء الكشفي", "eventDate": "2026-11-20", "location": "وادي الريان" }`

---

## 🔔 كيف يتم إرسال الإشعارات من الويب إلى الموبايل وهو مقفول؟
عندما يقوم مسؤول الموقع بنشر إعلان جديد أو إرسال رسالة شات من الويب، يتم استدعاء دالة `sendWebNotification` (الموجودة في ملف [scouts-web-api-client.ts](file:///e:/app/scouts-web-api-client.ts)). 
هذه الدالة تقوم بما يلي:
1. تسجيل الإشعار في جدول `notifications`.
2. جلب الـ `push_tokens` الخاصة بهواتف الكشافة والقادة.
3. إرسال طلب لـ `https://exp.host/--/api/v2/push/send`.
4. تصل الرسالة فوراً على شاشات قفل هواتف المستخدمين كإشعار خارجي بصوت واهتزاز!
