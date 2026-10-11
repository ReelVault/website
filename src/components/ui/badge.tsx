import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "cn";

const badgeVariants = cva(
	"group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border border-transparent font-medium transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
				secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
				destructive:
					"bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
				outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
				// Translucent chip over imagery (hero metadata): the outline with a dark tint.
				glass: "border-border/70 bg-background/60 text-foreground",
				ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
				link: "text-primary underline-offset-4 hover:underline",
				success: "border-success/30 bg-success/10 text-success",
				warning: "border-warning/30 bg-warning/10 text-warning",
				primary: "border-primary/30 bg-primary/10 text-primary",
				info: "border-info/30 bg-info/10 text-info",
				muted: "bg-muted text-muted-foreground",
				// Colored outline: no fill, semantic border and text (status chips on panels).
				"primary-outline": "border-primary/30 text-primary",
				"success-outline": "border-success/30 text-success",
				"warning-outline": "border-warning/30 text-warning",
				"info-outline": "border-info/30 text-info",
				"destructive-outline": "border-destructive/30 text-destructive",
			},
			size: {
				xs: "h-4 px-1.5 text-[10px] has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1",
				sm: "h-5 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
				default: "h-6 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
				// Count or version chip at the default height, with narrower side padding.
				count: "h-6 px-1.5 text-xs",
				// Tag at the small height (media view-mode toggle counts).
				compact: "h-5 px-1.5 text-xs",
				lg: "h-8 px-3 text-sm has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
			},
			font: {
				sans: "",
				mono: "font-mono",
			},
			// Text color on any variant: `muted` for secondary text, the semantic names for colored text without a fill.
			tone: {
				default: "",
				muted: "text-muted-foreground",
				primary: "text-primary",
				success: "text-success",
				warning: "text-warning",
				info: "text-info",
				destructive: "text-destructive",
			},
			transform: {
				none: "",
				capitalize: "capitalize",
				uppercase: "uppercase",
			},
			weight: {
				medium: "",
				normal: "font-normal",
				semibold: "font-semibold",
				bold: "font-bold",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
			weight: "medium",
		},
	},
);

function Badge({
	className,
	variant = "default",
	size = "default",
	font = "sans",
	transform = "none",
	weight = "medium",
	tone = "default",
	render,
	...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
	return useRender({
		defaultTagName: "span",
		props: mergeProps<"span">(
			{
				className: cn(badgeVariants({ variant, size, font, transform, tone, weight }), className),
			},
			props,
		),
		render,
		state: {
			slot: "badge",
			variant,
			size,
		},
	});
}

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export { Badge, badgeVariants };
