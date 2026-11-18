# ⚽ Football League Management & Live Player Auction System

A professional, full-stack **MERN + TypeScript** platform for tournament management, franchise roster building, public player applications, and live player auctions.

---

## 🏛️ System Architecture

The project is structured into three decoupled applications sharing a single Node.js/Express backend and MongoDB database:

```
                                      ┌──────────────────────────────────────────────┐
                                      │        Cloudinary CDN / Local Disk           │
                                      │            (Player Photo Uploads)            │
                                      └──────────────────────┬───────────────────────┘
                                                             │
┌──────────────────────────────┐              ┌──────────────┴──────────────┐              ┌──────────────────────────────┐
│  player-registration (5174)  │              │        server (5000)        │              │    admin-dashboard (5173)    │
│   Public Candidate Portal    │ ── POST ───► │  Shared Express RESTful API │ ◄── GET/PATCH│   Private Management Console │
│  - 6 Mandatory Fields Form   │              │  - JWT & Role Authentication│              │  - Review Player Applications│
│  - Photo Upload & Preview    │ ◄── Status ──│  - Duplicate Prevention     │              │  - Approve / Reject Workflow │
│  - Status Tracking by ID     │              │  - Cloudinary / Local Store │              │  - Auction Pool Gating       │
└──────────────────────────────┘              └──────────────┬──────────────┘              └──────────────────────────────┘
                                                             │
                                              ┌──────────────┴──────────────┐
                                              │    MongoDB Database / Mem   │
                                              │  - Players & Registrations  │
                                              │  - Admins & Tournament Data │
                                              └─────────────────────────────┘
```

| Application | Port | Description | Tech Stack |
| :--- | :--- | :--- | :--- |
| **`server`** | `5000` | Shared backend REST API, auth & storage | Node.js, Express, TypeScript, Mongoose, Multer, Zod, JWT |
| **`admin-dashboard`** | `5173` | Private tournament management console | React 18, TypeScript, Vite, Tailwind CSS, Lucide React |
| **`player-registration`**| `5174` | Public player application & status portal | React 18, TypeScript, Vite, Tailwind CSS, Lucide React |

---

## 🚀 Phase 2 Features: Player Registration & Admin Integration

### A. Public Player Registration Website (`http://localhost:5174`)
- **Pitch-Dark Football Theme**: Dark background (`#080c14`), pitch grass accents (`#10b981`), glowing badges, and responsive design for mobile & desktop.
- **Strict 6-Field Registration Form**:
  1. `fullName`: Candidate's full name (min 2 chars, letters and common symbols).
  2. `dateOfBirth`: Validated for tournament eligibility (ages 12 to 60).
  3. `phoneNumber`: E.164 international format validation (7 to 15 digits).
  4. `email`: Unique email validation.
  5. `playingPosition`: Mandatory selection: `Goalkeeper`, `Defender`, `Midfielder`, or `Forward`.
  6. `photo`: Secure file upload (JPG/JPEG/PNG, up to 5MB) with instant live preview and replacement before submission.
- **Automated Registration ID**: Generates an official `PLR-2026-XXXXXX` unique identifier.
- **Duplicate Prevention**: Email and phone number are indexed and verified before creation (returns `409 Conflict`).
- **Application Status Checker**: Public lookup tool allows players to check status by Registration ID or email. Candidate names are masked (`John D***`) to protect privacy.

### B. Admin Dashboard Integration (`http://localhost:5173/registrations`)
- **Admin JWT Authentication**: Protected admin routes with token expiration and role checking.
- **Comprehensive Candidate View**: Inspect all 6 submitted fields, high-resolution photo thumbnails, submission timestamps, and status badges.
- **Search & Filtering**: Real-time filtering by playing position (`Goalkeeper`, `Defender`, `Midfielder`, `Forward`) and status (`PENDING`, `APPROVED`, `REJECTED`), plus full-text search across name, email, phone, and registration ID.
- **Approve Workflow**: Approving an application assigns the player to the **Upcoming Auction Pool** with an initial base price.
- **Reject Workflow**: Rejection prompt records official reason (e.g., medical criteria, documentation) and informs the player via the status checker.
- **Auction Pool Enforcement**: Only **APPROVED** players are eligible for the upcoming live auction.

---

## 🔐 Default Admin Credentials

Default credentials seeded on initialization:
- **Email**: `admin@football.league`
- **Password**: `Admin@123456`
- **Role**: `superadmin`

> Admin tokens are cryptographically signed using `JWT_SECRET` in `server/.env`.

---

## ⚙️ Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20/v24)
- **npm** v9+
- *(Optional)* **MongoDB** running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI (if MongoDB is offline, the backend seamlessly runs with an in-memory repository).

### 2. Installation
Install all dependencies across all 3 applications:
```bash
npm run install:all
```

### 3. Start All Applications Concurrently
Run backend server and both frontends with a single command:
```bash
npm run dev
```

This starts:
- 🚀 **Server**: `http://localhost:5000`
- 🖥️ **Admin Dashboard**: `http://localhost:5173`
- ⚽ **Player Registration**: `http://localhost:5174`

---

## 🧪 Comprehensive Integration Test Suite

The project includes an in-process integration test suite covering 39 critical scenarios:
```bash
npm test
```

### Verified Test Categories:
- ✅ **API Health Check**: HTTP 200 with server telemetry.
- ✅ **Security & Authorization**: 401 Unauthorized for requests lacking valid JWT.
- ✅ **Admin Login**: 401 on invalid passwords, 200 with signed JWT on valid credentials.
- ✅ **6-Field Validation**: Rejects missing photos (`PHOTO_REQUIRED`), missing positions, invalid emails, and out-of-range phone numbers.
- ✅ **Player Registration**: 201 Created with unique `PLR-2026-XXXXXX` and status `PENDING`.
- ✅ **Duplicate Prevention**: 409 Conflict with `DUPLICATE_EMAIL` and `DUPLICATE_PHONE`.
- ✅ **Public Status Lookup**: Retrieves masked player data without leaking private contact information; returns 404 for unknown IDs.
- ✅ **Admin Approval**: Promotes candidate to `APPROVED` and adds to the auction draft pool.
- ✅ **Admin Rejection**: Records reason and updates public status to `REJECTED`.
- ✅ **Admin Statistics**: Live summary counts and position breakdown.

---

## 📁 Repository Structure

```
football-league-management-system/
├── package.json                 # Concurrently orchestrates server, admin & player portal
├── README.md                    # System documentation
│
├── server/                      # Shared Express API (Port 5000)
│   ├── .env                     # Server environment & Cloudinary config
│   ├── .env.example
│   ├── src/
│   │   ├── config/              # DB & Cloudinary configuration
│   │   ├── controllers/         # Auth, Player, Dashboard & Health controllers
│   │   ├── middleware/          # JWT auth, Multer upload & Central error handler
│   │   ├── models/              # Player & Admin Mongoose models
│   │   ├── routes/              # Modular API routes (/api/auth, /api/players, etc.)
│   │   ├── services/            # Dual-mode repository (MongoDB + in-memory fallback)
│   │   ├── test_runner.ts       # 39-step automated test suite
│   │   ├── app.ts               # Express application builder
│   │   └── server.ts            # Server entrypoint
│   └── uploads/players/         # Local disk storage for player photos (fallback)
│
├── player-registration/         # Public Player Portal (Port 5174)
│   ├── vite.config.ts           # Reverse proxy to port 5000 (/api & /uploads)
│   └── src/
│       ├── components/
│       │   ├── Header.tsx       # Logo, tournament title & live status indicator
│       │   ├── HeroSection.tsx  # Call to action & registration countdown
│       │   ├── InstructionsCard.tsx # 6 required field guidelines & photo requirements
│       │   ├── RegistrationForm.tsx # 6-field form with photo preview & validation
│       │   ├── SuccessView.tsx  # Confirmation screen with Registration ID copy tool
│       │   ├── StatusChecker.tsx# Public status tracker
│       │   └── Footer.tsx
│       ├── App.tsx
│       └── main.tsx
│
└── admin-dashboard/             # Private Management Console (Port 5173)
    ├── vite.config.ts           # Reverse proxy to port 5000
    └── src/
        ├── components/          # Reusable UI cards, tables, badges, and modals
        ├── pages/
        │   ├── RegistrationsPage.tsx # Review, search, filter, approve & reject players
        │   ├── DashboardPage.tsx     # Executive analytics
        │   └── PlayersPage.tsx       # Tournament player pool
        ├── services/            # Typed playerService, authService & api client
        ├── App.tsx
        └── main.tsx
```

---

## ☁️ Cloudinary Configuration

To stream player photos directly to Cloudinary CDN, update `server/.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Note**: If Cloudinary credentials are not configured, the system automatically uses secure local disk storage in `server/uploads/players/` and serves photos statically via `/uploads/players/`. Zero setup required for local development.

---

## 🔮 Roadmap: Upcoming Phase 3
- **Live Player Auction Engine**: WebSocket real-time bidding room.
- **Franchise Purse Caps**: Automated purse deduction and bid timer controls.
- **Roster Allocation**: Automatic team squad assignment upon auction gavel.
