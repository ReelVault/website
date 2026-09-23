import { Check, Copy, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { useCopyToClipboard } from "@/utils/clipboard-utils";

export interface CollectionProvider {
	id: string;
	name: string;
	externalId: string;
}

export function CollectionProviderItem({ provider }: { provider: CollectionProvider }) {
	const { hasCopied, copy } = useCopyToClipboard();
	const isTmdb = provider.name.toLowerCase() === "tmdb";
	const externalUrl = isTmdb ? `https://www.themoviedb.org/collection/${encodeURIComponent(provider.externalId)}` : null;

	const handleCopy = () => {
		detach(copy(provider.externalId, m.admin_collections_copy_provider_id_word({ name: provider.name })));
	};

	return (
		<div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/20 p-3.5 transition-colors hover:border-border hover:bg-muted/30">
			<div className="flex min-w-0 items-center gap-3">
				<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-xs tracking-wider">
					{provider.name.toUpperCase().slice(0, 4)}
				</div>
				<div className="flex min-w-0 flex-col">
					<div className="flex items-center gap-2">
						<span className="font-semibold text-foreground text-sm">{provider.name.toUpperCase()}</span>
						<Badge variant="outline" size="sm" className="font-mono text-[11px] text-muted-foreground">
							{provider.externalId}
						</Badge>
					</div>
					{provider.id && (
						<span className="truncate font-mono text-[10px] text-muted-foreground">
							{m.admin_collections_link_id({ providerId: provider.id })}
						</span>
					)}
				</div>
			</div>
			<div className="flex shrink-0 items-center gap-1">
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					onClick={handleCopy}
					aria-label={m.admin_collections_copy_id({ name: provider.name })}
				>
					{hasCopied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5 text-muted-foreground" />}
				</Button>
				{externalUrl && (
					<Button
						variant="ghost"
						size="icon-sm"
						nativeButton={false}
						aria-label={m.admin_collections_open_in_named({ name: provider.name })}
						render={
							<a
								href={externalUrl}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={m.admin_collections_open_in_named({ name: provider.name })}
							/>
						}
					>
						<ExternalLink className="size-3.5 text-muted-foreground hover:text-foreground" />
					</Button>
				)}
			</div>
		</div>
	);
}
