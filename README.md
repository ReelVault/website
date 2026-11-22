<div align="center">

<img src=".github/assets/banner.png" alt="ReelVault Web" width="1200">

# ReelVault Web

**The face of your media server.**

[![CI](https://github.com/ReelVault/website/actions/workflows/ci.yml/badge.svg)](https://github.com/ReelVault/website/actions/workflows/ci.yml)
[![Latest release](https://img.shields.io/github/v/release/ReelVault/website?style=for-the-badge&color=00E676)](https://github.com/ReelVault/website/releases)
[![Docs](https://img.shields.io/badge/docs-reelvault.org-00E676?style=for-the-badge)](https://reelvault.org)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue?style=for-the-badge)](LICENSE)

[Docs](https://reelvault.org) · [What you get](#what-you-get) · [Development](#development) · [License](#license)

</div>

This is the web app for [ReelVault](https://github.com/ReelVault/reelvault). It's what you and your family see in the browser: the library you browse, the player you watch in, and the admin panel where you set things up.

<table>
<tr>
<td align="center"><img src="https://reelvault.org/screenshots/movies-grid.png" alt="The movie library grid" width="430"></td>
<td align="center"><img src="https://reelvault.org/screenshots/player.png" alt="The ReelVault player" width="430"></td>
</tr>
</table>

## What you get

|                                        |                                                                                                                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🎬 **A library that's easy to browse** | Posters, ratings, filters, search and an A–Z index across your movies and shows. The dashboard shows recent additions and what you were watching.               |
| ▶ **A player that remembers**          | Resume, subtitles, audio tracks, skip buttons, a sleep timer and playback stats. Start on the TV, finish on your phone — your progress is tied to your profile. |
| 👤 **A space that's yours**            | Watchlist, downloads, notifications and settings belong to your profile, so nobody else's choices get in your way.                                              |
| ⚙️ **Admin tools, too**                | Manage libraries, users, plugins, background jobs, streaming and diagnostics from the same app.                                                                 |
| 📱 **Made for phones, too**            | The layout adapts to phones and tablets, with dialogs that slide up from the bottom and buttons big enough for a thumb.                                         |
| 🌍 **Available in your language**      | English is the base, with more locales available. Audio and subtitle languages are set separately from the interface language.                                  |

## Development

This part is for people working on the web app. If you're just looking for the user guide, see [Web app](https://reelvault.org/guide/website).

### Stack

- **Vite 8** and **React 19**, with the React Compiler enabled
- **TanStack Router** (type-safe routes) and **TanStack Query**
- **Tailwind CSS v4** and shadcn/ui (Base UI)
- TanStack Form for forms; URL state through route `validateSearch`
- Bun for packages, scripts and the production server

### What you need

- [Bun](https://bun.sh) 1.4.2 or newer
- A running ReelVault server (see the [server README](https://github.com/ReelVault/reelvault))

The SDK comes from npm as `@reelvault/sdk`. To develop against a local copy, see [Working on the SDK locally](#working-on-the-sdk-locally).

### Quick start

```bash
bun install
bun run dev        # http://localhost:3000, proxies /v1 and /api to the server on port 3030
```

Open http://localhost:3000 and sign in to your local server.

### Commands

These are project scripts — run them with `bun run` from the repository root:

**Everyday**

| Command         | What it does                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| `bun run dev`   | Starts Vite with hot reload at `http://localhost:3000`. API calls are proxied to the server on port 3030.     |
| `bun run build` | Builds the app into `dist/` and pre-compresses the files with Brotli and gzip.                                |
| `bun run start` | Serves the built app from `dist/`, with Brotli/gzip support and a fallback to the SPA for client-side routes. |

**Checks and maintenance**

| Command               | What it does                                                           |
| --------------------- | ---------------------------------------------------------------------- |
| `bun run check-types` | Regenerates route and translation types, then type-checks the project. |
| `bun run lint`        | Runs Biome and oxlint.                                                 |
| `bun run format`      | Formats the code with Biome.                                           |
| `bun run deadcode`    | Finds unused files, exports and dependencies with Knip.                |
| `bun run test`        | Runs the unit tests.                                                   |
| `bun run doctor`      | Scans React components for common mistakes (react-doctor).             |
| `bun run i18n:unused` | Lists unused translation keys.                                         |

### Configuration

Copy `.env.example` to `.env`:

- `VITE_REELVAULT_API_URL`: the address of the server your frontend talks to. In development, Vite proxies `/v1` and `/api`, so you can usually leave it empty. On your LAN, the browser finds the server on the same machine automatically.
- `REELVAULT_API_URL`: used only by `server.ts`, the production proxy.

### Adding a language

English is the base language. To add one, for example German (`de`):

1. Add `de` to `locales` in `project.inlang/settings.json`.
2. Create `messages/de.json` with the same keys as `messages/en.json`, translated.
3. Add a label and flag for `de` in `LOCALE_META` in `src/utils/locales.ts`. The build won't pass until you do.
4. Run `bun run i18n`. `bun run dev` and `bun run build` also run it.

The locale switcher and the interface language setting read `SUPPORTED_LOCALES` automatically. Audio and subtitle languages are configured separately, in `CONTENT_LANGUAGES` in the same file.

### Working on the SDK locally

To use a local SDK instead of the npm package, link it:

```bash
# in the sdk repository
bun link

# in this repository
bun link @reelvault/sdk
```

When the API changes, rebuild the SDK and refresh your local copy. [AGENTS.md](AGENTS.md) has the exact steps.

### CI

- `ci.yml`: type-check, lint, Knip and tests. Also called by the release workflow as a fallback gate when the commit has no CI result.
- `react-doctor.yml`: advisory React scan on PRs and pushes to `main`.
- `release.yml`: builds the web artifacts for a `v*` tag after the CI gate passes — it reuses the commit's existing CI result and only runs the checks itself when there is none — and publishes the GitHub release.

Contributions are welcome — see [CONTRIBUTING.md](https://github.com/ReelVault/.github/blob/main/CONTRIBUTING.md).

## License

GPL-3.0-only. See [LICENSE](LICENSE).
