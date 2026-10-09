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

- **Plugin configuration errors name the field** — a rejected save that names a field (a required value left blank) marks that field with an inline message, not only a toast.
- **Confirm before a restart ends playing streams** — updating or rolling back the server, and restoring a database backup, while streams play now shows a warning with the active stream count and asks for confirmation. Confirming runs the action anyway, and the restart stops the streams.
- **Status filter in the admin catalog** — the metadata browse bar filters by the catalog's own status values (for example Ended), taken from the server, instead of a free-text field.
- **Playback speed up to 3×** — the player speed slider and the `<` / `>` shortcuts offer 2.5× and 3×, and a stored speed above 2× is kept instead of being capped.
- **Preview before purging worker history** — the purge dialog shows how many operations and jobs the chosen filter would delete before anything is removed.
- **Cancel a running update** — the updates page offers Cancel while an install is still downloading, verifying or extracting, and cancelled runs show a Cancelled badge in the history.
- **Update reports why it waits** — a server update refused because streams are playing shows the active stream count (`update.blocked_active_streams`) instead of a generic failure.
- **Clearer database restore** — the restore confirmation says the current database is backed up first. A restore blocked by active streams names how many are running instead of failing generically.
- **Remove previews for selected files** — the admin media list has checkboxes. The trickplay previews of the selected files can be removed in one step after confirmation; the files themselves stay. The selection holds across pages until it is cleared.
- **Select every file on the page** — the admin media list has a *Select all on this page* checkbox. It adds every file shown on the current page to the selection, or removes them when they are all selected already. Selections on other pages are kept.
- **Open the title of a failed download** — a failed or cancelled download on the downloads page has an Open title button that goes to its title. Requires SDK 1.3.0.
- **Download progress in the navbar** — while downloads are pending or running, a navbar button shows their average progress and count and opens the downloads page. The status is polled only while a download is active.
- **Watchlist auto-removal setting** — Settings → Playback has a switch that takes watched titles off the watchlist: a movie once it is finished, a series once every episode is. Admins set the default under Settings → Profiles, and the profile editor can change it per profile. Requires SDK 1.3.0.
- **Watch state from the details page** — the title menu has Reset title watch progress, and the buttons above the episodes mark the whole season watched or unwatched in one request. Resetting or unmarking one episode clears only that episode; it used to clear the progress of the whole series. Requires SDK 1.3.0.
- **Download a live session's logs** — every stream in the live activity panel has a Log button that downloads the FFmpeg logs of that session as a zip, with a timeline of its runs.
- **Update history and environment** — the updates page lists installs and rollbacks with their versions, status, start time and error, and shows where the server runs: the container engine, whether it runs without root and whether systemd manages it as a user or system unit. A Podman container is shown as a container install. Requires SDK 1.3.0.
- **User list filters** — the users page filters accounts by role and by status (active or blocked), next to the search. Both choices are kept in the URL. Requires SDK 1.3.0.
- **Audit filters pick from the log** — the audit page's resource type and actor filters are dropdowns with the resource types in the log and the administrators who wrote entries, instead of free-text fields. Accounts that no longer exist are listed by their ID. Requires SDK 1.3.0.
- **Generate missing previews from a title** — the admin title page's actions menu queues the trickplay previews of that title's files that have none yet. Its progress is visible in the worker operations list. Regenerating all previews stays on the trickplay page.
- **Watchlist search and sort** — the watchlist page filters its titles by name and sorts them by recently added, title (A–Z) or newest release. The search and the sorts run on the whole watchlist, which the page already loads, so a match is never hidden behind a page boundary.
- **Migration status** — the database page shows how many schema migrations the database has applied, and how many are pending until the next server start.
- **Paged markers list** — the admin markers page shows 50 markers per page with paging controls, and its header count is the number of markers that match the filters rather than the page on screen.
- **Mark all read follows the filter** — the notifications page's Mark all read acts on the type shown in the active tab, not on every notification.
- **Stream slots in the live view** — the admin live activity section shows how many stream slots are in use out of the server limit. The count turns into a warning when every slot is taken.
- **Dismiss notifications** — every notification has a Dismiss action, and the notifications list offers Dismiss shown, which removes the notifications of the current page after confirmation. Only your own notifications are removed.
- **Regenerate previews by library** — the trickplay page queues the missing previews of one library, or rebuilds all of them. Once queued, the page shows how many files were generated, how many the storage budget skipped, how many were skipped for other reasons, what failed and what is still running; the counts refresh while work remains.
- **Worker pause, retry and watchdog notice** — the worker admin page pauses and resumes a task's automatic runs. A paused task shows a badge and no next run, while manual runs keep working. Each scheduled task shows its next run. A failed job in an operation can be retried; the retry is a new job and the failed one stays in the history. A notice appears when the watchdog has requeued orphaned jobs since the server started.
- **Change password** — Settings now has a Password section: change your password by confirming the current one. Other devices are signed out and API errors (wrong current password, invalid length) are translated. Requires SDK 1.3.0.
- **Subtitle language priority list** — Settings → Playback has a new "Fallback subtitle languages" picker: add languages as chips, reorder them and remove them. When the preferred language has no subtitles, the next language in the list is used. Admins can set a default in Settings → Profiles. Requires SDK 1.3.0.
- **Remove from Continue Watching** — each Continue Watching card has a new hide button (and a context-menu entry). Unlike resetting progress it keeps your resume position; the title returns as soon as you play it again. Requires SDK 1.3.0.
- **Sleep timer** — a moon button in the player pauses playback after 15, 30, 45 or 60 minutes, or at the end of the current episode (which also stops auto-advancing to the next one). The timer survives episode changes and is cleared when you leave the player.
- **Rewind on resume** — Settings → Playback can rewind 5–30 seconds when you continue a title, so you regain the context of the scene. Requires SDK 1.3.0.
- **Plugin interface switches** — a new "Interface" card on each plugin's settings page lists everything the plugin adds to the app (pages, dialogs, tabs, buttons and widgets, search results, pre-playback content) with a switch for each, plus a master switch for the whole interface. Changes apply immediately without disabling the plugin; "Show everything again" restores the defaults. Requires SDK 1.3.0.
- **Library sorting** — the admin library list can be sorted by name, newest, most files or size.
- **Subtitle language filter** — the admin subtitles list can be filtered by language (the filter was supported in the URL but had no control).
- **Metadata catalog filters** — the admin metadata list can be filtered by movie/series and sorted by recently added, title, release date or weakest match; both choices are kept in the URL.
- **Settings number fields know their range** — admin settings inputs show the allowed range, reject out-of-range values with a clear message and translate the server's settings errors. Requires SDK 1.3.0.
- **New server settings** — labels and descriptions for the HLS muxing queue size, concurrent downloads per profile, trickplay frames per file, plugin blob retention and the per-plugin daily notification limit.
- **Log page: complete archive and a tail notice** — a "Download all" button fetches every log file (rotated and FFmpeg logs) as one zip, and when the viewed file is larger than the served window the page states that search and pagination only cover the last N MB. Requires SDK 1.3.0.
- **Plugin package details** — each plugin in the admin list shows its capabilities, when and from where its package was installed, an *Update available* badge when an enabled catalog offers a newer version, a warning when the package on disk no longer matches its install record, and a warning when its configuration file cannot be read. Requires SDK 1.3.0.
- **Stored secrets are visible** — a secret field shows a *Set* badge when a value is stored, and an empty field keeps that value. Requires SDK 1.3.0.
- **Failed plugin upgrades say what happened** — an update whose new version did not start reports that the previous version was restored. Requires SDK 1.3.0.
- **Source directories can be sorted** — a library card with more than one source directory has a sort control: path A–Z, path Z–A, or largest first.
- **Show the password on sign-in** — the sign-in form has a show/hide control for the password field.
- **Copy diagnostics from a playback error** — the playback error screen can copy the page, time, browser and title id for a bug report, without stream addresses or tokens.
- **Audio track switch says what it does** — switching the audio track shows *Switching audio track…* instead of *Changing quality…*.
- **Expired quick connect codes stop** — once a pairing code expires the page says so, offers a new code, and stops polling for an authorization that can no longer arrive.
- **Subtitles for preferred languages only** — the subtitle list has a *Preferred languages only* switch that uses the profile's subtitle language and fallback languages (`en-US` matches `en`). Requires SDK 1.3.0.
- **Skip buttons wait for playback** — the skip intro, credits and recap button stays hidden while the stream is buffering, stalled or failed, so it cannot jump into the same stall.
- **Confirm before deleting a log file** — deleting a log file from the logs page asks first and names the file; the file is removed from the server only after confirmation.
- **Watchlist button shows its state** — on a title's page the watchlist button reads *Remove from list* when the title is already on the list, reports its pressed state, and is disabled while the change is being saved.
- **Jump to any page** — admin pagination shows an editable page number: type a page and press Enter.
- **Restart notice for the session lifetime** — the session lifetime setting says that it applies to new sessions after a server restart.
- **Next episode on small screens** — the next-episode button in the player is shown on phones too, not only from 640 px wide.
- **Warning before leaving unsaved settings** — closing or reloading the tab while a settings section has unsaved changes asks the browser to confirm.
- **Regenerate two-factor backup codes** — with two-factor enabled, settings has *Regenerate backup codes*: confirm the password and get a new set. The previous codes stop working.
- **Admin genre list is paginated** — the genres page loads 50 genres per page with the page control, instead of silently stopping at the first 100. A new search starts at page one.
- **Collection context survives the player** — auto-next keeps the collection you were watching, and switching the version of a file inside a collection stays in that collection.
- **Search log files** — the logs page has a search box that filters the log files by name within the selected category.
- **Log filters** — the logs page has a module field, a *Hide text* field that drops matching lines, and From/To time pickers. Time filters apply to structured entries only: plain-text lines (such as FFmpeg output) have no timestamp and are left out while a time range is set. Requires SDK and server with the log filters.
- **Settings export and import** — the settings page has *Export* (saves the current values as `reelvault-settings.json`) and *Import* (applies a file exported from a server). A file with an unknown or invalid setting is refused as a whole. Requires SDK and server with settings export.
- **Resource history window and export** — the resources page switches its history between the last hour, six hours, 24 hours and seven days, and exports every sample of the window as CSV or JSON. Requires SDK and server with the resource window.
- **Audit search and export** — the audit page has a search box for the resource ID and the summary, and exports the entries that match the current filters as CSV or JSON Lines (up to 10 000 entries). Requires SDK and server with audit search.
- **Retry failed downloads** — failed and cancelled downloads have a *Retry* button that queues the same file and quality again. The downloads page shows the storage the downloads use against the limit. Requires SDK and server with download retry.
- **Notification pages filtered on the server** — the notifications page loads 25 notifications at a time with page controls. The type tabs and the unread filter run on the server, so the list and its counts cover every notification, not only the ones loaded. Requires SDK and server with notification pages.
- **Audit activity per administrator** — the audit page has a *By administrator* panel above the entries: each administrator's creations, edits and deletions for the current filters, with the latest activity. Requires SDK and server with the audit summary.
- **Stop several live streams at once** — the live activity panel has a checkbox on each stream and *Select all*. The selected streams can be stopped together after one confirmation; the result says how many stopped and how many could not be stopped. Requires SDK and server with bulk stream termination.
- **Admin download jobs paged on the server** — the downloads overview loads 50 jobs at a time with page controls and a status filter. The counters come from the server, so they cover every job, not only the page on screen. Requires SDK and server with the paged download list.
- **Marker export and import** — the markers page exports the markers matching the current filters as NDJSON and imports such a file, replacing the markers of each media file it names. A file with an invalid line is refused and the error names the line. Requires SDK and server with marker transfer.
- **Settings refresh when another administrator saves** — the settings page reloads when another administrator's session saves or resets a setting, so it no longer shows stale values. Requires SDK and server with setting change tracking.
- **Remove trickplay previews and see stored artifacts** — the media file page has *Remove trickplay previews* for that file, and the trickplay page lists the stored artifacts per owner and kind. Requires SDK and server with trickplay removal.
- **Database backups download and integrity check** — each backup on the database page has a *Download* button, and the page runs SQLite's integrity check (the problems SQLite reports are listed) and an optimize. Requires SDK and server with database integrity and downloads.
- **API key rotation, editing and expiry view** — each API key can have its secret replaced (the new secret is shown once and the old one stops working at once), be renamed, and have its expiry changed or removed. Each key shows who created it, and a filter lists the keys that expire within 14 days. Requires SDK and server with API key rotation.
- **Admin collections can be sorted and paged** — the collections page sorts by name, newest or recently updated, shows 25 per page with the page control, and a new search or sort starts at the first page.
- **Admin subtitles can be sorted** — the subtitles list sorts on the server by date added (oldest first, the default), recently updated, language or title, and the choice stays in the URL. Search runs on the server and covers every subtitle, not only the current page. Requires SDK and server with subtitle search.
- **Metadata catalog browse filters** — the admin catalog narrows by a release year range, a minimum match score (50, 70 or 90%) and the first letter of the title (A–Z, or other characters). The choices stay in the URL.
- **Plugin configuration reset, export and import** — the plugin settings page restores the defaults for every setting after a confirmation (this removes the stored values, including API keys), restores one field's default before saving, exports the configuration without secret fields as a JSON file, and imports such a file. Requires SDK and server with the configuration reset and export.
- **Refuse a plugin's CSP sources** — an installed plugin in the admin list has a button to allow or refuse the content-security-policy sources its manifest declares. The button's hint says what refusing blocks. Requires SDK and server with the CSP choice.
- **Missing repositories are named** — the admin plugin list says which plugin repositories could not be read, so plugins that are missing from the catalog are explained. Requires SDK and server with the catalog report.
- **Bulk plugin actions and version pinning** — installed plugins in the admin list have checkboxes and a bar that enables or disables the selection at once; a result line says how many could not be updated. Each installed plugin has a *Pin version* button that keeps its installed version, so the catalog offers no update for it. Requires SDK and server with the bulk and pin endpoints.
- **Restart notice comes from the setting** — a setting that takes effect only after a restart shows *Takes effect after a server restart* under its description. The session lifetime and the HLS segment length no longer repeat that sentence in their own text. Requires SDK and server with the setting metadata.
- **Remove a profile PIN** — profile settings show *Remove PIN* when the profile has one, after a confirmation. The PIN itself is never shown. Requires SDK and server with the PIN status.
- **Settings search** — a search box in the settings header narrows the open section to the settings whose name, description or key matches. The query stays when you switch sections, and unsaved edits in hidden settings are still saved.
- **Marker list filters run on the server** — the admin markers page filters by type, source and text in the database, so a search covers every marker (up to 5000 results) instead of only the first 5000 loaded. Saving or deleting a marker reads the file's current markers first, so no marker is dropped. Requires SDK and server with the marker filters.
- **Time limits for library scans, scanned folders and downloads** — settings let you change how long a folder walk (`scanning.pathScanTimeoutMs`), a library scan (`workers.definitions.libraryScan.timeoutMs`) or a download's processing (`workers.definitions.downloadsProcess.timeoutMs`) may run. A folder walk is limited to 10 seconds to one hour (default two minutes); a library scan and a download processing to one minute to one day (default two hours). Changes apply to work started after the change.
- **Seek debounce setting** — the admin settings page labels `stream.seekDebounceMs`. Requires server with the new setting.
- **Subtitle search suggests your languages** — the in-player subtitle search shows your preferred languages as quick picks and searches once automatically when it opens.
- **Dashboard empty state has a next step** — when there is nothing to feature, the dashboard explains why and offers the next step: administrators get *Add the first library*, everyone else gets *Try again*. Previously the top of the page was blank.
- **Equalizer opens as a top drawer** — the equalizer moved out of the subtitles and audio dialog into its own drawer from the top edge, opened from the player settings menu. It does not block the picture: you can seek the video while tuning the sound.
- **Autoplay and skip-intro in the player menu** — the player settings menu has switches for *Autoplay the next episode* and *Automatically skip the intro*, saved to your profile and applied straight away. The `<` and `>` keys step the playback speed down and up through the menu's speed steps, with the same on-screen feedback.

### Fixes

- **Active operation count stopped at 50** — the worker activity badges counted only the first page of active operations; they now show the total, so a busy queue is no longer under-reported.
- **Watchlist showed only the first 20 titles** — the page requested a single page of the paginated endpoint, so larger watchlists were silently truncated and the total/movie/series statistics were wrong. The page now loads every page before rendering.
- **Worker "Scheduled" and "Active now" filters always showed nothing** — the quick filters compared the filter id with the task category instead of checking triggers and active jobs, so both returned an empty list while their counters were correct.
- **"Files" on a library card ignored the library** — the admin media list now honors the `libraryId` the card passes, and a button clears the filter.
- **Installed plugins ignored the search box and category filter** — only the catalog was filtered; the installed list now follows both.
- **Hardcoded Polish labels in clipboard toasts** — copying logs and operation IDs always said "logi" / "ID operacji" regardless of language; the labels are now translated.
- **Transcode progress was invisible and could freeze after a seek** — the server-side progress underlay was nearly the same colour as the track and carried no label, and after a seek the cleared progress kept a stale "completed" state, which stopped the poll for the rest of the session. The underlay is now clearly visible, the seek bar tooltip shows "Prepared N%" while the encode is running, and the poll keeps going after a seek.
- **Deleting an account from the user list had no confirmation** — the context-menu action removed the account and its profiles immediately; it now asks first.
- **Account error messages** — register, login, first-run setup and the admin user actions now show translated messages for a duplicate email, a blocked account, an invalid email and a rejected request instead of a generic error.
- **Download error messages** — a disabled feature, a download already in progress and a full download quota now show their own translated message.
- **Stream limit messages** — hitting the server or per-user stream limit, or starting sessions too fast, now shows a clear translated message with the limit or the wait time.
- **HLS segment length setting** — the description now says the change applies after a server restart.
- **Admin media file actions on touch and TV** — the open, edit and delete buttons on a media file card appeared only on hover, which touch and TV input never triggers. They stay visible on coarse pointers, and keyboard focus reveals them too.
- **Plugin errors show a readable reason** — a plugin card that failed to start shows the translated reason for the server's stable error code (for example too many registered routes) instead of the raw server text, which is kept when no translation exists.
- **Requests from the global search keep the requester's name** — a media request made from the search bar was saved without the requester's name. It now carries the account name, as requests from the title pages do.
