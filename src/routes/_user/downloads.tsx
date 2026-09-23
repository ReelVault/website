import { createFileRoute } from "@tanstack/react-router";
import { userDownloadsQueryOptions } from "@/client/hooks/use-downloads";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const DownloadsPage = lazyRouteComponent(() => import("@/pages/user/downloads/downloads-page"));

export const Route = createFileRoute("/_user/downloads")({
	loader: ({ context: { queryClient } }) => {
		detach(queryClient.query(userDownloadsQueryOptions()));
	},
	component: DownloadsPage,
});
