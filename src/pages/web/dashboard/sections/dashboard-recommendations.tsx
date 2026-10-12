import type { MetadataWithRelation } from "@reelvault/sdk";
import { Sparkles } from "lucide-react";
import { useDiscovery } from "@/client/hooks/use-discovery";
import { m } from "@/paraglide/messages";
import { DashboardDiscoverySection } from "../components/dashboard-discovery-section";

// The discovery endpoint returns raw DTOs that are structurally compatible with
// MetadataWithRelation; narrow them with a runtime check instead of an unsafe
// type assertion.
const isMetadataWithRelation = (item: unknown): item is MetadataWithRelation =>
	typeof item === "object" && item !== null && "id" in item && "title" in item;

export default function DashboardRecommendations() {
	const { discoverQuery, discoverView } = useDiscovery();

	const recommendations = (discoverView?.recommendations ?? []).filter((item) => isMetadataWithRelation(item));
	const trending = (discoverView?.trending ?? []).filter((item) => isMetadataWithRelation(item));
	const baseItems = recommendations.length > 0 ? recommendations : trending;
	const isFallbackTrending = recommendations.length === 0 && trending.length > 0;

	return (
		<DashboardDiscoverySection
			icon={Sparkles}
			category={isFallbackTrending ? m.web_trending_now() : m.web_for_you()}
			title={m.web_for_you_title()}
			subtitle={isFallbackTrending ? m.web_hits_subtitle() : m.web_for_you_subtitle()}
			items={baseItems.slice(5)}
			query={discoverQuery}
			errorTitle={m.web_recommendations_fetch_failed()}
			errorDescription={m.web_suggestions_problem()}
			emptyTitle={m.web_no_recommendations()}
			emptyDescription={m.web_watch_for_suggestions()}
		/>
	);
}
