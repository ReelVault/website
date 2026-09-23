import { useEffect, useRef, useState } from "react";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";

export async function copyToClipboard(text: string, label = "text") {
	try {
		await navigator.clipboard.writeText(text);
		toast.success(m.utils_copied_label({ label }));
	} catch {
		toast.error(m.utils_copy_failed_label({ label }));
	}
}

/** Kopiuje absolutny link do encji (origin + path) z toastem. */
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
		await copyToClipboard(text, label);
		markCopied();
	};

	return { hasCopied, copy, markCopied, reset };
}
