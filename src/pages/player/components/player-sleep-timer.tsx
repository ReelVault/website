import { useEffect } from "react";
import { usePlayerActions } from "../player-context";
import { setSleepTimer, useSleepTimer } from "../utils/player-sleep-timer";
import { noopCleanup } from "../utils/player-utils";

/** Headless: pauses playback when a minute-based sleep timer expires and clears the timer when the player closes. */
export function PlayerSleepTimerController() {
	const { videoRef, setUserPlayIntent } = usePlayerActions();
	const sleepTimer = useSleepTimer();

	useEffect(() => {
		if (sleepTimer.kind !== "timer") return noopCleanup;

		const timeout = setTimeout(
			() => {
				setUserPlayIntent(false);
				videoRef.current?.pause();
				setSleepTimer({ kind: "off" });
			},
			Math.max(0, sleepTimer.endsAt - Date.now()),
		);

		return () => clearTimeout(timeout);
	}, [sleepTimer, videoRef, setUserPlayIntent]);

	useEffect(() => () => setSleepTimer({ kind: "off" }), []);

	return null;
}
