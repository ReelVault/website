import { m } from "@/paraglide/messages";

export interface AvatarStyleOption {
	id: string;
	label: string;
}

export interface SystemAvatar {
	id: string;
	styleId: string;
	url: string;
}

export interface AvatarValidationResult {
	isValid: boolean;
	error?: string;
}

export const AVATAR_STYLES: AvatarStyleOption[] = [
	{
		id: "avataaars",
		get label() {
			return m.user_cartoonish();
		},
	},
	{
		id: "bottts",
		get label() {
			return m.user_avatar_style_robots();
		},
	},
	{
		id: "lorelei",
		get label() {
			return m.user_avatar_style_illustrated();
		},
	},
	{
		id: "micah",
		get label() {
			return m.user_avatar_style_minimalist();
		},
	},
	{
		id: "pixel-art",
		get label() {
			return "Pixel Art";
		},
	},
	{
		id: "notionists",
		get label() {
			return m.user_avatar_style_sketch();
		},
	},
];

const AVATAR_SEEDS_BY_STYLE: Record<string, readonly string[]> = {
	avataaars: ["Mackenzie", "Luis", "Aidan", "Mason", "Maria", "Nolan"],
	bottts: ["Riley", "Amaya", "Robert", "Oliver", "Ryan", "Aiden"],
	lorelei: ["Sofia", "Diego", "Emma", "Noah", "Zara", "Leo"],
	micah: ["Ines", "Marcus", "Talia", "Felix", "Nadia", "Theo"],
	"pixel-art": ["Kai", "Vera", "Milo", "Ada", "Finn", "Iris"],
	notionists: ["Juno", "Otis", "Wren", "Cyrus", "Nova", "Elio"],
};

const AVATAR_BACKGROUND_COLORS = ["22c55e", "a855f7", "3b82f6", "ef4444", "f59e0b", "06b6d4"] as const;

// Pool of system avatars, generated from Dicebear styles x a few names per style
export const SYSTEM_AVATARS: SystemAvatar[] = AVATAR_STYLES.flatMap((style) =>
	(AVATAR_SEEDS_BY_STYLE[style.id] ?? []).map((seed, index) => ({
		id: `${style.id}-${seed.toLowerCase()}`,
		styleId: style.id,
		url: `https://api.dicebear.com/9.x/${style.id}/svg?seed=${seed}&backgroundColor=${
			AVATAR_BACKGROUND_COLORS[index % AVATAR_BACKGROUND_COLORS.length] ?? "22c55e"
		}`,
	})),
);

export const SYSTEM_AVATARS_BY_STYLE: Record<string, SystemAvatar[]> = {};
for (const avatar of SYSTEM_AVATARS) {
	const list = SYSTEM_AVATARS_BY_STYLE[avatar.styleId];
	if (list) {
		list.push(avatar);
	} else {
		SYSTEM_AVATARS_BY_STYLE[avatar.styleId] = [avatar];
	}
}

const VALID_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export function validateAvatarFile(file: File): AvatarValidationResult {
	if (!VALID_AVATAR_TYPES.has(file.type)) {
		return { isValid: false, error: m.user_avatar_formats_hint() };
	}

	if (file.size > MAX_AVATAR_SIZE_BYTES) {
		return { isValid: false, error: m.user_file_too_large() };
	}

	return { isValid: true };
}
