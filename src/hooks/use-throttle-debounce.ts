import { useEffect, useRef, useState } from "react";

/**
 * React hook for throttling or debouncing value updates with unified logic
 *
 * Provides a base implementation for both throttling and debouncing that can
 * be used by specialized hooks. Eliminates code duplication between
 * useThrottle and useDebounce implementations.
 *
 * @param delay - Delay in milliseconds
 * @param mode - Whether to throttle or debounce the value
 * @param value - The value to throttle/debounce
 * @returns The throttled/debounced value
 *
 * @example
 * ```tsx
 * // Throttle mode - limits updates to once per delay period
 * const throttledValue = useThrottleDebounce({
 *   delay: 300,
 *   mode: 'throttle',
 *   value: searchTerm
 * });
 *
 * // Debounce mode - delays updates until value stops changing
 * const debouncedValue = useThrottleDebounce({
 *   delay: 300,
 *   mode: 'debounce',
 *   value: inputValue
 * });
 *
 * // Real-world usage with search
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useThrottleDebounce({
 *   delay: 500,
 *   mode: 'debounce',
 *   value: query
 * });
 *
 * useEffect(() => {
 *   if (debouncedQuery) {
 *     performSearch(debouncedQuery);
 *   }
 * }, [debouncedQuery]);
 * ```
 */
export function useThrottleDebounce<T>({ delay, mode, value }: { delay: number; mode: "throttle" | "debounce"; value: T }): T {
	const [processedValue, setProcessedValue] = useState<T>(value);
	const lastExecutedRef = useRef<number>(0);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// Clear existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		if (mode === "throttle") {
			const now = Date.now();
			const timeSinceLastExecution = now - lastExecutedRef.current;

			if (timeSinceLastExecution >= delay) {
				// Execute immediately if enough time has passed
				setProcessedValue(value);
				lastExecutedRef.current = now;
			} else {
				// Schedule execution for remaining time
				timeoutRef.current = setTimeout(() => {
					setProcessedValue(value);
					lastExecutedRef.current = Date.now();
				}, delay - timeSinceLastExecution);
			}
		} else {
			// Debounce: delay execution until value stops changing
			timeoutRef.current = setTimeout(() => {
				setProcessedValue(value);
			}, delay);
		}

		// Cleanup function
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [delay, mode, value]);

	return processedValue;
}
