# ⚽ Football League Management & Live Player Auction System

A professional, full-stack **MERN + TypeScript** platform for tournament management, franchise roster building, public player applications, and live player auctions with real-time Socket.IO synchronization.

---

## 🏛️ System Architecture

The project is structured into three decoupled frontend applications sharing a single Node.js/Express backend and MongoDB database with real-time bidirectional WebSocket events:

```
                                      ┌──────────────────────────────────────────────┐
                                      │        Cloudinary CDN / Local Disk           │
                                      │            (Player Photo Uploads)            │
                                      └──────────────────────┬───────────────────────┘
                                                             │
┌──────────────────────────────┐              ┌──────────────┴──────────────┐              ┌──────────────────────────────┐
│  player-registration (5174)  │              │        server (5000)        │              │    admin-dashboard (5173)    │
│   Public Candidate Portal    │ ── POST ───► │  Shared Express REST + WS   │ ◄── WS/REST ─│   Private Management Console │
│  - 6 Mandatory Fields Form   │              │  - Socket.IO Real-Time Floor│              │  - Executive Auction Deck    │
│  - Photo Upload & Preview    │ ◄── Status ──│  - Server-Authoritative Cloc│              │  - Review Player Applications│
│  - Status Tracking by ID     │              │  - Atomic Squad Deductions  │              │  - Approve / Reject Workflow │
└──────────────────────────────┘              └──────────────┬──────────────┘              └──────────────────────────────┘
                                                             │
                                        ┌────────────────────┼────────────────────┐
                                        │                                         │
                         ┌──────────────┴──────────────┐           ┌──────────────┴──────────────┐
                         │   projector-screen (5173)   │           │   manager-portal (5173)     │
                         │   /auction/live/:auctionId  │           │      /auction/manager       │
                         │ - Big Screen Stadium View   │           │ - 8 Franchise Logins        │
                         │ - Real-Time Highest Bid     │           │ - Real-time +$10k-$100k Bids│
                         │ - Zero Private Data Leakage │           │ - Squad & Budget Constraints│
                         └─────────────────────────────┘           └─────────────────────────────┘
```

| Application / Route | Port | Description | Tech Stack |
| :--- | :--- | :--- | :--- |
| **`server`** | `5000` | Shared backend REST API + Socket.IO real-time engine | Node.js, Express, TypeScript, Mongoose, Socket.IO, JWT, Multer |
| **`admin-dashboard`** (`/auction`) | `5173` | Executive Live Auction Control Room | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Socket.IO |
| **`projector-screen`** (`/auction/projector`) | `5173` | Full-screen stadium display for projectors and big monitors | React 18, TypeScript, Vite, Tailwind CSS, Socket.IO |
| **`manager-portal`** (`/auction/manager`) | `5173` | Franchise manager real-time bidding console | React 18, TypeScript, Vite, Tailwind CSS, Socket.IO |
| **`player-registration`** | `5174` | Public candidate registration & application status | React 18, TypeScript, Vite, Tailwind CSS, Lucide React |

---

## ⚡ Phase 4: Live Player Auction System (Real-Time Socket.IO)

### 1. Admin Auction Control Deck (`/auction`)
- **Arbitration Controls**: Start, pause, and resume auction sessions in real-time.
- **Draft Queue Management**: Dynamically bring approved players from the candidate draft queue onto the podium.
- **Base Price & Timer Config**: Configurable opening base price and countdown duration (default 30 seconds).
- **Hammer Actions**:
  - **DECLARE SOLD**: Atomically allocates player to the winning franchise, deducts the final hammer price from the team's remaining budget, increments squad count, and broadcasts the celebration banner to all connected screens.
  - **DECLARE UNSOLD**: Returns the unbid candidate to the unsold pool for future draft rounds.
- **Live Ledger**: Real-time record of all sold and unsold transactions with final prices and timestamps.

### 2. Projector Live Auction Screen (`/auction/projector` or `/auction/live/:auctionId`)
- **Stadium Display Optimized**: Designed for projection on large monitors and auditorium screens.
- **Full-Screen Cinema Mode**: Integrated full-screen toggle via Fullscreen API.
- **Live Telemetry Display**:
  - High-resolution player photo and playing position badge.
  - Player name, age (calculated from date of birth), and registration ID.
  - Giant current highest bid with glowing typography.
  - Leading team logo, franchise name, and short code.
  - Server-synchronized countdown clock (turns amber at 10s, pulsing red at 5s).
  - High-impact animated overlays for **SOLD!** and **UNSOLD**.
- **Privacy Enforcement**: Strictly zero private player contact information (phone number and email address are never transmitted to this route).

### 3. Team Manager Bidding Dashboard (`/auction/manager`)
- **Franchise Authentication**: Secure JWT login mapped specifically to the manager's assigned team.
- **Quick Franchise Switcher**: 1-click test login for all 8 tournament franchises for demoing.
- **Live Franchise Telemetry**:
  - Current remaining budget and budget utilization progress bar.
  - Squad slot capacity (`playersCount` / `maxSquadSize`).
- **Interactive Bidding Floor**:
  - One-click quick increment buttons: `+ $10,000`, `+ $25,000`, `+ $50,000`, `+ $100,000`.
  - Custom bid input with minimum required bid hints.
  - Real-time bid acceptance and rejection toast notifications.
  - Server-side guardrails: automatically blocks bids exceeding remaining budget, bids when squad is full (18 players), or bids placed after the timer has expired.

---

## 🎨 Phase 5: Team Squad Poster Generator & Player Cards Studio

A complete, broadcast-quality poster generator allowing tournament administrators to render, customize, and export professional squad announcement graphics and individual player cards from actual live auction squad records.

### 1. Interactive 3-Panel Studio Layout (`/poster-generator`)
- **Left Panel**: Franchise team picker (with club crests and squad statistics), season selector ("2026-27"), and squad position breakdown (Goalkeepers, Defenders, Midfielders, Forwards, Captain, and Total Squad Value).
- **Center Panel**: Scaled live viewport with real-time preview of the active template, dimension, titles, and player cards.
- **Right Panel**: Template selector, export aspect ratio switcher, customizable title and subtitle, and toggles for playing positions, jersey numbers, captain badges, and player ages.

### 2. Three Distinct Poster Templates
1. **Modern Football Club (`modern`)**:
   - Dark gradient stadium background with vibrant club primary accents (`#10b981` / `#f97316`).
   - Prominent club crest badge, official title banner, and organized responsive squad grid.
   - High-impact player cards showing photo, name, position, age, rating, and captain badge.
2. **Professional League Announcement (`announcement`)**:
   - Official tournament broadcast ribbon and gold/metallic framing.
   - Sleek dark player cards with contrast borders and official league watermark.
   - Distinct squad statistics bar and confirmed roster counter.
3. **Minimal Football Poster (`minimal`)**:
   - High-contrast obsidian minimalist layout with fine architectural grid lines.
   - Monochromatic styling focusing purely on sharp player portraits, clean typography, and jersey numbers.

### 3. Supported Export Dimensions
- **Instagram Portrait**: `1080 × 1350 px` (4:5 aspect ratio) – Optimal for Instagram feed announcements.
- **Instagram Square**: `1080 × 1080 px` (1:1 aspect ratio) – Standard square social media graphic.
- **Instagram Story**: `1080 × 1920 px` (9:16 aspect ratio) – Fullscreen vertical mobile story / reel.
- **Ultra HD Print**: `1440 × 1800 px` – Ultra-high resolution print and web banner.

### 4. High-Res PNG & ZIP Downloads
- **Complete Squad Poster (PNG)**: Client-side rendering via `html-to-image` at 2x pixel ratio for maximum print sharpness with zero blurriness or text clipping.
- **Download All Cards (ZIP)**: Automatically batches every squad member's individual card into high-resolution PNGs and packages them into a single `.zip` file using `jszip` with real-time export progress tracking.
- **Individual Player Cards**: Inspect and download any individual player card on demand.

### 5. Squad Data Gating & Consistency
- Includes **only** players belonging to the selected franchise's squad (purchased in auction or official roster).
- Never leaks unsold players or players from competing franchises.
- Graceful photo fallbacks if a player image is missing or unreachable.
- Jersey numbers and Captain badges are rendered only if assigned.

---

## 🔌 Socket.IO Real-Time Event Architecture

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join:auction` | Client ➔ Server | `{ auctionId }` | Subscribes socket to room `auction:<id>` and emits current state |
| `leave:auction`| Client ➔ Server | `{ auctionId }` | Unsubscribes socket from auction room |
| `bid:place` | Client ➔ Server | `{ auctionId, amount, token }` | Team manager submits a bid with JWT authorization |
| `auction:state`| Server ➔ Client | `AuctionStatePayload` | Full snapshot of lot, leader, bids, and franchise purses |
| `bid:placed` | Server ➔ Broadcast | `{ bid, currentHighestBid, leadingTeam, remainingSeconds }` | Broadcasted on valid bid; auto-resets server countdown |
| `bid:accepted`| Server ➔ Client | `{ message, bid }` | Direct acknowledgment to the bidding manager |
| `bid:rejected`| Server ➔ Client | `{ message }` | Direct error reason to bidding manager (e.g. low bid, over budget) |
| `timer:tick` | Server ➔ Broadcast | `{ auctionId, remainingSeconds, endsAt }` | 1-second interval broadcast of server-authoritative timer |
| `timer:ended`| Server ➔ Broadcast | `{ auctionId, message }` | Broadcasted when timer reaches zero; freezes bidding floor |
| `player:next` | Server ➔ Broadcast | `{ player, basePrice, lotNumber }` | Broadcasted when admin brings new player to podium |
| `player:sold` | Server ➔ Broadcast | `{ result, winningTeamName, finalPrice }` | Broadcasted on SOLD; triggers celebration animations |
| `player:unsold`| Server ➔ Broadcast| `{ result, player }` | Broadcasted on UNSOLD lot |
| `auction:paused`| Server ➔ Broadcast| `{ auctionId }` | Halts timer and disables bidding floor |
| `auction:resumed`| Server ➔ Broadcast| `{ auctionId }` | Re-enables floor |

---

## 🔐 Franchise Team Accounts & Default Credentials

All 8 franchise managers are pre-seeded with password **`Manager@123`**:

| Franchise Team | Short Code | Manager Name | Login Email | Initial Purse |
| :--- | :--- | :--- | :--- | :--- |
| **Thunder Strikers FC** | `THU` | Erik Veldman | `manager.thunder@football.league` | $1,500,000 |
| **Apex Predators** | `APX` | Carlos Moretti | `manager.apex@football.league` | $1,500,000 |
| **Iron Titans FC** | `TIT` | Marcus Vance | `manager.titans@football.league` | $1,500,000 |
| **Solar Flare SC** | `SOL` | Tariq Al-Mansoor | `manager.solar@football.league` | $1,500,000 |
| **Coastal Surge FC** | `CSG` | Lucas Marin | `manager.coastal@football.league` | $1,500,000 |
| **Highland Wolves** | `HLW` | Callum MacLeod | `manager.wolves@football.league` | $1,500,000 |
| **Metro Dynamos** | `MET` | Andre Santos | `manager.metro@football.league` | $1,500,000 |
| **Oasis Wanderers** | `OAS` | Youssef Benali | `manager.oasis@football.league` | $1,500,000 |

### Commissioner / Admin Account
- **Email**: `admin@football.league`
- **Password**: `Admin@123456`
- **Role**: `superadmin`

---

## 🧪 Comprehensive Automated Test Suite

A standalone comprehensive automated test suite validates all 17 architectural domains:

```bash
npm --prefix server run test
```

### Test Coverage (114 Tests Total - 100% Passing)
1. **Health Check** (HTTP 200, success flag)
2. **Security & Authorization** (Anonymous 401s, forged JWT rejections)
3. **Admin Authentication** (Valid JWT signature, role payload)
4. **Player Registration Validations** (Missing photo, missing position, invalid email format)
5. **Successful Registrations** (Standard candidate, optional email test, unique `PLR-2026-XXXXXX` ID)
6. **Duplicate Prevention** (Duplicate email 409, duplicate phone 409)
7. **Public Application Status Check** (Masked privacy names, 404 nonexistent IDs)
8. **Admin Approval & Rejection Workflow** (Status transitions, auction pool assignment, rejection reasons)
9. **Admin Statistics Engine** (Position breakdown, approval rates)
10. **Auction Session Control Deck** (Start, pause, resume lifecycle)
11. **Podium Sequencing** (Eligible approved gating, base price initialization)
12. **Team Manager Authentication & Role Separation** (Manager logins, token scoping, admin forbidden from bidding)
13. **Real-time Bidding Engine & Validations** (Sub-base price rejections, outbidding, purse limit ceiling rejections)
14. **SOLD Process** (Hammer down, winner allocation, purse deduction, squad count increment, duplicate sale prevention)
15. **UNSOLD Process** (Player returned to draft pool, 0 final price)
16. **Projector Telemetry & Privacy Check** (Zero exposure of candidate phone numbers or email addresses)
17. **Team Squad Poster Studio & Cards** (Admin authorization, squad data isolation, sold auction player inclusion, individual player cards dataset, export event logging, 404 error handling)

```
======================================================
📊 TEST SUITE SUMMARY: 114 PASSED, 0 FAILED
======================================================
```

---

## ⚙️ Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20/v24)
- **npm** v9+
- *(Optional)* **MongoDB** (the application seamlessly uses an in-memory database fallback if MongoDB is not running locally)

### 2. Installation
```bash
# Backend server
cd server && npm install

# Admin Dashboard
cd ../admin-dashboard && npm install

# Player Registration Portal
cd ../player-registration && npm install
```

### 3. Running All Three Applications

Open three terminal windows:

```bash
# Terminal 1: Backend Express + Socket.IO Server (Port 5000)
cd server
npm run dev

# Terminal 2: Admin Dashboard & Auction Arena (Port 5173)
cd admin-dashboard
npm run dev

# Terminal 3: Public Player Registration Portal (Port 5174)
cd player-registration
npm run dev
```

### 4. Experience the Live Auction Workflow
1. **Open Player Registration Portal** (`http://localhost:5174`): Register a player with photo.
2. **Open Admin Dashboard** (`http://localhost:5173/registrations`): Log in as Admin (`admin@football.league` / `Admin@123456`) and click **Approve Application**.
3. **Open Projector Screen** (`http://localhost:5173/auction/projector`): Experience the live stadium presentation display.
4. **Open Manager Portal** (`http://localhost:5173/auction/manager`): Click **Thunder Strikers FC** or **Apex Predators** 1-click login.
5. **From Admin Auction Deck** (`http://localhost:5173/auction`): Click **Next Player...**, put the approved player on stage, and click **Start Clock (30s)**.
6. **From Manager Portal**: Place bids (`+$10k`, `+$25k`) — watch the projector screen and admin deck update in real time without refreshing!
7. **From Admin Deck**: Click **DECLARE SOLD** — observe the victory banner, squad increment, and purse deduction!

---

## 🛡️ License
MIT License. Built for professional tournament and league operations.
