import { cn } from "cn";
import { ChevronDown } from "lucide-react";
import { useDiscovery } from "@/client/hooks/use-discovery";
import { SimpleAnimation } from "@/components/simple-animation";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { getMetadataBackdrop } from "@/utils/metadata-utils";
import { useHeroRotator } from "../hooks/use-hero-rotator";
import { DashboardHeroBackdrop } from "./dashboard-hero-backdrop";
import { DashboardHeroInfo } from "./dashboard-hero-info";
import { DashboardHeroSkeleton } from "./dashboard-hero-skeleton";

export default function DashboardHero() {
	const { discoverQuery, discoverView } = useDiscovery();
	const recommendations = discoverView?.recommendations ?? [];

	const trending = discoverView?.trending ?? [];
	const items = (recommendations.length > 0 ? recommendations : trending).slice(0, 5);
	const { current, goTo } = useHeroRotator({ length: items.length });

	if (discoverQuery.isPending) {
		return (
			<section className="relative h-[88svh] overflow-hidden lg:h-screen lg:min-h-150">
				<DashboardHeroSkeleton />
			</section>
		);
	}

	if (discoverQuery.isError) {
		return (
			<section className="relative h-[88svh] overflow-hidden lg:h-screen lg:min-h-150">
				<div className="flex h-full flex-col items-center justify-center gap-3 text-center">
					<p className="text-destructive">{m.web_recommendations_fetch_failed_short()}</p>
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							detach(discoverQuery.refetch());
						}}
					>
						{m.common_try_again()}
					</Button>
				</div>
			</section>
		);
	}

	if (items.length === 0) return null;

	const activeItem = items[current];
	if (!activeItem) return null;

	return (
		<section className="relative h-[88svh] overflow-hidden bg-background lg:h-screen lg:min-h-150">
			{/* Backdrops: crossfade, no remount */}
			<div className="absolute inset-0">
				{items.map((item, index) => {
					const backdrop = getMetadataBackdrop(item);

					return (
						<DashboardHeroBackdrop
							key={item.id}
							fileId={backdrop?.id}
							cacheKey={backdrop?.updatedAt}
							alt={item.title}
							isActive={index === current}
							priority={index === 0}
						/>
					);
				})}
			</div>

			{/* Overlays: rendered once, independent of the slide */}
			<div className="absolute inset-0 bg-linear-to-r from-background via-background/80 to-background/20" />
			<div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />

			{/* Info: active item only */}
			<div className="flex h-full items-center justify-start gap-12 px-6 pb-20 lg:px-24 lg:pb-0">
				{items.length > 1 && (
					<div className="z-50 hidden items-center justify-between gap-2 lg:flex">
						<div className="flex flex-col items-center gap-2">
							{items.map((item, index) => (
								<Button
									key={item.id}
									type="button"
									variant="ghost"
									size="icon-lg"
									onClick={() => goTo(index)}
									className="my-2 size-11 w-fit"
									aria-label={m.web_show_slide({ index1: index + 1 })}
									aria-pressed={index === current}
								>
									<span
										className={cn("h-12 w-2 rounded-full transition-[background-color]", {
											"bg-muted-foreground/10": index !== current,
											"bg-primary": index === current,
										})}
									/>
								</Button>
							))}
						</div>
					</div>
				)}

				<DashboardHeroInfo key={activeItem.id} metadata={activeItem} />
			</div>

			{/* Slide indicators — mobile/tablet: a horizontal row at the bottom */}
			{items.length > 1 && (
				<div className="absolute inset-x-0 bottom-5 z-50 flex justify-center gap-1 lg:hidden">
					{items.map((item, index) => (
						<Button
							key={item.id}
							type="button"
							variant="ghost"
							size="icon-lg"
							onClick={() => goTo(index)}
							className="size-11 w-fit"
							aria-label={m.web_show_slide({ index1: index + 1 })}
							aria-pressed={index === current}
						>
							<span
								className={cn("h-1.5 w-8 rounded-full transition-[background-color]", {
									"bg-muted-foreground/30": index !== current,
									"bg-primary": index === current,
								})}
							/>
						</Button>
					))}
				</div>
			)}

			<SimpleAnimation delay={1000} className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 lg:block">
				<button
					type="button"
					onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
					className="cursor-pointer rounded-md px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary"
				>
					<div className="flex flex-col items-center gap-2">
						<span className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">{m.web_discover_more()}</span>
						<ChevronDown className="size-5 animate-bounce text-muted-foreground" />
					</div>
				</button>
			</SimpleAnimation>
		</section>
	);
}
