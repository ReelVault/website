import type { MouseEvent } from "react";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { m } from "@/paraglide/messages";

const handleCurrentClick = (event: MouseEvent<HTMLAnchorElement>) => {
	event.preventDefault();
};

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
					<PaginationLink
						href="#"
						isActive
						aria-label={m.common_page_of({ current: currentPage, total: totalPages })}
						onClick={handleCurrentClick}
					>
						{m.common_page_indicator({ current: currentPage, total: totalPages })}
					</PaginationLink>
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
