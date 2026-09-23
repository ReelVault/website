import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { PurgeHistoryDialog } from "./purge-history-dialog";

/** History-purge button + dialog in one — the open state lives here, not in the page. */
export function PurgeHistoryAction() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				type="button"
				onClick={() => setIsOpen(true)}
				className="h-8 cursor-pointer gap-1.5 border-destructive/40 text-destructive text-xs transition-colors hover:bg-destructive/10 hover:text-destructive"
			>
				<Trash2 className="size-3.5" />
				<span>{m.admin_worker_clear_history()}</span>
			</Button>
			<PurgeHistoryDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	);
}
