/**
 * Local-only error reporting. ReelVault is self-hosted and does not ship an
 * external crash reporter, so uncaught browser errors and unhandled rejections
 * are logged with enough context for the diagnostics panel / console.
 *
 * This is intentionally not a telemetry integration: no network requests, no
 * identifiers, no persistence.
 */

function describeError(value: unknown): string {
	if (value instanceof Error) return `${value.name}: ${value.message}`;
	if (typeof value === "string") return value;

	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}

function report(kind: string, value: unknown, extra?: unknown): void {
	if (extra === undefined) {
		console.error(`[ReelVault] ${kind}: ${describeError(value)}`, value);

		return;
	}

	console.error(`[ReelVault] ${kind}: ${describeError(value)}`, value, extra);
}

function onError(event: ErrorEvent): void {
	// `silenceSkippedViewTransitions` calls preventDefault for the known
	// TanStack Router view-transition rejections; do not duplicate those.
	if (event.defaultPrevented) return;

	report("Uncaught error", event.error ?? event.message, { filename: event.filename, lineno: event.lineno, colno: event.colno });
}

function onUnhandledRejection(event: PromiseRejectionEvent): void {
	if (event.defaultPrevented) return;

	report("Unhandled rejection", event.reason);
}

/** Installs local handlers and returns a cleanup function (useful in tests). */
export function installLocalErrorReporting(target: Window = window): () => void {
	target.addEventListener("error", onError);
	target.addEventListener("unhandledrejection", onUnhandledRejection);

	return () => {
		target.removeEventListener("error", onError);
		target.removeEventListener("unhandledrejection", onUnhandledRejection);
	};
}
