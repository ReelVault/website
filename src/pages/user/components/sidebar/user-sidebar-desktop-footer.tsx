import { Link } from "@tanstack/react-router";
import { House, LogOut, RotateCcw } from "lucide-react";
import { ConfirmAction } from "@/components/confirm-action";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";

interface UserSidebarDesktopFooterProps {
	onLogout: () => Promise<void>;
}

export function UserSidebarDesktopFooter({ onLogout }: UserSidebarDesktopFooterProps) {
	return (
		<div className="hidden flex-col gap-1 border-border/60 border-t pt-4 lg:flex">
			<Link
				to="/auth/profiles"
				className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground text-sm transition-colors hover:bg-muted/60 hover:text-foreground"
			>
				<RotateCcw className="size-4.5" />
				{m.user_switch_profile()}
			</Link>
			<Link
				to="/"
				className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground text-sm transition-colors hover:bg-muted/60 hover:text-foreground"
			>
				<House className="size-4.5" />
				{m.user_back_to_service()}
			</Link>
			<ConfirmAction
				title={m.user_logout_profile()}
				description={m.user_current_session_terminated()}
				confirmLabel={m.components_navbar_log_out()}
				onConfirm={onLogout}
				onError={() => toast.error(m.components_navbar_logout_failed())}
				className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground text-sm transition-colors hover:bg-destructive/30 hover:text-destructive"
			>
				<LogOut className="size-4.5" />
				{m.components_navbar_log_out()}
			</ConfirmAction>
		</div>
	);
}
