# 🍽️ TableBite - Modern Restaurant Platform

A clean, modular, full-stack restaurant platform built with **Next.js 15 (Client)**, **NestJS (Server)**, **Prisma ORM**, **PostgreSQL**, and **Socket.io (Realtime)**.

---

## 🏛️ Modern Project Structure

The project has been restructured into an intuitive **Client / Server / Packages** architecture:

```text
Restaurant App/
├── client/                     # 💻 FRONTEND: Next.js 15 (App Router + Tailwind CSS)
│   ├── src/
│   │   ├── app/                # Pages & Routes
│   │   │   ├── (customer)      # QR Ordering, Menu Browsing, Cart & Checkout
│   │   │   ├── dashboard/      # Restaurant Staff: Kitchen KDS, Tables, Menu Editor
│   │   │   ├── admin/          # Platform Super-Admin: Approvals & Payouts
│   │   │   └── account/        # User Account, Addresses, Order History
│   │   ├── components/         # Reusable UI & Layout Components
│   │   ├── hooks/              # React Hooks (Cart, Auth, Live Order Tracking)
│   │   └── lib/                # API Client & Helper Utilities
│   └── package.json            # @tablebite/client
│
├── server/                     # ⚙️ BACKEND: NestJS API & Prisma ORM
│   ├── prisma/                 # 🐘 PostgreSQL Schema & Seed Scripts
│   │   ├── schema.prisma       # Prisma Schema (Models & Relations)
│   │   └── seed.ts             # Database Seed Script (Demo data)
│   ├── src/
│   │   ├── auth/               # JWT Auth, Signup, Login & Role Guards
│   │   ├── orders/             # Order Processing & Workflow
│   │   ├── menu/               # Catalog, Items, Modifier Groups
│   │   ├── restaurants/        # Multi-tenant Restaurants & Branches
│   │   ├── payments/           # Stripe Payments & Cash Checkout
│   │   ├── realtime/           # Socket.io Gateways for Live Order Updates
│   │   ├── dashboard/          # Staff Analytics & Operations
│   │   ├── admin/              # Super-Admin Payouts & Approvals
│   │   └── prisma/             # Prisma Service Provider
│   └── package.json            # @tablebite/server
│
├── packages/                   # 📦 SHARED WORKSPACE LIBRARIES
│   ├── types/                  # Shared TypeScript Interfaces, Enums & DTOs
│   ├── qr/                     # QR Token Signer & Verification
│   └── realtime/               # Socket.io Event Contracts
│
├── docs/                       # 📚 Operations & Stripe Guides
├── pnpm-workspace.yaml         # Monorepo Workspace Configuration
├── turbo.json                  # Turborepo Build Pipeline
└── .env.example                # Environment Variables Template
```

---

## 🚀 Tech Stack

- **Client (`client`):** Next.js 15, React 19, Tailwind CSS, Lucide React, Socket.io-client, Stripe Elements
- **Server (`server`):** NestJS, TypeScript, Passport JWT, Socket.io, Stripe SDK
- **Database & ORM (`server/prisma`):** PostgreSQL + Prisma ORM
- **Shared Packages (`packages/*`):** TypeScript libraries for types, QR logic, and realtime contracts

---

## ⚙️ How to Setup and Run

### 1. Configure Environment Variables
Copy `.env.example` to `.env` in the root:
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` matches your local PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tablebite?schema=public"
```

### 2. Generate Prisma Client & Sync Database
```bash
# 1. Generate Prisma Client
pnpm db:generate

# 2. Push schema to PostgreSQL (creates tables)
pnpm db:push

# 3. Seed demo data (admin, restaurant owner, sample menus, tables)
pnpm db:seed
```

### 3. Start Development Mode
```bash
pnpm dev
```
- **Client (Frontend):** [http://localhost:3000](http://localhost:3000)
- **Server (Backend API):** [http://localhost:4000/api](http://localhost:4000/api)
- **Prisma Studio (Web DB Viewer):** `pnpm db:studio`

---

## 🔍 How to Check If Everything Is Working

### 1. Check API & Database Health
Visit **[http://localhost:4000/api/health](http://localhost:4000/api/health)** in your browser:
```json
{ "status": "ok", "timestamp": "2026-09-13T..." }
```

### 2. Check Database Tables (Prisma Studio)
Run:
```bash
pnpm db:studio
```
Open **http://localhost:5555** in your browser to inspect all PostgreSQL tables (`restaurants`, `branches`, `menu_items`, `users`, `orders`).

### 3. Check Demo Login Accounts
Test logging in at **[http://localhost:3000/login](http://localhost:3000/login)**:

| Role | Email | Password | What to Verify |
|------|-------|----------|----------------|
| **Platform Admin** | `admin@tablebite.com` | `admin123` | Access Super Admin at `/admin` |
| **Restaurant Owner** | `owner@demobistro.com` | `owner123` | Access Owner Dashboard at `/dashboard` |
| **Kitchen Staff** | `kitchen@demobistro.com` | `kitchen123` | Access Live KDS at `/dashboard/kitchen` |
| **Waiter** | `waiter@demobistro.com` | `waiter123` | Access Table View at `/dashboard/tables` |
| **Customer** | `guest@example.com` | `guest123` | Access Customer Portal at `/account` |

### 4. Check QR Ordering & Customer Menu
Visit the demo restaurant menu at **[http://localhost:3000/menu/main](http://localhost:3000/menu/main)** to test browsing, adding items to cart, and placing orders.

