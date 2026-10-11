import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
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
				render={<Button variant="ghost" size="icon" />}
				className="flex shrink-0 items-center justify-center"
			>
				<Languages className="size-5" aria-hidden="true" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{SUPPORTED_LOCALES.map((locale) => {
					const Icon = locale.icon;

					return (
						<DropdownMenuItem key={locale.code} disabled={locale.code === current} onClick={() => setAppLocale(locale.code)}>
							<Icon />
							{locale.label}
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
