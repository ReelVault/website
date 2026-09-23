import type { MetadataWithRelation } from "@reelvault/sdk";
import { cn } from "cn";
import { Building2, Hash, Layers, type LucideIcon, Tag } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { MetadataLockToggle } from "./metadata-lock-toggle";

const MAX_VISIBLE_KEYWORDS = 15;

export function MetadataTaxonomySection({
	metadata,
	lockedFields,
	onToggleLock,
}: {
	metadata: MetadataWithRelation;
	lockedFields: string[];
	onToggleLock: (field: string) => void;
}) {
	const genres = metadata.genres;
	const companies = metadata.companies;
	const keywords = metadata.keywords;
	const collections = metadata.collections;

	if (genres.length === 0 && companies.length === 0 && keywords.length === 0 && collections.length === 0) return null;

	const lockedSet = new Set(lockedFields);
	const groups = [genres.length > 0, companies.length > 0, collections.length > 0, keywords.length > 0];
	const firstVisibleIndex = groups.indexOf(true);

	return (
		<AdminSection title={m.admin_metadata_links_classification()} description={m.admin_metadata_taxonomy_section_desc()}>
			<div className="flex flex-col gap-4">
				{genres.length > 0 && (
					<TaxonomyGroup
						icon={Tag}
						label={m.admin_nav_genres()}
						field="genres"
						isLocked={lockedSet.has("genres")}
						onToggleLock={onToggleLock}
						isFirst={firstVisibleIndex === 0}
					>
						{genres.map((g) => (
							<Badge key={g.id} variant="secondary" size="sm" className="font-medium">
								{g.name}
							</Badge>
						))}
					</TaxonomyGroup>
				)}

				{companies.length > 0 && (
					<TaxonomyGroup
						icon={Building2}
						label={m.admin_metadata_studios_companies()}
						field="companies"
						isLocked={lockedSet.has("companies") || lockedSet.has("studios")}
						onToggleLock={onToggleLock}
						isFirst={firstVisibleIndex === 1}
					>
						{companies.map((c) => (
							<Badge key={c.id} variant="outline" size="sm">
								{c.name}
							</Badge>
						))}
					</TaxonomyGroup>
				)}

				{collections.length > 0 && (
					<TaxonomyGroup
						icon={Layers}
						label={m.admin_metadata_collections_series()}
						field="collections"
						isLocked={lockedSet.has("collections")}
						onToggleLock={onToggleLock}
						isFirst={firstVisibleIndex === 2}
					>
						{collections.map((col) => (
							<Badge key={col.id} variant="secondary" size="sm" className="gap-1.5 font-medium">
								<span>{col.name}</span>
								<span className="font-normal text-[10px] opacity-70">{m.admin_metadata_collection_sort_mode({ mode: col.sortMode })}</span>
							</Badge>
						))}
					</TaxonomyGroup>
				)}

				{keywords.length > 0 && (
					<TaxonomyGroup
						icon={Hash}
						label={m.admin_nav_keywords()}
						field="keywords"
						isLocked={lockedSet.has("keywords")}
						onToggleLock={onToggleLock}
						isFirst={firstVisibleIndex === 3}
					>
						{keywords.slice(0, MAX_VISIBLE_KEYWORDS).map((k) => (
							<span
								key={k.id}
								className="rounded-md border border-border/70 bg-muted/20 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
							>
								{m.common_hashtag_label({ name: k.name })}
							</span>
						))}
						{keywords.length > MAX_VISIBLE_KEYWORDS && (
							<span className="self-center text-[11px] text-muted-foreground">
								{m.admin_metadata_hidden_keywords({ hiddenCount: keywords.length - MAX_VISIBLE_KEYWORDS })}
							</span>
						)}
					</TaxonomyGroup>
				)}
			</div>
		</AdminSection>
	);
}

function TaxonomyGroup({
	icon: Icon,
	label,
	field,
	isLocked,
	onToggleLock,
	isFirst,
	children,
}: {
	icon: LucideIcon;
	label: string;
	field: string;
	isLocked: boolean;
	onToggleLock: (field: string) => void;
	isFirst: boolean;
	children: ReactNode;
}) {
	return (
		<div className={cn("flex flex-col gap-2", !isFirst && "border-border/50 border-t pt-3")}>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-1.5 font-medium text-muted-foreground text-xs">
					<Icon className="size-3.5 text-primary" />
					<span>{label}</span>
				</div>
				<MetadataLockToggle field={field} label={label} isLocked={isLocked} onToggle={onToggleLock} />
			</div>
			<div className="flex flex-wrap gap-2">{children}</div>
		</div>
	);
}
