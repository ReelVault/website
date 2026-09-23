import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, startTransition, useEffect, useRef } from "react";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { realtimeConnection, setRealtimeConnectionAllowed, useRealtimeEvent } from "@/client/hooks/use-realtime";
import {
	adminKeys,
	discoveryKeys,
	episodeKeys,
	libraryKeys,
	mediaKeys,
	metadataKeys,
	notificationKeys,
	seasonKeys,
} from "@/client/utils/query-keys";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";

// A worker-heavy operation (library scan, metadata refresh) emits one
// `worker:job:completed` per job — thousands for a large scan. Invalidating
// eagerly per event caused an N×keys refetch storm; collect the affected keys
// and flush once per window instead.
const INVALIDATION_COALESCE_MS = 400;

export function RealtimeProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient();
	const { profile, isAuthenticated, isLoading } = useCurrentUser();

	const pendingInvalidations = useRef(new Map<string, QueryKey>());
	const invalidationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(
		() => () => {
			if (invalidationTimer.current) clearTimeout(invalidationTimer.current);
		},
		[],
	);

	const invalidateCoalesced = (keys: readonly QueryKey[]) => {
		for (const key of keys) pendingInvalidations.current.set(JSON.stringify(key), key);

		if (invalidationTimer.current) return;

		invalidationTimer.current = setTimeout(() => {
			invalidationTimer.current = null;
			const queued = [...pendingInvalidations.current.values()];
			pendingInvalidations.current.clear();
			startTransition(async () => {
				try {
					await Promise.all(queued.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
				} catch (error) {
					console.error("Realtime cache invalidation failed", error);
				}
			});
		}, INVALIDATION_COALESCE_MS);
	};

	useEffect(() => {
		if (isLoading) return;

		setRealtimeConnectionAllowed(isAuthenticated);
		if (isAuthenticated) {
			realtimeConnection.setProfileId(profile?.id);
			realtimeConnection.connect();
		}
	}, [isAuthenticated, isLoading, profile?.id]);

	// Listen for remote session revocation
	useRealtimeEvent("auth:session:revoked", () => {
		toast.error(m.components_realtime_session_terminated());
		window.location.assign("/auth/login");
	});

	// Listen for library scan completion
	useRealtimeEvent("library:scan:completed", (data) => {
		toast.success(m.components_realtime_library_scan_finished({ libraryTitle: data.libraryTitle ?? "" }));
		invalidateCoalesced([
			libraryKeys.all,
			mediaKeys.all,
			mediaKeys.files(),
			metadataKeys.all,
			episodeKeys.all,
			seasonKeys.all,
			discoveryKeys.all,
		]);
	});

	// Listen for worker tasks completion
	useRealtimeEvent("worker:job:completed", () => {
		invalidateCoalesced([
			adminKeys.workerOperations(),
			adminKeys.workers(),
			adminKeys.workerOperationPrefix(),
			adminKeys.workerOperationJobsPrefix(),
			adminKeys.stats(),
			adminKeys.cacheStats(),
			// worker jobs (scans, refreshes, transcodes) mutate media files — this
			// replaces the former unconditional 30 s poll of the admin media list
			mediaKeys.adminFiles(),
		]);
	});

	// Listen for new notifications
	useRealtimeEvent("notification:created", (data) => {
		if (data.title) {
			toast.info(data.title, { description: data.message });
		}

		invalidateCoalesced([notificationKeys.all]);
	});

	return <>{children}</>;
}
