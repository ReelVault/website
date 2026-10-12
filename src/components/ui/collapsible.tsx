import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import { cva, type VariantProps } from "class-variance-authority";

const collapsibleTriggerVariants = cva("", {
	variants: {
		// Full-width disclosure row for lists: padded, hoverable, and wrapping its content on narrow screens.
		variant: {
			default: "",
			row: "flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3 text-left transition-colors hover:bg-muted/40",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
	return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
	className,
	variant,
	...props
}: CollapsiblePrimitive.Trigger.Props & VariantProps<typeof collapsibleTriggerVariants>) {
	return (
		<CollapsiblePrimitive.Trigger
			data-slot="collapsible-trigger"
			className={collapsibleTriggerVariants({ variant, className })}
			{...props}
		/>
	);
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.Panel.Props) {
	return <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />;
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
