import { cn } from "cn";
import type { Key, ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function ResponsiveDataList<T>({
	items,
	getKey,
	renderTable,
	renderCard,
	className,
}: {
	items: readonly T[];
	getKey: (item: T) => Key;
	renderTable: (items: readonly T[]) => ReactNode;
	renderCard: (item: T) => ReactNode;
	className?: string;
}) {
	const isMobile = useIsMobile();

	// Only the active variant mounts — the old CSS-hidden double render mounted
	// every row twice (table + card), doubling ContextMenu/dropdown subtrees.
	return (
		<div className={cn("w-full", className)}>
			{isMobile ? (
				<div className="flex flex-col gap-3">
					{items.map((item) => (
						<div key={getKey(item)}>{renderCard(item)}</div>
					))}
				</div>
			) : (
				renderTable(items)
			)}
		</div>
	);
}
