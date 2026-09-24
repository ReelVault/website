# ReelVault — Web & Desktop

ReelVault frontend: an SPA (Vite + React 19 + TanStack Router + TanStack Query) and a desktop shell (Tauri v2) built from the same code. Requires [reelvault](https://github.com/ReelVault/reelvault).

## Stack

- **Vite 8** (rolldown), React 19.3, **React Compiler** enabled
- TanStack Router (type-safe routing, `lazyRouteComponent`), TanStack Query
- Tailwind v4 + shadcn (Base UI); forms via TanStack Form, URL state via route-level `validateSearch` validators (no `zod`)
- Bun (package manager + runtime for `server.ts`)
- Desktop: **Tauri v2** (`src-tauri/`) — same `dist/` build, zero Tauri runtime APIs in frontend code

## Requirements

- Bun
- SDK client: `reelvault-sdk` — published on npm, or `bun link` the local build: run `bun link` in `reelvault/sdk`, then `bun link reelvault-sdk` here

## Commands

```bash
bun install

bun run dev            # Vite dev server :3000 (proxies /v1 + /api to the server)
bun run build          # production build → dist/ (+ precompressed .br/.gz)
bun run start          # Bun static server for dist/ (LAN/WAN, br/gz + SPA fallback)

bun run desktop:dev    # Tauri dev (starts vite + desktop window)
bun run desktop:build  # Tauri production bundle

bun run lint           # Biome + oxlint
bun run format
bun run check-types
bun run deadcode       # Knip
bun run test
bun run doctor         # react-doctor (React best practices)
```

## Configuration

`.env` (see `.env.example`):

- `VITE_REELVAULT_API_URL` — server address for the frontend. In dev, Vite proxies `/v1` and `/api`; a browser on the LAN automatically targets the same host on the backend port.
- `REELVAULT_API_URL` — used only by `server.ts` (production proxy).

### Desktop mode (Tauri)

The webview loads the build from `dist/`; API calls go **directly** to the server address (no proxy). Priority in `src/client/client.ts`:

1. `VITE_REELVAULT_API_URL` (if set and absolute — baked at build time),
2. the address entered on the login screen (field visible only in the native shell — Tauri),
3. fallback `http://localhost:3030`.

The server allowlists the `tauri://localhost` / `http://tauri.localhost` origins (CORS with credentials).

## Adding a language

English is the base locale; other languages are translations. To add one:

1. **Register the locale** — add its code to `locales` in `project.inlang/settings.json` (and set `baseLocale` to `en` if it is not already).
2. **Add the strings** — create `messages/<code>.json` with the same keys as `messages/en.json` (copy it and translate the values).
3. **Add its label + flag** — in `src/utils/locales.ts`, extend `LOCALE_META`. It is typed as `Record<Locale, …>`, so the compiler will refuse to build until you do.
4. **Recompile Paraglide** — `bun run i18n` (or just `bun run dev` / `bun run build`).

That is everything for the interface: the locale switcher and the **Interface language** dropdown both read `SUPPORTED_LOCALES` from `src/utils/locales.ts`, so no component needs editing.

Two lists are intentionally separate:

- `SUPPORTED_LOCALES` — interface languages (Paraglide).
- `CONTENT_LANGUAGES` in the same file — audio/subtitle languages. Add an entry here when a language should be selectable for playback even if the interface is not translated into it.

To check for untranslated, hardcoded strings, run `bun run i18n:unused`.

## CI

- `ci.yaml` — quality job (types/lint/knip/tests) + desktop job (`cargo check` on the shell)
- `react-doctor.yml` — advisory scan on PRs/pushes to main
