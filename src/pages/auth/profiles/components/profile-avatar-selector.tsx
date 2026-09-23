import { cn } from "cn";
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
				<Label className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">{m.auth_avatar_style()}</Label>
				<ScrollArea className="w-full max-w-[calc(100vw-6rem)] whitespace-nowrap md:max-w-xl">
					<div className="flex gap-2 overflow-x-auto pb-2">
						{AVATAR_STYLES.map((style) => (
							<Button
								key={style.id}
								type="button"
								variant="ghost"
								onClick={() => onSelectStyle(style.id)}
								className={cn(
									"flex size-18 shrink-0 flex-col items-center gap-1 rounded-xl border-2 px-2 py-2 transition-[background-color,border-color,color]",
									activeStyle === style.id
										? "border-primary bg-primary/10 text-primary"
										: "border-border text-muted-foreground hover:border-primary/50",
								)}
							>
								<span className="text-xl">{style.icon}</span>
								<span className="font-bold text-[10px] uppercase">{style.name}</span>
							</Button>
						))}
					</div>
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
			</div>

			{/* Siatka nasion (Seeds) */}
			<div className="flex flex-col gap-2">
				<Label className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">{m.auth_choose_character()}</Label>
				<ScrollArea className="h-72 w-full p-4">
					<div className="grid h-fit grid-cols-3 gap-2 overflow-y-auto rounded-2xl border border-border p-2 sm:grid-cols-4">
						{AVATAR_SEEDS.map((seed) => (
							<Button
								key={seed}
								type="button"
								variant="ghost"
								onClick={() => onSelectSeed(seed)}
								className={cn(
									"group relative m-1 aspect-square overflow-hidden rounded-xl transition-[border-color,transform]",
									activeSeed === seed ? "border-primary" : "border-transparent hover:border-primary/30",
								)}
							>
								<picture>
									<Image
										src={buildDicebearAvatarUrl(activeStyle, seed)}
										alt={seed}
										width={96}
										height={96}
										unoptimized
										loading="lazy"
										className="h-full w-full transition-transform group-hover:scale-110"
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
