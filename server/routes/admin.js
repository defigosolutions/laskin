import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import pool from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Configure secure file uploads with Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, PNG, and WEBP image uploads are allowed.'));
  }
});

// Protect all admin endpoints
router.use(authenticateToken);

// ==========================================
// 1. Dashboard Stats
// ==========================================
router.get('/dashboard/stats', async (req, res) => {
  try {
    const branches = await pool.query('SELECT COUNT(*)::int FROM branches');
    const treatments = await pool.query('SELECT COUNT(*)::int FROM treatments WHERE deleted_at IS NULL');
    const packages = await pool.query('SELECT COUNT(*)::int FROM packages WHERE deleted_at IS NULL');
    const products = await pool.query('SELECT COUNT(*)::int FROM products WHERE deleted_at IS NULL');
    const specialists = await pool.query('SELECT COUNT(*)::int FROM specialists WHERE deleted_at IS NULL');
    const reviewsPending = await pool.query("SELECT COUNT(*)::int FROM reviews WHERE status = 'pending' AND deleted_at IS NULL");
    
    const recentBookings = await pool.query(`
      SELECT b.*, 
             c.full_name as customer_name, c.email as customer_email,
             COALESCE(t.name, p.name) as service_name
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      LEFT JOIN treatments t ON b.treatment_id = t.id
      LEFT JOIN packages p ON b.package_id = p.id
      ORDER BY b.created_at DESC LIMIT 5
    `);

    const recentInquiries = await pool.query(`
      SELECT * FROM contact_inquiries 
      ORDER BY created_at DESC LIMIT 5
    `);

    res.json({
      branchesCount: branches.rows[0].count,
      treatmentsCount: treatments.rows[0].count,
      packagesCount: packages.rows[0].count,
      productsCount: products.rows[0].count,
      specialistsCount: specialists.rows[0].count,
      reviewsPendingCount: reviewsPending.rows[0].count,
      recentBookings: recentBookings.rows,
      recentInquiries: recentInquiries.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
});

// ==========================================
// 2. Bookings Management
// ==========================================
router.get('/bookings', async (req, res) => {
  const { status, search } = req.query;
  try {
    let query = `
      SELECT b.*, 
             json_build_object('id', c.id, 'fullName', c.full_name, 'email', c.email, 'phone', c.phone) as customer,
             json_build_object('id', br.id, 'displayName', br.display_name, 'city', br.city) as branch,
             CASE WHEN t.id IS NOT NULL THEN json_build_object('id', t.id, 'name', t.name, 'slug', t.slug) ELSE null END as treatment,
             CASE WHEN p.id IS NOT NULL THEN json_build_object('id', p.id, 'name', p.name, 'slug', p.slug) ELSE null END as package,
             COALESCE(
               (SELECT json_agg(json_build_object('id', ba.id, 'action', ba.action, 'note', ba.note, 'createdAt', ba.created_at) ORDER BY ba.created_at DESC)
                FROM booking_audit ba
                WHERE ba.booking_id = b.id),
               '[]'::json
             ) as audit
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN branches br ON b.branch_id = br.id
      LEFT JOIN treatments t ON b.treatment_id = t.id
      LEFT JOIN packages p ON b.package_id = p.id
    `;
    const params = [];
    const wheres = [];

    if (status) {
      wheres.push(`b.status = $${wheres.length + 1}`);
      params.push(status);
    }
    if (search) {
      wheres.push(`(c.full_name ILIKE $${wheres.length + 1} OR c.email ILIKE $${wheres.length + 1} OR b.reference ILIKE $${wheres.length + 1})`);
      params.push(`%${search}%`);
    }

    if (wheres.length > 0) {
      query += ' WHERE ' + wheres.join(' AND ');
    }

    query += ' ORDER BY b.appointment_date DESC, b.start_time DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

router.patch('/bookings/:id', async (req, res) => {
  const { status, specialistId, appointmentDate, startTime, concerns } = req.body;
  const bookingId = req.params.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get original state
    const originalRes = await client.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    if (originalRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking not found.' });
    }
    const original = originalRes.rows[0];

    const fields = [];
    const params = [];
    let paramIdx = 1;

    if (status !== undefined) {
      fields.push(`status = $${paramIdx++}`);
      params.push(status);
    }
    if (specialistId !== undefined) {
      fields.push(`specialist_id = $${paramIdx++}`);
      params.push(specialistId);
    }
    if (appointmentDate !== undefined) {
      fields.push(`appointment_date = $${paramIdx++}`);
      params.push(appointmentDate);
    }
    if (startTime !== undefined) {
      fields.push(`start_time = $${paramIdx++}`);
      params.push(startTime);
    }
    if (concerns !== undefined) {
      fields.push(`concerns = $${paramIdx++}`);
      params.push(concerns);
    }

    if (fields.length > 0) {
      params.push(bookingId);
      await client.query(`
        UPDATE bookings 
        SET ${fields.join(', ')}, updated_at = now()
        WHERE id = $${paramIdx}
      `, params);

      // Audit logs
      let note = 'Booking details updated.';
      if (status !== undefined && status !== original.status) {
        note = `Booking status changed from ${original.status} to ${status}.`;
        if (status === 'confirmed') {
          await client.query('UPDATE bookings SET confirmed_at = now(), confirmed_by_user_id = $1 WHERE id = $2', [req.user.id, bookingId]);
        } else if (status === 'cancelled') {
          await client.query('UPDATE bookings SET cancelled_at = now() WHERE id = $2', [bookingId]);
        }
      }

      await client.query(`
        INSERT INTO booking_audit (booking_id, actor_user_id, action, from_state, to_state, note)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        bookingId, 
        req.user.id, 
        status !== undefined && status !== original.status ? status : 'updated', 
        JSON.stringify(original), 
        JSON.stringify({ ...original, status, specialistId, appointmentDate, startTime, concerns }), 
        note
      ]);
    }

    await client.query('COMMIT');
    res.json({ message: 'Booking updated successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to update booking.' });
  } finally {
    client.release();
  }
});

router.delete('/bookings/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM bookings WHERE id = $1', [req.params.id]);
    res.json({ message: 'Booking deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete booking.' });
  }
});

router.post('/bookings/:id/notes', async (req, res) => {
  const { note } = req.body;
  if (!note) {
    return res.status(400).json({ error: 'Note content is required.' });
  }
  try {
    await pool.query(`
      INSERT INTO booking_audit (booking_id, actor_user_id, action, note)
      VALUES ($1, $2, 'note_added', $3)
    `, [req.params.id, req.user.id, note]);
    res.json({ message: 'Note added to booking history.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add note.' });
  }
});

// ==========================================
// 3. Services (Treatments) CRUD
// ==========================================
router.get('/treatments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*,
             COALESCE(
               (SELECT json_agg(ts.description ORDER BY ts.step_order) 
                FROM treatment_steps ts 
                WHERE ts.treatment_id = t.id), 
               '[]'::json
             ) as steps
      FROM treatments t
      WHERE t.deleted_at IS NULL
      ORDER BY t.display_order ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch treatments.' });
  }
});

router.post('/treatments', async (req, res) => {
  const { id, name, tagline, categoryId, durationMinutes, recoveryText, priceCents, imageUrl, iconKey, shortDescription, scientificText, steps } = req.body;
  const slug = id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check slug uniqueness
    const check = await client.query('SELECT 1 FROM treatments WHERE slug = $1', [slug]);
    if (check.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'A service with this ID/Slug already exists.' });
    }

    const orderRes = await client.query('SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM treatments');
    const displayOrder = orderRes.rows[0].next_order;

    await client.query(`
      INSERT INTO treatments (id, slug, name, tagline, category_id, duration_minutes, recovery_text, price_cents, image_url, icon_key, short_description, scientific_text, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [id, slug, name, tagline, categoryId, durationMinutes, recoveryText, priceCents, imageUrl, iconKey, shortDescription, scientificText, displayOrder]);

    if (steps && Array.isArray(steps)) {
      for (let i = 0; i < steps.length; i++) {
        await client.query(`
          INSERT INTO treatment_steps (treatment_id, step_order, description)
          VALUES ($1, $2, $3)
        `, [id, i + 1, steps[i]]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Service created successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create service.' });
  } finally {
    client.release();
  }
});

router.patch('/treatments/:id', async (req, res) => {
  const { name, tagline, categoryId, durationMinutes, recoveryText, priceCents, imageUrl, iconKey, shortDescription, scientificText, steps, isPublished } = req.body;
  const treatmentId = req.params.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update service columns
    const fields = [];
    const params = [];
    let paramIdx = 1;

    if (name !== undefined) { fields.push(`name = $${paramIdx++}`); params.push(name); }
    if (tagline !== undefined) { fields.push(`tagline = $${paramIdx++}`); params.push(tagline); }
    if (categoryId !== undefined) { fields.push(`category_id = $${paramIdx++}`); params.push(categoryId); }
    if (durationMinutes !== undefined) { fields.push(`duration_minutes = $${paramIdx++}`); params.push(durationMinutes); }
    if (recoveryText !== undefined) { fields.push(`recovery_text = $${paramIdx++}`); params.push(recoveryText); }
    if (priceCents !== undefined) { fields.push(`price_cents = $${paramIdx++}`); params.push(priceCents); }
    if (imageUrl !== undefined) { fields.push(`image_url = $${paramIdx++}`); params.push(imageUrl); }
    if (iconKey !== undefined) { fields.push(`icon_key = $${paramIdx++}`); params.push(iconKey); }
    if (shortDescription !== undefined) { fields.push(`short_description = $${paramIdx++}`); params.push(shortDescription); }
    if (scientificText !== undefined) { fields.push(`scientific_text = $${paramIdx++}`); params.push(scientificText); }
    if (isPublished !== undefined) { fields.push(`is_published = $${paramIdx++}`); params.push(isPublished); }

    if (fields.length > 0) {
      params.push(treatmentId);
      await client.query(`
        UPDATE treatments 
        SET ${fields.join(', ')}, updated_at = now()
        WHERE id = $${paramIdx}
      `, params);
    }

    // Update steps if provided
    if (steps && Array.isArray(steps)) {
      await client.query('DELETE FROM treatment_steps WHERE treatment_id = $1', [treatmentId]);
      for (let i = 0; i < steps.length; i++) {
        await client.query(`
          INSERT INTO treatment_steps (treatment_id, step_order, description)
          VALUES ($1, $2, $3)
        `, [treatmentId, i + 1, steps[i]]);
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Service updated successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to update service.' });
  } finally {
    client.release();
  }
});

router.delete('/treatments/:id', async (req, res) => {
  try {
    await pool.query('UPDATE treatments SET deleted_at = now() WHERE id = $1', [req.params.id]);
    res.json({ message: 'Service soft-deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete service.' });
  }
});

router.put('/treatments/reorder', async (req, res) => {
  const { order } = req.body; // Array of ids/slugs in new order
  if (!order || !Array.isArray(order)) {
    return res.status(400).json({ error: 'Order array is required.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < order.length; i++) {
      await client.query('UPDATE treatments SET display_order = $1 WHERE id = $2', [i + 1, order[i]]);
    }
    await client.query('COMMIT');
    res.json({ message: 'Services reordered.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to reorder services.' });
  } finally {
    client.release();
  }
});

// ==========================================
// 4. Treatment Packages CRUD
// ==========================================
router.get('/packages', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*,
             COALESCE(
               (SELECT json_agg(pi.description ORDER BY pi.position)
                FROM package_inclusions pi
                WHERE pi.package_id = p.id),
               '[]'::json
             ) as inclusions
      FROM packages p
      WHERE p.deleted_at IS NULL
      ORDER BY p.display_order ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch packages.' });
  }
});

router.post('/packages', async (req, res) => {
  const { id, name, tagline, priceCents, valuePriceCents, badge, inclusions } = req.body;
  const slug = id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const check = await client.query('SELECT 1 FROM packages WHERE slug = $1', [slug]);
    if (check.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'A package with this ID already exists.' });
    }

    const orderRes = await client.query('SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM packages');
    const displayOrder = orderRes.rows[0].next_order;

    await client.query(`
      INSERT INTO packages (id, slug, name, tagline, price_cents, value_price_cents, badge, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [id, slug, name, tagline, priceCents, valuePriceCents || null, badge || null, displayOrder]);

    if (inclusions && Array.isArray(inclusions)) {
      for (let i = 0; i < inclusions.length; i++) {
        await client.query(`
          INSERT INTO package_inclusions (package_id, position, description)
          VALUES ($1, $2, $3)
        `, [id, i + 1, inclusions[i]]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Package created.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create package.' });
  } finally {
    client.release();
  }
});

router.patch('/packages/:id', async (req, res) => {
  const { name, tagline, priceCents, valuePriceCents, badge, inclusions, isPublished } = req.body;
  const packageId = req.params.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const fields = [];
    const params = [];
    let paramIdx = 1;

    if (name !== undefined) { fields.push(`name = $${paramIdx++}`); params.push(name); }
    if (tagline !== undefined) { fields.push(`tagline = $${paramIdx++}`); params.push(tagline); }
    if (priceCents !== undefined) { fields.push(`price_cents = $${paramIdx++}`); params.push(priceCents); }
    if (valuePriceCents !== undefined) { fields.push(`value_price_cents = $${paramIdx++}`); params.push(valuePriceCents); }
    if (badge !== undefined) { fields.push(`badge = $${paramIdx++}`); params.push(badge); }
    if (isPublished !== undefined) { fields.push(`is_published = $${paramIdx++}`); params.push(isPublished); }

    if (fields.length > 0) {
      params.push(packageId);
      await client.query(`
        UPDATE packages 
        SET ${fields.join(', ')}, updated_at = now()
        WHERE id = $${paramIdx}
      `, params);
    }

    if (inclusions && Array.isArray(inclusions)) {
      await client.query('DELETE FROM package_inclusions WHERE package_id = $1', [packageId]);
      for (let i = 0; i < inclusions.length; i++) {
        await client.query(`
          INSERT INTO package_inclusions (package_id, position, description)
          VALUES ($1, $2, $3)
        `, [packageId, i + 1, inclusions[i]]);
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Package updated.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to update package.' });
  } finally {
    client.release();
  }
});

router.delete('/packages/:id', async (req, res) => {
  try {
    await pool.query('UPDATE packages SET deleted_at = now() WHERE id = $1', [req.params.id]);
    res.json({ message: 'Package soft-deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete package.' });
  }
});

router.put('/packages/reorder', async (req, res) => {
  const { order } = req.body;
  if (!order || !Array.isArray(order)) {
    return res.status(400).json({ error: 'Order array is required.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < order.length; i++) {
      await client.query('UPDATE packages SET display_order = $1 WHERE id = $2', [i + 1, order[i]]);
    }
    await client.query('COMMIT');
    res.json({ message: 'Packages reordered.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to reorder packages.' });
  } finally {
    client.release();
  }
});

// ==========================================
// 5. Products CRUD
// ==========================================
router.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE deleted_at IS NULL ORDER BY display_order ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

router.post('/products', async (req, res) => {
  const { name, tagline, priceCents, imageUrl, description, isActive } = req.body;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    const orderRes = await pool.query('SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM products');
    const displayOrder = orderRes.rows[0].next_order;

    await pool.query(`
      INSERT INTO products (slug, name, tagline, price_cents, image_url, description, display_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [slug, name, tagline, priceCents, imageUrl, description, displayOrder, isActive !== undefined ? isActive : true]);

    res.status(201).json({ message: 'Product created.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

router.patch('/products/:id', async (req, res) => {
  const { name, tagline, priceCents, imageUrl, description, isActive } = req.body;
  const productId = req.params.id;

  try {
    const fields = [];
    const params = [];
    let paramIdx = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramIdx++}`); params.push(name);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      fields.push(`slug = $${paramIdx++}`); params.push(slug);
    }
    if (tagline !== undefined) { fields.push(`tagline = $${paramIdx++}`); params.push(tagline); }
    if (priceCents !== undefined) { fields.push(`price_cents = $${paramIdx++}`); params.push(priceCents); }
    if (imageUrl !== undefined) { fields.push(`image_url = $${paramIdx++}`); params.push(imageUrl); }
    if (description !== undefined) { fields.push(`description = $${paramIdx++}`); params.push(description); }
    if (isActive !== undefined) { fields.push(`is_active = $${paramIdx++}`); params.push(isActive); }

    if (fields.length > 0) {
      params.push(productId);
      await pool.query(`
        UPDATE products 
        SET ${fields.join(', ')}, updated_at = now()
        WHERE id = $${paramIdx}
      `, params);
    }

    res.json({ message: 'Product updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await pool.query('UPDATE products SET deleted_at = now() WHERE id = $1', [req.params.id]);
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

router.put('/products/reorder', async (req, res) => {
  const { order } = req.body;
  if (!order || !Array.isArray(order)) {
    return res.status(400).json({ error: 'Order array is required.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < order.length; i++) {
      await client.query('UPDATE products SET display_order = $1 WHERE id = $2', [i + 1, order[i]]);
    }
    await client.query('COMMIT');
    res.json({ message: 'Products reordered.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to reorder products.' });
  } finally {
    client.release();
  }
});

// ==========================================
// 6. Specialists Management (Laura Andrade Profile)
// ==========================================
router.get('/specialists', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM specialists WHERE deleted_at IS NULL ORDER BY display_order ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch specialists.' });
  }
});

router.patch('/specialists/:id', async (req, res) => {
  const { fullName, role, credential, focus, philosophy, portraitUrl } = req.body;
  const specId = req.params.id;

  try {
    const fields = [];
    const params = [];
    let paramIdx = 1;

    if (fullName !== undefined) { fields.push(`full_name = $${paramIdx++}`); params.push(fullName); }
    if (role !== undefined) { fields.push(`role = $${paramIdx++}`); params.push(role); }
    if (credential !== undefined) { fields.push(`credential = $${paramIdx++}`); params.push(credential); }
    if (focus !== undefined) { fields.push(`focus = $${paramIdx++}`); params.push(focus); }
    if (philosophy !== undefined) { fields.push(`philosophy = $${paramIdx++}`); params.push(philosophy); }
    if (portraitUrl !== undefined) { fields.push(`portrait_url = $${paramIdx++}`); params.push(portraitUrl); }

    if (fields.length > 0) {
      params.push(specId);
      await pool.query(`
        UPDATE specialists 
        SET ${fields.join(', ')}, updated_at = now()
        WHERE id = $${paramIdx}
      `, params);
    }

    res.json({ message: 'Specialist profile updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update specialist profile.' });
  }
});

// ==========================================
// 7. Reviews (Testimonials) Moderation
// ==========================================
router.get('/reviews', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reviews WHERE deleted_at IS NULL ORDER BY status ASC, created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

router.patch('/reviews/:id', async (req, res) => {
  const { status, isFeatured } = req.body;
  const reviewId = req.params.id;

  try {
    const fields = [];
    const params = [];
    let paramIdx = 1;

    if (status !== undefined) { fields.push(`status = $${paramIdx++}`); params.push(status); }
    if (isFeatured !== undefined) { fields.push(`is_featured = $${paramIdx++}`); params.push(isFeatured); }

    if (fields.length > 0) {
      params.push(reviewId);
      await pool.query(`
        UPDATE reviews 
        SET ${fields.join(', ')}, updated_at = now()
        WHERE id = $${paramIdx}
      `, params);
    }

    res.json({ message: 'Review status updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to moderate review.' });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    await pool.query('UPDATE reviews SET deleted_at = now() WHERE id = $1', [req.params.id]);
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete review.' });
  }
});

// ==========================================
// 8. Contact Form Inquiries
// ==========================================
router.get('/contact-inquiries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact_inquiries ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch inquiries.' });
  }
});

router.patch('/contact-inquiries/:id/read', async (req, res) => {
  const { isRead } = req.body;
  try {
    await pool.query('UPDATE contact_inquiries SET is_read = $1 WHERE id = $2', [isRead, req.params.id]);
    res.json({ message: 'Inquiry read state updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update inquiry.' });
  }
});

router.delete('/contact-inquiries/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM contact_inquiries WHERE id = $1', [req.params.id]);
    res.json({ message: 'Inquiry deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete inquiry.' });
  }
});

// ==========================================
// 9. Newsletter Subscribers
// ==========================================
router.get('/newsletter/subscribers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch subscribers.' });
  }
});

router.delete('/newsletter/subscribers/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM newsletter_subscribers WHERE id = $1', [req.params.id]);
    res.json({ message: 'Newsletter subscriber removed.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete subscriber.' });
  }
});

// ==========================================
// 10. Before & After Cases CRUD
// ==========================================
router.get('/before-after', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM before_after_cases ORDER BY display_order ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cases.' });
  }
});

router.post('/before-after', async (req, res) => {
  const { id, title, subtitle, treatmentId, timelineText, primaryIndications, therapistNotes, satisfactionText, ageProfile, beforeImageUrl, afterImageUrl } = req.body;
  const slug = id;

  try {
    const check = await pool.query('SELECT 1 FROM before_after_cases WHERE slug = $1', [slug]);
    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'A case study with this ID already exists.' });
    }

    const orderRes = await pool.query('SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM before_after_cases');
    const displayOrder = orderRes.rows[0].next_order;

    await pool.query(`
      INSERT INTO before_after_cases (id, slug, title, subtitle, treatment_id, timeline_text, primary_indications, therapist_notes, satisfaction_text, age_profile, before_image_url, after_image_url, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [id, slug, title, subtitle || null, treatmentId || null, timelineText || null, primaryIndications || null, therapistNotes || null, satisfactionText || null, ageProfile || null, beforeImageUrl, afterImageUrl, displayOrder]);

    res.status(201).json({ message: 'Gallery case created.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create gallery case.' });
  }
});

router.patch('/before-after/:id', async (req, res) => {
  const { title, subtitle, treatmentId, timelineText, primaryIndications, therapistNotes, satisfactionText, ageProfile, beforeImageUrl, afterImageUrl, isPublished } = req.body;
  const caseId = req.params.id;

  try {
    const fields = [];
    const params = [];
    let paramIdx = 1;

    if (title !== undefined) { fields.push(`title = $${paramIdx++}`); params.push(title); }
    if (subtitle !== undefined) { fields.push(`subtitle = $${paramIdx++}`); params.push(subtitle); }
    if (treatmentId !== undefined) { fields.push(`treatment_id = $${paramIdx++}`); params.push(treatmentId); }
    if (timelineText !== undefined) { fields.push(`timeline_text = $${paramIdx++}`); params.push(timelineText); }
    if (primaryIndications !== undefined) { fields.push(`primary_indications = $${paramIdx++}`); params.push(primaryIndications); }
    if (therapistNotes !== undefined) { fields.push(`therapist_notes = $${paramIdx++}`); params.push(therapistNotes); }
    if (satisfactionText !== undefined) { fields.push(`satisfaction_text = $${paramIdx++}`); params.push(satisfactionText); }
    if (ageProfile !== undefined) { fields.push(`age_profile = $${paramIdx++}`); params.push(ageProfile); }
    if (beforeImageUrl !== undefined) { fields.push(`before_image_url = $${paramIdx++}`); params.push(beforeImageUrl); }
    if (afterImageUrl !== undefined) { fields.push(`after_image_url = $${paramIdx++}`); params.push(afterImageUrl); }
    if (isPublished !== undefined) { fields.push(`is_published = $${paramIdx++}`); params.push(isPublished); }

    if (fields.length > 0) {
      params.push(caseId);
      await pool.query(`
        UPDATE before_after_cases 
        SET ${fields.join(', ')}, updated_at = now()
        WHERE id = $${paramIdx}
      `, params);
    }

    res.json({ message: 'Gallery case updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update gallery case.' });
  }
});

router.delete('/before-after/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM before_after_cases WHERE id = $1', [req.params.id]);
    res.json({ message: 'Gallery case deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete gallery case.' });
  }
});

// ==========================================
// 11. Key-Value Settings & Configuration
// ==========================================
router.get('/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM site_settings');
    const settingsMap = {};
    result.rows.forEach(r => {
      settingsMap[r.key] = r.value;
    });
    res.json(settingsMap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
});

router.put('/settings/:key', async (req, res) => {
  const { value } = req.body;
  const { key } = req.params;

  if (value === undefined) {
    return res.status(400).json({ error: 'Value is required.' });
  }

  try {
    await pool.query(`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ($1, $2, now())
      ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = now()
    `, [key, JSON.stringify(value)]);

    res.json({ message: `Setting '${key}' updated successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// ==========================================
// 12. SMTP Config Verification Email Tester
// ==========================================
router.post('/settings/smtp/test', async (req, res) => {
  const { host, port, username, password, encryption, sender_email } = req.body;

  if (!host || !port || !sender_email) {
    return res.status(400).json({ error: 'SMTP Host, Port, and Sender Email are required.' });
  }

  try {
    // Create test transporter
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: encryption === 'SSL' || port == 465, // True for 465, false for others
      auth: username ? {
        user: username,
        pass: password
      } : undefined,
      tls: {
        rejectUnauthorized: false
      }
    });

    // Send test email
    await transporter.sendMail({
      from: sender_email,
      to: sender_email, // Send test to self
      subject: 'LA Skin Clinic - SMTP Test Verification',
      text: 'Congratulations! Your SMTP Server is correctly configured and authentication has succeeded.',
      html: '<h3>LA Skin & Aesthetics Admin Portal</h3><p>Congratulations! Your SMTP Server is correctly configured and authentication has succeeded.</p>'
    });

    res.json({ message: 'SMTP Test email sent successfully! Please check your inbox.' });
  } catch (err) {
    console.error('SMTP test failure:', err);
    res.status(500).json({ error: `SMTP Connection test failed: ${err.message}` });
  }
});

// ==========================================
// 13. System Database Backup JSON exporter
// ==========================================
router.get('/backup', async (req, res) => {
  try {
    const tables = [
      'users', 'branches', 'branch_hours', 'branch_time_slots', 'categories',
      'treatments', 'treatment_steps', 'packages', 'package_inclusions', 'products',
      'specialists', 'before_after_cases', 'reviews', 'customers', 'bookings',
      'booking_audit', 'newsletter_subscribers', 'contact_inquiries', 'site_settings'
    ];

    const backupData = {};

    for (const table of tables) {
      const result = await pool.query(`SELECT * FROM "${table}"`);
      backupData[table] = result.rows;
    }

    res.setHeader('Content-disposition', `attachment; filename=laskin_db_backup_${Date.now()}.json`);
    res.setHeader('Content-type', 'application/json');
    res.write(JSON.stringify(backupData, null, 2));
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database JSON backup extraction failed.' });
  }
});

// ==========================================
// 14. File/Image Upload
// ==========================================
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl: fileUrl });
});

export default router;
