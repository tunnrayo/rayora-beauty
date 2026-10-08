# Rayora Beauty

Online beauty store for skincare, makeup, body care and fragrance, built for Nigerian customers.

## What is inside
- `apps/web`: Next.js, TypeScript and Tailwind storefront, customer accounts and the admin portal at `/admin`
- `apps/api`: Node.js and Express API, split into services: products, cart, orders, payments, users, notifications, analytics, store, ai
- PostgreSQL database on Railway

## Run locally
1. Install Node.js 20 or newer, then run `npm install`.
2. Copy `apps/api/.env.example` to `apps/api/.env` and `apps/web/.env.example` to `apps/web/.env.local`.
3. In `apps/api/.env` set `DATABASE_URL`, a long random `AUTH_SECRET`, and `ADMIN_EMAIL` and `ADMIN_PASSWORD` (10+ characters).
4. Create the tables, demo products and your admin account:
   ```
   npm run migrate -w apps/api
   npm run seed -w apps/api
   npm run create-admin -w apps/api
   ```
5. `npm run dev`. Shop: http://localhost:3000  API: http://localhost:4000/health

## Environment variables (API)
| Name | Needed | Purpose |
|---|---|---|
| DATABASE_URL | yes | PostgreSQL connection string |
| AUTH_SECRET | yes | Signs login tokens (32+ characters) |
| WEB_ORIGIN | yes | The website address allowed to call the API |
| ADMIN_EMAIL, ADMIN_PASSWORD | first setup | Creates or updates the admin account |
| PAYSTACK_SECRET_KEY | optional | Switches checkout from demo payment to Paystack |
| HF_TOKEN | optional | Hugging Face token for image generation and the assistant |
| HF_IMAGE_MODEL, HF_CHAT_MODEL | optional | Change models without changing code |
| RESEND_API_KEY, EMAIL_FROM | optional | Sends order emails |

Web: `API_URL` (required), `SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`.

## Payments
With no `PAYSTACK_SECRET_KEY`, checkout uses a clearly labelled demo payment that still creates real orders. Add the key to use Paystack. Set your Paystack webhook URL to `https://YOUR-API-DOMAIN/api/v1/payments/paystack/webhook`.

## Hugging Face
Admins open Admin, Image Generator, describe the product and press Generate. The browser calls our server, the server calls Hugging Face with `HF_TOKEN`, stores the image in the database and serves it at `/media/<id>`. The shopping assistant uses the same token and falls back to a simple search if Hugging Face is down, so the shop keeps working.
To create photos for every product without one: `npm run generate-images -w apps/api`.

## Railway
Services: `api` (root `/apps/api`, health check `/health`, pre-deploy `npm run migrate && npm run seed && npm run create-admin`), `web` (root `/apps/web`) and PostgreSQL. Pushing to `main` deploys both.
