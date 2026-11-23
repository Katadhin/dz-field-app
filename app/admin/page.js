import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminEnabled, verifyAdminToken, ADMIN_COOKIE } from "../../lib/adminAuth";
import { ensureVisitSchema, listVisits } from "../../lib/db";

export const dynamic = "force-dynamic";

function when(row) {
  const d = row.created_at || row.captured_at;
  if (!d) return "";
  try {
    return new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default async function AdminPage() {
  if (!adminEnabled()) redirect("/admin/login");

  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(token)) redirect("/admin/login");

  let rows = [];
  let dbError = false;
  try {
    await ensureVisitSchema();
    rows = await listVisits(200);
  } catch {
    dbError = true;
  }

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">d&amp;z</span>
        <span className="brand-sub">Admin</span>
        <nav className="topbar-right nav-row">
          <a className="link light" href="/admin/sort-test">
            sort test
          </a>
          <form method="post" action="/api/admin/logout">
            <button className="link light" type="submit">
              sign out
            </button>
          </form>
        </nav>
      </header>
      <main className="content">
        <div className="admin-head">
          <h1 className="h1">Captures</h1>
          <span className="count">{dbError ? "" : `${rows.length} shown`}</span>
        </div>

        {dbError ? (
          <div className="card">
            <p className="hint">
              No database is connected yet, so there is nothing to show. Once the app is deployed on Render with its
              Postgres database, captures appear here.
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="card">
            <p className="hint">No captures yet. Log a visit from the field app and it will show up here.</p>
          </div>
        ) : (
          <ul className="list">
            {rows.map((r) => (
              <li className="row" key={r.id}>
                <div className="row-top">
                  <span className="row-store">{r.store_number ? `Store ${r.store_number}` : "No store"}</span>
                  <span className="row-when">{when(r)}</span>
                </div>
                <div className="row-rep">{r.rep_name || "Unknown rep"}</div>
                <div className="row-note">{r.note_text}</div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
