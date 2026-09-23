import { cn } from "cn";
import { Check } from "lucide-react";
import type { MetadataWithRelation } from "@reelvault/sdk";
import { ApiImage } from "@/components/ui/api-image";
import { Badge } from "@/components/ui/badge";
import { m } from "@/paraglide/messages";
import { getYearFromDate } from "@/utils/date-utils";
import { getMetadataPoster } from "@/utils/metadata-utils";

interface MergeMetadataCandidateItemProps {
	candidate: MetadataWithRelation;
	isSelected: boolean;
	onSelect: (id: string) => void;
}

export function MergeMetadataCandidateItem({ candidate, isSelected, onSelect }: MergeMetadataCandidateItemProps) {
	const poster = getMetadataPoster(candidate);
	const year = candidate.releaseDate ? getYearFromDate(candidate.releaseDate) : "—";

	return (
		<button
			type="button"
			onClick={() => onSelect(candidate.id)}
			className={cn(
				"flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-left transition-[border-color,background-color,color,box-shadow]",
				isSelected ? "border-primary bg-primary/10 shadow-xs" : "border-border/70 bg-card hover:border-primary/40 hover:bg-muted/30",
			)}
		>
			<div className="flex min-w-0 items-center gap-3">
				<div className="relative aspect-2/3 w-10 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted/40 shadow-2xs">
					<ApiImage fileId={poster?.id} cacheKey={poster?.updatedAt} alt={candidate.title} fill className="object-cover" sizes="40px" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<span className="truncate font-semibold text-foreground text-sm">{candidate.title}</span>
						<Badge variant="outline" className="text-[10px]">
							{year}
						</Badge>
					</div>
					<p className="truncate font-mono text-[11px] text-muted-foreground">{m.common_id_label({ id: candidate.id })}</p>
					{candidate.originalTitle && candidate.originalTitle !== candidate.title && (
						<p className="truncate text-muted-foreground text-xs italic">{candidate.originalTitle}</p>
					)}
				</div>
			</div>

			<div className="flex shrink-0 items-center">
				{isSelected && (
					<div className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
						<Check className="size-3.5" />
					</div>
				)}
			</div>
		</button>
	);
}
