import { Award, User } from "lucide-react";
import { m } from "@/paraglide/messages";

interface InsightsSummaryCardsProps {
	scannedTitles: number;
	topActor: { name: string; productions: number };
}

export function InsightsSummaryCards({ scannedTitles, topActor }: InsightsSummaryCardsProps) {
	return (
		<>
			<div className="border-border/70 bg-card/65 col-span-1 row-span-1 flex items-center gap-6 rounded-2xl border p-6 md:col-span-3 lg:col-span-5">
				<div className="bg-success/10 text-success flex size-14 shrink-0 items-center justify-center rounded-2xl">
					<Award className="size-6" />
				</div>
				<div>
					<h3 className="text-foreground text-4xl font-black tracking-tight">{scannedTitles}</h3>
					<p className="text-muted-foreground text-xs font-bold">{m.user_titles_watched()}</p>
				</div>
			</div>

			<div className="border-border/70 bg-primary/5 col-span-1 row-span-1 flex items-center gap-6 rounded-2xl border p-6 md:col-span-3 lg:col-span-7">
				<div className="bg-muted text-primary flex size-14 shrink-0 items-center justify-center rounded-2xl">
					<User className="size-6" />
				</div>
				<div className="flex-1">
					<div className="flex items-center justify-between">
						<h4 className="text-foreground text-2xl font-bold">{topActor.name}</h4>
						<span className="bg-primary/10 text-primary rounded-lg px-2 py-1 text-xs font-bold">{m.user_most_watched()}</span>
					</div>
					<p className="text-muted-foreground text-xs font-medium">{m.user_top_actor_minutes({ productions: topActor.productions })}</p>
				</div>
			</div>
		</>
	);
}
