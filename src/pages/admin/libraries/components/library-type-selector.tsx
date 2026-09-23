import { cn } from "cn";
import { Check, Clapperboard, Tv } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { m } from "@/paraglide/messages";

interface LibraryTypeSelectorProps {
	value: "movies" | "tv_shows";
	onChange: (value: "movies" | "tv_shows") => void;
}

export function LibraryTypeSelector({ value, onChange }: LibraryTypeSelectorProps) {
	return (
		<div className="flex flex-col gap-2.5">
			<Label className="font-medium text-foreground text-sm">{m.admin_libraries_content_type()}</Label>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<button
					type="button"
					onClick={() => onChange("movies")}
					className={cn(
						"relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 text-left transition-[border-color,background-color,color,box-shadow]",
						value === "movies"
							? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
							: "border-border bg-card/60 hover:border-border/80 hover:bg-muted/40",
					)}
				>
					<div
						className={cn(
							"flex size-10 shrink-0 items-center justify-center rounded-lg border font-semibold",
							value === "movies" ? "border-primary/30 bg-primary/20 text-primary" : "border-border bg-muted/60 text-muted-foreground",
						)}
					>
						<Clapperboard className="size-5" />
					</div>
					<div className="flex flex-1 flex-col gap-0.5">
						<div className="flex items-center justify-between">
							<span className="font-semibold text-base text-foreground">{m.web_watchlist_stats_movies()}</span>
							{value === "movies" && (
								<Badge variant="default" size="sm" className="h-5 gap-1 px-1.5">
									<Check className="size-3" />
									<span>{m.admin_libraries_selected()}</span>
								</Badge>
							)}
						</div>
						<p className="text-muted-foreground text-xs leading-relaxed">{m.admin_libraries_movies_catalog_description()}</p>
					</div>
				</button>

				<button
					type="button"
					onClick={() => onChange("tv_shows")}
					className={cn(
						"relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 text-left transition-[border-color,background-color,color,box-shadow]",
						value === "tv_shows"
							? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
							: "border-border bg-card/60 hover:border-border/80 hover:bg-muted/40",
					)}
				>
					<div
						className={cn(
							"flex size-10 shrink-0 items-center justify-center rounded-lg border font-semibold",
							value === "tv_shows" ? "border-primary/30 bg-primary/20 text-primary" : "border-border bg-muted/60 text-muted-foreground",
						)}
					>
						<Tv className="size-5" />
					</div>
					<div className="flex flex-1 flex-col gap-0.5">
						<div className="flex items-center justify-between">
							<span className="font-semibold text-base text-foreground">{m.web_watchlist_stats_series()}</span>
							{value === "tv_shows" && (
								<Badge variant="default" size="sm" className="h-5 gap-1 px-1.5">
									<Check className="size-3" />
									<span>{m.admin_libraries_selected()}</span>
								</Badge>
							)}
						</div>
						<p className="text-muted-foreground text-xs leading-relaxed">{m.admin_libraries_tv_collections_description()}</p>
					</div>
				</button>
			</div>
		</div>
	);
}
