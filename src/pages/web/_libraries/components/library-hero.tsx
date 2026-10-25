import type { Library, RequireFields } from "@reelvault/sdk";
import { cn } from "cn";
import { Zap } from "lucide-react";
import { SimpleAnimation } from "@/components/simple-animation";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { LibraryHeroNavigationButton } from "./library-hero-navigation-button";

function collectionLabelForType(type: Library["type"]): string {
	return type === "movies" ? m.web_movie_collection() : m.web_series_collection();
}

export function LibraryHero({
	currentLibrary,
	isGenreMode,
	setIsGenreMode,
	availableGenres,
	currentGenreIndex,
	activeGenre,
	prevLib,
	nextLib,
	prevGenre,
	nextGenre,
	validMetadataLength,
}: {
	currentLibrary: RequireFields<Library, "id" | "type" | "name">;
	isGenreMode: boolean;
	setIsGenreMode: (value: boolean) => void;
	availableGenres: string[];
	currentGenreIndex: number;
	activeGenre?: string | null;
	prevLib?: RequireFields<Library, "id" | "name">;
	nextLib?: RequireFields<Library, "id" | "name">;
	prevGenre: () => void;
	nextGenre: () => void;
	validMetadataLength: number;
}) {
	const handleTitleClick = () => {
		if (availableGenres.length > 0) {
			setIsGenreMode(!isGenreMode);
		}
	};

	return (
		<header className="border-border relative flex min-h-95 flex-col items-center justify-center overflow-hidden border-b px-4 pt-24 pb-14 md:min-h-110 md:px-6 md:pt-28 md:pb-16">
			{/* Background effects - using translate3d for GPU acceleration */}
			<div className="from-primary/5 pointer-events-none absolute inset-0 bg-linear-to-b via-transparent to-transparent" />
			<div className="pointer-events-none absolute top-1/2 left-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_8%,transparent)_0%,transparent_70%)]" />

			<div className="relative flex w-full max-w-7xl items-center justify-between gap-4 md:gap-8">
				{(prevLib ?? isGenreMode) && (
					<LibraryHeroNavigationButton
						type={currentLibrary.type}
						direction="left"
						isGenreMode={isGenreMode}
						onClick={prevGenre}
						onLibraryClick={prevLib}
						mainLabel={isGenreMode ? m.web_prev_genre() : m.web_prev_library()}
						subLabel={isGenreMode ? availableGenres.at((currentGenreIndex - 1) % availableGenres.length) : prevLib?.name}
					/>
				)}

				{/* Main Title - flex-[2] (valid Tailwind) */}
				<div className="flex flex-2 flex-col items-center px-4 md:px-8">
					<div className="mb-4 flex items-center gap-3">
						<div className="to-primary h-px w-12 bg-linear-to-r from-transparent" />
						<div className="text-primary flex items-center gap-2 text-sm font-semibold">
							<Zap className="h-3.5 w-3.5" />
							{isGenreMode ? m.web_genre_filter() : collectionLabelForType(currentLibrary.type)}
						</div>
						<div className="to-primary h-px w-12 bg-linear-to-l from-transparent" />
					</div>

					{isGenreMode && (
						<SimpleAnimation key="lib-name" direction="up" className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide">
							{currentLibrary.name}
						</SimpleAnimation>
					)}

					<div className="flex flex-col items-center text-center">
						<SimpleAnimation key={currentLibrary.id + (isGenreMode ? (activeGenre ?? "") : "")} direction="none" duration={220}>
							{availableGenres.length > 0 ? (
								<Button
									size="inline"
									type="button"
									variant="ghost"
									onClick={handleTitleClick}
									className="max-w-full cursor-pointer whitespace-normal select-none"
								>
									<span
										className={cn(
											"from-foreground via-foreground to-foreground/80 inline-block max-w-full bg-linear-to-b bg-clip-text px-4 pt-2 pb-5 leading-[1.2] font-bold tracking-tight text-transparent",
											isGenreMode ? "text-4xl sm:text-6xl md:text-7xl lg:text-8xl" : "text-5xl sm:text-7xl md:text-8xl lg:text-9xl",
										)}
									>
										{isGenreMode ? activeGenre : currentLibrary.name}
									</span>
								</Button>
							) : (
								<h1 className="p-0 select-none">
									<span
										className={cn(
											"from-foreground via-foreground to-foreground/80 inline-block max-w-full bg-linear-to-b bg-clip-text px-4 pt-2 pb-5 leading-[1.2] font-bold tracking-tight text-transparent",
											"text-5xl sm:text-7xl md:text-8xl lg:text-9xl",
										)}
									>
										{currentLibrary.name}
									</span>
								</h1>
							)}
						</SimpleAnimation>

						{availableGenres.length > 0 && (
							<div className="mt-6 md:mt-8">
								<Button type="button" variant="outline" size="sm" onClick={() => setIsGenreMode(!isGenreMode)}>
									{isGenreMode ? m.web_back_to_collection() : m.web_browse_genres({ length: availableGenres.length })}
								</Button>
							</div>
						)}
					</div>

					<div className="mt-6 flex items-center gap-8 md:mt-8">
						<div className="flex flex-col items-center">
							<SimpleAnimation key={validMetadataLength} from={{ transform: "scale(1.2)" }} className="text-primary text-2xl font-bold">
								{validMetadataLength}
							</SimpleAnimation>
							<span className="text-muted-foreground text-xs font-semibold">{m.web_library_items_count()}</span>
						</div>
					</div>
				</div>

				{(nextLib ?? isGenreMode) && (
					<LibraryHeroNavigationButton
						type={currentLibrary.type}
						direction="right"
						isGenreMode={isGenreMode}
						onClick={nextGenre}
						onLibraryClick={nextLib}
						mainLabel={isGenreMode ? m.web_next_genre() : m.web_next_library()}
						subLabel={isGenreMode ? availableGenres[(currentGenreIndex + 1) % availableGenres.length] : nextLib?.name}
					/>
				)}
			</div>
		</header>
	);
}
