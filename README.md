# ⚽ Football League Management & Live Player Auction System

Professional, full-stack **MERN + TypeScript** platform for tournament management, franchise roster building, and live player auctions.

---

## 📋 Phase 1: Project Setup & Admin Dashboard Architecture

Phase 1 establishes the production architecture, TypeScript configurations, database layer, responsive dark football interface, and all 11 core admin modules.

### ✨ Highlights
- **Football-Themed Dark Design**: Deep pitch blacks (`#080c14`, `#0d131f`), pitch border accents, subtle grid lines, and vibrant turf green (`#10b981` / `#22c55e`).
- **Complete Admin Suite**: Working navigation and dedicated interactive views for all 11 admin sections.
- **Robust Telemetry & Health Monitoring**: Live API and MongoDB status indicators with latency and heap memory tracking.
- **Graceful Database Fallback**: Auto-detects local/remote MongoDB and safely transitions between persistent storage and demo showcase mode.
- **Production-Ready Codebase**: Fully typed with strict TypeScript, modular services, centralized error handling, and reusable components.

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 + TypeScript | Component-based UI with strict static types |
| **Tooling** | Vite 6 | Lightning-fast HMR and optimized bundler |
| **Routing** | React Router DOM 6 | Declarative client-side routing & active navigation |
| **Styling** | Tailwind CSS 3 | Utility-first pitch dark palette & responsive design |
| **Icons** | Lucide React | High-performance SVG icons |
| **Backend** | Node.js + Express + TypeScript | Type-safe RESTful API server |
| **Database** | MongoDB + Mongoose 8 | Document database with schema models |
| **Validation** | Zod | Runtime schema request validation |
| **Security & Logging** | Helmet + Morgan + CORS | HTTP security headers and structured logging |

---

## 🗂️ Project Structure

```
football-league-management-system/
├── package.json                 # Root scripts for concurrently running client & server
├── .env.example                 # Root environment variables template
├── README.md                    # Comprehensive documentation and startup guide
│
├── server/                      # Express + TypeScript Backend
│   ├── .env.example             # Server environment template
│   ├── tsconfig.json            # Server TypeScript configuration
│   └── src/
│       ├── config/              # Environment config and MongoDB connector
│       │   ├── db.ts            # Mongoose connection with fallback telemetry
│       │   └── env.ts           # Dotenv configuration
│       ├── controllers/         # Request handling logic
│       │   ├── dashboard.controller.ts
│       │   └── health.controller.ts
│       ├── middleware/          # Security, validation, and error boundaries
│       │   ├── errorHandler.ts  # Centralized error handler
│       │   ├── notFound.ts      # 404 handler
│       │   └── validateRequest.ts # Zod request validation
│       ├── models/              # Mongoose data schemas
│       │   ├── Player.ts
│       │   ├── Team.ts
│       │   ├── Registration.ts
│       │   ├── AuctionSession.ts
│       │   └── Fixture.ts
│       ├── routes/              # Modular API endpoints
│       │   ├── index.ts
│       │   ├── health.routes.ts
│       │   └── dashboard.routes.ts
│       ├── services/            # Business logic and database aggregation
│       │   └── dashboard.service.ts
│       ├── types/               # TypeScript interfaces and API schemas
│       ├── utils/               # Structured logger & standardized apiResponse
│       └── server.ts            # Application bootstrap & graceful shutdown
│
└── client/                      # React + TypeScript + Vite Frontend
    ├── index.html               # Entry HTML with dark theme meta
    ├── tailwind.config.js       # Pitch dark palette and glow shadows
    ├── vite.config.ts           # Vite bundler config with /api reverse proxy
    └── src/
        ├── assets/              # Static media assets
        ├── components/
        │   ├── common/          # Reusable UI primitives (Button, Badge, Card, StatCard, Modal, SearchBar, Skeleton)
        │   ├── dashboard/       # Dashboard widgets (StatsOverview, PositionChart, TrendsChart, BudgetTable, ActivityFeed, HealthWidget)
        │   └── layout/          # Sidebar, Header with live health badge, DashboardLayout
        ├── hooks/               # Custom React hooks (useDashboardData, useHealthCheck)
        ├── pages/               # 11 Dedicated Admin Management Views
        │   ├── DashboardPage.tsx       # Live overview & metrics
        │   ├── PlayersPage.tsx         # Player pool & roster inspection
        │   ├── RegistrationsPage.tsx   # Candidate review & verifications
        │   ├── TeamsPage.tsx           # Franchise clubs & purse caps
        │   ├── LiveAuctionPage.tsx     # Stage arena & lot queue preview
        │   ├── TeamSquadsPage.tsx      # Formations & starting XI board
        │   ├── PosterGeneratorPage.tsx # Matchday graphic design studio
        │   ├── FixturesPage.tsx        # Tournament match calendar
        │   ├── MatchResultsPage.tsx    # Official scorelines & reports
        │   ├── PointsTablePage.tsx     # League standings & form table
        │   ├── SettingsPage.tsx        # System configuration & testing
        │   └── NotFoundPage.tsx        # 404 football boundary screen
        ├── services/            # Typed HTTP client & API abstraction
        ├── types/               # Frontend TypeScript domain types
        ├── App.tsx              # Router routing tree
        └── main.tsx             # React DOM root entrypoint
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- **MongoDB**: Optional for Phase 1. If running locally (`127.0.0.1:27017`) or configured with MongoDB Atlas, the backend automatically connects. If unavailable, the server automatically boots in standalone mode with demo data.

---

### 2. Installation
Run the root helper command to install dependencies across root, server, and client:

```bash
npm run install:all
```

Or install individually:

```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

---

### 3. Environment Setup

Copy `.env.example` in both server and client:

```bash
# Backend configuration
cp server/.env.example server/.env

# Frontend configuration
cp client/.env.example client/.env
```

**`server/.env` contents:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/football_league
CLIENT_URL=http://localhost:5173
LOG_LEVEL=debug
```

**`client/.env` contents:**
```env
VITE_API_URL=/api
```

---

### 4. Running the Application

You can start both frontend and backend concurrently from the root directory:

```bash
npm run dev
```

Or run each in a dedicated terminal:

```bash
# Terminal 1: Backend API Server (Port 5000 with tsx hot reload)
npm run dev:server

# Terminal 2: Frontend Vite App (Port 5173 with instant HMR)
npm run dev:client
```

Open your browser at **[http://localhost:5173](http://localhost:5173)** to access the Admin Dashboard.

---

### 5. Production Build & Verification

To verify full TypeScript compilation and create optimized distribution bundles:

```bash
npm run build
```

This compiles:
1. `server/dist/`: TypeScript compiled Node.js server.
2. `client/dist/`: Minified React production bundle with code splitting.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status and root routing manifest |
| `GET` | `/api/health` | Comprehensive system health, MongoDB status, uptime, and memory |
| `GET` | `/api/dashboard/overview` | Core statistics, position distribution, trends, and recent activity |

### Sample Health Check Response (`GET /api/health`):
```json
{
  "success": true,
  "message": "API health check passed",
  "data": {
    "status": "ok",
    "service": "Football League & Auction API",
    "version": "1.0.0 (Phase 1)",
    "timestamp": "2026-11-18T07:21:35.562Z",
    "uptimeSeconds": 12,
    "database": {
      "status": "connected",
      "connected": true
    },
    "system": {
      "nodeVersion": "v20.x",
      "platform": "win32",
      "memory": {
        "heapUsedMB": 24.27,
        "heapTotalMB": 34.59
      }
    }
  }
}
```

---

## 🎯 Phase 1 Deliverables Summary

- [x] **Backend Architecture**: Express + TypeScript with modular routes, controllers, services, Mongoose models, and central error handling.
- [x] **MongoDB Integration**: Robust connection handling with auto-recovery and fallback to demo mode.
- [x] **Working Health Check**: Verified `/api/health` reporting live database telemetry and uptime.
- [x] **Frontend Architecture**: React 18 + Vite + TypeScript with strict typing.
- [x] **Dark Football Interface**: Polished UI with custom pitch grids, emerald/neon accents, and responsive layout.
- [x] **Responsive Sidebar**: Collapsible desktop sidebar with category dividers and full mobile drawer.
- [x] **11 Admin Dashboard Sections**: Working views for Dashboard, Players, Registrations, Teams, Live Auction, Team Squads, Poster Generator, Fixtures, Match Results, Points Table, and Settings.
- [x] **Overview Metrics**: Total registered players, approved players, pending registrations, total teams, players sold, and players remaining.
- [x] **Interactive Components**: Functional filters, search, modal inspection, and graphic generator.
- [x] **Documentation**: Full setup and installation instructions.

---

## 🔮 Next: Phase 2 Roadmap
- Real-time WebSocket live auction room (`Socket.io`).
- Auctioneer gavel controls and bid countdown clock.
- Real-time squad purse budget deduction and roster slot validation.
- Player registration portal with document uploads and public submission form.
