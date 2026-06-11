# LA Skin & Aesthetics — Database Schema

> Target engine: **PostgreSQL 15+**. Types and syntax assume Postgres but translate easily to MySQL/MariaDB. All tables use `id BIGSERIAL` primary keys and include `created_at`, `updated_at` timestamps with `DEFAULT now()` and a trigger to bump `updated_at` on update. Soft-delete via nullable `deleted_at` where useful.

## 1. ER Overview

```
                         ┌──────────────┐
                         │   branches   │
                         └──────┬───────┘
              ┌─────────────────┼────────────────────┐
              │                 │                    │
              ▼                 ▼                    ▼
       ┌──────────────┐  ┌────────────────┐  ┌────────────────┐
       │ branch_hours │  │ specialists ── │◄─┤specialist_     │
       └──────────────┘  │   _branches    │  │  schedule      │
                         └──────┬─────────┘  └────────────────┘
                                │
                         ┌──────▼───────┐
                         │ specialists  │
                         └──────────────┘

   ┌────────────┐      ┌─────────────────────┐
   │ categories │◄─────┤    treatments       │
   └────────────┘      └─────────┬───────────┘
                                 │
                                 ▼
                       ┌─────────────────────┐
                       │ treatment_steps     │
                       └─────────────────────┘

   ┌──────────────┐    ┌──────────────────────────┐
   │   packages   ├───►│ package_treatments (M:N) │
   └──────────────┘    └──────────────────────────┘
   ┌──────────────────────┐
   │ package_inclusions   │  (free-text bullet list per package)
   └──────────────────────┘

   ┌─────────────┐          ┌──────────────┐
   │ customers   │◄─────────┤   bookings   │
   └─────────────┘          └──────┬───────┘
                                   │ (treatment_id XOR package_id)
                                   ▼
                            ┌─────────────────┐
                            │  booking_audit  │
                            └─────────────────┘

   ┌──────────────────┐  ┌────────────────────────┐
   │ reviews          │  │ before_after_cases     │
   └──────────────────┘  └────────────────────────┘

   ┌────────────────────┐   ┌────────────┐   ┌────────────┐
   │ newsletter_        │   │ users      │   │ audit_log  │
   │   subscribers      │   │ (admin)    │   └────────────┘
   └────────────────────┘   └────────────┘
```

---

## 2. Tables

### 2.1 `branches`

The clinic locations (Beverly Hills, London, Dubai). Configurable so new branches can be added.

```sql
CREATE TABLE branches (
  id                 BIGSERIAL PRIMARY KEY,
  slug               VARCHAR(50)  NOT NULL UNIQUE,    -- 'beverly-hills', 'london', 'dubai'
  city               VARCHAR(100) NOT NULL,
  display_name       VARCHAR(150) NOT NULL,           -- 'Beverly Hills (Rodeo Dr)'
  address_line       VARCHAR(255) NOT NULL,
  phone              VARCHAR(50)  NOT NULL,
  email              VARCHAR(255) NOT NULL,
  timezone           VARCHAR(64)  NOT NULL,           -- IANA tz, e.g. 'America/Los_Angeles'
  map_x              VARCHAR(10),                     -- vector map coord (eg '25%')
  map_y              VARCHAR(10),
  display_order      INT          NOT NULL DEFAULT 0,
  is_active          BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

### 2.2 `branch_hours`

Operating hours per weekday. One row per (branch, day_of_week).

```sql
CREATE TABLE branch_hours (
  id            BIGSERIAL PRIMARY KEY,
  branch_id     BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  day_of_week   SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sun
  is_closed     BOOLEAN  NOT NULL DEFAULT FALSE,
  opens_at      TIME,
  closes_at     TIME,
  UNIQUE (branch_id, day_of_week),
  CHECK (is_closed OR (opens_at IS NOT NULL AND closes_at IS NOT NULL))
);
```

### 2.3 `branch_time_slots`

Configurable time-slot template per branch. Frontend currently shows a fixed 7-slot list; this allows per-branch overrides and capacity.

```sql
CREATE TABLE branch_time_slots (
  id            BIGSERIAL PRIMARY KEY,
  branch_id     BIGINT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  start_time    TIME   NOT NULL,                       -- e.g. '09:00:00'
  label         VARCHAR(20) NOT NULL,                  -- '09:00 AM'
  capacity      INT    NOT NULL DEFAULT 1,             -- concurrent bookings allowed
  display_order INT    NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (branch_id, start_time)
);
```

### 2.4 `categories`

Treatment categories: `facial`, `laser`, `therapy` today.

```sql
CREATE TABLE categories (
  id            BIGSERIAL PRIMARY KEY,
  slug          VARCHAR(50)  NOT NULL UNIQUE,         -- 'facial' | 'laser' | 'therapy'
  display_name  VARCHAR(100) NOT NULL,                -- 'Facial Clinic'
  display_order INT          NOT NULL DEFAULT 0,
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE
);
```

### 2.5 `treatments`

Maps directly to the 5 cards in `Treatments.jsx`.

```sql
CREATE TABLE treatments (
  id                 BIGSERIAL PRIMARY KEY,
  slug               VARCHAR(100) NOT NULL UNIQUE,    -- 'hydra-facial'
  name               VARCHAR(150) NOT NULL,           -- 'Hydra Facial'
  tagline            VARCHAR(255),                    -- 'Deep Vortex Hydration & Glow'
  category_id        BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  duration_minutes   INT NOT NULL,                    -- 60
  recovery_text      VARCHAR(100),                    -- 'Zero downtime'
  price_cents        INT NOT NULL,                    -- 22500  (store cents, format on FE)
  currency           CHAR(3) NOT NULL DEFAULT 'USD',
  image_url          VARCHAR(500),
  icon_key           VARCHAR(50),                     -- maps to a known FE icon set
  short_description  TEXT NOT NULL,                   -- card description
  scientific_text    TEXT,                            -- drawer 'science' block
  display_order      INT NOT NULL DEFAULT 0,
  is_published       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at         TIMESTAMPTZ
);

CREATE INDEX idx_treatments_category ON treatments(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_treatments_published ON treatments(is_published) WHERE deleted_at IS NULL;
```

### 2.6 `treatment_steps`

Ordered procedural steps for a treatment (drawer "Step-by-Step Experience").

```sql
CREATE TABLE treatment_steps (
  id            BIGSERIAL PRIMARY KEY,
  treatment_id  BIGINT NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  step_order    INT NOT NULL,
  description   TEXT NOT NULL,
  UNIQUE (treatment_id, step_order)
);
```

### 2.7 `packages`

Curated bundle offerings (Beverly Hills Radiance, London Glow Classic, Dubai Elite).

```sql
CREATE TABLE packages (
  id              BIGSERIAL PRIMARY KEY,
  slug            VARCHAR(100) NOT NULL UNIQUE,
  name            VARCHAR(150) NOT NULL,
  tagline         VARCHAR(255),
  price_cents     INT NOT NULL,
  value_price_cents INT,                              -- strikethrough comparison price
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  badge           VARCHAR(50),                        -- 'Bestseller' | 'Elite Choice' | NULL
  display_order   INT NOT NULL DEFAULT 0,
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
```

### 2.8 `package_inclusions`

Free-text bulleted list shown under "Skin Journey Includes:" on each package card.

```sql
CREATE TABLE package_inclusions (
  id          BIGSERIAL PRIMARY KEY,
  package_id  BIGINT NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  position    INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  UNIQUE (package_id, position)
);
```

### 2.9 `package_treatments` (optional M:N)

If/when a package should be programmatically composed of treatment records (rather than free-text inclusions). Keep both — `inclusions` for display copy, `package_treatments` for scheduling math.

```sql
CREATE TABLE package_treatments (
  package_id   BIGINT NOT NULL REFERENCES packages(id)   ON DELETE CASCADE,
  treatment_id BIGINT NOT NULL REFERENCES treatments(id) ON DELETE RESTRICT,
  position     INT NOT NULL,
  PRIMARY KEY (package_id, treatment_id)
);
```

### 2.10 `specialists`

Doctors and aestheticians shown on the Specialists section.

```sql
CREATE TABLE specialists (
  id              BIGSERIAL PRIMARY KEY,
  slug            VARCHAR(100) NOT NULL UNIQUE,
  full_name       VARCHAR(150) NOT NULL,             -- 'Dr. Evelyn Davenport'
  role            VARCHAR(150) NOT NULL,             -- 'Chief Cosmetic Dermatologist'
  credential      VARCHAR(255),                      -- 'Harvard Medical School • 15+ Yrs Exp'
  focus           TEXT,
  philosophy      TEXT,
  portrait_url    VARCHAR(500),
  user_id         BIGINT REFERENCES users(id),       -- optional login if specialist is also staff
  display_order   INT NOT NULL DEFAULT 0,
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
```

### 2.11 `specialists_branches`

M:N — specialists work at one or more branches.

```sql
CREATE TABLE specialists_branches (
  specialist_id BIGINT NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  branch_id     BIGINT NOT NULL REFERENCES branches(id)    ON DELETE CASCADE,
  PRIMARY KEY (specialist_id, branch_id)
);
```

### 2.12 `specialist_schedule`

Optional per-specialist override / blackout dates (vacation, off days).

```sql
CREATE TABLE specialist_schedule (
  id            BIGSERIAL PRIMARY KEY,
  specialist_id BIGINT NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  branch_id     BIGINT NOT NULL REFERENCES branches(id)    ON DELETE CASCADE,
  date          DATE NOT NULL,
  is_available  BOOLEAN NOT NULL DEFAULT TRUE,
  note          VARCHAR(255),
  UNIQUE (specialist_id, branch_id, date)
);
```

### 2.13 `before_after_cases`

Clinical case studies for the gallery.

```sql
CREATE TABLE before_after_cases (
  id                  BIGSERIAL PRIMARY KEY,
  slug                VARCHAR(100) NOT NULL UNIQUE,
  title               VARCHAR(150) NOT NULL,
  subtitle            VARCHAR(255),
  treatment_id        BIGINT REFERENCES treatments(id) ON DELETE SET NULL,
  timeline_text       VARCHAR(100),                   -- '3 Sessions (12 Weeks)'
  primary_indications TEXT,
  therapist_notes     TEXT,
  satisfaction_text   VARCHAR(50),                    -- '100% Client Rating'
  age_profile         VARCHAR(50),                    -- '38 Years'
  before_image_url    VARCHAR(500) NOT NULL,
  after_image_url     VARCHAR(500) NOT NULL,
  display_order       INT NOT NULL DEFAULT 0,
  is_published        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.14 `reviews`

Testimonials carousel. Admin curates / approves.

```sql
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE reviews (
  id           BIGSERIAL PRIMARY KEY,
  customer_id  BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  branch_id    BIGINT REFERENCES branches(id)  ON DELETE SET NULL,
  author_name  VARCHAR(150) NOT NULL,                -- 'Lady Beatrice V.'
  quote        TEXT NOT NULL,
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  status       review_status NOT NULL DEFAULT 'pending',
  is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_public ON reviews(status, display_order) WHERE status = 'approved';
```

### 2.15 `customers`

Identity record for anyone who books or subscribes. De-duplicated by email.

```sql
CREATE TABLE customers (
  id          BIGSERIAL PRIMARY KEY,
  full_name   VARCHAR(150),
  email       VARCHAR(255) NOT NULL UNIQUE,
  phone       VARCHAR(50),
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_email_lower ON customers (LOWER(email));
```

### 2.16 `bookings`

The core transactional table.

```sql
CREATE TYPE booking_status AS ENUM (
  'pending',       -- newly created from public site, awaiting concierge confirmation
  'confirmed',     -- concierge confirmed
  'rescheduled',   -- moved to a new slot
  'cancelled',     -- cancelled by customer or staff
  'no_show',
  'completed'
);

CREATE TABLE bookings (
  id              BIGSERIAL PRIMARY KEY,
  reference       VARCHAR(20) NOT NULL UNIQUE,           -- public reservation code, e.g. 'LSA-9X4K2T'
  customer_id     BIGINT NOT NULL REFERENCES customers(id),
  branch_id       BIGINT NOT NULL REFERENCES branches(id),
  treatment_id    BIGINT REFERENCES treatments(id),
  package_id      BIGINT REFERENCES packages(id),
  specialist_id   BIGINT REFERENCES specialists(id),     -- optional, assigned later
  appointment_date DATE NOT NULL,
  start_time      TIME NOT NULL,                         -- matches branch_time_slots.start_time
  duration_minutes INT NOT NULL DEFAULT 60,
  status          booking_status NOT NULL DEFAULT 'pending',
  concerns        TEXT,                                  -- sensitive — encrypt at rest
  source          VARCHAR(50) DEFAULT 'web',             -- 'web' | 'phone' | 'walk_in'
  cancel_token    VARCHAR(64) UNIQUE,                    -- signed link in confirmation email
  cancelled_at    TIMESTAMPTZ,
  cancelled_reason TEXT,
  confirmed_at    TIMESTAMPTZ,
  confirmed_by_user_id BIGINT REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Exactly one of treatment_id or package_id must be set
  CHECK (
    (treatment_id IS NOT NULL AND package_id IS NULL) OR
    (treatment_id IS NULL AND package_id IS NOT NULL)
  )
);

CREATE INDEX idx_bookings_branch_date  ON bookings(branch_id, appointment_date);
CREATE INDEX idx_bookings_customer     ON bookings(customer_id);
CREATE INDEX idx_bookings_status       ON bookings(status);
CREATE INDEX idx_bookings_specialist   ON bookings(specialist_id, appointment_date)
   WHERE specialist_id IS NOT NULL;
```

#### Slot uniqueness

If `branch_time_slots.capacity = 1` everywhere, prevent double-booking with a partial unique index:

```sql
CREATE UNIQUE INDEX uq_bookings_slot
  ON bookings(branch_id, appointment_date, start_time)
  WHERE status IN ('pending', 'confirmed', 'rescheduled');
```

For capacity > 1, enforce in application logic (count active bookings vs. capacity inside a transaction).

### 2.17 `booking_audit`

History of status changes / edits.

```sql
CREATE TABLE booking_audit (
  id            BIGSERIAL PRIMARY KEY,
  booking_id    BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  actor_user_id BIGINT REFERENCES users(id),           -- null = system / customer
  action        VARCHAR(50) NOT NULL,                  -- 'created'|'confirmed'|'rescheduled'|'cancelled'|'note_added'
  from_state    JSONB,
  to_state      JSONB,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_audit_booking ON booking_audit(booking_id);
```

### 2.18 `newsletter_subscribers`

```sql
CREATE TYPE subscriber_status AS ENUM ('pending', 'subscribed', 'unsubscribed', 'bounced');

CREATE TABLE newsletter_subscribers (
  id                BIGSERIAL PRIMARY KEY,
  customer_id       BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  email             VARCHAR(255) NOT NULL UNIQUE,
  status            subscriber_status NOT NULL DEFAULT 'pending',
  source            VARCHAR(50) DEFAULT 'footer',     -- 'footer' | 'booking' | 'import'
  verify_token      VARCHAR(64),
  unsubscribe_token VARCHAR(64) NOT NULL,
  verified_at       TIMESTAMPTZ,
  unsubscribed_at   TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.19 `users` (admin staff)

```sql
CREATE TYPE user_role AS ENUM ('super_admin', 'clinic_manager', 'specialist', 'concierge');

CREATE TABLE users (
  id              BIGSERIAL PRIMARY KEY,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,              -- bcrypt / argon2
  full_name       VARCHAR(150) NOT NULL,
  role            user_role NOT NULL,
  branch_id       BIGINT REFERENCES branches(id),     -- scope for clinic_manager / concierge
  mfa_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_secret      VARCHAR(255),                       -- encrypted
  last_login_at   TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
```

### 2.20 `sessions` (if using opaque session tokens instead of JWT)

```sql
CREATE TABLE sessions (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  ip          INET,
  user_agent  TEXT,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.21 `audit_log` (admin-wide)

```sql
CREATE TABLE audit_log (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT REFERENCES users(id),
  entity_type   VARCHAR(50) NOT NULL,                 -- 'treatment'|'booking'|'specialist'|...
  entity_id     BIGINT,
  action        VARCHAR(50) NOT NULL,                 -- 'create'|'update'|'delete'|'login'|'login_failed'
  ip            INET,
  diff          JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user   ON audit_log(user_id);
```

### 2.22 `site_settings`

Key-value bag for hero stats and other configurable copy.

```sql
CREATE TABLE site_settings (
  key         VARCHAR(100) PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  BIGINT REFERENCES users(id)
);

-- Seed values:
-- ('hero.stats',         '{"satisfaction_pct":99,"clients_served":15000,"specialists_count":10}')
-- ('booking.lead_time_hours', '24')
-- ('booking.auto_confirm',    'false')
```

### 2.23 `media_assets` (optional)

If hosting images in own storage (S3) rather than Unsplash.

```sql
CREATE TABLE media_assets (
  id            BIGSERIAL PRIMARY KEY,
  storage_key   VARCHAR(500) NOT NULL,                -- s3 key
  public_url    VARCHAR(500) NOT NULL,
  mime_type     VARCHAR(100),
  width         INT,
  height        INT,
  alt_text      VARCHAR(255),
  uploaded_by   BIGINT REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 3. Relationships summary

| Parent | Child | Cardinality |
|--------|-------|-------------|
| `branches` | `branch_hours` | 1 : 7 (one per weekday) |
| `branches` | `branch_time_slots` | 1 : N |
| `branches` | `bookings` | 1 : N |
| `branches` | `specialists_branches` | 1 : N |
| `categories` | `treatments` | 1 : N |
| `treatments` | `treatment_steps` | 1 : N (ordered) |
| `treatments` | `package_treatments` | 1 : N |
| `packages` | `package_inclusions` | 1 : N (ordered) |
| `packages` | `package_treatments` | 1 : N |
| `specialists` | `specialists_branches` | 1 : N |
| `specialists` | `specialist_schedule` | 1 : N |
| `customers` | `bookings` | 1 : N |
| `customers` | `newsletter_subscribers` | 1 : 0..1 |
| `customers` | `reviews` | 1 : N |
| `bookings` | `booking_audit` | 1 : N |
| `users` | `audit_log` | 1 : N |

---

## 4. Indexing & performance notes

- All foreign keys get a B-tree index implicitly via the constraint? **No** — Postgres does not auto-index foreign keys. Add explicit indexes on every FK column used in joins or filtering (already declared on hot paths above).
- Public list endpoints (`/treatments`, `/specialists`, `/packages`) should be served from a cache layer (Redis / CDN) keyed by `updated_at` of the table.
- For availability queries — composite index `(branch_id, appointment_date, start_time)` already exists; complement with `branch_time_slots` cached in memory.
- `LOWER(email)` index on `customers` to support case-insensitive lookup.

---

## 5. Data lifecycle / retention

| Data | Retention | Notes |
|------|-----------|-------|
| `bookings` (cancelled/no-show) | Keep indefinitely (with `concerns` scrubbed after 2 years) | clinical / accounting |
| `concerns` text on bookings | Encrypt-at-rest column (pgcrypto / app-level) | sensitive medical info |
| `audit_log` | 2 years rolling | partition by month if volume warrants |
| `newsletter_subscribers` unsubscribed | Keep email + unsubscribed_at to honor suppression list |
| `sessions` expired | Cron-delete weekly |

---

## 6. Seed data

For the initial migration, seed:

- 3 `branches` matching `Contact.jsx`.
- 7 `branch_time_slots` per branch matching `BookingForm.jsx`.
- 3 `categories` (`facial`, `laser`, `therapy`).
- 5 `treatments` + their `treatment_steps` from `Treatments.jsx`.
- 3 `packages` + their `package_inclusions` from `Packages.jsx`.
- 3 `specialists` from `Specialists.jsx`.
- 3 `before_after_cases` from `BeforeAfter.jsx`.
- 3 `reviews` from `Reviews.jsx` (status='approved').
- 1 `super_admin` `users` row (env-provided initial password).
- `site_settings` for hero stats (99 / 15000 / 10).
