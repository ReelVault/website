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
				<Label tone="muted" size="xs">
					{m.auth_avatar_style()}
				</Label>
				<ScrollArea className="w-full max-w-[calc(100vw-6rem)] whitespace-nowrap md:max-w-xl">
					<div className="flex gap-2 overflow-x-auto pb-2">
						{AVATAR_STYLES.map((style) => (
							<div key={style.id} className="flex h-20 w-24 shrink-0">
								<Button
									type="button"
									variant="ghost"
									size="inline"
									onClick={() => onSelectStyle(style.id)}
									className="w-full flex-col justify-center self-stretch"
									selected={activeStyle === style.id}
								>
									<span className="text-xl">{style.icon}</span>
									<span className="font-bold text-xs">{style.name}</span>
								</Button>
							</div>
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
				<div className="grid grid-cols-4 gap-2 rounded-2xl border border-border bg-muted/20 p-3 sm:grid-cols-5">
					{AVATAR_SEEDS.map((seed) => {
						const isSelected = activeSeed === seed;

						return (
							<div
								key={seed}
								className={cn(
									"relative flex aspect-square overflow-hidden rounded-xl border-2",
									isSelected ? "border-primary bg-primary/10" : "border-transparent bg-muted/40 hover:border-border",
								)}
							>
								<Button
									type="button"
									variant="ghost"
									size="inline"
									aria-pressed={isSelected}
									onClick={() => onSelectSeed(seed)}
									className="w-full self-stretch"
								>
									<span className="block size-full p-1.5 transition-transform duration-200 group-hover/button:scale-105">
										<Image src={buildDicebearAvatarUrl(activeStyle, seed)} alt={seed} width={96} height={96} unoptimized loading="lazy" />
									</span>
								</Button>
								{isSelected && (
									<span className="pointer-events-none absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
										<Check className="size-3" aria-hidden="true" />
									</span>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
