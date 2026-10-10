import { type MouseEvent, useState } from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { m } from "@/paraglide/messages";

/**
 * Current page as an editable number, so any page can be reached directly.
 * Keyed by the current page, so the draft restarts from the real page after each change.
 */
function PageJump({
	currentPage,
	totalPages,
	disabled,
	onPageChange,
}: {
	currentPage: number;
	totalPages: number;
	disabled: boolean;
	onPageChange: (page: number) => void;
}) {
	const [draft, setDraft] = useState(String(currentPage));

	const commit = () => {
		const page = Number(draft);
		if (Number.isInteger(page) && page >= 1 && page <= totalPages && page !== currentPage) {
			onPageChange(page);
		} else {
			setDraft(String(currentPage));
		}
	};

	return (
		<div className="flex items-center gap-1.5 px-2 text-sm">
			<input
				type="number"
				inputMode="numeric"
				min={1}
				max={totalPages}
				value={draft}
				disabled={disabled}
				aria-label={m.common_page_of({ current: currentPage, total: totalPages })}
				onChange={(event) => setDraft(event.target.value)}
				onBlur={commit}
				onKeyDown={(event) => {
					if (event.key === "Enter") {
						event.preventDefault();
						commit();
					}
				}}
				className="h-10 w-14 rounded-md border border-input bg-transparent px-2 text-center tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 sm:h-8"
			/>
			<span className="text-muted-foreground tabular-nums">{`/ ${totalPages}`}</span>
		</div>
	);
}

/**
 * `variant="default"` — centered web pagination (bg-card).
 * `variant="admin"` — sticky admin-panel pagination (bg-background).
 */
export function SimplePagination({
	currentPage,
	totalPages,
	isLoading,
	onPageChange,
	variant = "default",
}: {
	currentPage: number;
	totalPages: number;
	isLoading?: boolean;
	onPageChange: (page: number) => void;
	variant?: "default" | "admin";
}) {
	const previousDisabled = currentPage === 1 || Boolean(isLoading);
	const nextDisabled = currentPage === totalPages || Boolean(isLoading);

	const handlePreviousClick = (event: MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		if (!previousDisabled) onPageChange(currentPage - 1);
	};

	const handleNextClick = (event: MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		if (!nextDisabled) onPageChange(currentPage + 1);
	};

	if (totalPages <= 1) return null;

	return (
		<Pagination
			className={
				variant === "admin"
					? "sticky bottom-2 z-50 mt-8 rounded-lg border border-border bg-background/95 px-3 py-1.5"
					: "mt-8 flex justify-center"
			}
		>
			<PaginationContent className={variant === "admin" ? undefined : "rounded-lg border border-border bg-card/80 p-1"}>
				<PaginationItem>
					<PaginationPrevious
						href="#"
						text={m.common_previous()}
						aria-disabled={previousDisabled}
						className={previousDisabled ? "pointer-events-none opacity-50" : undefined}
						onClick={handlePreviousClick}
					/>
				</PaginationItem>
				<PaginationItem>
					<PageJump
						key={currentPage}
						currentPage={currentPage}
						totalPages={totalPages}
						disabled={Boolean(isLoading)}
						onPageChange={onPageChange}
					/>
				</PaginationItem>
				<PaginationItem>
					<PaginationNext
						href="#"
						text={m.components_simple_pagination_next()}
						aria-disabled={nextDisabled}
						className={nextDisabled ? "pointer-events-none opacity-50" : undefined}
						onClick={handleNextClick}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
