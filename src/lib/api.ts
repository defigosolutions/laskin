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
  baseURL: 'http://localhost:4000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Mock Categories
const MOCK_CATEGORIES: Category[] = [
  { id: 'facial', slug: 'facial', displayName: 'Facial Clinic', displayOrder: 1, isActive: true },
  { id: 'laser', slug: 'laser', displayName: 'Laser Clinical', displayOrder: 2, isActive: true },
  { id: 'therapy', slug: 'therapy', displayName: 'Advanced Therapy', displayOrder: 3, isActive: true }
]

// Mock Treatments
const MOCK_TREATMENTS: Treatment[] = [
  {
    id: 'hydra-facial',
    slug: 'hydra-facial',
    name: 'Hydra Facial',
    tagline: 'Deep Vortex Hydration & Glow',
    categoryId: 'facial',
    durationMinutes: 60,
    recoveryText: 'Zero downtime',
    priceCents: 22500,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop',
    iconKey: 'droplet',
    shortDescription: 'A multi-step medical-grade skin treatment that cleanses, exfoliates, and extracts impurities while infusing skin with nourishing super-serums of antioxidants, peptides, and hyaluronic acid.',
    scientificText: 'Deploying vortex-suction vacuum extraction, it removes sebum and dead cells from pores while pneumatic infusion saturates the skin cells with active serums, stimulating collagen synthesis.',
    displayOrder: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'facial', name: 'Facial Clinic', displayName: 'Facial Clinic' } as any,
    steps: [
      { id: 'hf-1', stepOrder: 1, description: 'Clinical double cleansing and manual pore preparation' },
      { id: 'hf-2', stepOrder: 2, description: 'Gentle mechanical peeling to sweep away superficial debris' },
      { id: 'hf-3', stepOrder: 3, description: 'Pain-free vortex vacuum blackhead and debris extraction' },
      { id: 'hf-4', stepOrder: 4, description: 'Deep serum infusion of clinical peptides, honey, and HA' },
      { id: 'hf-5', stepOrder: 5, description: 'Finished with luxury Red LED light therapy to reduce redness' }
    ]
  },
  {
    id: 'chemical-peel',
    slug: 'chemical-peel',
    name: 'Chemical Peel',
    tagline: 'Advanced Cellular Skin Resurfacing',
    categoryId: 'therapy',
    durationMinutes: 45,
    recoveryText: '2 - 4 Days peeling',
    priceCents: 18000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
    iconKey: 'sparkles',
    shortDescription: 'A clinical skin-resurfacing procedure applying a custom concentration of alpha-hydroxy, beta-hydroxy, or trichloroacetic acids to remove damaged outer layers of skin.',
    scientificText: 'The chemical solution causes controlled microscopic exfoliation. As the dead outer layers flake away, it triggers an intensive natural healing process, revealing fresh skin with improved pigment balance.',
    displayOrder: 2,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'therapy', name: 'Advanced Therapy', displayName: 'Advanced Therapy' } as any,
    steps: [
      { id: 'cp-1', stepOrder: 1, description: 'Deep double cleansing and complete skin degreasing' },
      { id: 'cp-2', stepOrder: 2, description: 'Application of customized clinical acid peel formulation' },
      { id: 'cp-3', stepOrder: 3, description: 'Precise monitoring of skin reaction and activation' },
      { id: 'cp-4', stepOrder: 4, description: 'Application of clinical neutralizing skin solution' },
      { id: 'cp-5', stepOrder: 5, description: 'Infusion of medical barrier recovery moisturizers and mineral SPF' }
    ]
  },
  {
    id: 'laser-treatment',
    slug: 'laser-treatment',
    name: 'Laser Treatment',
    tagline: 'Precision IPL Skin Rejuvenation',
    categoryId: 'laser',
    durationMinutes: 50,
    recoveryText: '1 - 2 Days slight redness',
    priceCents: 35000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=600&auto=format&fit=crop',
    iconKey: 'zap',
    shortDescription: 'Advanced fractional laser skin resurfacing and Intense Pulsed Light (IPL) treatments targeting deep pigment, spider veins, sun damage, and surgical scars.',
    scientificText: 'Micro-beams of high-intensity laser energy penetrate below the epidermis, creating controlled microscopic thermal channels. This activates fibroblasts, triggering rapid production of fresh, new collagen fibers.',
    displayOrder: 3,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'laser', name: 'Laser Clinical', displayName: 'Laser Clinical' } as any,
    steps: [
      { id: 'lt-1', stepOrder: 1, description: 'Skin sanitization and placement of safety laser goggles' },
      { id: 'lt-2', stepOrder: 2, description: 'Application of cool protective ultrasound gel layer' },
      { id: 'lt-3', stepOrder: 3, description: 'Laser energy pulses systematically covering target areas' },
      { id: 'lt-4', stepOrder: 4, description: 'Application of medical-grade soothing aloe gel overlay' },
      { id: 'lt-5', stepOrder: 5, description: 'Finished with protective clinical cooling sheets and physical sunscreen' }
    ]
  },
  {
    id: 'anti-aging',
    slug: 'anti-aging',
    name: 'Anti-Aging Therapy',
    tagline: 'Sculpting Collagen Synthesis',
    categoryId: 'therapy',
    durationMinutes: 75,
    recoveryText: 'Zero downtime',
    priceCents: 28000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop',
    iconKey: 'shield',
    shortDescription: 'A luxurious collagen-inducing treatment focusing on skin lifting, firming, and wrinkle plumping using custom-designed peptide cocktails and radiofrequency (RF) technology.',
    scientificText: 'Controlled radiofrequency waves gently heat deep dermal tissue, forcing collagen fibers to instantly contract while signaling the body to produce fresh elastin and structural skin proteins.',
    displayOrder: 4,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'therapy', name: 'Advanced Therapy', displayName: 'Advanced Therapy' } as any,
    steps: [
      { id: 'aa-1', stepOrder: 1, description: 'Cleansing and application of specialized RF conductive gel' },
      { id: 'aa-2', stepOrder: 2, description: 'Symmetric RF thermal lifting covering jawline, cheeks, and forehead' },
      { id: 'aa-3', stepOrder: 3, description: 'Infusion of medical-grade micro-encapsulated Retinol and peptides' },
      { id: 'aa-4', stepOrder: 4, description: 'Sculpting pressure massage and botanical cold globe layout' },
      { id: 'aa-5', stepOrder: 5, description: 'Application of intensive luxury biological collagen mask sheets' }
    ]
  },
  {
    id: 'skin-rejuvenation',
    slug: 'skin-rejuvenation',
    name: 'Skin Rejuvenation',
    tagline: 'Luminosity Cellular Restoration',
    categoryId: 'laser',
    durationMinutes: 60,
    recoveryText: 'Zero downtime',
    priceCents: 24000,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop',
    iconKey: 'sun',
    shortDescription: 'A holistic botanical and technological fusion treatment aimed at detoxifying, replenishing, and infusing deep luminosity back into tired, dull, or environment-stressed skin.',
    scientificText: 'Combines micro-needling or gentle microdermabrasion with targeted cellular growth factor infusions. It accelerates the natural rate of epidermal cell turnover, generating a radiant, high-gloss skin finish.',
    displayOrder: 5,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    category: { id: 'laser', name: 'Laser Clinical', displayName: 'Laser Clinical' } as any,
    steps: [
      { id: 'sr-1', stepOrder: 1, description: 'Deep steam cleansing and enzymatic exfoliation scrub' },
      { id: 'sr-2', stepOrder: 2, description: 'Gentle ultrasound skin scrub to extract surface sebum' },
      { id: 'sr-3', stepOrder: 3, description: 'Infusion of high-purity Vitamin C, Ferulic Acid, and growth factors' },
      { id: 'sr-4', stepOrder: 4, description: 'Acupressure face sculpting massage using cold botanical oils' },
      { id: 'sr-5', stepOrder: 5, description: 'Clinical LED light therapy customized to your specific skin tone' }
    ]
  }
]

// Mock Packages
const MOCK_PACKAGES: Package[] = [
  {
    id: 'bh-radiance',
    slug: 'bh-radiance',
    name: 'The Beverly Hills Radiance',
    tagline: 'Instant Event High-Gloss Glow',
    priceCents: 32000,
    valuePriceCents: 38500,
    currency: 'USD',
    badge: 'Bestseller',
    displayOrder: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    inclusions: [
      { position: 1, description: '60 Min Hydra Facial Luxe infusion' },
      { position: 2, description: 'Purity Vitamin C & Ferulic infusion' },
      { position: 3, description: 'Clinical Red LED light therapy calm' },
      { position: 4, description: 'Luxury botanical face lift massage' }
    ]
  },
  {
    id: 'london-classic',
    slug: 'london-classic',
    name: 'The London Glow Classic',
    tagline: 'Deep Resurfacing & Pore Clearing',
    priceCents: 36000,
    valuePriceCents: 42000,
    currency: 'USD',
    badge: null,
    displayOrder: 2,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    inclusions: [
      { position: 1, description: '45 Min Glycolic Chemical Peel' },
      { position: 2, description: 'Targeted Vortex Sebum extraction' },
      { position: 3, description: 'Pneumatic Hyaluronic hydration lock' },
      { position: 4, description: 'Medical barrier repair massage' }
    ]
  },
  {
    id: 'dubai-elite',
    slug: 'dubai-elite',
    name: 'The Dubai Elite Restorative',
    tagline: 'Total Dermal Cellular Regeneration',
    priceCents: 55000,
    valuePriceCents: 63000,
    currency: 'USD',
    badge: 'Elite Choice',
    displayOrder: 3,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    inclusions: [
      { position: 1, description: 'Full Precision Laser IPL treatment' },
      { position: 2, description: 'Radiofrequency Collagen contractions' },
      { position: 3, description: 'Intensive cellular growth factor mask' },
      { position: 4, description: 'Bespoke luxury peptide cold stone massage' }
    ]
  }
]

// Mock Specialists
const MOCK_SPECIALISTS: Specialist[] = [
  {
    id: '1',
    slug: 'evelyn-davenport',
    fullName: 'Dr. Evelyn Davenport',
    role: 'Chief Cosmetic Dermatologist',
    credential: 'Harvard Medical School • 15+ Yrs Exp',
    focus: 'Cellular anti-aging, custom injectables mapping, laser therapeutics',
    philosophy: 'Timeless beauty lies in preserving structural harmony. We regenerate, never over-exaggerate.',
    portraitUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=500&auto=format&fit=crop',
    userId: null,
    displayOrder: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    branches: [{ branch: { id: 'bh', displayName: 'Beverly Hills' } }]
  },
  {
    id: '2',
    slug: 'marcus-sinclair',
    fullName: 'Dr. Marcus Sinclair',
    role: 'Lead Laser & Aesthetic Surgeon',
    credential: 'University of Oxford • 12+ Yrs Exp',
    focus: 'Micro-fractional laser resurfacing, structural jawline sculpting',
    philosophy: 'Modern laser science allows us to trigger the body’s own healing potential for flawless results.',
    portraitUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=500&auto=format&fit=crop',
    userId: null,
    displayOrder: 2,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    branches: [{ branch: { id: 'ldn', displayName: 'London (Mayfair)' } }]
  },
  {
    id: '3',
    slug: 'sarah-jenkins',
    fullName: 'Sarah Jenkins, LMA',
    role: 'Lead Clinical Aesthetician',
    credential: 'London Beauty Academy • 10+ Yrs Exp',
    focus: 'Medical-grade vortex facials, chemical cell-resurfacing',
    philosophy: 'A glowing complexion starts at the cellular layer. Healthy skin is the ultimate luxury asset.',
    portraitUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=500&auto=format&fit=crop',
    userId: null,
    displayOrder: 3,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    branches: [{ branch: { id: 'ldn', displayName: 'London (Mayfair)' } }, { branch: { id: 'dxb', displayName: 'Dubai (Downtown)' } }]
  }
]

// Mock Before & After Cases
const MOCK_BEFORE_AFTER_CASES: BeforeAfterCase[] = [
  {
    id: 'case-1',
    slug: 'case-1',
    title: 'Laser Skin Rejuvenation',
    subtitle: 'Hyperpigmentation & Textural Correction',
    treatmentId: 'laser-treatment',
    timelineText: '3 Sessions (12 Weeks)',
    primaryIndications: 'Sun damage, deep epidermal pigmentation, uneven skin texture',
    therapistNotes: 'Fractional laser resurfacing applied at 15mJ. Patient showed significant cell turnover, sweeping away dense melanin deposits and smoothing fine lines around oral area.',
    satisfactionText: '100% Client Rating',
    ageProfile: '38 Years',
    beforeImageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600&auto=format&fit=crop',
    afterImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    displayOrder: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    treatment: { id: 'laser-treatment', name: 'Laser Treatment' }
  },
  {
    id: 'case-2',
    slug: 'case-2',
    title: 'Advanced Hydra Facial Glow',
    subtitle: 'Deep Pore Congestion & Hydration Infusion',
    treatmentId: 'hydra-facial',
    timelineText: '1 Session (60 Mins)',
    primaryIndications: 'Sebum congestion, blackheads, dry dull epidermal tone',
    therapistNotes: 'Painless vortex vacuum extraction removed active congestion in T-zone. Deep pneumatic hyaluronic acid infusion instantly expanded moisture volumes, leaving high-gloss finish.',
    satisfactionText: '98% Client Rating',
    ageProfile: '27 Years',
    beforeImageUrl: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=600&auto=format&fit=crop',
    afterImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
    displayOrder: 2,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    treatment: { id: 'hydra-facial', name: 'Hydra Facial' }
  },
  {
    id: 'case-3',
    slug: 'case-3',
    title: 'Anti-Aging Fine Line Therapy',
    subtitle: 'Dermal Volumization & Collagen Restoration',
    treatmentId: 'anti-aging',
    timelineText: '4 Sessions (8 Weeks)',
    primaryIndications: 'Loss of structural volume, nasolabial creases, sagging jaw contour',
    therapistNotes: 'Deep radiofrequency lifting sessions induced collagen fiber contraction. Coupled with peptide micro-infusions, skin plumpness was restored, firming cheeks and sharpening the jawline.',
    satisfactionText: '100% Client Rating',
    ageProfile: '49 Years',
    beforeImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop',
    afterImageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop',
    displayOrder: 3,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    treatment: { id: 'anti-aging', name: 'Anti-Aging Therapy' }
  }
]

// Mock Reviews
const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    customerId: null,
    branchId: 'ldn',
    authorName: 'Lady Beatrice V.',
    quote: 'The most outstanding skin results I have ever experienced. After just one Hydra Facial Luxe session in the London Mayfair suite, my skin looked incredibly plump and radiant for my wedding week. The privacy and luxury care are completely unparalleled.',
    rating: 5,
    status: 'approved',
    isFeatured: true,
    displayOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    branch: { id: 'ldn', displayName: 'London (Mayfair)' }
  },
  {
    id: '2',
    customerId: null,
    branchId: 'bh',
    authorName: 'Charlotte R.',
    quote: 'Dr. Davenport’s bespoke treatment mapping protocol is a miracle. She analyzed my skin structure at the cell level and designed a laser resurfacing timeline that completely swept away years of sun damage. The Beverly Hills clinic is exceptional.',
    rating: 5,
    status: 'approved',
    isFeatured: true,
    displayOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    branch: { id: 'bh', displayName: 'Beverly Hills' }
  },
  {
    id: '3',
    customerId: null,
    branchId: 'dxb',
    authorName: 'Yasmin Al-M.',
    quote: 'Absolutely unmatched prestige and scientific excellence. The Dubai Downtown branch has become my monthly sanctuary. The anti-aging therapies and structural sculpting are state-of-the-art and deliver natural-looking longevity.',
    rating: 5,
    status: 'approved',
    isFeatured: true,
    displayOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    branch: { id: 'dxb', displayName: 'Dubai (Downtown)' }
  }
]

// Mock Branches
const MOCK_BRANCHES: Branch[] = [
  {
    id: 'bh',
    slug: 'beverly-hills',
    city: 'Beverly Hills',
    displayName: 'Beverly Hills',
    addressLine: '420 Rodeo Drive, Suite A, Beverly Hills, CA 90210',
    phone: '+1 (310) 555-0190',
    email: 'bh@laskinclinic.com',
    timezone: 'America/Los_Angeles',
    mapX: '25%',
    mapY: '45%',
    displayOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ldn',
    slug: 'london',
    city: 'London',
    displayName: 'London (Mayfair)',
    addressLine: '18 Bruton Place, Mayfair, London W1J 6LY',
    phone: '+44 (20) 7946 0981',
    email: 'mayfair@laskinclinic.com',
    timezone: 'Europe/London',
    mapX: '50%',
    mapY: '35%',
    displayOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dxb',
    slug: 'dubai',
    city: 'Dubai',
    displayName: 'Dubai (Downtown)',
    addressLine: 'Burj Plaza, Downtown Suite 44, Dubai, UAE',
    phone: '+971 (4) 420 0199',
    email: 'dubai@laskinclinic.com',
    timezone: 'Asia/Dubai',
    mapX: '75%',
    mapY: '55%',
    displayOrder: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
]

// Mock Site Settings
const MOCK_SITE_SETTINGS = {
  hero: { satisfaction_pct: 99, clients_served: 15000, specialists_count: 10 },
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
    // Return standard dummy slots
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
