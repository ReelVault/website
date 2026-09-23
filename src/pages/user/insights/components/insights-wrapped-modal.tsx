import { Sparkles } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { FullscreenDialog, FullscreenDialogTrigger } from "@/components/fullscreen-dialog";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

const LazyInsightsWrappedContent = lazy(async () => {
	const mod = await import("./insights-wrapped-content");

	return { default: mod.InsightsWrappedContent };
});

/**
 * Trigger + modal in one — the heavy chunk (slides + wrapped query) loads
 * only on first open, not on page mount.
 */
export function InsightsWrappedModal({ year }: { year?: number }) {
	const resolvedYear = year ?? new Date().getFullYear();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<FullscreenDialog
			open={isOpen}
			onOpenChange={(open) => {
				setIsOpen(open);
			}}
		>
			<FullscreenDialogTrigger
				render={
					<Button
						type="button"
						variant="default"
						className="group relative overflow-hidden bg-linear-to-r from-amber-500 via-primary to-purple-600 px-4 py-2 font-bold text-white text-xs shadow-lg transition-[border-color,background-color,color,box-shadow] hover:scale-105 hover:shadow-primary/25"
					>
						<Sparkles className="mr-2 size-4 animate-pulse text-amber-300" />
						<span>{m.user_wrapped_title({ year: resolvedYear })}</span>
					</Button>
				}
			/>

			{isOpen && (
				<Suspense fallback={null}>
					<LazyInsightsWrappedContent year={year} resolvedYear={resolvedYear} />
				</Suspense>
			)}
		</FullscreenDialog>
	);
}
