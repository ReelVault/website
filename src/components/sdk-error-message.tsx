import { type ReactNode, Suspense, use } from "react";
import type { getSdkErrorMessage as getSdkErrorMessageFn } from "@/client/sdk-error-message";

type GetSdkErrorMessage = typeof getSdkErrorMessageFn;

let messageLoader: Promise<GetSdkErrorMessage | null> | undefined;

/**
 * `getSdkErrorMessage` needs the full code→message catalog (~17 KB br), which is
 * far too heavy for `AppErrorState` — a shared component every page imports. The
 * catalog is fetched only when an error state actually renders; a failed load
 * keeps the caller's fallback text.
 */
async function loadGetSdkErrorMessage(): Promise<GetSdkErrorMessage | null> {
	try {
		const mod = await import("@/client/sdk-error-message");

		return mod.getSdkErrorMessage;
	} catch {
		// Do not cache the failure — the next error state retries the import.
		messageLoader = undefined;

		return null;
	}
}

function loadMessage(): Promise<GetSdkErrorMessage | null> {
	messageLoader ??= loadGetSdkErrorMessage();

	return messageLoader;
}

function TranslatedMessage({ error, fallback }: { error: unknown; fallback: ReactNode }) {
	const getSdkErrorMessage = use(loadMessage());

	return <>{getSdkErrorMessage ? (getSdkErrorMessage(error) ?? fallback) : fallback}</>;
}

/** The SDK error's translated message, with `fallback` shown until the catalog loads. */
export function SdkErrorMessage({ error, fallback }: { error: unknown; fallback: ReactNode }) {
	return (
		<Suspense fallback={fallback}>
			<TranslatedMessage error={error} fallback={fallback} />
		</Suspense>
	);
}
