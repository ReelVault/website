import { cn } from "cn";
import { ShieldAlert, ShieldCheck, Users, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { m } from "@/paraglide/messages";

interface LiveMaintenanceBannerProps {
	canSafelyUpdate: boolean;
	activeStreamsCount: number;
	activeDevicesCount: number;
	warningText?: string | null | undefined;
}

export function LiveMaintenanceBanner({
	canSafelyUpdate,
	activeStreamsCount,
	activeDevicesCount,
	warningText,
}: LiveMaintenanceBannerProps) {
	return (
		<div
			className={cn("relative overflow-hidden rounded-2xl border p-5 transition-[border-color,background-color,color,box-shadow]", {
				"border-success/40 bg-success/5": canSafelyUpdate,
				"border-destructive/60 bg-destructive/10 shadow-destructive/10 shadow-lg": !canSafelyUpdate,
			})}
		>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-4">
					<div
						className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", {
							"bg-success/10 text-success": canSafelyUpdate,
							"animate-pulse bg-destructive/20 text-destructive": !canSafelyUpdate,
						})}
					>
						{canSafelyUpdate ? <ShieldCheck className="size-6" /> : <ShieldAlert className="size-6" />}
					</div>

					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2.5">
							<div
								className={cn("size-2.5 rounded-full", {
									"bg-success shadow-success shadow-xs": canSafelyUpdate,
									"animate-ping bg-destructive": !canSafelyUpdate,
								})}
							/>
							<h3 className="font-bold text-base text-foreground">
								{canSafelyUpdate
									? m.admin_live_ready_for_update()
									: m.admin_live_warning_active_streams_full({ count: activeStreamsCount })}
							</h3>
						</div>

						<p className="text-muted-foreground text-xs leading-relaxed">
							{canSafelyUpdate ? m.admin_no_active_playbacks_safe_update() : warningText}
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
					<Badge
						variant="outline"
						className={cn("gap-1.5 font-mono text-xs", {
							"border-destructive/50 text-destructive": activeStreamsCount > 0,
							"border-border text-muted-foreground": activeStreamsCount <= 0,
						})}
					>
						<Video className="size-3.5" />
						<span>{m.admin_live_active_video_streams_count({ count: activeStreamsCount })}</span>
					</Badge>

					<Badge variant="outline" className="gap-1.5 border-border font-mono text-muted-foreground text-xs">
						<Users className="size-3.5" />
						<span>
							{activeDevicesCount} {m.admin_live_connected_devices()}
						</span>
					</Badge>
				</div>
			</div>
		</div>
	);
}
