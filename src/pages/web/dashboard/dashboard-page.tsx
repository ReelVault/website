import { LazyRender } from "@/components/lazy-render";
import { usePageTitle } from "@/hooks/use-page-title";
import { m } from "@/paraglide/messages";
import { PluginSlotHost } from "@/plugin-host/slot-host";
import DashboardContinueWatching from "./sections/dashboard-continue-watching";
import DashboardHero from "./sections/dashboard-hero";
import DashboardLastAdded from "./sections/dashboard-last-added";
import DashboardPopular from "./sections/dashboard-popular";
import DashboardRecommendations from "./sections/dashboard-recommendations";

export default function DashboardPage() {
	usePageTitle(m.navbar_dashboard());

	return (
		<div className="relative min-h-screen w-full overflow-x-hidden bg-background">
			<DashboardHero />

			<main className="relative space-y-16 px-6 pt-12 pb-24 sm:px-10 lg:space-y-24 lg:px-24">
				<LazyRender minHeight={240} rootMargin="400px 0px">
					{() => <DashboardContinueWatching />}
				</LazyRender>
				<LazyRender minHeight={380} rootMargin="400px 0px">
					{() => <DashboardRecommendations />}
				</LazyRender>
				<LazyRender minHeight={380} rootMargin="400px 0px">
					{() => <DashboardPopular />}
				</LazyRender>
				<LazyRender minHeight={380} rootMargin="400px 0px">
					{() => <DashboardLastAdded />}
				</LazyRender>
				{/* Plugin-contributed rows (e.g. media-requests "Coming soon") — after the native shelves. */}
				<LazyRender minHeight={380} rootMargin="800px 0px">
					{() => <PluginSlotHost name="dashboard-section" />}
				</LazyRender>
			</main>
		</div>
	);
}
