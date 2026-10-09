import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { m } from "@/paraglide/messages";
import { activeStreamsBlocking } from "@/utils/stream-block";
import { toast } from "@/utils/toast-facade";
import { toastError } from "@/utils/toast-utils";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

/** A restore that the server held back because streams are playing, waiting for the admin to confirm. */
export interface RestoreStreamBlock {
	fileName: string;
	activeStreams: number;
}

export function useAdminBackups() {
	const queryClient = useQueryClient();
	const [restoreBlock, setRestoreBlock] = useState<RestoreStreamBlock | null>(null);

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

	const uploadBackupMutation = useMutation({
		mutationFn: (file: File) => reelvault.admin.uploadDatabaseBackup(file),
		onSuccess: async (backup) => {
			await queryClient.invalidateQueries({ queryKey: adminKeys.backups() });
			toast.success(m.admin_database_backup_uploaded({ fileName: backup.fileName }));
		},
		onError: (error) => toastError(m.admin_database_failed_to_upload(), error),
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

	// A restore restarts the server, which ends the streams playing, so the server holds it back while any play.
	// The warning offers to restore anyway (`force`); any other error is reported as before.
	const restoreMutation = useMutation({
		mutationFn: ({ fileName, force }: { fileName: string; force?: boolean }) => reelvault.admin.restoreDatabase(fileName, { force }),
		onError: (error, { fileName, force }) => {
			const activeStreams = activeStreamsBlocking(error);
			if (activeStreams !== null && force !== true) {
				setRestoreBlock({ fileName, activeStreams });

				return;
			}

			toastError(m.admin_database_failed_to_restore(), error);
		},
	});

	/** Runs the held-back restore again with `force`, once the admin has confirmed the warning. */
	const confirmRestoreBlock = () => {
		const block = restoreBlock;
		setRestoreBlock(null);
		if (block) restoreMutation.mutate({ fileName: block.fileName, force: true });
	};

	return {
		backupsQuery,
		backups: backupsQuery.data ?? [],
		createBackupMutation,
		deleteBackupMutation,
		uploadBackupMutation,
		restoreMutation,
		restoreBlock,
		confirmRestoreBlock,
		dismissRestoreBlock: () => setRestoreBlock(null),
		integrityMutation,
		optimizeMutation,
	};
}
