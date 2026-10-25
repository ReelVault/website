import { createFileRoute } from "@tanstack/react-router";
import { detach } from "@/lib/detach";
import { lazyRouteComponent } from "@/lib/lazy-route-component";

const DownloadsPage = lazyRouteComponent(() => import("@/pages/user/downloads/downloads-page"));

export const Route = createFileRoute("/_user/downloads")({
	loader: ({ context: { queryClient } }) => {
		detach(async () => {
			const { userDownloadsQueryOptions } = await import("@/client/hooks/use-downloads");

			await queryClient.query(userDownloadsQueryOptions());
		});
	},
	component: DownloadsPage,
});
