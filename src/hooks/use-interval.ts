import { useEffect, useRef } from "react";

/**
 * React hook for creating a stable interval that properly handles component re-renders and cleanup
 *
 * @param callback - The function to execute at each interval
 * @param delay - The delay in milliseconds between executions, or null to pause the interval
 *
 * @example
 * ```tsx
 * // Basic usage - run every second
 * useInterval({
 *   callback: () => console.log('Hello every second!'),
 *   delay: 1000
 * });
 *
 * // Conditional interval - pause when delay is null
 * const [isPaused, setIsPaused] = useState(false);
 * useInterval({
 *   callback: () => updateCounter(),
 *   delay: isPaused ? null : 1000
 * });
 *
 * // With state updates
 * const [count, setCount] = useState(0);
 * useInterval({
 *   callback: () => setCount(prev => prev + 1),
 *   delay: 500
 * });
 * ```
 */
export function useInterval({ callback, delay }: { callback: () => void; delay: number | null }) {
	const callbackRef = useRef(callback);

	// Store the latest callback to avoid stale closures
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		const intervalId = delay === null ? 0 : window.setInterval(() => callbackRef.current(), delay);

		return () => {
			window.clearInterval(intervalId);
		};
	}, [delay]);
}
