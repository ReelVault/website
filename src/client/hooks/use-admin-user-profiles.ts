import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminCreateUserProfile, AdminSetUserPassword, UpdateProfilePreferences } from "@reelvault/sdk";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys, profileKeys } from "../utils/query-keys";

export type AdminUserProfile = Awaited<ReturnType<typeof reelvault.admin.getUserProfiles>>[number];

export function useAdminUserProfiles(userId: string) {
	const queryClient = useQueryClient();
	const queryKey = profileKeys.adminUserProfiles(userId);
	const profilesQuery = useQuery({
		queryKey,
		enabled: Boolean(userId),
		queryFn: () => reelvault.admin.getUserProfiles(userId),
		staleTime: 120_000,
	});
	const invalidateAll = async () => {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey }),
			queryClient.invalidateQueries({ queryKey: adminKeys.userPrefix(userId) }),
		]);
	};

	const createMutation = useMutation({
		mutationFn: (body: AdminCreateUserProfile) => reelvault.admin.createUserProfile(userId, body),
		onSuccess: async () => {
			await invalidateAll();
			toast.success(m.toast_profile_created());
		},
		onError: (error) => toastError(m.auth_failed_to_create_profile(), error),
	});
	const updateMutation = useMutation({
		mutationFn: ({ profileId, body }: { profileId: string; body: { name?: string; avatarUrl?: string | null; pin?: string | null } }) =>
			reelvault.admin.updateUserProfile(userId, profileId, body),
		onSuccess: () => invalidateAll(),
		onError: (error) => toastError(m.toast_profile_update_failed(), error),
	});
	const passwordMutation = useMutation({
		mutationFn: (body: AdminSetUserPassword) => reelvault.admin.setUserPassword(userId, body),
		onSuccess: async () => {
			await invalidateAll();
			toast.success(m.toast_password_changed());
		},
		onError: (error) => toastError(m.toast_password_change_failed(), error),
	});
	const deleteMutation = useMutation({
		mutationFn: (profileId: string) => reelvault.admin.deleteUserProfile(userId, profileId),
		onSuccess: async () => {
			await invalidateAll();
			toast.success(m.toast_profile_deleted());
		},
		onError: (error) => toastError(m.toast_profile_delete_failed(), error),
	});

	return {
		profiles: profilesQuery.data ?? [],
		isLoading: profilesQuery.isLoading,
		error: profilesQuery.error,
		refetch: profilesQuery.refetch,
		createProfile: createMutation.mutateAsync,
		isCreating: createMutation.isPending,
		updateProfile: (input: { profileId: string; body: { name?: string; avatarUrl?: string | null; pin?: string | null } }) =>
			updateMutation.mutateAsync(input),
		setPassword: passwordMutation.mutateAsync,
		isSettingPassword: passwordMutation.isPending,
		deleteProfile: deleteMutation.mutateAsync,
		isSaving: updateMutation.isPending,
		isDeleting: deleteMutation.isPending,
	};
}

export function useAdminUserProfilePreferences(userId: string, profileId: string | undefined) {
	const queryClient = useQueryClient();
	const queryKey = profileKeys.adminUserProfilePreferences(userId, profileId ?? "none");
	const query = useQuery({
		queryKey,
		enabled: Boolean(userId && profileId),
		queryFn: () => reelvault.admin.getUserProfilePreferences(userId, profileId ?? ""),
		staleTime: 120_000,
	});
	const updateMutation = useMutation({
		mutationFn: (body: UpdateProfilePreferences) => reelvault.admin.updateUserProfilePreferences(userId, profileId ?? "", body),
		onSuccess: (preferences) => {
			queryClient.setQueryData(queryKey, preferences);
			toast.success(m.toast_preferences_saved());
		},
		onError: (error) => toastError(m.toast_preferences_save_failed(), error),
	});
	const resetMutation = useMutation({
		mutationFn: () => reelvault.admin.resetUserProfilePreferences(userId, profileId ?? ""),
		onSuccess: (preferences) => {
			queryClient.setQueryData(queryKey, preferences);
			toast.success(m.toast_profile_settings_restored());
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
		resetPreferences: resetMutation.mutateAsync,
		isResetting: resetMutation.isPending,
	};
}
