# Poker Bankroll

A simple cash-game session tracker: locations with default buy-ins, sessions with reloads, graphs and stats, CSV export. Runs on Cloudflare Workers + D1 (free tier is plenty). Each person deploys their own copy, so you own your data.

## Deploy
1. Fork or clone this repo. Install [Node.js](https://nodejs.org).
2. `npx wrangler login`
3. `npx wrangler d1 create poker-bankroll` and copy the `database_id` into `wrangler.toml`.
4. `npx wrangler d1 execute poker-bankroll --remote --file=schema.sql`
5. `npx wrangler deploy`

Upgrading from an earlier version of this repo? Run the `ALTER TABLE` lines you need from `schema.sql` (new columns on `sessions`, plus the `settings` table).

## Protect it (important)
The deployed URL is public and has no login of its own. In the Cloudflare dashboard, put it behind **Zero Trust → Access** (free for small teams) so only you can open it.

## Add to your iPhone
Open the URL in Safari, tap Share, then Add to Home Screen.

## Import from Poker Analytics
In the Poker Analytics app, export your data as XML. In Locations, tap **Import from Poker Analytics** and pick the file. You get a preview first, it brings in cash sessions and tournaments plus game type, start/end times, table size, pause time, tournament finish and field size, mid-session stack updates and your starting bankroll. Re-importing never duplicates sessions.

## Notes
- Profit = cash-out − buy-in − reloads. $/hr only uses sessions where you entered hours.
- Not tested against a live deploy yet; please open an issue if something breaks.

MIT licensed.
