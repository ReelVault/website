import { useEffect, useRef, useState } from "react";

export function useHeroRotator({ length, delay = 10000 }: { length: number; delay?: number }) {
	const [current, setCurrent] = useState(0);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const goTo = (index: number) => {
		setCurrent(((index % length) + length) % length);
	};

	useEffect(() => {
		const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (!prefersReducedMotion && length > 1) {
			timerRef.current = setInterval(() => {
				setCurrent((prev) => (prev + 1) % length);
			}, delay);
		}

		return () => {
			if (timerRef.current) clearInterval(timerRef.current);

			timerRef.current = null;
		};
	}, [length, delay]);

	return { current, goTo };
}
