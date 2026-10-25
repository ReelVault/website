import { cn } from "cn";
import type { ComponentProps } from "react";

function Label({
	className,
	htmlFor,
	tone = "default",
	size = "default",
	weight = "medium",
	...props
}: ComponentProps<"label"> & {
	tone?: "default" | "muted";
	size?: "default" | "xs";
	weight?: "medium" | "semibold";
}) {
	return (
		<label
			data-slot="label"
			htmlFor={htmlFor}
			className={cn(
				"flex items-center gap-2 leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
				size === "xs" ? "text-xs" : "text-sm",
				weight === "semibold" ? "font-semibold" : "font-medium",
				tone === "muted" ? "text-muted-foreground" : "text-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export { Label };
