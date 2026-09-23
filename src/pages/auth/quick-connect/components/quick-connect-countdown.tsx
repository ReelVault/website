import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { m } from "@/paraglide/messages";
import { formatCountdown } from "@/utils/format-utils";

interface QuickConnectCountdownProps {
	expiresAt: number;
	onExpire?: () => void;
	gapClass?: string;
}

export function QuickConnectCountdown({ expiresAt, onExpire, gapClass = "gap-2" }: QuickConnectCountdownProps) {
	const [remainingSeconds, setRemainingSeconds] = useState(() => Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));

	useEffect(() => {
		const updateTimer = () => {
			const left = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
			setRemainingSeconds(left);
			if (left <= 0) {
				onExpire?.();
			}
		};

		updateTimer();
		const timer = setInterval(updateTimer, 1000);

		return () => clearInterval(timer);
	}, [expiresAt, onExpire]);

	return (
		<div className={`flex items-center ${gapClass} font-medium text-muted-foreground text-xs`}>
			<Clock className="size-3.5" aria-hidden="true" /> {m.auth_valid_for_label()}{" "}
			<span className="font-bold text-foreground">{formatCountdown(remainingSeconds)}</span>
		</div>
	);
}
