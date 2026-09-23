import type { AdminAnalytics } from "@reelvault/sdk";
import { Award } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { m } from "@/paraglide/messages";
import { formatDate } from "@/utils/format-utils";

interface AnalyticsUserLeaderboardProps {
	leaderboard: AdminAnalytics["userLeaderboard"];
}

export function AnalyticsUserLeaderboard({ leaderboard }: AnalyticsUserLeaderboardProps) {
	return (
		<Card className="col-span-1 border-border/70 bg-card/50 lg:col-span-7">
			<CardHeader>
				<div className="flex items-center gap-2">
					<Award className="size-5 text-warning" />
					<CardTitle className="font-bold text-base">{m.admin_analytics_viewer_activity_ranking()}</CardTitle>
				</div>
				<CardDescription className="text-xs">{m.admin_analytics_top_screen_time_profiles()}</CardDescription>
			</CardHeader>
			<CardContent>
				{leaderboard.length === 0 ? (
					<p className="py-8 text-center text-muted-foreground text-xs">{m.admin_analytics_no_activity_in_period()}</p>
				) : (
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="border-border/60 text-[11px]">
									<TableHead className="w-10 text-center">{m.common_hash_symbol()}</TableHead>
									<TableHead>{m.admin_analytics_viewer_column()}</TableHead>
									<TableHead className="text-center">{m.components_search_titles_heading()}</TableHead>
									<TableHead className="text-right">{m.admin_analytics_watch_time()}</TableHead>
									<TableHead className="text-right">{m.admin_analytics_last_session()}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{leaderboard.map((user, index) => {
									const userHours = Math.floor(user.totalMinutes / 60);
									const userMins = user.totalMinutes % 60;
									const formattedUserTime = m.common_duration_hours_minutes({ hours: userHours, minutes: userMins });
									let rankLabel: ReactNode;
									if (index === 0) {
										rankLabel = <span className="text-warning">{m.admin_analytics_rank_gold()}</span>;
									} else if (index === 1) {
										rankLabel = <span className="text-slate-300">{m.admin_analytics_rank_silver()}</span>;
									} else if (index === 2) {
										rankLabel = <span className="text-warning">{m.admin_analytics_rank_bronze()}</span>;
									} else {
										rankLabel = m.common_rank_number({ index: index + 1 });
									}

									return (
										<TableRow key={user.profileId} className="border-border/40 text-xs">
											<TableCell className="text-center font-bold font-mono">{rankLabel}</TableCell>
											<TableCell>
												<div className="flex items-center gap-2.5">
													<Avatar className="size-7 border border-border/50">
														{user.profileAvatar !== null && <AvatarImage src={user.profileAvatar} alt={user.profileName} />}
														<AvatarFallback className="font-bold text-[10px] uppercase">{user.profileName.slice(0, 2)}</AvatarFallback>
													</Avatar>
													<div className="min-w-0">
														<p className="truncate font-semibold text-foreground">{user.profileName}</p>
														<p className="truncate text-[10px] text-muted-foreground">{user.userEmail}</p>
													</div>
												</div>
											</TableCell>
											<TableCell className="text-center font-mono">{user.titlesCount}</TableCell>
											<TableCell className="text-right font-bold font-mono text-primary">{formattedUserTime}</TableCell>
											<TableCell className="text-right text-[11px] text-muted-foreground">
												{user.lastWatchedAt ? formatDate(user.lastWatchedAt) : m.common_no_value()}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
