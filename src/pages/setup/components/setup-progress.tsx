import { cn } from "cn";
import { m } from "@/paraglide/messages";

interface SetupProgressProps {
	labels: readonly string[];
	current: number;
	isSuccess: boolean;
}

export function SetupProgress({ labels, current, isSuccess }: SetupProgressProps) {
	return (
		<ol
			className="grid gap-2"
			style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}
			aria-label={m.setup_progress_aria()}
		>
			{labels.map((label, index) => {
				const completed = index < current || isSuccess;

				return (
					<li key={label} className="flex min-w-0 flex-col gap-2 text-xs" aria-current={index === current ? "step" : undefined}>
						<div className={cn("h-1 rounded-full", completed || index === current ? "bg-primary" : "bg-muted")} />
						<span className={index === current ? "font-medium text-foreground" : "truncate text-muted-foreground"}>{label}</span>
					</li>
				);
			})}
		</ol>
	);
}
