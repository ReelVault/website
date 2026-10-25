import type { Library, RequireFields } from "@reelvault/sdk";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
			className={cn("group min-h-11 min-w-11 flex-1 items-center", isLeft ? "justify-end" : "justify-start")}
		>
			<span className="flex items-center gap-3">
				{isLeft ? (
					<>
						<div className="hidden flex-col items-end md:flex">
							<span className="text-muted-foreground group-hover:text-primary text-xs font-semibold transition-colors">{mainLabel}</span>
							<span
								key={isGenreMode ? `genre-${mainLabel}` : subLabel}
								// initial={{ y: 10, opacity: 0 }}
								// animate={{ y: 0, opacity: 1 }}
								// exit={{ y: -10, opacity: 0 }}
								className="text-muted-foreground group-hover:text-foreground max-w-50 truncate text-xl font-bold transition-colors"
							>
								{subLabel}
							</span>
						</div>
						<div className="border-border bg-card group-hover:border-primary/40 group-hover:bg-primary/10 flex size-11 items-center justify-center rounded-xl border transition-[background-color,border-color]">
							<Icon className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-colors" />
						</div>
					</>
				) : (
					<>
						<div className="border-border bg-card group-hover:border-primary/40 group-hover:bg-primary/10 flex size-11 items-center justify-center rounded-xl border transition-[background-color,border-color]">
							<Icon className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-colors" />
						</div>
						<div className="hidden flex-col items-start md:flex">
							<span
								// layout
								className="text-muted-foreground group-hover:text-primary text-xs font-semibold transition-colors"
							>
								{mainLabel}
							</span>
							<span
								key={isGenreMode ? `genre-${mainLabel}` : subLabel}
								// initial={{ y: 10, opacity: 0 }}
								// animate={{ y: 0, opacity: 1 }}
								// exit={{ y: -10, opacity: 0 }}
								className="text-muted-foreground group-hover:text-foreground max-w-50 truncate text-xl font-bold transition-colors"
							>
								{subLabel}
							</span>
						</div>
					</>
				)}
			</span>
		</Button>
	);
}
