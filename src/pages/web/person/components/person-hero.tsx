import { cn } from "cn";
import { ImageDown, RefreshCw } from "lucide-react";
import { useCurrentUser } from "@/client/hooks/use-current-profile";
import { useRefreshPerson, useRefreshPersonImage } from "@/client/hooks/use-person-data";
import { SimpleAnimation } from "@/components/simple-animation";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

export function PersonHero({ personId, name }: { personId: string; name: string }) {
	const { user } = useCurrentUser();
	const isAdmin = user?.role === "admin";
	const refreshPersonMutation = useRefreshPerson();
	const refreshPersonImageMutation = useRefreshPersonImage();

	return (
		<section className="relative">
			<SimpleAnimation direction="up" className="relative z-10 space-y-4">
				<div>
					<p className="cinema-kicker">{m.web_creator_profile()}</p>
					<h1 className="cinema-title">{name}</h1>
				</div>

				{isAdmin && (
					<div className="flex flex-wrap items-center gap-2 pt-1">
						<Button
							variant="outline"
							size="sm"
							className="gap-2 rounded-lg"
							onClick={() => refreshPersonMutation.mutate(personId)}
							disabled={refreshPersonMutation.isPending}
						>
							<RefreshCw className={cn("size-3.5", refreshPersonMutation.isPending && "animate-spin")} />
							<span>{m.components_person_refresh_data()}</span>
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="gap-2 rounded-lg"
							onClick={() => refreshPersonImageMutation.mutate(personId)}
							disabled={refreshPersonImageMutation.isPending}
						>
							<ImageDown className={cn("size-3.5", refreshPersonImageMutation.isPending && "animate-spin")} />
							<span>{m.components_person_force_photo()}</span>
						</Button>
					</div>
				)}
			</SimpleAnimation>
			<span className="pointer-events-none absolute -top-10 -left-4 select-none font-black text-[15rem] text-foreground/2 leading-none">
				{m.web_person_profile_watermark()}
			</span>
		</section>
	);
}
