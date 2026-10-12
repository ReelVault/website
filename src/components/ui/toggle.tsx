import { cva } from "class-variance-authority";

const toggleVariants = cva(
	"group/toggle inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-lg font-medium text-sm outline-none transition-[border-color,background-color,color,box-shadow] hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-pressed:bg-muted aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=on]:bg-muted dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-transparent",
				outline: "border border-input bg-transparent hover:bg-muted",
			},
			size: {
				default: "h-10 min-w-10 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 sm:h-8 sm:min-w-8",
				sm: "h-10 min-w-10 rounded-[min(var(--radius-md),12px)] px-2.5 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 sm:h-7 sm:min-w-7 [&_svg:not([class*='size-'])]:size-3.5",
				lg: "h-10 min-w-10 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 sm:h-9 sm:min-w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export { toggleVariants };
