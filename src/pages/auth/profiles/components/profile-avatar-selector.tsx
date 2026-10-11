import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { m } from "@/paraglide/messages";
import { AVATAR_SEEDS, AVATAR_STYLES, buildDicebearAvatarUrl } from "./avatar-picker-constants";

interface ProfileAvatarSelectorProps {
	activeStyle: string;
	activeSeed: string;
	onSelectStyle: (styleId: string) => void;
	onSelectSeed: (seed: string) => void;
}

export function ProfileAvatarSelector({ activeStyle, activeSeed, onSelectStyle, onSelectSeed }: ProfileAvatarSelectorProps) {
	return (
		<div className="flex min-w-0 flex-col gap-4 md:w-2/3">
			{/* Scrollable style bar */}
			<div className="flex min-w-0 flex-col gap-2">
				<Label tone="muted" size="xs">
					{m.auth_avatar_style()}
				</Label>
				<ScrollArea className="w-full max-w-[calc(100vw-6rem)] whitespace-nowrap md:max-w-xl">
					<div className="flex gap-2 overflow-x-auto pb-2">
						{AVATAR_STYLES.map((style) => (
							<Button
								key={style.id}
								type="button"
								variant="ghost"
								onClick={() => onSelectStyle(style.id)}
								className="flex size-18 shrink-0 flex-col items-center gap-1"
								selected={activeStyle === style.id}
							>
								<span className="text-xl">{style.icon}</span>
								<span className="font-bold text-xs">{style.name}</span>
							</Button>
						))}
					</div>
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
			</div>

			{/* Siatka nasion (Seeds) */}
			<div className="flex flex-col gap-2">
				<Label tone="muted" size="xs">
					{m.auth_choose_character()}
				</Label>
				<ScrollArea className="h-72 w-full p-4">
					<div className="grid h-fit grid-cols-3 gap-2 overflow-y-auto rounded-2xl border border-border p-2 sm:grid-cols-4">
						{AVATAR_SEEDS.map((seed) => (
							<Button
								key={seed}
								type="button"
								variant="ghost"
								onClick={() => onSelectSeed(seed)}
								className="group relative m-1 aspect-square overflow-hidden"
								selected={activeSeed === seed}
							>
								<picture>
									<Image
										src={buildDicebearAvatarUrl(activeStyle, seed)}
										alt={seed}
										width={96}
										height={96}
										unoptimized
										loading="lazy"
										zoom
										className="h-full w-full group-hover:scale-110"
									/>
								</picture>
								{activeSeed === seed && (
									<div className="absolute inset-0 flex items-center justify-center bg-accent/80">
										<Check className="size-12 text-primary" />
									</div>
								)}
							</Button>
						))}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
