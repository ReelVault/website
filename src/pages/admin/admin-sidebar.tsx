import { Sidebar, SidebarRail } from "@/components/ui/sidebar";
import { AdminSidebarBody } from "./_components/sidebar/admin-sidebar-body";
import { AdminSidebarFooter } from "./_components/sidebar/admin-sidebar-footer";

export function AdminSidebar() {
	return (
		<Sidebar collapsible="icon">
			<AdminSidebarBody />
			<AdminSidebarFooter />
			<SidebarRail />
		</Sidebar>
	);
}
