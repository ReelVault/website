import type { AdminAnalytics } from "@reelvault/sdk";
import { Award } from "lucide-react";
import type { ReactNode } from "react";
import { ResponsiveDataList } from "@/components/responsive-data-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { m } from "@/paraglide/messages";
import { formatDate } from "@/utils/format-utils";

type LeaderboardEntry = AdminAnalytics["userLeaderboard"][number];

interface AnalyticsUserLeaderboardProps {
	leaderboard: AdminAnalytics["userLeaderboard"];
}

interface RankedEntry {
	user: LeaderboardEntry;
	index: number;
}

function getRankLabel(index: number): ReactNode {
	if (index === 0) {
		return <span className="text-warning">{m.admin_analytics_rank_gold()}</span>;
	}
	if (index === 1) {
		return <span className="text-slate-300">{m.admin_analytics_rank_silver()}</span>;
	}
	if (index === 2) {
		return <span className="text-warning">{m.admin_analytics_rank_bronze()}</span>;
	}
	return m.common_rank_number({ index: index + 1 });
}

function formatWatchTime(totalMinutes: number) {
	return m.common_duration_hours_minutes({ hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 });
}

function LeaderboardCard({ user, index }: RankedEntry) {
	return (
		<div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-background/40 p-4">
			<div className="flex items-center justify-between gap-3">
				<div className="flex min-w-0 items-center gap-2.5">
					<Avatar className="size-9 border border-border/50">
						{user.profileAvatar !== null && <AvatarImage src={user.profileAvatar} alt={user.profileName} />}
						<AvatarFallback className="font-bold text-xs">{user.profileName.slice(0, 2)}</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<p className="truncate font-semibold text-foreground text-sm">{user.profileName}</p>
						<p className="truncate text-muted-foreground text-xs">{user.userEmail}</p>
					</div>
				</div>
				<span className="shrink-0 font-bold font-mono text-xs">{getRankLabel(index)}</span>
			</div>
			<dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-xs">
				<div className="flex flex-col gap-0.5">
					<dt className="text-muted-foreground">{m.components_search_titles_heading()}</dt>
					<dd className="font-mono">{user.titlesCount}</dd>
				</div>
				<div className="flex flex-col gap-0.5">
					<dt className="text-muted-foreground">{m.admin_analytics_watch_time()}</dt>
					<dd className="font-bold font-mono text-primary">{formatWatchTime(user.totalMinutes)}</dd>
				</div>
				<div className="flex flex-col gap-0.5">
					<dt className="text-muted-foreground">{m.admin_analytics_last_session()}</dt>
					<dd>{user.lastWatchedAt ? formatDate(user.lastWatchedAt) : m.common_no_value()}</dd>
				</div>
			</dl>
		</div>
	);
}

export function AnalyticsUserLeaderboard({ leaderboard }: AnalyticsUserLeaderboardProps) {
	const rankedEntries: RankedEntry[] = leaderboard.map((user, index) => ({ user, index }));

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
					<ResponsiveDataList
						items={rankedEntries}
						getKey={({ user }) => user.profileId}
						renderTable={(items) => (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow className="border-border/60 text-xs">
											<TableHead className="w-10 text-center">{m.common_hash_symbol()}</TableHead>
											<TableHead>{m.admin_analytics_viewer_column()}</TableHead>
											<TableHead className="text-center">{m.components_search_titles_heading()}</TableHead>
											<TableHead className="text-right">{m.admin_analytics_watch_time()}</TableHead>
											<TableHead className="text-right">{m.admin_analytics_last_session()}</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{items.map(({ user, index }) => (
											<TableRow key={user.profileId} className="border-border/40 text-xs">
												<TableCell className="text-center font-bold font-mono">{getRankLabel(index)}</TableCell>
												<TableCell>
													<div className="flex items-center gap-2.5">
														<Avatar className="size-7 border border-border/50">
															{user.profileAvatar !== null && <AvatarImage src={user.profileAvatar} alt={user.profileName} />}
															<AvatarFallback className="font-bold text-xs">{user.profileName.slice(0, 2)}</AvatarFallback>
														</Avatar>
														<div className="min-w-0">
															<p className="truncate font-semibold text-foreground">{user.profileName}</p>
															<p className="truncate text-muted-foreground text-xs">{user.userEmail}</p>
														</div>
													</div>
												</TableCell>
												<TableCell className="text-center font-mono">{user.titlesCount}</TableCell>
												<TableCell className="text-right font-bold font-mono text-primary">{formatWatchTime(user.totalMinutes)}</TableCell>
												<TableCell className="text-right text-muted-foreground text-xs">
													{user.lastWatchedAt ? formatDate(user.lastWatchedAt) : m.common_no_value()}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
						renderCard={(entry) => <LeaderboardCard {...entry} />}
					/>
				)}
			</CardContent>
		</Card>
	);
}
