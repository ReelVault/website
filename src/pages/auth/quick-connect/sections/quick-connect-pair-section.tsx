import { Link } from "@tanstack/react-router";
import { ArrowLeft, RefreshCw, Tv } from "lucide-react";
import { AppErrorState } from "@/components/app-states";
import { QrCode } from "@/components/qr-code";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { QuickConnectCountdown } from "../components/quick-connect-countdown";

interface QuickConnectPairSectionProps {
	pairCode: string;
	pairExpiresAt: number;
	qrUrl: string;
	isPending: boolean;
	error: Error | null;
	onStartPairing: () => void;
	onSwitchToRedeem: () => void;
}

export function QuickConnectPairSection({
	pairCode,
	pairExpiresAt,
	qrUrl,
	isPending,
	error,
	onStartPairing,
	onSwitchToRedeem,
}: QuickConnectPairSectionProps) {
	return (
		<section className="relative overflow-hidden rounded-3xl border border-border bg-card/85 p-8 shadow-2xl sm:p-10">
			<header className="flex flex-col gap-3 text-center">
				<div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
					<Tv className="size-7" />
				</div>
				<h1 className="font-black text-3xl tracking-tight sm:text-4xl">{m.auth_quick_login()}</h1>
				<p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">{m.auth_scan_qr_hint()}</p>
			</header>

			<div className="mt-8 flex flex-col items-center gap-6">
				{Boolean(error) && <AppErrorState title={m.auth_code_generation_error()} error={error} onRetry={onStartPairing} />}

				{/* QR Code and Device Code Display */}
				<div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center sm:p-8">
					{qrUrl && (
						<div className="relative">
							<QrCode value={qrUrl} size={190} />
							<div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-black/10 ring-inset" />
						</div>
					)}

					<div className="flex flex-col items-center gap-1">
						<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{m.auth_pairing_code_label()}</span>
						{isPending ? (
							<div className="animate-pulse py-2 font-medium text-muted-foreground text-sm">{m.auth_generating_ellipsis()}</div>
						) : (
							<span className="font-black font-mono text-4xl text-primary tracking-widest sm:text-5xl">
								{pairCode || m.auth_pair_code_placeholder()}
							</span>
						)}
					</div>

					{pairExpiresAt > 0 && <QuickConnectCountdown expiresAt={pairExpiresAt} />}

					<div className="flex animate-pulse items-center gap-2 rounded-full bg-success/10 px-3 py-1 font-medium text-success text-xs">
						<span className="size-2 rounded-full bg-success" />
						{m.auth_waiting_for_authorization()}
					</div>
				</div>

				{/* Step-by-step guidance */}
				<div className="w-full space-y-2 rounded-2xl border border-border/70 bg-card/40 p-4 text-left text-muted-foreground text-xs">
					<p className="font-bold text-foreground">{m.auth_how_it_works()}</p>
					<ol className="list-decimal space-y-1 pl-4">
						<li>
							<strong>{m.auth_option_a_fastest()}</strong> {m.auth_point_camera_hint()}
						</li>
						<li>
							<strong>{m.auth_option_b()}</strong> {m.auth_on_logged_in_device()} <strong>{m.auth_devices()}</strong>{" "}
							{m.auth_enter_code_instruction({ code: pairCode })}
						</li>
					</ol>
				</div>

				<div className="flex w-full flex-col gap-3">
					<Button type="button" variant="outline" className="gap-2 rounded-xl" onClick={onStartPairing} disabled={isPending}>
						<RefreshCw className="size-4" />
						{m.auth_generate_new_code()}
					</Button>

					<Button type="button" variant="ghost" onClick={onSwitchToRedeem} className="text-xs">
						{m.auth_have_code_manual()}
					</Button>

					<Link to="/auth/login" className="text-center">
						<Button type="button" variant="ghost" className="text-muted-foreground text-xs">
							<ArrowLeft className="size-4" />
							{m.auth_back_to_traditional_login()}
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
