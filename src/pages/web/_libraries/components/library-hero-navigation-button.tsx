import { useNavigate } from "@tanstack/react-router";
import { cn } from "cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Library, RequireFields } from "@reelvault/sdk";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";

export function LibraryHeroNavigationButton({
	type,
	direction,
	isGenreMode,
	onClick,
	onLibraryClick,
	mainLabel,
	subLabel,
}: {
	type: Library["type"];
	direction: "left" | "right";
	isGenreMode: boolean;
	onClick: () => void;
	onLibraryClick?: RequireFields<Library, "id" | "name">;
	mainLabel: string;
	subLabel?: string;
}) {
	const navigate = useNavigate();
	const Icon = direction === "left" ? ChevronLeft : ChevronRight;
	const isLeft = direction === "left";

	const handleClick = () => {
		if (isGenreMode) {
			onClick();
		} else if (onLibraryClick) {
			detach(navigate({ to: type === "movies" ? "/movies/$id" : "/series/$id", params: { id: onLibraryClick.id } }));
		}
	};

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon-lg"
			onClick={handleClick}
			aria-label={`${mainLabel}${subLabel ? `: ${subLabel}` : ""}`}
			className={cn("group min-h-11 min-w-11 flex-1 items-center gap-4 px-1", {
				"justify-end": isLeft,
				"justify-start": !isLeft,
			})}
		>
			{isLeft ? (
				<>
					<div className="hidden flex-col items-end md:flex">
						<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider transition-colors group-hover:text-primary">
							{mainLabel}
						</span>
						<span
							key={isGenreMode ? `genre-${mainLabel}` : subLabel}
							// initial={{ y: 10, opacity: 0 }}
							// animate={{ y: 0, opacity: 1 }}
							// exit={{ y: -10, opacity: 0 }}
							className="max-w-50 truncate font-bold text-muted-foreground text-xl transition-colors group-hover:text-foreground"
						>
							{subLabel}
						</span>
					</div>
					<div className="flex size-11 items-center justify-center rounded-xl border border-border bg-card transition-[background-color,border-color] group-hover:border-primary/40 group-hover:bg-primary/10">
						<Icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
					</div>
				</>
			) : (
				<>
					<div className="flex size-11 items-center justify-center rounded-xl border border-border bg-card transition-[background-color,border-color] group-hover:border-primary/40 group-hover:bg-primary/10">
						<Icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
					</div>
					<div className="hidden flex-col items-start md:flex">
						<span
							// layout
							className="font-semibold text-muted-foreground text-xs uppercase tracking-wider transition-colors group-hover:text-primary"
						>
							{mainLabel}
						</span>
						<span
							key={isGenreMode ? `genre-${mainLabel}` : subLabel}
							// initial={{ y: 10, opacity: 0 }}
							// animate={{ y: 0, opacity: 1 }}
							// exit={{ y: -10, opacity: 0 }}
							className="max-w-50 truncate font-bold text-muted-foreground text-xl transition-colors group-hover:text-foreground"
						>
							{subLabel}
						</span>
					</div>
				</>
			)}
		</Button>
	);
}
