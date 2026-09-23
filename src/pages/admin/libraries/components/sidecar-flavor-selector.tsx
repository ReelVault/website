import { ScrollText } from "lucide-react";
import type { SidecarFlavor } from "@reelvault/sdk";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { m } from "@/paraglide/messages";

interface SidecarFlavorSelectorProps {
	value: SidecarFlavor;
	onChange: (flavor: SidecarFlavor) => void;
}

/** Picks which NFO dialect sidecar saving writes — ReelVault's own or the
 * standard Kodi format that Plex and Jellyfin also read. */
export function SidecarFlavorSelector({ value, onChange }: SidecarFlavorSelectorProps) {
	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
				<ScrollText className="size-3.5" />
				<span>{m.admin_libraries_sidecar_flavor()}</span>
			</div>
			<Select
				value={value}
				onValueChange={(next) => {
					if (next === "reelvault" || next === "kodi") onChange(next);
				}}
			>
				<SelectTrigger aria-label={m.admin_libraries_sidecar_flavor()} className="h-9 w-full bg-background text-xs">
					<SelectValue />
				</SelectTrigger>
				<SelectContent className="w-[calc(100vw-4rem)] sm:w-120">
					<SelectGroup>
						<SelectItem value="reelvault" label={m.admin_libraries_flavor_reelvault()}>
							<div className="flex flex-col py-0.5">
								<span className="font-medium text-foreground text-xs">{m.admin_libraries_flavor_reelvault()}</span>
								<span className="text-[11px] text-muted-foreground">{m.admin_libraries_flavor_reelvault_note()}</span>
							</div>
						</SelectItem>
						<SelectItem value="kodi" label={m.admin_libraries_flavor_kodi()}>
							<div className="flex flex-col py-0.5">
								<span className="font-medium text-foreground text-xs">{m.admin_libraries_flavor_kodi()}</span>
								<span className="text-[11px] text-muted-foreground">{m.admin_libraries_flavor_kodi_note()}</span>
							</div>
						</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	);
}
