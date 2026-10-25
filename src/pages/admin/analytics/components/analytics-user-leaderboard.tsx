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
		<div className="border-border/50 bg-background/40 flex flex-col gap-3 rounded-xl border p-4">
			<div className="flex items-center justify-between gap-3">
				<div className="flex min-w-0 items-center gap-2.5">
					<Avatar className="size-9">
						{user.profileAvatar !== null && <AvatarImage src={user.profileAvatar} alt={user.profileName} />}
						<AvatarFallback>{user.profileName.slice(0, 2)}</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<p className="text-foreground truncate text-sm font-semibold">{user.profileName}</p>
						<p className="text-muted-foreground truncate text-xs">{user.userEmail}</p>
					</div>
				</div>
				<span className="shrink-0 font-mono text-xs font-bold">{getRankLabel(index)}</span>
			</div>
			<dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-xs">
				<div className="flex flex-col gap-0.5">
					<dt className="text-muted-foreground">{m.components_search_titles_heading()}</dt>
					<dd className="font-mono">{user.titlesCount}</dd>
				</div>
				<div className="flex flex-col gap-0.5">
					<dt className="text-muted-foreground">{m.admin_analytics_watch_time()}</dt>
					<dd className="text-primary font-mono font-bold">{formatWatchTime(user.totalMinutes)}</dd>
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
		<Card variant="subtle" className="col-span-1 lg:col-span-7">
			<CardHeader>
				<div className="flex items-center gap-2">
					<Award className="text-warning size-5" />
					<CardTitle>{m.admin_analytics_viewer_activity_ranking()}</CardTitle>
				</div>
				<CardDescription size="xs">{m.admin_analytics_top_screen_time_profiles()}</CardDescription>
			</CardHeader>
			<CardContent>
				{leaderboard.length === 0 ? (
					<p className="text-muted-foreground py-8 text-center text-xs">{m.admin_analytics_no_activity_in_period()}</p>
				) : (
					<ResponsiveDataList
						items={rankedEntries}
						getKey={({ user }) => user.profileId}
						renderTable={(items) => (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-10 text-center">{m.common_hash_symbol()}</TableHead>
											<TableHead>{m.admin_analytics_viewer_column()}</TableHead>
											<TableHead className="text-center">{m.components_search_titles_heading()}</TableHead>
											<TableHead className="text-right">{m.admin_analytics_watch_time()}</TableHead>
											<TableHead className="text-right">{m.admin_analytics_last_session()}</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{items.map(({ user, index }) => (
											<TableRow key={user.profileId}>
												<TableCell tone="mono" className="text-center">
													{getRankLabel(index)}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2.5">
														<Avatar className="size-7">
															{user.profileAvatar !== null && <AvatarImage src={user.profileAvatar} alt={user.profileName} />}
															<AvatarFallback>{user.profileName.slice(0, 2)}</AvatarFallback>
														</Avatar>
														<div className="min-w-0">
															<p className="text-foreground truncate font-semibold">{user.profileName}</p>
															<p className="text-muted-foreground truncate text-xs">{user.userEmail}</p>
														</div>
													</div>
												</TableCell>
												<TableCell tone="mono" className="text-center">
													{user.titlesCount}
												</TableCell>
												<TableCell tone="mono" className="text-right">
													{formatWatchTime(user.totalMinutes)}
												</TableCell>
												<TableCell tone="muted" size="sm" className="text-right">
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
