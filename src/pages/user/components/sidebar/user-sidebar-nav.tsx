import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { m } from "@/paraglide/messages";
import { USER_NAV_ITEMS } from "./user-sidebar-items";

interface UserSidebarNavProps {
	pathname: string;
	unreadCount: number;
}

export function UserSidebarNav({ pathname, unreadCount }: UserSidebarNavProps) {
	return (
		<nav
			className="flex flex-1 items-center justify-around gap-1 lg:flex-col lg:items-stretch lg:justify-start"
			aria-label={m.user_panel_heading()}
		>
			<p className="mb-2 hidden px-3 font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.18em] lg:block">
				{m.user_your_space()}
			</p>
			{USER_NAV_ITEMS.map(({ label, href, icon: Icon }) => {
				const active = pathname === href;
				const badge = href === "/notifications" ? unreadCount : 0;

				return (
					<Link
						key={href}
						to={href}
						aria-current={active ? "page" : undefined}
						className={cn(
							"group relative flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground lg:justify-start",
							active && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
						)}
					>
						<Icon className="size-4.5" aria-hidden="true" />
						<span className="hidden font-medium text-sm lg:block">{label}</span>
						{badge > 0 && (
							<span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary font-bold text-[9px] text-primary-foreground lg:static lg:ml-auto">
								{badge > 9 ? "9+" : badge}
							</span>
						)}
					</Link>
				);
			})}
		</nav>
	);
}
