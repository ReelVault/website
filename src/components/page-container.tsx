import { cn } from "cn";
import type { ComponentProps } from "react";

/** Shared horizontal rhythm for full-width web pages. */
export function PageContainer({ className, ...props }: ComponentProps<"div">) {
	return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}
