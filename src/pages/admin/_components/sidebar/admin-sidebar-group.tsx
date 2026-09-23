import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import type { ReactNode } from "react";
import type { useAdminStats } from "@/client/hooks/use-admin-stats";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { MenuGroup } from "./admin-sidebar-constants";

interface AdminSidebarGroupProps {
	group: MenuGroup;
	pathname: string;
	stats?: ReturnType<typeof useAdminStats>["data"];
}

export function AdminSidebarGroup({ group, pathname, stats }: AdminSidebarGroupProps) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{group.group}</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu className="gap-1">
					{group.items.map((item) => {
						const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
						const Icon = item.icon;
						let badge: ReactNode = null;
						if (item.href === "/admin/worker" && (stats?.workers?.active ?? 0) > 0) {
							badge = (
								<SidebarMenuBadge className="ml-auto bg-sidebar-primary/15 font-mono text-[10px] text-sidebar-primary group-data-[collapsible=icon]:hidden">
									{stats?.workers?.active}
								</SidebarMenuBadge>
							);
						} else if (item.href === "/admin/analytics" && (stats?.streaming.activeSessions ?? 0) > 0) {
							badge = (
								<SidebarMenuBadge className="ml-auto bg-success/15 font-mono text-[10px] text-success group-data-[collapsible=icon]:hidden">
									{stats?.streaming.activeSessions}
								</SidebarMenuBadge>
							);
						}

						return (
							<SidebarMenuItem key={item.href}>
								<SidebarMenuButton
									render={<Link to={item.href} aria-current={isActive ? "page" : undefined} />}
									isActive={isActive}
									tooltip={item.name}
									className={cn(
										"relative transition-[border-color,background-color,color,box-shadow] duration-150",
										isActive && "font-semibold",
									)}
								>
									{isActive && <div className="absolute inset-y-0 left-0 w-1 rounded-r-md bg-sidebar-primary" />}
									<Icon className={cn("size-4 shrink-0 transition-colors", isActive ? "text-sidebar-primary" : "text-muted-foreground")} />
									<span className="truncate">{item.name}</span>
									{badge}
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
