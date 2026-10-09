import type { DownloadJob } from "@reelvault/sdk";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "../../utils/toast-utils";
import { reelvault } from "../client";
import { pollWhile } from "../utils/poll-while";
import { downloadKeys } from "../utils/query-keys";

export type DownloadQuality = "original" | "1080p-high" | "720p-mobile" | "480p-low";

export const userDownloadsQueryOptions = () => ({
	queryKey: downloadKeys.list(),
	queryFn: () => reelvault.downloads.list(),
});

export function useUserDownloads() {
	return useQuery({
		...userDownloadsQueryOptions(),
		select: (response) => response.data,
		refetchInterval: pollWhile({
			isActive: (data) => data?.data.some((item) => item.status === "pending" || item.status === "processing") ?? false,
			activeMs: 1500,
		}),
	});
}

/** Storage the finished downloads use against the profile's limit. */
export function useUserDownloadQuota() {
	return useQuery({
		...userDownloadsQueryOptions(),
		select: (response) => response.quota,
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

export function useRetryDownload() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (jobId: string) => {
			return await reelvault.downloads.retry(jobId);
		},
		onSuccess: async (job) => {
			queryClient.setQueryData(downloadKeys.status(job.id), job);
			toast.success(m.toast_download_retry_started());
			await queryClient.invalidateQueries({ queryKey: downloadKeys.list() });
		},
		onError: (error) => {
			toastError(m.toast_download_retry_failed(), error, m.toast_plugins_unexpected_error());
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

/** One page of every user's download jobs, optionally narrowed to one status. */
export function useAdminDownloadJobs(params: { page: number; status?: "pending" | "processing" | "completed" | "failed" | "cancelled" }) {
	return useQuery({
		queryKey: downloadKeys.adminJobs(params),
		queryFn: () => reelvault.admin.getDownloadJobs(params),
		placeholderData: keepPreviousData,
		refetchInterval: pollWhile({
			isActive: (data) => data?.data.some((item) => item.status === "pending" || item.status === "processing") ?? false,
			activeMs: 1500,
		}),
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
