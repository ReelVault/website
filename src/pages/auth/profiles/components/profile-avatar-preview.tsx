import { Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { m } from "@/paraglide/messages";

interface ProfileAvatarPreviewProps {
	avatarUrl: string;
	onRandomize: () => void;
}

export function ProfileAvatarPreview({ avatarUrl, onRandomize }: ProfileAvatarPreviewProps) {
	return (
		<div className="group relative">
			<div className="size-40 overflow-hidden rounded-3xl border-4 border-primary shadow-xl transition-transform group-hover:scale-[1.02]">
				<picture>
					<Image src={avatarUrl} alt={m.auth_avatar_preview()} width={96} height={96} unoptimized className="h-full w-full" />
				</picture>
			</div>
			<Button
				type="button"
				onClick={onRandomize}
				className="absolute -right-2 -bottom-2 size-10 rounded-xl bg-primary shadow-lg transition-transform duration-300 hover:rotate-180"
				aria-label={m.auth_profile_random_avatar()}
			>
				<Dices className="size-4" />
			</Button>
		</div>
	);
}
