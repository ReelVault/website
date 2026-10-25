import { cn } from "cn";
import { m } from "@/paraglide/messages";
import { SLIDE_KEYS } from "./wrapped-constants";

interface WrappedProgressBarProps {
	slideIndex: number;
	onSelectSlide: (index: number) => void;
}

export function WrappedProgressBar({ slideIndex, onSelectSlide }: WrappedProgressBarProps) {
	return (
		<div className="border-border/40 bg-card/60 relative z-20 flex gap-2 border-b px-6 pt-5 pb-3">
			{SLIDE_KEYS.map((key, i) => (
				<button
					type="button"
					key={key}
					onClick={() => onSelectSlide(i)}
					className="group bg-muted-foreground/20 relative h-2 flex-1 origin-left cursor-pointer overflow-hidden rounded-full transition-transform hover:scale-y-150"
					aria-label={m.user_go_to_slide({ i1: i + 1 })}
				>
					<div
						className={cn("h-full transition-[width] duration-300", {
							"bg-primary shadow-primary w-full shadow-sm": slideIndex === i,
							"bg-primary/60 w-full": slideIndex > i,
							"w-0": slideIndex < i,
						})}
					/>
				</button>
			))}
		</div>
	);
}
