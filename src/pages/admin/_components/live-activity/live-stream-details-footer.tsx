import type { AdminLiveStreamItem } from "@reelvault/sdk";
import { Pause, Play, Square } from "lucide-react";
import { useState } from "react";
import { CopyIcon } from "@/components/copy-icon";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { useCopyToClipboard } from "@/utils/clipboard-utils";
import { toast } from "@/utils/toast-facade";

interface LiveStreamDetailsFooterProps {
	stream: AdminLiveStreamItem;
	onTerminate: () => void;
	onSendCommand: (type: "play" | "pause" | "stop") => Promise<void>;
	isSendingCommand: boolean;
	isTerminating: boolean;
}

export function LiveStreamDetailsFooter({
	stream,
	onTerminate,
	onSendCommand,
	isSendingCommand,
	isTerminating,
}: LiveStreamDetailsFooterProps) {
	const { hasCopied, markCopied } = useCopyToClipboard();
	const [isCopying, setIsCopying] = useState(false);

	const handleCopyJson = async () => {
		if (isCopying) return;

		setIsCopying(true);
		try {
			await navigator.clipboard.writeText(JSON.stringify(stream, null, 2));
			markCopied();
			toast.success(m.admin_session_telemetry_copied());
		} catch {
			toast.error(m.admin_failed_to_copy_data());
		}

		setIsCopying(false);
	};

	return (
		<DialogFooter className="mt-2 flex flex-row items-center justify-between gap-2 border-border/40 border-t pt-3 font-sans">
			<Button
				type="button"
				variant="outline"
				size="sm"
				className="gap-1.5 font-mono text-xs"
				onClick={() => {
					detach(handleCopyJson());
				}}
				disabled={isCopying}
				title={m.admin_live_copy_raw_json_hint()}
			>
				<CopyIcon copied={hasCopied} />
				<span>{m.common_copy_json()}</span>
			</Button>

			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => {
						detach(onSendCommand("pause"));
					}}
					disabled={isSendingCommand}
					className="gap-1.5 font-mono text-xs"
					title={m.admin_live_remote_pause_aria()}
				>
					<Pause className="size-3.5 fill-current text-warning" />
					<span>{m.admin_logs_paused()}</span>
				</Button>

				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => {
						detach(onSendCommand("play"));
					}}
					disabled={isSendingCommand}
					className="gap-1.5 font-mono text-xs"
					title={m.admin_live_remote_resume_title()}
				>
					<Play className="size-3.5 fill-current text-primary" />
					<span>{m.admin_resume()}</span>
				</Button>

				<Button
					type="button"
					variant="destructive"
					size="sm"
					onClick={onTerminate}
					disabled={isTerminating}
					className="gap-1 font-semibold text-xs"
				>
					<Square className="size-3 fill-current" />
					<span>{m.admin_live_stop_session()}</span>
				</Button>

				<DialogClose render={<Button type="button" variant="secondary" size="sm" />}>{m.common_close()}</DialogClose>
			</div>
		</DialogFooter>
	);
}
