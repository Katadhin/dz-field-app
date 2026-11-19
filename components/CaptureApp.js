"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const REP_KEY = "dz_rep";
const OUTBOX_KEY = "dz_outbox";
const DRAFT_KEY = "dz_draft";

const PROMPTS = [
  "what you did",
  "who you talked to",
  "what they said",
  "outs or problems",
  "wins",
];

function genId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "c_" + Date.now() + "_" + Math.random().toString(36).slice(2);
}

function readOutbox() {
  try {
    return JSON.parse(localStorage.getItem(OUTBOX_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeOutbox(items) {
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
}

async function postVisit(item) {
  try {
    const res = await fetch("/api/visits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(item),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default function CaptureApp() {
  const [repName, setRepName] = useState("");
  const [repInput, setRepInput] = useState("");
  const [editingRep, setEditingRep] = useState(false);

  const [store, setStore] = useState("");
  const [note, setNote] = useState("");
  const [listening, setListening] = useState(false);
  const [speechOk, setSpeechOk] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | saving | saved | queued
  const [pending, setPending] = useState(0);

  const [installEvent, setInstallEvent] = useState(null);
  const [iosHint, setIosHint] = useState(false);

  const recRef = useRef(null);

  const flushOutbox = useCallback(async () => {
    let items = readOutbox();
    if (!items.length) {
      setPending(0);
      return;
    }
    const remaining = [];
    for (const item of items) {
      const ok = await postVisit(item);
      if (!ok) remaining.push(item);
    }
    writeOutbox(remaining);
    setPending(remaining.length);
  }, []);

  useEffect(() => {
    const savedRep = localStorage.getItem(REP_KEY) || "";
    setRepName(savedRep);
    setRepInput(savedRep);
    setEditingRep(!savedRep);

    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
      if (draft.store) setStore(draft.store);
      if (draft.note) setNote(draft.note);
    } catch {}

    setPending(readOutbox().length);

    const Rec = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    setSpeechOk(Boolean(Rec));

    const onOnline = () => flushOutbox();
    window.addEventListener("online", onOnline);
    flushOutbox();

    const onInstall = (e) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener("beforeinstallprompt", onInstall);

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent || "");
    const standalone =
      window.navigator.standalone === true ||
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
    if (isIos && !standalone) setIosHint(true);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("beforeinstallprompt", onInstall);
    };
  }, [flushOutbox]);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ store, note }));
  }, [store, note]);

  function saveRep() {
    const name = repInput.trim();
    if (!name) return;
    localStorage.setItem(REP_KEY, name);
    setRepName(name);
    setEditingRep(false);
  }

  function toggleMic() {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) return;
    if (listening) {
      try {
        recRef.current && recRef.current.stop();
      } catch {}
      return;
    }
    const rec = new Rec();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (event) => {
      let add = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) add += event.results[i][0].transcript;
      }
      if (add) {
        setNote((prev) => (prev ? prev.replace(/\s*$/, "") + " " : "") + add.trim() + " ");
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  async function submit() {
    const text = note.trim();
    if (!text) return;
    if (listening) {
      try {
        recRef.current && recRef.current.stop();
      } catch {}
    }
    const item = {
      client_id: genId(),
      rep_name: repName,
      store_number: store.trim(),
      note_text: text,
      source: speechOk ? "voice-or-text" : "text",
      captured_at: new Date().toISOString(),
    };

    setStatus("saving");
    const ok = navigator.onLine ? await postVisit(item) : false;
    if (ok) {
      setStatus("saved");
    } else {
      const items = readOutbox();
      items.push(item);
      writeOutbox(items);
      setPending(items.length);
      setStatus("queued");
    }
    setStore("");
    setNote("");
    localStorage.removeItem(DRAFT_KEY);
  }

  async function doInstall() {
    if (!installEvent) return;
    installEvent.prompt();
    try {
      await installEvent.userChoice;
    } catch {}
    setInstallEvent(null);
  }

  if (editingRep) {
    return (
      <div className="app">
        <Topbar />
        <main className="content">
          <div className="card">
            <h1 className="h1">Who are you?</h1>
            <p className="hint">Your name goes on every visit you log. You only set this once.</p>
            <input
              className="input"
              value={repInput}
              onChange={(e) => setRepInput(e.target.value)}
              placeholder="Your name"
              autoCapitalize="words"
            />
            <button className="primary" onClick={saveRep} disabled={!repInput.trim()}>
              Start
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Topbar />
      <main className="content">
        <div className="who">
          Logging as <strong>{repName}</strong>
          <button className="link" onClick={() => setEditingRep(true)}>
            change
          </button>
        </div>

        {status === "saved" || status === "queued" ? (
          <div className={`banner ${status === "saved" ? "ok" : "queued"}`}>
            {status === "saved"
              ? "Saved. Log the next one when you leave the store."
              : "Saved on your phone. It will upload when you have signal."}
            <button className="link" onClick={() => setStatus("idle")}>
              log another
            </button>
          </div>
        ) : null}

        <div className="card">
          <label className="label" htmlFor="store">
            Store number
          </label>
          <input
            id="store"
            className="input"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            inputMode="numeric"
            placeholder="e.g. 2345"
          />

          <label className="label" htmlFor="note">
            What happened on this visit
          </label>
          <div className="chips">
            {PROMPTS.map((p) => (
              <span className="chip" key={p}>
                {p}
              </span>
            ))}
          </div>
          <textarea
            id="note"
            className="textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Talk or type the way you would leaving the store."
            rows={7}
          />

          {speechOk ? (
            <button
              className={`mic ${listening ? "on" : ""}`}
              onClick={toggleMic}
              type="button"
              aria-label={listening ? "Stop recording" : "Start recording"}
            >
              <span className="mic-dot" />
              {listening ? "Listening, tap to stop" : "Tap to talk"}
            </button>
          ) : (
            <p className="hint">Type your note above. Voice input is not available in this browser.</p>
          )}

          <button className="primary" onClick={submit} disabled={status === "saving" || !note.trim()}>
            {status === "saving" ? "Saving..." : "Save visit"}
          </button>
        </div>

        {pending > 0 ? (
          <div className="pending">
            {pending} waiting to upload
            <button className="link" onClick={flushOutbox}>
              try now
            </button>
          </div>
        ) : null}

        {installEvent ? (
          <button className="ghost" onClick={doInstall}>
            Add to home screen
          </button>
        ) : null}
        {iosHint ? (
          <p className="hint center">
            To install: tap the Share button, then "Add to Home Screen".
          </p>
        ) : null}
      </main>
    </div>
  );
}

function Topbar() {
  return (
    <header className="topbar">
      <span className="brand">d&amp;z</span>
      <span className="brand-sub">Field</span>
    </header>
  );
}
