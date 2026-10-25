import { Film } from "lucide-react";
import { m } from "@/paraglide/messages";

export function DiscoveryEmpty() {
	return (
		<div className="cinema-surface mt-10 max-w-xl p-8 text-center">
			<Film className="text-primary mx-auto size-7" />
			<h2 className="mt-4 text-xl font-bold">{m.web_catalog_still_empty()}</h2>
			<p className="text-muted-foreground mt-2 text-sm">{m.web_add_media_hint()}</p>
		</div>
	);
}
