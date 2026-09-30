import { Languages } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { m } from "@/paraglide/messages";
import { contentLanguageOptions } from "@/utils/locales";

const DEFAULT_SENTINEL = "__default__";

interface MetadataLanguageSelectorProps {
	value: string | null;
	onChange: (language: string | null) => void;
}

/** Per-library metadata language override; the default option clears it so
 * providers keep their own configured language. */
export function MetadataLanguageSelector({ value, onChange }: MetadataLanguageSelectorProps) {
	const options = contentLanguageOptions(m.admin_libraries_metadata_language_default());

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
				<Languages className="size-3.5" />
				<span>{m.admin_libraries_metadata_language()}</span>
			</div>
			<Select value={value ?? DEFAULT_SENTINEL} onValueChange={(next) => onChange(next === DEFAULT_SENTINEL ? null : next)}>
				<SelectTrigger aria-label={m.admin_libraries_metadata_language()} className="h-9 w-full bg-background text-xs">
					<SelectValue />
				</SelectTrigger>
				<SelectContent className="max-h-72 w-[calc(100vw-4rem)] overflow-y-auto sm:w-120">
					<SelectGroup>
						{options.map(([code, label]) => (
							<SelectItem key={code === "" ? DEFAULT_SENTINEL : code} value={code === "" ? DEFAULT_SENTINEL : code} label={label}>
								<span className="font-medium text-foreground text-xs">{label}</span>
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			<p className="text-[11px] text-muted-foreground">{m.admin_libraries_metadata_language_desc()}</p>
		</div>
	);
}
