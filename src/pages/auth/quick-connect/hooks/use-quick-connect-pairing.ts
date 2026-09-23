import { useEffect, useRef, useState } from "react";
import { reelvault } from "@/client/client";
import { useQuickConnectInitiate } from "@/client/hooks/use-auth";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";

interface UseQuickConnectPairingOptions {
	enabled: boolean;
	isUserLoading: boolean;
	hasUser: boolean;
	urlRedeem: string;
	onSuccess: () => void;
}

export function useQuickConnectPairing({ enabled, isUserLoading, hasUser, urlRedeem, onSuccess }: UseQuickConnectPairingOptions) {
	// `mutate` is stable across renders; the mutation object is not — depending on
	// the object re-ran the mount effect on every render (request loop).
	const { mutate: initiatePairing, isPending, error } = useQuickConnectInitiate();
	const onSuccessRef = useRef(onSuccess);

	useEffect(() => {
		onSuccessRef.current = onSuccess;
	});

	const [pairCode, setPairCode] = useState("");
	const [pairSecret, setPairSecret] = useState("");
	const [pairExpiresAt, setPairExpiresAt] = useState(0);

	const startPairing = () => {
		initiatePairing(undefined, {
			onSuccess: (res) => {
				setPairCode(res.code);
				setPairSecret(res.secret);
				setPairExpiresAt(Date.now() + res.expiresIn * 1000);
			},
			// Errors surface through the mutation error state.
		});
	};

	// Auto-initiate pairing on first load if not logged in
	useEffect(() => {
		let isCancelled = false;
		if (!(isUserLoading || hasUser || urlRedeem || pairCode)) {
			initiatePairing(undefined, {
				onSuccess: (res) => {
					if (isCancelled) return;

					setPairCode(res.code);
					setPairSecret(res.secret);
					setPairExpiresAt(Date.now() + res.expiresIn * 1000);
				},
				// Errors surface through the mutation error state.
			});
		}

		return () => {
			isCancelled = true;
		};
	}, [isUserLoading, hasUser, urlRedeem, pairCode, initiatePairing]);

	// Background polling for authorization on this device
	useEffect(() => {
		let cancelled = false;
		let interval: ReturnType<typeof setInterval> | undefined;
		const pollAuthorization = async () => {
			try {
				const res = await reelvault.auth.quickConnectCheck(pairSecret);
				if (cancelled) return;

				if (res.authenticated && interval !== undefined) {
					clearInterval(interval);
					interval = undefined;
					toast.success(m.auth_device_authorized());
					onSuccessRef.current();
				}
			} catch {
				// Polling errors are ignored; the next tick retries.
			}
		};
		if (pairSecret && !hasUser && enabled) {
			interval = setInterval(() => {
				detach(pollAuthorization());
			}, 2500);
		}

		return () => {
			cancelled = true;
			if (interval !== undefined) clearInterval(interval);
		};
	}, [pairSecret, hasUser, enabled]);

	return {
		pairCode,
		pairExpiresAt,
		isPending,
		error,
		startPairing,
	};
}
