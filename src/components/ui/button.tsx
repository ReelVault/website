import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
	"group/button inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-lg border border-transparent bg-clip-padding font-medium text-sm outline-none transition-[background-color,border-color,color,box-shadow,opacity,transform] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/80",
				outline:
					"border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
				ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
				destructive:
					"bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 dark:hover:bg-destructive/30",
				link: "text-primary underline-offset-4 hover:underline",
				warning: "border-warning/40 bg-transparent text-warning hover:bg-warning/10 hover:text-warning dark:bg-transparent",
				"destructive-outline":
					"border-destructive/40 bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive dark:bg-transparent",
				"destructive-ghost": "text-destructive hover:bg-destructive/10 hover:text-destructive",
				"primary-outline": "border-primary/40 bg-transparent text-primary hover:bg-primary/10 hover:text-primary dark:bg-transparent",
				"primary-ghost": "text-primary hover:bg-primary/10 hover:text-primary",
			},
			// Selected tile/toggle state (avatar picker, rating, breadcrumbs): a boolean axis instead of per-call colors.
			selected: {
				true: "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15",
				false: "",
			},
			// Touch-first sizing: phones get 40px+ targets, sm+ keeps the denser desktop scale.
			size: {
				default:
					"h-10 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 sm:h-8 sm:px-2.5 sm:has-data-[icon=inline-end]:pr-2 sm:has-data-[icon=inline-start]:pl-2",
				xs: "h-6 gap-1 in-data-[slot=button-group]:rounded-lg rounded-[min(var(--radius-md),10px)] px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-10 gap-1.5 in-data-[slot=button-group]:rounded-lg rounded-[min(var(--radius-md),12px)] px-3 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 sm:h-7 sm:px-2.5 sm:has-data-[icon=inline-end]:pr-1.5 sm:has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
				// Hero call to action: 44 px on phones and 36 px from sm, semibold label that grows from sm.
				hero: "h-11 gap-2 px-6 font-semibold text-sm tracking-wide has-data-[icon=inline-end]:pr-6 has-data-[icon=inline-start]:pl-6 sm:h-9 sm:text-base",
				lg: "h-11 gap-2 px-4 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 sm:h-9 sm:gap-1.5 sm:px-3 sm:has-data-[icon=inline-end]:pr-3 sm:has-data-[icon=inline-start]:pl-3",
				"sm-comfortable": "h-10 gap-1.5 px-2.5 text-xs sm:h-8",
				icon: "size-10 sm:size-8",
				"icon-xs":
					"size-6 in-data-[slot=button-group]:rounded-lg rounded-[min(var(--radius-md),10px)] [&_svg:not([class*='size-'])]:size-3",
				"icon-sm": "size-10 in-data-[slot=button-group]:rounded-lg rounded-[min(var(--radius-md),12px)] sm:size-7",
				"icon-lg": "size-11 sm:size-9",
				// Text-like control (title, link-style action): no height or padding of its own.
				inline: "h-auto gap-1 p-0 has-[>svg]:p-0 sm:h-auto",
			},
			shape: {
				default: "",
				pill: "rounded-full",
			},
			tone: {
				default: "",
				muted: "text-muted-foreground hover:text-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
			shape: "default",
			tone: "default",
		},
	},
);

function Button({
	className,
	variant = "default",
	size = "default",
	shape = "default",
	tone = "default",
	selected = false,
	nativeButton,
	role,
	...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
	// Base UI gives a non-native button role="button". Every nativeButton={false} use in this app renders a link,
	// so it keeps link semantics unless the caller sets a role.
	const resolvedRole = role ?? (nativeButton === false ? "link" : undefined);

	return (
		<ButtonPrimitive
			data-slot="button"
			nativeButton={nativeButton}
			role={resolvedRole}
			className={cn(buttonVariants({ variant, size, shape, tone, selected, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
