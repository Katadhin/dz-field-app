import { checkDb } from "../lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = await checkDb();
  return (
    <main className="wrap">
      <div className="wordmark">d&amp;z</div>
      <div className="app-name">Field App</div>
      <div className="tagline">every cart. every aisle.</div>
      <div className="status">
        <span className={`dot ${db.ok ? "ok" : "off"}`} aria-hidden="true" />
        {db.message}
      </div>
    </main>
  );
}
