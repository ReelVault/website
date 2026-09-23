import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toastError, toastSuccess } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys, providersKeys, subtitleKeys } from "../utils/query-keys";

export function useAdminMetadataProviders() {
	return useQuery({
		queryKey: adminKeys.metadataProviders(),
		queryFn: () => reelvault.admin.getMetadataProviderConfigurations(),
	});
}

/** Admin provider changes also affect user-facing lists (identify, subtitles). */
const invalidateProviderConsumers = (queryClient: ReturnType<typeof useQueryClient>) =>
	Promise.all([
		queryClient.invalidateQueries({ queryKey: adminKeys.metadataProviders() }),
		queryClient.invalidateQueries({ queryKey: providersKeys.configurations() }),
		queryClient.invalidateQueries({ queryKey: subtitleKeys.providers() }),
	]);

export function useUpdateMetadataProvider() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ providerId, values }: { providerId: string; values: { priority?: number; enabled?: boolean } }) =>
			reelvault.admin.updateMetadataProviderConfiguration(providerId, values),
		onSuccess: async () => {
			await invalidateProviderConsumers(queryClient);
		},
		onError: (error) => toastError(m.toast_provider_update_failed(), error),
	});
}

export function useReorderMetadataProviders() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (providerIds: string[]) => reelvault.admin.reorderMetadataProviderConfigurations(providerIds),
		onSuccess: async () => {
			await invalidateProviderConsumers(queryClient);
			toastSuccess(m.toast_provider_order_saved());
		},
		onError: (error) => toastError(m.toast_provider_order_save_failed(), error),
	});
}
