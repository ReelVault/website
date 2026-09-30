import type { LibraryProviderPriority, LibraryWithRelations, SidecarFlavor } from "@reelvault/sdk";
import { Save } from "lucide-react";
import { useState } from "react";
import { useAdminMetadataProviders } from "@/client/hooks/use-admin-providers";
import { useAdminLibraries } from "@/client/hooks/use-libraries";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import type { PathField } from "./library-constants";
import { createPathField } from "./library-constants";
import { LibraryPathsSection } from "./library-paths-section";
import { LibraryTypeSelector } from "./library-type-selector";
import { MetadataLanguageSelector } from "./metadata-language-selector";
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
	const [metadataLanguage, setMetadataLanguage] = useState<string | null>(library.metadataLanguage ?? null);
	const [paths, setPaths] = useState<PathField[]>(() =>
		library.paths.map((p) => createPathField(p.path, p.metadataStorageMode ?? undefined)),
	);
	const [providerPriorities, setProviderPriorities] = useState<LibraryProviderPriority[]>(() => library.providerPriorities ?? []);
	const { data: metadataProviders = [] } = useAdminMetadataProviders();
	const providers = metadataProviders.map((provider) => ({
		id: provider.id,
		name: provider.name,
		priority: provider.priority,
		enabled: provider.enabled,
	}));

	function upsertPriority(providerId: string, globalPriority: number, enabled: boolean, priority: number): void {
		setProviderPriorities((previous) => {
			const rest = previous.filter((item) => item.providerId !== providerId);

			return [...rest, { providerId, priority: priority || globalPriority, enabled }];
		});
	}

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
						metadataLanguage,
						paths: validPaths,
						...(providerPriorities.length > 0 && { providerPriorities }),
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

				{/* Step 4b: Per-library metadata language */}
				<MetadataLanguageSelector value={metadataLanguage} onChange={setMetadataLanguage} />

				{/* Step 5: Metadata provider overrides (empty = global order) */}
				{providers.length > 0 && (
					<div className="flex flex-col gap-2 rounded-2xl border border-border p-4">
						<div className="flex items-center justify-between gap-2">
							<Label className="font-medium text-sm">{m.admin_libraries_provider_overrides()}</Label>
							{providerPriorities.length > 0 && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="text-muted-foreground text-xs"
									onClick={() => setProviderPriorities([])}
								>
									{m.admin_libraries_provider_overrides_reset()}
								</Button>
							)}
						</div>
						<p className="text-muted-foreground text-xs">{m.admin_libraries_provider_overrides_desc()}</p>
						{providers.map((provider) => {
							const override = providerPriorities.find((item) => item.providerId === provider.id);
							const priority = override?.priority ?? provider.priority;

							return (
								<div key={provider.id} className="flex items-center justify-between gap-3">
									<Label className="min-w-0 flex-1 truncate font-normal">{provider.name}</Label>
									<Input
										type="number"
										min={1}
										max={10_000}
										value={priority}
										onChange={(event) => {
											const nextPriority = Number(event.target.value);
											if (Number.isNaN(nextPriority)) return;
											upsertPriority(provider.id, provider.priority, override?.enabled ?? provider.enabled, nextPriority);
										}}
										className="h-8 w-20 bg-background text-sm"
									/>
									<Switch
										checked={override?.enabled ?? provider.enabled}
										onCheckedChange={(checked) => upsertPriority(provider.id, provider.priority, checked, priority)}
									/>
								</div>
							);
						})}
					</div>
				)}

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
