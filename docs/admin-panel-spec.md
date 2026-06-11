# LA Skin & Aesthetics — Admin Panel Specification

## 1. Purpose

The admin panel is the operational back-office for LA Skin & Aesthetics staff. It exists to:

1. Manage the customer-facing **bookings pipeline** (the most time-critical flow — the public marketing site promises a 2-hour follow-up).
2. Curate **content** that powers the marketing site (treatments, packages, specialists, before/after, reviews, copy).
3. Maintain **branch operations** (hours, time slots, blackouts, specialist coverage).
4. Provide visibility into **customers** and **newsletter subscribers** for marketing follow-up.
5. Enforce **security and accountability** through roles, MFA, and a full audit log.

## 2. Tech assumptions

- Separate SPA (React or Next.js) hosted at `admin.laskinclinic.com`.
- Talks to the JSON API documented in [api-spec.md](./api-spec.md) under `/api/v1/admin/*`.
- Bearer-JWT auth + optional TOTP MFA.
- Same design language as the public site (gold + cream palette) but laid out as a dense back-office (sidebar nav, data tables).

---

## 3. Roles & permissions

| Capability | super_admin | clinic_manager | concierge | specialist |
|---|:-:|:-:|:-:|:-:|
| Manage staff users / roles | ✅ | – | – | – |
| Manage site settings (hero stats, legal) | ✅ | – | – | – |
| Manage branches & branch hours | ✅ | ✅ (own branch) | – | – |
| Manage treatments / packages / categories | ✅ | ✅ | – | – |
| Manage specialists (bios) | ✅ | ✅ | – | self-only |
| Manage before/after gallery | ✅ | ✅ | – | – |
| Moderate reviews | ✅ | ✅ | – | – |
| View bookings | ✅ (all) | ✅ (own branch) | ✅ (own branch) | self-only |
| Create / edit / confirm / cancel bookings | ✅ | ✅ | ✅ | – |
| Assign specialist to booking | ✅ | ✅ | ✅ | – |
| Manage specialist schedule / blackouts | ✅ | ✅ | – | self-only |
| Newsletter subscribers list / export | ✅ | ✅ | – | – |
| View audit log | ✅ | own branch | – | – |

Branch-scoped roles see only their `users.branch_id`. The API enforces scope; the UI hides nav items the user can't access.

---

## 4. Information architecture

```
┌──────────────────────────── Sidebar ────────────────────────────┐
│ • Dashboard                                                     │
│ • Bookings                                                      │
│    ├─ All bookings                                              │
│    ├─ Today                                                     │
│    ├─ Pending confirmation                                      │
│    └─ Calendar                                                  │
│ • Customers                                                     │
│ • Content                                                       │
│    ├─ Treatments                                                │
│    ├─ Categories                                                │
│    ├─ Packages                                                  │
│    ├─ Specialists                                               │
│    ├─ Before & After                                            │
│    └─ Reviews                                                   │
│ • Branches                                                      │
│    ├─ Locations                                                 │
│    ├─ Hours                                                     │
│    └─ Time slots & capacity                                     │
│ • Newsletter                                                    │
│ • Settings                                                      │
│    ├─ Site (hero stats, copy)                                   │
│    ├─ Users & roles      (super_admin)                          │
│    └─ Audit log                                                 │
│ • Profile                                                       │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Screens (detail)

### 5.1 Login
- Email + password. Optional TOTP step (required for `super_admin` and `clinic_manager`).
- Forgot-password link → server emails reset token.
- After login: redirect to **Dashboard**.
- API: `POST /admin/auth/login` → store access + refresh tokens. Refresh on 401.

### 5.2 Dashboard

KPI tiles + queues. Branch-scoped if the user is.

- **Today's bookings**: count of `appointment_date = today` with status `confirmed` + `pending`.
- **Pending confirmation**: count of `status = 'pending'`. CTA "Confirm queue".
- **This week's revenue (potential)**: sum of `treatment.price` + `package.price` for confirmed + completed in the next 7 days.
- **Newsletter (last 7 days)**: new subscribers count.
- **Recent reviews awaiting moderation**: count.
- Two side-by-side widgets:
  - **Today's schedule** — timeline of bookings per slot per branch.
  - **Upcoming pending (oldest first)** — quick "Confirm" / "Reschedule" / "Cancel" actions.

### 5.3 Bookings list (`/bookings`)

Data table with filters: branch, status (multi), date range, treatment/package, search (reference / name / email / phone).

Columns: reference · customer · branch · treatment/package · date · slot · specialist · status · created_at.

Row actions:
- View detail.
- Quick-confirm.
- Reschedule (opens slot picker).
- Cancel (asks reason).
- Mark no-show / completed (after date passed).

Bulk actions: export CSV, bulk confirm.

Header CTA: **"+ New booking"** (for walk-in / phone).

### 5.4 Booking detail (`/bookings/:id`)

Two-column layout:

**Left**:
- Customer card (name, email, phone, marketing consent, link to CRM).
- Booking facts (reference, treatment/package, branch, appointment_date, start_time, duration, specialist, source, status).
- Concerns text (sensitive, shown with eye-toggle and audit-logged on reveal).
- Action panel: Confirm · Reschedule · Cancel · Assign specialist · Mark no-show · Mark completed.

**Right**:
- Timeline of `booking_audit` rows (created → reminders sent → confirmed → … ).
- Internal notes — staff can add notes; appended to audit.

### 5.5 Calendar view (`/bookings/calendar`)

Branch picker + day/week/month toggle. Slots rendered as a grid, bookings as gold pills (color-coded by status). Click a slot → "New booking at this time" pre-fill. Click a booking → detail drawer.

### 5.6 New / edit booking modal

Reuses the same 3-step UX as the public form but adds admin-only fields:
- Customer search (existing CRM record or "+ new customer").
- Source (`phone`, `walk_in`, `web`).
- Assigned specialist.
- Auto-confirm toggle.

### 5.7 Customers (`/customers`)

Searchable list. Columns: name · email · phone · # bookings · last visit · marketing consent.

Detail view: profile fields (editable), full booking history (links to each), newsletter status, reviews authored, merge-duplicates action.

### 5.8 Treatments CMS (`/content/treatments`)

List with drag-handle reorder, search, filter by category, toggle published.

Editor (right drawer or full page):
- Name, slug (auto from name), tagline, category (select).
- Duration (number, minutes), recovery text, price (in major currency with cent-precision).
- Image upload (S3) + alt text.
- Icon picker (predefined SVG set keyed by `icon_key`).
- Short description (textarea), scientific rationale (textarea).
- Steps editor: ordered list with drag, inline edit, "+ add step".
- Publish toggle. Save persists; "Save & publish" sets `is_published=true`.

### 5.9 Categories CMS

Simple table: slug · display name · order · active. Inline editing. Cannot delete if treatments still reference it.

### 5.10 Packages CMS

Same shape as treatments, plus:
- Price + value-price (strikethrough) fields.
- Badge selector (none, Bestseller, Elite Choice — extensible).
- Inclusions list editor (ordered, plain text bullets).
- Optional treatment links (M:N — pick which treatments are in this bundle).

### 5.11 Specialists CMS

List → editor with:
- Full name, role title, credential line.
- Portrait upload.
- Focus & philosophy textareas.
- Branch checklist (M:N).
- Display order, publish toggle.
- Optional: link to a `users` account if the specialist needs login.

### 5.12 Before & After CMS

List → editor with:
- Title, subtitle.
- Linked treatment (FK).
- Timeline, primary indications, therapist notes, satisfaction text, age profile.
- Before image upload, after image upload (paired preview to confirm framing/alignment).
- Publish toggle, display order.

### 5.13 Reviews moderation

Tabs: **Pending** · **Approved** · **Rejected**.

Card list with quote preview, author, rating, branch. Actions: Approve · Reject · Feature · Edit · Delete.

"+ New review" — staff can manually add curated reviews (matches today's hard-coded list).

### 5.14 Branches (`/branches`)

List view. Detail editor:
- Identity (city, display name, slug, address, phone, email, timezone).
- Map coords (x, y as %).
- Hours editor: 7-row table (Sun–Sat) with `closed` checkbox or `opens_at`/`closes_at` pickers; "hours_text" auto-generated from rows.
- Time slots: list of slots with `start_time`, `label`, `capacity`, drag-reorder.
- Active toggle.

### 5.15 Specialist schedule & blackouts

Calendar showing all specialists' availability per branch. Click a date to add a blackout (vacation / equipment maintenance). Bookings into a blacked-out slot are blocked at API level.

### 5.16 Newsletter (`/newsletter`)

Table of subscribers: email · status · source · subscribed_at · last_email_sent.

Filters by status. Actions: Export CSV, Import CSV, Force-unsubscribe.

(v2) Campaign composer that pushes to Mailchimp/Klaviyo via API key.

### 5.17 Site settings (`/settings/site`)

Form-driven editor over `site_settings` rows:
- **Hero stats** — satisfaction %, clients served, specialists count.
- **Booking config** — `lead_time_hours` (default 24), `callback_window_hours` (default 2), `auto_confirm` boolean.
- **Legal copy** — privacy URL, terms URL, clinical disclaimers URL.
- **SEO** — meta title, description, og image.

### 5.18 Users & roles (`/settings/users`, super_admin only)

List staff. Create-user flow sends a "set your password" invite email. Edit role, assigned branch, MFA enforced, active flag.

### 5.19 Audit log (`/settings/audit-log`)

Filterable list of `audit_log` rows. Date range, user, entity_type, action. JSON diff viewer for `update` rows.

### 5.20 Profile (`/profile`)

Self-service: name, password change, MFA enrollment, sessions list with revoke.

---

## 6. Critical UX rules

1. **Pending bookings highlighted everywhere** — pending status uses a distinctive color and the global header shows a count badge. Promise of 2-hour callback is the most important SLA.
2. **No silent destructive actions** — cancelling a booking, rejecting a review, and deleting any published content always asks for confirmation and a reason (which is saved to audit).
3. **Branch-scoped users never see global data** — even in URLs (`/bookings/:id` of another branch returns 404 for them).
4. **Reordering is drag + drop** — treatments, packages, specialists, gallery cases, branches all rely on `display_order` which the UI must update with a `PUT /reorder` call.
5. **Sensitive `concerns` text** is hidden behind a "Reveal" click that writes an audit entry — protects against shoulder-surfing and creates accountability.
6. **All forms** use optimistic save with toast feedback and accept Ctrl/⌘+S.

---

## 7. Notifications (out from admin)

| Trigger | Channel | Audience |
|---|---|---|
| New booking created | Email + (optional Slack webhook) | Branch concierges |
| Booking confirmed | Email + SMS | Customer |
| Booking rescheduled | Email | Customer |
| Booking cancelled (by staff) | Email | Customer |
| Booking reminder (24h before) | Email + SMS | Customer |
| Newsletter verification | Email | Subscriber |
| Staff password reset / invite | Email | Staff user |
| Failed login (≥3 in 10 min) | Email | super_admin |

---

## 8. Validation rules surfaced in the UI

- Treatment / package price: positive, ≤ 9 999 999 cents (~$100k cap).
- Slug fields: lowercase, kebab-case, unique.
- Time slot `start_time` must fall within branch hours for at least one day-of-week.
- Booking date cannot be in the past for new bookings (admin override allowed when `source=walk_in` so historical entries are possible).
- Image upload: max 5 MB, jpeg/png/webp.

---

## 9. Phased rollout

**Phase 1 (MVP — unblocks public site launch)**
- Auth + roles.
- Bookings list, detail, confirm/cancel/reschedule.
- Customers list.
- Branches & hours.
- Settings → site hero stats.
- Reviews moderation.
- Audit log (read-only).

**Phase 2**
- Treatments / Packages / Specialists / Before & After CMS.
- Newsletter management.
- Calendar view.
- Specialist schedule / blackouts.

**Phase 3**
- Newsletter campaigns.
- Reporting / analytics dashboards.
- Payment / deposits integration.
- Customer self-service portal.

---

## 10. Cross-references

- API endpoints driving every screen: [api-spec.md](./api-spec.md).
- Underlying tables & constraints: [database-schema.md](./database-schema.md).
- Source of behavioral requirements (the public marketing site & its promises): [project-requirements.md](./project-requirements.md).
