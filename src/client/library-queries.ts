import { queryOptions } from "@tanstack/react-query";
import { reelvault } from "./client";
import { libraryDetailFields, libraryListFields } from "./utils/fields";
import { libraryKeys } from "./utils/query-keys";

/**
 * Library list/detail query options, kept apart from `use-libraries` on purpose:
 * route files are part of the eager startup graph, and `/movies` + `/series`
 * redirect in `beforeLoad` — they need the options without pulling the hooks,
 * mutations and message imports of the full module.
 */
export const librariesQueryOptions = (type: "movies" | "tv_shows") =>
	queryOptions({
		queryKey: libraryKeys.list(type),
		queryFn: () => reelvault.libraries.getAll({ type, fields: libraryListFields }),
		staleTime: Number.POSITIVE_INFINITY,
	});

export const libraryDetailQueryOptions = (id: string) =>
	queryOptions({
		queryKey: libraryKeys.detail(id),
		queryFn: () => reelvault.libraries.getById(id, { fields: libraryDetailFields }),
		staleTime: 1000 * 60 * 10,
	});
