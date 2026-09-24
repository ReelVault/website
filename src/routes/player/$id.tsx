import { createFileRoute } from "@tanstack/react-router";
import { mediaFileQueryOptions } from "@/client/hooks/use-media";
import { playbackViewQueryOptions } from "@/client/hooks/use-playback-session";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";
import { coerceSearchBoolean } from "@/types/search-params";
import { ensureAuthenticated } from "../-auth-guard";

const PlayerLayout = lazyRouteComponent(async () => {
	const mod = await import("@/pages/player/player-layout");

	return { default: mod.PlayerLayout };
});

// zod-free validateSearch — see src/types/search-params.ts for the rationale.
// Booleans arrive as plain URL strings, so coerce the canonical spellings.
interface PlayerSearch {
	collection?: boolean;
	collectionId?: string;
}

function playerSearchValidator(search: Record<string, unknown>): PlayerSearch {
	return {
		collection: coerceSearchBoolean(search.collection),
		collectionId: typeof search.collectionId === "string" ? search.collectionId : undefined,
	};
}

export const Route = createFileRoute("/player/$id")({
	beforeLoad: async ({ context, params }) => {
		await ensureAuthenticated(context);
		// Playback start is the most latency-sensitive navigation in the app —
		// kick off the gating fetches while the chunk is still downloading.
		if (!params.id) return;

		detach(context.queryClient.query(mediaFileQueryOptions(params.id)));
		detach(context.queryClient.query(playbackViewQueryOptions(params.id)));
	},
	component: PlayerLayout,
	validateSearch: playerSearchValidator,
});
