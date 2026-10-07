import { useEffect, useState } from "react";

/**
 * React hook that debounces value updates to prevent excessive API calls or
 * re-renders. The returned value settles once `delay` has passed since the
 * last change (or the component unmounted).
 *
 * @param value - The value to debounce
 * @param delay - Debounce delay in milliseconds (default: 500)
 * @returns The debounced value that updates after the specified delay
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce({ value: searchTerm, delay: 300 });
 * ```
 */
export function useDebounce<T>({ delay = 500, value }: { delay?: number; value: T }): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const timeout = setTimeout(() => setDebouncedValue(value), delay);

		return () => clearTimeout(timeout);
	}, [delay, value]);

	return debouncedValue;
}
