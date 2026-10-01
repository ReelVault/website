import { createFileRoute } from "@tanstack/react-router";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const AdminSettingsPage = lazyRouteComponent(() => import("@/pages/admin/settings/settings-page"));

// zod-free validateSearch — see src/routes/admin/media/index.tsx. The tab value
// is validated against the known list in the page; unknown tabs fall back there.
function adminSettingsSearchValidator(search: Record<string, unknown>): { tab?: string } {
	return { tab: typeof search.tab === "string" && search.tab !== "" ? search.tab : undefined };
}

export const Route = createFileRoute("/admin/settings")({
	validateSearch: adminSettingsSearchValidator,
	component: AdminSettingsPage,
});
