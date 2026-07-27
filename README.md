# ClaimFlow — Claims Management Platform

A production-ready, minimal Claims Management Platform for **Patients** and **Insurers**.

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + lucide-react
- **Backend:** Node.js + Express + Mongoose (MongoDB)
- **Persistence:** MongoDB via `MONGODB_URI`, with automatic in-memory seed fallback

---

## Features

### Shared
- Mock authentication header with one-click switch between **Patient View** and **Insurer View**
- Pre-configured mock profiles: `patient@example.com` and `insurer@example.com`
- Modern, fully responsive Tailwind UI with animations and micro-interactions

### Patient Side
- **Submit Claim** form: Name, Email, Claim Amount ($), Description, and document upload (Base64 image preview)
- **My Claims dashboard**: card grid with status badges, submission dates, approved amount, and insurer comments
- Summary stats (total claims, pending, total claimed, total approved) + search and status filter

### Insurer Side
- **Claims Review Queue**: responsive table (desktop) / cards (mobile) of all submitted claims
- Client-side filters: status (All / Pending / Approved / Rejected), amount range, search, and date/amount sorting
- **Review Drawer**: full claim details + document preview, Approve/Reject actions, approved amount input, and insurer comments

### Backend API
| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET`  | `/api/health` | Health check + active mode (mongodb/memory) |
| `GET`  | `/api/claims?status=&min=&max=&sort=` | List claims with optional filters |
| `GET`  | `/api/claims/:id` | Fetch a single claim |
| `POST` | `/api/claims` | Submit a new claim |
| `PATCH`| `/api/claims/:id` | Update status, approvedAmount, insurerComments |

**Query params for `GET /api/claims`:**
- `status` — `Pending` | `Approved` | `Rejected` | `All`
- `min` / `max` — claim amount range (numbers)
- `sort` — `newest` | `oldest` | `amount-high` | `amount-low`

**Mongoose schema:** `name, email, claimAmount, description, documentUrl, status, submissionDate, approvedAmount, insurerComments` (plus Mongoose `id` virtual).

---

## Getting Started

### Frontend
```bash
npm install
npm run dev      # Vite dev server (http://localhost:5173)
npm run build    # production build
```

### Backend
```bash
cd server
cp .env.example .env       # then edit MONGODB_URI (optional)
npm install
npm run dev                # starts Express on http://localhost:4000
npm run seed               # optional: seed sample claims into MongoDB
```

### MongoDB connection
Set `MONGODB_URI` in `server/.env`. If the URI is missing or unreachable, the API
automatically falls back to an **in-memory seed dataset** so the platform stays
fully functional for demos and local testing.

---

## Project Structure
```
src/
  components/        React UI (patient, insurer, shared)
  context/          Mock auth context
  data/             Frontend seed data
  hooks/            useClaims (CRUD + filtering)
  lib/              formatting + helpers
  types.ts          shared TypeScript types
server/
  src/
    models/         Mongoose schema
    routes/         Express REST routes
    db.js           connection + fallback logic
    memoryStore.js  in-memory fallback store
    seedData.js     sample claims
    server.js       Express app entry
    seed.js         optional seeding script
```

> The frontend ships with its own local-persistence layer so the UI is fully
> interactive even without the backend running. Start the backend to enable the
> REST API and shared MongoDB persistence.
