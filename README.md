# Fusion Energy Intelligence Platform

AI-powered energy management dashboard for **Fusion Students** — a purpose-built student accommodation (PBSA) operator. The platform monitors real-time energy consumption across 6 UK properties, deploys an autonomous AI agent to optimise HVAC, lighting, and water heating systems, and tracks financial savings with full audit logging.

## Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client + run migrations
npx prisma generate
npx prisma migrate dev

# Seed the database with demo data
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@fusionstudents.co.uk | FusionDemo2026! |
| Site Manager | manager@fusionstudents.co.uk | FusionDemo2026! |
| Viewer | viewer@fusionstudents.co.uk | FusionDemo2026! |

Admin credentials are pre-filled on the login page for convenience.

## Environment Variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, Framer Motion 12 |
| Charts | Recharts 3 |
| State | Zustand 5 (client), React Query 5 (server) |
| Database | SQLite via LibSQL + Prisma 7 |
| Auth | NextAuth.js 4 (JWT strategy, credentials provider) |
| PDF Export | jsPDF |

## Architecture

```
src/
├── app/
│   ├── (auth)/login/         # Login page
│   ├── (dashboard)/          # All authenticated pages
│   │   ├── overview/         # Portfolio KPIs, charts, site table
│   │   ├── realtime/         # Live monitoring with 30s refresh
│   │   ├── sites/            # Site list + [siteId] detail pages
│   │   ├── agent/            # AI agent actions & alert management
│   │   ├── savings/          # Savings & ROI with PDF/CSV export
│   │   └── settings/         # Admin-only agent configuration
│   └── api/                  # 19 API routes (see below)
├── components/
│   ├── ui/                   # 12 reusable UI components
│   ├── charts/               # 16 chart components
│   ├── dashboard/            # 6 dashboard-specific components
│   ├── layout/               # Sidebar, Header, MobileNav, PageWrapper
│   ├── brand/                # FusionLogo, AgentStatusBadge
│   └── providers/            # AuthProvider, QueryProvider
├── lib/                      # Formatters, auth, brand config, Prisma client
├── stores/                   # Zustand stores (site, agent, dashboard)
└── types/                    # TypeScript interfaces
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/energy/overview` | Portfolio KPIs (cost, savings, CO2, efficiency) |
| GET | `/api/energy/monthly` | Monthly cost comparison (with/without AI) |
| GET | `/api/energy/breakdown` | Energy breakdown by category |
| GET | `/api/realtime/kpis` | Live KPIs (current load, HVAC, void rooms, peak) |
| GET | `/api/realtime/consumption` | 24-hour consumption chart data |
| GET | `/api/realtime/breakdown` | System breakdown (HVAC, water, lighting, other) |
| GET | `/api/realtime/sites` | Live site cards with sparklines |
| GET | `/api/sites` | Site performance table |
| GET | `/api/sites/list` | Site cards with efficiency gauges |
| GET | `/api/sites/[siteId]` | Full site detail (heatmap, room types, alerts) |
| GET | `/api/agent` | Agent actions & alerts with KPIs |
| PATCH | `/api/agent` | Approve/dismiss/escalate an alert or action |
| GET | `/api/agent/recent` | Recent agent actions (for overview page) |
| GET | `/api/savings` | Savings KPIs, category breakdown, timeline, site data |
| GET | `/api/settings` | All platform settings |
| PATCH | `/api/settings` | Update settings with audit logging |
| GET | `/api/settings/audit-log` | Paginated audit log |

All API routes include try/catch error handling with consistent JSON error responses.

## Database

SQLite database with 10 models:

- **User** — 3 demo users (admin, site_manager, viewer)
- **Site** — 6 Fusion Students properties across the UK
- **EnergyReading** — 52,404 half-hourly readings (Oct 2025 - Mar 2026)
- **AgentConfig** — Per-site AI agent configuration (6 feature toggles + thresholds)
- **AgentAction** — 95 agent interventions with reasoning
- **Alert** — 51 alerts across all severity levels
- **SavingsRecord** — 252 monthly savings entries (7 categories x 6 months x 6 sites)
- **PlatformSettings** — Global agent controls (master toggle, autonomy level)
- **NotificationPreferences** — Alert level, recipients, digest schedules
- **AuditLog** — 15 seeded config change records

## Role-Based Access

| Feature | Admin | Site Manager | Viewer |
|---------|-------|-------------|--------|
| View all sites | Yes | Assigned only | Yes |
| Approve/dismiss alerts | Yes | Yes | No |
| Manage agent settings | Yes | No | No |
| Access settings page | Yes | No | No |
| Export reports | Yes | Yes | Yes |

## Design System

Built on the Fusion Students brand identity:

- **Primary**: Forest Green `#37543B`
- **Sage**: `#BCBD89` (accent)
- **Copper**: `#A14D3D` (highlight)
- **Cream**: `#E3E3D9` (background)
- **Typography**: DM Serif Display (headings), DM Sans (body), JetBrains Mono (data)
- **Charts**: Custom dark-themed tooltips, 8-colour brand palette

## Build Stages

| Stage | Description |
|-------|-------------|
| 0 | Foundation (Next.js, Tailwind, Prisma, project structure) |
| 1 | Complete Design System (brand colours, typography, UI components) |
| 2 | Database Schema & Simulation Engine (10 models, 52K+ readings) |
| 3 | Authentication & Role-Based Access Control |
| 4 | Persistent Layout (sidebar, header, mobile nav) |
| 5 | Overview Page (portfolio dashboard with live KPIs) |
| 6 | Real-Time Monitoring (live charts with 30s refresh) |
| 7 | Site List & Detail Pages (heatmap, room analysis) |
| 8 | Agent Intelligence (filterable feed, reasoning, impact timeline) |
| 9 | Savings & ROI (category charts, cumulative timeline, PDF/CSV export) |
| 10 | Settings Page (admin config, per-site accordion, audit log) |
| 11 | Final Polish (error handling, number formatting, responsive fixes) |

## Production Build

```bash
npm run build   # 29 routes, 0 TypeScript errors
npm start       # Serve production build on :3000
```
