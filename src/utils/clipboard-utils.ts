import { useEffect, useRef, useState } from "react";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";

/** Copies text and toasts the outcome; resolves to whether the copy succeeded. */
export async function copyToClipboard(text: string, label = "text"): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		toast.success(m.utils_copied_label({ label }));

		return true;
	} catch {
		toast.error(m.utils_copy_failed_label({ label }));

		return false;
	}
}

/** Copies the absolute link to an entity (origin + path). */
export function copyEntityLink(path: string, label = "link") {
	return copyToClipboard(`${window.location.origin}${path}`, label);
}

export function useCopyToClipboard(resetMs = 2000) {
	const [hasCopied, setHasCopied] = useState(false);
	const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(
		() => () => {
			if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
		},
		[],
	);

	const markCopied = () => {
		setHasCopied(true);
		if (resetTimerRef.current) clearTimeout(resetTimerRef.current);

		resetTimerRef.current = setTimeout(() => {
			resetTimerRef.current = null;
			setHasCopied(false);
		}, resetMs);
	};

	const reset = () => {
		if (resetTimerRef.current) {
			clearTimeout(resetTimerRef.current);
			resetTimerRef.current = null;
		}

		setHasCopied(false);
	};

	const copy = async (text: string, label?: string) => {
		if (await copyToClipboard(text, label)) markCopied();
	};

	return { hasCopied, copy, markCopied, reset };
}
