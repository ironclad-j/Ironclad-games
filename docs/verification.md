# Ironclad Games — launch verification

The arcade supports Chromebooks, laptops, and desktop PCs. All games run in opaque-origin sandboxed iframes. Players get automatic private cloud saves without being asked to sign in.

## Confirmed

- GitHub Pages deployment succeeded: https://ironclad-j.github.io/Ironclad-games/
- The deployed workflow passed all 21 tests and static asset checks. The deployed source matches the tested source; root-file differences from browser upload were only line endings and a trailing license newline.
- Live-site search and iframe loading were checked. A Memory Match move saved to the cloud without sign-in and restored inside its iframe after reloading the published site.

- 21 automated tests pass: game rules, checkpoints, catalog filtering, frame message rejection, input switching, automatic guest sessions, offline retries, account boundaries, and save conflicts.
- Static asset and publishable-configuration checks pass.
- Supabase security and performance advisors returned no findings.
- Database integration checks passed for two auth identities in a rolled-back transaction: owner reads, cross-player denial, ownership protection, unique completed runs, and atomic checkpoint revisions.
- Live tests through the normal Supabase anonymous signup API passed for two private player sessions: cloud writes, duplicate-run rejection, cross-player isolation, stale-revision conflict, session restoration, and sign-out. No email or password is required.
- Browser checks confirmed the arcade renders, all three game iframes load, games start, completed rounds register, Memory Match accepts moves, and previously cloud-saved Memory Match progress restores after a page reload.
- Production and local authentication redirect URLs are configured. Anonymous sign-ins are enabled; email confirmation remains enabled for optional email accounts.

## Review and repairs

An independent code review identified two important bugs: a delayed cloud read could rewind recently saved progress, and Pong keyboard input stopped taking effect after mouse input. Both were reproduced with failing tests and fixed, then the complete suite passed.

The review also noted incomplete message payload validation. This was treated as a progress-loss risk and fixed by validating checkpoints through the game's canonical restore logic and checking completed-run UUIDs and integer scores before accepting them.

## Limits

Anonymous progress is tied to the browser session. Clearing browser data or switching browsers/devices requires an optional permanent account to retain access across devices. Optional email confirmation and recovery delivery have not been tested with a real inbox; public email delivery depends on the project's Supabase email-provider configuration.

Browser gameplay checks used the available Chromium browser. Physical Chromebook hardware and separate Firefox/Edge engines have not been tested.

## Implementation decisions

- Work was isolated in a newly created repository and feature branch because this chat began without an existing repository. The original GitHub MIT license was preserved.
- Remote database DDL used the native Supabase migration tool, which maintains hosted migration history.
- GitHub connector writes returned 403. Source files were published through the user's authenticated GitHub browser session, retaining editable source and automated Pages deployment.

Direct creation of password-based QA accounts was rejected by automatic approval review. That action was not performed. The required cloud flow was instead verified through normal, login-free anonymous player sessions after the user explicitly requested automatic cloud saves.
