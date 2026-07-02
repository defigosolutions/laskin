/**
 * import_db.mjs
 * Imports a pg_dump SQL file into the database via the Node.js pg connection.
 * Handles COPY ... FROM stdin blocks by converting them to bulk INSERTs.
 *
 * Usage:
 *   node import_db.mjs /path/to/clean_db.sql
 */

import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host:     process.env.PGHOST     || 'localhost',
        port:     parseInt(process.env.PGPORT || '5432'),
        database: process.env.PGDATABASE,
        user:     process.env.PGUSER,
        password: process.env.PGPASSWORD,
        ssl: { rejectUnauthorized: false }
      }
);

const sqlFile = process.argv[2] || '/home/laskyhbh/clean_db.sql';

function parseDump(content) {
  const segments = [];
  const lines   = content.split('\n');
  let i = 0;
  let sqlBuf = '';

  while (i < lines.length) {
    const line = lines[i];

    // Detect start of a COPY block
    const copyMatch = line.match(/^COPY\s+(\S+)\s+\(([^)]+)\)\s+FROM\s+stdin;/i);
    if (copyMatch) {
      // Flush any accumulated SQL first
      if (sqlBuf.trim()) {
        segments.push({ type: 'sql', content: sqlBuf });
        sqlBuf = '';
      }

      const table   = copyMatch[1];
      const columns = copyMatch[2].split(',').map(c => c.trim().replace(/^"(.*)"$/, '$1'));
      const rows    = [];

      i++;
      // Read data lines until the terminator \.
      while (i < lines.length && lines[i] !== '\\.') {
        if (lines[i] !== '') rows.push(lines[i]);
        i++;
      }

      segments.push({ type: 'copy', table, columns, rows });
    } else {
      sqlBuf += line + '\n';
    }
    i++;
  }

  if (sqlBuf.trim()) {
    segments.push({ type: 'sql', content: sqlBuf });
  }

  return segments;
}

// Split a SQL buffer into individual statements (simple ; splitter)
function splitStatements(sql) {
  const stmts = [];
  let buf = '';
  let inStr = false;
  let inDollar = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (ch === "'" && !inDollar) {
      inStr = !inStr;
      buf += ch;
    } else if (!inStr && ch === '$' && next === '$') {
      inDollar = !inDollar;
      buf += ch;
    } else if (!inStr && !inDollar && ch === ';') {
      buf += ch;
      const stmt = buf.trim();
      if (stmt.length > 1) stmts.push(stmt);
      buf = '';
    } else {
      buf += ch;
    }
  }

  const trailing = buf.trim();
  if (trailing.length > 1) stmts.push(trailing);
  return stmts;
}

async function run() {
  if (!fs.existsSync(sqlFile)) {
    console.error(`❌  File not found: ${sqlFile}`);
    console.error(`    Usage: node import_db.mjs /path/to/clean_db.sql`);
    process.exit(1);
  }

  console.log(`📄  Reading: ${sqlFile}`);
  const content  = fs.readFileSync(sqlFile, 'utf8');
  const segments = parseDump(content);

  console.log(`🔗  Connecting to database...`);
  const client = await pool.connect();

  let tableCount   = 0;
  let copyCount    = 0;
  let rowsInserted = 0;

  try {
    await client.query('BEGIN');

    for (const seg of segments) {
      if (seg.type === 'sql') {
        const stmts = splitStatements(seg.content);
        for (const stmt of stmts) {
          // Skip comments and empty
          if (stmt.startsWith('--') || stmt.replace(/\s/g, '') === '') continue;
          try {
            await client.query(stmt);
            if (/^CREATE\s+TABLE/i.test(stmt)) {
              tableCount++;
              const m = stmt.match(/CREATE\s+TABLE\s+\S+\.(\S+)/i) ||
                        stmt.match(/CREATE\s+TABLE\s+(\S+)/i);
              if (m) console.log(`  ✅ Table created: ${m[1]}`);
            }
          } catch (err) {
            // Log but continue — objects may already exist
            if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
              console.warn(`  ⚠️  DDL warning: ${err.message.split('\n')[0]}`);
            }
          }
        }

      } else if (seg.type === 'copy') {
        if (seg.rows.length === 0) continue;

        copyCount++;
        console.log(`  📥 Importing table ${seg.table} (${seg.rows.length} rows)...`);

        for (const rowLine of seg.rows) {
          const rawVals = rowLine.split('\t');
          const values  = rawVals.map(v => {
            if (v === '\\N') return null;
            // Unescape common pg_dump escape sequences
            return v
              .replace(/\\t/g, '\t')
              .replace(/\\n/g, '\n')
              .replace(/\\r/g, '\r')
              .replace(/\\\\/g, '\\');
          });

          const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
          const quotedCols   = seg.columns.map(c => `"${c}"`).join(', ');

          try {
            await client.query(
              `INSERT INTO ${seg.table} (${quotedCols}) VALUES (${placeholders})`,
              values
            );
            rowsInserted++;
          } catch (err) {
            if (!err.message.includes('duplicate') && !err.message.includes('unique')) {
              console.warn(`    ⚠️  Row skip in ${seg.table}: ${err.message.split('\n')[0]}`);
            }
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log('\n🎉  Import complete!');
    console.log(`    Tables created : ${tableCount}`);
    console.log(`    Tables with data: ${copyCount}`);
    console.log(`    Total rows inserted: ${rowsInserted}`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌  Fatal error — rolled back.', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
