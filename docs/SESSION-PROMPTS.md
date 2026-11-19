# Build session prompts

Paste-ready prompts for building the app one feature at a time with Claude Code. One feature per session. Start a new session for each, paste the prompt, answer its questions, test on your phone, then merge the pull request. Do not start the next session until the current one passes its phone test. If a test fails, stay in the same session and describe what you saw.

Your repo already has `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/BRAND.md` and the checklist, so the kickoff below points Claude Code at them instead of generating a rulebook from scratch.

## Kickoff (first session, set mode to Plan)

```
Read CLAUDE.md, docs/ARCHITECTURE.md, docs/BRAND.md, docs/dz-visit-sorter-instructions.md and docs/store-list.xlsx.

I'm not a programmer. You'll build this app for me one feature at a time, and I'll test each feature on my phone.

Confirm you understand the stack, the build order, and the hard rules in CLAUDE.md. Then show me your plan for Session 1 only. Ask about anything unclear. Don't build anything yet.
```

Read the plan, ask questions, then approve it.

## Phase 1

### Session 1. Get a blank app live on the internet
```
Read CLAUDE.md and docs/BRAND.md. Build the smallest possible version of the app: one page that says "d&z Field App" in the dz colors (purple #37246B, blue #3FB3E2), plus a connected Postgres database. Set it up to deploy on Render using a render.yaml file so I can create everything in one go. Then give me click-by-click steps for Render, including which environment variables to fill in and where.
```
Test: open the Render web address on your phone and see the page. Bookmark that address.

### Session 2. Sign-in and roles
```
Read CLAUDE.md. Add sign-in. [Pick one: "Use D&Z Microsoft sign-in; I have the client ID and tenant ID from IT." OR "Use emailed sign-in links; walk me through setting up an email service."] Only @selldz.com addresses may get in. Add three roles: rep, manager, admin. Make me the admin. Give admins a simple screen to add and remove people and set their role. Reps stay signed in on their phone so they rarely log in again.
```
Test: sign in on your phone. A non-dz email is turned away. Add a test rep and confirm they can sign in.

### Session 3. Load the store list
```
Read CLAUDE.md. Load docs/store-list.xlsx into the database: store number, DC, address, city, state, ZIP, phones. Turn each address into a map location once, using a free geocoding service, and flag any that fail. Add an admin screen to upload a new version of the store list later. Add a store search where I type a store number and see its details.
```
Test: search a store and see its DC and city. Ask how many addresses failed and fix those by hand.

### Session 4. Check-in
```
Read CLAUDE.md and docs/ARCHITECTURE.md. Build check-in: when a rep opens the app, use the phone's location to suggest the nearest Food Lion ("You're at Store 2345?") with one tap to confirm. If location is off or no store is close, they type a store number. Start a visit record with rep, store, DC, date and time.
```
Test: stand near a Food Lion; the app suggests the right store. Turn off location; typing the number still works.

### Session 5. Store brief
```
Read CLAUDE.md. Build the store brief, shown right after check-in: DC, address, manager and department-head names, open issues, and the follow-up list from the last visit. Manager names start empty; reps can suggest a name and an admin approves it. Keep it to one scrollable screen that's readable in a store aisle.
```
Test: check in, see the brief, suggest a manager name, approve it as admin, and see it show up next time.

### Session 6. Talk-to-log and the confirm screen (the heart of the app)
```
Read CLAUDE.md, docs/ARCHITECTURE.md and docs/dz-visit-sorter-instructions.md. Build talk-to-log: a big record button, with on-screen prompts (what you did, who you talked to, what they said, outs or problems, wins). Recommend a speech-to-text service and walk me through signing up. Send the text to Claude with the sorter instructions so every statement becomes an entry with structured output: label, vendor, the rep's exact words, and a confidence. Show the confirm screen grouped by vendor, where the rep taps confirm or fixes a line. Save the rep's own words with every entry. Save each fix as a correction example the sorter reads next time. Add a test page where I can paste a typed note and see how it sorts.
```
Test: paste your 50-plus real rep notes into the test page. Write down every mistake and fix the sorter instructions, not the results, until 9 of 10 come back right. Then record one real voice note in a store.

### Session 7. Photos
```
Read CLAUDE.md. Build photo capture: in-app camera, a check for blurry or dark photos that asks for a retake on the spot, and auto-tagging with store, DC, rep, date and vendor. Store photos in my Cloudflare R2 bucket and walk me through creating the access keys and putting them in Render. Upload straight to R2 with a signed link, and shrink photos before upload so they're quick on weak signal.
```
Test: take a blurry photo and get asked to retake. Take a good one and see it saved to the visit.

### Session 8. Auto follow-ups and fixes
```
Read CLAUDE.md. Turn every issue from a confirmed visit into an open item on that store's brief. Write a short "check this" list for the next rep. When a rep reports it fixed, close the item and record it as a fix, noting whether it was the same visit or a later one.
```
Test: log an out-of-stock, check in there again, see the follow-up, report it fixed, and see the item close.

### Session 9. Photo album
```
Read CLAUDE.md. Build the photo album: every photo by date, with filters for store, DC, rep, vendor, brand and month. Make it fast on a phone and easy on a laptop.
```
Test: filter to one vendor and one month and see only those photos.

### Session 10. Admin review queue
```
Read CLAUDE.md. Build the weekly admin review queue: entries the sorter wasn't sure about, plus lines reps fixed. I can approve or correct each one, and every correction becomes an example the sorter reads next time.
```
Test: correct an entry, then paste a similar note on the test page and see it sort right.

### Session 11. Works with no signal
```
Read CLAUDE.md and docs/ARCHITECTURE.md. Make the whole visit work offline using an outbox: check-in, the store brief from the last sync, voice notes, photos and questions all save on the phone first and upload automatically when signal comes back. Give every queued item an idempotency key so a retry never double-posts. Show a small "3 items waiting to upload" note. Nothing may be lost if the app is closed.
```
Test: turn on airplane mode, do a whole visit, close the app, turn airplane mode off, reopen, and see everything upload once, with no duplicates.

### Session 12. Make it feel like an app
```
Read CLAUDE.md. Make this an installable home-screen app: dz name and icon, full-screen with no browser bar, and a one-page "how to install" guide for iPhone and Android that I can text to reps. Then do a full review of every Phase 1 feature on a phone screen and fix anything slow, confusing or hard to tap.
```
Test: add it to your home screen and do a full visit, start to finish, in under 5 minutes plus the talk.

## How every session ends

Claude Code finishes and pushes its work to a branch. Click Create PR, open the pull request on GitHub, and click Merge. Render updates the live app a few minutes after you merge. Nothing goes live until you merge.

## Later phases

Same routine, one feature per session. Start each prompt with "Read CLAUDE.md and the matching section of docs/ARCHITECTURE.md." Phase 2 adds the question builder, rep activity dashboard, resource portal and alerts. Phase 3 adds the monthly vendor decks (counts from the database, never from AI), out-of-stock flags, ask-the-app and photo search. Phase 4 is the App Store and Google Play decision.
