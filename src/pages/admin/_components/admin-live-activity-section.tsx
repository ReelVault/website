import { Activity, PauseCircle, RefreshCw, Video, Wifi } from "lucide-react";
import { useState } from "react";
import { getReelVaultApiUrl } from "@/client/client";
import { useAdminLiveActivity, useTerminateLiveStream, useTerminateLiveStreams } from "@/client/hooks/use-admin-live-activity";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { translateByKey } from "@/utils/translate-error";
import { ActiveDeviceCard } from "./live-activity/active-device-card";
import { EndedSessionsList } from "./live-activity/ended-sessions-list";
import { LiveMaintenanceBanner } from "./live-activity/live-maintenance-banner";
import { LiveStreamCard } from "./live-activity/live-stream-card";

/** Opens the FFmpeg log zip of an active session; the browser sends the admin session cookie with it. */
function openSessionLog(sessionId: string) {
	window.open(`${getReelVaultApiUrl()}/v1/admin/live-activity/${encodeURIComponent(sessionId)}/log`, "_blank", "noopener,noreferrer");
}

export function AdminLiveActivitySection() {
	const liveQuery = useAdminLiveActivity();
	const terminateMutation = useTerminateLiveStream();
	const [terminatingSessionId, setTerminatingSessionId] = useState<string | null>(null);
	const terminateManyMutation = useTerminateLiveStreams();
	const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());

	const data = liveQuery.data;

	const handleTerminateStream = async (sessionId: string, title: string, viewer: string) => {
		if (terminateMutation.isPending) return;

		if (!confirm(m.admin_live_stop_confirm({ title, viewer }))) {
			return;
		}

		setTerminatingSessionId(sessionId);
		try {
			await terminateMutation.mutateAsync({ sessionId });
			toast.success(m.admin_live_session_stopped_toast({ viewer }));
		} catch (error) {
			toastError(m.admin_session_stop_error(), error);
		}

		setTerminatingSessionId(null);
	};

	const toggleSelected = (sessionId: string) => {
		setSelectedIds((current) => {
			const next = new Set(current);
			if (next.has(sessionId)) next.delete(sessionId);
			else next.add(sessionId);

			return next;
		});
	};

	const handleTerminateSelected = async (sessionIds: string[]) => {
		try {
			await terminateManyMutation.mutateAsync({ sessionIds });
			setSelectedIds(new Set());
		} catch {
			// Toast is handled by hook
		}
	};

	if (liveQuery.isLoading && !data) {
		return (
			<div className="flex h-40 items-center justify-center rounded-2xl border border-border/60 bg-card/40">
				<div className="flex items-center gap-3 text-muted-foreground text-xs">
					<RefreshCw className="size-4 animate-spin text-primary" />
					<span>{m.admin_checking_live_activity()}</span>
				</div>
			</div>
		);
	}

	const activeStreams = data?.activeStreams ?? [];
	const activeDevices = data?.activeDevices ?? [];
	const canSafelyUpdate = data?.canSafelyUpdate ?? true;
	const warningText = data?.warning ? translateByKey(data.warning.code, data.warning.params) : null;
	const activeStreamIds = activeStreams.map((stream) => stream.sessionId);
	// Only streams still on screen count: a stream that ended drops out of the selection.
	const selectedOnScreen = activeStreamIds.filter((sessionId) => selectedIds.has(sessionId));

	return (
		<div className="flex flex-col gap-6">
			{/* 1. Maintenance & Safe Restart Banner */}
			<LiveMaintenanceBanner
				canSafelyUpdate={canSafelyUpdate}
				activeStreamsCount={activeStreams.length}
				activeDevicesCount={activeDevices.length}
				warningText={warningText}
			/>

			{/* 2. Live Playing Streams Grid */}
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Activity className="size-4.5 animate-pulse text-primary" />
						<h4 className="font-bold text-foreground text-sm uppercase tracking-wider">
							{m.admin_live_active_streams_title({ count: activeStreams.length })}
						</h4>
					</div>

					{data?.capacity && (
						<span
							className={data.capacity.active >= data.capacity.limit ? "text-[11px] text-warning" : "text-[11px] text-muted-foreground"}
						>
							{m.admin_live_capacity({ active: data.capacity.active, limit: data.capacity.limit })}
						</span>
					)}
					<span className="text-[11px] text-muted-foreground">{m.admin_telemetry_refresh_3s()}</span>
				</div>

				{activeStreams.length === 0 ? (
					<div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 border-dashed bg-card/30 py-10 text-center text-muted-foreground">
						<Video className="mb-2 size-8 opacity-30" />
						<p className="font-semibold text-foreground text-xs">{m.admin_no_active_playbacks()}</p>
						<p className="text-[11px]">{m.admin_nobody_watching()}</p>
					</div>
				) : (
					<>
						<div className="flex flex-wrap items-center justify-between gap-2">
							<label className="flex cursor-pointer items-center gap-2 text-xs">
								<input
									type="checkbox"
									className="size-4 accent-primary"
									checked={selectedOnScreen.length === activeStreams.length}
									onChange={() => {
										setSelectedIds(selectedOnScreen.length === activeStreams.length ? new Set() : new Set(activeStreamIds));
									}}
								/>
								{m.admin_live_select_all()}
							</label>
							{selectedOnScreen.length > 0 && (
								<div className="flex items-center gap-2">
									<Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedIds(new Set())}>
										{m.admin_live_clear_selection()}
									</Button>
									<ConfirmAction
										trigger={
											<Button
												variant="outline"
												size="sm"
												disabled={terminateManyMutation.isPending}
												className="gap-1.5 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive"
											>
												<PauseCircle className="size-3.5" />
												{m.admin_live_stop_selected({ count: selectedOnScreen.length })}
											</Button>
										}
										title={m.admin_live_stop_selected_title({ count: selectedOnScreen.length })}
										description={m.admin_live_stop_selected_description()}
										confirmLabel={m.admin_live_stop_selected({ count: selectedOnScreen.length })}
										onConfirm={() => detach(handleTerminateSelected(selectedOnScreen))}
									/>
								</div>
							)}
						</div>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{activeStreams.map((stream) => (
								<div key={stream.sessionId} className="relative">
									<label className="absolute top-3 left-3 z-10 flex size-6 cursor-pointer items-center justify-center rounded-md bg-background/80 shadow-sm">
										<input
											type="checkbox"
											className="size-4 accent-primary"
											checked={selectedIds.has(stream.sessionId)}
											onChange={() => toggleSelected(stream.sessionId)}
											aria-label={m.admin_live_select_session()}
										/>
									</label>
									<LiveStreamCard
										stream={stream}
										onTerminate={(sessionId, title, viewer) => {
											detach(handleTerminateStream(sessionId, title, viewer));
										}}
										isTerminating={terminatingSessionId === stream.sessionId}
										onDownloadLog={openSessionLog}
									/>
								</div>
							))}
						</div>
					</>
				)}
			</div>

			{/* 3. Connected Devices (Browsing / Idle) */}
			{activeDevices.length > 0 && (
				<div className="flex flex-col gap-3 pt-2">
					<div className="flex items-center gap-2">
						<Wifi className="size-4 text-muted-foreground" />
						<h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
							{m.admin_live_connected_devices_title({ count: activeDevices.length })}
						</h4>
					</div>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{activeDevices.map((device) => (
							<ActiveDeviceCard key={device.sessionId} device={device} />
						))}
					</div>
				</div>
			)}

			<EndedSessionsList />
		</div>
	);
}
