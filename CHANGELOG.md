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

### Features

- **Admin dashboard composite view** — the dashboard now loads from a single `GET /admin/dashboard-view`; its response seeds the stats, libraries, worker-operations, audit-feed, error-log and update-status caches with their exact keys before their sections mount, so those sections issue no fetches of their own.
- **Localized remote-access checks** — the remote-access card renders each check through `translateByKey(check.code, check.params)` from the server's structured `{ id, ok, code, params }` result; every `remote_access_*` code has matching `en`/`pl` messages.
- **Markdown release notes** — the updates page renders release notes through a new `MarkdownText` component (react-markdown + GFM + GitHub alert blocks) inside a collapsible section.
- **URL-driven admin state** — the settings tab (`?tab=`), user search and paging (`?q=`, `?page=`), all eight audit filters, subtitle filters (`?type`, `?language`, `?q`, `?page=`) with an All/Embedded/External KPI strip, worker tabs (`?tab=`, `?status`, `?page`), and collections/companies/taxonomy paging now live in the URL, so views are linkable and survive reloads.
- **Redesigned admin resources page** — the resource history is a hand-rolled SVG chart (CPU/RAM/disk in theme tokens) with a hover tooltip showing exact values and per-sample active-worker counts, 24h aggregates and alert values against their thresholds; the rescue state becomes a prominent banner and the page uses semantic tokens throughout.
- **Server-version gating** — `minServerVersion` is now `1.2.0` (the dashboard composite is 1.2-only); on an older server the dashboard shows an explicit update-required state instead of an endless skeleton, while the rest of the admin panel keeps working.
- **Flat pagination envelopes** — admin hooks and pages read `{ page, limit, total, totalPages, data }` directly, matching the server's flat envelope.
- **Subtitle → media-file links** — subtitle rows show a shortened `mediaFileId` that links to the media file page instead of an unreadable full id.

### Fixes

- **Quick Connect codes could not be entered** — the login page masked codes as `####-####` while the Quick Connect page used the canonical `XXX-XXX`, so a real six-character code could never be typed there; both surfaces now share `formatQuickConnectCode`, and the duplicated `getFormValue` helper moved to `form-utils`.
- **A user pause did not survive reloads** — the controller now records the last explicit play/pause decision (`userPlayIntentRef`) and gates every delayed or automatic play path (initial-resume seeks, `canplay` autoplay, the 200 ms surface-click toggle, remote commands) on it. The toggle decides at click time, and `wasPlayingBeforeReload` is consumed once so a later `canplay` (for example after `recoverMediaError`) cannot replay a long-paused stream.
- **Next-episode could vanish on long shows** — the 50-episode slice was sorted by episode number only, so the deepest-watched episode (the one continue-watching resumes) fell outside it and `nextEpisode` resolved to `null`, hiding the skip button. The lookup now fetches up to the server maximum (500), links out through the default file, and matches the current episode against all of its files.
- **The episodes drawer truncated seasons** — requesting no explicit limit let the server's default page size (20) silently cut a season short; the drawer now asks for 500, re-anchors on the watched season every time it opens, and scrolls to the current episode only after the list has rendered. Picking an episode publishes the play intent, so the controller (which survives the route navigation) does not keep the next episode paused.
- **Library search dropped letters mid-typing** — updating the search term inside `startTransition` let React revert the controlled input to its last committed value while a transition was pending; the wrap is gone and the debounce matches the app-wide 500 ms.
- **The collections/taxonomy pager failed to navigate** — `useNavigate` `from` resolves against URL paths, not the pathless `_web` layout ids; the calls now use URL paths and the taxonomy page parameter is defaulted.
- **Hardcoded UI strings** — user-visible Polish literals (company taxonomy label, collection name fallback, Quick Connect redeem placeholder, authorizing label) and English leaks (poster alt, navbar aria-label, seek tooltips, mobile season pills, transcode-limit fragment) now go through paraglide keys.
- **Off-palette colors** — rating, compatibility and status accents, plugin colors, metadata-fallback highlights and the log viewer's file selection/level badges now use semantic tokens instead of raw palette classes.
- **Inverted API-keys hierarchy** — the API-keys header rendered inside an `AdminSection` card and the `api-keys` segment was missing from `RESOURCE_KEYS`, so the breadcrumb fell back to Dashboard; the header now sits above the section with a correct breadcrumb.

### Performance

This release is dominated by collapsing per-view request waterfalls into server composites, plus a few polling and payload reductions. Request counts are per cold open of the view.

#### Composite views

- **Admin dashboard** — one `GET /admin/dashboard-view` replaces the six requests the page fired on mount (stats, libraries, worker operations, audit feed, error logs, update status) and seeds each consumer's cache with its exact key.
- **Player** — progress, markers, subtitles and the full media-file row ride the single playback view instead of four parallel fetches; the page and the controller read the same query.
- **Details** — seasons and their full episode lists come from the details-view composite, so the separate seasons fetch and the infinite episode paging (with its skeleton and "load more" control) are gone; the play button consumes `view.smartPlay`.
- **Watchlist** — `GET /me/watchlist?hydrate=true` embeds every item's metadata card, removing the list → metadata waterfall.
- **Collection drawer** — one batch smart-play call (`?metadataIds=`, up to 50 ids) replaces a request per collection item.
- **Hero slides** — all five slides warm their smart-play suggestions in one parallel wave on mount, so rotation reads the cache instead of firing per rotation.

#### Polling & payload

- **Shared worker subscription** — scheduled tasks and queue stats now share one `useWorkerStats` poller instead of polling `getWorkers` twice.
- **Adaptive process polling** — `useAdminProcesses` polls at 5 s only while a process is running and at 30 s when idle (previously a flat 5 s).
- **Media audit on demand** — the media-file audit (a full server-side scan of every file) starts only when the audit view is opened, not on every trip through the page.
- **Narrower admin list payloads** — the admin media list requests only the columns it renders (`?fields=`), skipping the widest `videoStreams`/`metadata` relation hydration.
- **Cache seeding** — `useAdminUserFull` seeds the plain-user cache so the user-detail page reuses the row instead of fetching it a third time; `worker:progress` realtime ticks coalesce-invalidate the operations list rather than triggering per-event refetches.

#### Retry, polling & build hygiene

- **Bounded retries** — the SDK now retries transient failures once (`maxRetries: 3 → 1`) and React Query only retries what the SDK deems retryable (`ReelVaultError.retryable`); non-retryable 4xx (403/404/validation) settle on the first response instead of being retried.
- **Admin stats polling** — `useAdminStats` no longer keeps every admin page on a flat 15 s interval: it polls at 15 s only while streams or worker jobs are active and backs off to 60 s when idle.
- **Compression artifacts** — precompressed `.br`/`.gz` siblings are now emitted only for files ≥ 1 KB, and `index.html` is skipped (its siblings are never served — the page always goes through the injected body): **659 → 362** compressed files, total `dist/assets` **11 MB → 8.9 MB**.

#### Startup bundle

- **Navbar command palette deferred** — the cmdk-based search palette is now a lazy chunk mounted only on ≥1536px screens or when opened (Ctrl+K / the icon); the `web-layout` chunk every authenticated page loads dropped **26.9 KB → 8.4 KB** (brotli), and its 20.9 KB palette chunk is fetched on demand.
- **Base-UI split per primitive** — the single 262 KB `ui-core` chunk (every `@base-ui` primitive in one file) is now one chunk per primitive, with shared positioning/prop-merging internals collapsed into `ui-base`, so a page pulls only what it renders. The shell's first-load graph dropped **367,189 B → 347,632 B** (brotli) and its base-ui payload **76,690 B → 56,763 B** (−26%). Trade-off: +22 lazy vendor chunks for finer, longer-lived caching.

#### Request waterfalls & polling

- **Player open** — dropped the redundant full `metadata.getById` fetch (the title now rides the playback view) and the unused `media.getById` route prefetch: **2 fewer requests**, and the wide metadata-details payload is gone from the most latency-sensitive navigation.
- **Admin dashboard** — removed the loader prefetch of `admin/stats` that the composite view already seeds: **1 fewer request** per dashboard entry.
- **Hero slides** — the five smart-play suggestions are warmed in one parallel wave (`Promise.allSettled`) instead of a serial loop that queued five round-trips.
- **Navbar plugin search** — debounced like the native search: one provider request per settled input instead of one per keystroke.
- **Missing-translation refresh** — pages are fetched in parallel instead of up to 50 serial requests.
- **Remote control** — playback-session polling backs off from 15 s to 60 s when no session is running (realtime `session:started`/`ended` still refreshes immediately): idle requests **−75%**.
- **Plugin catalog** — a plugin mutation no longer invalidates `pluginKeys.catalog()` twice (covered by `pluginKeys.all`), and the four repository mutations issue their two invalidations in parallel instead of sequentially.
- **Batch suggestions key** — the episodes-drawer batch smart-play query moved under the `["me","playback","suggestions"]` prefix, so playback invalidations reach it instead of leaving stale watch states.
- **Dashboard seeding** — the composite's cache seeding moved out of the render body into the query function (no cache writes during render).

### Performance benchmarks

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

### Additional measurements

- Admin media-file audit — full server-side scans triggered outside the audit view: 1 per page visit → 0.
- Admin media list — dropped relation fields from the payload projection: `videoStreams`, `metadata`.
- User-detail page — same-row fetches: 3 → 2 (the `user-full` response seeds the plain-user cache).
- Hero slides — smart-play requests: 5 fired one per rotation → 5 warmed once on mount, then read from cache.
- i18n — 16 orphaned keys removed; new strings added 1:1 to `en.json` and `pl.json`.
- Updates route — lazy chunk ~171 KB raw after adding `react-markdown`, `remark-gfm` and `remark-github-blockquote-alert`; off the eager graph, so the entry bundle is unaffected.
- Dead code — removed the unused `app-tooltip.tsx` (single caller inlined), the redundant nested `QueryProvider` (the router is already inside a `QueryClientProvider`), `useThrottleDebounce` (folded into `useDebounce`) and dead exports (`applyAudioBoost`, `findPluginPage`, `useMetadataWatchlist`, `emptyMetadataForm`, `mediaKeys.markers`, `metadataKeys.watchlist`): net **−138 lines** across 32 files, 3 files deleted.
- `react-doctor` score: **70** (threshold ≥ 70).
- Hero slides — smart-play warm-up: up to 5 serial round-trips → 5 parallel (`Promise.allSettled`).
- Missing-translation refresh — up to 50 sequential page fetches → parallel.
- Navbar plugin search — one provider request per keystroke → one per settled input (500 ms debounce).
- Plugin catalog — a plugin mutation's catalog query was invalidated twice; the four repository mutations now issue their two invalidations concurrently.
- Player episodes drawer — batch smart-play key moved under `["me","playback","suggestions"]` so realtime/playback invalidations reach it.