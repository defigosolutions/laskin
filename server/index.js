import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
import { pool } from './db.js';

import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import publicRouter from './routes/public.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// 1. Core middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP for ease of local assets & fonts resolution
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: [CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. Serve uploaded static files
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// 3. API Routes registration
app.use('/api/v1/admin/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/public', publicRouter);

// Root test endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Dynamic Sitemap Generator
app.get('/sitemap.xml', async (req, res) => {
  try {
    const result = await pool.query(`SELECT value FROM site_settings WHERE key = 'settings.seo_routes'`);
    let urls = [];
    if (result.rows.length > 0) {
      urls = result.rows[0].value;
    }
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n';
    
    urls.forEach(route => {
      // Avoid adding admin routes if they somehow get added
      if (!route.path.startsWith('/laskin-manage')) {
        xml += '  <url>\\n';
        xml += \`    <loc>https://laskinandaesthetics.com\${route.path === '/' ? '' : route.path}</loc>\\n\`;
        xml += '    <changefreq>weekly</changefreq>\\n';
        xml += '    <priority>0.8</priority>\\n';
        xml += '  </url>\\n';
      }
    });
    
    xml += '</urlset>';
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error generating sitemap');
  }
});

// 4. Serve React frontend static files in production
const distPath = path.join(process.cwd(), '..', 'dist');
app.use(express.static(distPath));

// Catch-all route to serve the index.html SPA in production
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/v1')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      // If index.html doesn't exist, we are in development, just return status 404 or health status
      res.status(404).send('Not Found');
    }
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`LA Skin Express Server running on port ${PORT}`);
  console.log(`Uploads serving from: ${uploadsPath}`);
  console.log(`===================================================`);
});
