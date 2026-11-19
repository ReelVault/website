import { ParaglideMessage } from "@inlang/paraglide-js-react";
import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { AppErrorState } from "@/components/app-states";
import { QrCode } from "@/components/qr-code";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { QuickConnectCountdown } from "../../quick-connect/components/quick-connect-countdown";
import { useQuickConnectPairing } from "../../quick-connect/hooks/use-quick-connect-pairing";

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
	const { pairCode, pairExpiresAt, isExpired, isPending, error, startPairing } = useQuickConnectPairing({
		enabled: true,
		isUserLoading: false,
		hasUser: false,
		urlRedeem: "",
		onSuccess: onAuthenticated,
	});

	return (
		<div className="flex flex-col gap-6 text-center">
			{error && <AppErrorState title={m.auth_initialization_error()} error={error} />}

			<div className="border-primary/20 bg-primary/5 flex flex-col items-center gap-4 rounded-2xl border p-6">
				{pairCode ? (
					<div className="relative">
						<QrCode value={`${typeof window !== "undefined" ? window.location.origin : ""}/quick-connect?code=${pairCode}`} size={160} />
					</div>
				) : null}

				<div className="flex flex-col items-center gap-1">
					<span className="text-muted-foreground text-xs font-semibold">{m.auth_pairing_code()}</span>

					{isPending ? (
						<div className="text-muted-foreground animate-pulse py-3 text-sm font-medium">{m.auth_generating_code()}</div>
					) : (
						<div className="text-primary font-mono text-4xl font-black tracking-widest sm:text-5xl">{pairCode || "--- ---"}</div>
					)}
				</div>

				{isExpired ? (
					<div className="bg-warning/10 text-warning rounded-full px-3 py-1 text-xs font-medium">{m.auth_code_expired()}</div>
				) : (
					<>
						<QuickConnectCountdown expiresAt={pairExpiresAt} />

						<div className="bg-success/10 text-success mt-2 flex animate-pulse items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
							<span className="bg-success size-2 rounded-full" />
							{m.auth_waiting_for_authorization()}
						</div>
					</>
				)}
			</div>

			<div className="border-border/70 bg-card/40 text-muted-foreground space-y-1.5 rounded-xl border p-4 text-left text-xs">
				<p className="text-foreground font-semibold">{m.auth_how_to_connect()}</p>
				<p>{m.auth_scan_qr_step()}</p>
				<p>
					<ParaglideMessage message={m.auth_confirm_code_instructions} markup={boldInstructionsMarkup} />
				</p>
			</div>

			<div className="flex flex-col gap-2">
				{/* autoFocus: TV/D-pad starts from the computed focus (instead of waiting for the first keypress). */}
				<Button type="button" variant="outline" autoFocus onClick={startPairing} disabled={isPending}>
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
