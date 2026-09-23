import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function RouteProgressBar() {
	const isLoading = useRouterState({
		select: (s) => s.status === "pending" || s.isLoading,
	});
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		// Show after a small delay to prevent flicker on instant (0ms) cached
		// transitions; hide on the next tick once loading finishes.
		const timer = setTimeout(() => setVisible(isLoading), isLoading ? 120 : 0);

		return () => clearTimeout(timer);
	}, [isLoading]);

	if (!visible) return null;

	return (
		<div
			aria-hidden="true"
			className="pointer-events-none fixed top-0 right-0 left-0 z-10000 h-[2.5px] overflow-hidden bg-primary/20 backdrop-blur-xs"
		>
			<div className="h-full w-full origin-left animate-[loading_1.2s_infinite_ease-in-out] bg-linear-to-r from-primary/60 via-primary to-primary shadow-[0_0_12px_color-mix(in_oklab,var(--primary)_80%,transparent)]" />
		</div>
	);
}
