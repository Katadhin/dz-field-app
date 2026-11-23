"use client";

import { useState } from "react";

function groupByVendor(entries) {
  const groups = {};
  for (const e of entries) {
    const v = e.vendor || "unknown";
    if (!groups[v]) groups[v] = [];
    groups[v].push(e);
  }
  return Object.entries(groups);
}

export default function SortTester({ hasKey }) {
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function runSort() {
    const text = note.trim();
    if (!text) return;
    setBusy(true);
    setError("");
    setEntries(null);
    try {
      const res = await fetch("/api/sort", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ note_text: text }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(
          data.error === "no_key"
            ? "No Anthropic API key yet. Set ANTHROPIC_API_KEY in Render, then try again."
            : "The sort did not run. Try again in a moment."
        );
      } else {
        setEntries(data.entries || []);
      }
    } catch {
      setError("The sort did not run. Check your connection and try again.");
    }
    setBusy(false);
  }

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand-chip"><img src="/dz-logo.png" alt="d&z" /></span>
        <span className="brand-sub">Sort test</span>
        <a className="link light topbar-right" href="/admin">
          captures
        </a>
      </header>
      <main className="content">
        {!hasKey ? (
          <div className="banner queued">
            No Anthropic API key is set yet. Add ANTHROPIC_API_KEY in Render and this page will sort for real.
          </div>
        ) : null}

        <div className="card">
          <label className="label" htmlFor="note">
            Paste a real rep note
          </label>
          <textarea
            id="note"
            className="textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={6}
            placeholder="Talked to the deli manager, Bar-S chorizo has been out a week, she'll reorder. Oscar Mayer reset looks good."
          />
          <button className="primary" onClick={runSort} disabled={busy || !note.trim()}>
            {busy ? "Sorting..." : "Sort it"}
          </button>
          {error ? <p className="err" style={{ marginTop: "12px" }}>{error}</p> : null}
        </div>

        {entries ? (
          entries.length === 0 ? (
            <div className="card" style={{ marginTop: "14px" }}>
              <p className="hint">The sorter found nothing to log in that note.</p>
            </div>
          ) : (
            <div style={{ marginTop: "14px" }}>
              {groupByVendor(entries).map(([vendor, items]) => (
                <div className="vendor-group" key={vendor}>
                  <div className="vendor-name">{vendor}</div>
                  {items.map((e, i) => (
                    <div className="entry" key={i}>
                      <div className="entry-top">
                        <span className="entry-label">{e.label}</span>
                        <span className={`conf ${e.confidence < 0.6 ? "low" : ""}`}>
                          {Math.round(e.confidence * 100)}%
                        </span>
                      </div>
                      <div className="entry-words">{e.rep_words}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )
        ) : null}

        <p className="hint">
          When a line is wrong, fix the labels or the vendor list in lib/sorterConfig.js and redeploy, not the
          result here. That is how the sorter gets smarter.
        </p>
      </main>
    </div>
  );
}
