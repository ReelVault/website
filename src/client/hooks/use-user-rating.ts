import { useMutation, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { metadataKeys } from "../utils/query-keys";

/**
 * User rating mutations. The rating value comes from the details-view composite
 * (userState.rating) — there is no separate rating query.
 */
export function useUserRatingMutations(metadataId: string) {
	const queryClient = useQueryClient();
	const invalidate = async () => {
		await queryClient.invalidateQueries({ queryKey: metadataKeys.detailsView(metadataId) });
	};

	const rateMutation = useMutation({
		mutationFn: (rating: number) => reelvault.me.rate({ metadataId, rating }),
		onSuccess: async () => {
			await invalidate();
			toast.success(m.toast_rating_saved());
		},
		onError: (error) => toastError(m.toast_rating_save_failed(), error),
	});
	const deleteMutation = useMutation({
		mutationFn: () => reelvault.me.deleteRating(metadataId),
		onSuccess: async () => {
			await invalidate();
			toast.success(m.toast_rating_removed());
		},
		onError: (error) => toastError(m.toast_rating_delete_failed(), error),
	});

	return {
		rate: rateMutation.mutateAsync,
		removeRating: deleteMutation.mutateAsync,
		isSaving: rateMutation.isPending || deleteMutation.isPending,
	};
}
