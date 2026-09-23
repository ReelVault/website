import { AlertCircle, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { m } from "@/paraglide/messages";

interface PathPickerFooterProps {
	exists?: boolean;
	onCancel: () => void;
	onConfirm: () => void;
}

export function PathPickerFooter({ exists, onCancel, onConfirm }: PathPickerFooterProps) {
	return (
		<DialogFooter className="shrink-0 flex-col gap-3 border-border border-t bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
			<div className="flex items-center gap-2">
				{exists ? (
					<Badge
						variant="outline"
						className="gap-1.5 border-green-500/40 bg-green-500/10 font-medium text-green-600 text-xs dark:text-green-400"
					>
						<Check className="size-3.5" />
						<span>{m.components_path_exists()}</span>
					</Badge>
				) : (
					<Badge variant="outline" className="gap-1.5 border-warning/40 bg-warning/10 font-medium text-warning text-xs dark:text-warning">
						<AlertCircle className="size-3.5" />
						<span>{m.components_path_picker_not_accessible()}</span>
					</Badge>
				)}
			</div>

			<div className="flex items-center gap-2 sm:justify-end">
				<Button type="button" variant="outline" onClick={onCancel} className="text-xs">
					{m.common_cancel()}
				</Button>
				<Button type="button" onClick={onConfirm} disabled={!exists} className="gap-2 font-semibold text-xs">
					<Check className="size-4" />
					<span>{m.components_path_picker_select_this()}</span>
				</Button>
			</div>
		</DialogFooter>
	);
}
