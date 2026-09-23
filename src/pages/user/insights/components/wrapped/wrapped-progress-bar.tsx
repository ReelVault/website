import { cn } from "cn";
import { m } from "@/paraglide/messages";
import { SLIDE_KEYS } from "./wrapped-constants";

interface WrappedProgressBarProps {
	slideIndex: number;
	onSelectSlide: (index: number) => void;
}

export function WrappedProgressBar({ slideIndex, onSelectSlide }: WrappedProgressBarProps) {
	return (
		<div className="relative z-20 flex gap-2 border-border/40 border-b bg-card/60 px-6 pt-5 pb-3">
			{SLIDE_KEYS.map((key, i) => (
				<button
					type="button"
					key={key}
					onClick={() => onSelectSlide(i)}
					className="group relative h-2 flex-1 origin-left cursor-pointer overflow-hidden rounded-full bg-muted-foreground/20 transition-transform hover:scale-y-150"
					aria-label={m.user_go_to_slide({ i1: i + 1 })}
				>
					<div
						className={cn("h-full transition-[width] duration-300", {
							"w-full bg-primary shadow-primary shadow-sm": slideIndex === i,
							"w-full bg-primary/60": slideIndex > i,
							"w-0": slideIndex < i,
						})}
					/>
				</button>
			))}
		</div>
	);
}
