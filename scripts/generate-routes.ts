/**
 * Generates `src/routeTree.gen.ts` without starting Vite.
 *
 * `vite dev` / `vite build` regenerate the route tree through the TanStack
 * Router Vite plugin, but `check-types` runs `tsc` directly — and the file is
 * gitignored, so on a fresh checkout (CI) it does not exist yet. This uses the
 * same generator package the Vite plugin uses, so both produce identical
 * output. Equivalent to `tsr generate` from `@tanstack/router-cli`, without
 * the extra CLI dependency.
 *
 * Usage:
 *   bun run generate-routes
 */
import path from "node:path";
import { Generator, getConfig } from "@tanstack/router-generator";

const root = path.resolve(import.meta.dir, "..");

await new Generator({ config: getConfig({}, root), root }).run();
