import { Moon } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { m } from "@/paraglide/messages";
import { setSleepTimer, useSleepTimer } from "../utils/player-sleep-timer";
import { PlayerControlButton } from "./player-control-button";

const TIMER_MINUTES = [15, 30, 45, 60] as const;

function select(next: string): void {
	if (next === "off") setSleepTimer({ kind: "off" });
	else if (next === "episode") setSleepTimer({ kind: "episode" });
	else setSleepTimer({ kind: "timer", minutes: Number(next), endsAt: Date.now() + Number(next) * 60_000 });
}

export function PlayerSleepTimerMenu() {
	const sleepTimer = useSleepTimer();

	let value = "off";
	if (sleepTimer.kind === "timer") value = String(sleepTimer.minutes);
	else if (sleepTimer.kind === "episode") value = "episode";

	const stopsAt =
		sleepTimer.kind === "timer" ? new Date(sleepTimer.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;

	return (
		<DropdownMenu>
			<PlayerControlButton
				description={m.player_sleep_timer()}
				render={<DropdownMenuTrigger aria-label={m.player_sleep_timer()} />}
				className={value === "off" ? undefined : "text-primary"}
			>
				<Moon className="size-5" aria-hidden="true" />
			</PlayerControlButton>
			<DropdownMenuContent side="top" align="end" className="w-60">
				<DropdownMenuRadioGroup value={value} onValueChange={(next) => select(String(next))}>
					<DropdownMenuLabel>{stopsAt ? m.player_sleep_timer_stops_at({ time: stopsAt }) : m.player_sleep_timer()}</DropdownMenuLabel>
					<DropdownMenuRadioItem value="off">{m.player_sleep_timer_off()}</DropdownMenuRadioItem>
					{TIMER_MINUTES.map((minutes) => (
						<DropdownMenuRadioItem key={minutes} value={String(minutes)}>
							{m.player_sleep_timer_minutes({ minutes })}
						</DropdownMenuRadioItem>
					))}
					<DropdownMenuRadioItem value="episode">{m.player_sleep_timer_end_of_episode()}</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
