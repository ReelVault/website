import type { UpdateProfilePreferences } from "@reelvault/sdk";
import { type QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { profileListFields } from "../utils/fields";
import {
	authKeys,
	discoveryKeys,
	downloadKeys,
	metadataKeys,
	notificationKeys,
	playbackSessionKeys,
	profileKeys,
	watchedHistoryKeys,
	watchlistKeys,
} from "../utils/query-keys";
import { resetWatchlistBatch } from "./use-watchlist";

/**
 * Profile-scoped caches are keyed by profile-agnostic roots, so a profile
 * switch would otherwise serve the previous profile's data (continue-watching,
 * history, watchlist, notifications, downloads, discover, metadata user state).
 * Drop those roots; mounted queries refetch immediately with the new
 * `current_profile_id` cookie. `["me"]` also covers
 * `["me","playback-sessions","mine"]` and `["me","playback"]`.
 */
function resetProfileScopedQueries(queryClient: QueryClient): void {
	resetWatchlistBatch();
	for (const key of [
		["me"],
		watchlistKeys.all,
		notificationKeys.all,
		watchedHistoryKeys.all,
		downloadKeys.all,
		discoveryKeys.all,
		playbackSessionKeys.all,
		// `metadata` carries profile-scoped state: detailsView.userState
		// (watchlist/rating/progress) and library queries with watched/rating filters.
		metadataKeys.all,
	]) {
		queryClient.removeQueries({ queryKey: key });
	}
}

export const profilesQueryOptions = () => ({
	queryKey: profileKeys.all,
	queryFn: async () => {
		const { data } = await reelvault.profiles.getAll({ fields: profileListFields });

		return data;
	},
	staleTime: 120_000,
});

export function useProfiles() {
	const query = useQuery(profilesQueryOptions());

	return {
		profiles: query.data ?? [],
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useSwitchProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ profileId, pin }: { profileId: string; pin?: string }) => reelvault.profiles.switch({ profileId, pin }),
		onSuccess: async () => {
			resetProfileScopedQueries(queryClient);
			await queryClient.refetchQueries({ queryKey: authKeys.me() });
		},
	});
}

const invalidateProfiles = (queryClient: ReturnType<typeof useQueryClient>) =>
	Promise.all([queryClient.invalidateQueries({ queryKey: authKeys.me() }), queryClient.invalidateQueries({ queryKey: profileKeys.all })]);

export function useCreateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: { name: string; avatarUrl: string; pin?: string }) => reelvault.profiles.create(data),
		onSuccess: async () => {
			await invalidateProfiles(queryClient);
			toast.success(m.toast_profile_created());
		},
		onError: (error) => toastError(m.auth_failed_to_create_profile(), error),
	});
}

export function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: { name?: string; avatarUrl?: string; pin?: string } }) =>
			reelvault.profiles.update(id, data),
		onSuccess: async () => {
			await invalidateProfiles(queryClient);
			toast.success(m.toast_profile_updated());
		},
		onError: (error) => toastError(m.toast_profile_save_failed(), error),
	});
}

export function useUploadProfileAvatar() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ profileId, file }: { profileId: string; file: File }) => reelvault.profiles.uploadAvatar(profileId, file),
		onSuccess: async (result) => {
			await invalidateProfiles(queryClient);
			toast.success(m.toast_profile_photo_updated());

			return result.avatarUrl;
		},
		onError: (error) => toastError(m.toast_profile_photo_upload_failed(), error, m.toast_avatar_check_file()),
	});
}

export function useDeleteProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (profileId: string) => reelvault.profiles.delete(profileId),
		onSuccess: async (_, profileId) => {
			queryClient.removeQueries({ queryKey: profileKeys.preferences(profileId) });
			await invalidateProfiles(queryClient);
			toast.success(m.toast_profile_deleted());
		},
		onError: (error) => toastError(m.toast_profile_delete_retry(), error),
	});
}

export function useProfilePreferences(profileId: string | undefined) {
	const queryClient = useQueryClient();
	const query = useQuery({
		queryKey: profileKeys.preferences(profileId ?? "none"),
		enabled: Boolean(profileId),
		queryFn: () => reelvault.profiles.getPreferences(profileId ?? ""),
		staleTime: 120_000,
	});
	const updateMutation = useMutation({
		mutationFn: (data: UpdateProfilePreferences) => reelvault.profiles.updatePreferences(profileId ?? "", data),
		onSuccess: (preferences) => {
			queryClient.setQueryData(profileKeys.preferences(profileId ?? ""), preferences);
			toast.success(m.toast_preferences_saved());
		},
		onError: (error) => toastError(m.toast_preferences_save_failed(), error),
	});

	return {
		preferences: query.data,
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
		updatePreferences: updateMutation.mutateAsync,
		isSaving: updateMutation.isPending,
	};
}

export function useResetProfilePreferences(profileId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => reelvault.profiles.resetPreferences(profileId ?? ""),
		onSuccess: (preferences) => {
			queryClient.setQueryData(profileKeys.preferences(profileId ?? ""), preferences);
			toast.success(m.toast_profile_settings_restored());
		},
		onError: (error) => toastError(m.toast_profile_restore_failed(), error),
	});
}
