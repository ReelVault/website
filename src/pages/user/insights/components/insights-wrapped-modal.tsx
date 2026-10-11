import { Sparkles } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { FullscreenDialog, FullscreenDialogTrigger } from "@/components/fullscreen-dialog";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { currentYear } from "@/utils/date-utils";

const LazyInsightsWrappedContent = lazy(async () => {
	const mod = await import("./insights-wrapped-content");

	return { default: mod.InsightsWrappedContent };
});

/**
 * Trigger + modal in one — the heavy chunk (slides + wrapped query) loads
 * only on first open, not on page mount.
 */
export function InsightsWrappedModal({ year }: { year?: number }) {
	const resolvedYear = year ?? currentYear();
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
					<Button type="button" variant="default" size="sm" className="group relative overflow-hidden">
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
