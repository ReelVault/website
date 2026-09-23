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
import { PluginSlotHost } from "@/plugin-host/slot-host";

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
			<SidebarGroupLabel className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
				{m.admin_sidebar_extensions()}
			</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu className="gap-1">
					{/* Plugin main panel pinned on top */}
					{isPluginsMainMatch && (
						<SidebarMenuItem>
							<SidebarMenuButton
								render={<Link to={"/admin/plugins"} />}
								isActive={isPluginsMainActive}
								tooltip={m.admin_plugin_management()}
								className={cn(
									"relative transition-[border-color,background-color,color,box-shadow] duration-150",
									isPluginsMainActive && "font-semibold",
								)}
							>
								{isPluginsMainActive && <div className="absolute inset-y-0 left-0 w-1 rounded-r-md bg-sidebar-primary" />}
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
										<SidebarMenuButton
											tooltip={m.admin_live_plugin_pages_tooltip()}
											isActive={isPluginPagesActive}
											className={cn(
												"relative transition-[border-color,background-color,color,box-shadow] duration-150",
												isPluginPagesActive && "font-semibold",
											)}
										/>
									}
								>
									{isPluginPagesActive && <div className="absolute inset-y-0 left-0 w-1 rounded-r-md bg-sidebar-primary" />}
									<AppWindow
										className={cn(
											"size-4 shrink-0 transition-colors",
											isPluginPagesActive ? "text-sidebar-primary" : "text-muted-foreground",
										)}
									/>
									<span className="truncate">{m.admin_live_plugin_pages_tooltip()}</span>
									<SidebarMenuBadge className="ml-auto bg-sidebar-accent font-mono text-[10px] text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden">
										{activePluginsWithViewsCount}
									</SidebarMenuBadge>
									<ChevronRight className="ml-1 size-4 shrink-0 transition-transform duration-200 data-panel-open:rotate-90 group-data-[collapsible=icon]:hidden group-data-open/collapsible:rotate-90" />
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										{filteredPluginPages.map((plugin) => {
											const href = `/admin/plugins/pages/${encodeURIComponent(plugin.id)}`;
											const isActive = pathname === href || pathname.startsWith(`/admin/plugins/pages/${encodeURIComponent(plugin.id)}`);

											return (
												<SidebarMenuSubItem key={plugin.id}>
													<SidebarMenuSubButton render={<Link to={href} />} isActive={isActive}>
														<Puzzle className="size-3.5 shrink-0 text-muted-foreground" />
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
