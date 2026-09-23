import { cn } from "cn";
import type { MouseEvent } from "react";
import type { CollectionSortMode } from "reelvault-sdk";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { m } from "@/paraglide/messages";
import { COLLECTION_SORT_OPTIONS } from "../../components/collection-sort-options";

interface CollectionSortCardProps {
	sortMode: CollectionSortMode;
	onSortOptionClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

export function CollectionSortCard({ sortMode, onSortOptionClick }: CollectionSortCardProps) {
	return (
		<Card className="border-border/80 bg-card">
			<CardHeader>
				<CardTitle className="font-semibold text-base">{m.admin_collections_title_sorting()}</CardTitle>
				<CardDescription>{m.admin_collections_order_description()}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
					{COLLECTION_SORT_OPTIONS.map((option) => {
						const selected = sortMode === option.value;

						return (
							<button
								key={option.value}
								type="button"
								onClick={onSortOptionClick}
								data-sort-mode={option.value}
								className={cn(
									"relative flex cursor-pointer flex-col gap-1 rounded-xl border p-3 text-left transition-[border-color,background-color,color,box-shadow]",
									selected
										? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
										: "border-border bg-card/60 hover:border-border/80 hover:bg-muted/40",
								)}
								aria-pressed={selected}
							>
								<span className={cn("font-semibold text-sm", selected ? "text-primary" : "text-foreground")}>{option.label}</span>
								<span className="text-muted-foreground text-xs leading-relaxed">{option.description}</span>
							</button>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
