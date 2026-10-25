import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { m } from "@/paraglide/messages";
import { type CollectionProvider, CollectionProviderItem } from "../components/collection-provider-item";

interface CollectionProvidersCardProps {
	providers?: CollectionProvider[] | null;
}

export function CollectionProvidersCard({ providers }: CollectionProvidersCardProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>{m.admin_collections_external_providers()}</CardTitle>
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
					<div className="border-border/70 bg-muted/20 text-muted-foreground rounded-xl border border-dashed p-4 text-center text-xs">
						{m.admin_collections_no_providers_desc()}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
