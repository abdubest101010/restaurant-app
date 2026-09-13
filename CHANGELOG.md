# Changelog

## Phase 0-7 — Full v1 implementation (2026-08-29)

### Phase 0: Bootstrap
- Turborepo monorepo with pnpm workspaces
- Prisma schema with full entity model
- Shared packages: types, db, qr, realtime
- NestJS API with health endpoint
- Next.js frontend skeleton
- Docker Compose for PostgreSQL + Redis

### Phase 1: Auth + Tenant + Menu + QR
- Email/password authentication with JWT
- Restaurant & branch registration
- Menu CRUD (categories, items, modifier groups)
- Public QR token resolution with signed URLs
- Live public menu view

### Phase 2: Cart + Orders + Real-time
- Client-side cart with localStorage persistence
- Order creation with item/modifier snapshots
- Order status state machine
- Socket.io gateway for real-time updates
- Order tracking page for guests

### Phase 3: Payments
- Stripe PaymentIntent creation
- Demo-mode fallback when test keys are unset
- Stripe webhook handler
- Pay-at-counter (cash) fallback
- Refund support

### Phase 4: Staff Operations
- Live order queue (Kanban columns)
- Kitchen display with item-level ready
- Table management & QR generation/print
- Branch analytics dashboard
- Staff invite and role assignment

### Phase 5: Customer Polish
- Customer signup/login and account pages
- Order history, reorder, favorites, saved addresses
- Ratings/reviews after completion
- Menu search & dietary tag filtering

### Phase 6: Platform Admin
- Restaurant approval / reject / activate / deactivate
- Platform-wide analytics
- Commission rate configuration
- Basic payout tracking
- Audit log viewer

### Phase 7: Hardening
- Rate limits on login, QR, and checkout
- Request logging and security headers
- PWA manifest + offline fallback
- Stripe live-key swap documentation
