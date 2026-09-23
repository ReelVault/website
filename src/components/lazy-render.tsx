import type { ReactNode } from "react";
import { useInView } from "react-intersection-observer";

export function LazyRender({
	children,
	placeholder,
	className,
	rootMargin = "400px 0px",
	minHeight,
}: {
	children: () => ReactNode;
	placeholder?: ReactNode;
	className?: string;
	rootMargin?: string;
	minHeight?: string | number;
}) {
	const { ref, inView } = useInView({
		triggerOnce: true,
		rootMargin,
	});

	return (
		<div ref={ref} className={className} style={!inView && minHeight !== undefined ? { minHeight } : undefined}>
			{inView ? children() : (placeholder ?? null)}
		</div>
	);
}
