# FoodExpress — Screen Inventory (SCREENS.md)

> Generated during Phase 1 scaffold. Figma was inaccessible (HTTP 403), so screens are derived from the Feature Scope (Section 4) of the project brief and aligned to the Fallback Design Direction (Section 9).

---

## Public / Unauthenticated Screens

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| P1 | Landing / Splash | `/` | Hero banner, app value prop, CTAs for Sign Up & Log In, featured restaurants preview |
| P2 | Login | `/login` | Email + password, role-aware redirect after auth |
| P3 | Signup | `/signup` | Multi-step: basic info → role selection → role-specific fields (e.g., vehicle type for partner, restaurant name for owner) |
| P4 | Forgot Password | `/forgot-password` | Request email reset link (mocked — stored in MockEmail collection) |
| P5 | Reset Password | `/reset-password/:token` | Token-based new password entry |

---

## Customer Screens (role: `customer`)

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| C1 | Home | `/home` | Location bar, search, cuisine filter chips, "top rated", "trending", restaurant grid with skeletons |
| C2 | Restaurant List / Search | `/restaurants` | Filter sidebar (rating, price, veg/non-veg, delivery time, offers, cuisine), paginated restaurant cards |
| C3 | Restaurant Detail | `/restaurants/:id` | Restaurant header (image, rating, hours, info), menu by category, item cards, add-to-cart, sticky cart summary |
| C4 | Item Detail Modal | (modal on C3) | Item image, full description, variants, add-ons, quantity, add to cart CTA |
| C5 | Cart | `/cart` | Item list with qty controls, subtotal, coupon code input, bill breakdown (subtotal, delivery fee, taxes, discount, total), checkout CTA |
| C6 | Checkout | `/checkout` | Saved address list + add new address form, payment method selector (Card / UPI / COD), order summary panel, place order CTA |
| C7 | Mock Payment | (modal/step on C6) | Card/UPI form fields, processing animation (2–3s), success/failure result |
| C8 | Order Tracking | `/orders/:id/track` | Order status timeline, Leaflet map with moving delivery marker + polyline route, live ETA countdown (Socket.io updates) |
| C9 | Order History | `/orders` | List of past orders (paginated), order status badges, reorder button, leave review CTA |
| C10 | Leave Review | `/orders/:id/review` | Star rating (restaurant + delivery experience), text comment, submit |
| C11 | Profile | `/profile` | Edit name/phone/avatar, manage saved addresses, favorites/wishlist list |
| C12 | Favorites / Wishlist | `/favorites` | Saved restaurants list |
| C13 | Notifications | `/notifications` | In-app order status notifications |

---

## Restaurant Owner Screens (role: `restaurant_owner`)

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| O1 | Owner Dashboard | `/owner/dashboard` | KPI cards (today's orders, revenue, avg rating), revenue trend chart (Recharts), order status funnel chart |
| O2 | Order Queue | `/owner/orders` | Incoming orders list (real-time), accept / reject actions, status update (Confirmed → Preparing → Ready for Pickup) |
| O3 | Order Detail | `/owner/orders/:id` | Full order items, customer info, delivery address, actions |
| O4 | Menu Management | `/owner/menu` | Category CRUD, item CRUD per category, in/out of stock toggle, item discount percentage |
| O5 | Add/Edit Item | (modal/page on O4) | Name, description, price, image upload, category, isVeg, variants, add-ons |
| O6 | Restaurant Profile | `/owner/profile` | Edit name, description, cuisine tags, opening hours (per-day), location (lat/lng + address text), cover images upload, logo upload |
| O7 | Reviews Received | `/owner/reviews` | Read-only reviews list, star distribution chart |
| O8 | Owner Settings | `/owner/settings` | Password change, notification preferences |

---

## Delivery Partner Screens (role: `delivery_partner`)

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| D1 | Partner Dashboard | `/partner/dashboard` | Online/Offline availability toggle, today's deliveries count, earnings summary (today / week / month) |
| D2 | Available Orders | `/partner/orders/available` | List of orders ready for pickup (nearby, mock distance calculation), accept/reject each |
| D3 | Active Delivery | `/partner/orders/active` | Current delivery details (pickup address, drop address), status update (Picked Up → Out for Delivery → Delivered), mini map |
| D4 | Delivery History | `/partner/orders/history` | Past completed deliveries, earnings per delivery |
| D5 | Partner Profile | `/partner/profile` | Edit personal info, vehicle type, bank details (mocked) |
| D6 | Partner Earnings | `/partner/earnings` | Detailed earnings breakdown, payout history (mocked) |

---

## Admin Screens (role: `admin`)

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| A1 | Admin Dashboard | `/admin/dashboard` | Platform analytics: total orders (Recharts bar chart), revenue (line chart), active restaurants, active users, recent activity feed |
| A2 | Restaurant Applications | `/admin/restaurants` | Tabs: Pending / Approved / Rejected. Approve / reject with optional reason. View restaurant details |
| A3 | Partner Applications | `/admin/partners` | Tabs: Pending / Approved. Approve/reject partner verification |
| A4 | User Management | `/admin/users` | All users list, filter by role, search, suspend/ban action |
| A5 | Order Management | `/admin/orders` | All orders (read-only), filter by status/date/restaurant, order detail modal |
| A6 | Coupon Management | `/admin/coupons` | CRUD global coupons (code, discount type, value, min order value, expiry, active toggle) |
| A7 | Admin Settings | `/admin/settings` | System configuration (mocked), admin account settings |

---

## Shared / Utility Screens

| # | Screen | Description |
|---|--------|-------------|
| U1 | 404 Not Found | Custom error page with navigation CTA |
| U2 | 403 Forbidden | Unauthorized role access page |
| U3 | Maintenance / Error | Generic server error fallback |

---

## Summary

| Role | Screen Count |
|------|-------------|
| Public / Auth | 5 |
| Customer | 13 |
| Restaurant Owner | 8 |
| Delivery Partner | 6 |
| Admin | 7 |
| Shared | 3 |
| **Total** | **42** |
