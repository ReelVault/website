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

- **Trickplay storage usage** — Admin → Trickplay now shows a `used / budget` card with core artifact usage and the configured `system.artifacts.coreMaxStorageGb` budget, alongside the existing coverage counts.
- **Periodic library rescan setting** — Admin → Settings → Scanning now exposes `scanning.scheduledScanIntervalHours` (`0` = disabled), providing a safety net for network shares where file watching is unreliable.

### Fixes

#### Admin & dashboard

- **Admin libraries page crash** — the dashboard composite seeded the admin libraries cache with objects whose `paths` and statistics had been stripped by the response schema, causing `can't access property "length", e.paths is undefined` on first render. The dashboard contract now returns full library relations, restoring the storage breakdown with correct counts and sizes.
- **Admin artwork URLs** — analytics "Most popular productions", live activity and Insights/Wrapped slides extracted image IDs using the stale `/api/images/` pattern, causing posters to render as placeholders. The helper now correctly handles the server's `/v1/images/` URLs.

#### Settings & scanning

- **Probe-failed findings** — the new `probe_failed` scanner reason is now translated in the library "needs attention" dialog in both PL and EN, replacing the raw error code with a meaningful explanation.
- **Core artifact storage setting** — Admin → Settings → Trickplay now exposes `system.artifacts.coreMaxStorageGb` (`0` = automatic, 5% of the artifacts volume clamped to 5–100 GB). This caps preview sprites and other server-generated artifacts now that they are no longer charged against the per-plugin artifact quota, preventing large libraries from hitting the previous 512 MB limit.
- **Scan trickplay operations** — the website now reflects the consolidated scan behavior where a library scan creates a single trickplay operation per library instead of one operation per file.

# v1.2.2

### Fixes

- **Stale PWA shell could break the API origin** — the service worker served the precached app shell for every navigation, so a shell cached before the server's same-origin marker existed made the client target `api.<hostname>` and its status requests were blocked by the CSP. Navigations are now network-first with the precached shell as the offline fallback, so a fresh server response (marker included) always wins when online.
- **Templated plugin `submit` paths** — the `submit` schema action sent `action.path` verbatim instead of resolving `{{…}}` placeholders (unlike `call`/`delete`), so a dialog addressing a resource by id called the wrong URL.
- **Plugin dialog data sources and field defaults** — `{{…}}` placeholders in a data-source `path` were sent verbatim (the dialog fetched a literal `/reports/item/{{context.params.id}}` URL), and `default` values referencing `{{data.…}}` were collected before the source resolved, so selects and textareas stayed empty. Paths are now interpolated and data-driven defaults are applied to untouched fields once the source loads, while user edits are preserved.

# v1.3.0

### Features

#### Playback & watchlist

- **Playback quality settings** — Added HDR passthrough/SDR conversion and maximum stream bitrate options (no limit, 1.5, 4 or 8 Mb/s).
- **Playback speed up to 3×** — Added 2.5× and 3× playback speeds to the speed slider and keyboard shortcuts. Previously stored speeds above 2× are preserved.
- **Sleep timer** — Added timers for 15, 30, 45 or 60 minutes, plus an end-of-episode option that also disables autoplay. The timer survives episode changes and resets when leaving the player.
- **Playback preferences in the player menu** — Added immediate profile-level controls for autoplay and automatic intro skipping.
- **Rewind on resume** — Added a configurable 5–30 second rewind when resuming playback.
- **Subtitle language priorities** — Added an ordered fallback-language list and a preferred-languages-only filter. Subtitle search also suggests preferred languages and searches automatically when opened.
- **Watchlist improvements** — Added search and sorting by recently added, title or release date, with filtering across the entire loaded watchlist.
- **Watchlist auto-removal** — Added an option to remove watched movies and fully watched series from the watchlist, configurable globally by administrators and individually per profile.
- **Continue Watching controls** — Added the ability to hide a title without resetting its resume position. The title returns after playback starts again.
- **Watch-state controls** — Added title-level progress reset and season-level watched/unwatched actions.
- **Download management** — Added retry actions for failed or cancelled downloads, download storage usage, a navbar progress indicator and the ability to download an entire season while respecting profile concurrency and storage limits.
- **Collection-aware playback** — Autoplay and file-version switching preserve the active collection context.

#### Administration & monitoring

- **Plugin management** — Added dedicated catalog detail pages with descriptions, changelogs, versions, capabilities and trust warnings. Added archive validation, package metadata, update availability, version pinning, bulk enable/disable, configuration reset/import/export and CSP source controls.
- **Plugin interface controls** — Added per-plugin switches for pages, dialogs, tabs, buttons, widgets, search results and pre-playback content, with a master switch and a way to restore defaults.
- **Library scanning** — Added dedicated library editing and scan-findings pages, persistent ignore/restore actions, provider candidate searches and live scan progress.
- **Library health checks** — Added source-path validation, path-state details, last-scan information and FFmpeg-based checks for problematic files.
- **Trickplay management** — Added preview generation for individual titles, seasons or libraries, bulk generation, selected-file removal and artifact listings by owner and type. The interface reports completed, skipped, failed and pending work.
- **Media administration** — Added dedicated title and episode file pages, file re-identification, bulk metadata refresh, bulk artwork refresh and bulk deletion of media files and titles.
- **Admin list controls** — Added sorting, filtering and pagination for libraries, collections, metadata, subtitles, markers, genres and download jobs, with server-side filtering where supported.
- **Worker management** — Added pause/resume controls for scheduled tasks, retry actions for failed jobs, next-run information and watchdog recovery notices.
- **Live activity** — Added stream-slot usage, session log downloads, bulk stream termination and account-session management, including signing out selected users or all sessions for an account.
- **Audit log** — Added resource and administrator filters, search, CSV/JSON Lines export and activity summaries per administrator.
- **Logs & diagnostics** — Added log-file search, module and time filters, excluded-text filtering and complete ZIP archives containing rotated and FFmpeg logs.
- **Resource monitoring** — Added selectable history windows (1 hour, 6 hours, 24 hours or 7 days) and CSV/JSON export.
- **Database management** — Added migration status, backup downloads, integrity checks, database optimization and optional backup uploads.
- **API key management** — Added secret rotation, renaming, expiry editing and filtering for keys expiring within 14 days.
- **User administration** — Added role/status filters, last-activity and session information, and bulk session termination.
- **Settings management** — Added settings search, JSON export/import, cross-profile preference copying and refreshes when another administrator changes settings.
- **Plugin configuration** — Added localized setting labels, secret-preserving empty fields, field-level validation, configuration import/export and clearer upgrade failure reporting.
- **New server settings** — Added controls for HLS muxing queue size, per-profile concurrent downloads, trickplay frames per file, plugin blob retention, per-plugin daily notifications, seek debounce and worker timeouts.
- **Playback analytics** — Added interrupted-play classification and a configurable minimum playback duration, defaulting to 60 seconds.
- **Notifications** — Added per-type muting, dismissal actions and filtering-aware bulk read actions.
- **Profile security** — Added password changes, two-factor backup-code regeneration, remaining-code counts and profile PIN removal.
- **Profile preferences** — Added copying preferences from another profile, configurable subtitle defaults and optional hidden pages.
- **Settings safety** — Added in-app confirmation before leaving with unsaved changes, plus browser confirmation when closing or reloading the tab.
- **Restart safeguards** — Added active-stream warnings before server updates, rollbacks and database restores that would interrupt playback.
- **Dashboard empty state** — Added contextual next steps when there is no content to feature.
- **Playback diagnostics** — Added a copyable error report containing the page, time, browser and title ID, without stream addresses or tokens.
- **Plugin settings errors** — Added inline validation messages when the server identifies a rejected configuration field.

### UI

#### Typography & visual consistency

- **Readable text across the app** — Raised 7–11 px text outside the player to at least 12 px and converted tracked, all-caps labels to sentence case, while retaining decorative capitals in the footer.
- **New typefaces** — Introduced self-hosted Figtree for body text and Bricolage Grotesque for headings, keeping typography consistent offline and on local networks.
- **Consistent shared components** — Centralized the appearance of buttons, badges, cards, dialogs, inputs, labels, tables, tabs, menus, selects, sidebars and other shared UI primitives. Pages now pass semantic variants and layout instead of duplicating visual classes.
- **Player interface refinements** — Moved the equalizer into a top drawer that leaves the video accessible, improved audio-track switching feedback and clarified preparation-completion notifications.
- **Rating badge visibility** — Added a profile-level option to hide rating badges from poster cards.

#### Mobile & responsive layouts

- **Phone-first controls** — Standardized buttons, text fields, selects and most interactive controls to a 40 px height or touch target on phones, while preserving denser desktop sizing.
- **Responsive dialogs** — Dialogs become bottom sheets on narrow screens, with internal scrolling and a visible footer; larger screens retain centered dialogs.
- **Home and library layouts** — Shortened hero and header sections to bring titles above the fold, moved hero actions within thumb reach and strengthened the mobile artwork overlay for text contrast.
- **Responsive navigation** — Tightened navbar spacing below 1536 px and prevented labels from wrapping at 1280 px. Admin navigation switches to a sheet below 1024 px.
- **Responsive admin pages** — Fixed content columns and grids that expanded beyond the viewport. Wide content now scrolls inside its own container rather than pushing the entire page sideways.
- **Mobile analytics** — Replaced wide analytics tables with labelled cards below 768 px and allowed the period selector to wrap.
- **Profile picker layout** — Fixed profile cards being compressed to 32 px on larger screens and enabled two profile tiles side by side on phones.
- **Touch-friendly actions** — Made previously hover-only media actions visible on touch devices and available through keyboard focus.
- **Player menus and controls** — Fixed clipped tabs, track names and menus on phones, increased small touch targets and made the next-episode button available on narrow screens.
- **Mobile admin controls** — Standardized filters, selects, tabs, settings fields, pagination controls, sidebar links and action buttons for touch input.
- **Responsive worker dashboard** — Adjusted allocation cards to use two columns at 1024 px and three from 1280 px; long job names and error sources no longer push status information out of their cards.
- **Improved profile and account labels** — Standardized profile names, account-ID copy labels and sign-in password visibility controls.
- **Admin detail navigation** — Increased the touch area of back links and copy-ID actions without enlarging their icons.

#### Playback & streaming

- **Transcode progress** — Made the preparation-progress overlay more visible, added a percentage tooltip and fixed polling stopping after a seek.
- **Skip controls during buffering** — Intro, recap and credits skip buttons remain hidden while playback is buffering, stalled or failed.
- **HDR fallback messaging** — The player now reports when tone mapping is unavailable instead of claiming that conversion to SDR is occurring.
- **Audio-track switching** — Displays the correct “Switching audio track…” status instead of the unrelated quality-change message.
- **Collection context** — Fixed collection context being lost when automatically advancing or switching a file version.
- **Playback end reasons** — Replaced internal session-ending codes with translated descriptions while preserving administrator-entered reasons.
- **Playback preparation notices** — Avoided redundant completion messages when a title was already prepared before the player opened.

#### Libraries, metadata & downloads

- **Watchlist pagination** — Fixed the watchlist loading only the first 20 titles, which also produced incorrect totals and movie/series statistics.
- **Library file filtering** — Fixed the Files action ignoring the selected library; added a control to clear the filter.
- **Plugin list filtering** — Search and category filters now apply to installed plugins as well as catalog entries.
- **Worker operation counts** — Fixed active-operation badges counting only the first 50 entries.
- **Worker filters** — Fixed Scheduled and Active now returning empty lists despite correct counters, and added an explicit empty state when no jobs match.
- **Download and plugin errors** — Added translated messages for full queues and quotas, unavailable files, unsupported retries, and plugin registration limits.
- **Scan error translation** — Replaced the raw `scan_reason_probe_failed` key with its translated message.
- **Global-search requests** — Preserved the requester's account name when creating a media request from global search.
- **Library empty state** — Regular users are now directed to contact the server administrator instead of opening administrator-only settings.

#### Administration & data consistency

- **Confirmation before destructive actions** — Added confirmation for account deletion, log-file deletion and plugin actions that require approval.
- **In-app confirmation dialogs** — Replaced browser-native confirmation boxes for live-stream termination and plugin actions with consistent application dialogs.
- **Database backup errors** — Failed backups now explain that writing failed and suggest checking available disk space and the backup directory.
- **Backup-code handling** — Prevented two-factor backup codes from disappearing when a dialog closes. Codes remain visible until Finish, and success feedback appears only when two-factor authentication was just enabled.
- **Settings persistence** — Warns before leaving settings with unsaved changes, including when closing or reloading the browser tab.
- **Subtitle and marker lists** — Fixed list operations and filters that previously missed records beyond the initially loaded page or could drop markers when saving or deleting them.
- **Plugin settings** — Unsaved changes now trigger a leave confirmation, and rejected values show field-level feedback where available.
- **Two-factor setup** — Fixed invalid nested button/link usage in settings and the mobile menu that generated console errors.
- **Button accessibility** — Button-styled links now expose the correct link role to screen readers.
- **Assistive subtitles** — Exposed active subtitles through a hidden WebVTT track for assistive technology without duplicating on-screen captions.
- **Plugin error messages** — Shows translated explanations for known server error codes, falling back to the original server message when no translation exists.
- **Account error messages** — Added translated feedback for duplicate emails, blocked accounts, invalid email addresses and rejected requests.
- **Clipboard feedback** — Localized log and operation-ID copy notifications.
- **List query errors** — Added translated messages for invalid cursors, oversized fields, excessive or deeply nested filters and too many filter values.
- **Unknown cast and crew names** — Uses the translated “Unknown person” label instead of hardcoded Polish text.
- **Settings descriptions** — Clarified that HLS segment-length changes take effect after a server restart.
- **Expired quick-connect codes** — Expired codes now stop polling and offer a way to generate a new code.
- **PIN attempt feedback** — Failed profile PIN attempts show the remaining attempts; locked profiles show the remaining wait time.
- **Stored secrets** — Empty plugin secret fields no longer imply that a stored value will be cleared.
- **Download cancellation and updates** — Cancelled update runs are identified in history, and update/restore failures blocked by active streams report the stream count.
- **Native player hooks** — Removed unused Capacitor keep-awake and landscape-lock hooks; web and PWA playback behavior remains unchanged.

### Performance

- **Reduced duplicated frontend code** — Removed the unused Capacitor shim, an unused subtitle hook, an unused episodes infinite query and 41 unused shadcn declarations/exports. Consolidated duplicate implementations of admin/user preference forms, navbar and plugin-slot link lists, and details/dashboard rails.
- **Centralized shared UI styling** — Reduced visual class overrides at shared-component call sites from 1,470 to 352. Of the remaining usages, 188 are intentionally retained Skeleton placeholder sizes and container gaps. Dynamic class strings containing visual tokens decreased from 71 to 24.
- **Static UI regression guard** — Added `tests/ui-classname-guard.test.ts` to prevent pages from introducing new visual overrides to shared components.

Production build using `bun run build`. Bundle sizes are the emitted bytes in `dist/`, not gzipped.

| Metric | Before | After | Change |
| --- | ---: | ---: | ---: |
| Emitted JavaScript | 4,965,838 B | 4,946,072 B | −19,766 B (−0.4%) |
| Emitted JS files, including chunks and PWA workers | 385 | 387 | +2 (+0.5%) |
| `react-doctor` score | 70 | 71 | +1 |

The two additional emitted files are the `details-rail` and `provider-candidate-card` shared modules, now produced as separate chunks. The bundle is smaller overall, but the number of emitted files increased.

# v1.3.1

## Features

#### Account & security

- **Security page** — Password and two-factor authentication moved from profile settings to a dedicated Security page, linked from the user navigation.

## UI

#### Plugin management

- **Account menu button** — The profile trigger is now an avatar-only button the same size as the notification and language buttons; the profile name stays in the menu header.
- **Plugin entries in the profile menu** — Rows contributed by plugins now use the same size as the built-in rows, so the menu reads as one list.
- **Plugin version history** — Revision rows have more padding, larger version and date text, and the expand arrow sits at the trailing edge so each row is readable at a glance.
- **Installed plugin cards** — Redesigned around a larger name and version, counters shown as tiles, capabilities as chips and a compact action footer. Less frequent actions (pin version, CSP, details, reload) moved into a ⋮ menu.

#### Spacing & alignment

- **Search dialog header** — The header now uses the same horizontal padding as the search field and footer.
- **Library navigation buttons** — Added spacing between the previous/next library name and its arrow button.
- **Library filters** — The empty gap below the closed advanced filters is gone, so the filter panel has equal top and bottom padding.
- **Device sessions** — Session cards have horizontal padding, so icons, names and log-out buttons no longer touch the card edge.
- **Admin media files** — File cards have inner padding around the checkbox, title, badges and stats row.
- **User sidebar** — The log-out row has bottom padding on desktop.

### Fixes

#### Administration & layout

- **Admin sidebar search** — The search icon overlapped the placeholder on desktop: the input's responsive horizontal padding overrode the left padding. The field now uses the input's leading-icon padding.