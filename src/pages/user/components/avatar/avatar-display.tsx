import { cn } from "cn";
import { Camera, User } from "lucide-react";
import { useState } from "react";
import { resolveApiAssetUrl } from "@/client/client";
import { m } from "@/paraglide/messages";
import {
	AVATAR_EDIT_BADGE,
	AVATAR_IMAGE_DIMENSIONS,
	AVATAR_PLACEHOLDER_ICON_SIZE,
	AVATAR_SIZE_CLASSES,
	type AvatarPickerSize,
} from "./avatar-constants";

interface AvatarDisplayProps {
	currentAvatar?: string;
	size: AvatarPickerSize;
	editable: boolean;
}

export function AvatarDisplay({ currentAvatar, size, editable }: AvatarDisplayProps) {
	const editBadge = AVATAR_EDIT_BADGE[size];
	const [failed, setFailed] = useState(false);

	return (
		<>
			<div
				className={cn(
					"overflow-hidden rounded-[2.5rem] border-2 border-border bg-muted/40 p-2 transition-[background-color,border-color]",
					AVATAR_SIZE_CLASSES[size],
					editable && "group-hover:border-primary/40",
				)}
			>
				<div className="flex h-full w-full items-center justify-center overflow-hidden rounded-4xl bg-primary/10">
					{currentAvatar && !failed ? (
						<img
							src={resolveApiAssetUrl(currentAvatar)}
							alt={m.user_avatar_alt()}
							width={AVATAR_IMAGE_DIMENSIONS[size]}
							height={AVATAR_IMAGE_DIMENSIONS[size]}
							loading="lazy"
							decoding="async"
							className="h-full w-full object-cover"
							onError={() => setFailed(true)}
						/>
					) : (
						<User className={cn("text-primary/20", AVATAR_PLACEHOLDER_ICON_SIZE[size])} />
					)}
				</div>
			</div>

			{editable && (
				<div
					className={cn(
						"absolute flex items-center justify-center rounded-xl border-background bg-primary text-primary-foreground transition-transform hover:scale-110",
						editBadge.wrapper,
					)}
				>
					<Camera size={editBadge.icon} aria-hidden="true" />
				</div>
			)}
		</>
	);
}
