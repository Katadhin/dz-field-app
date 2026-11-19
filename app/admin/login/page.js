import { adminEnabled } from "../../../lib/adminAuth";

export const dynamic = "force-dynamic";

export default function AdminLogin({ searchParams }) {
  const error = searchParams?.error;

  if (!adminEnabled()) {
    return (
      <div className="app">
        <header className="topbar">
          <span className="brand">d&amp;z</span>
          <span className="brand-sub">Admin</span>
        </header>
        <main className="content">
          <div className="card">
            <h1 className="h1">Admin is off</h1>
            <p className="hint">
              Set an ADMIN_PASSCODE environment variable in Render to turn on the captures view. Until then this
              page stays closed.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">d&amp;z</span>
        <span className="brand-sub">Admin</span>
      </header>
      <main className="content">
        <div className="card">
          <h1 className="h1">Enter passcode</h1>
          {error ? <p className="err">That passcode did not match. Try again.</p> : null}
          <form method="post" action="/api/admin/login">
            <input
              className="input"
              type="password"
              name="passcode"
              placeholder="Admin passcode"
              autoComplete="current-password"
              autoFocus
            />
            <button className="primary" type="submit">
              Open captures
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
