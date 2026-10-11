import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";
import type { ComponentProps } from "react";

function Input({
	className,
	type,
	font = "sans",
	density = "default",
	leadingIcon = false,
	...props
}: ComponentProps<"input"> & { font?: "sans" | "mono"; density?: "default" | "compact"; leadingIcon?: boolean }) {
	return (
		<InputPrimitive
			type={type}
			data-slot="input"
			className={cn(
				"h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-1 text-base outline-none transition-colors file:inline-flex file:h-6 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 sm:h-8 sm:px-2.5 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:disabled:bg-input/80",
				font === "mono" && "font-mono",
				// Dense filter field: 12px text and a 34px desktop height, on a background tint.
				density === "compact" && "bg-background/60 text-xs sm:h-8.5",
				leadingIcon && "pl-8 sm:pl-8",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
