import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

export function useAdminBackups() {
	const queryClient = useQueryClient();

	const backupsQuery = useQuery({
		queryKey: adminKeys.backups(),
		queryFn: () => reelvault.admin.getDatabaseBackups(),
		staleTime: 30_000,
	});

	const createBackupMutation = useMutation({
		mutationFn: () => reelvault.admin.createDatabaseBackup(),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: adminKeys.backups() });
		},
		onError: (error) => toastError(m.admin_database_failed_to_create(), error),
	});

	const deleteBackupMutation = useMutation({
		mutationFn: (fileName: string) => reelvault.admin.deleteDatabaseBackup(fileName),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: adminKeys.backups() });
		},
		onError: (error) => toastError(m.admin_database_failed_to_delete(), error),
	});

	/** Runs SQLite's quick check on the live database; the result is shown, not cached. */
	const integrityMutation = useMutation({
		mutationFn: () => reelvault.admin.getDatabaseIntegrity(),
		onError: (error) => toastError(m.admin_database_integrity_failed(), error),
	});

	const optimizeMutation = useMutation({
		mutationFn: () => reelvault.admin.optimizeDatabase(),
		onSuccess: () => {
			toast.success(m.admin_database_optimized());
		},
		onError: (error) => toastError(m.admin_database_optimize_failed(), error),
	});

	const restoreMutation = useMutation({
		mutationFn: (fileName: string) => reelvault.admin.restoreDatabase(fileName),
		onError: (error) => toastError(m.admin_database_failed_to_restore(), error),
	});

	return {
		backupsQuery,
		backups: backupsQuery.data ?? [],
		createBackupMutation,
		deleteBackupMutation,
		restoreMutation,
		integrityMutation,
		optimizeMutation,
	};
}
