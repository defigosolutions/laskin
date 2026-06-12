# LA Skin & Aesthetics — Project Requirements

## 1. Overview

**LA Skin & Aesthetics** is a luxury skin clinic single-page React application (SPA) marketing the clinic's premium dermatological and aesthetic services across three global branches: Beverly Hills, London (Mayfair), and Dubai (Downtown).

The front-end is currently a static, content-driven marketing site built with React 19 + Vite. All entity data (treatments, specialists, packages, reviews, locations, before/after cases) is hard-coded in component-local arrays. Form submissions (booking, newsletter) are simulated client-side with no API integration.

This document specifies the requirements that a real backend, persistent storage, and admin tooling must satisfy to make the site production-grade.

---

## 2. Stack (current)

| Layer | Technology |
|------|-----------|
| Framework | React 19.2 |
| Bundler | Vite 8 |
| Styling | Vanilla CSS + inline styles + CSS variables |
| Routing | None (single page, anchor-based scroll) |
| State | Local `useState` only |
| API client | None |
| Auth | None |
| Persistence | None — all content hard-coded |

---

## 3. Page Structure & User Flows

### 3.1 Single Public Page (`/`)

The marketing site is a single scroll page with these in-order sections:

1. **Navbar** (fixed, scroll-aware) — `Logo` + anchor links + "Book Appointment" CTA. Mobile drawer menu.
2. **Hero** — Headline, branch tagline ("Beverly Hills • London • Dubai"), CTAs ("Book Priority Visit", "Explore Treatments"), and a floating stats panel (`99% Satisfaction`, `15k+ Clients Served`, `10+ Elite Specialists`).
3. **About** — Clinic story + structured pillars (Bespoke Treatment Mapping, State-of-the-Art Science).
4. **Treatments** (`#treatments`) — Filterable grid (all / facial / laser / therapy). Cards open a side-drawer with description, scientific rationale, step-by-step procedure, price/duration/recovery, and a "Book {treatment}" CTA.
5. **Before & After** (`#gallery`) — Case selector tabs + interactive image-compare slider (`BeforeAfterSlider`) + clinical case details (timeline, age profile, indications, therapist notes, satisfaction rating).
6. **Why Choose Us** (`#why-us`) — 4 value-prop cards (Elite Doctor Pedigree, FDA-Approved Medical Tech, Cellular-Level Mapping, Ultra-Private Luxury Suites).
7. **Specialists** (`#specialists`) — Card grid with hover overlay revealing role, credentials, aesthetic focus, philosophy.
8. **Packages** (`#packages`) — Curated bundle grid (Beverly Hills Radiance, London Glow Classic, Dubai Elite Restorative) with "Reserve Journey Package" CTA.
9. **Reviews** (`#reviews`) — Auto-advancing testimonial carousel (8s interval) with prev/next + dot pagination.
10. **Booking CTA** (`#booking`) — Inline 3-step `BookingForm` with guarantee badges.
11. **Contact** (`#contact`) — Branch tab selector + branch info card (address, phone, email, hours) + stylized vector map with interactive pins.
12. **Footer** — Brand, Therapies links, Sanctuary links, newsletter subscription form, legal links.

### 3.2 Key User Flows

#### Flow A — Book an Appointment (modal)
1. User clicks "Book Appointment" / "Book Priority Visit" anywhere (Navbar, Hero, Footer, mobile drawer).
2. Full-screen `BookingForm` modal opens.
3. Step 1: Select treatment (from list of 8 options: 5 treatments + 3 packages) and clinic branch (Beverly Hills / London / Dubai).
4. Step 2: Pick date (no past dates) and time slot (fixed slots: 09:00, 10:30, 12:00, 13:30, 15:00, 16:30, 18:00).
5. Step 3: Enter name, email, phone (validated), optional skin concerns.
6. Submit → confirmation step with reservation summary.
7. Today: client-side only. Required: persist to backend, send confirmation email, surface to admin queue.

#### Flow B — Book from Treatment Detail
1. User scrolls to Treatments, opens a treatment card drawer.
2. Clicks "Book {treatment} Now" → opens booking modal with that treatment pre-selected.

#### Flow C — Reserve a Package
1. User scrolls to Packages, clicks "Reserve Journey Package".
2. Booking modal opens pre-filled with the package name as the treatment.

#### Flow D — Newsletter Subscribe
1. Footer email field → simple email validation → success message inline.
2. Required: persist subscriber, double opt-in email, expose to admin.

#### Flow E — Browse Specialists / Locations / Before-After Gallery
- Read-only browsing. Hover/tap interactions reveal details. No backend dependency for read paths today, but will need one once admin can edit content.

### 3.3 Missing flows (not yet built, required for prod)
- View / cancel / reschedule a booking from a confirmation link.
- Admin login.
- Admin dashboard (bookings, leads, content management).
- Specialist availability calendar.

---

## 4. Entities (inferred from frontend)

These are the domain entities currently hard-coded in the frontend that need to become first-class persisted records.

| Entity | Source file | Notes |
|--------|-------------|-------|
| `Branch` | [src/sections/Contact.jsx](../src/sections/Contact.jsx), [src/components/BookingForm.jsx](../src/components/BookingForm.jsx) | 3 fixed today (BH, LDN, DXB). Each has address, phone, email, hours, map coords. |
| `Treatment` | [src/sections/Treatments.jsx](../src/sections/Treatments.jsx) | 5 today. Has name, tagline, category (facial/laser/therapy), duration, recovery, price, image, description, science, steps[]. |
| `Package` | [src/sections/Packages.jsx](../src/sections/Packages.jsx) | 3 today. Has name, tagline, price, valuePrice (strikethrough), badge (Bestseller/Elite Choice/null), includes[]. |
| `Specialist` | [src/sections/Specialists.jsx](../src/sections/Specialists.jsx) | 3 today. Has name, role, credential, focus, philosophy, image. |
| `BeforeAfterCase` | [src/sections/BeforeAfter.jsx](../src/sections/BeforeAfter.jsx) | 3 today. Has title, subtitle, timeline, concern, satisfaction, age, therapistNotes, beforeImg, afterImg. |
| `Review` (Testimonial) | [src/sections/Reviews.jsx](../src/sections/Reviews.jsx) | 3 today. Has quote, author, location (branch), rating. |
| `Booking` (Appointment) | [src/components/BookingForm.jsx](../src/components/BookingForm.jsx) | Created on submit. Has treatment, branch, date, timeSlot, name, email, phone, concerns. |
| `NewsletterSubscriber` | [src/sections/Footer.jsx](../src/sections/Footer.jsx) | Created on subscribe. Has email. |
| `TimeSlot` | [src/components/BookingForm.jsx](../src/components/BookingForm.jsx) | Currently fixed 7 slots. Should become dynamic per branch / specialist availability. |
| `Customer` | implicit | Identified by email/phone across bookings + newsletter. |
| `User` (Admin) | not in frontend | Needed for admin panel. |

---

## 5. Functional Requirements (Public Site)

### 5.1 Read paths (replace hard-coded arrays with API)

- **FR-PUB-1**: List active treatments, optionally filtered by category. Should include all fields needed by the treatment card and the detail drawer.
- **FR-PUB-2**: List active packages with badge, pricing, value-pricing, and inclusions.
- **FR-PUB-3**: List active specialists ordered by display order, with role / credentials / focus / philosophy / portrait.
- **FR-PUB-4**: List published before/after cases.
- **FR-PUB-5**: List approved reviews/testimonials with star rating, author, branch.
- **FR-PUB-6**: List branches (city, address, phone, email, hours, map coords).
- **FR-PUB-7**: Return aggregate stats for the hero panel (satisfaction %, clients served, specialists count) — driven from admin-configurable settings or computed.

### 5.2 Write paths

- **FR-PUB-8**: Create a booking. Validate:
  - Treatment/Package ID exists and is active.
  - Branch is open on requested date.
  - Date is not in the past.
  - Time slot is available at the requested branch on the requested date (no double-booking once concurrency cap is hit).
  - Email format `\S+@\S+\.\S+`.
  - Phone format `^[+]?[0-9\s-]{7,15}$`.
  - Name non-empty.
  - Optional `concerns` text up to a reasonable size (e.g. 2000 chars).
- **FR-PUB-9**: Send the customer a booking confirmation email (and optionally SMS) including reservation reference.
- **FR-PUB-10**: Notify the relevant branch's concierge/admin queue.
- **FR-PUB-11**: Return a public reservation reference + signed link for cancel/reschedule (no login required by the customer — link-based access).
- **FR-PUB-12**: Subscribe to newsletter. Double opt-in via verification email. De-duplicate by email. Honor unsubscribe links.
- **FR-PUB-13**: Return real available time slots for a `(branch, date, treatment)` triple, factoring in already-booked slots and capacity.

### 5.3 Cancel / reschedule (new flow to add)

- **FR-PUB-14**: From a signed link in the confirmation email, customer can view their booking, cancel it, or pick a new date/slot subject to the 24-hour rescheduling rule advertised on the site.

### 5.4 Non-functional

- **NFR-1**: All public read endpoints must be cacheable (CDN-friendly). Treat content lists as quasi-static — short TTL invalidated on admin publish.
- **NFR-2**: GDPR/CCPA — customer concerns and personal data must be encrypted at rest. Booking form ad-copy specifically promises this.
- **NFR-3**: Rate-limit booking + newsletter endpoints to deter abuse.
- **NFR-4**: All forms must protect against CSRF if using cookie-based admin sessions.
- **NFR-5**: HIPAA-style protected text: treat `concerns` as sensitive medical data; restrict admin access via role.
- **NFR-6**: Site must remain a static SPA — backend should expose JSON APIs only.

---

## 6. Authentication Requirements

### 6.1 Public site
- **No customer login.** The public flows are intentionally lightweight: book by entering details, cancel via signed link.
- Bot protection on `POST /bookings` and `POST /newsletter` (CAPTCHA or honeypot + rate limit).

### 6.2 Admin
- Email + password login for staff.
- **Roles** (proposed):
  - `super_admin` — full access including user management, settings.
  - `clinic_manager` — branch-scoped access to bookings, content edits.
  - `specialist` — read-only on their own bookings, manage their availability and bio.
  - `concierge` — view + confirm bookings for assigned branch, no content editing.
- Multi-factor authentication required for `super_admin` and `clinic_manager`.
- Session timeout: 8 hours inactive; refresh tokens optional.
- Audit log of all admin write actions.

---

## 7. Admin Features That Should Exist

Derived from the public-site entities and write paths. Detailed in [admin-panel-spec.md](./admin-panel-spec.md).

1. **Bookings dashboard** — list, filter by branch / status / date / treatment; confirm, reschedule, cancel, mark no-show, mark completed; export CSV; see attached customer notes.
2. **Customer CRM** — unified view of a customer across all bookings and newsletter status; lifetime value.
3. **Treatments CMS** — CRUD on treatment cards, drag-to-reorder, toggle published, edit steps & science.
4. **Packages CMS** — CRUD on packages, set badge, link to constituent treatments.
5. **Specialists CMS** — CRUD on specialist bios, portrait upload, focus, philosophy, display order, branch assignments.
6. **Before/After case studies CMS** — upload before/after images, write narrative, toggle published.
7. **Reviews moderation** — approve / reject / edit user-submitted reviews; create curated reviews.
8. **Branches** — manage 3 (or more) branches: hours, contact details, address, map coords, time-slot template.
9. **Availability calendar** — per branch + per specialist; block dates, set capacity per slot.
10. **Newsletter** — list subscribers, export, unsubscribe, basic campaign send (optional, can integrate Mailchimp).
11. **Site settings** — hero stats (99%, 15k+, 10+), legal copy, SEO meta.
12. **User & role management** — for staff accounts.
13. **Audit log** — every write action by admin users.

---

## 8. Out of Scope (for v1)

- Online payment / deposit. Currently the booking is reservation-only; clinic confirms by phone within 2 hours.
- Customer portal with self-service login.
- Multi-language / i18n (English only today).
- Native mobile app.
- Loyalty program.
- E-commerce of skincare products.

These may be added later but should be considered when shaping the schema (e.g. leave room for `payment_status`).

---

## 9. Open Questions

1. Should the booking confirmation be auto-confirmed or held in `pending` until a concierge verifies the slot? Marketing copy ("Our staff reaches out within 2 hours of reservation to finalize details") implies the latter.
2. Is the same time-slot list global (7 slots) or per-branch? Hours differ per branch (Contact section), so per-branch is more realistic.
3. Do specialists have individual schedules a customer can pick, or is assignment internal? Today the form doesn't let customers pick a specialist.
4. Source of truth for the hero stats — manually maintained or computed?
5. Newsletter — is this a basic in-house list or should we integrate a provider (Mailchimp, Klaviyo)?
