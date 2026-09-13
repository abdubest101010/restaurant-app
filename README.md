# 🍽️ TableBite - Restaurant Platform

TableBite is a modern, modular, QR-first multi-restaurant ordering and management platform built with **Next.js 15 (Client)**, **NestJS (Server)**, **Prisma ORM**, **PostgreSQL**, **Socket.io (Realtime)**, and **Stripe**.

---

## 🏛️ Project Architecture & Structure

The repository is structured with a clean client-server separation alongside modular shared libraries:

```text
Restaurant App/
├── apps/
│   ├── web/                     # 💻 Client: Next.js 15 App Router Frontend
│   │   ├── src/app/             # Pages & Routes (Customer, Staff Dashboard, Admin)
│   │   ├── src/components/      # Reusable UI & Layout Components
│   │   ├── src/hooks/           # Custom React Hooks (Cart, Socket, Auth)
│   │   └── src/lib/             # Frontend Utilities & API Client
│   │
│   └── api/                     # ⚙️ Server: NestJS REST API & WebSockets
│       ├── src/auth/            # Authentication & RBAC Guards
│       ├── src/orders/          # Order Management & Processing
│       ├── src/menu/            # Menu Catalog & Modifier Groups
│       ├── src/restaurants/     # Multi-tenant Restaurant & Branch Management
│       ├── src/payments/        # Stripe Integration & Webhooks
│       ├── src/realtime/        # Socket.io Gateways for Live Order Tracking
│       ├── src/customers/       # Customer Profiles, Addresses, Reviews
│       ├── src/dashboard/       # Staff Operations & Kitchen Views
│       └── src/admin/           # Super-Admin Platform Payouts & Approvals
│
├── packages/                    # 📦 Shared Monorepo Packages
│   ├── db/                      # Prisma Client, Migrations, Seed & PostgreSQL Schema
│   ├── types/                   # Shared TypeScript Interfaces, DTOs & Contracts
│   ├── qr/                      # QR Code Generation & Cryptographic Verification
│   └── realtime/                # Realtime Socket Event Definitions
│
├── docs/                        # 📚 Operations & Stripe Guides
├── docker-compose.yml           # Optional Docker Container Config
├── turbo.json                   # Turborepo Build Pipeline
├── pnpm-workspace.yaml          # pnpm Monorepo Workspace Configuration
└── .env.example                 # Environment Variable Template
```

---

## 🚀 Tech Stack

- **Client (`apps/web`):** Next.js 15, React 19, Tailwind CSS, Lucide Icons, Stripe Elements, Socket.io-client
- **Server (`apps/api`):** NestJS, TypeScript, Passport JWT, Socket.io, RxJS, Stripe SDK
- **Database (`packages/db`):** PostgreSQL with Prisma ORM
- **Build System:** Turborepo + pnpm Workspaces

---

## 🛠️ Quick Start & Setup

### 1. Prerequisites
- **Node.js:** `>= 20`
- **pnpm:** `>= 9`
- **PostgreSQL Database:** Local PostgreSQL or cloud service (e.g. Neon, Supabase, Render, Docker)

### 2. Environment Configuration
Copy `.env.example` to `.env` and set your PostgreSQL connection string:

```bash
cp .env.example .env
```

Ensure your `DATABASE_URL` is set to your PostgreSQL instance:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tablebite?schema=public"
```

### 3. Install Dependencies & Generate Prisma Client
```bash
pnpm install
pnpm db:generate
```

### 4. Push Schema & Seed Database
```bash
# Push schema tables to your PostgreSQL database:
pnpm db:push

# Seed demo restaurants, menus, tables, and roles:
pnpm db:seed
```

### 5. Start Development Servers
```bash
pnpm dev
```

- **Client (Web App):** [http://localhost:3000](http://localhost:3000)
- **Server (API):** [http://localhost:4000/api](http://localhost:4000/api)
- **API Health Check:** [http://localhost:4000/api/health](http://localhost:4000/api/health)
- **Demo Menu:** [http://localhost:3000/menu/main](http://localhost:3000/menu/main)

---

## 👥 Demo User Accounts

| Role | Email | Password | Access / Features |
|------|-------|----------|-------------------|
| **Platform Admin** | `admin@tablebite.com` | `admin123` | Approvals, platform payouts, audit logs (`/admin`) |
| **Restaurant Owner** | `owner@demobistro.com` | `owner123` | Menu editor, branch analytics, staff roles (`/dashboard`) |
| **Kitchen Staff** | `kitchen@demobistro.com` | `kitchen123` | Live Kitchen Display System (KDS) (`/dashboard/kitchen`) |
| **Waiter** | `waiter@demobistro.com` | `waiter123` | Table status & live order serving (`/dashboard/tables`) |
| **Customer** | `guest@example.com` | `guest123` | QR ordering, live order tracker, reviews, favorites |

---

## 📜 Available NPM Scripts

- `pnpm dev` - Start both client and server concurrently with live reload
- `pnpm build` - Build all packages, client, and server for production
- `pnpm db:generate` - Generate Prisma Client from schema
- `pnpm db:push` - Synchronize Prisma schema with PostgreSQL
- `pnpm db:seed` - Seed initial demo data into PostgreSQL
- `pnpm db:studio` - Open Prisma Studio web visualizer
- `pnpm lint` - Run ESLint across all apps and packages
