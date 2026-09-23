import { type ReactNode, useEffect, useRef, useState } from "react";
import { reelvault } from "@/client/client";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

const API_CONTRACT_VERSION = import.meta.env.VITE_API_CONTRACT_VERSION ?? "playback-sessions-v1";
const FRONTEND_BUILD_ID = import.meta.env.VITE_FRONTEND_BUILD_ID ?? "development";
const WAKE_DEBOUNCE_MS = 250;

export function ApiContractProvider({ children }: { children: ReactNode }) {
	const [isBlocked, setIsBlocked] = useState(false);
	const inFlightRef = useRef(false);
	const wakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const checkContract = (): void => {
			// Rapid alt-tab / flapping connectivity must not stack health requests.
			if (inFlightRef.current) return;

			inFlightRef.current = true;
			detach(
				(async () => {
					try {
						const health = await reelvault.health.check();
						if (!health.apiContractVersion || health.apiContractVersion === API_CONTRACT_VERSION) {
							setIsBlocked(false);

							return;
						}

						const reloadKey = `reelvault:api-contract-reload:${FRONTEND_BUILD_ID}:${health.apiContractVersion}`;
						if (!sessionStorage.getItem(reloadKey)) {
							sessionStorage.setItem(reloadKey, "1");
							window.location.reload();

							return;
						}

						setIsBlocked(true);
					} catch {
						// A transient offline state must not block an already compatible player.
					} finally {
						inFlightRef.current = false;
					}
				})(),
			);
		};

		checkContract();
		// Re-verify when connectivity returns or the tab becomes active again —
		// otherwise a server that was briefly down at load is never re-checked.
		const onWake = (): void => {
			if (document.visibilityState === "hidden") return;

			if (wakeTimerRef.current) clearTimeout(wakeTimerRef.current);

			wakeTimerRef.current = setTimeout(() => {
				wakeTimerRef.current = null;
				checkContract();
			}, WAKE_DEBOUNCE_MS);
		};
		window.addEventListener("online", onWake);
		window.addEventListener("focus", onWake);

		return () => {
			window.removeEventListener("online", onWake);
			window.removeEventListener("focus", onWake);
			if (wakeTimerRef.current) {
				clearTimeout(wakeTimerRef.current);
				wakeTimerRef.current = null;
			}
		};
	}, []);

	if (isBlocked) {
		return (
			<main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
				<p className="max-w-md text-muted-foreground text-sm leading-relaxed">{m.components_realtime_contract_mismatch()}</p>
				<Button onClick={() => window.location.reload()}>{m.common_try_again()}</Button>
			</main>
		);
	}

	return children;
}
