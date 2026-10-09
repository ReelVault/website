import { Link } from "@tanstack/react-router";
import { Film } from "lucide-react";
import { useIsAdmin } from "@/client/hooks/use-current-profile";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

/** Shown when the dashboard has nothing to feature: admins are sent to add a library, everyone else can retry. */
export function DashboardHeroEmpty({ onRetry }: { onRetry: () => Promise<unknown> }) {
	const isAdmin = useIsAdmin();

	return (
		<section className="relative flex h-[88svh] items-center justify-center overflow-hidden bg-background px-6 lg:h-screen lg:min-h-150">
			<div className="flex max-w-md flex-col items-center gap-4 text-center">
				<Film className="size-10 text-primary" aria-hidden="true" />
				<h2 className="font-black text-2xl tracking-tight">{m.web_dashboard_empty_title()}</h2>
				<p className="text-muted-foreground text-sm">
					{isAdmin ? m.web_dashboard_empty_admin_description() : m.web_dashboard_empty_description()}
				</p>
				{isAdmin ? (
					<Button nativeButton={false} render={<Link to="/admin/libraries" />}>
						{m.admin_libraries_add_first_library()}
					</Button>
				) : (
					<Button type="button" variant="outline" onClick={() => detach(onRetry())}>
						{m.common_try_again()}
					</Button>
				)}
			</div>
		</section>
	);
}
