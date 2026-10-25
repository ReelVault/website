import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { cn } from "cn";
import { ChevronRightIcon } from "lucide-react";
import type * as React from "react";
import { usePortalContainer } from "@/components/portal-container";

function ContextMenu({ ...props }: ContextMenuPrimitive.Root.Props) {
	return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuPortal({ container, ...props }: ContextMenuPrimitive.Portal.Props) {
	const portalContainer = usePortalContainer(container);

	return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" container={portalContainer} {...props} />;
}

function ContextMenuTrigger({ className, ...props }: ContextMenuPrimitive.Trigger.Props) {
	return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" className={cn("select-none", className)} {...props} />;
}

function ContextMenuContent({
	className,
	align = "start",
	alignOffset = 4,
	side = "right",
	sideOffset = 0,
	container,
	...props
}: ContextMenuPrimitive.Popup.Props &
	Pick<ContextMenuPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> & {
		container?: ContextMenuPrimitive.Portal.Props["container"];
	}) {
	return (
		<ContextMenuPortal container={container}>
			<ContextMenuPrimitive.Positioner
				className="isolate z-50 outline-none"
				align={align}
				alignOffset={alignOffset}
				side={side}
				sideOffset={sideOffset}
			>
				<ContextMenuPrimitive.Popup
					data-slot="context-menu-content"
					className={cn(
						"data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 bg-popover text-popover-foreground ring-foreground/10 data-closed:animate-out data-open:animate-in z-50 max-h-(--available-height) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg p-1 shadow-md ring-1 duration-100 outline-none",
						className,
					)}
					{...props}
				/>
			</ContextMenuPrimitive.Positioner>
		</ContextMenuPortal>
	);
}

function ContextMenuGroup({ ...props }: ContextMenuPrimitive.Group.Props) {
	return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

function ContextMenuLabel({
	className,
	inset,
	...props
}: ContextMenuPrimitive.GroupLabel.Props & {
	inset?: boolean;
}) {
	return (
		<ContextMenuPrimitive.GroupLabel
			data-slot="context-menu-label"
			data-inset={inset}
			className={cn("text-foreground truncate px-1.5 py-1 text-xs font-semibold data-inset:pl-7", className)}
			{...props}
		/>
	);
}

function ContextMenuItem({
	className,
	inset,
	variant = "default",
	onClick,
	onSelect,
	...props
}: ContextMenuPrimitive.Item.Props & {
	inset?: boolean;
	variant?: "default" | "destructive";
	onSelect?: (event: React.MouseEvent<HTMLDivElement>) => void;
}) {
	return (
		<ContextMenuPrimitive.Item
			data-slot="context-menu-item"
			data-inset={inset}
			data-variant={variant}
			className={cn(
				"group/context-menu-item focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 focus:*:[svg]:text-accent-foreground data-[variant=destructive]:*:[svg]:text-destructive relative flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			onClick={(e) => {
				onClick?.(e);
				onSelect?.(e);
			}}
			{...props}
		/>
	);
}

function ContextMenuSub({ ...props }: ContextMenuPrimitive.SubmenuRoot.Props) {
	return <ContextMenuPrimitive.SubmenuRoot data-slot="context-menu-sub" {...props} />;
}

function ContextMenuSubTrigger({
	className,
	inset,
	children,
	...props
}: ContextMenuPrimitive.SubmenuTrigger.Props & {
	inset?: boolean;
}) {
	return (
		<ContextMenuPrimitive.SubmenuTrigger
			data-slot="context-menu-sub-trigger"
			data-inset={inset}
			className={cn(
				"focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-inset:pl-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			{children}
			<ChevronRightIcon className="ml-auto" />
		</ContextMenuPrimitive.SubmenuTrigger>
	);
}

function ContextMenuSubContent({ ...props }: React.ComponentProps<typeof ContextMenuContent>) {
	return <ContextMenuContent data-slot="context-menu-sub-content" className="shadow-lg" side="right" {...props} />;
}

function ContextMenuSeparator({ className, ...props }: ContextMenuPrimitive.Separator.Props) {
	return (
		<ContextMenuPrimitive.Separator data-slot="context-menu-separator" className={cn("bg-border -mx-1 my-1 h-px", className)} {...props} />
	);
}

function ContextMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="context-menu-shortcut"
			className={cn(
				"text-muted-foreground group-focus/context-menu-item:text-accent-foreground ml-auto text-xs tracking-widest",
				className,
			)}
			{...props}
		/>
	);
}

export {
	ContextMenu,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuPortal,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
};
