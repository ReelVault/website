# TODO

## v1.4.0

- [ ] **Old TV / browser compatibility** — decide and document the supported baseline. The build target is
  `es2022`, but the source uses ES2023 built-ins without polyfills: `Array.prototype.toSorted`,
  `toReversed`, `findLast`, `Object.hasOwn` and `Intl.Segmenter` (module-scope in `src/utils/locales.ts`).
  Add targeted polyfills/helpers or raise the documented minimum browser versions.
- [ ] Revisit `Intl.Segmenter` fallback in `capitalizeEndonym` (currently a plain `[...label]` fallback is safe
  but loses grapheme clustering for combining marks).

## Deferred from the 2026 reliability audit

- [ ] **API base with a path prefix** — `VITE_REELVAULT_API_URL=/api` is documented, but SDK helpers build
  `new URL("/v1/...", base)` and drop the prefix. Normalize/validate the base or remove the documented support.
- [ ] **Seek serialization** — `playbackSessions.seek()` has no abort signal; two quick seeks can reach the
  server out of order. Add a latest-wins queue or extend the SDK with a signal.
- [ ] **Watchlist pagination** — loading is bounded to 4 parallel requests and 10k titles; a watchlist larger
  than that needs real incremental loading/server-side filters.
