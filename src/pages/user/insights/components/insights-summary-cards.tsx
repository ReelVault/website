import { Award, User } from "lucide-react";
import { m } from "@/paraglide/messages";

interface InsightsSummaryCardsProps {
	scannedTitles: number;
	topActor: { name: string; productions: number };
}

export function InsightsSummaryCards({ scannedTitles, topActor }: InsightsSummaryCardsProps) {
	return (
		<>
			<div className="col-span-1 row-span-1 flex items-center gap-6 rounded-2xl border border-border/70 bg-card/65 p-6 md:col-span-3 lg:col-span-5">
				<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-success/10 text-success">
					<Award className="size-6" />
				</div>
				<div>
					<h3 className="font-black text-4xl text-foreground tracking-tight">{scannedTitles}</h3>
					<p className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">{m.user_titles_watched()}</p>
				</div>
			</div>

			<div className="col-span-1 row-span-1 flex items-center gap-6 rounded-2xl border border-border/70 bg-primary/5 p-6 md:col-span-3 lg:col-span-7">
				<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-primary">
					<User className="size-6" />
				</div>
				<div className="flex-1">
					<div className="flex items-center justify-between">
						<h4 className="font-bold text-2xl text-foreground">{topActor.name}</h4>
						<span className="rounded-lg bg-primary/10 px-2 py-1 font-bold text-[9px] text-primary uppercase">{m.user_most_watched()}</span>
					</div>
					<p className="font-medium text-muted-foreground text-xs">{m.user_top_actor_minutes({ productions: topActor.productions })}</p>
				</div>
			</div>
		</>
	);
}
