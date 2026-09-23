import { cn } from "cn";
import type { ComponentProps } from "react";

function Label({ className, htmlFor, ...props }: ComponentProps<"label">) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: reusable primitive — callers pass htmlFor (or nest a control as children); the rule cannot verify either through the props spread.
		<label
			data-slot="label"
			htmlFor={htmlFor}
			className={cn(
				"flex select-none items-center gap-2 font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Label };
