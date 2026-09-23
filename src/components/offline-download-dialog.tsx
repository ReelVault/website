import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { ArrowRight, Check, Download, Film, HardDrive, Loader2, type LucideIcon, Smartphone, Sparkles, Trash2, Tv } from "lucide-react";
import { startTransition, useState } from "react";
import {
	type DownloadQuality,
	getDownloadFileUrl,
	useDeleteDownload,
	useDownloadJobStatus,
	usePrepareDownload,
} from "@/client/hooks/use-downloads";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";
import { toast } from "@/utils/toast-facade";

interface OfflineDownloadDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mediaFileId: string;
	title?: string;
	fileName?: string;
}

const PROFILES: Array<{
	id: DownloadQuality;
	label: string;
	resolution: string;
	description: string;
	icon: LucideIcon;
	recommended?: boolean;
}> = [
	{
		id: "720p-mobile",
		label: "720p Mobile HD",
		resolution: "1280x720 • ~2.5 Mbps",
		get description() {
			return m.components_offline_mobile_optimized_note();
		},
		icon: Smartphone,
		recommended: true,
	},
	{
		id: "1080p-high",
		label: "1080p Full HD",
		resolution: "1920x1080 • ~6.0 Mbps",
		get description() {
			return m.components_offline_high_quality_note();
		},
		icon: Tv,
	},
	{
		id: "480p-low",
		get label() {
			return m.components_offline_480p_saver();
		},
		resolution: "854x480 • ~1.2 Mbps",
		get description() {
			return m.components_offline_smallest_note();
		},
		icon: HardDrive,
	},
	{
		id: "original",
		get label() {
			return m.components_offline_original_faststart();
		},
		get resolution() {
			return m.components_offline_direct_copy_note();
		},
		get description() {
			return m.components_offline_original_quality_note();
		},
		icon: Film,
	},
];

export function OfflineDownloadDialog({ open, onOpenChange, mediaFileId, title, fileName }: OfflineDownloadDialogProps) {
	const [selectedQuality, setSelectedQuality] = useState<DownloadQuality>("720p-mobile");
	const [activeJobId, setActiveJobId] = useState<string | null>(null);

	const prepareMutation = usePrepareDownload();
	const deleteMutation = useDeleteDownload();
	const { data: jobStatus } = useDownloadJobStatus(activeJobId);

	// Reset the task state on close (Base UI calls onOpenChange(false) on every dismiss).
	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			setActiveJobId(null);
		}

		onOpenChange(nextOpen);
	};

	const handleStartPrepare = (): void => {
		startTransition(async () => {
			try {
				const job = await prepareMutation.mutateAsync({
					mediaFileId,
					quality: selectedQuality,
				});
				setActiveJobId(job.id);
				toast.success(m.components_offline_started_background(), {
					description: m.components_offline_close_window_note(),
				});
			} catch {
				// Toast handled by hook
			}
		});
	};

	const handleCancel = (): void => {
		startTransition(async () => {
			if (activeJobId) {
				await deleteMutation.mutateAsync(activeJobId).catch(() => {
					// Cancellation failure is non-fatal — the dialog still closes.
				});
				setActiveJobId(null);
				toast.success(m.components_download_cancelled());
			}
		});
	};

	const isProcessing = jobStatus?.status === "pending" || jobStatus?.status === "processing" || prepareMutation.isPending;
	const isCompleted = jobStatus?.status === "completed";
	const isFailed = jobStatus?.status === "failed";

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<Download className="size-5" />
						</div>
						<div>
							<DialogTitle className="text-lg">{m.components_offline_heading()}</DialogTitle>
							<DialogDescription className="text-xs">
								{title ? m.components_preparing_file_for({ title }) : m.components_offline_convert_download()}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				{fileName && (
					<div className="truncate rounded-lg border border-border/60 bg-muted/30 px-3 py-2 font-mono text-muted-foreground text-xs">
						{m.components_offline_source_file({ fileName })}
					</div>
				)}

				{!activeJobId && (
					<div className="flex flex-col gap-3 py-2">
						<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							{m.components_offline_select_quality()}
						</span>
						<RadioGroup
							value={selectedQuality}
							onValueChange={(value) => {
								const selected = PROFILES.find((profile) => profile.id === value);
								if (selected) setSelectedQuality(selected.id);
							}}
							className="grid gap-2.5"
						>
							{PROFILES.map((opt) => {
								const Icon = opt.icon;
								const isSelected = selectedQuality === opt.id;

								return (
									<label
										key={opt.id}
										htmlFor={`quality-${opt.id}`}
										className={cn(
											"flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-left transition-[border-color,background-color,color,box-shadow] has-[[data-slot=radio-group-item]:focus-visible]:ring-2 has-[[data-slot=radio-group-item]:focus-visible]:ring-ring/50",
											{
												"border-primary bg-primary/5 shadow-sm": isSelected,
												"border-border/60 bg-background/60 hover:border-border hover:bg-muted/30": !isSelected,
											},
										)}
									>
										<div
											className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", {
												"bg-primary text-primary-foreground": isSelected,
												"bg-muted text-muted-foreground": !isSelected,
											})}
										>
											<Icon className="size-4" />
										</div>
										<div className="flex flex-1 flex-col gap-0.5">
											<div className="flex items-center gap-2">
												<span className="font-bold text-foreground text-sm">{opt.label}</span>
												{opt.recommended && (
													<Badge variant="secondary" size="sm" className="gap-1 font-semibold text-[10px]">
														<Sparkles className="size-3 text-primary" />
														{m.components_offline_recommended()}
													</Badge>
												)}
											</div>
											<span className="font-mono text-muted-foreground text-xs">{opt.resolution}</span>
											<span className="text-muted-foreground/80 text-xs">{opt.description}</span>
										</div>
										<RadioGroupItem value={opt.id} id={`quality-${opt.id}`} className="mt-1" />
									</label>
								);
							})}
						</RadioGroup>
					</div>
				)}

				{activeJobId && (
					<div className="flex flex-col gap-4 py-4">
						<div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-6 text-center">
							{isProcessing && (
								<>
									<div className="relative flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
										<Loader2 className="size-7 animate-spin" />
									</div>
									<div className="flex flex-col gap-1">
										<span className="font-bold text-base text-foreground">{m.components_offline_in_progress()}</span>
										<span className="text-muted-foreground text-xs">
											{m.components_offline_server_transcoding_desc({ profile: jobStatus?.quality ?? selectedQuality })}
										</span>
									</div>
									<div className="w-full max-w-md">
										<Progress value={jobStatus?.progressPercent ?? 1} aria-label={m.common_progress()} className="w-full gap-1.5">
											<div className="flex w-full justify-between gap-1 font-medium text-muted-foreground text-xs">
												<span>{jobStatus?.status === "processing" ? m.common_processing() : m.common_queued_ellipsis()}</span>
												<span className="font-bold text-primary">
													{jobStatus?.progressPercent ? `${Math.round(jobStatus.progressPercent)}%` : ""}
												</span>
											</div>
										</Progress>
									</div>
									<p className="mt-2 text-muted-foreground text-xs">{m.components_offline_close_window_note()}</p>
								</>
							)}

							{isCompleted && (
								<>
									<div className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
										<Check className="size-7" />
									</div>
									<div className="flex flex-col gap-1">
										<span className="font-bold text-base text-success">{m.components_offline_ready()}</span>
										<span className="text-muted-foreground text-xs">
											{jobStatus.fileName}
											{jobStatus.sizeBytes ? ` • ${formatFileSize(jobStatus.sizeBytes)}` : ""}
										</span>
									</div>
									<div className="mt-2 flex flex-wrap justify-center gap-2">
										<a
											href={getDownloadFileUrl(activeJobId)}
											download={jobStatus.fileName ?? "video.mp4"}
											className={cn(buttonVariants({ size: "sm" }), "gap-2 font-bold shadow-md")}
										>
											<Download className="size-4" />
											{m.components_offline_download_mp4()}
										</a>
									</div>
								</>
							)}

							{isFailed && (
								<>
									<div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
										<Trash2 className="size-7" />
									</div>
									<div className="flex flex-col gap-1">
										<span className="font-bold text-base text-destructive">{m.components_offline_transcode_error()}</span>
										<span className="text-muted-foreground text-xs">
											{jobStatus.errorText ?? m.components_offline_unexpected_ffmpeg_error()}
										</span>
									</div>
								</>
							)}
						</div>
					</div>
				)}

				<DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
					{activeJobId ? (
						<>
							<div className="flex items-center gap-2">
								{isProcessing && (
									<Button variant="ghost" size="sm" onClick={handleCancel} className="text-destructive hover:bg-destructive/10">
										{m.components_offline_cancel_job()}
									</Button>
								)}
								<Button
									variant="outline"
									size="sm"
									nativeButton={false}
									render={<Link to={"/downloads"} />}
									onClick={() => onOpenChange(false)}
									className="gap-1.5 text-xs"
								>
									<span>{m.components_offline_open_download_list()}</span>
									<ArrowRight className="size-3.5" />
								</Button>
							</div>
							<Button variant="default" size="sm" onClick={() => onOpenChange(false)}>
								{isCompleted ? m.components_offline_done() : m.components_offline_close_window()}
							</Button>
						</>
					) : (
						<>
							<Button variant="ghost" onClick={() => onOpenChange(false)}>
								{m.common_cancel()}
							</Button>
							<Button onClick={handleStartPrepare} disabled={prepareMutation.isPending} className="gap-2 font-medium">
								{prepareMutation.isPending ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Download data-icon="inline-start" className="size-4" aria-hidden="true" />
								)}
								{m.components_offline_start_preparation()}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
