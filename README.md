# Ironclad Games

A lightweight browser arcade for Chromebooks, laptops, and desktop PCs. Snake, Pong, and Memory Match each run in a sandboxed iframe. The parent arcade manages private browser sessions, cloud records, and progress synchronization. There is no sign-in or registration interface.

## Run locally

Use Node.js 24 or later. Run `node scripts/serve.mjs`, then open http://127.0.0.1:4173 in a desktop browser. The published Supabase project configuration is in `config.js`; it contains a publishable key protected by database row-level security.

Run `node --test tests/*.test.js` and `node scripts/verify-site.mjs` before publishing. Dependencies are needed only to rebuild the vendored Supabase browser client. Install the exact versions in `package.json` using the committed pnpm lockfile, then run:

```
node node_modules/esbuild/bin/esbuild node_modules/@supabase/supabase-js/dist/index.mjs --bundle --minify --format=esm --platform=browser --outfile=assets/supabase.js
```

The Supabase client is bundled locally; game loading does not depend on a JavaScript CDN. Google Fonts have local system-font fallbacks. The only game loaded into an iframe is the one selected by the player.

## Cloud data

Supabase project: `pvqlrxaorevqnqcuyjaa`. The schema is in `supabase/schema.sql`; it has been applied to the project's remote database. Do not run it again on an existing schema. `supabase/test-isolation.sql` tests database access in a rolled-back transaction with temporary auth identities.

Tables `profiles`, `game_runs`, and `game_checkpoints` all require authenticated row ownership. Runs use unique IDs for retry safety. The `save_checkpoint` RPC atomically compares revisions and returns a conflict instead of overwriting newer progress. Players save automatically through private anonymous cloud sessions, with a device-local offline queue. Private records are not verified competitive rankings.

Anonymous sign-ins must be enabled in Supabase. The site does not request an email address, password, or player account. Keep the existing owner-based row-level security enabled for every player-data table.

## Add a game

1. Add a self-hosted iframe document under `games/<stable-id>/index.html`.
2. Add its title, category, relative iframe URL, scoring direction, instructions, and checkpoint version to `src/catalog.js`.
3. Include `games/shared/bridge.js` as a classic script, then call `createGameBridge({init(checkpoint),pause(),resume(checkpoint),restart()})`. Add `data-game="<stable-id>"` to the document body.
4. Send versioned checkpoints with `bridge.checkpoint(data)` and completed results with `bridge.complete({runId,score,details})`. A run ID must be a fresh UUID for each new round and remain stable when restoring progress. Report pause state using `bridge.paused(boolean)`.
5. Expose the game's canonical validator as `globalThis.IroncladEngines[stableId]` with a `restore(checkpoint)` function, and import its rule script in `src/checkpoints.js`. This lets the parent reject invalid saves before storing them. Checkpoints include `version`, `state`, `runId`, `elapsed` (milliseconds), and `completed` (boolean).
6. Validate saved-state shape and version before restoring. Add meaningful rule and checkpoint tests under `tests/`, plus a game-art entry in `src/art.js`.

Iframes allow scripts but not same-origin privileges. They receive a MessagePort after the host verifies the sending window. Envelopes contain protocol, game ID, session ID, type, and payload; messages above 64 KiB, stale sessions, and duplicate completion events are rejected. Games never receive auth tokens. Third-party embeds must permit framing and integrate this protocol to support cloud saves; embedding arbitrary games alone cannot reveal their internal progress.

## Publish

The GitHub Actions workflow tests the source and publishes only `index.html`, public configuration, assets, source modules, and game documents. Configure repository Pages to use GitHub Actions. Push to `main` to deploy. Documentation, tests, database files, credentials, and development files are excluded from the hosted artifact.

## Support scope

Keyboard and mouse/trackpad; desktop Chrome/ChromeOS, Edge, and Firefox are the target browsers. The small-screen notice uses a 960 CSS pixel layout threshold; it does not claim perfect device detection. No mobile or tablet gameplay support is included.

### Automatic cloud saves
Anonymous Supabase sessions are enabled. The arcade automatically establishes a private browser identity without a sign-in prompt. Scores and progress are saved to that browser identity. Clearing browser data or switching browsers loses access to that anonymous identity. Owner-based RLS keeps each browser identity separate. Pending device-local guest data syncs automatically when the cloud connection is available.

### Interface
The library uses a plain light layout, system fonts, direct game descriptions, search, and category filters. Games and My scores are the only navigation items. No marketing hero, ticker, sidebar, or account controls are shown.
