import { useThrottleDebounce } from "./use-throttle-debounce";

/**
 * React hook that debounces value updates to prevent excessive API calls or re-renders
 *
 * Uses the base useThrottleDebounce hook for implementation. Debounces value
 * changes by delaying updates until a specified time has passed since the
 * last change.
 *
 * @param value - The value to debounce
 * @param delay - Debounce delay in milliseconds (default: 500)
 * @returns The debounced value that updates after the specified delay
 *
 * @example
 * ```tsx
 * // Basic usage for search input
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce({
 *   value: searchTerm,
 *   delay: 300
 * });
 *
 * // Use in effect for API calls
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     searchAPI(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>({ delay = 500, value }: { delay?: number; value: T }): T {
	return useThrottleDebounce({ value, delay, mode: "debounce" });
}
