import { Compass } from "lucide-react";
import { SimpleAnimation } from "@/components/simple-animation";
import { m } from "@/paraglide/messages";

export function DiscoveryHero() {
	return (
		<SimpleAnimation direction="none" duration={260}>
			<header className="max-w-3xl border-border/70 border-b pb-10 sm:pb-14">
				<p className="cinema-kicker">
					<Compass className="size-4" aria-hidden="true" />
					{m.web_discovering_catalog()}
				</p>
				<h1 className="cinema-title mt-5">{m.web_find_next_session()}</h1>
				<p className="cinema-copy mt-5">{m.web_recommended_description()}</p>
			</header>
		</SimpleAnimation>
	);
}
