import type { AdminAnalytics } from "@reelvault/sdk";
import { CheckCircle2 } from "lucide-react";
import { ResponsiveDataList } from "@/components/responsive-data-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatDateTime } from "@/utils/format-utils";

type RecentPlay = AdminAnalytics["recentPlays"][number];

interface AnalyticsRecentStreamsProps {
	recentPlays: AdminAnalytics["recentPlays"];
}

function PlayStatus({ play }: { play: RecentPlay }) {
	if (!play.isFullWatch) {
		return <span className="text-muted-foreground text-xs">{m.admin_analytics_status_interrupted()}</span>;
	}

	return (
		<Badge variant="success">
			<CheckCircle2 className="mr-1 size-3" />
			{m.admin_worker_finished_word()}
		</Badge>
	);
}

function RecentPlayCard({ play }: { play: RecentPlay }) {
	const mediaTypeLabel = play.mediaType === "movie" ? m.common_movie_word() : m.common_series_word();
	const durationLabel = play.durationWatched ? `${play.durationWatched} min` : "—";

	return (
		<div className="border-border/50 bg-background/40 flex flex-col gap-3 rounded-xl border p-4">
			<div className="flex items-start justify-between gap-3">
				<p className="text-foreground min-w-0 text-sm font-semibold break-words">{play.title}</p>
				<Badge variant="outline" className="shrink-0">
					{mediaTypeLabel}
				</Badge>
			</div>
			<p className="text-xs">
				<span className="text-foreground font-medium">{play.profileName}</span>{" "}
				<span className="text-muted-foreground">{m.admin_analytics_profile_user({ user: play.userName })}</span>
			</p>
			<dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
				<div className="flex flex-col gap-0.5">
					<dt className="text-muted-foreground">{m.admin_analytics_watched()}</dt>
					<dd className="font-mono">{durationLabel}</dd>
				</div>
				<div className="flex flex-col gap-0.5">
					<dt className="text-muted-foreground">{m.common_status()}</dt>
					<dd>
						<PlayStatus play={play} />
					</dd>
				</div>
			</dl>
			<p className="text-muted-foreground text-xs">{formatDateTime(play.watchedAt)}</p>
		</div>
	);
}

export function AnalyticsRecentStreams({ recentPlays }: AnalyticsRecentStreamsProps) {
	return (
		<AdminSection title={m.admin_analytics_recent_streams_section()}>
			<Card variant="subtle">
				<CardContent className="p-0">
					{recentPlays.length === 0 ? (
						<p className="text-muted-foreground py-8 text-center text-xs">{m.admin_analytics_no_plays()}</p>
					) : (
						<ResponsiveDataList
							className="p-3 sm:p-0"
							items={recentPlays}
							getKey={(play) => play.id}
							renderTable={(items) => (
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>{m.admin_analytics_title_column()}</TableHead>
												<TableHead>{m.common_type_word()}</TableHead>
												<TableHead>{m.user_profile_page_title()}</TableHead>
												<TableHead className="text-right">{m.admin_analytics_watched()}</TableHead>
												<TableHead className="text-center">{m.common_status()}</TableHead>
												<TableHead className="text-right">{m.admin_analytics_recent_streams()}</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{items.map((play) => (
												<TableRow key={play.id}>
													<TableCell>{play.title}</TableCell>
													<TableCell>
														<Badge variant="outline">{play.mediaType === "movie" ? m.common_movie_word() : m.common_series_word()}</Badge>
													</TableCell>
													<TableCell>
														<span className="text-foreground font-medium">{play.profileName}</span>
														<span className="text-muted-foreground ml-1.5 text-xs">
															{m.admin_analytics_profile_user({ user: play.userName })}
														</span>
													</TableCell>
													<TableCell tone="mono" size="sm" className="text-right">
														{play.durationWatched ? `${play.durationWatched} min` : "—"}
													</TableCell>
													<TableCell className="text-center">
														<PlayStatus play={play} />
													</TableCell>
													<TableCell tone="muted" size="sm" className="text-right">
														{formatDateTime(play.watchedAt)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
							renderCard={(play) => <RecentPlayCard play={play} />}
						/>
					)}
				</CardContent>
			</Card>
		</AdminSection>
	);
}
