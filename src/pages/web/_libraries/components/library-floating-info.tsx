import { ArrowUp, Zap } from "lucide-react";
import { SimpleAnimation } from "@/components/simple-animation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
			<Card>
				<CardContent className="flex items-center gap-3">
					<div className="flex min-w-0 flex-1 items-center gap-3">
						<div className="bg-primary/10 text-primary rounded-lg p-2">
							<Zap className="size-4" aria-hidden="true" />
						</div>
						<div className="min-w-0">
							<div className="text-foreground truncate text-sm font-medium">{currentLibraryName}</div>
							<div className="text-muted-foreground text-xs">
								{m.common_items_count({ count: validMetadataLength })} {m.common_dot_separator()}{" "}
								{m.common_genres_count({ count: availableGenresLength })}
							</div>
						</div>
					</div>
					<Separator orientation="vertical" className="hidden h-8 sm:block" />
					<Button
						variant="ghost"
						size="icon"
						onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
						aria-label={m.web_back_to_top()}
					>
						<ArrowUp aria-hidden="true" />
					</Button>
				</CardContent>
			</Card>
		</SimpleAnimation>
	);
}
