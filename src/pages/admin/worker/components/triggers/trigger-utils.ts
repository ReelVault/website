import type { TaskTrigger, TaskTriggerType } from "@reelvault/sdk";
import { CalendarDays, Clock, Hourglass, Rocket, Zap } from "lucide-react";
import { m } from "@/paraglide/messages";

export const DAYS_OF_WEEK = [
	{
		value: 1,
		get label() {
			return m.admin_worker_monday();
		},
		get short() {
			return m.admin_worker_day_mon();
		},
	},
	{
		value: 2,
		get label() {
			return m.admin_worker_tuesday();
		},
		get short() {
			return m.admin_worker_day_tue();
		},
	},
	{
		value: 3,
		get label() {
			return m.admin_worker_wednesday();
		},
		get short() {
			return m.admin_worker_day_wed();
		},
	},
	{
		value: 4,
		get label() {
			return m.admin_worker_thursday();
		},
		get short() {
			return m.admin_worker_day_thu();
		},
	},
	{
		value: 5,
		get label() {
			return m.admin_worker_friday();
		},
		get short() {
			return m.admin_worker_day_fri();
		},
	},
	{
		value: 6,
		get label() {
			return m.admin_worker_saturday();
		},
		get short() {
			return m.admin_worker_day_sat();
		},
	},
	{
		value: 0,
		get label() {
			return m.admin_worker_sunday();
		},
		get short() {
			return m.admin_worker_day_sun();
		},
	},
] as const;

export const DAY_LABELS: Record<number, string> = {
	get 1() {
		return m.admin_worker_monday();
	},
	get 2() {
		return m.admin_worker_tuesday();
	},
	get 3() {
		return m.admin_worker_wednesday();
	},
	get 4() {
		return m.admin_worker_thursday();
	},
	get 5() {
		return m.admin_worker_friday();
	},
	get 6() {
		return m.admin_worker_saturday();
	},
	get 0() {
		return m.admin_worker_sunday();
	},
};

function formatTriggerTime(timeOfDay: string | undefined): string {
	return timeOfDay !== undefined && timeOfDay.length > 0 ? timeOfDay : "00:00";
}

export function formatTriggerDescription(trigger: TaskTrigger): string {
	switch (trigger.type) {
		case "startup":
			return m.admin_worker_trigger_startup_desc();
		case "daily":
			return m.admin_worker_trigger_daily_at({ time: formatTriggerTime(trigger.timeOfDay) });
		case "weekly": {
			const dayName = (trigger.dayOfWeek !== undefined ? DAY_LABELS[trigger.dayOfWeek] : undefined) ?? m.admin_worker_on_scheduled_day();

			return m.admin_worker_trigger_weekly_at({ day: dayName, time: formatTriggerTime(trigger.timeOfDay) });
		}
		case "interval": {
			const mins = trigger.intervalMinutes ?? 1440;
			if (mins % 1440 === 0) {
				const days = mins / 1440;

				return m.admin_worker_trigger_days_interval({ count: days });
			}

			if (mins % 60 === 0) {
				const hours = mins / 60;

				return m.admin_worker_trigger_hours_interval({ count: hours });
			}

			return m.admin_worker_trigger_minutes_interval({ count: mins });
		}
		default:
			return m.admin_worker_trigger_custom();
	}
}

export function getTriggerIcon(type: TaskTriggerType) {
	switch (type) {
		case "startup":
			return Rocket;
		case "daily":
			return Clock;
		case "weekly":
			return CalendarDays;
		case "interval":
			return Hourglass;
		default:
			return Zap;
	}
}
