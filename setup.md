# Smart English Sathi — Multi-School Firestore Database Architecture

This document describes the multi-school database collections created for the **Smart English Sathi** app (Smart English Sathi).

---

## 1. Firebase Backend Initialization

The app initializes Firebase modular SDK (v10.7.0) via `firebase.js` and `/public/firebase.js`:

```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_PASTE_HERE",
  authDomain: "samart-english-sathi.firebaseapp.com",
  projectId: "samart-english-sathi",
  storageBucket: "samart-english-sathi.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

`firebase.js` is imported in `index.html` via `<script type="module" src="/firebase.js"></script>`.

---

## 2. Multi-School Firestore Collections Structure

### Collection 1: `schools`
Stores registered schools, their license tiers, and school codes.

- **Document ID**: `schoolId` (e.g., `smart_school_01`)
- **Fields**:
  | Field | Type | Description |
  | :--- | :--- | :--- |
  | `schoolId` | string | Unique document key (slug format) |
  | `schoolName` | string | Full name of the institution (e.g. `"Smart English Sathi Model School"`) |
  | `city` | string | City/Town (e.g. `"Wai"`) |
  | `principalId` | string | Firebase Auth UID of the school principal |
  | `totalStudents` | number | Count of active students registered under this school |
  | `plan` | string | License plan: `"free"` or `"paid"` |
  | `schoolCode` | string | 6-character unique enrollment code (e.g. `"SES001"`) |
  | `createdAt` | string/timestamp | Document creation timestamp (ISO 8601) |

#### Default Seeded School Document:
```json
{
  "schoolId": "smart_school_01",
  "schoolName": "Smart English Sathi Model School",
  "city": "Wai",
  "principalId": "prin_sumant_dalvi",
  "totalStudents": 120,
  "plan": "paid",
  "schoolCode": "SES001",
  "createdAt": "2026-09-01T00:00:00.000Z"
}
```

---

### Collection 2: `users`
Stores user profile accounts for all roles (Student, Individual Learner, Principal, Admin).

- **Document ID**: Firebase Auth UID (`uid`)
- **Fields**:
  | Field | Type | Description |
  | :--- | :--- | :--- |
  | `uid` | string | Document ID matching Firebase Auth UID |
  | `email` | string | User email or institutional login identifier |
  | `name` | string | User's full name (e.g. `"Riya Sharma"`, `"Sumant D. Dalvi"`) |
  | `role` | string | One of: `"student"`, `"individual"`, `"principal"`, `"admin"` |
  | `schoolId` | string \| null | Set to schoolId for students/principals; `null` for independent learners |
  | `principalId` | string \| null | UID of the school principal (for students), or `null` |
  | `class` | string \| null | Student grade (e.g. `"Class 10"`), or `null` for staff |
  | `isPaid` | boolean | `true` if active paid subscription; `false` if on trial or expired |
  | `validTill` | string \| null | Subscription expiration date (ISO 8601), or `null` |
  | `trialStart` | string \| null | Timestamp when 10-minute demo trial started |
  | `trialEnd` | string \| null | Timestamp when 10-minute demo trial expires |
  | `createdAt` | string/timestamp | Account registration timestamp |

#### Example User Document (Enrolled Student):
```json
{
  "uid": "std_riya_sharma_101",
  "email": "student@smartenglish.edu",
  "name": "Riya Sharma",
  "role": "student",
  "schoolId": "smart_school_01",
  "principalId": "prin_sumant_dalvi",
  "class": "Class 10",
  "isPaid": true,
  "validTill": "2027-04-30T23:59:59.000Z",
  "trialStart": "2026-09-01T08:00:00.000Z",
  "trialEnd": "2026-09-01T08:10:00.000Z",
  "createdAt": "2026-09-01T08:00:00.000Z"
}
```

#### Example User Document (Individual Learner):
```json
{
  "uid": "ind_aarav_patil_99",
  "email": "aarav.learner@gmail.com",
  "name": "Aarav Patil",
  "role": "individual",
  "schoolId": null,
  "principalId": null,
  "class": "Class 8",
  "isPaid": false,
  "validTill": null,
  "trialStart": "2026-09-05T10:00:00.000Z",
  "trialEnd": "2026-09-05T10:10:00.000Z",
  "createdAt": "2026-09-05T10:00:00.000Z"
}
```

---

### Collection 3: `lessons`
Stores curriculum conversation situations, shadowing drills, and multimedia references.

- **Document ID**: `lessonId` (e.g. `1`, `2`, `20`)
- **Fields**:
  | Field | Type | Description |
  | :--- | :--- | :--- |
  | `lessonId` | number \| string | Numeric sequence or unique lesson identifier |
  | `title` | string | Lesson title (e.g. `"Borrowing a library book"`) |
  | `youtubeLink` | string | Educational video explanation link |
  | `group` | string | Proficiency tier: `"A"` (Class 5-6), `"B"` (Class 7-8), `"C"` (Class 9-10), `"D"` (Class 11-12) |
  | `access` | string | `"free"` (e.g. initial trial lessons 1-5) or `"paid"` |
  | `schoolId` | string \| null | `null` for all schools (universal curriculum); specific `schoolId` for custom school lessons |
  | `subtitle` | string | Marathi/Hindi conversational summary |
  | `setting` | string | Scenario context and environment description |
  | `dialogs` | array | Turn-by-turn conversational lines with Marathi audio translations |
  | `vocabulary` | array | High-yield vocabulary, meanings, and bilingual translations |
  | `questions` | array | Fill-in-the-blank comprehension tests |
  | `roleplaySteps` | array | Guided interactive role-play prompts with speech evaluation |

---

### Collection 4: `cashRequests`
Tracks offline cash payments made by students or parents to teachers/school offices.

- **Document ID**: Auto-generated string (e.g. `cash_req_001`)
- **Fields**:
  | Field | Type | Description |
  | :--- | :--- | :--- |
  | `userId` | string | UID of student requesting cash payment activation |
  | `schoolId` | string | Target school where payment was submitted (e.g. `"smart_school_01"`) |
  | `status` | string | `"pending"` or `"approved"` |
  | `requestedAt` | string/timestamp | Timestamp when request was submitted |
  | `amount` | number | Payment amount in INR (optional, default: 500) |
  | `approvedAt` | string \| null | Timestamp when school admin/principal approved the request |
  | `notes` | string | Reference notes (e.g. `"Paid cash to class teacher"`) |

---

## 3. Code Implementation Files

1. **`firebase.js` & `/public/firebase.js`**:
   Initializes Firebase App, Auth, and Firestore modules from CDN.
2. **`index.html`**:
   Includes `<script type="module" src="/firebase.js"></script>` and unified navigation links to all portals.
3. **`login-all.html`**:
   Unified RBAC secure login screen with role selection dropdown (Student, Individual Learner, Principal, Admin). Validates authenticated user role against `users/{uid}.role` in Firestore, guards against expired trials and subscriptions, and redirects to role dashboards.
4. **`register.html`**:
   Learner registration supporting both School Students (with school dropdown fetched from `schools` collection and 6-digit code lookup) and Individual Learners. Initializes 10-minute active demo (`trialStart = now`, `trialEnd = now + 10min`).
5. **`pay.html`**:
   Subscription upgrade and renewal screen with pricing tiers (Annual ₹499, Monthly ₹49), instant UPI simulation, and cash payment verification request submission into Firestore `cashRequests`.
6. **`student-dashboard.html`**:
   Dedicated student learning center displaying active school affiliation, live 10-minute trial countdown guard, and curriculum launcher.
7. **`individual-dashboard.html`**:
   Independent learner dashboard with solo speaking practice tracking and trial timer.
8. **`mvm-admin-secure-2026.html`**:
   Super Admin Command Console for 100 Schools Network:
   - Security: `<meta name="robots" content="noindex, nofollow">` with `onAuthStateChanged` and Firestore `users/{uid}` role check (`admin` only). Redirects unauthorized visits to `index.html` with "Access Denied".
   - Top 5 Stats: Total Schools (from `schools` collection), Total Revenue (`paid students * ₹199`), Total Students (all schools), Total Individual Users, and Pending Cash Requests (`cashRequests` where `status == "pending"`).
   - Tab 1 (Schools): School Name, School Code, City, Principal Email, Total Students, Revenue, with `[View Students]` button that automatically filters Tab 2 to that school.
   - Tab 2 (All Users): Full roster with School dropdown filter, Role filter (Student/Individual/Principal/Admin), Paid status filter, and Search input. Actions include `[Approve Cash]` (updates `users/{id}` with `isPaid: true` and `validTill: date + 10 months` and marks matching `cashRequests` to `approved`), `[Block / Unblock]`, and `[Progress]` inspection modal.
   - Tab 3 (Cash Requests): Real-time queue of pending payment verification requests with 1-click `[Approve]` and `[Reject]` controls.
   - Tab 4 (Add Lesson / CMS): Form to publish lessons into Firestore `lessons` collection with Title, YouTube Link, Group (A/B/C/D), and Access (Free/Paid), alongside active curriculum catalog viewer.
9. **`principal-2026.html`**:
   Principal Executive Oversight Dashboard for Multi-School English Fluency Network:
   - Security: `<meta name="robots" content="noindex, nofollow">` with `onAuthStateChanged` and Firestore `users/{uid}` role check (`principal` or `admin` only). Redirects unauthorized visits to `index.html` with "Access Denied".
   - Top Header: School Name from `schools/{schoolId}` and School Code badge (e.g. `SES001`).
   - Prominent School Code Box: "Share this code with your students: SES001" with 1-click Copy and WhatsApp sharing.
   - 4 Stats Cards: Total Students (`where("schoolId","==",mySchoolId).where("role","==","student")`), Active Today (`lastActive > today`), Paid Students (`isPaid == true`), and Free Trial (`isPaid == false`).
   - Filters: Filter by Class (5th, 6th, 7th, 8th A/B, 9th, 10th A/B, 11th, 12th), Filter by Paid/Free, and Search by Name/Email input.
   - Real-time Main Table: Queries `users` with `onSnapshot` displaying Student Name, Class, Email, Progress (e.g. 14/20), Time Spent, Last Active, Paid Status (Green Paid / Red Free Trial), and "View Details" button.
   - Student Progress Modal: Inspects `users/{studentId}/progress` subcollection displaying lesson history, shadowing accuracy, and streak.
   - Export to Excel (CSV): Generates and downloads student fluency report as CSV.
10. **`school-register.html`**:
    Principal school onboarding and 6-digit code provisioning.
11. **`src/types.ts` & `src/data/firestoreCollections.ts`**:
    Database schemas, seed collections, and typed CRUD operations.

---

## 4. Production Firestore Security Rules (`firestore.rules`)

The security rules are deployed in `/firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth!= null && request.auth.uid == userId;
      allow read: if request.auth!= null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "principal" && resource.data.schoolId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.schoolId;
      allow read, write: if request.auth!= null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    match /schools/{schoolId} {
      allow read: if request.auth!= null;
      allow write: if request.auth!= null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
      allow create: if request.auth!= null;
    }
    match /lessons/{lessonId} {
      allow read: if request.auth!= null;
      allow write: if request.auth!= null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    match /cashRequests/{reqId} {
      allow read, write: if request.auth!= null;
    }
  }
}
```
