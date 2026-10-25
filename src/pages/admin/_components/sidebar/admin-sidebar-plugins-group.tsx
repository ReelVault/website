import type { PluginRuntimeStatus } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { AppWindow, ChevronRight, Puzzle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { m } from "@/paraglide/messages";
import { PluginSlotHost } from "@/plugin-host/slot-host.lazy";

interface AdminSidebarPluginsGroupProps {
	pathname: string;
	isPluginsMainMatch: boolean;
	isPluginsMainActive: boolean;
	filteredPluginPages: PluginRuntimeStatus[];
	pluginSidebarLinksCount: number;
	activePluginsWithViewsCount: number;
	pluginsOpen: boolean;
	setPluginsOpen: (open: boolean) => void;
	hasQuery: boolean;
}

export function AdminSidebarPluginsGroup({
	pathname,
	isPluginsMainMatch,
	isPluginsMainActive,
	filteredPluginPages,
	pluginSidebarLinksCount,
	activePluginsWithViewsCount,
	pluginsOpen,
	setPluginsOpen,
	hasQuery,
}: AdminSidebarPluginsGroupProps) {
	const isPluginPagesActive = pathname.startsWith("/admin/plugins/pages");

	return (
		<SidebarGroup>
			<SidebarGroupLabel>{m.admin_sidebar_extensions()}</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu className="gap-1">
					{/* Plugin main panel pinned on top */}
					{isPluginsMainMatch && (
						<SidebarMenuItem>
							<SidebarMenuButton
								render={<Link to={"/admin/plugins"} />}
								isActive={isPluginsMainActive}
								tooltip={m.admin_plugin_management()}
								className="relative"
							>
								{isPluginsMainActive && <div className="bg-sidebar-primary absolute inset-y-0 left-0 w-1 rounded-r-md" />}
								<Puzzle
									className={cn(
										"size-4 shrink-0 transition-colors",
										isPluginsMainActive ? "text-sidebar-primary" : "text-muted-foreground",
									)}
								/>
								<span className="truncate">{m.admin_plugin_management()}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					)}

					{/* Plugin pages as a collapsible submenu (Collapse) */}
					{(filteredPluginPages.length > 0 || pluginSidebarLinksCount > 0) && (
						<Collapsible open={pluginsOpen || hasQuery} onOpenChange={setPluginsOpen} className="group/collapsible">
							<SidebarMenuItem>
								<CollapsibleTrigger
									render={
										<SidebarMenuButton tooltip={m.admin_live_plugin_pages_tooltip()} isActive={isPluginPagesActive} className="relative" />
									}
								>
									{isPluginPagesActive && <div className="bg-sidebar-primary absolute inset-y-0 left-0 w-1 rounded-r-md" />}
									<AppWindow
										className={cn(
											"size-4 shrink-0 transition-colors",
											isPluginPagesActive ? "text-sidebar-primary" : "text-muted-foreground",
										)}
									/>
									<span className="truncate">{m.admin_live_plugin_pages_tooltip()}</span>
									<SidebarMenuBadge className="text-sidebar-accent-foreground ml-auto group-data-[collapsible=icon]:hidden">
										{activePluginsWithViewsCount}
									</SidebarMenuBadge>
									<ChevronRight className="ml-1 size-4 shrink-0 transition-transform duration-200 group-data-open/collapsible:rotate-90 group-data-[collapsible=icon]:hidden data-panel-open:rotate-90" />
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										{filteredPluginPages.map((plugin) => {
											const href = `/admin/plugins/pages/${encodeURIComponent(plugin.id)}`;
											const isActive = pathname === href || pathname.startsWith(`/admin/plugins/pages/${encodeURIComponent(plugin.id)}`);

											return (
												<SidebarMenuSubItem key={plugin.id}>
													<SidebarMenuSubButton render={<Link to={href} />} isActive={isActive}>
														<Puzzle className="text-muted-foreground size-3.5 shrink-0" />
														<span className="truncate">{plugin.name}</span>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											);
										})}
										<PluginSlotHost name="admin-sidebar-plugin-section" />
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
					)}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
