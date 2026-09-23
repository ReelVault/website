import { UploadCloud } from "lucide-react";
import type { RefObject } from "react";
import { m } from "@/paraglide/messages";

interface AvatarUploadTabProps {
	fileInputRef: RefObject<HTMLInputElement | null>;
	previewImage: string | null;
	onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AvatarUploadTab({ fileInputRef, previewImage, onFileChange }: AvatarUploadTabProps) {
	return (
		<div className="mt-6">
			<label className="group/upload flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-border border-dashed bg-muted/20 p-8 transition-[background-color,border-color] hover:border-primary/40 hover:bg-primary/5">
				<input
					ref={fileInputRef}
					type="file"
					className="hidden"
					onChange={onFileChange}
					accept="image/jpeg,image/png,image/webp,image/svg+xml"
				/>

				{previewImage ? (
					<div className="flex flex-col gap-4">
						<div className="relative mx-auto size-32 overflow-hidden rounded-2xl">
							<img src={previewImage} alt={m.user_preview()} width={128} height={128} className="h-full w-full object-cover" />
						</div>
						<p className="font-bold text-[10px] text-primary uppercase">{m.user_preview_save_hint()}</p>
					</div>
				) : (
					<>
						<div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-colors group-hover/upload:bg-primary group-hover/upload:text-primary-foreground">
							<UploadCloud className="size-6" aria-hidden="true" />
						</div>
						<p className="font-black text-[11px] text-foreground uppercase tracking-widest">{m.user_upload_own_photo()}</p>
						<p className="mt-1 font-bold text-[9px] text-muted-foreground uppercase">{m.user_avatar_formats_limits()}</p>
					</>
				)}
			</label>
		</div>
	);
}
