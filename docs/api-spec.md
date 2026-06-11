# LA Skin & Aesthetics — API Specification

> REST + JSON. Base URLs: `/api/v1` for public, `/api/v1/admin` for admin. Authentication:
> - **Public**: none (rate-limited).
> - **Customer self-service**: signed link tokens (no login).
> - **Admin**: `Authorization: Bearer <jwt>` after `/auth/login`.
>
> All endpoints return JSON with `Content-Type: application/json; charset=utf-8`.
> Error shape:
> ```json
> { "error": { "code": "VALIDATION_ERROR", "message": "...", "details": { ... } } }
> ```

---

## 1. Public Endpoints (read)

### 1.1 `GET /api/v1/branches`
Returns all active branches. Used by Contact section, Booking form, and the map.

**Response 200**
```json
{
  "data": [
    {
      "id": 1,
      "slug": "beverly-hills",
      "city": "Beverly Hills",
      "display_name": "Beverly Hills (Rodeo Dr)",
      "address_line": "420 Rodeo Drive, Suite A, Beverly Hills, CA 90210",
      "phone": "+1 (310) 555-0190",
      "email": "bh@laskinclinic.com",
      "timezone": "America/Los_Angeles",
      "map_coords": { "x": "25%", "y": "45%" },
      "hours": [
        { "day_of_week": 1, "is_closed": false, "opens_at": "09:00", "closes_at": "20:00" },
        { "day_of_week": 6, "is_closed": false, "opens_at": "10:00", "closes_at": "18:00" },
        { "day_of_week": 0, "is_closed": true }
      ],
      "hours_text": "Mon - Fri: 9:00 AM - 8:00 PM | Sat: 10:00 AM - 6:00 PM"
    }
  ]
}
```

### 1.2 `GET /api/v1/treatments`
Replaces the `treatmentsData` array in [Treatments.jsx](../src/sections/Treatments.jsx).

Query params:
- `category` — optional: `facial` | `laser` | `therapy`.

**Response 200**
```json
{
  "data": [
    {
      "id": 1,
      "slug": "hydra-facial",
      "name": "Hydra Facial",
      "tagline": "Deep Vortex Hydration & Glow",
      "category": { "slug": "facial", "display_name": "Facial Clinic" },
      "duration_minutes": 60,
      "duration_text": "60 Mins",
      "recovery_text": "Zero downtime",
      "price": { "amount_cents": 22500, "currency": "USD", "formatted": "$225" },
      "image_url": "https://.../hydra-facial.jpg",
      "icon_key": "droplet",
      "short_description": "A multi-step medical-grade skin treatment ...",
      "scientific_text": "Deploying vortex-suction vacuum extraction ...",
      "steps": [
        { "step_order": 1, "description": "Clinical double cleansing ..." },
        { "step_order": 2, "description": "Gentle mechanical peeling ..." }
      ]
    }
  ]
}
```

### 1.3 `GET /api/v1/treatments/:slug`
Single treatment for a deep-link or drawer fetch. Same shape as a single item above.

### 1.4 `GET /api/v1/packages`
Replaces the `packages` array in [Packages.jsx](../src/sections/Packages.jsx).

**Response 200**
```json
{
  "data": [
    {
      "id": 1,
      "slug": "bh-radiance",
      "name": "The Beverly Hills Radiance",
      "tagline": "Instant Event High-Gloss Glow",
      "price":  { "amount_cents": 32000, "currency": "USD", "formatted": "$320" },
      "value_price": { "amount_cents": 38500, "currency": "USD", "formatted": "$385 Value" },
      "badge": "Bestseller",
      "inclusions": [
        "60 Min Hydra Facial Luxe infusion",
        "Purity Vitamin C & Ferulic infusion",
        "Clinical Red LED light therapy calm",
        "Luxury botanical face lift massage"
      ]
    }
  ]
}
```

### 1.5 `GET /api/v1/specialists`
Replaces `specialists` array in [Specialists.jsx](../src/sections/Specialists.jsx).

**Response 200**
```json
{
  "data": [
    {
      "id": 1,
      "slug": "evelyn-davenport",
      "full_name": "Dr. Evelyn Davenport",
      "role": "Chief Cosmetic Dermatologist",
      "credential": "Harvard Medical School • 15+ Yrs Exp",
      "focus": "Cellular anti-aging, custom injectables mapping, laser therapeutics",
      "philosophy": "Timeless beauty lies in preserving structural harmony...",
      "portrait_url": "https://...",
      "branches": [{ "slug": "beverly-hills", "city": "Beverly Hills" }]
    }
  ]
}
```

### 1.6 `GET /api/v1/before-after`
Replaces `casesData` in [BeforeAfter.jsx](../src/sections/BeforeAfter.jsx).

**Response 200**
```json
{
  "data": [
    {
      "id": 1,
      "slug": "case-laser-skin",
      "title": "Laser Skin Rejuvenation",
      "subtitle": "Hyperpigmentation & Textural Correction",
      "treatment_slug": "laser-treatment",
      "timeline_text": "3 Sessions (12 Weeks)",
      "primary_indications": "Sun damage, deep epidermal pigmentation, uneven skin texture",
      "therapist_notes": "Fractional laser resurfacing applied at 15mJ ...",
      "satisfaction_text": "100% Client Rating",
      "age_profile": "38 Years",
      "before_image_url": "https://...",
      "after_image_url": "https://..."
    }
  ]
}
```

### 1.7 `GET /api/v1/reviews`
Approved testimonials only.

Query params: `limit` (default 10), `branch` (optional slug filter).

**Response 200**
```json
{
  "data": [
    {
      "id": 1,
      "author_name": "Lady Beatrice V.",
      "branch": { "slug": "london", "city": "London (Mayfair)" },
      "quote": "The most outstanding skin results ...",
      "rating": 5
    }
  ]
}
```

### 1.8 `GET /api/v1/site-settings/public`
Hero stats and any other public copy.

**Response 200**
```json
{
  "data": {
    "hero": { "satisfaction_pct": 99, "clients_served": 15000, "specialists_count": 10 },
    "booking": { "lead_time_hours": 24, "callback_window_hours": 2 }
  }
}
```

### 1.9 `GET /api/v1/availability`
Returns the time slots available at a branch on a date.

Query params (all required):
- `branch_slug`
- `date` (YYYY-MM-DD, must be ≥ today in branch tz)
- `treatment_slug` OR `package_slug` (optional — used to deduct duration if needed)

**Response 200**
```json
{
  "data": {
    "branch_slug": "beverly-hills",
    "date": "2026-06-20",
    "slots": [
      { "label": "09:00 AM", "start_time": "09:00", "available": true },
      { "label": "10:30 AM", "start_time": "10:30", "available": false },
      { "label": "12:00 PM", "start_time": "12:00", "available": true }
    ]
  }
}
```

**Errors**: `400 INVALID_DATE`, `404 BRANCH_NOT_FOUND`.

---

## 2. Public Write Endpoints

### 2.1 `POST /api/v1/bookings`
Create an appointment. Maps to the 3-step `BookingForm` submit.

**Rate limit**: 5 / IP / minute.

**Request body**
```json
{
  "branch_slug": "beverly-hills",
  "treatment_slug": "hydra-facial",      // OR
  "package_slug": "bh-radiance",         // exactly one required
  "appointment_date": "2026-06-20",      // YYYY-MM-DD
  "start_time": "10:30",                 // 24h "HH:mm"
  "customer": {
    "full_name": "Lady Alexandra",
    "email": "alexandra@example.com",
    "phone": "+1 555 0199"
  },
  "concerns": "Sensitive skin around cheeks.",
  "marketing_consent": false,
  "captcha_token": "..."                 // recaptcha / hCaptcha
}
```

**Validation** (mirrors frontend, enforced server-side):
- `email` matches `\S+@\S+\.\S+`
- `phone` matches `^[+]?[0-9\s-]{7,15}$`
- `full_name` non-empty
- `appointment_date` ≥ today in branch tz
- `start_time` ∈ `branch_time_slots` for the branch and slot is available (per capacity)
- Either `treatment_slug` or `package_slug` (XOR)

**Response 201**
```json
{
  "data": {
    "reference": "LSA-9X4K2T",
    "status": "pending",
    "branch": { "slug": "beverly-hills", "city": "Beverly Hills" },
    "treatment": { "slug": "hydra-facial", "name": "Hydra Facial" },
    "appointment_date": "2026-06-20",
    "start_time": "10:30",
    "manage_url": "https://laskin.com/manage/LSA-9X4K2T?token=<signed>",
    "message": "Reservation received. Our concierge will reach out within 2 hours."
  }
}
```

**Errors**:
- `400 VALIDATION_ERROR` — invalid field shape.
- `409 SLOT_UNAVAILABLE` — slot taken since the customer loaded the form.
- `429 RATE_LIMITED`.

**Side effects**:
- Send customer confirmation email.
- Notify branch concierge channel (email / Slack / SMS — implementation choice).
- Audit row in `booking_audit`.

### 2.2 `GET /api/v1/bookings/:reference`
Fetch a booking via the signed link in the confirmation email.

Query param: `token=<signed>` (required, HMAC of reference + booking id, time-limited).

**Response 200** — booking summary for the manage page.

**Errors**: `403 INVALID_TOKEN`, `404 NOT_FOUND`.

### 2.3 `PATCH /api/v1/bookings/:reference`
Reschedule via signed link. Allowed only ≥ 24h before `appointment_date`.

**Request body**
```json
{
  "token": "<signed>",
  "appointment_date": "2026-06-22",
  "start_time": "12:00"
}
```

**Errors**: `409 TOO_LATE` (within 24h), `409 SLOT_UNAVAILABLE`.

### 2.4 `DELETE /api/v1/bookings/:reference`
Cancel via signed link.

Request body: `{ "token": "<signed>", "reason": "..." }`.

### 2.5 `POST /api/v1/newsletter/subscribe`
From the footer form.

**Request body**
```json
{ "email": "alexandra@example.com", "source": "footer" }
```

**Response 202** (accepted, verification email sent)
```json
{ "data": { "status": "pending", "message": "Verification email sent." } }
```

**Errors**: `400 INVALID_EMAIL`, `409 ALREADY_SUBSCRIBED`.

### 2.6 `GET /api/v1/newsletter/verify`
Confirms double opt-in.

Query: `token=<verify_token>`.

### 2.7 `GET /api/v1/newsletter/unsubscribe`
Honors unsubscribe links.

Query: `token=<unsubscribe_token>`.

---

## 3. Admin Authentication

### 3.1 `POST /api/v1/admin/auth/login`
**Request body**: `{ "email": "...", "password": "...", "mfa_code": "123456" (optional) }`

**Response 200**
```json
{
  "data": {
    "access_token": "<jwt, 15 min>",
    "refresh_token": "<jwt, 7 days>",
    "user": {
      "id": 1, "email": "...", "full_name": "...",
      "role": "super_admin", "branch_id": null,
      "mfa_required": false
    }
  }
}
```

**Errors**: `401 INVALID_CREDENTIALS`, `401 MFA_REQUIRED`, `403 INACTIVE_USER`.

### 3.2 `POST /api/v1/admin/auth/refresh`
Exchange refresh for new access token.

### 3.3 `POST /api/v1/admin/auth/logout`
Revoke session.

### 3.4 `GET /api/v1/admin/auth/me`
Return current user profile.

### 3.5 `POST /api/v1/admin/auth/mfa/setup`, `POST /api/v1/admin/auth/mfa/verify`
TOTP enrollment.

---

## 4. Admin — Bookings

All require `Authorization` and one of: `super_admin`, `clinic_manager`, `concierge`. Branch-scoped roles only see their `branch_id`.

### 4.1 `GET /api/v1/admin/bookings`
List with filters.

Query params:
- `branch_id`, `status` (csv), `from`, `to` (dates), `customer_email`, `search` (matches reference/name/email), `page`, `per_page`, `sort`.

**Response 200**: paginated list with full booking + customer + treatment/package + branch joins.

### 4.2 `GET /api/v1/admin/bookings/:id`
Full detail including `booking_audit` history.

### 4.3 `POST /api/v1/admin/bookings`
Create on behalf of a customer (walk-in / phone).

### 4.4 `PATCH /api/v1/admin/bookings/:id`
Update fields, assign `specialist_id`, change `status` to `confirmed` / `completed` / `no_show` / `cancelled`, edit `appointment_date` / `start_time`.

### 4.5 `POST /api/v1/admin/bookings/:id/confirm`
Convenience action that sets `status='confirmed'` + emails customer.

### 4.6 `POST /api/v1/admin/bookings/:id/notes`
Add an internal note (lands in `booking_audit`).

### 4.7 `GET /api/v1/admin/bookings/export.csv`
CSV export of filtered set.

---

## 5. Admin — CRM (Customers)

### 5.1 `GET /api/v1/admin/customers`
List, search by name / email / phone.

### 5.2 `GET /api/v1/admin/customers/:id`
Detail with all bookings, reviews, newsletter status.

### 5.3 `PATCH /api/v1/admin/customers/:id`
Update name / phone / marketing_consent.

### 5.4 `POST /api/v1/admin/customers/:id/merge`
Merge two duplicates.

---

## 6. Admin — Content CMS

Standard `GET / POST / PATCH / DELETE` CRUD on:

| Resource | Endpoint root |
|----------|---------------|
| Treatments | `/api/v1/admin/treatments` |
| Treatment steps | `/api/v1/admin/treatments/:id/steps` (bulk reorder via `PUT`) |
| Categories | `/api/v1/admin/categories` |
| Packages | `/api/v1/admin/packages` |
| Package inclusions | `/api/v1/admin/packages/:id/inclusions` |
| Specialists | `/api/v1/admin/specialists` |
| Specialist branch assignments | `/api/v1/admin/specialists/:id/branches` |
| Specialist schedule | `/api/v1/admin/specialists/:id/schedule` |
| Before/after cases | `/api/v1/admin/before-after` |
| Reviews | `/api/v1/admin/reviews` (PATCH to approve/reject/feature) |
| Branches | `/api/v1/admin/branches` |
| Branch hours | `/api/v1/admin/branches/:id/hours` |
| Branch time-slots | `/api/v1/admin/branches/:id/time-slots` |

Common patterns:
- **PUT `/treatments/reorder`** with body `{ "order": [3,1,2,...] }` to set `display_order`.
- **POST `/treatments/:id/publish`**, **POST `/treatments/:id/unpublish`**.
- **POST `/media`** — multipart upload returning a `media_assets` row; clients use the returned URL when saving entities.

### 6.1 Reviews moderation
- `PATCH /api/v1/admin/reviews/:id` body `{ "status": "approved" | "rejected", "is_featured": true }`.

### 6.2 Site settings
- `GET /api/v1/admin/site-settings`
- `PUT /api/v1/admin/site-settings/:key` with `{ "value": ... }`.

---

## 7. Admin — Availability

### 7.1 `GET /api/v1/admin/availability`
Calendar view across one branch, with bookings and specialist coverage.

Query: `branch_id`, `from`, `to`, `specialist_id` (optional).

### 7.2 `POST /api/v1/admin/availability/blackout`
Block dates/slots (vacation, equipment downtime).

---

## 8. Admin — Newsletter

### 8.1 `GET /api/v1/admin/newsletter/subscribers`
List, filter by status, export CSV.

### 8.2 `POST /api/v1/admin/newsletter/subscribers/import`
Bulk import via CSV.

### 8.3 `DELETE /api/v1/admin/newsletter/subscribers/:id`
Hard-unsubscribe.

### 8.4 (optional) `POST /api/v1/admin/newsletter/campaigns`
If we build an in-house campaign tool; otherwise integrate with Mailchimp/Klaviyo (out of scope v1).

---

## 9. Admin — Users & Roles

### 9.1 `GET /api/v1/admin/users` (super_admin only)
List staff.

### 9.2 `POST /api/v1/admin/users`
Create staff. Body: `{ email, full_name, role, branch_id?, send_invite: true }`. Server emails a set-password link.

### 9.3 `PATCH /api/v1/admin/users/:id`
Change role, branch, active flag.

### 9.4 `POST /api/v1/admin/users/:id/reset-password`
Send reset link.

### 9.5 `GET /api/v1/admin/audit-log`
List audit rows, filter by entity / user / action / date.

---

## 10. Cross-cutting concerns

### 10.1 Pagination
Query: `page` (default 1), `per_page` (default 20, max 100).

Response envelope:
```json
{
  "data": [ ... ],
  "meta": { "page": 1, "per_page": 20, "total": 145, "total_pages": 8 }
}
```

### 10.2 Sorting
Query: `sort=field,-other_field` (prefix `-` for desc).

### 10.3 Caching
Public list endpoints return `Cache-Control: public, max-age=60, stale-while-revalidate=300` and an `ETag`. Admin write endpoints invalidate the cache.

### 10.4 CORS
- Public: allow the marketing site origin.
- Admin: allow the admin SPA origin only.

### 10.5 Validation library
Use a schema validator (e.g. Zod, Joi, Pydantic) — share the same constraints documented above.

### 10.6 Idempotency
`POST /api/v1/bookings` accepts an `Idempotency-Key` header so retries from network blips don't double-book.

### 10.7 Webhooks (future)
Reserve `/api/v1/admin/webhooks` for outbound notifications to a future calendar / SMS integration.

---

## 11. Mapping — Frontend → API

| Frontend usage | Endpoint |
|----------------|----------|
| `Treatments.jsx` `treatmentsData` | `GET /treatments` |
| Treatment drawer "Book Now" | `POST /bookings` |
| `Packages.jsx` `packages` | `GET /packages` |
| `Specialists.jsx` `specialists` | `GET /specialists` |
| `BeforeAfter.jsx` `casesData` | `GET /before-after` |
| `Reviews.jsx` `reviews` | `GET /reviews` |
| `Contact.jsx` `branchSanctuaries` | `GET /branches` |
| `BookingForm.jsx` treatment list | `GET /treatments` + `GET /packages` |
| `BookingForm.jsx` branch radios | `GET /branches` |
| `BookingForm.jsx` time-slot grid | `GET /availability` |
| `BookingForm.jsx` submit | `POST /bookings` |
| `Footer.jsx` newsletter subscribe | `POST /newsletter/subscribe` |
| `Hero.jsx` floating stats | `GET /site-settings/public` |
