import type { TaskTrigger, TaskTriggerType } from "@reelvault/sdk";
import { cn } from "cn";
import { Zap } from "lucide-react";
import { useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { m } from "@/paraglide/messages";
import { safeUuid } from "@/utils/id-utils";
import { DAYS_OF_WEEK } from "./trigger-utils";

interface TaskTriggerFormProps {
	onAdd: (trigger: TaskTrigger) => void;
	onCancel: () => void;
}

export function TaskTriggerForm({ onAdd, onCancel }: TaskTriggerFormProps) {
	const id = useId();
	const [newType, setNewType] = useState<TaskTriggerType>("daily");
	const [newTimeOfDay, setNewTimeOfDay] = useState("03:00");
	const [newDayOfWeek, setNewDayOfWeek] = useState(1);
	const [newIntervalHours, setNewIntervalHours] = useState(24);
	const [newMaxRuntimeMinutes, setNewMaxRuntimeMinutes] = useState<number | undefined>();

	const submitTrigger = () => {
		const newTrigger: TaskTrigger = {
			id: safeUuid(),
			type: newType,
			maxRuntimeMinutes: newMaxRuntimeMinutes && newMaxRuntimeMinutes > 0 ? newMaxRuntimeMinutes : undefined,
		};

		if (newType === "daily") {
			newTrigger.timeOfDay = newTimeOfDay.length > 0 ? newTimeOfDay : "00:00";
		} else if (newType === "weekly") {
			newTrigger.timeOfDay = newTimeOfDay.length > 0 ? newTimeOfDay : "00:00";
			newTrigger.dayOfWeek = newDayOfWeek;
		} else if (newType === "interval") {
			newTrigger.intervalMinutes = Math.max(1, newIntervalHours * 60);
		}

		onAdd(newTrigger);
	};

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				submitTrigger();
			}}
			className="flex flex-col gap-3.5 rounded-xl border border-primary/25 bg-primary/3 p-4 shadow-sm"
		>
			<div className="flex items-center justify-between border-border/30 border-b pb-2">
				<h5 className="flex items-center gap-1.5 font-semibold text-primary text-xs">
					<Zap className="size-3.5" /> {m.admin_workers_new_trigger()}
				</h5>
				<Badge weight="normal" variant="primary-outline">
					{m.admin_workers_trigger_config()}
				</Badge>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div className="flex flex-col gap-1.5">
					<Label htmlFor={`${id}-type`} size="xs">
						{m.admin_workers_schedule_type()}
					</Label>
					<Select value={newType} onValueChange={(val) => val !== null && setNewType(val)}>
						<SelectTrigger density="compact" id={`${id}-type`}>
							<SelectValue placeholder={m.common_select_type()} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="startup">{m.admin_workers_trigger_startup()}</SelectItem>
							<SelectItem value="daily">{m.admin_workers_trigger_daily()}</SelectItem>
							<SelectItem value="weekly">{m.admin_workers_trigger_weekly()}</SelectItem>
							<SelectItem value="interval">{m.admin_workers_trigger_interval()}</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{newType === "daily" && (
					<div className="flex flex-col gap-1.5">
						<Label htmlFor={`${id}-time-daily`} size="xs">
							{m.admin_workers_time_hhmm()}
						</Label>
						<Input id={`${id}-time-daily`} type="time" value={newTimeOfDay} onChange={(e) => setNewTimeOfDay(e.target.value)} required />
					</div>
				)}

				{newType === "weekly" && (
					<>
						<div className="flex flex-col gap-1.5 sm:col-span-2">
							<Label size="xs">{m.admin_worker_day_of_week()}</Label>
							<fieldset className="grid grid-cols-4 gap-1.5 sm:grid-cols-7" aria-label={m.admin_worker_day_of_week()}>
								{DAYS_OF_WEEK.map((d) => (
									<button
										key={d.value}
										type="button"
										aria-pressed={newDayOfWeek === d.value}
										onClick={() => setNewDayOfWeek(d.value)}
										className={cn(
											"h-10 rounded-md border font-medium text-xs transition-[border-color,background-color,color,box-shadow] sm:h-8",
											newDayOfWeek === d.value
												? "border-primary bg-primary text-primary-foreground shadow-xs"
												: "border-border/60 bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground",
										)}
									>
										{d.short}
									</button>
								))}
							</fieldset>
						</div>
						<div className="flex flex-col gap-1.5 sm:col-span-2">
							<Label htmlFor={`${id}-time-weekly`} size="xs">
								{m.admin_workers_run_time_hhmm()}
							</Label>
							<Input id={`${id}-time-weekly`} type="time" value={newTimeOfDay} onChange={(e) => setNewTimeOfDay(e.target.value)} required />
						</div>
					</>
				)}

				{newType === "interval" && (
					<div className="flex flex-col gap-1.5">
						<Label htmlFor={`${id}-interval`} size="xs">
							{m.admin_worker_interval_hours()}
						</Label>
						<Input
							id={`${id}-interval`}
							type="number"
							min={1}
							max={168}
							value={newIntervalHours}
							onChange={(e) => setNewIntervalHours(Number(e.target.value))}
							required
						/>
					</div>
				)}

				<div className="flex flex-col gap-1.5">
					<Label htmlFor={`${id}-max-runtime`} tone="muted" size="xs">
						{m.admin_workers_timeout_optional_min()}
					</Label>
					<Input
						id={`${id}-max-runtime`}
						type="number"
						min={1}
						placeholder={m.admin_workers_no_limit()}
						value={newMaxRuntimeMinutes ?? ""}
						onChange={(e) => setNewMaxRuntimeMinutes(e.target.value ? Number(e.target.value) : undefined)}
					/>
				</div>
			</div>

			<div className="flex items-center justify-end gap-2 pt-1">
				<Button tone="muted" type="button" size="sm" variant="ghost" onClick={onCancel}>
					{m.common_cancel()}
				</Button>
				<Button type="submit" size="sm">
					{m.admin_workers_add_rule()}
				</Button>
			</div>
		</form>
	);
}
