import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { AVATAR_STYLES, SYSTEM_AVATARS_BY_STYLE } from "../avatar-utils";

interface AvatarGalleryTabProps {
	selectedStyleId: string;
	onSelectStyleId: (id: string) => void;
	selectedAvatar: string;
	onSelectAvatar: (url: string) => void;
}

export function AvatarGalleryTab({ selectedStyleId, onSelectStyleId, selectedAvatar, onSelectAvatar }: AvatarGalleryTabProps) {
	return (
		<div className="mt-6">
			<div className="mb-4 flex flex-wrap gap-2">
				{AVATAR_STYLES.map((style) => (
					<Button
						key={style.id}
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => onSelectStyleId(style.id)}
						aria-pressed={selectedStyleId === style.id}
						selected={selectedStyleId === style.id}
					>
						{style.label}
					</Button>
				))}
			</div>

			<div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
				{(SYSTEM_AVATARS_BY_STYLE[selectedStyleId] ?? []).map((avatar) => (
					<Button
						type="button"
						variant="ghost"
						size="icon-lg"
						key={avatar.id}
						onClick={() => onSelectAvatar(avatar.url)}
						className="group/avatar relative aspect-square size-20 overflow-hidden sm:size-24"
						selected={selectedAvatar === avatar.url}
						aria-label={m.user_choose_avatar({ id: avatar.id })}
						aria-pressed={selectedAvatar === avatar.url}
					>
						<img src={avatar.url} alt="" width={96} height={96} loading="lazy" className="h-full w-full object-cover" />
						{selectedAvatar === avatar.url && (
							<div className="absolute inset-0 flex items-center justify-center bg-primary/20">
								<Check className="size-6 text-primary" />
							</div>
						)}
					</Button>
				))}
			</div>
		</div>
	);
}
