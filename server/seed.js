import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import pool from './db.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

async function runSeed() {
  console.log('Starting database seeding...');
  
  // Resolve path to schema.sql
  let schemaPath = path.join(process.cwd(), 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    // Try absolute path if run from root directory
    schemaPath = path.join(process.cwd(), 'server', 'schema.sql');
  }
  
  console.log(`Reading schema from: ${schemaPath}`);
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const client = await pool.connect();

  try {
    // 1. Run schema DDL
    console.log('Running DDL migrations...');
    await client.query(schemaSql);
    console.log('Database tables created successfully.');

    // 2. Hash default admin password
    const adminPassword = 'LaskinAdmin2026!';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    console.log('Inserting default admin account...');
    await client.query(`
      INSERT INTO users (email, password_hash, full_name, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
    `, ['admin@laskin.com', passwordHash, 'Laura Andrade', 'super_admin', true]);

    // 3. Seed initial branch details
    console.log('Inserting branches...');
    await client.query(`
      INSERT INTO branches (id, slug, city, display_name, address_line, phone, email, timezone, map_x, map_y, display_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      'north-haven',
      'north-haven',
      'North Haven',
      'North Haven Sanctuary',
      '132 Middletown Ave Suite 10 North Haven, CT 06473',
      '+1 (475) 209-6384',
      'info@laskinclinic.com',
      'America/New_York',
      '50%',
      '50%',
      1,
      true
    ]);

    // 4. Seed branch operating hours (Mon-Sat, Sun closed)
    console.log('Inserting branch hours...');
    for (let day = 0; day <= 6; day++) {
      const isClosed = day === 0; // Sunday is 0
      await client.query(`
        INSERT INTO branch_hours (branch_id, day_of_week, is_closed, opens_at, closes_at)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        'north-haven',
        day,
        isClosed,
        isClosed ? null : '09:00:00',
        isClosed ? null : '20:00:00'
      ]);
    }

    // 5. Seed branch time slots
    console.log('Inserting branch time slots...');
    const slots = [
      { startTime: '09:00:00', label: '09:00 AM' },
      { startTime: '10:30:00', label: '10:30 AM' },
      { startTime: '12:00:00', label: '12:00 PM' },
      { startTime: '13:30:00', label: '01:30 PM' },
      { startTime: '15:00:00', label: '03:00 PM' },
      { startTime: '16:30:00', label: '04:30 PM' },
      { startTime: '18:00:00', label: '06:00 PM' }
    ];
    for (let i = 0; i < slots.length; i++) {
      await client.query(`
        INSERT INTO branch_time_slots (branch_id, start_time, label, capacity, display_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['north-haven', slots[i].startTime, slots[i].label, 2, i + 1, true]);
    }

    // 6. Seed categories
    console.log('Inserting categories...');
    const categories = [
      { id: 'facials-skincare', slug: 'facials-skincare', name: 'Facials & Skincare', order: 1 },
      { id: 'laser-hair-removal', slug: 'laser-hair-removal', name: 'Láser Hair Removal', order: 2 },
      { id: 'advanced-treatments', slug: 'advanced-treatments', name: 'Advanced Skin & Body', order: 3 }
    ];
    for (const cat of categories) {
      await client.query(`
        INSERT INTO categories (id, slug, display_name, display_order, is_active)
        VALUES ($1, $2, $3, $4, true)
      `, [cat.id, cat.slug, cat.name, cat.order]);
    }

    // 7. Seed treatments
    console.log('Inserting treatments...');
    const treatments = [
      {
        id: 'hydrafacial',
        slug: 'hydrafacial',
        name: 'Hydrafacial',
        tagline: 'Deep Vortex Exfoliation & Hydration',
        categoryId: 'facials-skincare',
        duration: 90,
        recovery: 'Zero downtime',
        price: 14000,
        imageUrl: '/images/treatments/hydrafacial.jpeg',
        icon: 'droplet',
        shortDesc: 'Our premium medical-grade facial skin treatment. Cleanses, extracts impurities, and hydrates using exclusive nourishing super-serums filled with antioxidants and peptides.',
        displayOrder: 1
      },
      {
        id: 'basic-facial',
        slug: 'basic-facial',
        name: 'Basic Facial Cleansing',
        tagline: 'Limpieza Facial Básica',
        categoryId: 'facials-skincare',
        duration: 45,
        recovery: 'Zero downtime',
        price: 7500,
        imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop',
        icon: 'sparkles',
        shortDesc: 'An essential facial treatment designed to purify the skin, clear congested pores, and restore a healthy, balanced epidermal barrier.',
        displayOrder: 2
      },
      {
        id: 'radio-frequency',
        slug: 'radio-frequency',
        name: 'Radio Frequency',
        tagline: 'Non-Surgical Collagen Stimulation',
        categoryId: 'facials-skincare',
        duration: 30,
        recovery: 'Minimal redness',
        price: 5000,
        imageUrl: '/images/treatments/radio-frequency.jpeg',
        icon: 'zap',
        shortDesc: 'Utilizes radiofrequency energy to gently heat dermal layers, promoting immediate collagen contraction and stimulating long-term skin tightening.',
        displayOrder: 3
      },
      {
        id: 'ultrasonic',
        slug: 'ultrasonic',
        name: 'Ultrasonic Facial',
        tagline: 'Deep Cellular Cleansing & Lift',
        categoryId: 'facials-skincare',
        duration: 30,
        recovery: 'Zero downtime',
        price: 5000,
        imageUrl: '/images/treatments/ultrasonic.jpeg',
        icon: 'shield',
        shortDesc: 'High-frequency ultrasonic waves clear dead skin cells and impurities, encouraging cellular renewal and optimal skin barrier nutrient absorption.',
        displayOrder: 4
      },
      {
        id: 'dermabrasion',
        slug: 'dermabrasion',
        name: 'Dermabrasion',
        tagline: 'Advanced Resurfacing Treatment',
        categoryId: 'facials-skincare',
        duration: 40,
        recovery: '1 - 2 Days slight pinkness',
        price: 6000,
        imageUrl: '/images/treatments/dermabrasion.jpeg',
        icon: 'sun',
        shortDesc: 'Gently exfoliates the superficial layer of dead skin cells to smooth uneven texture, reduce light acne scarring, and stimulate healthy fresh cell turn-over.',
        displayOrder: 5
      },
      {
        id: 'anti-aging',
        slug: 'anti-aging',
        name: 'Anti-Aging Treatments',
        tagline: 'Bespoke Cellular Restoration',
        categoryId: 'facials-skincare',
        duration: 60,
        recovery: 'Zero downtime',
        price: 15000,
        imageUrl: '/images/treatments/anti-aging.jpeg',
        icon: 'shield',
        shortDesc: 'Bespoke clinical therapies targeting fine lines, wrinkles, and volume loss. Promotes skin elasticity and activates structural dermal healing.',
        displayOrder: 6
      },
      {
        id: 'hydralips',
        slug: 'hydralips',
        name: 'Hydralips',
        tagline: 'Intensive Lip Plumping & Hydration',
        categoryId: 'facials-skincare',
        duration: 45,
        recovery: 'Zero downtime',
        price: 7500,
        imageUrl: '/images/treatments/hydralips.jpeg',
        icon: 'heart',
        shortDesc: 'Deep hydration and micro-infusion treatment for dry or cracked lips, providing a subtle plumping effect and a soft, glowing rosy texture.',
        displayOrder: 7
      },
      {
        id: 'laser-hair-removal-single',
        slug: 'laser-hair-removal-single',
        name: 'Láser Hair Removal (Single Session)',
        tagline: 'FDA-Approved Precision Laser',
        categoryId: 'laser-hair-removal',
        duration: 30,
        recovery: 'Zero downtime',
        price: 40000,
        imageUrl: '/images/treatments/laser-hair-removal-single.jpeg',
        icon: 'zap',
        shortDesc: 'Safe, premium laser hair removal treatment utilizing advanced cooling technology to ensure maximum client comfort and long-term hair follicle clearance.',
        displayOrder: 8
      },
      {
        id: 'prp',
        slug: 'prp',
        name: 'PRP (Platelet-Rich Plasma)',
        tagline: 'Autologous Cellular Regeneration',
        categoryId: 'advanced-treatments',
        duration: 60,
        recovery: '1 Day slight redness',
        price: 15000,
        imageUrl: '/images/treatments/prp.jpeg',
        icon: 'droplet',
        shortDesc: 'Utilizes growth factors isolated from your own blood plasma to stimulate rapid cellular regeneration, collagen synthesis, and deep tissue recovery.',
        displayOrder: 9
      },
      {
        id: 'dermapen-vitaminas',
        slug: 'dermapen-vitaminas',
        name: 'Dermapen con Vitaminas',
        tagline: 'Vitamin-Infused Collagen Induction',
        categoryId: 'advanced-treatments',
        duration: 45,
        recovery: '1 - 2 Days sensitivity',
        price: 10000,
        imageUrl: '/images/treatments/dermapen-vitaminas.jpeg',
        icon: 'sparkles',
        shortDesc: 'Advanced micro-needling treatment that creates tiny micro-channels in the skin to inject a custom cocktail of vitamins, hyaluronic acid, and peptides.',
        displayOrder: 10
      },
      {
        id: 'peelings',
        slug: 'peelings',
        name: 'Peelings Químicos',
        tagline: 'Clinical Chemical Resurfacing',
        categoryId: 'advanced-treatments',
        duration: 45,
        recovery: '3 - 5 Days light peeling',
        price: 10000,
        imageUrl: '/images/treatments/peelings.jpeg',
        icon: 'sun',
        shortDesc: 'Professional chemical peels targeting hyperpigmentation, active acne, and superficial scarring to reveal a smoother, highly even skin tone.',
        displayOrder: 11
      },
      {
        id: 'exosomas',
        slug: 'exosomas',
        name: 'Tratamiento con Exosomas',
        tagline: 'Premium Biocellular Repair',
        categoryId: 'advanced-treatments',
        duration: 60,
        recovery: 'Zero downtime',
        price: 18000,
        imageUrl: '/images/treatments/exosomas.jpeg',
        icon: 'shield',
        shortDesc: 'Cutting-edge therapy utilizing purified stem-cell derived exosomes to deliver massive cellular signals for collagen stimulation and anti-aging repair.',
        displayOrder: 12
      },
      {
        id: 'drainage',
        slug: 'drainage',
        name: 'Drenaje Linfático Post Quirúrgico',
        tagline: 'Post-Surgery Lymphatic Recovery',
        categoryId: 'advanced-treatments',
        duration: 60,
        recovery: 'Immediate relief',
        price: 9000,
        imageUrl: '/images/treatments/drainage.jpeg',
        icon: 'heart',
        shortDesc: 'Specialized, gentle massage technique designed to accelerate fluid drainage, reduce clinical swelling, and promote healthy post-surgical healing.',
        displayOrder: 13
      },
      {
        id: 'massage-relax',
        slug: 'massage-relax',
        name: 'Relax Massage',
        tagline: 'Luxury Stress-Relieving Therapy',
        categoryId: 'advanced-treatments',
        duration: 45,
        recovery: 'Zero downtime',
        price: 6000,
        imageUrl: '/images/treatments/massage-relax.jpeg',
        icon: 'heart',
        shortDesc: 'A soothing therapeutic back massage designed to melt away muscular tension, lower cortisol levels, and restore absolute peace.',
        displayOrder: 14
      }
    ];

    for (const t of treatments) {
      await client.query(`
        INSERT INTO treatments (id, slug, name, tagline, category_id, duration_minutes, recovery_text, price_cents, image_url, icon_key, short_description, display_order, is_published)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
      `, [
        t.id, t.slug, t.name, t.tagline, t.categoryId, t.duration, t.recovery, t.price, t.imageUrl, t.icon, t.shortDesc, t.displayOrder
      ]);
    }

    // Seed treatment steps (For Hydrafacial as demo)
    console.log('Inserting treatment steps...');
    const hydraSteps = [
      'Clinical double cleansing and skin analysis.',
      'Vortex mechanical exfoliation to lift away dead cells.',
      'Gentle acid peel overlay to dissolve pore impurities.',
      'Pneumatic blackhead extraction and vacuum purging.',
      'Deep nourishing hydration infusion filled with peptides and antioxidants.',
      'Clinical LED light therapy to lock in nutrients.'
    ];
    for (let i = 0; i < hydraSteps.length; i++) {
      await client.query(`
        INSERT INTO treatment_steps (treatment_id, step_order, description)
        VALUES ($1, $2, $3)
      `, ['hydrafacial', i + 1, hydraSteps[i]]);
    }

    // 8. Seed packages
    console.log('Inserting packages...');
    const packages = [
      { id: 'facial-10', slug: 'facial-10', name: 'Facial 10 Sesiones', tagline: '10-Session Clinical Facial Journey', price: 70000, valuePrice: 90000, badge: 'Best Value', order: 1 },
      { id: 'bikini-10', slug: 'bikini-10', name: 'Bikini 10 Sesiones', tagline: '10-Session Laser Bikini Clearance', price: 75000, valuePrice: 95000, badge: null, order: 2 },
      { id: 'brazilian-10', slug: 'brazilian-10', name: 'Brazilian 10 Sesiones', tagline: '10-Session Complete Laser Brazilian', price: 80000, valuePrice: 110000, badge: 'Popular Choice', order: 3 },
      { id: 'underarms-10', slug: 'underarms-10', name: 'Underarms (Axilas) 10 Sesiones', tagline: '10-Session Underarm Laser Journey', price: 40000, valuePrice: 50000, badge: null, order: 4 },
      { id: 'bleaching-5', slug: 'bleaching-5', name: 'Blanqueamiento 5 Sesiones', tagline: '5-Session Axillary / Intimate Bleaching', price: 40000, valuePrice: 50000, badge: null, order: 5 },
      { id: 'double-chin-5', slug: 'double-chin-5', name: 'Double Chin (Papada) 5 Sessions', tagline: '5-Session Chin Tightening Package', price: 40000, valuePrice: 50000, badge: null, order: 6 }
    ];

    for (const p of packages) {
      await client.query(`
        INSERT INTO packages (id, slug, name, tagline, price_cents, value_price_cents, currency, badge, display_order, is_published)
        VALUES ($1, $2, $3, $4, $5, $6, 'USD', $7, $8, true)
      `, [p.id, p.slug, p.name, p.tagline, p.price, p.valuePrice, p.badge, p.order]);
    }

    // Seed package inclusions
    const packageInclusionsData = {
      'facial-10': [
        '10 Custom clinical facial sessions matching your skin profile',
        'Combines mechanical pore purification and custom hydration infuses',
        'Personalized structural mapping by founder Laura Andrade',
        'Includes botanical soothing face lifting massages'
      ],
      'bikini-10': [
        '10 Premium laser bikini hair removal sessions',
        'Advanced cooling technology for maximum comfort',
        'Permanent reduction of hair follicle growth',
        'Safe for all skin types and profiles'
      ],
      'brazilian-10': [
        '10 Complete laser Brazilian clearance sessions',
        'Precision treatment covering the entire area',
        'Advanced cooling technology for a painless experience',
        'Long-lasting, smooth and flawless skin results'
      ],
      'underarms-10': [
        '10 Targeted laser underarm clearance sessions',
        'Eliminates razor burn, ingrown hairs, and shadows',
        'Quick and comfortable sessions with minimal downtime',
        'Permanent hair reduction for smooth underarms'
      ],
      'bleaching-5': [
        '5 Specialized sessions for axillary or intimate bleaching',
        'Gentle, medical-grade brightening formulations',
        'Targeted treatment to reduce hyperpigmentation and dark spots',
        'Evens out skin tone for a flawless, natural appearance'
      ],
      'double-chin-5': [
        '5 Advanced chin tightening and sculpting sessions',
        'Non-invasive fat reduction and skin firming technology',
        'Defines jawline and improves structural facial profile',
        'Stimulates natural collagen production for lasting lift'
      ]
    };

    for (const [pkgId, incs] of Object.entries(packageInclusionsData)) {
      for (let i = 0; i < incs.length; i++) {
        await client.query(`
          INSERT INTO package_inclusions (package_id, position, description)
          VALUES ($1, $2, $3)
        `, [pkgId, i + 1, incs[i]]);
      }
    }

    // 9. Seed products
    console.log('Inserting products...');
    const products = [
      { slug: 'luminous-silk-cleanser', name: 'Luminous Silk Cleanser', tagline: 'Cleanser', price: 5500, img: '/product_images/WhatsApp Image 2026-06-13 at 7.55.40 AM.jpeg', desc: 'A silky, low-foaming medical cleanser infused with botanical extracts that removes impurities while respecting the skin barrier.', order: 1 },
      { slug: 'cellular-hydration-serum', name: 'Cellular Hydration Serum', tagline: 'Serum', price: 8500, img: '/product_images/WhatsApp Image 2026-06-13 at 7.55.41 AM (1).jpeg', desc: 'A multi-weight hyaluronic acid serum designed to lock in deep hydration at the cellular level for a plump, glowing finish.', order: 2 },
      { slug: 'restorative-barrier-cream', name: 'Restorative Barrier Cream', tagline: 'Moisturizer', price: 9000, img: '/product_images/WhatsApp Image 2026-06-13 at 7.55.41 AM (2).jpeg', desc: 'Intensive repair cream formulated with ceramides and clinical peptides to strengthen, soothe, and recover post-treatment skin.', order: 3 },
      { slug: 'radiance-retinol-treatment', name: 'Radiance Retinol Treatment', tagline: 'Treatment', price: 11000, img: '/product_images/WhatsApp Image 2026-06-13 at 7.55.41 AM (3).jpeg', desc: 'Micro-encapsulated slow-release retinol that refines skin texture, accelerates cell turn-over, and diminishes fine lines.', order: 4 },
      { slug: 'vitamin-c-glow-concentrate', name: 'Vitamin C Glow Concentrate', tagline: 'Serum', price: 9500, img: '/product_images/WhatsApp Image 2026-06-13 at 7.55.41 AM (4).jpeg', desc: 'Potent 15% L-Ascorbic Acid serum with Ferulic Acid to neutralize environmental free radicals and brighten uneven pigment.', order: 5 },
      { slug: 'mineral-shield-spf-50', name: 'Mineral Shield SPF 50', tagline: 'Protection', price: 4800, img: '/product_images/WhatsApp Image 2026-06-13 at 7.55.41 AM (5).jpeg', desc: 'A lightweight, tinted physical sunscreen offering broad-spectrum protection with a flawless, dewy, non-greasy texture.', order: 6 },
      { slug: 'absolute-eye-lift-gel', name: 'Absolute Eye Lift Gel', tagline: 'Eye Care', price: 7500, img: '/product_images/WhatsApp Image 2026-06-13 at 7.55.41 AM.jpeg', desc: 'Cooling peptide eye gel designed to drain puffiness, reduce dark circles, and lift structural lines around the orbital area.', order: 7 },
      { slug: 'smoothing-exfoliating-polish', name: 'Smoothing Exfoliating Polish', tagline: 'Exfoliator', price: 5000, img: '/product_images/WhatsApp Image 2026-06-13 at 7.55.42 AM (1).jpeg', desc: 'Fine micro-polishing clinical scrub utilizing salicylic acid and quartz crystals to sweep away superficial build-up.', order: 8 },
      { slug: 'clarifying-salicylic-elixir', name: 'Clarifying Salicylic Elixir', tagline: 'Treatment', price: 6500, img: '/product_images/WhatsApp Image 2026-06-13 at 7.55.42 AM.jpeg', desc: 'Targeted BHA toner that penetrates deep into pores to dissolve sebum, clear blackheads, and prevent active breakouts.', order: 9 }
    ];

    for (const prod of products) {
      await client.query(`
        INSERT INTO products (slug, name, tagline, price_cents, image_url, description, display_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      `, [prod.slug, prod.name, prod.tagline, prod.price, prod.img, prod.desc, prod.order]);
    }

    // 10. Seed specialists
    console.log('Inserting specialists...');
    await client.query(`
      INSERT INTO specialists (id, slug, full_name, role, credential, focus, philosophy, portrait_url, display_order, is_published)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
    `, [
      'laura-andrade',
      'laura-andrade',
      'Laura Andrade',
      'Founder & Lead Medical Specialist',
      '13+ Years of Aesthetics Expertise',
      'Advanced skincare, facial rejuvenation, holistic wellness, biocellular therapies',
      'Beauty begins with healthy skin and self-confidence. My approach combines professional expertise with personalized attention, ensuring natural-looking, elegant results.',
      '/laura.jpeg',
      1
    ]);

    await client.query(`
      INSERT INTO specialists_branches (specialist_id, branch_id)
      VALUES ('laura-andrade', 'north-haven')
    `);

    // 11. Seed before-after cases
    console.log('Inserting before-after cases...');
    await client.query(`
      INSERT INTO before_after_cases (id, slug, title, subtitle, treatment_id, timeline_text, primary_indications, therapist_notes, satisfaction_text, age_profile, before_image_url, after_image_url, display_order, is_published)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
    `, [
      'case-1',
      'case-1',
      'Biocellular Skin Rejuvenation',
      'Textural Correction & Micro-Needling',
      'dermapen-vitaminas',
      '3 Sessions (12 Weeks)',
      'Dull epidermal tone, uneven skin texture, large pores',
      'Dermapen micro-needling with vitamin cocktail applied. Patient showed significant cell turnover, shrinking pores and smoothing fine lines.',
      '100% Client Rating',
      '35 Years',
      '/images/cases/case-1_before.jpg',
      '/images/cases/case-1_after.jpg',
      1
    ]);

    await client.query(`
      INSERT INTO before_after_cases (id, slug, title, subtitle, treatment_id, timeline_text, primary_indications, therapist_notes, satisfaction_text, age_profile, before_image_url, after_image_url, display_order, is_published)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
    `, [
      'case-2',
      'case-2',
      'Advanced Hydrafacial Glow',
      'Deep Pore Congestion & Hydration Infusion',
      'hydrafacial',
      '1 Session (90 Mins)',
      'Sebum congestion, blackheads, dry dull epidermal tone',
      'Vortex vacuum extraction successfully cleared T-zone congestion. Followed by deep pneumatic hyaluronic acid infusion for an immediate high-gloss finish.',
      '98% Client Rating',
      '27 Years',
      '/images/cases/case-2_before.jpg',
      '/images/cases/case-2_after.jpg',
      2
    ]);

    // 12. Seed reviews
    console.log('Inserting reviews...');
    await client.query(`
      INSERT INTO reviews (branch_id, author_name, quote, rating, status, is_featured, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      'north-haven',
      'Beatrice V.',
      'The most outstanding skin results I have ever experienced. After just one Hydrafacial session with Laura Andrade, my skin looked incredibly plump, clear, and radiant. The private attention and luxury care are completely unparalleled.',
      5,
      'approved',
      true,
      1
    ]);

    await client.query(`
      INSERT INTO reviews (branch_id, author_name, quote, rating, status, is_featured, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      'north-haven',
      'Charlotte R.',
      'Laura Andrade\'s bespoke treatment mapping is a miracle. She analyzed my skin structure at the cellular level and designed a microneedling timeline that completely swept away years of sun damage. The clinic is exceptional.',
      5,
      'approved',
      true,
      2
    ]);

    // 13. Seed site settings
    console.log('Inserting site settings...');
    await client.query(`
      INSERT INTO site_settings (key, value)
      VALUES ($1, $2)
    `, ['settings.analytics', JSON.stringify({
      ga4_id: 'G-XXXXXXXXXX',
      gsc_code: 'google-search-console-verification',
      header_scripts: '<!-- Custom Header Scripts -->',
      footer_scripts: '<!-- Custom Footer Scripts -->'
    })]);

    await client.query(`
      INSERT INTO site_settings (key, value)
      VALUES ($1, $2)
    `, ['settings.smtp', JSON.stringify({
      host: 'smtp.gmail.com',
      port: 587,
      username: '',
      password: '',
      encryption: 'TLS',
      sender_name: 'LA Skin Concierge',
      sender_email: 'concierge@laskinclinic.com'
    })]);

    await client.query(`
      INSERT INTO site_settings (key, value)
      VALUES ($1, $2)
    `, ['settings.branding', JSON.stringify({
      logo_url: '/logo.jpeg',
      favicon_url: '/favicon.ico',
      hero_stats: { satisfaction_pct: 99, clients_served: 15000, specialists_count: 1 }
    })]);

    await client.query(`
      INSERT INTO site_settings (key, value)
      VALUES ($1, $2)
    `, ['settings.contact', JSON.stringify({
      phone: '+1 (475) 209-6384',
      email: 'info@laskinclinic.com',
      address: '132 Middletown Ave Suite 10 North Haven, CT 06473',
      facebook_url: 'https://facebook.com/laskin',
      instagram_url: 'https://instagram.com/laskin',
      twitter_url: ''
    })]);

    await client.query(`
      INSERT INTO site_settings (key, value)
      VALUES ($1, $2)
    `, ['settings.maintenance', JSON.stringify({
      maintenance_mode: false
    })]);
    await client.query(`
      INSERT INTO site_settings (key, value)
      VALUES ($1, $2)
    `, ['settings.seo_routes', JSON.stringify([
      { path: '/', title: 'LA Skin & Aesthetics | Luxury Medical Spa in North Haven, CT', description: 'Premium luxury medical spa and aesthetics clinic in North Haven, CT, offering Hydrafacials, Laser Hair Removal, and advanced skincare treatments.', keywords: 'skin clinic, luxury spa, beauty treatments, hydrafacial, laser hair removal, anti-aging, LA Skin and Aesthetics, North Haven CT, Laura Andrade' },
      { path: '/products', title: 'Luxury Online Boutique | LA Skin & Aesthetics', description: 'Explore our premium selection of clinical skincare formulations and luxury aesthetics products at LA Skin & Aesthetics.', keywords: 'skincare products, luxury skin cream, hydrafacial serums, anti-aging serums, LA Skin boutique' }
    ])]);

    console.log('Seeding process completed successfully!');

  } catch (err) {
    console.error('Fatal error during seeding database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
