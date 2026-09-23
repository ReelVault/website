import { Link, useLocation } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useState } from "react";
import { useAdminStats } from "@/client/hooks/use-admin-stats";
import { usePluginPages, usePluginSlots } from "@/client/hooks/use-plugin-ui";
import { usePlugins } from "@/client/hooks/use-plugins";
import { Logo } from "@/components/logo";
import { SidebarContent, SidebarHeader, SidebarInput, SidebarSeparator } from "@/components/ui/sidebar";
import { m } from "@/paraglide/messages";
import { staticMenuGroups } from "./admin-sidebar-constants";
import { AdminSidebarGroup } from "./admin-sidebar-group";
import { AdminSidebarPluginsGroup } from "./admin-sidebar-plugins-group";

/**
 * Admin sidebar body + search field in one — query, filtering and section
 * state live here so per-keystroke input does not re-render the sidebar shell.
 */
export function AdminSidebarBody() {
	const { pathname } = useLocation();
	const { plugins } = usePlugins();
	const statsQuery = useAdminStats();
	const stats = statsQuery.data;
	const [searchQuery, setSearchQuery] = useState("");
	const [pluginsOpen, setPluginsOpen] = useState(true);

	const { pages: pluginPages } = usePluginPages();
	const adminPagePluginIds = new Set(
		pluginPages.filter((page) => page.nav === "admin" || page.adminOnly === true).map((page) => page.pluginId),
	);
	const activePluginsWithViews = plugins.filter((p) => p.state === "enabled" && adminPagePluginIds.has(p.id));
	const { contributions: pluginSidebarLinks } = usePluginSlots("admin-sidebar-plugin-section");
	const q = searchQuery.toLowerCase().trim();

	const filteredStaticGroups = !q
		? staticMenuGroups
		: staticMenuGroups.reduce<typeof staticMenuGroups>((acc, group) => {
				const items = group.items.filter((i) => i.name.toLowerCase().includes(q) || i.href.toLowerCase().includes(q));
				if (items.length > 0) {
					acc.push({ ...group, items });
				}

				return acc;
			}, []);

	const isPluginsMainMatch = !q || "plugins".includes(q);
	const filteredPluginPages = !q
		? activePluginsWithViews
		: activePluginsWithViews.filter((plugin) => plugin.name.toLowerCase().includes(q) || plugin.description?.toLowerCase().includes(q));

	const showPluginsSection = isPluginsMainMatch || filteredPluginPages.length > 0;
	const hasAnyResults = filteredStaticGroups.length > 0 || showPluginsSection;
	const isPluginsMainActive =
		pathname === "/admin/plugins" || (pathname.startsWith("/admin/plugins/") && !pathname.startsWith("/admin/plugins/pages"));

	const handleClearSearch = () => setSearchQuery("");
	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(event.target.value);
	};

	return (
		<>
			<SidebarHeader className="gap-3 border-border border-b p-4">
				<Link to="/" className="flex items-center justify-center">
					<Logo className="h-7 w-auto" />
				</Link>
				<div className="relative group-data-[collapsible=icon]:hidden">
					<SidebarInput
						placeholder={m.admin_sidebar_search_placeholder()}
						value={searchQuery}
						onChange={handleSearchChange}
						className="pl-8 text-xs"
					/>
					<Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
					<button
						type="button"
						aria-label={m.components_search_clear()}
						onClick={handleClearSearch}
						className="absolute top-2.5 right-2.5 p-0.5 text-muted-foreground transition-colors hover:text-foreground"
					>
						<X className="size-4" />
					</button>
				</div>
			</SidebarHeader>

			<SidebarContent className="gap-2 py-4">
				{hasAnyResults ? (
					filteredStaticGroups.map((group, groupIndex) => (
						<div key={group.id}>
							<AdminSidebarGroup group={group} pathname={pathname} stats={stats} />

							{/* Dynamic plugins section inserted after taxonomy group */}
							{group.id === "taxonomy" && showPluginsSection ? (
								<>
									<SidebarSeparator />
									<AdminSidebarPluginsGroup
										pathname={pathname}
										isPluginsMainMatch={isPluginsMainMatch}
										isPluginsMainActive={isPluginsMainActive}
										filteredPluginPages={filteredPluginPages}
										pluginSidebarLinksCount={pluginSidebarLinks.length}
										activePluginsWithViewsCount={activePluginsWithViews.length}
										pluginsOpen={pluginsOpen}
										setPluginsOpen={setPluginsOpen}
										hasQuery={Boolean(q)}
									/>
								</>
							) : null}

							{groupIndex < filteredStaticGroups.length - 1 && <SidebarSeparator />}
						</div>
					))
				) : (
					<div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
						<Search className="size-5 text-muted-foreground/50" />
						<p className="text-muted-foreground text-xs">{m.admin_sidebar_no_results({ searchQuery })}</p>
					</div>
				)}
			</SidebarContent>
		</>
	);
}
