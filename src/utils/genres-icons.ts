import type { LucideIcon } from "lucide-react";
import {
	BookOpen,
	Clapperboard,
	Compass,
	Drama,
	Flame,
	Footprints,
	Ghost,
	Heart,
	Landmark,
	Laugh,
	Music,
	Rocket,
	Search,
	ShieldAlert,
	Sparkles,
	Sun,
	Swords,
	Users,
	Wand2,
} from "lucide-react";

export const genresIcons: Record<string, LucideIcon> = {
	Action: Swords,
	Adventure: Compass,
	Animation: Sparkles,
	Comedy: Laugh,
	Crime: Footprints,
	Documentary: BookOpen,
	Drama: Drama,
	Family: Users,
	Fantasy: Wand2,
	History: Landmark,
	Horror: Ghost,
	Music: Music,
	Mystery: Search,
	Romance: Heart,
	"Sci-Fi": Rocket,
	"Science Fiction": Rocket,
	Thriller: Flame,
	War: ShieldAlert,
	Western: Sun,
};

export function getGenreIconByName(name: string): LucideIcon {
	return genresIcons[name] ?? Clapperboard;
}
