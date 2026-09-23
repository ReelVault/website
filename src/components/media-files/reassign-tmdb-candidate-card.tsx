import { Calendar, Check, Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { m } from "@/paraglide/messages";

interface ReassignTmdbCandidateCardProps {
	candidate: {
		providerId: string;
		externalId: string;
		title: string;
		releaseDate?: string | null;
		posterPath?: string | null;
	};
	isReassigning: boolean;
	onApply: (providerId: string, externalId: string) => void;
}

export function ReassignTmdbCandidateCard({ candidate, isReassigning, onApply }: ReassignTmdbCandidateCardProps) {
	const releaseYear = candidate.releaseDate ? candidate.releaseDate.slice(0, 4) : null;

	return (
		<div className="group relative flex gap-3.5 rounded-xl border border-border bg-card p-3 shadow-xs transition-[border-color,background-color,color,box-shadow] hover:border-primary/50 hover:shadow-md">
			<div className="relative aspect-2/3 w-16 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
				{candidate.posterPath ? (
					<Image src={candidate.posterPath} alt={candidate.title} fill unoptimized className="object-cover" loading="lazy" />
				) : (
					<div className="flex size-full items-center justify-center text-muted-foreground">
						<Film className="size-6" />
					</div>
				)}
			</div>

			<div className="flex flex-1 flex-col justify-between py-0.5">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<Badge variant="outline" className="text-[10px] uppercase">
							{candidate.providerId}
						</Badge>
						{releaseYear !== null && (
							<span className="flex items-center gap-1 font-medium text-muted-foreground text-xs">
								<Calendar className="size-3" />
								{releaseYear}
							</span>
						)}
					</div>
					<h4 className="line-clamp-2 font-semibold text-foreground text-sm leading-snug">{candidate.title}</h4>
					<p className="font-mono text-[11px] text-muted-foreground/80">{m.common_id_label({ id: candidate.externalId })}</p>
				</div>

				<div className="pt-2">
					<Button
						type="button"
						size="sm"
						disabled={isReassigning}
						onClick={() => onApply(candidate.providerId, candidate.externalId)}
						className="w-full gap-1.5 rounded-lg text-xs"
					>
						<Check className="size-3.5" />
						{m.common_assign_this_title()}
					</Button>
				</div>
			</div>
		</div>
	);
}
