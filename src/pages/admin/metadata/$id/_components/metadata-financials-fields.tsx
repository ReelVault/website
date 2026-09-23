import { DollarSign } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { m } from "@/paraglide/messages";
import { MetadataLockToggle } from "./metadata-lock-toggle";
import type { MetadataFormState } from "./types";

interface MetadataFinancialsFieldsProps {
	budget: string;
	revenue: string;
	isLocked: (field: string) => boolean;
	onChange: (field: keyof MetadataFormState, value: string) => void;
	onToggleLock: (field: string) => void;
}

export function MetadataFinancialsFields({ budget, revenue, isLocked, onChange, onToggleLock }: MetadataFinancialsFieldsProps) {
	return (
		<>
			<div className="flex flex-col gap-1.5">
				<div className="flex items-center justify-between">
					<Label htmlFor="metadata-budget" className="font-medium text-sm">
						{m.admin_metadata_budget_usd()}
					</Label>
					<MetadataLockToggle field="budget" label={m.admin_metadata_budget()} isLocked={isLocked("budget")} onToggle={onToggleLock} />
				</div>
				<InputGroup className="h-10 bg-background">
					<InputGroupAddon>
						<DollarSign className="size-4 text-muted-foreground" />
					</InputGroupAddon>
					<InputGroupInput
						id="metadata-budget"
						name="budget"
						type="number"
						value={budget}
						onChange={(e) => onChange("budget", e.target.value)}
						placeholder="0"
					/>
				</InputGroup>
			</div>

			<div className="flex flex-col gap-1.5">
				<div className="flex items-center justify-between">
					<Label htmlFor="metadata-revenue" className="font-medium text-sm">
						{m.admin_metadata_revenue_usd()}
					</Label>
					<MetadataLockToggle field="revenue" label={m.admin_metadata_revenue()} isLocked={isLocked("revenue")} onToggle={onToggleLock} />
				</div>
				<InputGroup className="h-10 bg-background">
					<InputGroupAddon>
						<DollarSign className="size-4 text-muted-foreground" />
					</InputGroupAddon>
					<InputGroupInput
						id="metadata-revenue"
						name="revenue"
						type="number"
						value={revenue}
						onChange={(e) => onChange("revenue", e.target.value)}
						placeholder="0"
					/>
				</InputGroup>
			</div>
		</>
	);
}
