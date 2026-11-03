/**
 * Bounds async work that has no abort support (dynamic imports, SDK calls without
 * a signal). The underlying promise keeps running, but the caller stops waiting
 * and gets a typed timeout error instead of an endless Suspense fallback.
 */

export const MODULE_IMPORT_TIMEOUT_MS = 15_000;

export class TimeoutError extends Error {
	constructor(label: string, timeoutMs: number) {
		super(`${label} timed out after ${timeoutMs}ms`);
		this.name = "TimeoutError";
	}
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
	let timer: ReturnType<typeof setTimeout> | undefined;

	try {
		return await Promise.race([
			promise,
			new Promise<never>((_resolve, reject) => {
				timer = setTimeout(() => reject(new TimeoutError(label, timeoutMs)), timeoutMs);
			}),
		]);
	} finally {
		if (timer !== undefined) clearTimeout(timer);
	}
}

/** Imports a module with a bound, so a half-open chunk request cannot suspend a route forever. */
export function importWithTimeout<T>(importer: () => Promise<T>, label: string, timeoutMs: number = MODULE_IMPORT_TIMEOUT_MS): Promise<T> {
	try {
		return withTimeout(importer(), timeoutMs, label);
	} catch (error: unknown) {
		return Promise.reject(error);
	}
}
