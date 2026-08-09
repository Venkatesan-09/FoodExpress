# FoodExpress — Design & Architecture Decisions (DECISIONS.md)

> This file documents every non-trivial decision made during the build. Updated as the project progresses.

---

## D001 — Figma File Inaccessible → Fallback Design

**Date:** 2026-08-08
**Context:** The Figma link (https://www.figma.com/design/hTdOvQO2Hde6ycsqyYj2FH/Untitled) returned HTTP 403. The browser tool also failed (Playwright driver download unavailable in this environment).
**Decision:** Proceed with the **Fallback Design Direction** defined in Section 9 of the project brief:
- Primary color: `#EA580C` (orange-600)
- Font families: Inter (body), Poppins (display/headings)
- Border radius: 12–16px on cards (`rounded-xl`, `rounded-2xl`)
- Shadows: soft, layered (`card` shadow from design-tokens.json)
- Food-photography-forward cards with rating badges
- Bold, high-contrast CTAs
**Impact:** All UI is designed from scratch following the fallback spec. If the Figma file is later made publicly accessible, a visual reconciliation pass will be needed.
**Flagged:** Yes (per Section 1.6 of brief)

---

## D002 — Mock Email via MongoDB Collection

**Date:** 2026-08-08
**Context:** Password reset emails need to be sent, but this is a demo app with no real email service.
**Decision:** Store mock emails in a `MockEmail` MongoDB collection (instead of only logging to console) so they're inspectable via the Admin panel. Each document has: `to`, `subject`, `body` (HTML), `resetLink`, `createdAt`, `read` (boolean).
**Rationale:** More realistic than console.log; enables a "Mock Inbox" UI under Admin → Settings without any real email service setup.

---

## D003 — Image Storage Strategy

**Date:** 2026-08-08
**Context:** The brief specifies Cloudinary for production. Render's filesystem is ephemeral (wiped on redeploy).
**Decision:** Use **Multer → Cloudinary** for all image uploads (restaurant images, menu item images, user avatars) in all environments. Cloudinary free tier provides sufficient storage for a portfolio demo.
**Implementation:** Multer stores to memory buffer (not disk), pipes directly to Cloudinary SDK `upload_stream`. Cloudinary env vars (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) are required in `.env`.
**Dev fallback:** If `CLOUDINARY_*` vars are absent, the upload middleware returns a placeholder image URL instead of failing.

---

## D004 — Mock GPS / Live Tracking

**Date:** 2026-08-08
**Context:** Real GPS is not available in v1.
**Decision:** 
- Each restaurant has a `location: { lat, lng }` field. Each order's delivery address has `{ lat, lng }` (entered at checkout or derived from address).
- When an order status changes to "Out for Delivery", the backend starts emitting mock lat/lng via Socket.io every 5 seconds.
- Position is linearly interpolated between restaurant coords and delivery address coords over the estimated delivery window (default: 30 min).
- Code is clearly marked `// MOCKED: replace with real GPS integration` at all interpolation points.
**Map:** Leaflet + OpenStreetMap tiles (no API key). Mock route is a straight line (polyline from restaurant to delivery address). A real routing API (e.g., OSRM, MapBox) can be plugged in later.

---

## D005 — Mock Map Coordinates Default Area

**Date:** 2026-08-08
**Context:** Need a real-world lat/lng area for mock GPS to look believable on the map.
**Decision:** Default to **Bengaluru (Bangalore), India** as the base map area:
- Center: `{ lat: 12.9716, lng: 77.5946 }`
- Demo restaurants are seeded with coordinates within ±0.1 degrees of center.
**Rationale:** Largest tech hub in India; fits the food delivery app context. Can be overridden via `DEMO_MAP_CENTER_LAT` and `DEMO_MAP_CENTER_LNG` env vars.

---

## D006 — Admin Account Seeding

**Date:** 2026-08-08
**Context:** Admin accounts are not publicly signup-able (per Section 3 of brief).
**Decision:** A seed script (`backend/src/scripts/seed.js`) creates the admin account and demo data (restaurants, menu items, customers, sample orders). Seed credentials:
- Email: `admin@foodexpress.demo`
- Password: `Admin@123456`
- **Change these in any real deployment.**
The seed script is idempotent (safe to run multiple times).

---

## D007 — Payment Simulation

**Date:** 2026-08-08
**Context:** No real payment gateway integration in v1.
**Decision:** 
- `POST /api/v1/payments/mock-charge` accepts `{ orderId, method, cardDetails?, upiId? }`.
- Simulates 2–3 second delay (random).
- Returns success ~95% of the time, failure ~5% (random).
- Generates a fake `transactionId` (UUID-like string prefixed `TXN_MOCK_`).
- Stores a `payment` sub-document on the Order: `{ status, transactionId, method, chargedAt }`.
- All simulation code is marked `// MOCKED: replace with Razorpay/Stripe integration`.
- COD flow: skips mock charge, sets `payment.status = 'pending'`, marks order as placed.

---

## D008 — Shared Zod Schemas

**Date:** 2026-08-08
**Context:** Brief says "Zod schemas shared between frontend/backend where reasonable."
**Decision:** Create a `shared/` directory at the monorepo root with common validation schemas (e.g., `loginSchema`, `signupSchema`, `addressSchema`, `menuItemSchema`). Both frontend (imported via relative path) and backend (imported via relative path) use these. No npm package needed for a portfolio app.

---

## D009 — Monorepo Structure (No Turborepo)

**Date:** 2026-08-08
**Context:** Brief specifies separate frontend (Vercel) and backend (Render) deployments.
**Decision:** Simple two-folder structure at root: `frontend/` and `backend/`, with a root `package.json` for workspace scripts only. No Turborepo or Nx — avoids complexity that isn't needed for a portfolio build. Root `package.json` has `scripts: { "dev:backend": "...", "dev:frontend": "...", "dev": "concurrently ..." }`.

---

## D010 — CORS Configuration

**Date:** 2026-08-08
**Context:** Brief requires CORS enabled only for the Vercel frontend domain.
**Decision:** In dev: `CLIENT_URL=http://localhost:5173`. In prod: `CLIENT_URL=https://foodexpress.vercel.app` (or actual Vercel URL). The Express CORS middleware uses the `CLIENT_URL` env var as the single allowed origin. Credentials are enabled (for refresh token cookie).

---

## D011 — Rate Limiting Strategy

**Date:** 2026-08-08
**Context:** Security hardening required.
**Decision:**
- Global: 100 requests per 15 minutes per IP
- Auth endpoints (`/api/v1/auth/login`, `/api/v1/auth/register`): 10 requests per 15 minutes per IP (stricter)
- Upload endpoints: 20 requests per hour per IP
- Using `express-rate-limit` with in-memory store (suitable for single-instance demo; would need Redis store for multi-instance production).

---

## D012 — Socket.io Architecture

**Date:** 2026-08-08
**Context:** Real-time updates needed for order tracking.
**Decision:**
- Socket.io server attached to the Express HTTP server.
- Rooms: `order:${orderId}` — joined by the customer, restaurant owner, and delivery partner.
- Events emitted:
  - `order:status_changed` — `{ orderId, status, timestamp }`
  - `order:location_update` — `{ orderId, lat, lng, eta }` (every 5s when in "Out for Delivery" status)
  - `order:new` — emitted to restaurant owner's socket room `restaurant:${restaurantId}` when a new order arrives
- Auth on socket connection: JWT token passed in handshake `auth.token`.

---
