import { Select as SelectPrimitive } from "@base-ui/react/select";
import { cn } from "cn";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Children, type ComponentProps, isValidElement, type ReactElement, type ReactNode } from "react";
import { usePortalContainer } from "@/components/portal-container";

interface SelectChildProps extends Record<string, unknown> {
	children?: ReactNode;
	label?: ReactNode;
	textValue?: ReactNode;
}

function isElementWithSelectProps(node: ReactNode): node is ReactElement<SelectChildProps> {
	return isValidElement(node);
}

function extractItemsFromChildren(children: ReactNode): Array<{ value: unknown; label: ReactNode }> {
	const items: Array<{ value: unknown; label: ReactNode }> = [];

	function traverse(nodes: readonly ReactNode[]): void {
		for (const node of nodes) {
			if (!isElementWithSelectProps(node)) continue;

			const props = node.props;
			if ("value" in props && props.value !== undefined && ("children" in props || "label" in props || "textValue" in props)) {
				items.push({
					value: props.value,
					label: props.label ?? props.textValue ?? props.children,
				});
			}

			if (props.children) {
				traverse(Children.toArray(props.children));
			}
		}
	}

	traverse(Children.toArray(children));

	return items;
}

function Select<Value, Multiple extends boolean | undefined = false>({
	items,
	children,
	...props
}: SelectPrimitive.Root.Props<Value, Multiple>) {
	const extractedItems = items ?? extractItemsFromChildren(children);

	return (
		<SelectPrimitive.Root items={extractedItems} {...props}>
			{children}
		</SelectPrimitive.Root>
	);
}

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
	return <SelectPrimitive.Group data-slot="select-group" className={cn("scroll-my-1 p-1", className)} {...props} />;
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
	return <SelectPrimitive.Value data-slot="select-value" className={cn("flex flex-1 text-left", className)} {...props} />;
}

function SelectTrigger({
	className,
	size = "default",
	density = "default",
	children,
	...props
}: SelectPrimitive.Trigger.Props & {
	size?: "sm" | "default";
	density?: "default" | "compact";
}) {
	return (
		<SelectPrimitive.Trigger
			data-slot="select-trigger"
			data-size={size}
			className={cn(
				"border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-1.5 rounded-lg border bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 data-[size=default]:h-10 data-[size=sm]:h-9 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 sm:data-[size=default]:h-8 sm:data-[size=sm]:h-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				density === "compact" && "text-xs",
				className,
			)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon render={<ChevronDownIcon className="text-muted-foreground pointer-events-none size-4" />} />
		</SelectPrimitive.Trigger>
	);
}

function SelectContent({
	className,
	children,
	side = "bottom",
	sideOffset = 4,
	align = "center",
	alignOffset = 0,
	alignItemWithTrigger = true,
	container,
	...props
}: SelectPrimitive.Popup.Props &
	Pick<SelectPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"> & {
		container?: SelectPrimitive.Portal.Props["container"];
	}) {
	const portalContainer = usePortalContainer(container);

	return (
		<SelectPrimitive.Portal container={portalContainer}>
			<SelectPrimitive.Positioner
				side={side}
				sideOffset={sideOffset}
				align={align}
				alignOffset={alignOffset}
				alignItemWithTrigger={alignItemWithTrigger}
				className="isolate z-50"
			>
				<SelectPrimitive.Popup
					data-slot="select-content"
					data-align-trigger={alignItemWithTrigger}
					className={cn(
						"data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 bg-popover text-popover-foreground ring-foreground/10 data-closed:animate-out data-open:animate-in relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg shadow-md ring-1 duration-100 data-[align-trigger=true]:animate-none",
						className,
					)}
					{...props}
				>
					<SelectScrollUpButton />
					<SelectPrimitive.List>{children}</SelectPrimitive.List>
					<SelectScrollDownButton />
				</SelectPrimitive.Popup>
			</SelectPrimitive.Positioner>
		</SelectPrimitive.Portal>
	);
}

interface SelectItemProps extends Omit<SelectPrimitive.Item.Props, "label"> {
	label?: React.ReactNode;
	textValue?: string;
}

function SelectItem({ className, children, label, textValue, ...props }: SelectItemProps) {
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			className={cn(
				"focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
				className,
			)}
			{...props}
		>
			<SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">{children}</SelectPrimitive.ItemText>
			<SelectPrimitive.ItemIndicator
				render={<span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />}
			>
				<CheckIcon className="pointer-events-none" />
			</SelectPrimitive.ItemIndicator>
		</SelectPrimitive.Item>
	);
}

function SelectScrollUpButton({ className, ...props }: ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
	return (
		<SelectPrimitive.ScrollUpArrow
			data-slot="select-scroll-up-button"
			className={cn(
				"bg-popover top-0 z-10 flex w-full cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			<ChevronUpIcon />
		</SelectPrimitive.ScrollUpArrow>
	);
}

function SelectScrollDownButton({ className, ...props }: ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
	return (
		<SelectPrimitive.ScrollDownArrow
			data-slot="select-scroll-down-button"
			className={cn(
				"bg-popover bottom-0 z-10 flex w-full cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			<ChevronDownIcon />
		</SelectPrimitive.ScrollDownArrow>
	);
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectScrollDownButton, SelectScrollUpButton, SelectTrigger, SelectValue };
