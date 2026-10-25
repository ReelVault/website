import { ReelVaultError } from "@reelvault/sdk/client";
import { useState } from "react";
import { type DownloadQuality, useQueueSeasonDownload } from "@/client/hooks/use-downloads";
import { PROFILES } from "@/components/offline-download-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";

interface SeasonDownloadDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	seasonId: string;
}

interface QuotaWarning {
	estimatedBytes: number;
	freeBytes: number;
}

/** The free-space numbers of a season the server refused for its size; null for any other error. */
function quotaWarningOf(error: unknown): QuotaWarning | null {
	if (!(error instanceof ReelVaultError) || error.code !== "downloads.season_exceeds_quota") return null;

	return { estimatedBytes: Number(error.params?.estimatedBytes ?? 0), freeBytes: Number(error.params?.freeBytes ?? 0) };
}

export function SeasonDownloadDialog({ open, onOpenChange, seasonId }: SeasonDownloadDialogProps) {
	const [quality, setQuality] = useState<DownloadQuality>("720p-mobile");
	const [warning, setWarning] = useState<QuotaWarning | null>(null);
	const queueSeason = useQueueSeasonDownload();

	const submit = async (force: boolean) => {
		try {
			await queueSeason.mutateAsync({ seasonId, quality, force });
			setWarning(null);
			onOpenChange(false);
		} catch (error) {
			setWarning(quotaWarningOf(error));
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{m.components_season_download_title()}</DialogTitle>
					<DialogDescription>{m.components_season_download_description()}</DialogDescription>
				</DialogHeader>

				<RadioGroup
					value={quality}
					onValueChange={(value) => {
						const selected = PROFILES.find((profile) => profile.id === value);
						if (selected) setQuality(selected.id);
					}}
					className="gap-2"
				>
					{PROFILES.map((profile) => (
						<label
							key={profile.id}
							htmlFor={`season-quality-${profile.id}`}
							className="border-border flex cursor-pointer items-start gap-3 rounded-lg border p-3"
						>
							<RadioGroupItem value={profile.id} id={`season-quality-${profile.id}`} className="mt-1" />
							<span className="min-w-0">
								<span className="block text-sm font-medium">{profile.label}</span>
								<span className="text-muted-foreground block text-xs">{profile.description}</span>
							</span>
						</label>
					))}
				</RadioGroup>

				{warning && (
					<p role="alert" className="border-warning/40 bg-warning/10 rounded-lg border p-3 text-sm">
						{m.components_season_download_quota_warning({
							needed: formatFileSize(warning.estimatedBytes),
							free: formatFileSize(warning.freeBytes),
						})}
					</p>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{m.common_cancel()}
					</Button>
					<Button disabled={queueSeason.isPending} onClick={() => detach(submit(warning !== null))}>
						{warning ? m.components_season_download_anyway() : m.components_season_download_submit()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
