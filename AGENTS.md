# ReelVault Website

SPA: React 19 + Vite 8 + TanStack Router/Query/Form, Tailwind v4, shadcn. Package manager: Bun (`bun run`, never npm/yarn).
React Compiler is active: no manual `useMemo`/`useCallback`/`memo`.

## Skills
- ALWAYS load and follow the `karpathy-guidelines` skill before starting any task.

## Definition of done (MANDATORY, every task)
Before declaring work finished, run ALL of these from the repo ROOT and get them green:

```bash
bun run format
bun run lint
bun run check-types
bun run deadcode
bun run test
```

- Run them after your LAST code change, not just once midway. Any edit invalidates earlier results.
- `lint` = Biome (`check --write`: auto-fixes and sorts imports) + type-aware oxlint. `format` = Biome + ESLint padding rules. Never hand-format.
- Fix failures at the root cause. Never report "done" with a red check. If a failure is pre-existing and unrelated, say so explicitly and show the evidence.
- Report what you ran and the outcome. Do not claim a check passed unless you actually ran it.
- Changed React components/hooks → also run `npx react-doctor@latest -y --score`; the score must stay ≥70. Debug findings: `bunx react-doctor@latest why <file:line>`, `bunx react-doctor@latest rules explain <rule>`.

## Forbidden: silencing tools
Never suppress a problem instead of fixing it. No linter blocks these, so YOU must not:
- Suppression comments: `// biome-ignore`, `// oxlint-disable`, `// eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`.
- Config weakening: turning a rule off or downgrading it in `biome.json`, `.oxlintrc.json`, `eslint.config.js` or `tsconfig.json`; adding paths to `ignores`/`ignorePatterns` or to the per-file `overrides` in `.oxlintrc.json` (`react/set-state-in-effect`, `react/no-danger`, ...). Existing entries are legacy debt, not precedent.
- Dead-code hiding: `knip.json` ignore entries. Delete the code.
- Test evasion: `test.skip`, `test.todo`, loosened assertions, deleting a failing test to get green.
- Bypassing git hooks (`--no-verify`).

If a rule seems genuinely wrong, STOP and ask. Do not work around it.
When a type error appears, fix the model, not the cast.

## UI & state
- shadcn only — never hand-build Modal/Dropdown/Tabs. Tailwind v4 + `tailwind-merge` + `clsx`.
- `@tanstack/react-query` for async state. `@tanstack/react-form` for forms (admin: metadata/settings/libraries); auth forms stay on FormData.
- Check `src/client/hooks/*` before writing `useQuery`/`useMutation` inline.

## React Query
- Keys only from factories in `src/client/utils/query-keys.ts`. Never inline key arrays. One endpoint shape = one key (different `queryFn` payload → add a discriminant). No alias factories; delete unused entries.
- Invalidate specific keys, never a broad `*Keys.all` for a single-domain mutation. Never double-invalidate. Independent invalidations → `Promise.all`.
- After delete: `invalidate` + `removeQueries` for that entity's `byId`/`details`.
- Realtime events must invalidate every affected key prefix (check real names in `query-keys.ts`, don't guess).
- No unconditional `refetchInterval` — gate on active state, stop when idle. Immutable data → `staleTime: Infinity`. A long `staleTime` needs a matching invalidation path.
- Every mutation needs `onError` → `toastError(msg, error, fallback)` from `src/utils/toast-utils.ts`.

## Reuse before writing
Never reimplement: `formatCountdown`, `formatDuration(Precise)`, `formatTimestamp`, date formatters (`format-utils.ts`/`date-utils.ts`), `copyToClipboard`/`useCopyToClipboard()`, `CopyIcon`, `toastError`, `useDebounce`, `mapQueryError`/`emptyPagination`, `crypto.randomUUID()` (no `uuid` pkg), `AppEmptyState`/`AppLoadingState`/`Spinner`, pagination components, `translateError`/`translateByKey` (`translate-error.ts`), `getAppLocale`/`setAppLocale` (`locale.ts`).
Some formatters intentionally differ in edge-case output across call sites — verify equivalence before merging.

## i18n (paraglide-js)
- All UI strings: `import { m } from "@/paraglide/messages"` → `m.snake_case_key(params)`. Lint blocks literal text in JSX, but NOT strings in toasts, `aria-label`, `placeholder`, `title` — use `m.*` there too.
- Keys: flat snake_case, English words only (`admin_analytics_full_history`). Never Polish-named keys. Add every key to BOTH `messages/pl.json` and `messages/en.json` (1:1).
- Server error codes → `translateByKey(code, params)`; thrown values → `translateError(err, fallback)`. Wire-name code families keep their names — don't rename.
- Plurals = paraglide variant messages, not ICU `{x, plural}` and not ternaries.
- `src/paraglide/` is generated — never edit (`bun run i18n` compiles it). After removing UI, run `bun run i18n:unused`.

## Bundle, SDK & routing
- Heavy deps (`hls.js` etc.) → dynamic import at point of use. Routes via `lazyRouteComponent`; interaction-only components via `React.lazy` + `Suspense`.
- Never import value symbols from the `reelvault-sdk` root barrel — use `reelvault-sdk/client` (type-only imports are fine). Import SDK contract types, don't hand-write duplicates; use SDK union types, not loose `string`.
- New dependency → check bundle impact (`bun run build`, `dist/index.html`). No unreferenced assets in `public/`.
- URL state: TanStack Router `validateSearch` + sync hand-rolled validators (`src/types/search-params.ts`; no zod — route modules are in the eager graph). No manual `window.location`/`history`.
- `Route.useSearch()` / `useSearch({ from })` and `useParams({ from: "/route/$id" })` — never `strict: false` + cast.
- After backend contract changes: `bun run build-sdk` in `ReelVault.Server`, then `cp -r sdk/dist node_modules/reelvault-sdk/` inside `ReelVault.Website`.

## Player (`src/pages/player/`) — fragile zone
- Don't touch effect deps/async timing without deep analysis — the current guards are intentional race protection.
- Playhead lives in an external store (`usePlayerTime` = `useSyncExternalStore` over `player-time-store.ts`). All writes go through `applyTime()` in `use-player-controller.hook.ts`. Never reintroduce `currentTime` React state/context.
- Don't casually move fast-changing state (time/buffered) between context slices. Preserve the `Hls` lifecycle (xhrSetup 403/404/410 reconnect policy).

## Testing
- Tests in `tests/`. Formatter and query-key tests are an output contract — must pass unmodified; if one must change, you changed output: justify it.
- Before deleting code, verify zero refs with `rg` across `src/` + `tests/` — Knip misses object properties.

## Refactors
Zero visual/behavioral change: no class edits, no URL shape changes, no altered toast text, no changed formatter output, no changed poll semantics — unless explicitly asked. When unsure, skip and report instead of guessing.