import { Calendar, Film } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { m } from "@/paraglide/messages";

interface ProviderCandidate {
	providerId: string;
	externalId: string;
	title: string;
	posterPath?: string | null;
	releaseDate?: string | null;
}

interface ProviderCandidateCardProps {
	candidate: ProviderCandidate;
	disabled: boolean;
	/** Content of the apply button: its label, optionally with an icon. */
	action: ReactNode;
	onApply: (providerId: string, externalId: string) => void;
}

/** One metadata search result with its poster and an apply button. */
export function ProviderCandidateCard({ candidate, disabled, action, onApply }: ProviderCandidateCardProps) {
	const releaseYear = candidate.releaseDate ? candidate.releaseDate.slice(0, 4) : null;

	return (
		<div className="group border-border bg-card hover:border-primary/50 relative flex gap-3.5 rounded-xl border p-3 shadow-xs transition-[border-color,background-color,color,box-shadow] hover:shadow-md">
			<div className="border-border/60 bg-muted relative aspect-2/3 w-16 shrink-0 overflow-hidden rounded-lg border">
				{candidate.posterPath ? (
					<Image src={candidate.posterPath} alt={candidate.title} fill unoptimized className="object-cover" loading="lazy" />
				) : (
					<div className="text-muted-foreground flex size-full items-center justify-center">
						<Film className="size-6" />
					</div>
				)}
			</div>

			<div className="flex flex-1 flex-col justify-between py-0.5">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<Badge variant="outline">{candidate.providerId}</Badge>
						{releaseYear !== null && (
							<span className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
								<Calendar className="size-3" />
								{releaseYear}
							</span>
						)}
					</div>
					<h4 className="text-foreground line-clamp-2 text-sm leading-snug font-semibold">{candidate.title}</h4>
					<p className="text-muted-foreground/80 font-mono text-xs">{m.common_id_label({ id: candidate.externalId })}</p>
				</div>

				<div className="pt-2">
					<Button
						type="button"
						size="sm"
						disabled={disabled}
						onClick={() => onApply(candidate.providerId, candidate.externalId)}
						className="w-full"
					>
						{action}
					</Button>
				</div>
			</div>
		</div>
	);
}
