import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";

interface UseEntityRefreshMutationOptions<TData, TError, TVariables>
	extends Omit<UseMutationOptions<TData, TError, TVariables>, "onSuccess" | "onError"> {
	invalidationKeys: ReadonlyArray<readonly unknown[]>;
	successMessage: string;
	errorMessage: string;
	onSuccess?: UseMutationOptions<TData, TError, TVariables>["onSuccess"];
	onError?: UseMutationOptions<TData, TError, TVariables>["onError"];
}

export function useEntityRefreshMutation<TData, TError, TVariables>({
	invalidationKeys,
	successMessage,
	errorMessage,
	onSuccess: onSuccessCallback,
	onError: onErrorCallback,
	...mutationOptions
}: UseEntityRefreshMutationOptions<TData, TError, TVariables>) {
	const queryClient = useQueryClient();

	return useMutation({
		...mutationOptions,
		onSuccess: async (...args) => {
			await Promise.all(invalidationKeys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
			toast.success(successMessage);
			onSuccessCallback?.(...args);
		},
		onError: (...args) => {
			toastError(errorMessage, args[0]);
			onErrorCallback?.(...args);
		},
	});
}
