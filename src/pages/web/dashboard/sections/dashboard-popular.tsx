import { Flame } from "lucide-react";
import { useMetadataPopular } from "@/client/hooks/use-metadata-queries";
import { m } from "@/paraglide/messages";
import { DashboardDiscoverySection } from "../components/dashboard-discovery-section";

export default function DashboardPopular() {
	const popularQuery = useMetadataPopular(12);

	return (
		<DashboardDiscoverySection
			icon={Flame}
			category={m.web_most_watched()}
			title={m.web_popular_title()}
			subtitle={m.web_popular_subtitle()}
			items={popularQuery.data?.data ?? []}
			query={popularQuery}
			errorTitle={m.web_popular_fetch_failed()}
			errorDescription={m.web_popular_problem()}
			emptyTitle={m.web_popular_empty_title()}
			emptyDescription={m.web_popular_empty_desc()}
		/>
	);
}
