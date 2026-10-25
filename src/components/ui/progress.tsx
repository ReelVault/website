import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { cn } from "cn";

function Progress({
	className,
	children,
	value,
	size = "default",
	...props
}: ProgressPrimitive.Root.Props & { size?: "default" | "sm" | "lg" }) {
	return (
		<ProgressPrimitive.Root
			value={value}
			data-slot="progress"
			data-size={size}
			className={cn("group/progress flex flex-wrap gap-3", className)}
			{...props}
		>
			{children}
			<ProgressTrack>
				<ProgressIndicator />
			</ProgressTrack>
		</ProgressPrimitive.Root>
	);
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
	return (
		<ProgressPrimitive.Track
			className={cn(
				"bg-muted relative flex h-1 w-full items-center overflow-x-hidden rounded-full group-data-[size=lg]/progress:h-2 group-data-[size=sm]/progress:h-1.5",
				className,
			)}
			data-slot="progress-track"
			{...props}
		/>
	);
}

function ProgressIndicator({ className, ...props }: ProgressPrimitive.Indicator.Props) {
	return (
		<ProgressPrimitive.Indicator
			data-slot="progress-indicator"
			className={cn("bg-primary h-full transition-[width]", className)}
			{...props}
		/>
	);
}

export { Progress, ProgressIndicator, ProgressTrack };
