import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminDownloadJob, DownloadJob } from "@reelvault/sdk";
import { m } from "@/paraglide/messages";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { downloadKeys } from "../utils/query-keys";

export type DownloadQuality = "original" | "1080p-high" | "720p-mobile" | "480p-low";

export const userDownloadsQueryOptions = () => ({
	queryKey: downloadKeys.list(),
	queryFn: async () => {
		const response = await reelvault.downloads.list();

		return response.jobs;
	},
});

export function useUserDownloads() {
	return useQuery<DownloadJob[]>({
		...userDownloadsQueryOptions(),
		refetchInterval: (query) => {
			const list = query.state.data ?? [];
			const hasActive = list.some((item) => item.status === "pending" || item.status === "processing");

			return hasActive ? 1500 : false;
		},
	});
}

export function usePrepareDownload() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: { mediaFileId: string; quality?: DownloadQuality }) => {
			return await reelvault.downloads.prepare({
				mediaFileId: payload.mediaFileId,
				quality: payload.quality,
			});
		},
		onSuccess: async (data) => {
			queryClient.setQueryData(downloadKeys.status(data.id), data);
			await queryClient.invalidateQueries({ queryKey: downloadKeys.list() });
		},
		onError: (error) => {
			toastError(m.toast_download_prepare_failed(), error, m.toast_plugins_unexpected_error());
		},
	});
}

export function useDownloadJobStatus(jobId: string | null | undefined) {
	return useQuery<DownloadJob | null>({
		queryKey: downloadKeys.status(jobId),
		queryFn: async () => {
			if (!jobId) return null;

			return await reelvault.downloads.getStatus(jobId);
		},
		enabled: Boolean(jobId),
		refetchInterval: (query) => {
			const data = query.state.data;
			if (!data) return false;

			if (data.status === "completed" || data.status === "failed" || data.status === "cancelled") return false;

			return 1500;
		},
	});
}

export function useDeleteDownload() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (jobId: string) => {
			return await reelvault.downloads.remove(jobId);
		},
		onError: (error) => {
			toastError(m.toast_download_delete_failed(), error, m.toast_plugins_unexpected_error());
		},
		onSuccess: async (_, jobId) => {
			queryClient.removeQueries({ queryKey: downloadKeys.status(jobId) });
			await queryClient.invalidateQueries({ queryKey: downloadKeys.list() });
		},
	});
}

export function getDownloadFileUrl(jobId: string): string {
	return reelvault.downloads.getFileUrl(jobId);
}

export function useAdminDownloadJobs() {
	return useQuery<AdminDownloadJob[]>({
		queryKey: downloadKeys.adminJobs(),
		queryFn: async () => {
			const response = await reelvault.admin.getDownloadJobs();

			return response.jobs;
		},
		refetchInterval: (query) => {
			const list = query.state.data ?? [];
			const hasActive = list.some((item) => item.status === "pending" || item.status === "processing");

			return hasActive ? 1500 : false;
		},
	});
}

export function useAdminDeleteDownloadJob() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (jobId: string) => {
			return await reelvault.admin.deleteDownloadJob(jobId);
		},
		onError: (error) => {
			toastError(m.admin_downloads_failed_to_delete(), error, m.toast_plugins_unexpected_error());
		},
		onSuccess: async (_, jobId) => {
			await queryClient.invalidateQueries({ queryKey: downloadKeys.adminJobs() });
			queryClient.removeQueries({ queryKey: downloadKeys.status(jobId) });
		},
	});
}
