import { Link } from "@tanstack/react-router";
import { AlertTriangle, Copy, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { m } from "@/paraglide/messages";
import { useCopyToClipboard } from "@/utils/clipboard-utils";
import { usePlayerActions, usePlayerInfo, usePlayerStatus } from "../player-context";
import { detach } from "../utils/player-utils";

export function PlayerLoadingOverlay() {
	const { canPlay, isBuffering, pendingChange, playerError } = usePlayerStatus();

	if (playerError) return null;

	// Show while the stream isn't ready yet, while it's actively buffering, or while switching quality —
	// but NOT just because canPlay is true (that flag stays true for the rest of playback).
	const shouldShow = !canPlay || isBuffering || pendingChange !== null;
	if (!shouldShow) return null;

	let label: string | null = null;
	if (pendingChange === "audio") label = m.player_switching_audio();
	else if (pendingChange === "quality") label = m.player_changing_quality();

	return (
		<div role="status" className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-background/45">
			<div className="flex items-center gap-3 rounded-full bg-popover/70 px-5 py-3 font-bold text-popover-foreground text-sm shadow-xl backdrop-blur">
				<Spinner size="lg" aria-label={label ?? m.player_buffering()} />
				{label && label}
			</div>
		</div>
	);
}

export function PlayerErrorOverlay() {
	const { playerError } = usePlayerStatus();
	const actions = usePlayerActions();
	const info = usePlayerInfo();
	const { hasCopied, copy } = useCopyToClipboard();

	if (!playerError) return null;

	// Only what support needs to find the failure: no stream URLs, tokens or query strings.
	const copyDiagnostics = () =>
		copy(
			JSON.stringify(
				{
					metadataId: info.metadataId,
					page: window.location.pathname,
					time: new Date().toISOString(),
					userAgent: navigator.userAgent,
				},
				null,
				2,
			),
			m.player_error_copy_diagnostics(),
		);

	return (
		<div className="absolute inset-0 z-40 flex items-center justify-center bg-background/95 px-6 text-center">
			<div className="flex max-w-md flex-col items-center gap-3">
				<AlertTriangle className="mx-auto size-10 text-destructive" aria-hidden="true" />
				<h2 className="font-black text-2xl text-foreground">{m.player_playback_interrupted()}</h2>
				<p className="text-muted-foreground text-sm">{m.player_error_back_to_details_desc()}</p>
				<div className="mt-2 flex flex-col gap-2 sm:flex-row">
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							actions.setPlayerError(false);
							detach(() => actions.reconnectAfterSessionExpiry());
						}}
					>
						<RotateCw className="size-4" aria-hidden="true" />
						{m.player_resume()}
					</Button>
					{info.metadataId && (
						<Button
							type="button"
							variant="ghost"
							nativeButton={false}
							render={<Link to="/details/$id" params={{ id: info.metadataId }} />}
							onClick={() => actions.setPlayerError(false)}
						>
							{m.player_back_to_details()}
						</Button>
					)}
					<Button type="button" variant="ghost" onClick={() => detach(copyDiagnostics)}>
						<Copy className="size-4" aria-hidden="true" />
						{hasCopied ? m.player_error_copied() : m.player_error_copy_diagnostics()}
					</Button>
				</div>
			</div>
		</div>
	);
}
