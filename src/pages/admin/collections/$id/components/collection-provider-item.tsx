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
		<div className="border-border/80 bg-muted/20 hover:border-border hover:bg-muted/30 flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors">
			<div className="flex min-w-0 items-center gap-3">
				<div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold tracking-wider">
					{provider.name.toUpperCase().slice(0, 4)}
				</div>
				<div className="flex min-w-0 flex-col">
					<div className="flex items-center gap-2">
						<span className="text-foreground text-sm font-semibold">{provider.name.toUpperCase()}</span>
						<Badge tone="muted" variant="outline" size="sm" font="mono">
							{provider.externalId}
						</Badge>
					</div>
					{provider.id && (
						<span className="text-muted-foreground truncate font-mono text-xs">
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
					{hasCopied ? <Check className="text-primary size-3.5" /> : <Copy className="text-muted-foreground size-3.5" />}
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
						<ExternalLink className="text-muted-foreground hover:text-foreground size-3.5" />
					</Button>
				)}
			</div>
		</div>
	);
}
