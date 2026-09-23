import type { ReactElement, ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function AppTooltip({
	render,
	description,
	className,
	children,
}: {
	description: string;
	render?: ReactElement;
	className?: string;
	children: ReactNode;
}) {
	return (
		<Tooltip>
			<TooltipTrigger render={render} className={className}>
				{children}
			</TooltipTrigger>
			<TooltipContent>{description}</TooltipContent>
		</Tooltip>
	);
}
