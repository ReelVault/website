import type { MetadataWithRelation } from "@reelvault/sdk";
import { Check, Copy, Globe, Info, Sparkles, TrendingUp } from "lucide-react";
import { formatProviderShortName } from "@/client/utils/provider-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { useCopyToClipboard } from "@/utils/clipboard-utils";
import { formatDateTime, formatTimeAgo } from "@/utils/format-utils";

export function MetadataTechnicalSection({ metadata }: { metadata: MetadataWithRelation }) {
	return (
		<AdminSection title={m.admin_metadata_system_info_section()} description={m.admin_metadata_identifiers_sync_description()}>
			<div className="flex flex-col gap-3">
				{/* IDs with copy buttons */}
				<IdRow label={m.admin_metadata_internal_id()} value={metadata.id} />
				<IdRow label={m.admin_metadata_stable_key_label()} value={metadata.stableKey} />

				{/* Key-Value Details */}
				<div className="grid grid-cols-2 gap-2.5 border-border/50 border-t pt-2">
					<DetailItem
						icon={Sparkles}
						label={m.admin_metadata_main_provider()}
						value={metadata.primaryProviderId ? formatProviderShortName(metadata.primaryProviderId) : m.common_no_data()}
					/>
					<DetailItem icon={Globe} label={m.admin_metadata_origin_country()} value={metadata.originCountry ?? m.common_no_data()} />
					<DetailItem
						icon={Info}
						label={m.admin_metadata_match_indicator()}
						value={metadata.matchScore != null ? `${Math.round(metadata.matchScore * 100)}%` : m.common_no_data()}
					/>
					<DetailItem icon={TrendingUp} label={m.admin_metadata_popularity()} value={metadata.popularity.toFixed(1)} />
				</div>

				{/* Translation status */}
				<div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs">
					<span className="text-muted-foreground">{m.admin_metadata_translation_state()}</span>
					{metadata.hasMissingTranslation ? (
						<Badge variant="outline" size="sm" className="border-warning/30 bg-warning/10 text-[11px] text-warning">
							{m.admin_metadata_no_translation()}
						</Badge>
					) : (
						<Badge variant="outline" size="sm" className="border-success/30 bg-success/10 text-[11px] text-success">
							{m.admin_metadata_translation_complete()}
						</Badge>
					)}
				</div>

				{/* Timestamps */}
				<div className="flex flex-col gap-1 border-border/50 border-t pt-2 text-[11px] text-muted-foreground">
					<div className="flex justify-between">
						<span>{m.admin_metadata_created_in_db()}</span>
						<span className="font-mono text-foreground">{formatDateTime(metadata.createdAt)}</span>
					</div>
					<div className="flex justify-between">
						<span>{m.admin_metadata_last_sync()}</span>
						<span className="font-mono text-foreground" title={formatDateTime(metadata.updatedAt)}>
							{formatTimeAgo(metadata.updatedAt)}
						</span>
					</div>
				</div>
			</div>
		</AdminSection>
	);
}

function IdRow({ label, value }: { label: string; value: string }) {
	const { hasCopied, copy } = useCopyToClipboard();

	return (
		<div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5">
			<div className="flex min-w-0 flex-col">
				<span className="font-semibold text-[10px] text-muted-foreground uppercase">{label}</span>
				<code className="truncate font-medium font-mono text-foreground text-xs">{value}</code>
			</div>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
				onClick={() => detach(copy(value, label))}
				title={m.admin_metadata_copy_label({ label })}
				aria-label={m.admin_metadata_copy_label({ label })}
			>
				{hasCopied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
			</Button>
		</div>
	);
}

function DetailItem({ icon: Icon, label, value }: { icon: typeof Globe; label: string; value: string }) {
	return (
		<div className="flex flex-col gap-0.5 rounded-lg border border-border/50 bg-background/50 p-2.5">
			<div className="flex items-center gap-1 font-semibold text-[10px] text-muted-foreground uppercase">
				<Icon className="size-3 text-primary" />
				<span>{label}</span>
			</div>
			<span className="truncate font-medium text-foreground text-xs">{value}</span>
		</div>
	);
}
