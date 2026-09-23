import { cn } from "cn";
import { m } from "@/paraglide/messages";

const ALPHABET = [
	"#",
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
	"K",
	"L",
	"M",
	"N",
	"O",
	"P",
	"Q",
	"R",
	"S",
	"T",
	"U",
	"V",
	"W",
	"X",
	"Y",
	"Z",
] as const;

interface LibraryAlphabetNavigationProps {
	/** Currently selected letter (`""` = no filter). */
	activeLetter: string;
	/** Selects a letter; pass `""` to clear the filter. */
	onSelectLetter: (letter: string) => void;
}

/**
 * Server-side first-letter filter for the library grid. `#` matches titles
 * whose first character is not an ASCII letter (digits, symbols, accents).
 * Selecting the active letter clears the filter.
 */
export function LibraryAlphabetNavigation({ activeLetter, onSelectLetter }: LibraryAlphabetNavigationProps) {
	return (
		<aside className="fixed top-1/2 right-6 z-30 hidden -translate-y-1/2 pt-16 lg:flex" aria-label={m.web_library_alphabet_aria()}>
			<div className="flex flex-col items-center gap-0.5 rounded-2xl border border-border bg-card/70 p-1.5 shadow-lg backdrop-blur-xl">
				{ALPHABET.map((char) => {
					const isActive = activeLetter === char;

					return (
						<button
							key={char}
							type="button"
							onClick={() => onSelectLetter(isActive ? "" : char)}
							aria-pressed={isActive}
							title={isActive ? m.web_library_alphabet_clear() : m.web_library_alphabet_jump({ letter: char })}
							className={cn(
								"flex size-6 items-center justify-center rounded-lg font-bold text-xs transition-colors duration-150",
								isActive ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-primary hover:text-primary-foreground",
							)}
						>
							{char}
						</button>
					);
				})}
			</div>
		</aside>
	);
}
