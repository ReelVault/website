import { Save } from "lucide-react";
import { useState } from "react";
import type { LibraryWithRelations, SidecarFlavor } from "@reelvault/sdk";
import { useAdminLibraries } from "@/client/hooks/use-libraries";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import type { PathField } from "./library-constants";
import { createPathField } from "./library-constants";
import { LibraryPathsSection } from "./library-paths-section";
import { LibraryTypeSelector } from "./library-type-selector";
import { SidecarFlavorSelector } from "./sidecar-flavor-selector";

interface EditLibraryFormProps {
	library: LibraryWithRelations;
	onClose: () => void;
}

export function EditLibraryForm({ library, onClose }: EditLibraryFormProps) {
	const { updateLibrary, isUpdating: isSubmitting } = useAdminLibraries();

	const [name, setName] = useState(library.name);
	const [type, setType] = useState<"movies" | "tv_shows">(library.type);
	const [sidecarFlavor, setSidecarFlavor] = useState<SidecarFlavor>(library.sidecarFlavor);
	const [paths, setPaths] = useState<PathField[]>(() =>
		library.paths.map((p) => createPathField(p.path, p.metadataStorageMode ?? undefined)),
	);

	const submitChanges = () => {
		const validPaths = paths.flatMap(({ value, metadataStorageMode }) =>
			value.trim() !== ""
				? [
						{
							path: value,
							...(metadataStorageMode !== undefined && { metadataStorageMode }),
						},
					]
				: [],
		);
		if (!name.trim() || validPaths.length === 0) return;

		detach(async () => {
			try {
				await updateLibrary({
					id: library.id,
					data: {
						name: name.trim(),
						type,
						sidecarFlavor,
						paths: validPaths,
					},
				});
				onClose();
			} catch (error) {
				console.error("Failed to update library", error);
			}
		});
	};

	return (
		<>
			<DialogHeader className="gap-1.5 border-border/60 border-b pb-4">
				<DialogTitle className="font-semibold text-xl tracking-tight sm:text-2xl">{m.admin_libraries_edit_library()}</DialogTitle>
				<DialogDescription className="text-muted-foreground text-sm">{m.admin_libraries_edit_desc()}</DialogDescription>
			</DialogHeader>

			<form
				onSubmit={(event) => {
					event.preventDefault();
					submitChanges();
				}}
				className="flex flex-col gap-6"
			>
				{/* Step 1: Type Selection */}
				<LibraryTypeSelector value={type} onChange={setType} />

				{/* Step 2: Name */}
				<div className="flex flex-col gap-2">
					<Label htmlFor="edit-lib-name" className="font-medium text-foreground text-sm">
						{m.admin_libraries_name_label()}
					</Label>
					<Input
						id="edit-lib-name"
						name="library-name"
						autoComplete="off"
						required
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder={type === "movies" ? m.admin_libraries_name_movies_placeholder() : m.admin_libraries_name_series_placeholder()}
						className="h-10 bg-background px-3.5 text-sm"
					/>
				</div>

				{/* Step 3: Source Paths */}
				<LibraryPathsSection paths={paths} onChange={setPaths} idPrefix="edit" showDashedAddButton={paths.length === 1} />

				{/* Step 4: Sidecar NFO format */}
				<SidecarFlavorSelector value={sidecarFlavor} onChange={setSidecarFlavor} />

				{/* Footer */}
				<DialogFooter className="gap-3 border-border/60 border-t pt-4 sm:justify-end">
					<Button type="button" variant="outline" size="default" onClick={onClose}>
						{m.common_cancel()}
					</Button>
					<AsyncButton
						type="submit"
						size="default"
						isPending={isSubmitting}
						pendingLabel={m.common_saving_changes()}
						disabled={!name.trim() || paths.every((path) => !path.value.trim())}
						className="gap-2 font-medium"
					>
						<Save className="size-4" />
						<span>{m.common_save_changes()}</span>
					</AsyncButton>
				</DialogFooter>
			</form>
		</>
	);
}
