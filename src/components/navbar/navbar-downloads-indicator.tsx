import { Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useUserDownloads } from "@/client/hooks/use-downloads";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

/** Shown while downloads run or wait: the running and waiting counts, the average progress of the running ones, linking to the downloads page. */
export function NavbarDownloadsIndicator() {
	const { data: jobs = [] } = useUserDownloads();
	const running = jobs.filter((job) => job.status === "processing");
	const waiting = jobs.filter((job) => job.status === "pending");
	const activeCount = running.length + waiting.length;
	if (activeCount === 0) return null;

	const averagePercent = running.length > 0 ? Math.round(running.reduce((sum, job) => sum + job.progressPercent, 0) / running.length) : 0;
	const inProgress = m.components_navbar_downloads_in_progress({ count: activeCount, percent: averagePercent });
	const summary = waiting.length > 0 ? `${inProgress} · ${m.components_navbar_downloads_waiting({ count: waiting.length })}` : inProgress;

	return (
		<Button
			variant="ghost"
			size="icon-lg"
			nativeButton={false}
			render={<Link to="/downloads" />}
			aria-label={summary}
			title={summary}
			className="relative"
		>
			<Download data-icon="inline-start" aria-hidden="true" />
			<span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded bg-primary px-1 font-semibold text-primary-foreground text-xs tabular-nums">
				{m.common_percent_value({ value: averagePercent })}
			</span>
		</Button>
	);
}
