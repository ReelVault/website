import { ReelVaultError, ReelVaultValidationError } from "@reelvault/sdk/client";
import { m } from "@/paraglide/messages";
import { translateByKey, translateError } from "@/utils/translate-error";

/**
 * Status-based fallback for `ReelVaultError`s the server did not tag with a
 * translatable `code` (e.g. better-auth's 401 on login). Without this the UI
 * showed the SDK's technical message — "HTTP 401: … (POST http://…/v1/…)".
 */
function messageForStatus(status: number): string {
	if (status === 401) return m.unauthorized();

	if (status === 403) return m.forbidden();

	if (status === 404) return m.not_found();

	if (status === 408) return m.timeout();

	if (status === 409) return m.conflict();

	if (status === 429) return m.too_many_requests();

	if (status >= 500) return m.internal();

	return m.validation();
}

/**
 * Resolves a user-facing message from an SDK error. The server sends a stable
 * `code` + `params` (no text), so the translation catalog owns the wording.
 * Errors without a code fall back to a status-based message — never the raw
 * SDK text, which leaks the request URL.
 *
 * Lives apart from `client.ts` on purpose: it pulls the full code→message
 * catalog, which must stay out of the eager startup graph.
 */
export function getSdkErrorMessage(error: unknown): string | undefined {
	if (error instanceof ReelVaultValidationError) {
		const messages: string[] = [];
		for (const field of error.errors) {
			if (field.message) messages.push(field.message);
		}

		return messages.length > 0 ? messages.join(" ") : error.message;
	}

	if (error instanceof ReelVaultError) {
		if (error.code) {
			const translated = translateByKey(error.code, error.params ?? undefined);
			if (translated !== error.code) return translated;
		}

		return messageForStatus(error.status);
	}

	if (error) return translateError(error, error instanceof Error ? error.message : "");

	return undefined;
}
