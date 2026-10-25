import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import type { translateError as translateErrorFn } from "./translate-error";

type TranslateError = typeof translateErrorFn;

let translate: TranslateError | null = null;

/**
 * The code→message catalog behind `translateError` is ~20 KB br — too much to
 * keep in the eager graph for a path that only runs when a request fails.
 * Loaded on the first error, then reused. A failed load still shows the toast,
 * just without the translated description.
 */
async function loadTranslateError(): Promise<TranslateError | null> {
	if (translate) return translate;

	try {
		const mod = await import("./translate-error");
		translate = mod.translateError;

		return translate;
	} catch {
		return null;
	}
}

export function toastError(message: string, err?: unknown, fallback: string = m.common_network_error()) {
	detach(async () => {
		const translateError = await loadTranslateError();

		toast.error(message, { description: translateError ? translateError(err, fallback) : fallback });
	});
}

export function toastSuccess(message: string) {
	toast.success(message);
}
