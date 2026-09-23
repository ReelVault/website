import { cn } from "cn";
import { Check, ImageIcon, Upload } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { useMetadataArtwork } from "@/client/hooks/use-admin-metadata-editor";
import { AppEmptyState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Image } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";

const SKELETON_SLOTS = [0, 1, 2, 3, 4, 5] as const;

export function MetadataArtworkDialog({
	metadataId,
	type,
	open,
	onOpenChange,
}: {
	metadataId: string;
	type: "poster" | "backdrop";
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { optionsQuery, selectMutation, uploadMutation } = useMetadataArtwork(metadataId, type, open, () => onOpenChange(false));

	const options = (optionsQuery.data ?? []).filter((option) => option.type === type);
	const title = type === "poster" ? m.admin_metadata_select_poster() : m.admin_metadata_select_panoramic_backdrop();
	const isPoster = type === "poster";

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error(m.admin_metadata_select_artwork_file());

			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			toast.error(m.admin_metadata_artwork_max_size());

			return;
		}

		uploadMutation.mutate({ type, file });
	};

	const skeletonGrid = (
		<div className={cn("grid gap-3", isPoster ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3")}>
			{SKELETON_SLOTS.map((index) => (
				<Skeleton key={`${type}-skeleton-${index}`} className={cn("w-full rounded-xl", isPoster ? "aspect-2/3" : "aspect-video")} />
			))}
		</div>
	);

	const optionsGrid = (
		<div
			className={cn("grid gap-3.5", isPoster ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3")}
		>
			{options.map((option) => (
				<button
					type="button"
					key={`${option.providerId}-${option.type}-${option.url}`}
					disabled={selectMutation.isPending || uploadMutation.isPending}
					onClick={() => selectMutation.mutate(option)}
					className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border/80 bg-muted/20 text-left transition-[border-color,background-color,color,box-shadow] hover:border-primary hover:shadow-xs disabled:opacity-60"
					title={m.admin_metadata_choose_from({ provider: option.providerName + (option.language ? ` · ${option.language}` : "") })}
				>
					<div className={cn("relative w-full overflow-hidden bg-muted/40", isPoster ? "aspect-2/3" : "aspect-video")}>
						<Image
							src={option.url}
							alt=""
							width={isPoster ? 220 : 360}
							height={isPoster ? 330 : 200}
							unoptimized
							className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
							loading="lazy"
						/>
						<div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
						<div className="absolute inset-x-0 bottom-0 p-2.5 opacity-0 transition-opacity group-hover:opacity-100">
							<span className="block truncate font-semibold text-white text-xs">{option.providerName}</span>
							{option.language && (
								<span className="font-mono text-[10px] text-white/80 uppercase">
									{m.admin_metadata_language_label({ language: option.language })}
								</span>
							)}
						</div>
					</div>
					{selectMutation.isSuccess && selectMutation.variables.url === option.url && (
						<span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
							<Check className="size-3.5" />
						</span>
					)}
				</button>
			))}
		</div>
	);

	let galleryContent: ReactNode;
	if (optionsQuery.isLoading) {
		galleryContent = skeletonGrid;
	} else if (options.length === 0) {
		galleryContent = (
			<AppEmptyState
				icon={ImageIcon}
				title={m.admin_metadata_no_available_artwork()}
				description={m.admin_metadata_no_artwork_suggestions()}
				className="min-h-48 border-0"
			/>
		);
	} else {
		galleryContent = optionsGrid;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] w-full gap-5 overflow-y-auto p-6 sm:max-w-3xl sm:p-7 lg:max-w-4xl">
				<DialogHeader className="border-border/60 border-b pb-3">
					<DialogTitle className="font-semibold text-xl tracking-tight">{title}</DialogTitle>
					<DialogDescription className="text-muted-foreground text-xs sm:text-sm">
						{m.admin_metadata_artwork_dialog_desc()}
					</DialogDescription>
				</DialogHeader>

				{/* Upload Bar */}
				<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/20 p-3.5">
					<div className="flex items-center gap-3">
						<input
							ref={fileInputRef}
							id={`upload-${type}`}
							name={`upload-${type}`}
							type="file"
							accept="image/*"
							aria-label={isPoster ? m.admin_metadata_upload_poster() : m.admin_metadata_upload_backdrop()}
							className="sr-only"
							onChange={handleFileChange}
						/>
						<AsyncButton
							type="button"
							variant="outline"
							size="default"
							isPending={uploadMutation.isPending}
							pendingLabel={m.admin_metadata_uploading()}
							disabled={selectMutation.isPending}
							onClick={() => fileInputRef.current?.click()}
							className="gap-2 shadow-xs"
						>
							<Upload className="size-4" />
							<span>{m.admin_metadata_upload_from_device()}</span>
						</AsyncButton>
						<p className="text-muted-foreground text-xs">{m.admin_metadata_upload_formats()}</p>
					</div>

					{options.length > 0 && (
						<Badge variant="secondary" size="sm" className="text-xs">
							{m.admin_metadata_available_artwork({ count: options.length })}
						</Badge>
					)}
				</div>

				{/* Gallery Grid */}
				<div className="max-h-[60vh] overflow-y-auto pr-1">{galleryContent}</div>
			</DialogContent>
		</Dialog>
	);
}
