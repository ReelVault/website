# ReelVault Web

The web app for [ReelVault](https://github.com/ReelVault/reelvault), built as a single-page app.

## Stack

- **Vite 8** and **React 19**, with the React Compiler enabled
- **TanStack Router** (type-safe routes) and **TanStack Query**
- **Tailwind CSS v4** and shadcn/ui (Base UI)
- TanStack Form for forms; URL state through route `validateSearch`
- Bun for packages, scripts and the production server

## Requirements

- [Bun](https://bun.sh) 1.4.2 or newer
- A running ReelVault server (see the [server README](https://github.com/ReelVault/reelvault))

The SDK comes from npm as `@reelvault/sdk`. To develop against a local copy, see [Development](#development).

## Quick start

```bash
bun install
bun run dev        # http://localhost:3000, proxies /v1 and /api to the server on port 3030
```

Open http://localhost:3000 and sign in to your local server.

## Commands

| Command | What it does |
|---|---|
| `bun run dev` | Vite dev server with hot reload |
| `bun run build` | Production build in `dist/`, with precompressed `.br` and `.gz` files |
| `bun run start` | Static server for `dist/`, with Brotli and gzip and SPA fallback |
| `bun run check-types` | Generate routes and translations, then type-check |
| `bun run lint` | Biome and oxlint |
| `bun run format` | Format with Biome |
| `bun run deadcode` | Find unused code with Knip |
| `bun run test` | Unit tests |
| `bun run doctor` | React best-practice scan (react-doctor) |
| `bun run i18n:unused` | Find translation keys that nothing uses |

## Configuration

Copy `.env.example` to `.env`:

- `VITE_REELVAULT_API_URL`: the server address for the frontend. In development, Vite proxies `/v1` and `/api`, so you can usually leave it empty. A browser on your LAN uses the server on the same host automatically.
- `REELVAULT_API_URL`: used only by `server.ts`, the production proxy.

## Adding a language

English is the base language. To add one, for example German (`de`):

1. Add `de` to `locales` in `project.inlang/settings.json`.
2. Create `messages/de.json` with the same keys as `messages/en.json`, translated.
3. Add a label and flag for `de` in `LOCALE_META` in `src/utils/locales.ts`. The build fails until you do.
4. Run `bun run i18n`. `bun run dev` and `bun run build` also run it.

The locale switcher and the interface language setting read `SUPPORTED_LOCALES` automatically. Audio and subtitle languages come from a separate list, `CONTENT_LANGUAGES`, in the same file.

## Development

To use a local SDK instead of the npm package, link it:

```bash
# in the sdk repository
bun link

# in this repository
bun link @reelvault/sdk
```

When the server contract changes, rebuild the SDK and refresh the local copy. [AGENTS.md](AGENTS.md) has the exact steps.

## CI

- `ci.yaml`: type-check, lint, Knip and tests.
- `react-doctor.yml`: advisory React scan on pull requests and on pushes to `main`.

## License

GPL-3.0-only. See [LICENSE](LICENSE).
