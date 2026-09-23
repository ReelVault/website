import { Check, Copy, Database, ExternalLink, Link2, Radio, Search } from "lucide-react";
import type { MetadataWithRelation } from "@reelvault/sdk";
import { formatProviderName, formatProviderShortName, getProviderUrl } from "@/client/utils/provider-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { useCopyToClipboard } from "@/utils/clipboard-utils";
import { formatDate } from "@/utils/format-utils";

function getEntityTypeLabel(entityType: string): string {
	if (entityType === "movie") return m.common_movie_word();

	if (entityType === "tv_show") return m.common_series_word();

	return entityType;
}

export function MetadataProvidersSection({ metadata, onOpenIdentify }: { metadata: MetadataWithRelation; onOpenIdentify: () => void }) {
	const providers = metadata.providers;
	const primaryId = metadata.primaryProviderId;

	return (
		<AdminSection
			title={m.admin_metadata_providers_section()}
			description={m.admin_metadata_sources_description()}
			actions={
				<Button type="button" variant="outline" size="sm" onClick={onOpenIdentify} className="h-8 gap-1.5 text-xs shadow-xs">
					<Link2 className="size-3.5 text-primary" />
					<span>{m.admin_metadata_match_link_provider()}</span>
				</Button>
			}
		>
			<div className="flex flex-col gap-4">
				{/* Primary Provider Highlight Banner */}
				<div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3">
						<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<Radio className="size-4" />
						</div>
						<div className="flex flex-col gap-0.5">
							<div className="flex flex-wrap items-center gap-2">
								<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									{m.admin_metadata_primary_data_provider()}
								</span>
								{primaryId ? (
									<Badge variant="default" size="sm" className="font-semibold">
										{formatProviderName(primaryId)}
									</Badge>
								) : (
									<Badge variant="outline" size="sm" className="text-muted-foreground">
										{m.admin_metadata_no_local_provider()}
									</Badge>
								)}
							</div>
							<p className="text-muted-foreground text-xs leading-relaxed">
								{primaryId
									? m.admin_metadata_basic_synced_from_named({ provider: formatProviderShortName(primaryId) })
									: m.admin_metadata_no_active_provider_notice()}
							</p>
						</div>
					</div>

					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onOpenIdentify}
						className="h-8 shrink-0 gap-1.5 bg-background/80 text-xs hover:bg-background"
					>
						<Search className="size-3.5 text-primary" />
						<span>{m.admin_metadata_change_match()}</span>
					</Button>
				</div>

				{/* Providers Cards Grid */}
				{providers.length > 0 ? (
					<div className="grid gap-3 sm:grid-cols-2">
						{providers.map((p) => (
							<ProviderCard key={p.id || `${p.name}-${p.externalId}`} provider={p} metadata={metadata} />
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-border/80 border-dashed bg-muted/20 p-6 text-center">
						<div className="flex size-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
							<Database className="size-5 text-primary" />
						</div>
						<div className="flex flex-col gap-1">
							<p className="font-medium text-foreground text-sm">{m.admin_metadata_no_external_ids()}</p>
							<p className="max-w-md text-muted-foreground text-xs">{m.admin_metadata_no_external_ids_hint()}</p>
						</div>
						<Button type="button" variant="outline" size="sm" onClick={onOpenIdentify} className="mt-1 gap-1.5 text-xs">
							<Search className="size-3.5 text-primary" />
							<span>{m.admin_metadata_search_link_tmdb()}</span>
						</Button>
					</div>
				)}
			</div>
		</AdminSection>
	);
}

function ProviderCard({ provider, metadata }: { provider: MetadataWithRelation["providers"][number]; metadata: MetadataWithRelation }) {
	const { hasCopied, copy } = useCopyToClipboard();
	const isPrimary = provider.name.toLowerCase() === metadata.primaryProviderId?.toLowerCase() || provider.id === metadata.primaryProviderId;
	const externalUrl = getProviderUrl(provider.name, provider.externalId, metadata.type);
	const shortName = formatProviderShortName(provider.name);

	const handleCopy = () => {
		detach(copy(provider.externalId, m.admin_metadata_provider_id_copy_word({ name: shortName })));
	};

	return (
		<div className="flex flex-col justify-between gap-3 rounded-xl border border-border/80 bg-background p-4 shadow-xs transition-colors hover:border-border">
			<div className="flex items-start justify-between gap-2">
				<div className="flex items-center gap-2">
					<div className="flex h-8 w-12 shrink-0 items-center justify-center rounded-lg bg-muted font-bold text-foreground text-xs">
						{shortName.slice(0, 4)}
					</div>
					<div>
						<h4 className="font-semibold text-foreground text-sm">{formatProviderName(provider.name)}</h4>
						<span className="text-[11px] text-muted-foreground">
							{m.admin_metadata_type_label({ type: getEntityTypeLabel(provider.entityType) })}
						</span>
					</div>
				</div>
				{isPrimary && (
					<Badge variant="secondary" size="sm" className="shrink-0 border-primary/30 bg-primary/10 text-[10px] text-primary">
						{m.admin_metadata_primary()}
					</Badge>
				)}
			</div>

			<div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
				<div className="flex min-w-0 items-center gap-1.5 text-xs">
					<span className="shrink-0 text-muted-foreground">{m.admin_metadata_provider_id_label()}</span>
					<code className="truncate font-mono font-semibold text-foreground text-xs">{provider.externalId}</code>
				</div>

				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
					onClick={handleCopy}
					title={m.admin_metadata_copy_id_named({ name: shortName })}
					aria-label={m.admin_metadata_copy_id_named({ name: shortName })}
				>
					{hasCopied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
				</Button>
			</div>

			<div className="flex items-center justify-between gap-2 border-border/40 border-t pt-1">
				<span className="text-[11px] text-muted-foreground">{m.metadata_provider_added_at({ date: formatDate(provider.createdAt) })}</span>

				{externalUrl && (
					<Button
						variant="ghost"
						size="sm"
						className="h-7 gap-1 px-2 text-primary text-xs hover:bg-primary/10 hover:text-primary"
						nativeButton={false}
						render={
							<a
								href={externalUrl}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={m.admin_metadata_open_in_named({ name: shortName })}
							/>
						}
					>
						<span>
							{/* TODO: fix */}
							{m.admin_metadata_open_in()} {shortName}
						</span>
						<ExternalLink className="size-3" />
					</Button>
				)}
			</div>
		</div>
	);
}
