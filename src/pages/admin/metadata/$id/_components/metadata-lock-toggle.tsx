import { cn } from "cn";
import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { m } from "@/paraglide/messages";

export function MetadataLockToggle({
	field,
	isLocked,
	onToggle,
	label,
	className,
}: {
	field: string;
	isLocked: boolean;
	onToggle: (field: string) => void;
	label?: string;
	className?: string;
}) {
	const tooltipText = isLocked
		? m.admin_metadata_field_locked_unlock_hint({ field: label ?? field })
		: m.admin_metadata_field_locked_lock_hint({ field: label ?? field });

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => onToggle(field)}
						className={cn(
							"size-8 shrink-0 rounded-md transition-colors",
							isLocked ? "bg-warning/10 text-warning hover:bg-warning/20" : "text-muted-foreground/40 hover:bg-muted hover:text-foreground",
							className,
						)}
					/>
				}
			>
				{isLocked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
				<span className="sr-only">
					{isLocked ? m.admin_metadata_unlock_field({ field: label ?? field }) : m.admin_metadata_lock_field({ field: label ?? field })}
				</span>
			</TooltipTrigger>
			<TooltipContent side="top" className="max-w-xs text-xs">
				{tooltipText}
			</TooltipContent>
		</Tooltip>
	);
}
