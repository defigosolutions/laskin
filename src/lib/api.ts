import axios from 'axios'
import type { 
  Treatment, 
  Package, 
  Specialist, 
  Branch, 
  Category, 
  BeforeAfter, 
  BeforeAfterCase,
  Review, 
  Booking 
} from '../types'

// Keep a dummy client in case any other code imports it
export const publicApiClient = axios.create({
  baseURL: 'https://booksy.com/en-us/1467369_la-skin-aesthetics_skin-care_15431_north-haven',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Mock Categories based on actual Booksy sections
const MOCK_CATEGORIES: Category[] = [
  { id: 'facials-skincare', slug: 'facials-skincare', displayName: 'Facials & Skincare', displayOrder: 1, isActive: true },
  { id: 'laser-hair-removal', slug: 'laser-hair-removal', displayName: 'Láser Hair Removal', displayOrder: 2, isActive: true },
  { id: 'advanced-treatments', slug: 'advanced-treatments', displayName: 'Advanced Skin & Body', displayOrder: 3, isActive: true }
]

// Mock Treatments based on laskinaesthetics19.booksy.com
const MOCK_TREATMENTS: Treatment[] = [
  // Facials & Skincare
  {
    id: 'hydrafacial',
    slug: 'hydrafacial',
    name: 'Hydrafacial',
    tagline: 'Deep Vortex Exfoliation & Hydration',
    categoryId: 'facials-skincare',
    durationMinutes: 90,
    recoveryText: 'Zero downtime',
    priceCents: 14000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop',
    iconKey: 'droplet',
    shortDescription: 'Our premium medical-grade facial skin treatment. Cleanses, extracts impurities, and hydrates using exclusive nourishing super-serums filled with antioxidants and peptides.',
    displayOrder: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'facials-skincare', name: 'Facials & Skincare' } as any,
  },
  {
    id: 'basic-facial',
    slug: 'basic-facial',
    name: 'Basic Facial Cleansing',
    tagline: 'Limpieza Facial Básica',
    categoryId: 'facials-skincare',
    durationMinutes: 45,
    recoveryText: 'Zero downtime',
    priceCents: 7500,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop',
    iconKey: 'sparkles',
    shortDescription: 'An essential facial treatment designed to purify the skin, clear congested pores, and restore a healthy, balanced epidermal barrier.',
    displayOrder: 2,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'facials-skincare', name: 'Facials & Skincare' } as any,
  },
  {
    id: 'radio-frequency',
    slug: 'radio-frequency',
    name: 'Radio Frequency',
    tagline: 'Non-Surgical Collagen Stimulation',
    categoryId: 'facials-skincare',
    durationMinutes: 30,
    recoveryText: 'Minimal redness',
    priceCents: 5000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop',
    iconKey: 'zap',
    shortDescription: 'Utilizes radiofrequency energy to gently heat dermal layers, promoting immediate collagen contraction and stimulating long-term skin tightening.',
    displayOrder: 3,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'facials-skincare', name: 'Facials & Skincare' } as any,
  },
  {
    id: 'ultrasonic',
    slug: 'ultrasonic',
    name: 'Ultrasonic Facial',
    tagline: 'Deep Cellular Cleansing & Lift',
    categoryId: 'facials-skincare',
    durationMinutes: 30,
    recoveryText: 'Zero downtime',
    priceCents: 5000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
    iconKey: 'shield',
    shortDescription: 'High-frequency ultrasonic waves clear dead skin cells and impurities, encouraging cellular renewal and optimal skin barrier nutrient absorption.',
    displayOrder: 4,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'facials-skincare', name: 'Facials & Skincare' } as any,
  },
  {
    id: 'dermabrasion',
    slug: 'dermabrasion',
    name: 'Dermabrasion',
    tagline: 'Advanced Resurfacing Treatment',
    categoryId: 'facials-skincare',
    durationMinutes: 40,
    recoveryText: '1 - 2 Days slight pinkness',
    priceCents: 6000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=600&auto=format&fit=crop',
    iconKey: 'sun',
    shortDescription: 'Gently exfoliates the superficial layer of dead skin cells to smooth uneven texture, reduce light acne scarring, and stimulate healthy fresh cell turn-over.',
    displayOrder: 5,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'facials-skincare', name: 'Facials & Skincare' } as any,
  },
  {
    id: 'anti-aging',
    slug: 'anti-aging',
    name: 'Anti-Aging Treatments',
    tagline: 'Bespoke Cellular Restoration',
    categoryId: 'facials-skincare',
    durationMinutes: 60,
    recoveryText: 'Zero downtime',
    priceCents: 15000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop',
    iconKey: 'shield',
    shortDescription: 'Bespoke clinical therapies targeting fine lines, wrinkles, and volume loss. Promotes skin elasticity and activates structural dermal healing.',
    displayOrder: 6,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'facials-skincare', name: 'Facials & Skincare' } as any,
  },
  {
    id: 'hydralips',
    slug: 'hydralips',
    name: 'Hydralips',
    tagline: 'Intensive Lip Plumping & Hydration',
    categoryId: 'facials-skincare',
    durationMinutes: 45,
    recoveryText: 'Zero downtime',
    priceCents: 7500,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=600&auto=format&fit=crop',
    iconKey: 'heart',
    shortDescription: 'Deep hydration and micro-infusion treatment for dry or cracked lips, providing a subtle plumping effect and a soft, glowing rosy texture.',
    displayOrder: 7,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'facials-skincare', name: 'Facials & Skincare' } as any,
  },

  // Laser Hair Removal
  {
    id: 'laser-hair-removal-single',
    slug: 'laser-hair-removal-single',
    name: 'Láser Hair Removal (Single Session)',
    tagline: 'FDA-Approved Precision Laser',
    categoryId: 'laser-hair-removal',
    durationMinutes: 30,
    recoveryText: 'Zero downtime',
    priceCents: 40000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=600&auto=format&fit=crop',
    iconKey: 'zap',
    shortDescription: 'Safe, premium laser hair removal treatment utilizing advanced cooling technology to ensure maximum client comfort and long-term hair follicle clearance.',
    displayOrder: 8,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'laser-hair-removal', name: 'Láser Hair Removal' } as any,
  },

  // Advanced Skin & Body Treatments
  {
    id: 'prp',
    slug: 'prp',
    name: 'PRP (Platelet-Rich Plasma)',
    tagline: 'Autologous Cellular Regeneration',
    categoryId: 'advanced-treatments',
    durationMinutes: 60,
    recoveryText: '1 - 2 Days slight swelling',
    priceCents: 15000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop',
    iconKey: 'droplet',
    shortDescription: 'Leverages the natural growth factors from your own plasma to stimulate cellular regeneration, improve skin texture, and restore volume. Includes basic facial.',
    displayOrder: 9,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'advanced-treatments', name: 'Advanced Skin & Body' } as any,
  },
  {
    id: 'prp-capilar',
    slug: 'prp-capilar',
    name: 'PRP Capilar (Dermclar)',
    tagline: 'Hair Growth Stimulation',
    categoryId: 'advanced-treatments',
    durationMinutes: 60,
    recoveryText: 'Zero downtime',
    priceCents: 15000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop',
    iconKey: 'droplet',
    shortDescription: 'Advanced clinical therapy applying Platelet-Rich Plasma alongside Dermclar active nutrients directly to the scalp to encourage healthy hair follicle regrowth.',
    displayOrder: 10,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'advanced-treatments', name: 'Advanced Skin & Body' } as any,
  },
  {
    id: 'dermapen-vitaminas',
    slug: 'dermapen-vitaminas',
    name: 'Dermapen con Vitaminas',
    tagline: 'Advanced Microneedling & Infusion',
    categoryId: 'advanced-treatments',
    durationMinutes: 60,
    recoveryText: '1 - 2 Days mild flaking',
    priceCents: 9500,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=600&auto=format&fit=crop',
    iconKey: 'sparkles',
    shortDescription: 'Precision clinical microneedling therapy infusing essential dermal vitamins and peptides deep into the skin to refine texture, shrink pores, and restore a youthful glow.',
    displayOrder: 11,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'advanced-treatments', name: 'Advanced Skin & Body' } as any,
  },
  {
    id: 'dermamela',
    slug: 'dermamela',
    name: 'DermaMela',
    tagline: 'Intensive Pigment Correction',
    categoryId: 'advanced-treatments',
    durationMinutes: 40,
    recoveryText: '3 - 5 Days peeling',
    priceCents: 18000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop',
    iconKey: 'sun',
    shortDescription: 'A highly effective dermatological depigmentation treatment designed to clear melasma, sunspots, and deep hyperpigmentation.',
    displayOrder: 12,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'advanced-treatments', name: 'Advanced Skin & Body' } as any,
  },
  {
    id: 'neuromoduladores',
    slug: 'neuromoduladores',
    name: 'Neuromoduladores',
    tagline: 'Anti-Wrinkle Zone Smoothing',
    categoryId: 'advanced-treatments',
    durationMinutes: 30,
    recoveryText: 'Minimal downtime',
    priceCents: 40000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop',
    iconKey: 'shield',
    shortDescription: 'Smoothing treatment for aesthetic zones (frown lines, forehead, crow\'s feet) using highly purified neuromodulators for natural-looking expressions.',
    displayOrder: 13,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'advanced-treatments', name: 'Advanced Skin & Body' } as any,
  },
  {
    id: 'hollywood-peel',
    slug: 'hollywood-peel',
    name: 'Hollywood Peel',
    tagline: 'Instant Carbon Laser Glow',
    categoryId: 'advanced-treatments',
    durationMinutes: 60,
    recoveryText: 'Zero downtime',
    priceCents: 15000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop',
    iconKey: 'sun',
    shortDescription: 'Carbon-assisted laser peel that deeply purifies pores, improves skin tone, and delivers an immediate radiant "glow" effect. Includes basic facial.',
    displayOrder: 14,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'advanced-treatments', name: 'Advanced Skin & Body' } as any,
  },
  {
    id: 'ultherapy',
    slug: 'ultherapy',
    name: 'Ultherapy',
    tagline: 'Non-Invasive Ultrasound Lifting',
    categoryId: 'advanced-treatments',
    durationMinutes: 60,
    recoveryText: 'Zero downtime',
    priceCents: 40000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop',
    iconKey: 'zap',
    shortDescription: 'Uses micro-focused ultrasound to lift and tighten loose skin on the face, neck, or chest, acting as a non-surgical facelift.',
    displayOrder: 15,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'advanced-treatments', name: 'Advanced Skin & Body' } as any,
  },
  {
    id: 'lipoflack',
    slug: 'lipoflack',
    name: 'Lipoflack',
    tagline: 'Advanced Localized Contouring',
    categoryId: 'advanced-treatments',
    durationMinutes: 45,
    recoveryText: '1 - 2 Days localized swelling',
    priceCents: 50000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=600&auto=format&fit=crop',
    iconKey: 'zap',
    shortDescription: 'Focused clinical body/face contouring and skin firming treatment targeting stubborn fat pockets.',
    displayOrder: 16,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'advanced-treatments', name: 'Advanced Skin & Body' } as any,
  },
  {
    id: 'exosomas-dermapen',
    slug: 'exosomas-dermapen',
    name: 'Exosomas con Dermapen',
    tagline: 'Biocellular Micro-Needling Rejuvenation',
    categoryId: 'advanced-treatments',
    durationMinutes: 60,
    recoveryText: '1 - 2 Days slight pinkness',
    priceCents: 25000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=600&auto=format&fit=crop',
    iconKey: 'sparkles',
    shortDescription: 'Stunning cellular anti-aging treatment utilizing stem-cell derived exosomes alongside microneedling. Delivers intense rejuvenation.',
    displayOrder: 17,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'advanced-treatments', name: 'Advanced Skin & Body' } as any,
  },
  {
    id: 'venus-legacy',
    slug: 'venus-legacy',
    name: 'Venus Legacy',
    tagline: 'Multi-Polar Radio Frequency Firming',
    categoryId: 'advanced-treatments',
    durationMinutes: 60,
    recoveryText: 'Zero downtime',
    priceCents: 15000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
    iconKey: 'zap',
    shortDescription: 'Premium non-invasive body contouring and cellulite reduction utilizing multi-polar radiofrequency and pulsed magnetic fields.',
    displayOrder: 18,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'advanced-treatments', name: 'Advanced Skin & Body' } as any,
  },
  {
    id: 'post-surgery',
    slug: 'post-surgery',
    name: 'Post Surgery Lymphatic Drainage',
    tagline: 'Specialized Medical Recovery Massage',
    categoryId: 'advanced-treatments',
    durationMinutes: 60,
    recoveryText: 'Zero downtime',
    priceCents: 8500,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
    iconKey: 'heart',
    shortDescription: 'Specialized, extremely gentle medical lymphatic drainage massage to reduce postoperative swelling, prevent fibrosis, and speed healing.',
    displayOrder: 19,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'advanced-treatments', name: 'Advanced Skin & Body' } as any,
  },
  {
    id: 'relaxing-massage',
    slug: 'relaxing-massage',
    name: 'Relaxing Back Massage',
    tagline: 'Masaje Relajante',
    categoryId: 'advanced-treatments',
    durationMinutes: 45,
    recoveryText: 'Zero downtime',
    priceCents: 8000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop',
    iconKey: 'heart',
    shortDescription: 'A soothing clinical back massage utilizing premium botanical oil infusions to relieve structural muscle tension and promote deep relaxation.',
    displayOrder: 20,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'advanced-treatments', name: 'Advanced Skin & Body' } as any,
  }
]

// Mock Packages based on actual Booksy packages
const MOCK_PACKAGES: Package[] = [
  {
    id: 'laser-facial-10',
    slug: 'laser-facial-10',
    name: 'Facial 10 Sesiones',
    tagline: 'Complete 10-Session Facial Laser Package',
    priceCents: 70000,
    valuePriceCents: 90000,
    currency: 'USD',
    badge: 'Bestseller',
    displayOrder: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    inclusions: [
      { position: 1, description: '10 Full sessions of facial laser rejuvenation' },
      { position: 2, description: 'Clears sunspots, hyperpigmentation, & fine lines' },
      { position: 3, description: 'Promotes rapid collagen cellular turnover' },
      { position: 4, description: 'FDA-approved cooling laser tech' }
    ]
  },
  {
    id: 'laser-brazilian-10',
    slug: 'laser-brazilian-10',
    name: 'Brazilian 10 Sesiones',
    tagline: '10-Session Brazilian Laser Package',
    priceCents: 80000,
    valuePriceCents: 105000,
    currency: 'USD',
    badge: 'Elite Choice',
    displayOrder: 2,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    inclusions: [
      { position: 1, description: '10 Brazilian Laser hair removal sessions' },
      { position: 2, description: 'Maximum follicle clearance guarantee' },
      { position: 3, description: 'Tailored energy output control for safety' },
      { position: 4, description: 'Highly private, hygienic clinical suite' }
    ]
  },
  {
    id: 'laser-piernas-10',
    slug: 'laser-piernas-10',
    name: 'Piernas 10 Sesiones',
    tagline: '10-Session Legs Laser Package',
    priceCents: 95000,
    valuePriceCents: 120000,
    currency: 'USD',
    badge: null,
    displayOrder: 3,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    inclusions: [
      { position: 1, description: '10 Full/Half leg laser hair removal sessions' },
      { position: 2, description: 'Provides smooth, hair-free legs' },
      { position: 3, description: 'Reduces shaving irritation & ingrown hairs' },
      { position: 4, description: 'Rapid, precise large-area scanner tech' }
    ]
  },
  {
    id: 'bleaching-5',
    slug: 'bleaching-5',
    name: 'Blanqueamiento 5 Sesiones',
    tagline: '5-Session Axillary / Intimate Bleaching',
    priceCents: 40000,
    valuePriceCents: 50000,
    currency: 'USD',
    badge: null,
    displayOrder: 4,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    inclusions: [
      { position: 1, description: '5 Targeted clinical whitening sessions' },
      { position: 2, description: 'Deploys PicoSecond laser correction' },
      { position: 3, description: 'Clears post-inflammatory hyperpigmentation' },
      { position: 4, description: 'Gentle, soothing post-treatment sheet overlays' }
    ]
  },
  {
    id: 'double-chin-5',
    slug: 'double-chin-5',
    name: 'Double Chin (Papada) 5 Sessions',
    tagline: '5-Session Chin Tightening Package',
    priceCents: 40000,
    valuePriceCents: 50000,
    currency: 'USD',
    badge: null,
    displayOrder: 5,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    inclusions: [
      { position: 1, description: '5 Focused RF/Ultrasound tightening sessions' },
      { position: 2, description: 'Lifts sagging contours & reduces local adipose' },
      { position: 3, description: 'Promotes rapid jawline definitions' },
      { position: 4, description: 'Zero down-time non-surgical treatment' }
    ]
  }
]

// Mock Specialists - keeping ONLY founder Laura Andrade
const MOCK_SPECIALISTS: Specialist[] = [
  {
    id: 'laura-andrade',
    slug: 'laura-andrade',
    fullName: 'Laura Andrade',
    role: 'Founder & Lead Medical Specialist',
    credential: '13+ Years of Aesthetics Expertise',
    focus: 'Advanced skincare, facial rejuvenation, holistic wellness, biocellular therapies',
    philosophy: 'Beauty begins with healthy skin and self-confidence. My approach combines professional expertise with personalized attention, ensuring natural-looking, elegant results.',
    portraitUrl: '/laura.jpeg',
    userId: null,
    displayOrder: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    branches: [{ branch: { id: 'north-haven', displayName: 'North Haven, CT' } }]
  }
]

// Mock Before & After Cases
const MOCK_BEFORE_AFTER_CASES: BeforeAfterCase[] = [
  {
    id: 'case-1',
    slug: 'case-1',
    title: 'Biocellular Skin Rejuvenation',
    subtitle: 'Textural Correction & Micro-Needling',
    treatmentId: 'dermapen-vitaminas',
    timelineText: '3 Sessions (12 Weeks)',
    primaryIndications: 'Dull epidermal tone, uneven skin texture, large pores',
    therapistNotes: 'Dermapen micro-needling with vitamin cocktail applied. Patient showed significant cell turnover, shrinking pores and smoothing fine lines.',
    satisfactionText: '100% Client Rating',
    ageProfile: '35 Years',
    beforeImageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600&auto=format&fit=crop',
    afterImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    displayOrder: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    treatment: { id: 'dermapen-vitaminas', name: 'Dermapen con Vitaminas' }
  },
  {
    id: 'case-2',
    slug: 'case-2',
    title: 'Advanced Hydrafacial Glow',
    subtitle: 'Deep Pore Congestion & Hydration Infusion',
    treatmentId: 'hydrafacial',
    timelineText: '1 Session (90 Mins)',
    primaryIndications: 'Sebum congestion, blackheads, dry dull epidermal tone',
    therapistNotes: 'Vortex vacuum extraction successfully cleared T-zone congestion. Followed by deep pneumatic hyaluronic acid infusion for an immediate high-gloss finish.',
    satisfactionText: '98% Client Rating',
    ageProfile: '27 Years',
    beforeImageUrl: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=600&auto=format&fit=crop',
    afterImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
    displayOrder: 2,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    treatment: { id: 'hydrafacial', name: 'Hydrafacial' }
  }
]

// Mock Reviews
const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    customerId: null,
    branchId: 'north-haven',
    authorName: 'Beatrice V.',
    quote: 'The most outstanding skin results I have ever experienced. After just one Hydrafacial session with Laura Andrade, my skin looked incredibly plump, clear, and radiant. The private attention and luxury care are completely unparalleled.',
    rating: 5,
    status: 'approved',
    isFeatured: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    branch: { id: 'north-haven', displayName: 'North Haven, CT' }
  },
  {
    id: '2',
    customerId: null,
    branchId: 'north-haven',
    authorName: 'Charlotte R.',
    quote: 'Laura Andrade\'s bespoke treatment mapping is a miracle. She analyzed my skin structure at the cellular level and designed a microneedling timeline that completely swept away years of sun damage. The clinic is exceptional.',
    rating: 5,
    status: 'approved',
    isFeatured: true,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    branch: { id: 'north-haven', displayName: 'North Haven, CT' }
  }
]

// Mock Branches - Updated sole location to North Haven, CT
const MOCK_BRANCHES: Branch[] = [
  {
    id: 'north-haven',
    slug: 'north-haven',
    city: 'North Haven',
    displayName: 'North Haven Sanctuary',
    addressLine: '132 Middletown Ave, Suite 10, North Haven, CT',
    phone: '+1 (203) 555-0190',
    email: 'info@laskinclinic.com',
    timezone: 'America/New_York',
    mapX: '50%',
    mapY: '50%',
    displayOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
]

// Mock Site Settings
const MOCK_SITE_SETTINGS = {
  hero: { satisfaction_pct: 99, clients_served: 15000, specialists_count: 1 },
  booking: { lead_time_hours: 24, callback_window_hours: 2 }
}

export const publicApi = {
  // Treatments
  getTreatments: async (params?: { categoryId?: string; search?: string }) => {
    let result = [...MOCK_TREATMENTS]
    if (params?.categoryId) {
      result = result.filter(t => t.categoryId === params.categoryId)
    }
    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      result = result.filter(t => t.name.toLowerCase().includes(searchLower) || t.shortDescription.toLowerCase().includes(searchLower))
    }
    return result
  },
  getTreatment: async (slug: string) => {
    const treatment = MOCK_TREATMENTS.find(t => t.slug === slug)
    if (!treatment) throw new Error('Treatment not found')
    return treatment
  },

  // Packages
  getPackages: async (params?: { search?: string }) => {
    let result = [...MOCK_PACKAGES]
    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(searchLower) || p.tagline?.toLowerCase().includes(searchLower))
    }
    return result
  },
  getPackage: async (slug: string) => {
    const pkg = MOCK_PACKAGES.find(p => p.slug === slug)
    if (!pkg) throw new Error('Package not found')
    return pkg
  },

  // Specialists
  getSpecialists: async (params?: { branchId?: string; search?: string }) => {
    let result = [...MOCK_SPECIALISTS]
    if (params?.branchId) {
      result = result.filter(s => s.branches?.some(b => b.branch.id === params.branchId))
    }
    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      result = result.filter(s => s.fullName.toLowerCase().includes(searchLower))
    }
    return result
  },

  // Before & After
  getBeforeAfterCases: async (params?: { treatmentId?: string; search?: string }) => {
    let result = [...MOCK_BEFORE_AFTER_CASES]
    if (params?.treatmentId) {
      result = result.filter(c => c.treatmentId === params.treatmentId)
    }
    if (params?.search) {
      const searchLower = params.search.toLowerCase()
      result = result.filter(c => c.title.toLowerCase().includes(searchLower) || c.subtitle?.toLowerCase().includes(searchLower))
    }
    return result
  },

  // Reviews
  getReviews: async (params?: { branchId?: string }) => {
    let result = [...MOCK_REVIEWS]
    if (params?.branchId) {
      result = result.filter(r => r.branchId === params.branchId)
    }
    return result
  },

  // Settings
  getSiteSettings: async () => {
    return MOCK_SITE_SETTINGS
  },

  // Branches
  getBranches: async () => {
    return MOCK_BRANCHES
  },

  // Categories
  getCategories: async () => {
    return MOCK_CATEGORIES
  },

  // Bookings Availability
  getAvailability: async (params: { branchId: string; date: string }) => {
    return [
      { id: 'slot-1', startTime: '09:00', label: '09:00 AM', capacity: 2, booked: 0, available: true },
      { id: 'slot-2', startTime: '10:30', label: '10:30 AM', capacity: 2, booked: 0, available: true },
      { id: 'slot-3', startTime: '12:00', label: '12:00 PM', capacity: 2, booked: 0, available: true },
      { id: 'slot-4', startTime: '13:30', label: '01:30 PM', capacity: 2, booked: 1, available: true },
      { id: 'slot-5', startTime: '15:00', label: '03:00 PM', capacity: 2, booked: 2, available: false },
      { id: 'slot-6', startTime: '16:30', label: '04:30 PM', capacity: 2, booked: 0, available: true },
      { id: 'slot-7', startTime: '18:00', label: '06:00 PM', capacity: 2, booked: 0, available: true }
    ]
  },
  createBooking: async (payload: {
    customerFullName: string
    customerEmail: string
    customerPhone?: string
    branchId: string
    treatmentId?: string
    packageId?: string
    specialistId?: string
    appointmentDate: string
    startTime: string
    concerns?: string
    marketingConsent?: boolean
  }) => {
    const ref = `LSA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const branch = MOCK_BRANCHES.find(b => b.id === payload.branchId) || MOCK_BRANCHES[0]
    const treatment = payload.treatmentId ? MOCK_TREATMENTS.find(t => t.id === payload.treatmentId) : null
    const pkg = payload.packageId ? MOCK_PACKAGES.find(p => p.id === payload.packageId) : null
    const specialist = payload.specialistId ? MOCK_SPECIALISTS.find(s => s.id === payload.specialistId) : null

    const booking: Booking = {
      id: Math.random().toString(36).substring(7),
      reference: ref,
      status: 'pending',
      appointmentDate: payload.appointmentDate,
      startTime: payload.startTime,
      durationMinutes: treatment?.durationMinutes || 60,
      concerns: payload.concerns || null,
      source: 'website',
      cancelledReason: null,
      cancelledAt: null,
      confirmedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: {
        id: 'cust-new',
        fullName: payload.customerFullName,
        email: payload.customerEmail,
        phone: payload.customerPhone || null
      },
      branch: {
        id: branch.id,
        slug: branch.slug,
        city: branch.city,
        displayName: branch.displayName
      },
      treatment: treatment ? { id: treatment.id, slug: treatment.slug, name: treatment.name } : null,
      package: pkg ? { id: pkg.id, slug: pkg.slug, name: pkg.name } : null,
      specialist: specialist ? { id: specialist.id, slug: specialist.slug, fullName: specialist.fullName } : null
    }

    return {
      data: booking,
      cancelToken: 'dummy-cancel-token'
    }
  }
}
