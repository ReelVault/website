import { Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useUserDownloads } from "@/client/hooks/use-downloads";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

/** Shown while downloads are running: their count and average progress, linking to the downloads page. */
export function NavbarDownloadsIndicator() {
	const { data: jobs = [] } = useUserDownloads();
	const active = jobs.filter((job) => job.status === "pending" || job.status === "processing");
	if (active.length === 0) return null;

	const averagePercent = Math.round(active.reduce((sum, job) => sum + job.progressPercent, 0) / active.length);

	return (
		<Button
			variant="ghost"
			size="icon-lg"
			nativeButton={false}
			render={<Link to="/downloads" />}
			aria-label={m.components_navbar_downloads_in_progress({ count: active.length, percent: averagePercent })}
			title={m.components_navbar_downloads_in_progress({ count: active.length, percent: averagePercent })}
			className="relative"
		>
			<Download data-icon="inline-start" aria-hidden="true" />
			<span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded bg-primary px-1 font-semibold text-[9px] text-primary-foreground tabular-nums">
				{m.common_percent_value({ value: averagePercent })}
			</span>
		</Button>
	);
}
