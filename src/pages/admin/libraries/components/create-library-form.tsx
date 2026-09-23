import { useForm } from "@tanstack/react-form";
import { FolderPlus } from "lucide-react";
import type { SidecarFlavor } from "reelvault-sdk";
import { useAdminLibraries } from "@/client/hooks/use-libraries";
import { AsyncButton } from "@/components/async-button";
import {
	FullscreenDialogDescription,
	FullscreenDialogFooter,
	FullscreenDialogHeader,
	FullscreenDialogTitle,
} from "@/components/fullscreen-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import type { PathField } from "./library-constants";
import { createPathField } from "./library-constants";
import { LibraryPathsSection } from "./library-paths-section";
import { LibraryTypeSelector } from "./library-type-selector";
import { SidecarFlavorSelector } from "./sidecar-flavor-selector";

interface CreateLibraryFormProps {
	onClose: () => void;
}

/** TanStack Form pilot (T5): static-shape form — typed fields + submit gating. */
export function CreateLibraryForm({ onClose }: CreateLibraryFormProps) {
	const { createLibrary, isCreating: isSubmitting } = useAdminLibraries();

	const form = useForm({
		defaultValues: {
			name: "",
			type: "movies" as "movies" | "tv_shows",
			sidecarFlavor: "reelvault" as SidecarFlavor,
			paths: [createPathField()] as PathField[],
		},
		onSubmit: async ({ value }) => {
			const validPaths = value.paths.flatMap(({ value: pathValue, metadataStorageMode }) =>
				pathValue.trim() !== ""
					? [
							{
								path: pathValue,
								...(metadataStorageMode !== undefined && { metadataStorageMode }),
							},
						]
					: [],
			);
			if (!value.name.trim() || validPaths.length === 0) return;

			try {
				await createLibrary({
					name: value.name.trim(),
					type: value.type,
					sidecarFlavor: value.sidecarFlavor,
					paths: validPaths,
				});
				onClose();
			} catch (error) {
				console.error("Failed to create library", error);
			}
		},
	});

	return (
		<>
			<FullscreenDialogHeader className="gap-1.5 border-border/60 border-b pb-4">
				<FullscreenDialogTitle className="font-semibold text-xl tracking-tight sm:text-2xl">
					{m.admin_libraries_create_heading()}
				</FullscreenDialogTitle>
				<FullscreenDialogDescription className="text-muted-foreground text-sm">
					{m.admin_libraries_create_desc()}
				</FullscreenDialogDescription>
			</FullscreenDialogHeader>

			<form
				onSubmit={(event) => {
					event.preventDefault();
					detach(form.handleSubmit());
				}}
				className="flex flex-col gap-6"
			>
				{/* Step 1: Type Selection */}
				<form.Field name="type">
					{(field) => <LibraryTypeSelector value={field.state.value} onChange={(next) => field.handleChange(next)} />}
				</form.Field>

				{/* Step 2: Name */}
				<form.Field name="name">
					{(field) => (
						<div className="flex flex-col gap-2">
							<Label htmlFor="create-lib-name" className="font-medium text-foreground text-sm">
								{m.admin_libraries_name_label()}
							</Label>
							<Input
								id="create-lib-name"
								name="library-name"
								autoComplete="off"
								required
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder={
									field.form.state.values.type === "movies"
										? m.admin_libraries_name_movies_placeholder()
										: m.admin_libraries_name_series_placeholder()
								}
								className="h-10 bg-background px-3.5 text-sm"
							/>
						</div>
					)}
				</form.Field>

				{/* Step 3: Source Paths */}
				<form.Field name="paths">
					{(field) => <LibraryPathsSection paths={field.state.value} onChange={field.handleChange} idPrefix="create" showDashedAddButton />}
				</form.Field>

				{/* Step 4: Sidecar NFO format */}
				<form.Field name="sidecarFlavor">
					{(field) => <SidecarFlavorSelector value={field.state.value} onChange={(next) => field.handleChange(next)} />}
				</form.Field>

				{/* Footer */}
				<FullscreenDialogFooter className="gap-3 border-border/60 border-t pt-4 sm:justify-end">
					<Button type="button" variant="outline" size="default" onClick={onClose}>
						{m.common_cancel()}
					</Button>
					<form.Subscribe selector={(state) => !state.values.name.trim() || state.values.paths.every((path) => !path.value.trim())}>
						{(submitDisabled) => (
							<AsyncButton
								type="submit"
								size="default"
								isPending={isSubmitting}
								pendingLabel={m.admin_libraries_creating()}
								disabled={submitDisabled}
								className="gap-2 font-medium"
							>
								<FolderPlus className="size-4" />
								<span>{m.admin_libraries_create_library()}</span>
							</AsyncButton>
						)}
					</form.Subscribe>
				</FullscreenDialogFooter>
			</form>
		</>
	);
}
