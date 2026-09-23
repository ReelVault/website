import { History, Trash2 } from "lucide-react";
import { useWatchedHistory } from "@/client/hooks/use-watched-history";
import { AppErrorState } from "@/components/app-states";
import { ConfirmAction } from "@/components/confirm-action";
import { LazyRender } from "@/components/lazy-render";
import { SimpleAnimation } from "@/components/simple-animation";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { UserPageHeader, UserSectionTitle, UserSurface } from "../components/user-ui";
import { HistoryCard } from "./components/history-card";
import { HistorySkeleton } from "./components/history-skeleton";

export default function HistoryPage() {
	const { history, isLoading, error, refetch, clearHistory, isClearing } = useWatchedHistory();

	if (isLoading) return <HistorySkeleton />;

	if (error) {
		return (
			<main className="flex flex-col gap-10 pb-10">
				<UserPageHeader eyebrow={m.user_your_space()} title={m.user_history_heading()} description={m.user_back_to_sessions()} />
				<AppErrorState
					title={m.user_history_fetch_failed()}
					description={m.web_check_connection()}
					error={error}
					onRetry={() => detach(refetch())}
				/>
			</main>
		);
	}

	return (
		<main className="flex flex-col gap-10 pb-10">
			<UserPageHeader
				eyebrow={m.user_your_space()}
				title={m.user_history_heading()}
				description={m.user_back_to_sessions()}
				action={
					history.length > 0 && (
						<ConfirmAction
							trigger={
								<Button type="button" variant="outline" className="min-h-11 gap-2" disabled={isClearing}>
									<Trash2 className="size-4" aria-hidden="true" /> {m.admin_worker_clear_history()}
								</Button>
							}
							title={m.user_clear_watch_history()}
							description={m.user_history_entries_deleted_notice()}
							confirmLabel={m.admin_worker_clear_history()}
							onConfirm={() => clearHistory()}
						/>
					)
				}
			/>

			{history.length === 0 ? (
				<UserSurface className="flex min-h-[40vh] flex-col items-center justify-center text-center">
					<div className="rounded-full p-12 text-foreground/10">
						<History className="size-20 text-muted-foreground/30" />
					</div>
					<div className="flex flex-col gap-2">
						<h2 className="font-bold text-2xl tracking-tight">{m.user_history_empty_heading()}</h2>
						<p className="max-w-md text-muted-foreground text-sm leading-relaxed">{m.user_history_empty_desc()}</p>
					</div>
				</UserSurface>
			) : (
				<section>
					<UserSectionTitle title={m.user_last_watch()} description={m.user_history_count({ count: history.length })} />
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
						{history.map((item, index) => (
							<LazyRender key={item.id} minHeight={176} rootMargin="350px 0px">
								{() => (
									<SimpleAnimation direction="up" delay={Math.min(index * 35, 280)}>
										<HistoryCard item={item} />
									</SimpleAnimation>
								)}
							</LazyRender>
						))}
					</div>
				</section>
			)}
		</main>
	);
}
