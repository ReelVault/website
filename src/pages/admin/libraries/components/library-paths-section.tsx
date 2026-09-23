import { Plus } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { m } from "@/paraglide/messages";
import type { PathField } from "./library-constants";
import { createPathField } from "./library-constants";
import { LibraryPathInputRow } from "./library-path-input-row";

const PathPickerDialog = lazy(async () => {
	const mod = await import("@/components/path-picker-dialog");

	return { default: mod.PathPickerDialog };
});

interface LibraryPathsSectionProps {
	paths: PathField[];
	onChange: (updater: (current: PathField[]) => PathField[]) => void;
	idPrefix: string;
	showDashedAddButton?: boolean;
}

export function LibraryPathsSection({ paths, onChange, idPrefix, showDashedAddButton = true }: LibraryPathsSectionProps) {
	const [pickerState, setPickerState] = useState<{ open: boolean; index: number | null; initialPath: string }>({
		open: false,
		index: null,
		initialPath: "/",
	});

	const addPathField = () => onChange((current) => [...current, createPathField()]);

	const removePathField = (index: number) => {
		onChange((current) => {
			const next = current.filter((_, currentIndex) => currentIndex !== index);

			return next.length > 0 ? next : [createPathField()];
		});
	};

	const updatePathField = (index: number, update: Partial<Omit<PathField, "id">>) => {
		onChange((current) => current.map((path, currentIndex) => (currentIndex === index ? { ...path, ...update } : path)));
	};

	const openPickerForIndex = (index: number) => {
		const currentVal = paths[index]?.value.trim();
		setPickerState({
			open: true,
			index,
			initialPath: currentVal !== undefined && currentVal.length > 0 ? currentVal : "/",
		});
	};

	const handlePathPicked = (selectedPath: string) => {
		if (pickerState.index !== null) {
			updatePathField(pickerState.index, { value: selectedPath });
		}
	};

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<div>
					<Label className="font-medium text-foreground text-sm">{m.admin_libraries_source_directories_with_media()}</Label>
					<p className="text-muted-foreground text-xs">{m.admin_libraries_point_to_folders()}</p>
				</div>
				<Button type="button" variant="outline" size="sm" onClick={addPathField} className="h-8 gap-1.5 text-xs shadow-xs">
					<Plus className="size-3.5 text-primary" />
					<span>{m.admin_libraries_add_directory()}</span>
				</Button>
			</div>

			<div className="flex flex-col gap-3.5">
				{paths.map((path, index) => (
					<LibraryPathInputRow
						key={path.id}
						path={path}
						index={index}
						idPrefix={idPrefix}
						canRemove={paths.length > 1}
						onUpdate={updatePathField}
						onRemove={removePathField}
						onOpenPicker={openPickerForIndex}
					/>
				))}
			</div>

			{showDashedAddButton && (
				<Button
					type="button"
					variant="outline"
					onClick={addPathField}
					className="h-10 w-full gap-2 border-border/80 border-dashed text-muted-foreground text-xs hover:border-primary/60 hover:text-foreground"
				>
					<Plus className="size-4" />
					<span>{m.admin_libraries_add_another_path()}</span>
				</Button>
			)}

			{pickerState.open && (
				<Suspense fallback={null}>
					<PathPickerDialog
						open={pickerState.open}
						onOpenChange={(open) => setPickerState((prev) => ({ ...prev, open }))}
						initialPath={pickerState.initialPath}
						onSelectPath={handlePathPicked}
					/>
				</Suspense>
			)}
		</div>
	);
}
