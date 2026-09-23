import { useId, useState } from "react";
import type { MediaMarker } from "reelvault-sdk";
import { AsyncButton } from "@/components/async-button";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import type { MarkerFormData } from "./marker-dialog";

interface MarkerDialogFormProps {
	editingMarker: MediaMarker | null;
	isPending: boolean;
	onSubmit: (data: MarkerFormData) => Promise<void>;
	onCancel: () => void;
}

export function MarkerDialogForm({ editingMarker, isPending, onSubmit, onCancel }: MarkerDialogFormProps) {
	const isCreating = !editingMarker;
	const id = useId();

	const [formData, setFormData] = useState<MarkerFormData>({
		mediaFileId: editingMarker?.mediaFileId ?? "",
		type: editingMarker?.type ?? "intro",
		startSeconds: editingMarker?.startSeconds ?? 0,
		endSeconds: editingMarker?.endSeconds ?? 0,
		label: editingMarker?.label ?? "",
	});
	// Validate on submit; keep inline errors visible from the first failed attempt.
	const [showErrors, setShowErrors] = useState(false);

	const effectiveEnd = formData.type === "highlight" ? formData.startSeconds : formData.endSeconds;
	const hasRangeError = formData.type !== "highlight" && effectiveEnd <= formData.startSeconds;

	const handleSubmit = () => {
		if (!formData.mediaFileId.trim()) {
			toast.error(m.admin_markers_media_file_id_required());

			return;
		}

		if (hasRangeError) {
			setShowErrors(true);
			toast.error(m.admin_markers_end_after_start());

			return;
		}

		const trimmedLabel = formData.label?.trim();
		detach(() =>
			onSubmit({
				mediaFileId: formData.mediaFileId.trim(),
				type: formData.type,
				startSeconds: formData.startSeconds,
				endSeconds: effectiveEnd,
				label: trimmedLabel && trimmedLabel.length > 0 ? trimmedLabel : undefined,
			}),
		);
	};

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				handleSubmit();
			}}
			className="flex flex-col gap-4 py-2"
		>
			<div className="flex flex-col gap-1.5">
				<Label htmlFor={`${id}-media-file`} className="text-xs">
					{m.admin_markers_media_file_id()}
				</Label>
				<Input
					id={`${id}-media-file`}
					placeholder={m.admin_markers_id_placeholder()}
					value={formData.mediaFileId}
					onChange={(e) => setFormData((prev) => ({ ...prev, mediaFileId: e.target.value }))}
					disabled={!isCreating}
					className="font-mono text-sm"
					required
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor={`${id}-type`} className="text-xs">
					{m.admin_markers_filter_type()}
				</Label>
				<Select value={formData.type} onValueChange={(val) => val && setFormData((prev) => ({ ...prev, type: val }))}>
					<SelectTrigger id={`${id}-type`} className="bg-card">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="intro">{m.plugins_markers_intro()}</SelectItem>
						<SelectItem value="credits">{m.plugins_markers_credits_word()}</SelectItem>
						<SelectItem value="recap">{m.plugins_community_markers_shortcut_recap()}</SelectItem>
						<SelectItem value="chapter">{m.plugins_markers_chapter()}</SelectItem>
						<SelectItem value="highlight">{m.admin_markers_highlight()}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{formData.type === "highlight" ? (
				<div className="flex flex-col gap-1.5">
					<Label htmlFor={`${id}-start`} className="text-xs">
						{m.plugins_markers_moment_time_seconds()}
					</Label>
					<Input
						id={`${id}-start`}
						type="number"
						step="0.1"
						min="0"
						value={formData.startSeconds}
						onChange={(e) => {
							const val = Number(e.target.value);
							setFormData((prev) => ({ ...prev, startSeconds: val, endSeconds: val }));
						}}
						className="font-mono text-sm"
					/>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor={`${id}-start`} className="text-xs">
							{m.plugins_markers_start_seconds()}
						</Label>
						<Input
							id={`${id}-start`}
							type="number"
							step="0.1"
							min="0"
							value={formData.startSeconds}
							aria-invalid={showErrors && hasRangeError}
							onChange={(e) => setFormData((prev) => ({ ...prev, startSeconds: Number(e.target.value) }))}
							className="font-mono text-sm"
						/>
					</div>
					<div className="flex flex-col gap-1.5">
						<Label htmlFor={`${id}-end`} className="text-xs">
							{m.plugins_markers_end_seconds()}
						</Label>
						<Input
							id={`${id}-end`}
							type="number"
							step="0.1"
							min="0"
							value={formData.endSeconds}
							aria-invalid={showErrors && hasRangeError}
							onChange={(e) => setFormData((prev) => ({ ...prev, endSeconds: Number(e.target.value) }))}
							className="font-mono text-sm"
						/>
						{showErrors && hasRangeError && (
							<p role="alert" className="text-destructive text-xs">
								{m.admin_markers_end_after_start()}
							</p>
						)}
					</div>
				</div>
			)}

			<div className="flex flex-col gap-1.5">
				<Label htmlFor={`${id}-label`} className="text-xs">
					{m.plugins_markers_optional_description()}
				</Label>
				<Input
					id={`${id}-label`}
					placeholder={m.admin_markers_example_hint()}
					value={formData.label}
					onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
					maxLength={100}
					className="text-sm"
				/>
			</div>

			<DialogFooter className="pt-2">
				<Button type="button" variant="ghost" onClick={onCancel}>
					{m.common_cancel()}
				</Button>
				<AsyncButton type="submit" isPending={isPending} pendingLabel={m.common_saving_dots()}>
					{m.admin_markers_save()}
				</AsyncButton>
			</DialogFooter>
		</form>
	);
}
