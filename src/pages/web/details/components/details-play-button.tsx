import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { usePlaybackSuggestion } from "@/client/hooks/use-me-playback";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

export function DetailsPlayButton({ metadataId }: { metadataId: string }) {
	const { data: streamData } = usePlaybackSuggestion(metadataId);
	const suggestion = streamData?.suggestion;

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
