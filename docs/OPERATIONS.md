# TableBite operations

## Local run

1. `docker compose up -d`
2. Copy `.env.example` to `.env`
3. `pnpm install`
4. `pnpm db:generate && pnpm db:migrate && pnpm db:seed`
5. `pnpm dev`

- Web: http://localhost:3000
- API: http://localhost:4000/api
- Health: http://localhost:4000/api/health

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Platform admin | admin@tablebite.com | admin123 |
| Owner | owner@demobistro.com | owner123 |
| Kitchen | kitchen@demobistro.com | kitchen123 |
| Waiter | waiter@demobistro.com | waiter123 |
| Customer | guest@example.com | guest123 |

Guest menu: http://localhost:3000/menu/main

## Hardening already in place

- Rate limits on login, signup, QR resolution, and checkout
- Request logging
- Security headers
- Role + JWT guards on staff and admin writes
- PWA manifest and offline fallback
- Audit log for restaurant, commission, and payout actions
