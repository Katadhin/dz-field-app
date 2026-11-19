# D&Z Field App: Architecture and Solutions

How the app gets built: the pieces, the choices, and the three problems that decide whether it works. Written so Hunter can hold the decisions and so Claude Code has a spec to build against. Where a tool is recommended, the reason and the alternative are given, so the recommendation can be overruled with eyes open.

## The system in one view

The app is one pipeline with support systems around it. A rep finishes a visit and talks. The app turns that talk into clean, vendor-tagged entries, saves them, and feeds everything else from there.

```
voice note  ->  transcription  ->  sorter  ->  confirm screen  ->  database  ->  downstream
 (rep)          (Whisper/           (Claude)    (rep confirms)      (Postgres)    (brief, follow-ups,
                 Deepgram)                                                          vendor decks, ask-the-app)
```

Everything to the right of the sorter inherits the sorter's accuracy. That one fact should drive where effort goes.

Seven pieces run the path: the app on the rep's phone, a server, a Postgres database, Cloudflare R2 for heavy files, a transcription service, the Claude sorter, and sign-in.

## The stack, and why each piece

Pick the most popular, stable tools, because Claude Code builds and maintains those far more reliably. A clever niche choice means a model guessing, and a non-programmer cannot catch it when it guesses wrong.

- **App and server in one codebase: Next.js (React).** It runs the phone app and the server logic in one project, one repo, one deploy on Render. Fewer moving parts and one place for Claude Code to work. Alternative: a separate front end and server, which is more textbook-correct and worse here because it doubles what you maintain.
- **Database: Postgres, managed by Render.** The boring, proven default for related data. Keep it.
- **Object storage: Cloudflare R2.** Big files do not belong in a database. R2 is cheap and charges nothing to read files back. Store the audio too, not just the transcript, so the sorter can re-run later and any dispute can be settled.
- **Transcription: one service, kept swappable.** Whisper and Deepgram are both strong. Deepgram tends to handle noisy, real-world audio and accents a little better and returns fast. Wrap it behind a single function so it can be switched later.
- **Sorter: the Claude API.** The heart of the app; see its own section.
- **Sign-in: Microsoft Entra if IT enables it, emailed magic links as the fallback.** Both behind one sign-in layer, with no data tied to the method, so a later switch costs nothing.

## The data model

Every feature reads from this, so the shape of the data matters more than any screen. Keep it simple and relational.

```
stores  ->  visits  ->  entries  ->  follow_ups
                           |          corrections
                           |          photos
                      (tagged by vendors)
```

Core tables:

- **stores** — the 1,112 Food Lion stores: number, DC, address, geocoded location, manager and department-head names.
- **users** — reps, managers, admins, each with a role and email.
- **visits** — one row per visit: rep, store, DC, date, time, location.
- **entries** — the unit that makes the app work. One row per statement the sorter pulls from a visit: label, vendor, the rep's exact words, the sorter's confidence, and a link to its visit.
- **vendors** — the brands D&Z reps, so an entry or photo can be tagged to one and walled off from the others.
- **photos** — one row per photo: R2 location plus the same tags as an entry.
- **follow_ups** — open items created from an entry: status, who closed it, when.
- **corrections** — every fix a rep or admin makes, saved as an example the sorter reads next time. This table is what makes the app get smarter.
- **questions** — structured questions aimed at stores, DCs or reps (Phase 2).

Two rules the structure enforces, not the prompt: a vendor id lives on every entry and photo and every vendor-facing query filters by it in code; and counts come from querying these tables, never from anything the AI wrote.

## The sorter: the heart of the app

Everything else is plumbing around this. The sorter takes a rep's transcribed note and turns it into clean, labeled, vendor-tagged entries the rep trusts enough to confirm without editing. Get it to ninety percent and up on real notes and you have a product. Leave it at seventy and you have built a slower GoSpotCheck.

How it works: the audio is transcribed to plain text; the text goes to Claude with the sorter instructions (the labeling rules) and a growing set of correction examples drawn from real past fixes; Claude returns structured output, a fixed data shape rather than prose, one record per entry with a label, a vendor, the rep's words, and a confidence; low-confidence entries flag into the weekly admin review queue; the confirm screen shows entries grouped by vendor; and every fix writes a row to the corrections table.

Four rules hold it together:

1. It extracts and labels, and never invents a number, a count, or a fact that was not in the note.
2. It saves the rep's exact words with every entry, every time.
3. When it is wrong, you fix the instructions and the examples, never the stored result.
4. Build the test harness first: a plain page where you paste a note and watch how it sorts. Feed it 50 or more real rep notes, weighted toward the messy ones, and tune until nine of ten come back right before a single rep uses it live.

## Offline and sync: the hardest problem

Reps work in the back of stores with no signal. The app has to capture a whole visit offline and upload it cleanly when signal returns, losing nothing and duplicating nothing. Treat this as its own project, not a one-afternoon session.

The pattern that works, and stays simple to reason about, is an outbox:

```
On the phone (works offline)
  rep action  ->  local outbox   ====>  sync worker  ->  server + database
  (visit,         (saved on             (when signal      (Postgres)
   note, photo)    phone first)          returns)
```

Every action writes to storage on the phone first, before anything touches the network. A sync worker drains the outbox to the server when signal is present. Every item carries an idempotency key made on the phone, so a retry never creates a duplicate. The rep sees a small "3 items waiting to upload" marker.

Two choices keep it sane: writes sync one direction only (the phone captures and uploads; never try to make the whole database sync both ways in real time); and reads are cached snapshots (the store brief shown offline is the last one that synced). The app's own code and screens cache through a service worker, which is a separate and easier job than syncing the data.

## Capture: photos and audio

Photos and audio go straight to R2, not through the database. The in-app camera shrinks a photo on the phone before upload so it moves fast on weak signal, and it checks for blur or darkness and asks for a retake on the spot. Uploads go directly to R2 using a short-lived signed link the server hands out, so a thousand photos never round-trip through the app server, and the photo's tags go in the photos table. Audio clips upload the same way and are kept, not thrown away after transcription.

## Reporting and the trust rules

The vendor decks justify the whole thing, and they are the one place a mistake costs a client's trust. Counts come from database queries, never from the AI. One vendor's data never enters another's deck, enforced by the vendor filter in the query. Every deck passes a human check before it goes out. Build decks from real pilot data as early as possible, even rough ones, so the people deciding whether to drop GoSpotCheck see the end state before Phase 3 is polished.

## What it costs, and the one unbounded risk

At pilot volume the running cost is small: hosting and database in the low tens of dollars a month, plus pennies to dollars for photos, transcription and Claude. Set hard spending caps on every service.

The one cost that can run away is recording length, because transcription and the sorter both cost in proportion to how much audio and text they process. A twenty-minute ramble costs far more than a ninety-second summary and gives worse data. The fix is in the design: cap a recording's length, prompt the rep toward a short structured note, and set spend limits as a backstop. Watch cost per visit as a number.

## Decisions that need a human

- **Who owns the accounts and the repo, Hunter or D&Z.** Settle before the first session. A company tool should not live on one employee's personal logins.
- **Entra or magic links**, which depends on IT. Chase the answer; build the fallback.
- **Data retention and access.** Manager names and store photos are real-people data. Decide who sees it and how long it is kept.
- **Native apps versus the home-screen app** (Phase 4), which the pilot evidence should answer rather than a guess made now.

## Where the architecture goes next

The current design is a visit logger that produces vendor reports. The bigger idea sits one layer up, and the architecture leaves room for it. Because every entry is tagged, timestamped, and tied to a store and a vendor, the same data that fills a vendor deck is also cross-store, cross-vendor field intelligence, the thing a brokerage sits on and currently loses in the parking lot every day. The ask-the-app and photo-search features are the first sight of that. Keep the data clean and well-tagged from day one and that option stays open.

One technical note for that future: the home-screen web app cannot do background location or reliable push alerts on iPhone. Those need the native wrapper in Phase 4, which is the right time for them. Nothing in today's build has to change to get there, which is the point of choosing a standard stack.
