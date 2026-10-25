import { cva } from "class-variance-authority";

const toggleVariants = cva(
	"group/toggle hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-pressed:bg-muted aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=on]:bg-muted dark:aria-invalid:ring-destructive/40 inline-flex items-center justify-center gap-1 rounded-lg text-sm font-medium whitespace-nowrap transition-[border-color,background-color,color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: "bg-transparent",
				outline: "border-input hover:bg-muted border bg-transparent",
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
