import { cn } from "cn";
import type { ReactElement, ReactNode } from "react";
import { AppTooltip } from "@/components/app-tooltip";

/**
 * The exact same button styling was previously hand-copied into the footer
 * (4x), header, audio menu, subtitle menu and settings menu. Centralizing it
 * here means a visual tweak only needs to happen in one place, and every
 * control now consistently reacts to Radix's `data-state="open"` (dropdown
 * triggers) so an open menu's trigger is visibly highlighted.
 */
export const controlButtonVariants = {
	icon: "flex size-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:cursor-pointer hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
	wide: "flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-muted-foreground transition-colors hover:cursor-pointer hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
	primary:
		"group flex size-12 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:cursor-pointer hover:scale-110 active:scale-95",
} as const;

export function PlayerControlButton({
	description,
	variant = "icon",
	render,
	children,
	className,
}: {
	description: string;
	variant?: keyof typeof controlButtonVariants;
	render: ReactElement;
	children: ReactNode;
	className?: string;
}) {
	return (
		<AppTooltip description={description} render={render} className={cn(controlButtonVariants[variant], className)}>
			{children}
		</AppTooltip>
	);
}
