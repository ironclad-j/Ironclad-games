# Ironclad Games — design

Date: October 21, 2026
Status: Approved by the user, including the desktop-only and iframe requirements added October 21, 2026. Implementation and publication have not started.

## Intended outcome

Build and publish Ironclad Games on GitHub as a browser arcade. Launch with Snake, Pong, and Memory Match, then allow additional games to be added. The user approved a dark steel and orange design with search, category filters, and personal records, and added cloud storage for every player's scores, records, and progress.

## Selected approach

Use a static HTML, CSS, and JavaScript site published through GitHub Pages, with Supabase Auth and Postgres for player accounts and cloud data. This keeps game delivery simple while allowing saves to follow players between devices. A local-only arcade would not meet the cloud requirement; a custom application server would add maintenance without a launch requirement that needs it.

The connected GitHub account is ironclad-j. No Supabase projects were returned during discovery. Create a dedicated project during implementation after identifying the available organization and checking any provisioning cost. The proposed new GitHub repository name is ironclad-games; check for a collision before creation. Never replace an existing repository or unrelated cloud data.

## Player experience

The home page shows a prominent Ironclad Games identity, a game library with search and category filters, and access to the player's account and records. All three cards open real, playable games. Supported devices are Chromebooks, laptops, and desktop PCs, using keyboard and mouse or trackpad. Mobile and tablet gameplay is outside scope. Layouts accommodate typical laptop screens, including 1366 by 768. Small-screen visitors receive a desktop-required message. This is a support policy, not a guarantee that device type can be identified perfectly in a browser. Include visible instructions, pause, restart, and an accessible return to the library.

Visitors play without a sign-in prompt. A private anonymous Supabase session automatically saves scores and game progress in the cloud, with a device-local offline queue. The anonymous identity persists in this browser; cross-device access requires an optional player account. This supersedes the original local-only guest behavior, following the explicit user clarification. Email and password registration, sign-in, password recovery, and sign-out remain optional for cross-device access; cloud saves do not require them. Clearly distinguish guest, saving, saved, offline, and failed-save states. Never display a successful cloud save before the server confirms it. Guest records are imported only after the signed-in player explicitly chooses to import them, and guest data is isolated from signed-in account data.

A personal records view shows each game's best result, play count, and saved progress. Scores and checkpoints are private at launch. Public leaderboards, social features, purchases, and multiplayer are outside the initial scope.

## Games and expansion

Snake records score and saves a versioned checkpoint containing its board, body, food, direction, and speed. Pong is single-player against the computer; it records match results and saves the match score and playing state. Memory Match records completed games by moves and elapsed play time and saves the shuffled board and matched cards.

An explicit game registry contains stable game IDs, titles, categories, instructions, score ordering, and iframe entry URLs. Every game runs inside an iframe, including the initial three games. Each game supplies start, pause, resume, reset, serialize, and restore behavior through a versioned message contract with the parent arcade. Adding a game adds its iframe page and registry entry rather than changing account logic. The arcade owns authentication and cloud requests; games report results and checkpoints through the bridge and never receive account tokens. The launch games are self-hosted, sandboxed with scripts enabled and same-origin access disabled. A MessageChannel connects the active iframe to the parent after checking the sending window. Validate game ID, active session ID, protocol version, event type, and payload before accepting saves; reject events from replaced frames. Use the necessary wildcard target only to initialize the opaque-origin sandbox, then use the transferred message port. Games use classic scripts compatible with the opaque-origin sandbox. Future third-party games require an embedding-compatible source and the bridge integration to support cloud scores and progress; embedding alone cannot expose their internal save state. Checkpoints include a schema version; incompatible saves show a clear restart option.

## Data and access

Store profiles keyed by the authenticated user ID, completed runs keyed by unique run IDs, and one current checkpoint per user and game. Record timestamps, game version, score, and bounded game-specific result or checkpoint data. Calculate personal records from completed runs using the game's scoring rules. Unique run IDs prevent retries from counting a game twice.

Enable row-level security on every exposed player-data table. Policies restrict reading and writing to the authenticated row owner and prevent ownership changes. Grant only the required operations. The browser uses the public project URL and publishable key; privileged credentials never appear in source files or the published site.

On connectivity failure, retain pending saves locally under the correct account and retry when online. Avoid overwriting a newer checkpoint silently: use revision checks and offer a choice between device and cloud progress when a conflict is detected. Completed runs merge by unique ID. Signing out clears the in-memory account state and hides that account's cached data from guests and other players.

Scores are personal browser-game records. Competitive verified rankings would require additional server validation and are not part of this release.

## Publishing and verification

Keep source, database setup, documentation, and a GitHub Pages deployment workflow together. Use relative asset URLs so the site works beneath a GitHub repository path. Configure the deployed URL in authentication redirect settings. Publish only after build and functional checks pass and confirm the returned deployment state.

Verify all games inside their iframes with keyboard and mouse or trackpad, search and filters, pause/resume and restart, checkpoint compatibility, keyboard focus, browser fullscreen, and laptop-sized layouts. Verify that forged or stale iframe messages cannot write saves and that failed game loads show a useful recovery action. Verify registration, recovery, sign-in and sign-out, guest import, cross-device cloud restoration, retry deduplication, and save conflicts. Test with two accounts to confirm that neither can read or alter the other's data. A cloud-backed launch requires real account and database integration checks; configuration placeholders do not count as completion.

## Documentation references

GitHub Pages hosting: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
Supabase row-level security: https://supabase.com/docs/guides/database/postgres/row-level-security

Iframe messaging reference: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage


