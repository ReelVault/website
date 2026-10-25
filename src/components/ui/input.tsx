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
				"border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:disabled:bg-input/80 h-10 w-full min-w-0 rounded-lg border bg-transparent px-3 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 sm:h-8 sm:px-2.5 md:text-sm",
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
