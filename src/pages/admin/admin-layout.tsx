import { Link, useLocation } from "@tanstack/react-router";
import { ExternalLink, Home, Zap } from "lucide-react";
import { useAdminPlugins } from "@/client/hooks/use-admin-plugins";
import { useAdminStats } from "@/client/hooks/use-admin-stats";
import { useSetupStatus } from "@/client/hooks/use-setup-status";
import { RequireAdmin } from "@/components/auth/require-admin";
import { PageContainer } from "@/components/page-container";
import { type Status, StatusBadge } from "@/components/status-badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { usePageTitle } from "@/hooks/use-page-title";
import { AdminSidebar } from "@/pages/admin/admin-sidebar";
import { m } from "@/paraglide/messages";

/** Only these resource segments have admin routes; anything else falls back to the index. */
const RESOURCE_KEYS = [
	"analytics",
	"audit",
	"collections",
	"companies",
	"database",
	"genres",
	"keywords",
	"libraries",
	"media",
	"markers",
	"metadata",
	"people",
	"plugins",
	"providers",
	"resources",
	"settings",
	"subtitles",
	"users",
	"worker",
] as const;

type ResourceKey = (typeof RESOURCE_KEYS)[number];
/** The dashboard lives at the bare /admin index — it is a valid breadcrumb target too. */
type AdminResource = ResourceKey | "dashboard";

function toAdminResource(segment: string): AdminResource {
	return RESOURCE_KEYS.find((key) => key === segment) ?? "dashboard";
}

const ADMIN_RESOURCE_ROUTES: Record<AdminResource, "/admin" | `/admin/${ResourceKey}`> = {
	dashboard: "/admin",
	analytics: "/admin/analytics",
	audit: "/admin/audit",
	collections: "/admin/collections",
	companies: "/admin/companies",
	database: "/admin/database",
	genres: "/admin/genres",
	keywords: "/admin/keywords",
	libraries: "/admin/libraries",
	media: "/admin/media",
	markers: "/admin/markers",
	metadata: "/admin/metadata",
	people: "/admin/people",
	plugins: "/admin/plugins",
	providers: "/admin/providers",
	resources: "/admin/resources",
	settings: "/admin/settings",
	subtitles: "/admin/subtitles",
	users: "/admin/users",
	worker: "/admin/worker",
};

const resourceLabels: Record<string, string> = {
	dashboard: m.admin_nav_dashboard(),
	analytics: m.admin_nav_analytics(),
	libraries: m.admin_nav_libraries(),
	metadata: m.admin_nav_metadata(),
	media: m.admin_nav_media_files(),
	providers: m.admin_nav_providers(),
	subtitles: m.admin_nav_subtitles(),
	markers: m.admin_nav_video_segments(),
	collections: m.admin_nav_collections(),
	genres: m.admin_nav_genres(),
	keywords: m.admin_nav_keywords(),
	people: m.admin_nav_people(),
	companies: m.admin_nav_companies(),
	users: m.admin_nav_users(),
	worker: m.admin_nav_workers(),
	plugins: m.admin_nav_plugins(),
	database: m.admin_nav_database_backups(),
	resources: m.admin_nav_resources_system(),
	logs: m.admin_nav_server_logs(),
	audit: m.admin_nav_security_audit(),
	settings: m.admin_nav_server_settings(),
};

function AdminHeader() {
	const { pathname } = useLocation();
	const setupStatus = useSetupStatus();
	const statsQuery = useAdminStats();
	const { plugins } = useAdminPlugins();

	const segments = pathname.split("/").filter(Boolean);
	const resourceKey = toAdminResource(segments[1] ?? "dashboard");
	const subId = segments[2];
	// Plugin ids are noisy in the breadcrumb — show the display name from the
	// shared plugins cache when the segment is a plugin id.
	const breadcrumbId =
		resourceKey === "plugins" && subId && subId !== "pages"
			? (plugins.find((plugin) => plugin.id === decodeURIComponent(subId))?.name ?? subId)
			: (subId ?? "");
	usePageTitle(`${resourceLabels[resourceKey] ?? resourceKey} (admin)`);

	let apiStatus: Status = "success";
	let apiLabel = m.admin_common_server_online();
	if (setupStatus.isLoading) {
		apiStatus = "pending";
		apiLabel = m.admin_common_checking_api();
	} else if (setupStatus.isError) {
		apiStatus = "error";
		apiLabel = m.admin_nav_api_unavailable();
	} else if (setupStatus.data?.required) {
		apiStatus = "warning";
		apiLabel = m.admin_workers_requires_config();
	}

	const activeWorkers = statsQuery.data?.workers?.active ?? 0;

	return (
		<header className="sticky top-0 z-10 border-border/80 border-b bg-background/95 backdrop-blur-sm">
			<PageContainer className="flex min-h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
				<div className="flex min-w-0 items-center gap-3">
					<SidebarTrigger />

					<Breadcrumb className="hidden sm:block">
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink render={<Link to="/admin/dashboard" />}>{m.admin_common_panel()}</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							{subId ? (
								<>
									<BreadcrumbItem>
										<BreadcrumbLink render={<Link to={ADMIN_RESOURCE_ROUTES[resourceKey]} />}>
											{resourceLabels[resourceKey] ?? resourceKey}
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										<BreadcrumbPage className="max-w-48 truncate font-mono text-xs">
											{subId === "pages" ? (segments[3] ?? m.admin_plugins_singular()) : breadcrumbId}
										</BreadcrumbPage>
									</BreadcrumbItem>
								</>
							) : (
								<BreadcrumbItem>
									<BreadcrumbPage>{resourceLabels[resourceKey] ?? resourceKey}</BreadcrumbPage>
								</BreadcrumbItem>
							)}
						</BreadcrumbList>
					</Breadcrumb>
				</div>

				<div className="flex items-center gap-2.5">
					{activeWorkers > 0 && (
						<Link
							to="/admin/worker"
							className="hidden items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-primary text-xs transition-colors hover:bg-primary/20 md:flex"
						>
							<Zap className="size-3 animate-pulse" />
							<span className="font-semibold tabular-nums">{activeWorkers}</span>
							<span className="text-[11px]">{m.admin_common_in_background()}</span>
						</Link>
					)}

					<StatusBadge status={apiStatus} label={apiLabel} className="hidden sm:inline-flex" />

					<Button
						variant="ghost"
						size="sm"
						className="gap-1.5 text-muted-foreground text-xs hover:text-foreground"
						nativeButton={false}
						render={<Link to="/" />}
						title={m.admin_nav_go_to_cinema_app()}
					>
						<Home className="size-3.5" />
						<span className="hidden lg:inline">{m.admin_common_app()}</span>
						<ExternalLink className="size-3 opacity-60" />
					</Button>
				</div>
			</PageContainer>
		</header>
	);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<RequireAdmin>
			<SidebarProvider>
				<AdminSidebar />
				<main className="min-h-svh w-full bg-background">
					<AdminHeader />
					<PageContainer className="py-6 sm:py-8">{children}</PageContainer>
				</main>
			</SidebarProvider>
		</RequireAdmin>
	);
}
