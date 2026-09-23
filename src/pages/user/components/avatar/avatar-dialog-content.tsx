import { Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { resolveApiAssetUrl } from "@/client/client";
import { AppErrorState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { FullscreenDialogContent, FullscreenDialogHeader, FullscreenDialogTitle } from "@/components/fullscreen-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { AVATAR_STYLES, validateAvatarFile } from "../avatar-utils";
import { AvatarGalleryTab } from "./avatar-gallery-tab";
import { AvatarUploadTab } from "./avatar-upload-tab";

interface AvatarPickerDialogContentProps {
	currentAvatar?: string;
	onClose: () => void;
	onSave?: (newAvatar: string) => Promise<void> | void;
	onUpload?: (file: File) => Promise<string>;
}

export function AvatarPickerDialogContent({ currentAvatar, onClose, onSave, onUpload }: AvatarPickerDialogContentProps) {
	const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar ?? "");
	const [isSaving, setIsSaving] = useState(false);
	const [isRemoving, setIsRemoving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
	const [selectedStyleId, setSelectedStyleId] = useState(AVATAR_STYLES[0]?.id ?? "");
	const [activeTab, setActiveTab] = useState<"gallery" | "upload">("gallery");

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setError(null);

		const validation = validateAvatarFile(file);
		if (!validation.isValid) {
			setError(validation.error ?? m.user_unknown_error());

			return;
		}

		setPendingUploadFile(file);
		const reader = new FileReader();
		reader.addEventListener(
			"load",
			(event) => {
				const result = event.target?.result;
				if (typeof result === "string") {
					setPreviewImage(result);
				}
			},
			{ once: true },
		);
		reader.readAsDataURL(file);

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleAvatarSelect = (avatarUrl: string) => {
		setSelectedAvatar(avatarUrl);
		setPreviewImage(null);
		setPendingUploadFile(null);
		setError(null);
	};

	const handleRemoveAvatar = async () => {
		setError(null);
		try {
			setIsRemoving(true);
			await onSave?.("");
			setSelectedAvatar("");
			onClose();
		} catch {
			setError(m.user_avatar_delete_failed());
		}

		setIsRemoving(false);
	};

	const confirmSelection = async () => {
		setError(null);
		try {
			setIsSaving(true);
			if (pendingUploadFile) {
				if (!onUpload) {
					setError(m.user_custom_photo_unavailable());
					setIsSaving(false);

					return;
				}

				const avatarUrl = await onUpload(pendingUploadFile);
				setSelectedAvatar(avatarUrl);
				setPendingUploadFile(null);
				setPreviewImage(null);
			} else {
				if (!selectedAvatar) {
					setError(m.user_choose_avatar_first());
					setIsSaving(false);

					return;
				}

				await onSave?.(selectedAvatar);
			}

			onClose();
		} catch {
			setError(m.user_save_failed());
		}

		setIsSaving(false);
	};

	const handleConfirm = () => {
		detach(confirmSelection());
	};

	const handleTabChange = (value: string) => {
		if (value === "gallery" || value === "upload") {
			setActiveTab(value);
		}
	};

	const hasPendingChange = Boolean(pendingUploadFile) || (Boolean(selectedAvatar) && selectedAvatar !== currentAvatar);

	return (
		<FullscreenDialogContent className="flex max-h-[85vh] max-w-2xl flex-col border-border bg-popover sm:rounded-2xl">
			<FullscreenDialogHeader className="shrink-0">
				<div className="mb-2 flex items-center gap-2">
					<div className="h-px w-4 bg-primary" />
					<span className="font-black text-[10px] text-primary uppercase tracking-[0.3em]">{m.user_identity()}</span>
				</div>
				<FullscreenDialogTitle className="font-black text-3xl text-foreground uppercase tracking-tighter">
					{m.user_choose_avatar_cap()}
					<span className="text-primary">{m.user_avatar_title_period()}</span>
				</FullscreenDialogTitle>
			</FullscreenDialogHeader>

			{/* Content scrolls independently of the header and footer so action buttons never go off screen */}
			<div className="flex-1 overflow-y-auto">
				<div className="mt-8 flex flex-col gap-8">
					{error && (
						<div className="relative">
							<AppErrorState title={m.user_avatar_save_failed()} description={error} />
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								className="absolute top-3 right-3"
								onClick={() => setError(null)}
								aria-label={m.user_close_error()}
							>
								<X className="size-4" aria-hidden="true" />
							</Button>
						</div>
					)}

					{(selectedAvatar || previewImage) && (
						<div className="flex flex-col gap-3">
							<h4 className="ml-2 font-black text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
								{m.user_selected_avatar_label()}
							</h4>
							<div className="flex items-center justify-center">
								<div className="relative size-32 overflow-hidden rounded-3xl border-2 border-primary/20">
									<img
										src={resolveApiAssetUrl(previewImage ?? selectedAvatar)}
										alt={m.user_selected_avatar()}
										width={128}
										height={128}
										className="h-full w-full object-cover"
									/>
								</div>
							</div>
						</div>
					)}

					<Tabs value={activeTab} onValueChange={handleTabChange}>
						<TabsList className="grid w-full grid-cols-2 rounded-2xl bg-muted/40 p-1">
							<TabsTrigger
								value="gallery"
								className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
							>
								{m.user_avatar_from_gallery()}
							</TabsTrigger>
							<TabsTrigger
								value="upload"
								className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
							>
								{m.user_upload_own()}
							</TabsTrigger>
						</TabsList>

						<TabsContent value="gallery">
							<AvatarGalleryTab
								selectedStyleId={selectedStyleId}
								onSelectStyleId={setSelectedStyleId}
								selectedAvatar={selectedAvatar}
								onSelectAvatar={handleAvatarSelect}
							/>
						</TabsContent>

						<TabsContent value="upload">
							<AvatarUploadTab fileInputRef={fileInputRef} previewImage={previewImage} onFileChange={handleFileChange} />
						</TabsContent>
					</Tabs>
				</div>
			</div>

			{/* Footer outside the scroll area — always visible */}
			<div className="flex shrink-0 flex-col gap-4 border-border border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
				<AsyncButton
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => detach(handleRemoveAvatar())}
					disabled={!currentAvatar}
					isPending={isRemoving}
					pendingLabel={m.user_avatar_removing()}
					className="self-start font-bold text-destructive text-xs tracking-wider"
				>
					<Trash2 data-icon="inline-start" className="size-3.5" aria-hidden="true" />
					{m.user_remove_current()}
				</AsyncButton>

				<div className="flex gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						disabled={isSaving}
						className="min-h-11 px-6 font-black text-[9px] uppercase tracking-widest"
					>
						{m.common_cancel()}
					</Button>
					<AsyncButton
						type="button"
						className="min-h-11 px-6 font-black text-[9px] uppercase tracking-widest"
						onClick={handleConfirm}
						disabled={!hasPendingChange}
						isPending={isSaving}
						pendingLabel={m.user_saving()}
					>
						{m.user_save_selection()}
					</AsyncButton>
				</div>
			</div>
		</FullscreenDialogContent>
	);
}
