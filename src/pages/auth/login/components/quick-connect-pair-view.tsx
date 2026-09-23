import { ParaglideMessage } from "@inlang/paraglide-js-react";
import { Clock, RefreshCw } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { reelvault } from "@/client/client";
import { useQuickConnectInitiate } from "@/client/hooks/use-auth";
import { AppErrorState } from "@/components/app-states";
import { QrCode } from "@/components/qr-code";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { formatCountdown } from "@/utils/format-utils";

interface QuickConnectPairViewProps {
	onAuthenticated: () => void;
	onSwitchToRedeem: () => void;
}

type BoldMarkupRenderer = (props: { children?: ReactNode }) => ReactNode;

// Module-level renderers keep the markup object identity stable across renders.
const boldInstructionsMarkup: { devices: BoldMarkupRenderer; route: BoldMarkupRenderer } = {
	devices: ({ children }) => <strong>{children}</strong>,
	route: ({ children }) => <strong>{children}</strong>,
};

export function QuickConnectPairView({ onAuthenticated, onSwitchToRedeem }: QuickConnectPairViewProps) {
	// `mutate` is stable; the mutation object is not. Depending on the object made
	// the mount effect re-run on every render (repeated initiate requests).
	const { mutate: initiateQuickConnect, isPending, isError, error } = useQuickConnectInitiate();
	const onAuthenticatedRef = useRef(onAuthenticated);

	useEffect(() => {
		onAuthenticatedRef.current = onAuthenticated;
	});

	const [pairCode, setPairCode] = useState("");
	const [pairSecret, setPairSecret] = useState("");
	const [pairExpiresAt, setPairExpiresAt] = useState(0);
	const [pairRemainingSeconds, setPairRemainingSeconds] = useState(0);

	const applyPairingResponse = (res: { code: string; secret: string; expiresIn: number }) => {
		setPairCode(res.code);
		setPairSecret(res.secret);
		setPairExpiresAt(Date.now() + res.expiresIn * 1000);
		setPairRemainingSeconds(res.expiresIn);
	};

	const handleStartPairing = () => {
		initiateQuickConnect(undefined, {
			onSuccess: applyPairingResponse,
			// Errors surface via the mutation error state above.
		});
	};

	// Initiate pairing on mount
	useEffect(() => {
		let cancelled = false;
		initiateQuickConnect(undefined, {
			onSuccess: (res) => {
				if (cancelled) return;

				setPairCode(res.code);
				setPairSecret(res.secret);
				setPairExpiresAt(Date.now() + res.expiresIn * 1000);
				setPairRemainingSeconds(res.expiresIn);
			},
		});

		return () => {
			cancelled = true;
		};
	}, [initiateQuickConnect]);

	// Countdown timer for pairing mode
	useEffect(() => {
		const timer =
			pairExpiresAt > 0
				? window.setInterval(() => {
						const left = Math.max(0, Math.floor((pairExpiresAt - Date.now()) / 1000));
						setPairRemainingSeconds(left);
						if (left <= 0) {
							window.clearInterval(timer);
						}
					}, 1000)
				: 0;

		return () => {
			window.clearInterval(timer);
		};
	}, [pairExpiresAt]);

	// Polling for device pairing check
	useEffect(() => {
		let cancelled = false;
		let interval: ReturnType<typeof setInterval> | undefined;
		const pollPairing = async () => {
			try {
				const res = await reelvault.auth.quickConnectCheck(pairSecret);
				if (cancelled) return;

				if (res.authenticated && interval !== undefined) {
					clearInterval(interval);
					interval = undefined;
					onAuthenticatedRef.current();
				}
			} catch {
				// Polling check errors are ignored; the next tick retries.
			}
		};
		if (pairSecret) {
			interval = setInterval(() => {
				detach(pollPairing());
			}, 2500);
		}

		return () => {
			cancelled = true;
			if (interval !== undefined) clearInterval(interval);
		};
	}, [pairSecret]);

	return (
		<div className="flex flex-col gap-6 text-center">
			{isError && <AppErrorState title={m.auth_initialization_error()} error={error} />}

			<div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6">
				{pairCode ? (
					<div className="relative">
						<QrCode value={`${typeof window !== "undefined" ? window.location.origin : ""}/quick-connect?code=${pairCode}`} size={160} />
					</div>
				) : null}

				<div className="flex flex-col items-center gap-1">
					<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{m.auth_pairing_code()}</span>

					{isPending ? (
						<div className="animate-pulse py-3 font-medium text-muted-foreground text-sm">{m.auth_generating_code()}</div>
					) : (
						<div className="font-black font-mono text-4xl text-primary tracking-widest sm:text-5xl">{pairCode || "--- ---"}</div>
					)}
				</div>

				<div className="flex items-center gap-2 font-medium text-muted-foreground text-xs">
					<Clock className="size-3.5" aria-hidden="true" /> {m.auth_valid_for_label()}
					<span className="font-bold text-foreground">{formatCountdown(pairRemainingSeconds)}</span>
				</div>

				<div className="mt-2 flex animate-pulse items-center gap-2 rounded-full bg-success/10 px-3 py-1 font-medium text-success text-xs">
					<span className="size-2 rounded-full bg-success" />
					{m.auth_waiting_for_authorization()}
				</div>
			</div>

			<div className="space-y-1.5 rounded-xl border border-border/70 bg-card/40 p-4 text-left text-muted-foreground text-xs">
				<p className="font-semibold text-foreground">{m.auth_how_to_connect()}</p>
				<p>{m.auth_scan_qr_step()}</p>
				<p>
					<ParaglideMessage message={m.auth_confirm_code_instructions} markup={boldInstructionsMarkup} />
				</p>
			</div>

			<div className="flex flex-col gap-2">
				{/* autoFocus: TV/D-pad starts from the computed focus (instead of waiting for the first keypress). */}
				<Button type="button" variant="outline" className="gap-2" autoFocus onClick={handleStartPairing} disabled={isPending}>
					<RefreshCw className="size-4" />
					{m.auth_generate_new_code()}
				</Button>

				<Button type="button" variant="ghost" onClick={onSwitchToRedeem}>
					{m.auth_enter_code_other_device()}
				</Button>
			</div>
		</div>
	);
}
