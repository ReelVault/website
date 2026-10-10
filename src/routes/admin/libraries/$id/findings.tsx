import type { ScanFindingStatus } from "@reelvault/sdk";
import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const LibraryFindingsPage = lazyRouteComponent(() => import("@/pages/admin/libraries/library-findings-page"));

// zod-free validateSearch — see src/types/search-params.ts for the rationale.
interface LibraryFindingsSearch {
	status: ScanFindingStatus;
}

function libraryFindingsSearchValidator(search: Record<string, unknown>): LibraryFindingsSearch {
	return { status: search.status === "ignored" ? "ignored" : "active" };
}

export const Route = createFileRoute("/admin/libraries/$id/findings")({
	component: LibraryFindingsPage,
	validateSearch: libraryFindingsSearchValidator,
});
