import { Activity, RefreshCw, Video, Wifi } from "lucide-react";
import { useState } from "react";
import { useAdminLiveActivity, useTerminateLiveStream } from "@/client/hooks/use-admin-live-activity";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { translateByKey } from "@/utils/translate-error";
import { ActiveDeviceCard } from "./live-activity/active-device-card";
import { LiveMaintenanceBanner } from "./live-activity/live-maintenance-banner";
import { LiveStreamCard } from "./live-activity/live-stream-card";

export function AdminLiveActivitySection() {
	const liveQuery = useAdminLiveActivity();
	const terminateMutation = useTerminateLiveStream();
	const [terminatingSessionId, setTerminatingSessionId] = useState<string | null>(null);

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

					<span className="text-[11px] text-muted-foreground">{m.admin_telemetry_refresh_3s()}</span>
				</div>

				{activeStreams.length === 0 ? (
					<div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 border-dashed bg-card/30 py-10 text-center text-muted-foreground">
						<Video className="mb-2 size-8 opacity-30" />
						<p className="font-semibold text-foreground text-xs">{m.admin_no_active_playbacks()}</p>
						<p className="text-[11px]">{m.admin_nobody_watching()}</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{activeStreams.map((stream) => (
							<LiveStreamCard
								key={stream.sessionId}
								stream={stream}
								onTerminate={(sessionId, title, viewer) => {
									detach(handleTerminateStream(sessionId, title, viewer));
								}}
								isTerminating={terminatingSessionId === stream.sessionId}
							/>
						))}
					</div>
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
		</div>
	);
}
