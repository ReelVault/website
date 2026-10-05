import type { SmartPlaySuggestion } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

// smartPlay rides the details-view composite — no separate suggestion fetch.
export function DetailsPlayButton({ suggestion }: { suggestion?: SmartPlaySuggestion | null }) {
	if (!suggestion) return null;

	return (
		<Button
			size="lg"
			className="h-12 w-full max-w-xs"
			nativeButton={false}
			render={<Link to="/player/$id" params={{ id: suggestion.mediaFileId }} />}
		>
			<Play className="size-5 fill-current" />
			{(suggestion.type === "continue" || suggestion.type === "next_episode") && m.common_continue()}
			{suggestion.type === "new" && m.web_watch()}
		</Button>
	);
}
