# The Commons — flat GitHub Pages edition

A browser-based Westminster political career game.

## Flat structure

There are **no folders** in this repository. Every project file lives at the repository root:

- `index.html` — page shell
- `styles.css` — all visual styling
- `app.js` — game engine and career modes
- `config.js` — Supabase browser configuration
- `supabase.js` — Discord OAuth + cloud-save connector
- `schema.sql` — database tables and row-level security
- `logo.svg` — site logo/favicon
- `package.json` — optional local development metadata
- `.env.example` — reference environment variables
- `.gitignore`
- `.nojekyll`

## GitHub Pages

No build step is required.

1. Upload all files to the root of the repository.
2. GitHub → Settings → Pages.
3. Deploy from `main` and `/ (root)`.
4. Open the Pages URL.

## Supabase + Discord

1. Open Supabase → SQL Editor.
2. Run `schema.sql`.
3. In Supabase Authentication → Providers, enable Discord.
4. Add your GitHub Pages URL as an allowed redirect URL.
5. `config.js` contains the browser-safe project URL and publishable key.
6. Open **Settings → Discord & Cloud** in the game.

The game remains playable with localStorage if Supabase or Discord is not configured.

## Important security note

Only use a Supabase **publishable/anon** key in `config.js`. Never put a Supabase service-role/secret key in this repository or in browser JavaScript.

## Current game design

Career modes include PM, MP, Chancellor, Electioneer, Voter, News Reporter and House of Lords. Historical PM mode locks the selected historical leader's name and party while still allowing the player to make governing decisions.


## Expanded Career Systems

This flat build adds:
- four-week election campaigns before Parliament entry
- campaign sign maker and pre-Parliament speech
- Royal invitation to form a government
- Downing Street arrival and first speech
- five-question PMQs sequence
- four-week government requirement before election/leadership routes unlock
- resignation speech, contest date, two Cabinet candidates, final goodbye and Royal audience
- continue as the new leader with a locked historical/name identity, or end the premiership
- fictional Commons Twitter account creation and policy posting
- day-by-day progression
- House of Lords / State Opening / Black Rod / State Opening Planner careers
- harmless simulated UI bugs capped at roughly two per game month
