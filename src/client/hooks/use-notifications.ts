import { keepPreviousData, queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { notificationKeys } from "../utils/query-keys";

export const notificationsQueryOptions = (unreadOnly = false) =>
	queryOptions({
		queryKey: notificationKeys.list(unreadOnly),
		queryFn: () => reelvault.notifications.getAll({ unreadOnly }),
		staleTime: 1000 * 60 * 5,
	});

/** One page of notifications, filtered on the server by read state and type. */
export function useNotificationsPage(params: { page: number; limit?: number; unreadOnly: boolean; type?: string }) {
	const { page, limit = 25, unreadOnly, type } = params;

	return useQuery({
		queryKey: notificationKeys.page({ page, limit, unreadOnly, type }),
		queryFn: () => reelvault.notifications.getPage({ page, limit, unreadOnly, type }),
		placeholderData: keepPreviousData,
		staleTime: 1000 * 60 * 5,
	});
}

/** Notification types the profile has received recently; the mute settings offer exactly these. */
export function useReceivedNotificationTypes() {
	const query = useNotificationsPage({ page: 1, limit: 100, unreadOnly: false });

	return {
		types: [...new Set((query.data?.data ?? []).map((notification) => notification.type))],
		isLoading: query.isLoading,
	};
}

export function useNotifications(unreadOnly = false, options?: { enabled?: boolean }) {
	const queryClient = useQueryClient();
	const query = useQuery({ ...notificationsQueryOptions(unreadOnly), enabled: options?.enabled ?? true });

	const invalidateNotifications = () => queryClient.invalidateQueries({ queryKey: notificationKeys.all });
	const markReadMutation = useMutation({
		mutationFn: (notificationId: string) => reelvault.notifications.markRead(notificationId),
		onSuccess: invalidateNotifications,
		onError: (error) => toastError(m.toast_notification_mark_failed(), error),
	});
	const markAllReadMutation = useMutation({
		mutationFn: (type?: string) => reelvault.notifications.markAllRead(type),
		onSuccess: async () => {
			await invalidateNotifications();
			toast.success(m.hooks_all_notifications_marked());
		},
		onError: (error) => toastError(m.toast_notifications_mark_failed(), error),
	});

	const deleteMutation = useMutation({
		mutationFn: (notificationId: string) => reelvault.notifications.delete(notificationId),
		onSuccess: invalidateNotifications,
		onError: (error) => toastError(m.toast_notification_dismiss_failed(), error),
	});
	const deleteManyMutation = useMutation({
		mutationFn: (ids: string[]) => reelvault.notifications.deleteMany(ids),
		onSuccess: invalidateNotifications,
		onError: (error) => toastError(m.toast_notification_dismiss_failed(), error),
	});

	return {
		notifications: query.data ?? [],
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
		markRead: markReadMutation.mutateAsync,
		markAllRead: markAllReadMutation.mutateAsync,
		isMarkingRead: markReadMutation.isPending,
		isMarkingAllRead: markAllReadMutation.isPending,
		deleteNotification: deleteMutation.mutateAsync,
		deleteNotifications: deleteManyMutation.mutateAsync,
		isDismissing: deleteMutation.isPending || deleteManyMutation.isPending,
	};
}

export function useUnreadNotificationCount() {
	return useQuery({
		queryKey: notificationKeys.unreadCount(),
		queryFn: () => reelvault.notifications.getUnreadCount(),
		staleTime: 1000 * 60 * 5,
	});
}
