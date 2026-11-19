# Pre-build checklist

Settle these before Session 1. The three decisions at the top strand builders more often than any bug does. Fill in the blanks and bring this to the next working session.

## Three decisions to lock first

**1. Who owns the accounts and the repo.**
The login is not the same as ownership. Decide whether GitHub, Render, and the Anthropic billing sit under a D&Z-owned account with you as admin, or under your personal accounts. A company tool should not live on one employee's personal logins.

- Owner of record: ____________________
- GitHub repo under: ____________________
- Render account under: ____________________
- Anthropic billing under: ____________________

**2. Is this sanctioned, and who is watching.**
A sanctioned pilot gets reps assigned to it. A side project dies the first busy week.

- Who at D&Z asked for this: ____________________
- Budget line / monthly cap approved: ____________________
- Executive sponsor: ____________________
- What happens to the GoSpotCheck contract if it works: ____________________

**3. Sign-in method.**
Depends on IT. Chase the answer; build the emailed-link fallback in the meantime so IT never blocks you.

- IT contacted (date): ____________________
- Microsoft Entra approved (yes / no / pending): ____________________
- Client ID: ____________________  Tenant ID: ____________________
- Starting method if no answer yet: emailed magic links

## Accounts to set up (use your D&Z email, save every password in a password manager)

- [ ] IT emailed for sign-off and Microsoft sign-in
- [ ] GitHub account and private `dz-field-app` repo
- [ ] Render account, signed up with GitHub
- [ ] Cloudflare account, R2 on, bucket `dz-field-app-photos`
- [ ] Anthropic API key with a monthly cap set first ($25 to $50 for the pilot)
- [ ] Transcription service chosen (decided in Build Session 6)
- [ ] Claude Code connected to GitHub, Claude GitHub App installed on the repo

## Data and people to gather

- [ ] Store list loaded and checked (Store 114 / Clinton needs a street number)
- [ ] 1 to 2 pilot reps picked, people who will tell you honestly what is annoying
- [ ] 50-plus real rep notes collected in `rep-notes-template.csv` (this gates the sorter, so start now)
- [ ] Sorter instructions in the repo at `docs/dz-visit-sorter-instructions.md`
- [ ] Readable GoSpotCheck question list (for Phase 2)

## The gate before you scale

Move past the pilot only when both are true:

- [ ] Pilot reps say it is faster than GoSpotCheck
- [ ] Fewer than 1 in 10 lines get fixed on the confirm screen
