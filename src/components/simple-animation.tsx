import { cn } from "cn";
import { type CSSProperties, type HTMLAttributes, type ReactNode, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import "@/styles/simple-animation.css";

type Direction = "up" | "down" | "left" | "right" | "scale" | "none";
type Trigger = "in-view" | "mount";
type AnimateProp = "opacity" | "transform";

const DEFAULT_ANIMATE: AnimateProp[] = ["opacity", "transform"];

const DIRECTION_TRANSFORM: Record<Direction, string> = {
	up: "translateY(16px)",
	down: "translateY(-16px)",
	left: "translateX(16px)",
	right: "translateX(-16px)",
	scale: "scale(0.98)",
	none: "none",
};

export function SimpleAnimation({
	children,
	direction = "none",
	from,
	delay = 0,
	duration = 360,
	className,
	trigger = "in-view",
	animate = DEFAULT_ANIMATE,
	...props
}: {
	children: ReactNode;
	direction?: Direction;
	from?: { opacity?: number; transform?: string };
	delay?: number;
	duration?: number;
	className?: string;
	trigger?: Trigger;
	animate?: AnimateProp[];
} & Omit<HTMLAttributes<HTMLDivElement>, "children">) {
	const { ref, inView } = useInView({
		triggerOnce: true,
		rootMargin: "-24px 0px",
		skip: trigger !== "in-view",
	});

	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		if (trigger !== "mount") {
			return () => {
				// No-op: nothing is scheduled outside mount-triggered animation.
			};
		}

		const id = requestAnimationFrame(() => setMounted(true));

		return () => cancelAnimationFrame(id);
	}, [trigger]);

	const isVisible = trigger === "mount" ? mounted : inView;

	const style: CSSProperties = {
		transitionDuration: `${duration}ms`,
		transitionDelay: `${delay}ms`,
		...(animate.includes("opacity") && {
			opacity: isVisible ? 1 : (from?.opacity ?? 0),
		}),
		...(animate.includes("transform") && {
			transform: isVisible ? "none" : (from?.transform ?? DIRECTION_TRANSFORM[direction]),
		}),
	};

	return (
		<div
			{...props}
			ref={trigger === "in-view" ? ref : undefined}
			style={style}
			className={cn("simple-animation transition-[opacity,transform] ease-out", className)}
		>
			{children}
		</div>
	);
}
