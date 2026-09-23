export type AvatarPickerSize = "sm" | "md" | "lg" | "xl";

export const AVATAR_SIZE_CLASSES: Record<AvatarPickerSize, string> = {
	sm: "size-16",
	md: "size-24",
	lg: "size-36",
	xl: "size-48",
};

// Actual avatar size in px (Tailwind size-N => N/4 rem), used as intrinsic width/height of <img>
export const AVATAR_IMAGE_DIMENSIONS: Record<AvatarPickerSize, number> = {
	sm: 64,
	md: 96,
	lg: 144,
	xl: 192,
};

export const AVATAR_PLACEHOLDER_ICON_SIZE: Record<AvatarPickerSize, string> = {
	sm: "size-6",
	md: "size-8",
	lg: "size-12",
	xl: "size-16",
};

// The edit badge (camera) must scale with the avatar, otherwise at "sm" it almost covers it
export const AVATAR_EDIT_BADGE: Record<AvatarPickerSize, { wrapper: string; icon: number }> = {
	sm: { wrapper: "-right-1 -bottom-1 size-7 border-2", icon: 10 },
	md: { wrapper: "-right-1.5 -bottom-1.5 size-8 border-2", icon: 12 },
	lg: { wrapper: "-right-2 -bottom-2 size-11 border-4", icon: 14 },
	xl: { wrapper: "-right-2 -bottom-2 size-14 border-4", icon: 18 },
};
