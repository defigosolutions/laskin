-- LA Skin & Aesthetics Database Schema DDL

-- Drop existing tables if they exist (clean start)
DROP TABLE IF EXISTS booking_audit CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS contact_inquiries CASCADE;
DROP TABLE IF EXISTS product_inquiries CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS before_after_cases CASCADE;
DROP TABLE IF EXISTS specialist_schedule CASCADE;
DROP TABLE IF EXISTS specialists_branches CASCADE;
DROP TABLE IF EXISTS specialists CASCADE;
DROP TABLE IF EXISTS package_treatments CASCADE;
DROP TABLE IF EXISTS package_inclusions CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS treatment_steps CASCADE;
DROP TABLE IF EXISTS treatments CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS branch_time_slots CASCADE;
DROP TABLE IF EXISTS branch_hours CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;

-- 1. users (Admin Staff Accounts)
CREATE TABLE users (
  id              BIGSERIAL PRIMARY KEY,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  full_name       VARCHAR(150) NOT NULL,
  role            VARCHAR(50) NOT NULL DEFAULT 'super_admin',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. branches (Sanctuaries)
CREATE TABLE branches (
  id                 VARCHAR(50) PRIMARY KEY, -- 'north-haven', etc.
  slug               VARCHAR(50) NOT NULL UNIQUE,
  city               VARCHAR(100) NOT NULL,
  display_name       VARCHAR(150) NOT NULL,
  address_line       VARCHAR(255) NOT NULL,
  phone              VARCHAR(50) NOT NULL,
  email              VARCHAR(255) NOT NULL,
  timezone           VARCHAR(64) NOT NULL DEFAULT 'America/New_York',
  map_x              VARCHAR(10) DEFAULT '50%',
  map_y              VARCHAR(10) DEFAULT '50%',
  display_order      INT NOT NULL DEFAULT 0,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. branch_hours
CREATE TABLE branch_hours (
  id            BIGSERIAL PRIMARY KEY,
  branch_id     VARCHAR(50) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  day_of_week   SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sun
  is_closed     BOOLEAN NOT NULL DEFAULT FALSE,
  opens_at      TIME,
  closes_at     TIME,
  UNIQUE (branch_id, day_of_week),
  CHECK (is_closed OR (opens_at IS NOT NULL AND closes_at IS NOT NULL))
);

-- 4. branch_time_slots
CREATE TABLE branch_time_slots (
  id            BIGSERIAL PRIMARY KEY,
  branch_id     VARCHAR(50) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  start_time    TIME NOT NULL,
  label         VARCHAR(20) NOT NULL,
  capacity      INT NOT NULL DEFAULT 1,
  display_order INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (branch_id, start_time)
);

-- 5. categories (Treatment Categories)
CREATE TABLE categories (
  id            VARCHAR(50) PRIMARY KEY, -- 'facials-skincare', etc.
  slug          VARCHAR(50) NOT NULL UNIQUE,
  display_name  VARCHAR(100) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE
);

-- 6. treatments (Clinical Services)
CREATE TABLE treatments (
  id                 VARCHAR(50) PRIMARY KEY, -- 'hydrafacial', etc.
  slug               VARCHAR(100) NOT NULL UNIQUE,
  name               VARCHAR(150) NOT NULL,
  tagline            VARCHAR(255),
  category_id        VARCHAR(50) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  duration_minutes   INT NOT NULL DEFAULT 60,
  recovery_text      VARCHAR(100) DEFAULT 'Zero downtime',
  price_cents        INT NOT NULL,
  currency           CHAR(3) NOT NULL DEFAULT 'USD',
  image_url          VARCHAR(500),
  icon_key           VARCHAR(50) DEFAULT 'sparkles',
  short_description  TEXT NOT NULL,
  scientific_text    TEXT,
  display_order      INT NOT NULL DEFAULT 0,
  is_published       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at         TIMESTAMPTZ
);

-- 7. treatment_steps (Procedural Steps)
CREATE TABLE treatment_steps (
  id            BIGSERIAL PRIMARY KEY,
  treatment_id  VARCHAR(50) NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  step_order    INT NOT NULL,
  description   TEXT NOT NULL,
  UNIQUE (treatment_id, step_order)
);

-- 8. packages (Skin Journeys)
CREATE TABLE packages (
  id                VARCHAR(50) PRIMARY KEY, -- 'facial-10', etc.
  slug              VARCHAR(100) NOT NULL UNIQUE,
  name              VARCHAR(150) NOT NULL,
  tagline           VARCHAR(255),
  price_cents       INT NOT NULL,
  value_price_cents INT,
  currency          CHAR(3) NOT NULL DEFAULT 'USD',
  badge             VARCHAR(50),
  display_order     INT NOT NULL DEFAULT 0,
  is_published      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

-- 9. package_inclusions
CREATE TABLE package_inclusions (
  id          BIGSERIAL PRIMARY KEY,
  package_id  VARCHAR(50) NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  position    INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  UNIQUE (package_id, position)
);

-- 10. package_treatments (M:N links)
CREATE TABLE package_treatments (
  package_id   VARCHAR(50) NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  treatment_id VARCHAR(50) NOT NULL REFERENCES treatments(id) ON DELETE RESTRICT,
  position     INT NOT NULL,
  PRIMARY KEY (package_id, treatment_id)
);

-- 11. products (Online boutique items)
CREATE TABLE products (
  id             BIGSERIAL PRIMARY KEY,
  slug           VARCHAR(100) NOT NULL UNIQUE,
  name           VARCHAR(150) NOT NULL,
  tagline        VARCHAR(255),
  price_cents    INT NOT NULL,
  currency       CHAR(3) NOT NULL DEFAULT 'USD',
  image_url      VARCHAR(500),
  description    TEXT,
  display_order  INT NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMPTZ
);

-- 12. specialists (Aestheticians)
CREATE TABLE specialists (
  id              VARCHAR(50) PRIMARY KEY, -- 'laura-andrade', etc.
  slug            VARCHAR(100) NOT NULL UNIQUE,
  full_name       VARCHAR(150) NOT NULL,
  role            VARCHAR(150) NOT NULL,
  credential      VARCHAR(255),
  focus           TEXT,
  philosophy      TEXT,
  portrait_url    VARCHAR(500),
  user_id         BIGINT REFERENCES users(id),
  display_order   INT NOT NULL DEFAULT 0,
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

-- 13. specialists_branches (M:N)
CREATE TABLE specialists_branches (
  specialist_id VARCHAR(50) NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  branch_id     VARCHAR(50) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  PRIMARY KEY (specialist_id, branch_id)
);

-- 14. specialist_schedule
CREATE TABLE specialist_schedule (
  id            BIGSERIAL PRIMARY KEY,
  specialist_id VARCHAR(50) NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  branch_id     VARCHAR(50) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  is_available  BOOLEAN NOT NULL DEFAULT TRUE,
  note          VARCHAR(255),
  UNIQUE (specialist_id, branch_id, date)
);

-- 15. before_after_cases (Gallery)
CREATE TABLE before_after_cases (
  id                  VARCHAR(50) PRIMARY KEY, -- 'case-1', etc.
  slug                VARCHAR(100) NOT NULL UNIQUE,
  title               VARCHAR(150) NOT NULL,
  subtitle            VARCHAR(255),
  treatment_id        VARCHAR(50) REFERENCES treatments(id) ON DELETE SET NULL,
  timeline_text       VARCHAR(100),
  primary_indications TEXT,
  therapist_notes     TEXT,
  satisfaction_text   VARCHAR(50),
  age_profile         VARCHAR(50),
  before_image_url    VARCHAR(500) NOT NULL,
  after_image_url     VARCHAR(500) NOT NULL,
  display_order       INT NOT NULL DEFAULT 0,
  is_published        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. reviews (Testimonials)
CREATE TABLE reviews (
  id            BIGSERIAL PRIMARY KEY,
  branch_id     VARCHAR(50) REFERENCES branches(id) ON DELETE SET NULL,
  author_name   VARCHAR(150) NOT NULL,
  quote         TEXT NOT NULL,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  status        VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

-- 17. customers (Client Accounts)
CREATE TABLE customers (
  id          BIGSERIAL PRIMARY KEY,
  full_name   VARCHAR(150) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  phone       VARCHAR(50),
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. bookings (Appointments)
CREATE TABLE bookings (
  id              BIGSERIAL PRIMARY KEY,
  reference       VARCHAR(20) NOT NULL UNIQUE, -- e.g. LSA-9X4K2T
  customer_id     BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  branch_id       VARCHAR(50) NOT NULL REFERENCES branches(id),
  treatment_id    VARCHAR(50) REFERENCES treatments(id),
  package_id      VARCHAR(50) REFERENCES packages(id),
  specialist_id   VARCHAR(50) REFERENCES specialists(id),
  appointment_date DATE NOT NULL,
  start_time      TIME NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'completed'
  concerns        TEXT,
  source          VARCHAR(50) NOT NULL DEFAULT 'website', -- 'website' | 'phone' | 'walk-in'
  cancel_token    VARCHAR(64),
  cancelled_at    TIMESTAMPTZ,
  cancelled_reason TEXT,
  confirmed_at    TIMESTAMPTZ,
  confirmed_by_user_id BIGINT REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (treatment_id IS NOT NULL AND package_id IS NULL) OR
    (treatment_id IS NULL AND package_id IS NOT NULL)
  )
);

-- 19. booking_audit
CREATE TABLE booking_audit (
  id            BIGSERIAL PRIMARY KEY,
  booking_id    BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  actor_user_id BIGINT REFERENCES users(id),
  action        VARCHAR(50) NOT NULL, -- 'created'|'confirmed'|'rescheduled'|'cancelled'|'note_added'
  from_state    JSONB,
  to_state      JSONB,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. newsletter_subscribers
CREATE TABLE newsletter_subscribers (
  id          BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  status      VARCHAR(20) NOT NULL DEFAULT 'subscribed', -- 'subscribed' | 'unsubscribed'
  source      VARCHAR(50) DEFAULT 'footer',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 21. contact_inquiries
CREATE TABLE contact_inquiries (
  id            BIGSERIAL PRIMARY KEY,
  customer_id   BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  phone         VARCHAR(50),
  subject       VARCHAR(255) NOT NULL,
  message       TEXT NOT NULL,
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 22. product_inquiries
CREATE TABLE product_inquiries (
  id            BIGSERIAL PRIMARY KEY,
  customer_id   BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  product_id    BIGINT REFERENCES products(id) ON DELETE SET NULL,
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  phone         VARCHAR(50),
  message       TEXT,
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 23. site_settings (Bag of keys)
CREATE TABLE site_settings (
  key         VARCHAR(100) PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices for performance optimization
CREATE INDEX idx_treatments_published ON treatments(is_published) WHERE deleted_at IS NULL;
CREATE INDEX idx_packages_published ON packages(is_published) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_active ON products(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_branch_date ON bookings(branch_id, appointment_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_contact_email ON contact_inquiries(email);
