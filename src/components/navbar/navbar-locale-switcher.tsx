import { Languages } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { m } from "@/paraglide/messages";
import { getAppLocale, setAppLocale } from "@/utils/locale";
import { SUPPORTED_LOCALES } from "@/utils/locales";

export function NavbarLocaleSwitcher() {
	const current = getAppLocale();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label={m.navbar_language()}
				className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
			>
				<Languages className="size-5" aria-hidden="true" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{SUPPORTED_LOCALES.map((locale) => {
					const Icon = locale.icon;

					return (
						<DropdownMenuItem
							key={locale.code}
							disabled={locale.code === current}
							onClick={() => setAppLocale(locale.code)}
							className="hover:cursor-pointer"
						>
							<Icon />
							{locale.label}
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
