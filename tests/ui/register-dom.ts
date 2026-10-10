import { Window } from "happy-dom";

/**
 * Browser-like document for the component tests in this folder. A UI test file calls `ensureDom`
 * in `beforeAll` and `unregisterDom` in `afterAll`, so the rest of the suite keeps its plain Bun
 * globals. Only globals that Bun does not already provide are installed, and exactly those are
 * removed again. The tests query the rendered tree through what `render` returns, never through
 * the global `screen`, so the order of imports does not matter.
 */

const globals = globalThis as unknown as Record<string, unknown>;
let installed: string[] = [];

export function ensureDom(): void {
	if (installed.length > 0) return;
	const window = new Window({ url: "http://localhost/" });
	const source = window as unknown as Record<string, unknown>;
	for (const key of Object.getOwnPropertyNames(window)) {
		if (key in globals) continue;
		globals[key] = source[key];
		installed.push(key);
	}
	for (const key of ["window", "document", "navigator"]) {
		if (!installed.includes(key)) {
			globals[key] = source[key];
			installed.push(key);
		}
	}
}

export function unregisterDom(): void {
	for (const key of installed) Reflect.deleteProperty(globals, key);
	installed = [];
}
