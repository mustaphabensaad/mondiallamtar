# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Shabka** is a full-stack web application for managing an associative football tournament. It supports team registration, player management, live match scoring, and admin controls. The full specification is in `TOURNOI_FOOTBALL_IMPLEMENTATION (1).md`.

This is a **monorepo** with two top-level directories: `backend/` and `frontend/`.

## Commands

### Backend (Node.js/Express)
```bash
cd backend
npm install
npm run dev        # nodemon src/app.js
npm start          # node src/app.js
```

### Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev        # Vite dev server on port 5173
npm run build      # Production build
npm run preview    # Preview production build
```

### Database
MySQL 8.x via XAMPP. Import `database/schema.sql` in phpMyAdmin. The schema has 14 tables and 2 automatic statistics triggers.

After import, create an admin user:
```bash
cd backend && node scripts/create-admin.js
```
Seed test data (2 captains, 4 teams, 8 players, 2 referees, 2 sponsors):
```bash
node scripts/seed.js
```
Test captain credentials: `captain1@test.com` / `password123`

> **Note:** macOS AirPlay uses port 5000. The backend runs on **port 3001**.

## Environment Variables

**backend/.env:**
```
PORT=3001
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=shabka_tournament
JWT_SECRET=
JWT_EXPIRES_IN=7d
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
MAX_FILE_SIZE=5242880
```

**frontend/.env:**
```
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Shabka
```

## Architecture

### Backend (`backend/src/`)
```
config/         → DB connection pool (MySQL2), Socket.io init
middleware/     → JWT auth, role guards (admin/captain), error handler
controllers/    → Request handlers per domain
routes/         → Express router per domain, mounted at /api/*
services/       → Business logic (tournament bracket generation, etc.)
utils/          → Helpers (token generation, email templates, etc.)
app.js          → Express + Socket.io server entry point
```

**Key flows:**
- Auth: JWT issued on login; `authMiddleware` validates token; `isAdmin`/`isCaptain` for role separation
- Team registration: Captain registers → admin approves → payment proof upload → admin confirms payment
- Player management: Captain invites players via email token; players fill profiles via token link
- Match scoring: Admin updates score/cards live → Socket.io emits `match:update` events to all clients

### Frontend (`frontend/src/`)
```
router/         → React Router v6 protected routes (public / captain / admin)
store/          → Zustand stores (auth, tournament state)
services/       → Axios API clients per domain
pages/          → Page components per route
components/     → Shared UI components
hooks/          → Custom hooks (useSocket, useMatchUpdates, etc.)
i18n/           → i18next config; translations in public/locales/{ar,fr,en}/
styles/         → Tailwind base/component/utility layers
```

**State management pattern:** Zustand for global state (auth, theme), React Query for server state (API data fetching/caching), Socket.io client in a custom hook for real-time updates.

### Real-time (Socket.io)
- Backend emits events: `match:update`, `match:goal`, `match:card`, `match:end`
- Frontend subscribes via `useSocket` hook, invalidates React Query cache on events

### Database key design decisions
- Stats (goals, cards, yellow/red) are maintained via MySQL triggers on insert/delete to the `events` table — do not manually update stats columns
- Supports 16 or 32-team tournaments; group stage uses round-robin; knockout uses seeded bracket
- All text columns use `utf8mb4` to support Arabic content

## Internationalization
- Three languages: Arabic (RTL), French, English
- Translation files live in `frontend/public/locales/{ar,fr,en}/translation.json`
- Use `useTranslation` hook; never hardcode user-facing strings
- RTL layout is toggled by setting `dir="rtl"` on `<html>` when language is `ar`

## File Uploads
- Payment proofs and team logos stored in `backend/uploads/`
- Handled by Multer; resized by Sharp before storage
- Max file size: 5 MB (configurable via `MAX_FILE_SIZE` env var)
