import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AlertTriangle, Combine, Search } from "lucide-react";
import { useState } from "react";
import type { MetadataWithRelation } from "@reelvault/sdk";
import { reelvault } from "@/client/client";
import { metadataKeys } from "@/client/utils/query-keys";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SkeletonList } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { MergeMetadataCandidateItem } from "./merge-metadata-candidate-item";

export function MergeMetadataDialog({
	metadata,
	open,
	onOpenChange,
	onMerge,
	isMerging,
}: {
	metadata: MetadataWithRelation;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onMerge: (sourceMetadataId: string) => Promise<unknown>;
	isMerging: boolean;
}) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
	const debouncedSearch = useDebounce({ value: searchQuery, delay: 350 });

	const candidatesQuery = useQuery({
		queryKey: metadataKeys.mergeCandidates(metadata.type, debouncedSearch),
		placeholderData: keepPreviousData,
		enabled: open,
		queryFn: async () => {
			const res = await reelvault.metadata.getAll({
				title: debouncedSearch.trim() || undefined,
				type: metadata.type,
				limit: 20,
			});

			return res.data.filter((item) => item.id !== metadata.id);
		},
		staleTime: 120_000,
	});

	const candidates = candidatesQuery.data ?? [];

	const handleConfirmMerge = () => {
		if (!selectedSourceId) {
			toast.error(m.admin_metadata_select_item_to_link());

			return;
		}

		detach(async () => {
			try {
				await onMerge(selectedSourceId);
				onOpenChange(false);
				setSelectedSourceId(null);
				setSearchQuery("");
			} catch {
				// handled in mutation
			}
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] w-full gap-5 overflow-y-auto p-6 sm:max-w-2xl sm:p-7">
				<DialogHeader className="border-border/60 border-b pb-3">
					<div className="flex items-center gap-2 text-primary">
						<Combine className="size-5" />
						<DialogTitle className="font-semibold text-xl tracking-tight">{m.admin_metadata_link_metadata()}</DialogTitle>
					</div>
					<DialogDescription className="text-muted-foreground text-xs sm:text-sm">
						{m.admin_metadata_merge_desc_1()} <strong>{m.admin_metadata_merge_quoted_title({ title: metadata.title })}</strong>
						{m.admin_metadata_merge_desc_2()}
					</DialogDescription>
				</DialogHeader>

				{/* Search bar */}
				<div className="relative">
					<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder={m.admin_metadata_search_second_title()}
						className="h-10 bg-background pl-9 text-sm"
					/>
				</div>

				{/* Candidate list */}
				<div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
					{candidatesQuery.isLoading && <SkeletonList count={3} itemClassName="h-16 w-full rounded-xl" />}

					{candidatesQuery.isError && (
						<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center text-destructive text-sm">
							{m.admin_metadata_search_error()}{" "}
							<button
								type="button"
								onClick={() => detach(() => candidatesQuery.refetch())}
								className="font-medium underline underline-offset-2 hover:text-destructive/80"
							>
								{m.common_try_again()}
							</button>
						</div>
					)}

					{!(candidatesQuery.isLoading || candidatesQuery.isError) && candidates.length === 0 && (
						<div className="rounded-xl border border-border border-dashed p-6 text-center text-muted-foreground text-sm">
							{searchQuery ? m.admin_metadata_no_same_type_matches() : m.admin_metadata_find_duplicate_hint()}
						</div>
					)}

					{candidates.map((cand) => (
						<MergeMetadataCandidateItem
							key={cand.id}
							candidate={cand}
							isSelected={selectedSourceId === cand.id}
							onSelect={setSelectedSourceId}
						/>
					))}
				</div>

				{/* Warning banner */}
				<div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-3.5 text-warning text-xs leading-relaxed">
					<AlertTriangle className="size-4 shrink-0" />
					<span>
						<strong>{m.admin_metadata_merge_warning_title()}</strong> {m.admin_metadata_merge_warning()}
					</span>
				</div>

				<DialogFooter className="gap-2 sm:justify-end">
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
						{m.common_cancel()}
					</Button>
					<AsyncButton
						type="button"
						variant="default"
						disabled={!selectedSourceId}
						isPending={isMerging}
						pendingLabel={m.admin_metadata_linking()}
						onClick={handleConfirmMerge}
						className="gap-1.5"
					>
						<Combine className="size-4" />
						<span>{m.admin_metadata_link_to_title()}</span>
					</AsyncButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
