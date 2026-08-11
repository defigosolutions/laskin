--
-- PostgreSQL database dump
--

\restrict hzUKCHK687kHi2UZA9ZfIVl4L1j5vhavajUUSBGl9mxAmpF8UVQjgYT1vMz8yac

-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: before_after_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.before_after_cases (
    id character varying(50) NOT NULL,
    slug character varying(100) NOT NULL,
    title character varying(150) NOT NULL,
    subtitle character varying(255),
    treatment_id character varying(50),
    timeline_text character varying(100),
    primary_indications text,
    therapist_notes text,
    satisfaction_text character varying(50),
    age_profile character varying(50),
    before_image_url character varying(500) NOT NULL,
    after_image_url character varying(500) NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: booking_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking_audit (
    id bigint NOT NULL,
    booking_id bigint NOT NULL,
    actor_user_id bigint,
    action character varying(50) NOT NULL,
    from_state jsonb,
    to_state jsonb,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: booking_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.booking_audit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: booking_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.booking_audit_id_seq OWNED BY public.booking_audit.id;


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id bigint NOT NULL,
    reference character varying(20) NOT NULL,
    customer_id bigint NOT NULL,
    branch_id character varying(50) NOT NULL,
    treatment_id character varying(50),
    package_id character varying(50),
    specialist_id character varying(50),
    appointment_date date NOT NULL,
    start_time time without time zone NOT NULL,
    duration_minutes integer DEFAULT 60 NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    concerns text,
    source character varying(50) DEFAULT 'website'::character varying NOT NULL,
    cancel_token character varying(64),
    cancelled_at timestamp with time zone,
    cancelled_reason text,
    confirmed_at timestamp with time zone,
    confirmed_by_user_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT bookings_check CHECK ((((treatment_id IS NOT NULL) AND (package_id IS NULL)) OR ((treatment_id IS NULL) AND (package_id IS NOT NULL))))
);


--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bookings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: branch_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branch_hours (
    id bigint NOT NULL,
    branch_id character varying(50) NOT NULL,
    day_of_week smallint NOT NULL,
    is_closed boolean DEFAULT false NOT NULL,
    opens_at time without time zone,
    closes_at time without time zone,
    CONSTRAINT branch_hours_check CHECK ((is_closed OR ((opens_at IS NOT NULL) AND (closes_at IS NOT NULL)))),
    CONSTRAINT branch_hours_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6)))
);


--
-- Name: branch_hours_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.branch_hours_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: branch_hours_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.branch_hours_id_seq OWNED BY public.branch_hours.id;


--
-- Name: branch_time_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branch_time_slots (
    id bigint NOT NULL,
    branch_id character varying(50) NOT NULL,
    start_time time without time zone NOT NULL,
    label character varying(20) NOT NULL,
    capacity integer DEFAULT 1 NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: branch_time_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.branch_time_slots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: branch_time_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.branch_time_slots_id_seq OWNED BY public.branch_time_slots.id;


--
-- Name: branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branches (
    id character varying(50) NOT NULL,
    slug character varying(50) NOT NULL,
    city character varying(100) NOT NULL,
    display_name character varying(150) NOT NULL,
    address_line character varying(255) NOT NULL,
    phone character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    timezone character varying(64) DEFAULT 'America/New_York'::character varying NOT NULL,
    map_x character varying(10) DEFAULT '50%'::character varying,
    map_y character varying(10) DEFAULT '50%'::character varying,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id character varying(50) NOT NULL,
    slug character varying(50) NOT NULL,
    display_name character varying(100) NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: contact_inquiries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_inquiries (
    id bigint NOT NULL,
    customer_id bigint,
    full_name character varying(150) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    subject character varying(255) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contact_inquiries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_inquiries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contact_inquiries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_inquiries_id_seq OWNED BY public.contact_inquiries.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id bigint NOT NULL,
    full_name character varying(150) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    marketing_consent boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter_subscribers (
    id bigint NOT NULL,
    customer_id bigint,
    email character varying(255) NOT NULL,
    status character varying(20) DEFAULT 'subscribed'::character varying NOT NULL,
    source character varying(50) DEFAULT 'footer'::character varying,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.newsletter_subscribers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.newsletter_subscribers_id_seq OWNED BY public.newsletter_subscribers.id;


--
-- Name: package_inclusions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.package_inclusions (
    id bigint NOT NULL,
    package_id character varying(50) NOT NULL,
    "position" integer NOT NULL,
    description character varying(255) NOT NULL
);


--
-- Name: package_inclusions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.package_inclusions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: package_inclusions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.package_inclusions_id_seq OWNED BY public.package_inclusions.id;


--
-- Name: package_treatments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.package_treatments (
    package_id character varying(50) NOT NULL,
    treatment_id character varying(50) NOT NULL,
    "position" integer NOT NULL
);


--
-- Name: packages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.packages (
    id character varying(50) NOT NULL,
    slug character varying(100) NOT NULL,
    name character varying(150) NOT NULL,
    tagline character varying(255),
    price_cents integer NOT NULL,
    value_price_cents integer,
    currency character(3) DEFAULT 'USD'::bpchar NOT NULL,
    badge character varying(50),
    display_order integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: product_inquiries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_inquiries (
    id bigint NOT NULL,
    customer_id bigint,
    product_id bigint,
    full_name character varying(150) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    message text,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: product_inquiries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_inquiries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_inquiries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_inquiries_id_seq OWNED BY public.product_inquiries.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    slug character varying(100) NOT NULL,
    name character varying(150) NOT NULL,
    tagline character varying(255),
    price_cents integer NOT NULL,
    currency character(3) DEFAULT 'USD'::bpchar NOT NULL,
    image_url character varying(500),
    description text,
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id bigint NOT NULL,
    branch_id character varying(50),
    author_name character varying(150) NOT NULL,
    quote text NOT NULL,
    rating smallint NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    key character varying(100) NOT NULL,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: specialist_schedule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.specialist_schedule (
    id bigint NOT NULL,
    specialist_id character varying(50) NOT NULL,
    branch_id character varying(50) NOT NULL,
    date date NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    note character varying(255)
);


--
-- Name: specialist_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.specialist_schedule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: specialist_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.specialist_schedule_id_seq OWNED BY public.specialist_schedule.id;


--
-- Name: specialists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.specialists (
    id character varying(50) NOT NULL,
    slug character varying(100) NOT NULL,
    full_name character varying(150) NOT NULL,
    role character varying(150) NOT NULL,
    credential character varying(255),
    focus text,
    philosophy text,
    portrait_url character varying(500),
    user_id bigint,
    display_order integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: specialists_branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.specialists_branches (
    specialist_id character varying(50) NOT NULL,
    branch_id character varying(50) NOT NULL
);


--
-- Name: treatment_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.treatment_steps (
    id bigint NOT NULL,
    treatment_id character varying(50) NOT NULL,
    step_order integer NOT NULL,
    description text NOT NULL
);


--
-- Name: treatment_steps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.treatment_steps_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: treatment_steps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.treatment_steps_id_seq OWNED BY public.treatment_steps.id;


--
-- Name: treatments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.treatments (
    id character varying(50) NOT NULL,
    slug character varying(100) NOT NULL,
    name character varying(150) NOT NULL,
    tagline character varying(255),
    category_id character varying(50) NOT NULL,
    duration_minutes integer DEFAULT 60 NOT NULL,
    recovery_text character varying(100) DEFAULT 'Zero downtime'::character varying,
    price_cents integer NOT NULL,
    currency character(3) DEFAULT 'USD'::bpchar NOT NULL,
    image_url character varying(500),
    icon_key character varying(50) DEFAULT 'sparkles'::character varying,
    short_description text NOT NULL,
    scientific_text text,
    display_order integer DEFAULT 0 NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(150) NOT NULL,
    role character varying(50) DEFAULT 'super_admin'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: booking_audit id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_audit ALTER COLUMN id SET DEFAULT nextval('public.booking_audit_id_seq'::regclass);


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: branch_hours id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_hours ALTER COLUMN id SET DEFAULT nextval('public.branch_hours_id_seq'::regclass);


--
-- Name: branch_time_slots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_time_slots ALTER COLUMN id SET DEFAULT nextval('public.branch_time_slots_id_seq'::regclass);


--
-- Name: contact_inquiries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_inquiries ALTER COLUMN id SET DEFAULT nextval('public.contact_inquiries_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: newsletter_subscribers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers ALTER COLUMN id SET DEFAULT nextval('public.newsletter_subscribers_id_seq'::regclass);


--
-- Name: package_inclusions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_inclusions ALTER COLUMN id SET DEFAULT nextval('public.package_inclusions_id_seq'::regclass);


--
-- Name: product_inquiries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_inquiries ALTER COLUMN id SET DEFAULT nextval('public.product_inquiries_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: specialist_schedule id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_schedule ALTER COLUMN id SET DEFAULT nextval('public.specialist_schedule_id_seq'::regclass);


--
-- Name: treatment_steps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treatment_steps ALTER COLUMN id SET DEFAULT nextval('public.treatment_steps_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: before_after_cases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.before_after_cases (id, slug, title, subtitle, treatment_id, timeline_text, primary_indications, therapist_notes, satisfaction_text, age_profile, before_image_url, after_image_url, display_order, is_published, created_at, updated_at) FROM stdin;
case-1	case-1	Biocellular Skin Rejuvenation	Textural Correction & Micro-Needling	dermapen-vitaminas	3 Sessions (12 Weeks)	Dull epidermal tone, uneven skin texture, large pores	Dermapen micro-needling with vitamin cocktail applied. Patient showed significant cell turnover, shrinking pores and smoothing fine lines.	100% Client Rating	35 Years	/images/cases/biocellular-skin-rejuvenation-after.jpeg	/images/cases/biocellular-skin-rejuvenation-before.jpeg	1	t	2026-06-29 09:12:10.200779+00	2026-06-29 09:12:10.200779+00
case-2	case-2	Advanced Hydrafacial Glow	Deep Pore Congestion & Hydration Infusion	hydrafacial	1 Session (90 Mins)	Sebum congestion, blackheads, dry dull epidermal tone	Vortex vacuum extraction successfully cleared T-zone congestion. Followed by deep pneumatic hyaluronic acid infusion for an immediate high-gloss finish.	98% Client Rating	27 Years	/images/cases/advanced-hydrafacial-glow-after.jpeg	/images/cases/advanced-hydrafacial-glow-before.jpeg	2	t	2026-06-29 09:12:10.205304+00	2026-06-29 09:12:10.205304+00
\.


--
-- Data for Name: booking_audit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.booking_audit (id, booking_id, actor_user_id, action, from_state, to_state, note, created_at) FROM stdin;
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookings (id, reference, customer_id, branch_id, treatment_id, package_id, specialist_id, appointment_date, start_time, duration_minutes, status, concerns, source, cancel_token, cancelled_at, cancelled_reason, confirmed_at, confirmed_by_user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: branch_hours; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branch_hours (id, branch_id, day_of_week, is_closed, opens_at, closes_at) FROM stdin;
1	north-haven	0	t	\N	\N
2	north-haven	1	f	09:00:00	20:00:00
3	north-haven	2	f	09:00:00	20:00:00
4	north-haven	3	f	09:00:00	20:00:00
5	north-haven	4	f	09:00:00	20:00:00
6	north-haven	5	f	09:00:00	20:00:00
7	north-haven	6	f	09:00:00	20:00:00
\.


--
-- Data for Name: branch_time_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branch_time_slots (id, branch_id, start_time, label, capacity, display_order, is_active) FROM stdin;
1	north-haven	09:00:00	09:00 AM	2	1	t
2	north-haven	10:30:00	10:30 AM	2	2	t
3	north-haven	12:00:00	12:00 PM	2	3	t
4	north-haven	13:30:00	01:30 PM	2	4	t
5	north-haven	15:00:00	03:00 PM	2	5	t
6	north-haven	16:30:00	04:30 PM	2	6	t
7	north-haven	18:00:00	06:00 PM	2	7	t
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branches (id, slug, city, display_name, address_line, phone, email, timezone, map_x, map_y, display_order, is_active, created_at, updated_at) FROM stdin;
north-haven	north-haven	North Haven	North Haven Sanctuary	132 Middletown Ave Suite 10 North Haven, CT 06473	+1 (475) 209-6384	info@laskinclinic.com	America/New_York	50%	50%	1	t	2026-06-29 09:12:09.911362+00	2026-06-29 09:12:09.911362+00
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, slug, display_name, display_order, is_active) FROM stdin;
facials-skincare	facials-skincare	Facials & Skincare	1	t
laser-hair-removal	laser-hair-removal	Láser Hair Removal	2	t
advanced-treatments	advanced-treatments	Advanced Skin & Body	3	t
\.


--
-- Data for Name: contact_inquiries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_inquiries (id, customer_id, full_name, email, phone, subject, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, full_name, email, phone, marketing_consent, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.newsletter_subscribers (id, customer_id, email, status, source, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: package_inclusions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.package_inclusions (id, package_id, "position", description) FROM stdin;
1	facial-10	1	10 Custom clinical facial sessions matching your skin profile
2	facial-10	2	Combines mechanical pore purification and custom hydration infuses
3	facial-10	3	Personalized structural mapping by founder Laura Andrade
4	facial-10	4	Includes botanical soothing face lifting massages
5	bikini-10	1	10 Premium laser bikini hair removal sessions
6	bikini-10	2	Advanced cooling technology for maximum comfort
7	bikini-10	3	Permanent reduction of hair follicle growth
8	bikini-10	4	Safe for all skin types and profiles
9	brazilian-10	1	10 Complete laser Brazilian clearance sessions
10	brazilian-10	2	Precision treatment covering the entire area
11	brazilian-10	3	Advanced cooling technology for a painless experience
12	brazilian-10	4	Long-lasting, smooth and flawless skin results
13	underarms-10	1	10 Targeted laser underarm clearance sessions
14	underarms-10	2	Eliminates razor burn, ingrown hairs, and shadows
15	underarms-10	3	Quick and comfortable sessions with minimal downtime
16	underarms-10	4	Permanent hair reduction for smooth underarms
17	bleaching-5	1	5 Specialized sessions for axillary or intimate bleaching
18	bleaching-5	2	Gentle, medical-grade brightening formulations
19	bleaching-5	3	Targeted treatment to reduce hyperpigmentation and dark spots
20	bleaching-5	4	Evens out skin tone for a flawless, natural appearance
21	double-chin-5	1	5 Advanced chin tightening and sculpting sessions
22	double-chin-5	2	Non-invasive fat reduction and skin firming technology
23	double-chin-5	3	Defines jawline and improves structural facial profile
24	double-chin-5	4	Stimulates natural collagen production for lasting lift
\.


--
-- Data for Name: package_treatments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.package_treatments (package_id, treatment_id, "position") FROM stdin;
\.


--
-- Data for Name: packages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.packages (id, slug, name, tagline, price_cents, value_price_cents, currency, badge, display_order, is_published, created_at, updated_at, deleted_at) FROM stdin;
facial-10	facial-10	Facial 10 Sesiones	10-Session Clinical Facial Journey	70000	90000	USD	Best Value	1	t	2026-06-29 09:12:10.049626+00	2026-06-29 09:12:10.049626+00	\N
bikini-10	bikini-10	Bikini 10 Sesiones	10-Session Laser Bikini Clearance	75000	95000	USD	\N	2	t	2026-06-29 09:12:10.053447+00	2026-06-29 09:12:10.053447+00	\N
brazilian-10	brazilian-10	Brazilian 10 Sesiones	10-Session Complete Laser Brazilian	80000	110000	USD	Popular Choice	3	t	2026-06-29 09:12:10.056898+00	2026-06-29 09:12:10.056898+00	\N
underarms-10	underarms-10	Underarms (Axilas) 10 Sesiones	10-Session Underarm Laser Journey	40000	50000	USD	\N	4	t	2026-06-29 09:12:10.060097+00	2026-06-29 09:12:10.060097+00	\N
bleaching-5	bleaching-5	Blanqueamiento 5 Sesiones	5-Session Axillary / Intimate Bleaching	40000	50000	USD	\N	5	t	2026-06-29 09:12:10.063915+00	2026-06-29 09:12:10.063915+00	\N
double-chin-5	double-chin-5	Double Chin (Papada) 5 Sessions	5-Session Chin Tightening Package	40000	50000	USD	\N	6	t	2026-06-29 09:12:10.067949+00	2026-06-29 09:12:10.067949+00	\N
\.


--
-- Data for Name: product_inquiries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_inquiries (id, customer_id, product_id, full_name, email, phone, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, slug, name, tagline, price_cents, currency, image_url, description, display_order, is_active, created_at, updated_at, deleted_at) FROM stdin;
1	luminous-silk-cleanser	Luminous Silk Cleanser	Cleanser	5500	USD	/product_images/WhatsApp Image 2026-06-13 at 7.55.40 AM.jpeg	A silky, low-foaming medical cleanser infused with botanical extracts that removes impurities while respecting the skin barrier.	1	t	2026-06-29 09:12:10.159216+00	2026-06-29 09:12:10.159216+00	\N
2	cellular-hydration-serum	Cellular Hydration Serum	Serum	8500	USD	/product_images/WhatsApp Image 2026-06-13 at 7.55.41 AM (1).jpeg	A multi-weight hyaluronic acid serum designed to lock in deep hydration at the cellular level for a plump, glowing finish.	2	t	2026-06-29 09:12:10.163467+00	2026-06-29 09:12:10.163467+00	\N
3	restorative-barrier-cream	Restorative Barrier Cream	Moisturizer	9000	USD	/product_images/WhatsApp Image 2026-06-13 at 7.55.41 AM (2).jpeg	Intensive repair cream formulated with ceramides and clinical peptides to strengthen, soothe, and recover post-treatment skin.	3	t	2026-06-29 09:12:10.167433+00	2026-06-29 09:12:10.167433+00	\N
4	radiance-retinol-treatment	Radiance Retinol Treatment	Treatment	11000	USD	/product_images/WhatsApp Image 2026-06-13 at 7.55.41 AM (3).jpeg	Micro-encapsulated slow-release retinol that refines skin texture, accelerates cell turn-over, and diminishes fine lines.	4	t	2026-06-29 09:12:10.170496+00	2026-06-29 09:12:10.170496+00	\N
5	vitamin-c-glow-concentrate	Vitamin C Glow Concentrate	Serum	9500	USD	/product_images/WhatsApp Image 2026-06-13 at 7.55.41 AM (4).jpeg	Potent 15% L-Ascorbic Acid serum with Ferulic Acid to neutralize environmental free radicals and brighten uneven pigment.	5	t	2026-06-29 09:12:10.173583+00	2026-06-29 09:12:10.173583+00	\N
6	mineral-shield-spf-50	Mineral Shield SPF 50	Protection	4800	USD	/product_images/WhatsApp Image 2026-06-13 at 7.55.41 AM (5).jpeg	A lightweight, tinted physical sunscreen offering broad-spectrum protection with a flawless, dewy, non-greasy texture.	6	t	2026-06-29 09:12:10.17709+00	2026-06-29 09:12:10.17709+00	\N
7	absolute-eye-lift-gel	Absolute Eye Lift Gel	Eye Care	7500	USD	/product_images/WhatsApp Image 2026-06-13 at 7.55.41 AM.jpeg	Cooling peptide eye gel designed to drain puffiness, reduce dark circles, and lift structural lines around the orbital area.	7	t	2026-06-29 09:12:10.180757+00	2026-06-29 09:12:10.180757+00	\N
8	smoothing-exfoliating-polish	Smoothing Exfoliating Polish	Exfoliator	5000	USD	/product_images/WhatsApp Image 2026-06-13 at 7.55.42 AM (1).jpeg	Fine micro-polishing clinical scrub utilizing salicylic acid and quartz crystals to sweep away superficial build-up.	8	t	2026-06-29 09:12:10.184075+00	2026-06-29 09:12:10.184075+00	\N
9	clarifying-salicylic-elixir	Clarifying Salicylic Elixir	Treatment	6500	USD	/product_images/WhatsApp Image 2026-06-13 at 7.55.42 AM.jpeg	Targeted BHA toner that penetrates deep into pores to dissolve sebum, clear blackheads, and prevent active breakouts.	9	t	2026-06-29 09:12:10.187526+00	2026-06-29 09:12:10.187526+00	\N
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, branch_id, author_name, quote, rating, status, is_featured, display_order, created_at, updated_at, deleted_at) FROM stdin;
1	north-haven	Beatrice V.	The most outstanding skin results I have ever experienced. After just one Hydrafacial session with Laura Andrade, my skin looked incredibly plump, clear, and radiant. The private attention and luxury care are completely unparalleled.	5	approved	t	1	2026-06-29 09:12:10.208088+00	2026-06-29 09:12:10.208088+00	\N
2	north-haven	Charlotte R.	Laura Andrade's bespoke treatment mapping is a miracle. She analyzed my skin structure at the cellular level and designed a microneedling timeline that completely swept away years of sun damage. The clinic is exceptional.	5	approved	t	2	2026-06-29 09:12:10.212827+00	2026-06-29 09:12:10.212827+00	\N
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_settings (key, value, updated_at) FROM stdin;
settings.analytics	{"ga4_id": "G-XXXXXXXXXX", "gsc_code": "google-search-console-verification", "footer_scripts": "<!-- Custom Footer Scripts -->", "header_scripts": "<!-- Custom Header Scripts -->"}	2026-06-29 09:12:10.217591+00
settings.smtp	{"host": "smtp.gmail.com", "port": 587, "password": "", "username": "", "encryption": "TLS", "sender_name": "LA Skin Concierge", "sender_email": "concierge@laskinclinic.com"}	2026-06-29 09:12:10.221776+00
settings.branding	{"logo_url": "/logo.jpeg", "hero_stats": {"clients_served": 15000, "satisfaction_pct": 99, "specialists_count": 1}, "favicon_url": "/favicon.ico"}	2026-06-29 09:12:10.22554+00
settings.contact	{"email": "info@laskinclinic.com", "phone": "+1 (475) 209-6384", "address": "132 Middletown Ave Suite 10 North Haven, CT 06473", "twitter_url": "", "facebook_url": "https://facebook.com/laskin", "instagram_url": "https://instagram.com/laskin"}	2026-06-29 09:12:10.229324+00
settings.maintenance	{"maintenance_mode": false}	2026-06-29 09:12:10.232301+00
settings.seo_routes	[{"path": "/", "title": "LA Skin & Aesthetics | Luxury Medical Spa in North Haven, CT", "keywords": "skin clinic, luxury spa, beauty treatments, hydrafacial, laser hair removal, anti-aging, LA Skin and Aesthetics, North Haven CT, Laura Andrade", "description": "Premium luxury medical spa and aesthetics clinic in North Haven, CT, offering Hydrafacials, Laser Hair Removal, and advanced skincare treatments."}, {"path": "/products", "title": "Luxury Online Boutique | LA Skin & Aesthetics", "keywords": "skincare products, luxury skin cream, hydrafacial serums, anti-aging serums, LA Skin boutique", "description": "Explore our premium selection of clinical skincare formulations and luxury aesthetics products at LA Skin & Aesthetics."}]	2026-06-29 09:12:10.236561+00
\.


--
-- Data for Name: specialist_schedule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.specialist_schedule (id, specialist_id, branch_id, date, is_available, note) FROM stdin;
\.


--
-- Data for Name: specialists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.specialists (id, slug, full_name, role, credential, focus, philosophy, portrait_url, user_id, display_order, is_published, created_at, updated_at, deleted_at) FROM stdin;
laura-andrade	laura-andrade	Laura Andrade	Founder & Lead Medical Specialist	13+ Years of Aesthetics Expertise	Advanced skincare, facial rejuvenation, holistic wellness, biocellular therapies	Beauty begins with healthy skin and self-confidence. My approach combines professional expertise with personalized attention, ensuring natural-looking, elegant results.	/laura.jpeg	\N	1	t	2026-06-29 09:12:10.191189+00	2026-06-29 09:12:10.191189+00	\N
\.


--
-- Data for Name: specialists_branches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.specialists_branches (specialist_id, branch_id) FROM stdin;
laura-andrade	north-haven
\.


--
-- Data for Name: treatment_steps; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.treatment_steps (id, treatment_id, step_order, description) FROM stdin;
1	hydrafacial	1	Clinical double cleansing and skin analysis.
2	hydrafacial	2	Vortex mechanical exfoliation to lift away dead cells.
3	hydrafacial	3	Gentle acid peel overlay to dissolve pore impurities.
4	hydrafacial	4	Pneumatic blackhead extraction and vacuum purging.
5	hydrafacial	5	Deep nourishing hydration infusion filled with peptides and antioxidants.
6	hydrafacial	6	Clinical LED light therapy to lock in nutrients.
\.


--
-- Data for Name: treatments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.treatments (id, slug, name, tagline, category_id, duration_minutes, recovery_text, price_cents, currency, image_url, icon_key, short_description, scientific_text, display_order, is_published, created_at, updated_at, deleted_at) FROM stdin;
hydrafacial	hydrafacial	Hydrafacial	Deep Vortex Exfoliation & Hydration	facials-skincare	90	Zero downtime	14000	USD	/images/treatments/hydrafacial.jpeg	droplet	Our premium medical-grade facial skin treatment. Cleanses, extracts impurities, and hydrates using exclusive nourishing super-serums filled with antioxidants and peptides.	\N	1	t	2026-06-29 09:12:09.983967+00	2026-06-29 09:12:09.983967+00	\N
basic-facial	basic-facial	Basic Facial Cleansing	Limpieza Facial Básica	facials-skincare	45	Zero downtime	7500	USD	https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop	sparkles	An essential facial treatment designed to purify the skin, clear congested pores, and restore a healthy, balanced epidermal barrier.	\N	2	t	2026-06-29 09:12:09.987368+00	2026-06-29 09:12:09.987368+00	\N
radio-frequency	radio-frequency	Radio Frequency	Non-Surgical Collagen Stimulation	facials-skincare	30	Minimal redness	5000	USD	/images/treatments/radio-frequency.jpeg	zap	Utilizes radiofrequency energy to gently heat dermal layers, promoting immediate collagen contraction and stimulating long-term skin tightening.	\N	3	t	2026-06-29 09:12:09.989272+00	2026-06-29 09:12:09.989272+00	\N
ultrasonic	ultrasonic	Ultrasonic Facial	Deep Cellular Cleansing & Lift	facials-skincare	30	Zero downtime	5000	USD	/images/treatments/ultrasonic.jpeg	shield	High-frequency ultrasonic waves clear dead skin cells and impurities, encouraging cellular renewal and optimal skin barrier nutrient absorption.	\N	4	t	2026-06-29 09:12:09.992155+00	2026-06-29 09:12:09.992155+00	\N
dermabrasion	dermabrasion	Dermabrasion	Advanced Resurfacing Treatment	facials-skincare	40	1 - 2 Days slight pinkness	6000	USD	/images/treatments/dermabrasion.jpeg	sun	Gently exfoliates the superficial layer of dead skin cells to smooth uneven texture, reduce light acne scarring, and stimulate healthy fresh cell turn-over.	\N	5	t	2026-06-29 09:12:09.99424+00	2026-06-29 09:12:09.99424+00	\N
anti-aging	anti-aging	Anti-Aging Treatments	Bespoke Cellular Restoration	facials-skincare	60	Zero downtime	15000	USD	/images/treatments/anti-aging.jpeg	shield	Bespoke clinical therapies targeting fine lines, wrinkles, and volume loss. Promotes skin elasticity and activates structural dermal healing.	\N	6	t	2026-06-29 09:12:09.996912+00	2026-06-29 09:12:09.996912+00	\N
hydralips	hydralips	Hydralips	Intensive Lip Plumping & Hydration	facials-skincare	45	Zero downtime	7500	USD	/images/treatments/hydralips.jpeg	heart	Deep hydration and micro-infusion treatment for dry or cracked lips, providing a subtle plumping effect and a soft, glowing rosy texture.	\N	7	t	2026-06-29 09:12:10.000881+00	2026-06-29 09:12:10.000881+00	\N
laser-hair-removal-single	laser-hair-removal-single	Láser Hair Removal (Single Session)	FDA-Approved Precision Laser	laser-hair-removal	30	Zero downtime	40000	USD	/images/treatments/laser-hair-removal-single.jpeg	zap	Safe, premium laser hair removal treatment utilizing advanced cooling technology to ensure maximum client comfort and long-term hair follicle clearance.	\N	8	t	2026-06-29 09:12:10.004822+00	2026-06-29 09:12:10.004822+00	\N
prp	prp	PRP (Platelet-Rich Plasma)	Autologous Cellular Regeneration	advanced-treatments	60	1 Day slight redness	15000	USD	/images/treatments/prp.jpeg	droplet	Utilizes growth factors isolated from your own blood plasma to stimulate rapid cellular regeneration, collagen synthesis, and deep tissue recovery.	\N	9	t	2026-06-29 09:12:10.008369+00	2026-06-29 09:12:10.008369+00	\N
dermapen-vitaminas	dermapen-vitaminas	Dermapen con Vitaminas	Vitamin-Infused Collagen Induction	advanced-treatments	45	1 - 2 Days sensitivity	10000	USD	/images/treatments/dermapen-vitaminas.jpeg	sparkles	Advanced micro-needling treatment that creates tiny micro-channels in the skin to inject a custom cocktail of vitamins, hyaluronic acid, and peptides.	\N	10	t	2026-06-29 09:12:10.012082+00	2026-06-29 09:12:10.012082+00	\N
peelings	peelings	Peelings Químicos	Clinical Chemical Resurfacing	advanced-treatments	45	3 - 5 Days light peeling	10000	USD	/images/treatments/peelings.jpeg	sun	Professional chemical peels targeting hyperpigmentation, active acne, and superficial scarring to reveal a smoother, highly even skin tone.	\N	11	t	2026-06-29 09:12:10.015353+00	2026-06-29 09:12:10.015353+00	\N
exosomas	exosomas	Tratamiento con Exosomas	Premium Biocellular Repair	advanced-treatments	60	Zero downtime	18000	USD	/images/treatments/exosomas.jpeg	shield	Cutting-edge therapy utilizing purified stem-cell derived exosomes to deliver massive cellular signals for collagen stimulation and anti-aging repair.	\N	12	t	2026-06-29 09:12:10.01842+00	2026-06-29 09:12:10.01842+00	\N
drainage	drainage	Drenaje Linfático Post Quirúrgico	Post-Surgery Lymphatic Recovery	advanced-treatments	60	Immediate relief	9000	USD	/images/treatments/drainage.jpeg	heart	Specialized, gentle massage technique designed to accelerate fluid drainage, reduce clinical swelling, and promote healthy post-surgical healing.	\N	13	t	2026-06-29 09:12:10.021755+00	2026-06-29 09:12:10.021755+00	\N
massage-relax	massage-relax	Relax Massage	Luxury Stress-Relieving Therapy	advanced-treatments	45	Zero downtime	6000	USD	/images/treatments/massage-relax.jpeg	heart	A soothing therapeutic back massage designed to melt away muscular tension, lower cortisol levels, and restore absolute peace.	\N	14	t	2026-06-29 09:12:10.025177+00	2026-06-29 09:12:10.025177+00	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, full_name, role, is_active, created_at, updated_at) FROM stdin;
1	admin@laskin.com	$2a$10$DnpsPnBIY8g2lOL8GL9rB.n8LsjB2YTuc9oWNt.P0/O6JD8X2bNMi	Laura Andrade	super_admin	t	2026-06-29 09:12:09.904332+00	2026-06-29 09:12:09.904332+00
\.


--
-- Name: booking_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.booking_audit_id_seq', 1, false);


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bookings_id_seq', 1, false);


--
-- Name: branch_hours_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.branch_hours_id_seq', 7, true);


--
-- Name: branch_time_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.branch_time_slots_id_seq', 7, true);


--
-- Name: contact_inquiries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contact_inquiries_id_seq', 1, false);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customers_id_seq', 1, false);


--
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.newsletter_subscribers_id_seq', 1, false);


--
-- Name: package_inclusions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.package_inclusions_id_seq', 24, true);


--
-- Name: product_inquiries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_inquiries_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 9, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_id_seq', 2, true);


--
-- Name: specialist_schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.specialist_schedule_id_seq', 1, false);


--
-- Name: treatment_steps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.treatment_steps_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: before_after_cases before_after_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.before_after_cases
    ADD CONSTRAINT before_after_cases_pkey PRIMARY KEY (id);


--
-- Name: before_after_cases before_after_cases_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.before_after_cases
    ADD CONSTRAINT before_after_cases_slug_key UNIQUE (slug);


--
-- Name: booking_audit booking_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_audit
    ADD CONSTRAINT booking_audit_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_reference_key UNIQUE (reference);


--
-- Name: branch_hours branch_hours_branch_id_day_of_week_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_hours
    ADD CONSTRAINT branch_hours_branch_id_day_of_week_key UNIQUE (branch_id, day_of_week);


--
-- Name: branch_hours branch_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_hours
    ADD CONSTRAINT branch_hours_pkey PRIMARY KEY (id);


--
-- Name: branch_time_slots branch_time_slots_branch_id_start_time_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_time_slots
    ADD CONSTRAINT branch_time_slots_branch_id_start_time_key UNIQUE (branch_id, start_time);


--
-- Name: branch_time_slots branch_time_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_time_slots
    ADD CONSTRAINT branch_time_slots_pkey PRIMARY KEY (id);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: branches branches_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_slug_key UNIQUE (slug);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: contact_inquiries contact_inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_inquiries
    ADD CONSTRAINT contact_inquiries_pkey PRIMARY KEY (id);


--
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscribers newsletter_subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: package_inclusions package_inclusions_package_id_position_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_inclusions
    ADD CONSTRAINT package_inclusions_package_id_position_key UNIQUE (package_id, "position");


--
-- Name: package_inclusions package_inclusions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_inclusions
    ADD CONSTRAINT package_inclusions_pkey PRIMARY KEY (id);


--
-- Name: package_treatments package_treatments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_treatments
    ADD CONSTRAINT package_treatments_pkey PRIMARY KEY (package_id, treatment_id);


--
-- Name: packages packages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_pkey PRIMARY KEY (id);


--
-- Name: packages packages_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_slug_key UNIQUE (slug);


--
-- Name: product_inquiries product_inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_inquiries
    ADD CONSTRAINT product_inquiries_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key UNIQUE (slug);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (key);


--
-- Name: specialist_schedule specialist_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_schedule
    ADD CONSTRAINT specialist_schedule_pkey PRIMARY KEY (id);


--
-- Name: specialist_schedule specialist_schedule_specialist_id_branch_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_schedule
    ADD CONSTRAINT specialist_schedule_specialist_id_branch_id_date_key UNIQUE (specialist_id, branch_id, date);


--
-- Name: specialists_branches specialists_branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialists_branches
    ADD CONSTRAINT specialists_branches_pkey PRIMARY KEY (specialist_id, branch_id);


--
-- Name: specialists specialists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialists
    ADD CONSTRAINT specialists_pkey PRIMARY KEY (id);


--
-- Name: specialists specialists_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialists
    ADD CONSTRAINT specialists_slug_key UNIQUE (slug);


--
-- Name: treatment_steps treatment_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treatment_steps
    ADD CONSTRAINT treatment_steps_pkey PRIMARY KEY (id);


--
-- Name: treatment_steps treatment_steps_treatment_id_step_order_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treatment_steps
    ADD CONSTRAINT treatment_steps_treatment_id_step_order_key UNIQUE (treatment_id, step_order);


--
-- Name: treatments treatments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treatments
    ADD CONSTRAINT treatments_pkey PRIMARY KEY (id);


--
-- Name: treatments treatments_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treatments
    ADD CONSTRAINT treatments_slug_key UNIQUE (slug);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_bookings_branch_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_branch_date ON public.bookings USING btree (branch_id, appointment_date);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- Name: idx_contact_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_email ON public.contact_inquiries USING btree (email);


--
-- Name: idx_customers_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_email ON public.customers USING btree (email);


--
-- Name: idx_newsletter_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers USING btree (email);


--
-- Name: idx_packages_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_packages_published ON public.packages USING btree (is_published) WHERE (deleted_at IS NULL);


--
-- Name: idx_products_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_active ON public.products USING btree (is_active) WHERE (deleted_at IS NULL);


--
-- Name: idx_treatments_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_treatments_published ON public.treatments USING btree (is_published) WHERE (deleted_at IS NULL);


--
-- Name: before_after_cases before_after_cases_treatment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.before_after_cases
    ADD CONSTRAINT before_after_cases_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES public.treatments(id) ON DELETE SET NULL;


--
-- Name: booking_audit booking_audit_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_audit
    ADD CONSTRAINT booking_audit_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(id);


--
-- Name: booking_audit booking_audit_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking_audit
    ADD CONSTRAINT booking_audit_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: bookings bookings_confirmed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_confirmed_by_user_id_fkey FOREIGN KEY (confirmed_by_user_id) REFERENCES public.users(id);


--
-- Name: bookings bookings_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id);


--
-- Name: bookings bookings_specialist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_specialist_id_fkey FOREIGN KEY (specialist_id) REFERENCES public.specialists(id);


--
-- Name: bookings bookings_treatment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES public.treatments(id);


--
-- Name: branch_hours branch_hours_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_hours
    ADD CONSTRAINT branch_hours_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: branch_time_slots branch_time_slots_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_time_slots
    ADD CONSTRAINT branch_time_slots_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: contact_inquiries contact_inquiries_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_inquiries
    ADD CONSTRAINT contact_inquiries_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: newsletter_subscribers newsletter_subscribers_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: package_inclusions package_inclusions_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_inclusions
    ADD CONSTRAINT package_inclusions_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE CASCADE;


--
-- Name: package_treatments package_treatments_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_treatments
    ADD CONSTRAINT package_treatments_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE CASCADE;


--
-- Name: package_treatments package_treatments_treatment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.package_treatments
    ADD CONSTRAINT package_treatments_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES public.treatments(id) ON DELETE RESTRICT;


--
-- Name: product_inquiries product_inquiries_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_inquiries
    ADD CONSTRAINT product_inquiries_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: product_inquiries product_inquiries_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_inquiries
    ADD CONSTRAINT product_inquiries_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;


--
-- Name: specialist_schedule specialist_schedule_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_schedule
    ADD CONSTRAINT specialist_schedule_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: specialist_schedule specialist_schedule_specialist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialist_schedule
    ADD CONSTRAINT specialist_schedule_specialist_id_fkey FOREIGN KEY (specialist_id) REFERENCES public.specialists(id) ON DELETE CASCADE;


--
-- Name: specialists_branches specialists_branches_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialists_branches
    ADD CONSTRAINT specialists_branches_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: specialists_branches specialists_branches_specialist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialists_branches
    ADD CONSTRAINT specialists_branches_specialist_id_fkey FOREIGN KEY (specialist_id) REFERENCES public.specialists(id) ON DELETE CASCADE;


--
-- Name: specialists specialists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specialists
    ADD CONSTRAINT specialists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: treatment_steps treatment_steps_treatment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treatment_steps
    ADD CONSTRAINT treatment_steps_treatment_id_fkey FOREIGN KEY (treatment_id) REFERENCES public.treatments(id) ON DELETE CASCADE;


--
-- Name: treatments treatments_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.treatments
    ADD CONSTRAINT treatments_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict hzUKCHK687kHi2UZA9ZfIVl4L1j5vhavajUUSBGl9mxAmpF8UVQjgYT1vMz8yac

