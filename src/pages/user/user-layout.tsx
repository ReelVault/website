import { useLocation } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/require-auth";
import { usePageTitle } from "@/hooks/use-page-title";
import { USER_NAV_ITEMS } from "./components/sidebar/user-sidebar-items";
import { UserSidebar } from "./components/user-sidebar";

export default function UserLayout({ children }: { children: React.ReactNode }) {
	const { pathname } = useLocation();
	const activeItem = USER_NAV_ITEMS.find((item) => pathname === item.href);
	usePageTitle(activeItem?.label);

	return (
		<RequireAuth requireProfile>
			<div className="min-h-screen bg-background">
				<UserSidebar />
				<div className="min-h-screen lg:pl-64">
					<div className="cinema-page">
						<div className="cinema-shell relative">{children}</div>
					</div>
				</div>
			</div>
		</RequireAuth>
	);
}
