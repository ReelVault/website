import { ArrowUp, Zap } from "lucide-react";
import { SimpleAnimation } from "@/components/simple-animation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { m } from "@/paraglide/messages";

export function LibraryFloatingInfo({
	currentLibraryName,
	validMetadataLength,
	availableGenresLength,
}: {
	currentLibraryName: string;
	validMetadataLength: number;
	availableGenresLength: number;
}) {
	return (
		<SimpleAnimation
			direction="up"
			from={{ transform: "translateY(100px)" }}
			className="mx-auto mt-8 w-full max-w-xl px-4 pb-6 lg:fixed lg:right-6 lg:bottom-6 lg:left-auto lg:z-40 lg:mt-0 lg:w-auto lg:max-w-none lg:px-0 lg:pb-0"
		>
			<Card className="flex items-center justify-between gap-4 rounded-xl border-border px-4 py-3 sm:px-5">
				<div className="flex min-w-0 items-center gap-3">
					<div className="rounded-lg bg-primary/10 p-2 text-primary">
						<Zap className="size-4" aria-hidden="true" />
					</div>
					<div className="min-w-0">
						<div className="truncate font-medium text-foreground text-sm">{currentLibraryName}</div>
						<div className="text-muted-foreground text-xs">
							{m.common_items_count({ count: validMetadataLength })} {m.common_dot_separator()}{" "}
							{m.common_genres_count({ count: availableGenresLength })}
						</div>
					</div>
				</div>
				<Separator orientation="horizontal" className="hidden h-8 sm:block" />
				<Button
					variant="ghost"
					size="icon"
					onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
					aria-label={m.web_back_to_top()}
				>
					<ArrowUp aria-hidden="true" />
				</Button>
			</Card>
		</SimpleAnimation>
	);
}
