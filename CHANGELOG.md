# v1.1.0

### Features

- **API keys admin page** — create, view-once secrets, scope selection and revocation.
- **Backup restore** with confirmation dialog on the database backups card.
- **Per-library metadata language** selector in the library create/edit forms (184 languages with endonyms).
- **Plugin catalog** cards show a "requires server ≥ X" badge when a plugin declares a version floor.
- **All admin settings fully localized** — every settings group and field has localized names and descriptions (no more raw keys).
- **Reorganized admin sidebar** with unified panel styling.

### Performance

- Initial shell diet: UI core and icon bundle removed from the eager chunk, entry bundle **243 KB → 184 KB**, fewer preloads; per-message locale modules replace per-message chunks.
- Dashboard mounts only the active and next hero backdrops (images **0.97 MB → 0.51 MB** per view); navbar notification list loads on open.
- Optimistic watchlist and rating toggles; shared polling helper replaces nine duplicated refetch intervals.

### Fixes

- Human-readable errors for 2FA-required logins, library/profile name conflicts and restore queuing.
- React purity issues resolved (React Compiler can now optimize the affected components).

# v1.2.0

## Features

- **Admin dashboard composite view** — the dashboard now loads from a single `GET /admin/dashboard-view`; its response seeds the stats, libraries, worker-operations, audit-feed, error-log and update-status caches with their exact keys before their sections mount, so those sections issue no fetches of their own.
- **Localized remote-access checks** — the remote-access card renders each check through `translateByKey(check.code, check.params)` from the server's structured `{ id, ok, code, params }` result; every `remote_access_*` code has matching `en`/`pl` messages.
- **Markdown release notes** — the updates page now renders release notes through `MarkdownText` with react-markdown, GFM and GitHub alert blocks inside a collapsible section.
- **URL-driven admin state** — settings, user search/paging, audit filters, subtitle filters, worker tabs/filters/paging, and collections/companies/taxonomy paging now live in the URL, making views linkable and preserving state across reloads.
- **Redesigned admin resources page** — resource history now uses a hand-rolled SVG chart for CPU/RAM/disk with theme tokens, exact-value tooltips, active-worker counts, 24h aggregates and threshold alerts; rescue state is shown as a prominent banner.
- **Server-version gating** — `minServerVersion` is now `1.2.0`; older servers show an explicit update-required state instead of an endless skeleton, while the rest of the admin panel remains usable.
- **Flat pagination envelopes** — admin hooks and pages now read `{ page, limit, total, totalPages, data }` directly from the server response.
- **Subtitle → media-file links** — subtitle rows show a shortened `mediaFileId` linking to the media-file page.
- **Offline-capable app shell (PWA)** — a service worker precaches the app shell and icons, runtime-caches content-hashed JS/CSS chunks, and allows repeat loads to work without a connection. API, realtime and media/subtitle requests are never intercepted, and the web app is installable with the correct `start_url`/`scope`.
"""

## Fixes

### Playback

- **Quick Connect codes** — login and Quick Connect now share `formatQuickConnectCode`, so both surfaces use the canonical `XXX-XXX` format; the duplicated `getFormValue` helper was moved to `form-utils`.
- **User pause state** — explicit play/pause intent now survives reloads and gates delayed or automatic playback paths, preventing a later `canplay` or media-error recovery from unexpectedly resuming a paused stream.
- **Next episode on long shows** — the lookup now uses up to the server maximum (500), follows the default file and matches the current episode against all of its files.
- **Episodes drawer** — seasons are no longer truncated by the server's default page size; it requests up to 500 episodes, re-anchors on the watched season and scrolls after rendering. Selecting an episode also publishes the play intent.

### Admin & navigation

- **Library search** — removing `startTransition` from the controlled search input prevents letters from disappearing while typing; the debounce remains the app-wide 500 ms.
- **Collections/taxonomy pager** — navigation now uses URL paths instead of pathless `_web` layout IDs, and the taxonomy page parameter has a default.
- **Translations** — remaining hardcoded Polish/English UI strings now use paraglide keys.
- **Colors** — rating, compatibility, status, plugin, metadata-fallback and log-viewer accents now use semantic tokens instead of raw palette classes.
- **API-keys hierarchy** — the header now sits outside the `AdminSection` card and `api-keys` is included in `RESOURCE_KEYS`, fixing the breadcrumb fallback to Dashboard.

## Performance

This release is dominated by collapsing per-view request waterfalls into server composites, plus reducing polling, payload size, startup work and unnecessary main-thread work.

### Composite views

- **Admin dashboard** — one `GET /admin/dashboard-view` replaces the six requests fired on mount and seeds each consumer's exact cache key.
- **Player** — progress, markers, subtitles and the full media-file row now come from the single playback view instead of four parallel fetches.
- **Details** — seasons and complete episode lists now come from the details-view composite; the separate seasons fetch and infinite episode paging are removed, and the play button uses `view.smartPlay`.
- **Watchlist** — `GET /me/watchlist?hydrate=true` embeds each item's metadata card, removing the list → metadata waterfall.
- **Collection drawer** — one batch smart-play request (`metadataIds`, up to 50 IDs) replaces one request per collection item.
- **Hero slides** — all five smart-play suggestions are warmed in one parallel wave on mount and then read from cache.

### Polling & payloads

- **Shared worker subscription** — scheduled tasks and queue stats now share one `useWorkerStats` poller.
- **Adaptive process polling** — `useAdminProcesses` polls every 5 s while a process is running and every 30 s while idle.
- **On-demand media audit** — the full server-side media-file audit starts only when the audit view is opened.
- **Narrow admin payloads** — the admin media list requests only rendered columns instead of hydrating wide `videoStreams`/`metadata` relations.
- **Cache seeding** — `useAdminUserFull` seeds the plain-user cache; worker progress ticks coalesce-invalidate the operations list instead of refetching per event.

### Retry, polling & build

- **Bounded retries** — the SDK now retries transient failures once (`maxRetries: 3 → 1`), while React Query retries only errors marked `ReelVaultError.retryable`; non-retryable 4xx responses settle immediately.
- **Admin stats polling** — stats poll every 15 s while streams/jobs are active and back off to 60 s while idle.
- **Compression artifacts** — `.br`/`.gz` siblings are emitted only for files ≥ 1 KB and `index.html` is skipped, reducing compressed files from **659 → 362** and `dist/assets` from **11 MB → 8.9 MB**.

### Startup bundle

- **Navbar command palette** — cmdk is now a lazy chunk mounted only on ≥1536px screens or when opened; `web-layout` drops from **26.9 KB → 8.4 KB** brotli, with the palette fetched on demand.
- **Base-UI splitting** — the monolithic `ui-core` chunk is split per primitive, with shared internals moved into `ui-base`; the shell first-load graph drops from **367,189 B → 347,632 B** brotli and the base-ui payload from **76,690 B → 56,763 B**. The trade-off is 22 additional lazy vendor chunks.

### Request waterfalls

- **Player open** — removed the redundant metadata fetch and unused media prefetch.
- **Admin dashboard** — removed the loader prefetch for `admin/stats`, which is already seeded by the composite.
- **Hero slides** — five smart-play suggestions now warm in parallel with `Promise.allSettled` instead of a serial loop.
- **Navbar plugin search** — input is debounced like native search, issuing one provider request per settled value instead of one per keystroke.
- **Missing-translation refresh** — pages are fetched in parallel instead of up to 50 serial requests.
- **Remote control** — playback-session polling backs off from 15 s to 60 s when no session is running; realtime start/end events still refresh immediately.
- **Plugin catalog** — redundant catalog invalidation was removed and repository mutations now perform their invalidations in parallel.
- **Batch suggestions key** — the episodes-drawer query now uses the `["me","playback","suggestions"]` prefix so playback invalidations reach it.
- **Dashboard seeding** — cache seeding moved from render time into the query function.

### Render & main-thread work

- **Progress bar** — removed mirrored scrub state; the bar now renders once per playhead tick instead of twice.
- **Finish-time clock** — `Intl` formatting is cached per minute instead of running on every playhead tick.
- **Equalizer config** — `localStorage`/`JSON.parse` work is cached in memory and invalidated on save.
- **Hero rotation** — hidden tabs skip rotation ticks, avoiding offscreen state updates and backdrop decoding.
- **Next-episode lookup** — the season/episode sort moved into a pure module-level function so React Compiler can memoize it.
- **Offline shell** — the service worker precaches 8 shell/icon entries (42.3 KiB) and runtime-caches content-hashed chunks; installation does not download the ~4.5 MB app.

## Performance benchmarks

The table counts API requests fired by a cold open of each view (for the details page, requests beyond the composite it already calls). These are request-count and polling-frequency reductions, not timings.

| Area | Benchmark | Before | After | Change |
| --- | --- | ---: | ---: | ---: |
| Network | Admin dashboard — requests on mount | 6 | 1 | **-83%** |
| Network | Player open — extra session-init requests | 4 | 0 | **-100%** |
| Network | Details page — extra seasons + episodes requests | 2+ | 0 | **-100%** |
| Network | Watchlist page — requests | 2 | 1 | **-50%** |
| Network | Collection drawer, 50 items — smart-play calls | 50 | 1 | **-98%** |
| Network | Admin worker page — `getWorkers` pollers | 2 | 1 | **-50%** |
| Polling | Worker processes — idle poll interval | 5 s | 30 s | **-83%** |
| Polling | `admin/stats` — idle poll interval | 15 s | 60 s | **-75%** |
| Network | Failing transient request — max attempts | 8 | 4 | **-50%** |
| Network | Non-retryable 4xx request — attempts | 2 | 1 | **-50%** |
| Build | Precompressed artifacts (`.br` + `.gz`) | 659 | 362 | **-45%** |
| Bundle | `web-layout` chunk (every authenticated page) | 26.9 KB | 8.4 KB | **-69%** |
| Bundle | Shell first-load graph (entry + layout, brotli) | 367,189 B | 347,632 B | **-5.3%** |
| Bundle | Shell base-ui payload (brotli) | 76,690 B | 56,763 B | **-26%** |
| Network | Player open — redundant metadata + media prefetches | 2 | 0 | **-100%** |
| Network | Admin dashboard — unused `admin/stats` prefetch | 1 | 0 | **-100%** |
| Polling | Remote sessions — idle poll interval | 15 s | 60 s | **-75%** |


## Additional measurements

Only smaller measurements without a complete Before/After pair are kept here, so the main benchmark table stays limited to directly comparable results.

- Admin media-file audit — full server-side scans outside the audit view: **1 per page visit → 0**.
- Admin media list — removed `videoStreams` and `metadata` from the payload projection.
- User-detail page — same-row fetches: **3 → 2**.
- Hero slides — smart-play requests are warmed once on mount instead of once per rotation.
- i18n — **16** orphaned keys removed; new strings added 1:1 to `en.json` and `pl.json`.
- Updates route — lazy chunk is ~171 KB raw after adding Markdown dependencies; it remains outside the eager graph.
- Dead code — **−138 lines** across 32 files and **3 files deleted**.
- `react-doctor` score: **70** (threshold ≥ 70).
- Hero slides — up to 5 serial round-trips → 5 parallel.
- Missing-translation refresh — up to 50 sequential page fetches → parallel.
- Navbar plugin search — one provider request per keystroke → one per settled input with a 500 ms debounce.
- Plugin catalog — duplicate invalidation removed; repository invalidations now run concurrently.
- Player episodes drawer — batch smart-play key moved under `["me","playback","suggestions"]`.
- Player progress bar — renders per playhead tick: **2 → 1**.
- Player finish clock — `Intl` formatting runs once per minute instead of ~4×/s.
- Player equalizer — `localStorage` reads + `JSON.parse` per volume gesture → **0**.
- Player next-episode — season/episode map + sort runs only when its inputs change.
- Offline shell — `sw.js` (1.6 KB) + `workbox-*.js` (21.9 KB) are build-only; precache is 8 entries / 42.3 KiB and installation never downloads JS chunks.
- Repeat load — content-hashed chunks are served from the service-worker cache; only `index.html` is revalidated.

# v1.2.1

### Features

- **Trickplay storage usage** — Admin → Trickplay adds a `used / budget` card (core artifact bytes vs `system.artifacts.coreMaxStorageGb`), so the preview storage budget is visible next to the coverage counts.

### Fixes

- **Admin libraries page crash** — the dashboard composite seeded the admin libraries cache with objects whose `paths`/stats were stripped by the response schema, so the page threw `can't access property "length", e.paths is undefined` on first render. The dashboard contract now returns full library relations (and the dashboard storage breakdown gets real counts/sizes).
- **Core artifact storage setting** — Admin → Settings → Trickplay now exposes `system.artifacts.coreMaxStorageGb` (`0` = automatic, 5% of the artifacts volume clamped to 5–100 GB). It caps preview sprites and other server-generated artifacts after they stopped being charged against the per-plugin artifact quota, so large libraries no longer stop generating trickplay at 512 MB.
- **Scan trickplay operations** — a library scan no longer creates one trickplay operation per file; all files from a scan join one active operation per library.
