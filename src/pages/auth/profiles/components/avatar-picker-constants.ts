import { m } from "@/paraglide/messages";

export const AVATAR_SEEDS = [
	"Jameson",
	"Aidan",
	"Eliza",
	"Aiden",
	"Adrian",
	"Jessica",
	"Emery",
	"Jade",
	"Jocelyn",
	"George",
	"Alexander",
	"Jack",
	"Amaya",
	"Kimberly",
	"Jude",
	"Katherine",
	"Kingston",
	"Andrea",
	"Leo",
	"Brian",
];

export const AVATAR_STYLES = [
	{ id: "adventurer-neutral", name: m.auth_style_explorers(), icon: "🗡️" },
	{ id: "avataaars-neutral", name: m.auth_style_neutral(), icon: "😊" },
	{ id: "bottts", name: m.auth_style_robots(), icon: "🤖" },
	{ id: "avataaars", name: m.auth_style_people(), icon: "👤" },
	{ id: "pixel-art", name: m.auth_style_pixel_art(), icon: "🎮" },
	{ id: "adventurer", name: m.auth_style_adventure(), icon: "🗺️" },
	{ id: "big-smile", name: m.auth_smiles(), icon: "😄" },
	{ id: "fun-emoji", name: m.auth_funny(), icon: "🤣" },
	{ id: "thumbs", name: m.auth_style_thumbs(), icon: "👍" },
];

export function buildDicebearAvatarUrl(style: string, seed: string): string {
	return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
}
