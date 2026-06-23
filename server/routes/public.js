import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Helper to format currency
function formatCentsToUSD(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

// GET: All active categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE is_active = true ORDER BY display_order ASC');
    const formatted = result.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      displayName: row.display_name,
      displayOrder: row.display_order,
      isActive: row.is_active
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching categories.' });
  }
});

// GET: All active branches
router.get('/branches', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches WHERE is_active = true ORDER BY display_order ASC');
    const formatted = result.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      city: row.city,
      displayName: row.display_name,
      addressLine: row.address_line,
      phone: row.phone,
      email: row.email,
      timezone: row.timezone,
      mapX: row.map_x,
      mapY: row.map_y,
      displayOrder: row.display_order,
      isActive: row.is_active
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching branches.' });
  }
});

// GET: SEO Route Settings
router.get('/seo', async (req, res) => {
  try {
    const result = await pool.query(`SELECT value FROM site_settings WHERE key = 'settings.seo_routes'`);
    if (result.rows.length === 0) {
      return res.json([]);
    }
    res.json(result.rows[0].value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching SEO settings.' });
  }
});

// GET: All published treatments
router.get('/treatments', async (req, res) => {
  const { categoryId } = req.query;
  try {
    let query = `
      SELECT t.*, 
             json_build_object('id', c.id, 'slug', c.slug, 'displayName', c.display_name) as category,
             COALESCE(
               (SELECT json_agg(ts.description ORDER BY ts.step_order) 
                FROM treatment_steps ts 
                WHERE ts.treatment_id = t.id), 
               '[]'::json
             ) as steps
      FROM treatments t
      JOIN categories c ON t.category_id = c.id
      WHERE t.is_published = true AND t.deleted_at IS NULL
    `;
    const params = [];
    if (categoryId) {
      query += ' AND t.category_id = $1';
      params.push(categoryId);
    }
    query += ' ORDER BY t.display_order ASC';
    const result = await pool.query(query, params);
    
    // Format response objects for frontend consumption
    const formatted = result.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      categoryId: row.category_id,
      durationMinutes: row.duration_minutes,
      recoveryText: row.recovery_text,
      priceCents: row.price_cents,
      currency: row.currency,
      imageUrl: row.image_url,
      iconKey: row.icon_key,
      shortDescription: row.short_description,
      scientificText: row.scientific_text,
      category: row.category,
      steps: row.steps
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching treatments.' });
  }
});

// GET: Single treatment detail by slug
router.get('/treatments/:slug', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, 
             json_build_object('id', c.id, 'slug', c.slug, 'displayName', c.display_name) as category,
             COALESCE(
               (SELECT json_agg(ts.description ORDER BY ts.step_order) 
                FROM treatment_steps ts 
                WHERE ts.treatment_id = t.id), 
               '[]'::json
             ) as steps
      FROM treatments t
      JOIN categories c ON t.category_id = c.id
      WHERE t.slug = $1 AND t.is_published = true AND t.deleted_at IS NULL
    `, [req.params.slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Treatment not found.' });
    }
    
    const row = result.rows[0];
    const formatted = {
      id: row.id,
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      categoryId: row.category_id,
      durationMinutes: row.duration_minutes,
      recoveryText: row.recovery_text,
      priceCents: row.price_cents,
      currency: row.currency,
      imageUrl: row.image_url,
      iconKey: row.icon_key,
      shortDescription: row.short_description,
      scientificText: row.scientific_text,
      category: row.category,
      steps: row.steps
    };
    
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching treatment.' });
  }
});

// GET: All published packages
router.get('/packages', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*,
             COALESCE(
               (SELECT json_agg(json_build_object('position', pi.position, 'description', pi.description) ORDER BY pi.position)
                FROM package_inclusions pi
                WHERE pi.package_id = p.id),
               '[]'::json
             ) as inclusions
      FROM packages p
      WHERE p.is_published = true AND p.deleted_at IS NULL
      ORDER BY p.display_order ASC
    `);
    
    const formatted = result.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      priceCents: row.price_cents,
      valuePriceCents: row.value_price_cents,
      currency: row.currency,
      badge: row.badge,
      displayOrder: row.display_order,
      isPublished: row.is_published,
      inclusions: row.inclusions
    }));
    
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching packages.' });
  }
});

// GET: All active products
router.get('/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM products 
      WHERE is_active = true AND deleted_at IS NULL 
      ORDER BY display_order ASC
    `);
    
    const formatted = result.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      priceCents: row.price_cents,
      currency: row.currency,
      imageUrl: row.image_url,
      description: row.description,
      displayOrder: row.display_order,
      isActive: row.is_active
    }));
    
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching products.' });
  }
});

// GET: All published specialists
router.get('/specialists', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*,
             COALESCE(
               (SELECT json_agg(json_build_object('branch', json_build_object('id', b.id, 'displayName', b.display_name)))
                FROM specialists_branches sb
                JOIN branches b ON sb.branch_id = b.id
                WHERE sb.specialist_id = s.id),
               '[]'::json
             ) as branches
      FROM specialists s
      WHERE s.is_published = true AND s.deleted_at IS NULL
      ORDER BY s.display_order ASC
    `);
    
    const formatted = result.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      fullName: row.full_name,
      role: row.role,
      credential: row.credential,
      focus: row.focus,
      philosophy: row.philosophy,
      portraitUrl: row.portrait_url,
      userId: row.user_id,
      displayOrder: row.display_order,
      isPublished: row.is_published,
      branches: row.branches
    }));
    
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching specialists.' });
  }
});

// GET: Before & After gallery cases
router.get('/before-after', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT bac.*,
             json_build_object('id', t.id, 'name', t.name) as treatment
      FROM before_after_cases bac
      LEFT JOIN treatments t ON bac.treatment_id = t.id
      WHERE bac.is_published = true
      ORDER BY bac.display_order ASC
    `);
    
    const formatted = result.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      treatmentId: row.treatment_id,
      timelineText: row.timeline_text,
      primaryIndications: row.primary_indications,
      therapistNotes: row.therapist_notes,
      satisfactionText: row.satisfaction_text,
      ageProfile: row.age_profile,
      beforeImageUrl: row.before_image_url,
      afterImageUrl: row.after_image_url,
      displayOrder: row.display_order,
      isPublished: row.is_published,
      treatment: row.treatment
    }));
    
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching gallery.' });
  }
});

// GET: Approved reviews
router.get('/reviews', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*,
             json_build_object('id', b.id, 'displayName', b.display_name) as branch
      FROM reviews r
      LEFT JOIN branches b ON r.branch_id = b.id
      WHERE r.status = 'approved' AND r.deleted_at IS NULL
      ORDER BY r.display_order ASC
    `);
    
    const formatted = result.rows.map(row => ({
      id: row.id,
      branchId: row.branch_id,
      authorName: row.author_name,
      quote: row.quote,
      content: row.quote, // Supporting both quote and content
      rating: row.rating,
      status: row.status,
      isFeatured: row.is_featured,
      displayOrder: row.display_order,
      branch: row.branch
    }));
    
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching reviews.' });
  }
});

// GET: Site settings (public-facing variables)
router.get('/site-settings', async (req, res) => {
  try {
    const brandingRes = await pool.query('SELECT value FROM site_settings WHERE key = $1', ['settings.branding']);
    const maintenanceRes = await pool.query('SELECT value FROM site_settings WHERE key = $1', ['settings.maintenance']);
    
    const branding = brandingRes.rows[0]?.value || {};
    const maintenance = maintenanceRes.rows[0]?.value || { maintenance_mode: false };

    res.json({
      hero: branding.hero_stats || { satisfaction_pct: 99, clients_served: 15000, specialists_count: 1 },
      logoUrl: branding.logo_url || '/logo.jpeg',
      faviconUrl: branding.favicon_url || '/favicon.ico',
      maintenanceMode: maintenance.maintenance_mode || false
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching site settings.' });
  }
});

// GET: Availability calculator for a specific date and branch
router.get('/availability', async (req, res) => {
  const { branchId, date } = req.query;

  if (!branchId || !date) {
    return res.status(400).json({ error: 'branchId and date query parameters are required.' });
  }

  try {
    // 1. Get branch operating hours for this weekday
    const weekday = new Date(date).getDay(); // 0 = Sunday, 6 = Saturday
    const hoursRes = await pool.query(
      'SELECT is_closed FROM branch_hours WHERE branch_id = $1 AND day_of_week = $2',
      [branchId, weekday]
    );

    if (hoursRes.rows.length > 0 && hoursRes.rows[0].is_closed) {
      // Clinic is closed on this day of the week
      return res.json([]);
    }

    // 2. Fetch all active branch time slots and count current bookings per slot
    const slotsRes = await pool.query(`
      SELECT 
        bts.id,
        to_char(bts.start_time, 'HH24:MI') as start_time,
        bts.label,
        bts.capacity,
        COALESCE(
          (SELECT COUNT(*)::int 
           FROM bookings b 
           WHERE b.branch_id = bts.branch_id 
             AND b.appointment_date = $2 
             AND to_char(b.start_time, 'HH24:MI') = to_char(bts.start_time, 'HH24:MI')
             AND b.status IN ('pending', 'confirmed')),
          0
        ) as booked
      FROM branch_time_slots bts
      WHERE bts.branch_id = $1 AND bts.is_active = true
      ORDER BY bts.display_order ASC
    `, [branchId, date]);

    const result = slotsRes.rows.map(slot => ({
      id: slot.id,
      startTime: slot.start_time,
      label: slot.label,
      capacity: slot.capacity,
      booked: slot.booked,
      available: slot.booked < slot.capacity
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error checking availability.' });
  }
});

// POST: Create public booking
router.post('/bookings', async (req, res) => {
  const {
    customerFullName,
    customerEmail,
    customerPhone,
    branchId,
    treatmentId,
    packageId,
    specialistId,
    appointmentDate,
    startTime,
    concerns,
    marketingConsent
  } = req.body;

  if (!customerFullName || !customerEmail || !branchId || !appointmentDate || !startTime) {
    return res.status(400).json({ error: 'Missing required fields for booking.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Check slot availability
    const slotCheck = await client.query(`
      SELECT 
        bts.capacity,
        COALESCE(
          (SELECT COUNT(*)::int 
           FROM bookings b 
           WHERE b.branch_id = bts.branch_id 
             AND b.appointment_date = $2 
             AND to_char(b.start_time, 'HH24:MI') = $3
             AND b.status IN ('pending', 'confirmed')),
          0
        ) as booked
      FROM branch_time_slots bts
      WHERE bts.branch_id = $1 AND to_char(bts.start_time, 'HH24:MI') = $3 AND bts.is_active = true
    `, [branchId, appointmentDate, startTime]);

    if (slotCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Selected time slot does not exist or is inactive.' });
    }

    const { capacity, booked } = slotCheck.rows[0];
    if (booked >= capacity) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Selected time slot is already fully booked. Please select another time.' });
    }

    // 2. Insert/Find Customer
    let customerId;
    const emailLower = customerEmail.toLowerCase();
    const custRes = await client.query('SELECT id FROM customers WHERE email = $1', [emailLower]);
    if (custRes.rows.length > 0) {
      customerId = custRes.rows[0].id;
      // Update phone and name if they provided updates
      await client.query(
        'UPDATE customers SET full_name = $1, phone = COALESCE($2, phone), marketing_consent = $3, updated_at = now() WHERE id = $4',
        [customerFullName, customerPhone || null, !!marketingConsent, customerId]
      );
    } else {
      const newCustRes = await client.query(`
        INSERT INTO customers (full_name, email, phone, marketing_consent)
        VALUES ($1, $2, $3, $4) RETURNING id
      `, [customerFullName, emailLower, customerPhone || null, !!marketingConsent]);
      customerId = newCustRes.rows[0].id;
    }

    // 3. Generate reference code
    const reference = `LSA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 4. Create the booking
    const bookingRes = await client.query(`
      INSERT INTO bookings (reference, customer_id, branch_id, treatment_id, package_id, specialist_id, appointment_date, start_time, concerns, status, source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', 'website')
      RETURNING *
    `, [
      reference,
      customerId,
      branchId,
      treatmentId || null,
      packageId || null,
      specialistId || 'laura-andrade', // Default to founder
      appointmentDate,
      startTime,
      concerns || null
    ]);

    const booking = bookingRes.rows[0];

    // 5. Create audit log entry
    await client.query(`
      INSERT INTO booking_audit (booking_id, action, note)
      VALUES ($1, 'created', 'Booking created from website.')
    `, [booking.id]);

    await client.query('COMMIT');

    // Fetch full booking details for response
    const fullBookingRes = await pool.query(`
      SELECT b.*,
             json_build_object('id', c.id, 'fullName', c.full_name, 'email', c.email, 'phone', c.phone) as customer,
             json_build_object('id', br.id, 'displayName', br.display_name, 'city', br.city) as branch,
             CASE WHEN t.id IS NOT NULL THEN json_build_object('id', t.id, 'name', t.name, 'slug', t.slug) ELSE null END as treatment,
             CASE WHEN p.id IS NOT NULL THEN json_build_object('id', p.id, 'name', p.name, 'slug', p.slug) ELSE null END as package
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN branches br ON b.branch_id = br.id
      LEFT JOIN treatments t ON b.treatment_id = t.id
      LEFT JOIN packages p ON b.package_id = p.id
      WHERE b.id = $1
    `, [booking.id]);

    res.status(201).json({
      data: fullBookingRes.rows[0],
      message: 'Booking request successfully received. Our concierge will reach out shortly.'
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Server error processing booking.' });
  } finally {
    client.release();
  }
});

// POST: Contact page message inquiry submission
router.post('/contact-inquiry', async (req, res) => {
  const { fullName, email, phone, subject, message } = req.body;

  if (!fullName || !email || !subject || !message) {
    return res.status(400).json({ error: 'Name, email, subject, and message are required.' });
  }

  try {
    // 1. Create/Find Customer
    let customerId = null;
    const emailLower = email.toLowerCase();
    const custRes = await pool.query('SELECT id FROM customers WHERE email = $1', [emailLower]);
    if (custRes.rows.length > 0) {
      customerId = custRes.rows[0].id;
    } else {
      const newCustRes = await pool.query(`
        INSERT INTO customers (full_name, email, phone)
        VALUES ($1, $2, $3) RETURNING id
      `, [fullName, emailLower, phone || null]);
      customerId = newCustRes.rows[0].id;
    }

    // 2. Save inquiry
    await pool.query(`
      INSERT INTO contact_inquiries (customer_id, full_name, email, phone, subject, message)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [customerId, fullName, emailLower, phone || null, subject, message]);

    res.json({ message: 'Thank you for reaching out. Your message has been sent.' });
  } catch (err) {
    console.error('Contact inquiry error:', err);
    res.status(500).json({ error: 'Server error saving contact inquiry.' });
  }
});

// POST: Product inquiry submission
router.post('/product-inquiry', async (req, res) => {
  const { fullName, email, phone, message, productId } = req.body;

  if (!fullName || !email || !productId) {
    return res.status(400).json({ error: 'Name, email, and product ID are required.' });
  }

  try {
    // 1. Create/Find Customer
    let customerId = null;
    const emailLower = email.toLowerCase();
    const custRes = await pool.query('SELECT id FROM customers WHERE email = $1', [emailLower]);
    if (custRes.rows.length > 0) {
      customerId = custRes.rows[0].id;
    } else {
      const newCustRes = await pool.query(`
        INSERT INTO customers (full_name, email, phone)
        VALUES ($1, $2, $3) RETURNING id
      `, [fullName, emailLower, phone || null]);
      customerId = newCustRes.rows[0].id;
    }

    // 2. Save inquiry
    await pool.query(`
      INSERT INTO product_inquiries (customer_id, product_id, full_name, email, phone, message)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [customerId, productId, fullName, emailLower, phone || null, message || null]);

    res.json({ message: 'Thank you for your interest. We will contact you soon.' });
  } catch (err) {
    console.error('Product inquiry error:', err);
    res.status(500).json({ error: 'Server error saving product inquiry.' });
  }
});

// POST: Newsletter subscribe
router.post('/newsletter/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  try {
    const emailLower = email.toLowerCase();
    
    // Find or create customer
    let customerId = null;
    const custRes = await pool.query('SELECT id FROM customers WHERE email = $1', [emailLower]);
    if (custRes.rows.length > 0) {
      customerId = custRes.rows[0].id;
    } else {
      const newCustRes = await pool.query(`
        INSERT INTO customers (full_name, email)
        VALUES ($1, $2) RETURNING id
      `, ['Newsletter Subscriber', emailLower]);
      customerId = newCustRes.rows[0].id;
    }

    // Subscribe email
    await pool.query(`
      INSERT INTO newsletter_subscribers (customer_id, email, status, source)
      VALUES ($1, $2, 'subscribed', 'footer')
      ON CONFLICT (email) DO UPDATE SET status = 'subscribed', updated_at = now()
    `, [customerId, emailLower]);

    res.json({ message: 'Thank you for subscribing to our newsletter!' });
  } catch (err) {
    console.error('Newsletter error:', err);
    res.status(500).json({ error: 'Server error during newsletter registration.' });
  }
});

export default router;
