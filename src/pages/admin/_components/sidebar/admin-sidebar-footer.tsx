import { useNavigate, useRouter as useTanStackRouter } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useLogout } from "@/client/hooks/use-auth";
import { AsyncButton } from "@/components/async-button";
import { ConfirmAction } from "@/components/confirm-action";
import { SidebarFooter } from "@/components/ui/sidebar";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";

const handleLogoutError = () => {
	toast.error(m.components_navbar_logout_failed());
};

export function AdminSidebarFooter() {
	const navigate = useNavigate();
	const router = useTanStackRouter();
	const logoutMutation = useLogout();

	const handleLogout = async () => {
		await logoutMutation.mutateAsync();
		await navigate({ to: "/auth/login", replace: true });
		await router.invalidate();
	};

	return (
		<SidebarFooter className="gap-3 border-border border-t p-4">
			<div className="flex items-center gap-3 px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
				<div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary/15 font-bold text-[11px] text-sidebar-primary">
					{m.admin_sidebar_user_initials()}
				</div>
				<div className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
					<span className="font-bold text-[12px] text-foreground">{m.admin_users_role_admin()}</span>
					<span className="truncate font-medium text-[10px] text-muted-foreground">{m.admin_sidebar_system_role()}</span>
				</div>
			</div>

			<ConfirmAction
				trigger={
					<AsyncButton
						type="button"
						variant="ghost"
						size="sm"
						className="w-full justify-start gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
						isPending={logoutMutation.isPending}
					>
						<LogOut className="size-4 shrink-0" />
						<span className="group-data-[collapsible=icon]:hidden">{m.auth_logout()}</span>
					</AsyncButton>
				}
				title={m.admin_logout_admin_confirm()}
				description={m.admin_current_session_terminated_notice()}
				confirmLabel={m.auth_logout()}
				onConfirm={handleLogout}
				onError={handleLogoutError}
			/>
		</SidebarFooter>
	);
}
