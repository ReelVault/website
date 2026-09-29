import { useMutation, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { metadataKeys } from "../utils/query-keys";

/** The slice of the details-view composite the optimistic update touches. */
interface DetailsViewUserState {
	userState?: { rating?: number | null } | undefined;
}

/**
 * User rating mutations. The rating value comes from the details-view composite
 * (userState.rating) — there is no separate rating query.
 */
export function useUserRatingMutations(metadataId: string) {
	const queryClient = useQueryClient();
	const invalidate = async () => {
		await queryClient.invalidateQueries({ queryKey: metadataKeys.detailsView(metadataId) });
	};

	// Optimistic: the stars react before the round-trip; the invalidated
	// composite (onSuccess) is the source of truth, a failure rolls back.
	const patchRating = (rating: number | null) => {
		const previous = queryClient.getQueryData<DetailsViewUserState>(metadataKeys.detailsView(metadataId));
		if (!previous) return null;

		queryClient.setQueryData<DetailsViewUserState>(metadataKeys.detailsView(metadataId), {
			...previous,
			userState: { ...previous.userState, rating },
		});

		return previous;
	};

	const rateMutation = useMutation({
		mutationFn: (rating: number) => reelvault.me.rate({ metadataId, rating }),
		onMutate: (rating) => patchRating(rating),
		onSuccess: async () => {
			await invalidate();
			toast.success(m.toast_rating_saved());
		},
		onError: (error, _rating, previous) => {
			if (previous) {
				queryClient.setQueryData(metadataKeys.detailsView(metadataId), previous);
			}
			toastError(m.toast_rating_save_failed(), error);
		},
	});
	const deleteMutation = useMutation({
		mutationFn: () => reelvault.me.deleteRating(metadataId),
		onMutate: () => patchRating(null),
		onSuccess: async () => {
			await invalidate();
			toast.success(m.toast_rating_removed());
		},
		onError: (error, _variables, previous) => {
			if (previous) {
				queryClient.setQueryData(metadataKeys.detailsView(metadataId), previous);
			}
			toastError(m.toast_rating_delete_failed(), error);
		},
	});

	return {
		rate: rateMutation.mutateAsync,
		removeRating: deleteMutation.mutateAsync,
		isSaving: rateMutation.isPending || deleteMutation.isPending,
	};
}
