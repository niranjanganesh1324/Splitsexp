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
| **Backend / DB (Default)** | Firebase Firestore (NoSQL) + Firebase Auth |
| **Backend / DB (Local)** | Custom Node.js Express REST API + SQLite Database + JWT Auth |
| **OCR Engine** | Tesseract.js (Client-side, self-hosted in `public/tesseract/`) |
| **Build Tool** | Vite |

---

##  Project Structure

```
splitsexp/
├── backend/                 # Custom Node.js Express server
│   ├── database.js          # SQLite connection, schemas & queries
│   ├── server.js            # Express API endpoints & JWT middleware
│   └── package.json         # Backend dependencies
├── public/                  # Static assets
│   ├── tesseract/           # Self-hosted Tesseract worker & WASM core files
│   └── favicon.svg
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # React page views
│   ├── services/
│   │   ├── db.js            # Router switcher between Firestore & SQLite REST client
│   │   ├── db_firebase.js   # Original Firestore database client
│   │   ├── db_custom.js     # Custom Express REST client
│   │   └── firebase.js      # Firebase app initialization
│   ├── App.jsx              # Root app routing
│   ├── index.css            # Style tokens
│   └── main.jsx             # React entry point
├── firestore.rules          # Firestore security rules
├── firebase.json            # Firebase project configuration
└── .env                     # App configuration env variables
```

---

##  Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [Firebase project](https://console.firebase.google.com/) (Optional: only needed if running in Firebase mode)

### 1. Clone the repository

```bash
git clone https://github.com/niranjanganesh1324/Splitsexp.git
cd Splitsexp
```

### 2. Install dependencies

Install both the frontend and custom backend dependencies:

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Define your database adapter type and configuration keys:

```env
# Switch database: 'firebase' or 'custom'
VITE_DATABASE_TYPE=firebase

# Firebase configuration (Required if VITE_DATABASE_TYPE=firebase)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## Running the Application

Depending on the value of `VITE_DATABASE_TYPE` in your `.env` file, choose one of the following run configurations:

### Option A: Firebase Cloud Mode
Ensure `VITE_DATABASE_TYPE=firebase` (or leave it blank) and start the frontend:
```bash
npm run dev
```

### Option B: Local Custom Backend Mode (Express + SQLite)
Ensure `VITE_DATABASE_TYPE=custom` and start both the server and frontend in separate terminal windows:
```bash
# Terminal 1: Starts Express server on http://localhost:5000
npm run backend

# Terminal 2: Starts React client on http://localhost:5173
npm run dev
```

---

##  Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run backend` | Start the local Express backend server |
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

- **Dynamic Database Router** — `src/services/db.js` dynamically routes all database and auth functions to either `db_firebase.js` or `db_custom.js` at runtime based on the `.env` configuration, enabling seamless switching between Firebase Cloud and local SQLite.
- **Self-Hosted OCR Assets** — Hosted Tesseract Web Worker and WASM core files locally inside `/public/tesseract` to prevent cross-origin errors (CORS), enable offline support, bypass Content Security Policies (CSP), and dramatically speed up scanning.
- **Optimized OCR Parser** — Canvas scaling in `preprocessImage` prevents memory exhaustion on large mobile uploads, while the regex parser handles line descriptions and missing decimals (e.g. `840.0`), automatically dropping fallback grand totals from the item list.
- **State management** — User state is lifted to `App.jsx` and passed down as props. Simple, lightweight, and predictable.

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
  <sub>Built using React, Firebase, Express, SQLite & Tailwind CSS</sub>
</div>
