import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { useHiddenPages } from "@/client/hooks/use-profiles";
import { m } from "@/paraglide/messages";
import { filterHiddenPages } from "@/utils/hidden-pages";
import { USER_NAV_ITEMS } from "./user-sidebar-items";

interface UserSidebarNavProps {
	pathname: string;
	unreadCount: number;
}

export function UserSidebarNav({ pathname, unreadCount }: UserSidebarNavProps) {
	const hiddenPages = useHiddenPages();
	const navItems = filterHiddenPages(USER_NAV_ITEMS, hiddenPages);

	return (
		<nav
			className="flex flex-1 items-center justify-around gap-1 lg:flex-col lg:items-stretch lg:justify-start"
			aria-label={m.user_panel_heading()}
		>
			<p className="text-muted-foreground mb-2 hidden px-3 text-xs font-semibold lg:block">{m.user_your_space()}</p>
			{navItems.map(({ label, href, icon: Icon }) => {
				const active = pathname === href;
				const badge = href === "/notifications" ? unreadCount : 0;

				return (
					<Link
						key={href}
						to={href}
						aria-current={active ? "page" : undefined}
						className={cn(
							"group text-muted-foreground hover:bg-muted/60 hover:text-foreground relative flex min-h-10 items-center justify-center gap-3 rounded-xl px-3 py-2.5 transition-colors lg:justify-start",
							active && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
						)}
					>
						<Icon className="size-4.5" aria-hidden="true" />
						<span className="hidden text-sm font-medium lg:block">{label}</span>
						{badge > 0 && (
							<span className="bg-primary text-primary-foreground absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-xs font-bold lg:static lg:ml-auto">
								{badge > 9 ? "9+" : badge}
							</span>
						)}
					</Link>
				);
			})}
		</nav>
	);
}
