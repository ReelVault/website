import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { m } from "@/paraglide/messages";
import { type CollectionProvider, CollectionProviderItem } from "../components/collection-provider-item";

interface CollectionProvidersCardProps {
	providers?: CollectionProvider[] | null;
}

export function CollectionProvidersCard({ providers }: CollectionProvidersCardProps) {
	return (
		<Card className="border-border/80 bg-card">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="font-semibold text-base">{m.admin_collections_external_providers()}</CardTitle>
						<CardDescription>{m.admin_collections_external_identifiers()}</CardDescription>
					</div>
					{providers && providers.length > 0 && (
						<Badge variant="secondary" size="sm">
							{m.common_providers_count({ count: providers.length })}
						</Badge>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{providers && providers.length > 0 ? (
					<div className="grid gap-3 sm:grid-cols-2">
						{providers.map((provider) => (
							<CollectionProviderItem key={provider.id || `${provider.name}-${provider.externalId}`} provider={provider} />
						))}
					</div>
				) : (
					<div className="rounded-xl border border-border/70 border-dashed bg-muted/20 p-4 text-center text-muted-foreground text-xs">
						{m.admin_collections_no_providers_desc()}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
