# Ironclad Games Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a desktop browser arcade with three iframe games and private cloud records that support future games.

**Architecture:** A static arcade shell owns the game registry, authentication, and saving. Sandboxed iframe pages communicate over a validated MessageChannel bridge. Supabase provides accounts and private per-user records; GitHub Pages publishes the static files.

**Tech Stack:** HTML, CSS, JavaScript ES modules for the shell, classic scripts for sandboxed games, Supabase Auth/Postgres, Node built-in test runner, GitHub Actions/Pages. Pin the verified Supabase client package version and commit its lockfile when adding the dependency.

**Spec:** ../../../design.md

## Global Constraints

- Supported devices are Chromebooks, laptops, and desktop PCs, using keyboard and mouse or trackpad.
- Every game runs inside an iframe, including the initial three games.
- Launch with Snake, Pong, and Memory Match.
- Scores and checkpoints are private at launch.
- Never display a successful cloud save before the server confirms it.
- Privileged credentials never appear in source files or the published site.
- A cloud-backed launch requires real account and database integration checks; configuration placeholders do not count as completion.
- Keep the approved dark steel and orange theme; use relative asset URLs under the repository path.

## Review Focus

1. A late message from a replaced iframe must not change the current game's records (Task 2).
2. A save retry after an interrupted response must not duplicate a completed run (Task 4).
3. Switching accounts with queued offline writes must not upload one player's data to another account (Task 4).
4. Two devices saving one checkpoint must produce an explicit conflict instead of silent data loss (Task 4).
5. A missing, incompatible, or failed iframe must provide a recovery action without losing existing saved progress (Tasks 2 and 3).

## File responsibilities

- `index.html`, `assets/site.css`, `src/app.js`: desktop arcade, navigation, dialogs, loading and error states.
- `src/catalog.js`: stable game IDs, metadata, iframe URLs, score ordering, checkpoint versions.
- `src/frame-host.js`, `games/shared/bridge.js`: parent/child message handshake, lifecycle commands, validation.
- `games/{snake,pong,memory}/index.html`, `engine.js`, `play.js`: each game's iframe page, testable rules, and rendering/input.
- `src/auth.js`, `src/cloud.js`, `src/save-store.js`, `src/records.js`: accounts, database access, pending local writes, personal records.
- `config.example.js`, ignored `config.local.js`, generated `config.js`: public Supabase URL/key configuration only; production config included in deployed static assets.
- `supabase/`: schema setup, policies, database integration tests, and generated migration using the supported CLI workflow.
- `tests/*.test.js`: meaningful bridge, game-rule, save, and records tests.
- `scripts/verify-site.mjs`, `package.json`, `.github/workflows/pages.yml`, `README.md`: checks, pinned dependencies, static artifact deployment, setup and game integration guide.

### Task 1: Desktop arcade and expandable catalog

**Interfaces:** `catalog` exports entries `{id,title,category,frameUrl,checkpointVersion,scoreDirection}`; `filterGames(catalog, query, category)` returns matching entries; `openGame(gameId)` launches through the frame host added in Task 2.

- [ ] Write `tests/catalog.test.js` covering case-insensitive search, combined category filtering, no results, unique IDs, and relative iframe URLs.
- [ ] Run `node --test tests/catalog.test.js`; confirm failure from the missing implementation.
- [ ] Implement `src/catalog.js` and the desktop shell in `index.html`, `assets/site.css`, and `src/app.js`: library, records, account entry, real empty states, desktop-required notice, and keyboard-visible focus. Use a 960 CSS pixel minimum gameplay viewport as a layout threshold, not device detection.
- [ ] Run the catalog tests; verify the shell at 1366x768 and 1024x768, including keyboard navigation and narrow-screen notice. Record if browser preview is unavailable.
- [ ] Commit the passing shell and catalog.

### Task 2: Iframe host and message bridge

**Interfaces:** `mountGame({container,game,onCheckpoint,onComplete,onError})` returns `{pause(),resume(checkpoint),restart(),destroy()}`. Envelopes are `{protocol:1,gameId,sessionId,type,payload}`. Allowed child events: ready, checkpoint, complete, error. Allowed parent commands: init, pause, resume, restart. The shared child helper `createGameBridge(handlers)` exposes `checkpoint(value)` and `complete(result)`.

- [ ] Write `tests/frame-host.test.js` to reject wrong windows, mismatched game/session IDs, unsupported protocols, unknown event types, oversized payloads above 64 KiB, stale frames, and duplicate completion IDs. Include timeout and destroy cleanup assertions with injected window/clock adapters.
- [ ] Run `node --test tests/frame-host.test.js`; confirm the expected missing-module failure.
- [ ] Implement the host and shared classic-script bridge with `sandbox="allow-scripts"`, titled iframes, a fresh session ID, checked ready sender, and a transferred MessagePort. Validate child initialization against the expected parent window and origin derived from the page referrer. Use `*` only for the opaque sandbox's initialization transfer; never transfer auth data.
- [ ] Implement load-timeout retry, click-to-focus instructions, fullscreen with a visible failure state, pause before returning to the library, and disposal of old frames/ports. Disable controls while loading and preserve checkpoint data after load failure.
- [ ] Run the bridge tests and verify a real sandbox handshake, keyboard focus, fullscreen, reload recovery, and iframe-only gameplay in the browser.
- [ ] Commit the passing iframe host and bridge.

### Task 3: Three complete games and versioned checkpoints

**Interfaces:** Each `engine.js` uses a browser-global engine object and a CommonJS test export without ES module fetching inside the sandbox. Expose `initialState()`, `step(state,input)`, `serialize(state)`, `restore(checkpoint)`; the two animation games also take elapsed time in `step`. Each `play.js` uses Task 2's bridge.

- [ ] Write `tests/games.test.js`: Snake food growth and collision; Pong paddle collision, point scoring and match end; Memory matching, move counting and completion. For all three assert checkpoint round-trip equivalence, malformed-state rejection, and rejection of unsupported checkpoint versions. Verify a paused game cannot advance or complete.
- [ ] Run `node --test tests/games.test.js`; confirm missing implementations fail.
- [ ] Implement each game page, engine, and keyboard/mouse controller. Snake uses arrows/WASD; Pong uses W/S or arrows and mouse/trackpad; Memory uses clickable cards and keyboard activation. Include controls, score, pause, restart, and deterministic completed-run payloads with unique run IDs. Queue no more than one Snake turn per movement step and use elapsed time for Pong physics.
- [ ] Save checkpoints at meaningful state changes and on pause; preserve elapsed active play time while excluding pause time. On incompatible saves show an explicit new-game option instead of overwriting automatically.
- [ ] Run game tests; play through complete rounds, pause/resume from saved state, restart, iframe reload and keyboard focus changes for each game.
- [ ] Commit the passing games.

### Task 4: Accounts, private cloud records, and reliable save synchronization

**Interfaces:** `createAuth(client)` exposes signUp/signIn/signOut/sendRecovery/updatePassword/subscribe. `createCloud(client)` exposes `appendRun(run)`, `listRuns(gameId)`, `readCheckpoint(gameId)`, `writeCheckpoint(gameId,expectedRevision,data)` returning saved data or conflict. `createSaveStore({cloud,storage,accountId})` exposes `queueRun(run)`, `saveCheckpoint(gameId,data)`, `flush()`, `dispose()`; operations and pending queues remain bound to the originating account ID.

- [ ] Confirm the Supabase organization with the user, as required by the create-project tool; the discovered organization is `Iron clad interactive games` (ID `zjxwtnzcyzlkewxutbfw`). Check current docs/changelog and provision a dedicated project using native cost confirmation if needed. Do not incur an unapproved nonzero cost.
- [ ] Write failing save-store tests for retry deduplication, guest import consent, offline recovery, no premature saved indicator, account switching with queued writes, lower-is-better Memory records, higher-is-better Snake records, and simultaneous checkpoint edits producing conflict.
- [ ] Write database integration tests using two real authenticated test identities to assert private row reads, blocked cross-user inserts/updates, immutable ownership, unique run IDs per user, and atomic checkpoint revision checks. Run against a fresh isolated schema/project; initial absence must fail.
- [ ] Implement profiles, immutable completed runs, and per-user/game checkpoints with bounded JSON, timestamps and version fields. Enable RLS and restrict grants. Use a database compare-and-swap operation for checkpoint revisions so concurrent writers cannot both succeed. Inspect schema first; use the Supabase skill's supported schema/migration workflow and run advisors after changes.
- [ ] Implement the auth, cloud, save-store, and records modules. Render email/password forms, email confirmation instructions, recovery flow, explicit guest import, personal records and checkpoint conflict choice. Keep account tokens in the parent; allow child events only through Task 2's bridge. Dispose the old store before switching account subscriptions.
- [ ] Pin the current verified Supabase client version, commit the lockfile, and add public project configuration. Never include service-role keys or database credentials. If cloud is unavailable show guest/offline state, without implying cloud completion.
- [ ] Run `node --test tests/*.test.js` and the database integration suite. Verify real sign-up, sign-in, recovery, sign-out, cross-device restoration, reconnect/retry, guest import, conflict resolution, and two-account isolation. Record any external email-delivery or browser verification blocker explicitly.
- [ ] Commit the passing cloud implementation and schema.

### Task 5: GitHub publication and launch verification

**Interfaces:** Pages workflow publishes a static artifact with relative game/asset paths and public Supabase configuration. README documents the iframe protocol and the exact files required to add another game.

- [ ] Implement `scripts/verify-site.mjs` to check every catalog iframe entry and local asset exists, config contains only public settings, and no secret/config-local files enter the deployment artifact. Add `npm test` and `npm run verify` scripts, ignoring local secrets and intermediate artifacts.
- [ ] Run `npm test` and `npm run verify`; require passing output before publication.
- [ ] Create `ironclad-games` on GitHub only after rechecking repository availability. The connector currently returns no accessible repositories and has no repository-creation or Pages-settings tool; use the authenticated GitHub browser UI if necessary, reading the computer-use skill first. Do not treat the empty repository list as proof the name is available. Continue using connector file/commit operations when sufficient.
- [ ] Add `.github/workflows/pages.yml` with Pages deployment permissions, artifact upload, and deploy step; set Pages to GitHub Actions. Configure actual deployed-site and recovery redirects in Supabase. Use GitHub Pages as the publishing target requested by the user.
- [ ] Publish the verified site and inspect the deployment result until terminal. Open the actual deployed URL, verify nested-path assets and every iframe game, and confirm cloud records restore in a second authenticated session.
- [ ] Finish README with adding-game instructions, required checkpoint integration, supported desktop devices, and development/deployment commands. Report the verified repository/site URLs and any remaining limits without claiming unverified checks passed.
- [ ] Commit final launch documentation.

## Execution recommendation

Use native execution in this chat because the iframe protocol, game lifecycle, and cloud-save interfaces are tightly connected. Review this plan before implementation. Subagent-driven execution is an available alternative if the user prefers task-by-task independent implementation and review.

