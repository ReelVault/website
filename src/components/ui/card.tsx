import { cn } from "cn";
import type { ComponentProps } from "react";

function Card({
	className,
	size = "default",
	variant = "default",
	selected = false,
	...props
}: ComponentProps<"div"> & { size?: "default" | "sm"; variant?: "default" | "subtle" | "interactive"; selected?: boolean }) {
	return (
		<div
			data-slot="card"
			data-size={size}
			data-variant={variant}
			className={cn(
				"group/card bg-card text-card-foreground ring-foreground/10 flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl py-(--card-spacing) text-sm ring-1 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
				variant === "subtle" && "bg-card/60",
				variant === "interactive" && "hover:bg-muted/20 hover:ring-primary/40 cursor-pointer transition-colors",
				selected && "ring-primary/50",
				className,
			)}
			{...props}
		/>
	);
}

// Section header (admin sections): 16 px padding that grows to 20 px from sm, and a softer divider.
const CARD_HEADER_SIZE = {
	default: "",
	section: "border-border/70 p-4 sm:p-5 [.border-b]:pb-4 sm:[.border-b]:pb-5",
} as const;

function CardHeader({ className, size = "default", ...props }: ComponentProps<"div"> & { size?: keyof typeof CARD_HEADER_SIZE }) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				"group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
				CARD_HEADER_SIZE[size],
				className,
			)}
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="card-title"
			className={cn("font-heading text-base leading-snug font-semibold group-data-[size=sm]/card:text-sm", className)}
			{...props}
		/>
	);
}

const CARD_DESCRIPTION_SIZE = {
	default: "text-sm",
	xs: "text-xs",
} as const;

function CardDescription({
	className,
	size = "default",
	leading = "default",
	...props
}: ComponentProps<"div"> & { size?: keyof typeof CARD_DESCRIPTION_SIZE; leading?: "default" | "relaxed" }) {
	return (
		<div
			data-slot="card-description"
			className={cn("text-muted-foreground", CARD_DESCRIPTION_SIZE[size], leading === "relaxed" && "leading-relaxed", className)}
			{...props}
		/>
	);
}

const CARD_CONTENT_PADDING = {
	default: "px-(--card-spacing)",
	comfortable: "p-5",
	spacious: "p-4 sm:p-6",
} as const;

function CardContent({ className, size = "default", ...props }: ComponentProps<"div"> & { size?: keyof typeof CARD_CONTENT_PADDING }) {
	return <div data-slot="card-content" data-size={size} className={cn(CARD_CONTENT_PADDING[size], className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardHeader, CardTitle };
