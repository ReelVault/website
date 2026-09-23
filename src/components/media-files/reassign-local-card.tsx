import type { MetadataWithRelation } from "@reelvault/sdk";
import { cn } from "cn";
import { Check, Film, Tv } from "lucide-react";
import { m } from "@/paraglide/messages";

interface ReassignLocalCardProps {
	item: MetadataWithRelation;
	isSelected: boolean;
	onSelect: (metadataId: string) => void;
}

export function ReassignLocalCard({ item, isSelected, onSelect }: ReassignLocalCardProps) {
	const releaseYear = item.releaseDate ? item.releaseDate.slice(0, 4) : null;

	return (
		<button
			type="button"
			onClick={() => onSelect(item.id)}
			className={cn(
				"flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-[border-color,background-color,color,box-shadow]",
				{
					"border-primary bg-primary/10 shadow-sm": isSelected,
					"border-border bg-card hover:border-primary/40 hover:bg-muted/30": !isSelected,
				},
			)}
		>
			<div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted font-bold text-muted-foreground text-xs">
				{item.type === "movie" ? <Film className="size-5" /> : <Tv className="size-5" />}
			</div>
			<div className="flex-1 overflow-hidden">
				<h4 className="truncate font-semibold text-foreground text-sm">{item.title}</h4>
				<div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
					{releaseYear !== null && <span>{releaseYear}</span>}
					<span>{m.common_dot_separator()}</span>
					<span>{m.components_reassign_short_id({ id: item.id.slice(0, 8) })}</span>
				</div>
			</div>
			{isSelected && <Check className="size-4 shrink-0 text-primary" />}
		</button>
	);
}
