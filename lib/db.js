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
  if (!p) {
    return { ok: false, message: "No database configured yet" };
  }
  try {
    await p.query("select 1");
    return { ok: true, message: "Database connected" };
  } catch (err) {
    return { ok: false, message: "Database not reachable" };
  }
}
