import type { ReactNode } from "react";
import { useInView } from "react-intersection-observer";

export function LazyRender({
	children,
	className,
	rootMargin = "400px 0px",
	minHeight,
}: {
	children: () => ReactNode;
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
			{inView ? children() : null}
		</div>
	);
}
