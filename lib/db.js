import pg from "pg";

const { Pool } = pg;

let pool = null;

export function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    const url = process.env.DATABASE_URL;
    const isLocal = url.includes("localhost") || url.includes("127.0.0.1");
    pool = new Pool({
      connectionString: url,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function checkDb() {
  const p = getPool();
  if (!p) return { ok: false, message: "No database configured yet" };
  try {
    await p.query("select 1");
    return { ok: true, message: "Database connected" };
  } catch (err) {
    return { ok: false, message: "Database not reachable" };
  }
}

let schemaReady = null;

// Creates the visit_notes table once per process. client_id is unique so a
// retried upload never creates a duplicate row.
export function ensureVisitSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const p = getPool();
      if (!p) throw new Error("no database configured");
      await p.query(`
        CREATE TABLE IF NOT EXISTS visit_notes (
          id BIGSERIAL PRIMARY KEY,
          client_id TEXT UNIQUE,
          rep_name TEXT,
          store_number TEXT,
          note_text TEXT NOT NULL,
          source TEXT,
          captured_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `);
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

export async function saveVisit({ client_id, rep_name, store_number, note_text, source, captured_at }) {
  const p = getPool();
  if (!p) throw new Error("no database configured");
  const res = await p.query(
    `
    INSERT INTO visit_notes (client_id, rep_name, store_number, note_text, source, captured_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (client_id) DO UPDATE
      SET rep_name = EXCLUDED.rep_name,
          store_number = EXCLUDED.store_number,
          note_text = EXCLUDED.note_text,
          source = EXCLUDED.source,
          captured_at = EXCLUDED.captured_at
    RETURNING id
    `,
    [client_id || null, rep_name || null, store_number || null, note_text, source || null, captured_at || null]
  );
  return res.rows[0];
}
