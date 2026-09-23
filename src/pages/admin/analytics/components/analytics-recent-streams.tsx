import { CheckCircle2 } from "lucide-react";
import type { AdminAnalytics } from "@reelvault/sdk";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatDateTime } from "@/utils/format-utils";

interface AnalyticsRecentStreamsProps {
	recentPlays: AdminAnalytics["recentPlays"];
}

export function AnalyticsRecentStreams({ recentPlays }: AnalyticsRecentStreamsProps) {
	return (
		<AdminSection title={m.admin_analytics_recent_streams_section()}>
			<Card className="border-border/70 bg-card/50">
				<CardContent className="p-0">
					{recentPlays.length === 0 ? (
						<p className="py-8 text-center text-muted-foreground text-xs">{m.admin_analytics_no_plays()}</p>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow className="border-border/60 text-[11px]">
										<TableHead>{m.admin_analytics_title_column()}</TableHead>
										<TableHead>{m.common_type_word()}</TableHead>
										<TableHead>{m.user_profile_page_title()}</TableHead>
										<TableHead className="text-right">{m.admin_analytics_watched()}</TableHead>
										<TableHead className="text-center">{m.common_status()}</TableHead>
										<TableHead className="text-right">{m.admin_analytics_recent_streams()}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{recentPlays.map((play) => (
										<TableRow key={play.id} className="border-border/40 text-xs">
											<TableCell className="font-semibold text-foreground">{play.title}</TableCell>
											<TableCell>
												<Badge variant="outline" className="text-[10px]">
													{play.mediaType === "movie" ? m.common_movie_word() : m.common_series_word()}
												</Badge>
											</TableCell>
											<TableCell>
												<span className="font-medium text-foreground">{play.profileName}</span>
												<span className="ml-1.5 text-[10px] text-muted-foreground">
													{m.admin_analytics_profile_user({ user: play.userName })}
												</span>
											</TableCell>
											<TableCell className="text-right font-mono text-xs">
												{play.durationWatched ? `${play.durationWatched} min` : "—"}
											</TableCell>
											<TableCell className="text-center">
												{play.isFullWatch ? (
													<Badge className="border-success/30 bg-success/10 text-[10px] text-success">
														<CheckCircle2 className="mr-1 size-3" />
														{m.admin_worker_finished_word()}
													</Badge>
												) : (
													<span className="text-muted-foreground text-xs">{m.web_watched_status_in_progress()}</span>
												)}
											</TableCell>
											<TableCell className="text-right text-[11px] text-muted-foreground">{formatDateTime(play.watchedAt)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</AdminSection>
	);
}
