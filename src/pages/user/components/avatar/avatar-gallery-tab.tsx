import { cn } from "cn";
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
						className={cn(
							"rounded-full border-2 px-4 font-black text-[9px] uppercase tracking-widest transition-colors",
							selectedStyleId === style.id
								? "border-primary bg-primary/10 text-primary"
								: "border-transparent bg-muted text-muted-foreground hover:border-border",
						)}
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
						className={cn(
							"group/avatar relative aspect-square size-20 overflow-hidden rounded-2xl border-2 p-0 transition-[background-color,border-color,opacity,transform] sm:size-24",
							selectedAvatar === avatar.url
								? "border-primary bg-primary/10"
								: "border-transparent bg-muted opacity-50 hover:scale-105 hover:opacity-100 disabled:opacity-30",
						)}
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
