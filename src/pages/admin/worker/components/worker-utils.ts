import type { WorkerOperation } from "@reelvault/sdk";
import { useSyncExternalStore } from "react";
import { m } from "@/paraglide/messages";
import { formatFullDateTime } from "@/utils/format-utils";

export type ItemStatus = WorkerOperation["status"];

export const WORKER_ITEMS_PAGE_SIZE = 25;

export const labels: Record<ItemStatus, string> = {
	pending: m.admin_workers_queued(),
	running: m.worker_status_in_progress(),
	completed: m.admin_worker_finished_word(),
	failed: m.common_error(),
	cancelled: m.admin_workers_status_cancelled_word(),
};

export function formatDate(date: string | undefined) {
	return date ? formatFullDateTime(date) : "—";
}

export function formatMsDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`;

	const totalSeconds = Math.floor(ms / 1000);
	const days = Math.floor(totalSeconds / 86400);
	const hours = Math.floor((totalSeconds % 86400) / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (days > 0) {
		return `${days}d ${hours}h ${minutes}m`;
	}

	if (hours > 0) {
		return `${hours}h ${minutes}m ${seconds}s`;
	}

	if (minutes > 0) {
		return `${minutes}m ${seconds}s`;
	}

	return `${seconds}s`;
}

export function getWorkerMeta(workerId: string): { title: string; category: string } {
	switch (workerId) {
		case "library-scan":
			return { title: m.admin_workers_operation_type_scan_library(), category: m.admin_workers_category_library() };
		case "media-files-refresh-all":
			return { title: m.admin_worker_refreshing_ffprobe(), category: "Biblioteka" };
		case "media-file-technical-refresh":
			return { title: m.admin_workers_operation_type_tech_analysis(), category: m.admin_workers_category_media() };
		case "media-file-analysis":
			return { title: m.admin_worker_deep_stream_analysis(), category: "Media" };
		case "media-file-ingest":
			return { title: m.admin_workers_operation_type_index_import(), category: m.admin_workers_category_media() };
		case "metadata-refresh":
			return { title: m.admin_workers_operation_type_metadata_fetch(), category: m.admin_workers_category_metadata() };
		case "image-processing":
			return { title: m.admin_workers_operation_type_image_optimization(), category: m.admin_workers_category_images() };
		case "library-errors-check":
			return { title: m.admin_worker_integrity_verification(), category: m.admin_workers_category_diagnostics() };
		case "stream-init":
			return { title: m.admin_workers_operation_type_transcode_init(), category: m.admin_workers_category_streaming() };
		case "trickplay-generate":
			return { title: m.admin_workers_operation_type_trickplay(), category: m.admin_workers_category_media() };
		case "offline-sync":
			return { title: m.admin_worker_offline_job_sync(), category: "System" };
		default:
			if (workerId.startsWith("org.reelvault.")) {
				const parts = workerId.split(":");
				const pluginName = parts[0]?.replace("org.reelvault.", "") ?? "plugin";
				const actionName = parts.slice(1).join(" ") || m.admin_worker_plugin_job();

				return { title: `${pluginName}: ${actionName}`, category: m.admin_nav_plugins() };
			}

			return { title: workerId, category: "Worker" };
	}
}

export function getScheduledTaskMeta(taskId: string): { title: string; description: string } {
	switch (taskId) {
		case "library-scan":
			return {
				title: m.admin_worker_scan_media_library(),
				description: m.admin_worker_change_detector(),
			};
		case "media-files-refresh-all":
			return {
				title: m.admin_worker_refresh_tech_data(),
				description: m.admin_worker_stream_reanalysis(),
			};
		case "library-errors-check":
			return {
				title: m.admin_worker_check_library_errors(),
				description: m.admin_worker_integrity_verifier(),
			};
		case "clean-up-database":
			return {
				title: m.admin_worker_history_log_cleanup(),
				description: m.admin_worker_expired_history_pruner(),
			};
		case "clean-up-transcodes":
			return {
				title: m.admin_worker_transcode_cleanup(),
				description: m.admin_workers_hls_cleanup_desc(),
			};
		case "clean-up-plugin-blobs":
			return {
				title: m.admin_worker_plugin_temp_cleanup(),
				description: m.admin_worker_expired_temp_pruner(),
			};
		case "offline-sync":
			return {
				title: m.admin_worker_offline_job_sync(),
				description: m.admin_worker_progress_sync(),
			};
		case "intro-skipper-analyze-all":
			return {
				title: m.admin_worker_intro_detection(),
				description: m.admin_worker_episode_intro_scan(),
			};
		case "media-requests-sync":
			return {
				title: m.admin_worker_request_verification(),
				description: m.admin_worker_request_checker(),
			};
		case "image-processing":
			return {
				title: m.admin_worker_image_processing(),
				description: m.admin_worker_thumbnail_optimizer(),
			};
		case "metadata-refresh":
			return {
				title: m.admin_worker_refreshing_metadata(),
				description: m.admin_worker_metadata_fetcher(),
			};
		case "media-file-analysis":
			return {
				title: m.admin_worker_deep_file_analysis(),
				description: m.admin_worker_analyzes_streams(),
			};
		case "media-file-ingest":
			return {
				title: m.admin_worker_single_file_indexing(),
				description: m.admin_workers_single_file_import_desc(),
			};
		case "media-file-technical-refresh":
			return {
				title: m.admin_worker_single_tech_refresh(),
				description: m.admin_worker_codec_reread(),
			};
		case "stream-init":
			return {
				title: m.admin_workers_stream_init(),
				description: m.admin_worker_playback_prep(),
			};
		default:
			return {
				title: taskId,
				description: m.admin_workers_background_job_for({ taskId }),
			};
	}
}

// Shared 1 Hz clock for the worker dialog — ONE interval for all visible rows
// (the old per-row useCurrentTime ran N timers → N rerenders/s). The timer
// lives only while at least one row is subscribed and pauses when hidden.
const clockListeners = new Set<() => void>();
let clockNow = Date.now();
let clockTimer: number | undefined;
let onVisibilityChange: (() => void) | null = null;

function tickClock() {
	clockNow = Date.now();
	for (const listener of clockListeners) listener();
}

function subscribeClock(listener: () => void) {
	clockListeners.add(listener);
	if (clockListeners.size === 1) {
		clockNow = Date.now();
		clockTimer = window.setInterval(tickClock, 1_000);
		onVisibilityChange = () => {
			if (document.hidden) {
				if (clockTimer !== undefined) window.clearInterval(clockTimer);

				clockTimer = undefined;
			} else {
				clockTimer = window.setInterval(tickClock, 1_000);
				tickClock();
			}
		};
		document.addEventListener("visibilitychange", onVisibilityChange);
	}

	return () => {
		clockListeners.delete(listener);
		if (clockListeners.size === 0) {
			if (clockTimer !== undefined) window.clearInterval(clockTimer);

			clockTimer = undefined;
			if (onVisibilityChange) document.removeEventListener("visibilitychange", onVisibilityChange);

			onVisibilityChange = null;
		}
	};
}

const noopSubscribe = () => () => {
	// Intentionally empty — unsubscription is a no-op for finished workers.
};
const getClockSnapshot = () => clockNow;

export function useCurrentTime(active = true) {
	return useSyncExternalStore(active ? subscribeClock : noopSubscribe, getClockSnapshot, getClockSnapshot);
}
