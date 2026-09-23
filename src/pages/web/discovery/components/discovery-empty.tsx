import { Film } from "lucide-react";
import { m } from "@/paraglide/messages";

export function DiscoveryEmpty() {
	return (
		<div className="cinema-surface mt-10 max-w-xl p-8 text-center">
			<Film className="mx-auto size-7 text-primary" />
			<h2 className="mt-4 font-bold text-xl">{m.web_catalog_still_empty()}</h2>
			<p className="mt-2 text-muted-foreground text-sm">{m.web_add_media_hint()}</p>
		</div>
	);
}
