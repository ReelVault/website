import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useNotifications(unreadOnly = false) {
	const queryClient = useQueryClient();
	const query = useQuery(notificationsQueryOptions(unreadOnly));

	const invalidateNotifications = () => queryClient.invalidateQueries({ queryKey: notificationKeys.all });
	const markReadMutation = useMutation({
		mutationFn: (notificationId: string) => reelvault.notifications.markRead(notificationId),
		onSuccess: invalidateNotifications,
		onError: (error) => toastError(m.toast_notification_mark_failed(), error),
	});
	const markAllReadMutation = useMutation({
		mutationFn: () => reelvault.notifications.markAllRead(),
		onSuccess: async () => {
			await invalidateNotifications();
			toast.success(m.hooks_all_notifications_marked());
		},
		onError: (error) => toastError(m.toast_notifications_mark_failed(), error),
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
	};
}

export function useUnreadNotificationCount() {
	return useQuery({
		queryKey: notificationKeys.unreadCount(),
		queryFn: () => reelvault.notifications.getUnreadCount(),
		staleTime: 1000 * 60 * 5,
	});
}
