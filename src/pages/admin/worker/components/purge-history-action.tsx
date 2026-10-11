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
			<Button variant="destructive-outline" size="sm" type="button" onClick={() => setIsOpen(true)} className="cursor-pointer">
				<Trash2 className="size-3.5" />
				<span>{m.admin_worker_clear_history()}</span>
			</Button>
			<PurgeHistoryDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	);
}
