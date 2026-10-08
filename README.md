# Rayora Beauty

Online beauty store for cosmetics, skincare, haircare and fragrance, built for Nigerian customers.

## Structure
- `apps/web` : Next.js, TypeScript, Tailwind storefront
- `apps/api` : Node.js, Express, TypeScript API with separate services (products, cart, orders, payments, users, notifications, analytics)
- PostgreSQL database (Railway)

## Run locally
1. Install Node.js 20 or newer.
2. `npm install`
3. Copy `apps/api/.env.example` to `apps/api/.env` and `apps/web/.env.example` to `apps/web/.env.local`.
4. Put your PostgreSQL address in `apps/api/.env` as `DATABASE_URL` (on Railway, use `DATABASE_PUBLIC_URL` from the Postgres service). Never commit this file.
5. Create tables and demo products:
   ```
   npm run migrate -w apps/api
   npm run seed -w apps/api
   ```
6. `npm run dev`

Web: http://localhost:3000  API: http://localhost:4000/health

## Environment variables
See `apps/api/.env.example` and `apps/web/.env.example`. Secrets are never committed.

## Railway deployment
Create two services from this repo: `api` (root directory `/apps/api`, healthcheck `/health`) and `web` (root directory `/apps/web`), plus a PostgreSQL service.
- api variables: `DATABASE_URL` (reference the Postgres service), `NODE_ENV=production`, `WEB_ORIGIN` (the web public URL)
- web variables: `API_URL` (the api public URL)
- Run migrations with `npm run migrate` (api pre-deploy command).
