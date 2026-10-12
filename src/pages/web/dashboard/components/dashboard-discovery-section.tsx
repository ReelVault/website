import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { DashboardCarousel } from "./dashboard-carousel";
import DashboardSectionTitle from "./dashboard-section-title";

interface DashboardDiscoverySectionProps {
	icon: LucideIcon;
	category: string;
	title: string;
	subtitle: string;
	items: ComponentProps<typeof DashboardCarousel>["items"];
	query: ComponentProps<typeof DashboardCarousel>["query"];
	errorTitle: string;
	errorDescription?: ReactNode;
	emptyTitle: string;
	emptyDescription: string;
}

/** A titled carousel linking to Discovery; hidden when its query settled without results. */
export function DashboardDiscoverySection({ icon, category, title, subtitle, items, query, ...copy }: DashboardDiscoverySectionProps) {
	if (!(query.isPending || query.isError) && items.length === 0) {
		return null;
	}

	return (
		<section className="flex flex-col gap-8 sm:gap-10">
			<DashboardSectionTitle icon={icon} category={category} title={title} subtitle={subtitle}>
				<Button variant="outline" nativeButton={false} render={<Link to={"/discovery"} />} className="hidden shrink-0 sm:inline-flex">
					{m.web_discover_more()}
				</Button>
			</DashboardSectionTitle>

			<DashboardCarousel items={items} query={query} {...copy} />

			<div className="pt-2 sm:hidden">
				<Button variant="outline" nativeButton={false} render={<Link to={"/discovery"} />} className="w-full">
					{m.web_discover_more()}
				</Button>
			</div>
		</section>
	);
}
