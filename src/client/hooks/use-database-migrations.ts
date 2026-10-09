import { useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { adminKeys } from "../utils/query-keys";

/** How many of the migrations shipped with this server the database has applied. */
export function useDatabaseMigrations() {
	return useQuery({
		queryKey: adminKeys.databaseMigrations(),
		queryFn: () => reelvault.admin.getDatabaseMigrations(),
		staleTime: 60_000,
	});
}
