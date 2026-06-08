# Splitsexp — Smart Expense Splitter

> Stop the awkward money talk. Splitsexp makes sharing expenses, managing group budgets, and settling debts effortless and transparent.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black&style=flat-square)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-38BDF8?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

##  Features

| Feature | Description |
|---|---|
|  **Authentication** | Email/password credentials and **Google Sign-In** powered by Firebase Auth. Persistent sessions and automatic Firestore profile synchronization. |
|  **Dynamic Dashboard** | Real-time balance overview (You are owed / You owe), monthly spending totals, 7-day spending bar chart, and active group summaries — all calculated live from Firestore. |
|  **Group Management** | Create expense-sharing circles with friends. Add members to existing groups. Delete groups via a branded custom confirmation modal. |
|  **Manual Expense Entry** | Manually input title and amount, select group circle, and split cost. Supports Equal, Exact, and Percentage shares. |
|  **Scan Receipt** | Capture live receipt photos (WebRTC in-app camera) or upload images. Processes text client-side via **Tesseract.js OCR** with real-time canvas preprocessing, auto-heals common OCR spelling/decimal errors, supports in-place item adjustments (add/delete/edit), and calculates group splits instantly. |
|  **Flexible Splitting** | Toggle between **Equally** (even split), **Exact** (custom dollar shares), or **Percent** (custom percentage shares) with real-time validation math and auto-population convenience. |
|  **Expense History** | Full table-view history of all past transactions with per-user balance status (paid / owed). |
|  **Settle Balances** | Clear view of outstanding debts per friend. Shows "All settled up!" automatically when no debts remain. |
|  **Data Isolation** | Firestore security rules ensure each user's data is completely private — no cross-user data leakage. |

---

##  Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + Vite 8 |
| **Routing** | React Router DOM 7 |
| **Styling** | Tailwind CSS 3 (Material Design 3 token system) |
| **Icons** | Google Material Symbols (Outlined) |
| **Typography** | Inter via Google Fonts |
| **Backend / DB** | Firebase Firestore (NoSQL) |
| **Authentication** | Firebase Auth (Email/Password & Google Sign-In) |
| **OCR Engine** | Tesseract.js (Client-side) |
| **Build Tool** | Vite |

---

##  Project Structure

```
splitsexp/
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   ├── AddExpense.jsx   # Form to manually add a new expense
│   │   ├── ExpenseHistory.jsx  # Recent expense list component
│   │   ├── Footer.jsx
│   │   ├── Header.jsx       # Sticky navigation bar
│   │   └── ScanBill.jsx     # Bill scanning UI component
│   ├── pages/
│   │   ├── Dashboard.jsx    # Main authenticated landing page
│   │   ├── GroupManagement.jsx  # Create, view, and delete groups
│   │   ├── History.jsx      # Full expense transaction history
│   │   ├── Landing.jsx      # Marketing page + auth forms
│   │   ├── ManualExpense.jsx # Manual expense entry and split config
│   │   ├── ScanSplit.jsx    # Receipt scanning & group assignment
│   │   └── SettleBalances.jsx   # Outstanding debts overview
│   ├── services/
│   │   ├── db.js            # All Firestore & Auth service functions
│   │   └── firebase.js      # Firebase app initialization
│   ├── App.jsx              # Root app with React Router setup
│   ├── index.css            # Tailwind directives + utility layer
│   └── main.jsx             # Entry point
├── firestore.rules          # Firestore security rules
├── firebase.json            # Firebase project configuration
├── tailwind.config.js       # Design token system (Material Design 3)
├── vite.config.js
└── .env                     # Environment variables (not committed)
```

---

##  Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [Firebase project](https://console.firebase.google.com/) with **Authentication** (Email/Password) and **Firestore Database** enabled

### 1. Clone the repository

```bash
git clone https://github.com/niranjanganesh1324/Splitsexp.git
cd Splitsexp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root by copying the example:

```bash
cp .env.example .env
```

Then fill in your Firebase project credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

>  **Never commit your `.env` file.** It is already listed in `.gitignore`.

### 4. Deploy Firestore security rules

```bash
firebase deploy --only firestore:rules
```

### 5. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

##  Firebase Setup

### Firestore Collections

The app uses three top-level Firestore collections:

| Collection | Purpose |
|---|---|
| `users/{uid}` | User profile (name, email, createdAt) |
| `groups/{groupId}` | Group metadata (name, members array, memberIds array, createdBy) |
| `expenses/{expenseId}` | Expense records (title, amount, paidBy, participants, group, userIds, timestamp) |

### Security Rules

The included `firestore.rules` ensures:

- **`/users/{userId}`** — Only the authenticated user matching the document ID can read or write their own profile.
- **`/expenses/{expenseId}`** — Any authenticated user can read/write expenses (scoped by `userIds` array in queries).
- **`/groups/{groupId}`** — Any authenticated user can read/write groups (scoped by `memberIds` array in queries).

---

##  Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint on the source code |

---

##  Design System

Splitsexp uses a **Material Design 3**-inspired token system built directly into Tailwind CSS. All colors, spacing, and typography are expressed as semantic tokens:

- **Colors**: `primary`, `on-primary`, `surface-container-lowest`, `error`, `secondary`, `outline-variant`, etc.
- **Spacing**: `xs` (4px), `sm` (12px), `md` (24px), `lg` (40px), `xl` (64px)
- **Typography**: `text-headline-xl`, `text-headline-md`, `text-body-md`, `text-label-sm`, etc.
- **Font**: [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts

---

##  App Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | Landing / Login / Sign Up | No |
| `/dashboard` | Main dashboard with balance overview | Yes |
| `/manual` | Manually enter expense details & configure split | Yes |
| `/scan` | Upload & split a receipt | Yes |
| `/history` | Full expense transaction log | Yes |
| `/groups` | Manage group circles | Yes |
| `/settle` | View & settle outstanding debts | Yes |

---

##  Key Architectural Decisions

- **No Redux / Context store** — User state is lifted to `App.jsx` and passed down as props. Simple and predictable.
- **Firebase auth persistence** — `subscribeToAuthChanges` uses Firebase's `onAuthStateChanged` so the session survives page refreshes automatically.
- **Route-state communication** — The Dashboard's "Create Group" button navigates to `/groups` with `{ state: { openCreateModal: true } }`, which GroupManagement reads via `useLocation` to auto-open the create modal. No shared global state needed.
- **Optimistic UI updates** — After creating a group or adding a member, the local React state is updated immediately without refetching from Firestore.
- **Custom delete modal** — Group deletion uses a purpose-built React confirmation dialog instead of the browser's `window.confirm()` for a consistent premium UI experience.

---

##  Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please ensure `npm run build` passes before submitting a PR.

---

##  License

This project is licensed under the **MIT License**.

---

<div align="center">
  <sub>Built using React, Firebase & Tailwind CSS</sub>
</div>
