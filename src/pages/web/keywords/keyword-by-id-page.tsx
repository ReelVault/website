import { useParams } from "@tanstack/react-router";
import { Tag } from "lucide-react";
import { useState } from "react";
import { useTaxonomyDetails } from "@/client/hooks/use-taxonomy-details";
import { m } from "@/paraglide/messages";
import { TaxonomyPage } from "../taxonomy-page";

export default function KeywordByIdPage() {
	const { id } = useParams({ from: "/_web/keywords/$id" });
	const [page, setPage] = useState(1);
	const { taxonomyQuery, metadataQuery, metadata, totalPages, total } = useTaxonomyDetails("keyword", id, page, 24);

	return (
		<TaxonomyPage
			icon={Tag}
			taxonomyLabel={m.web_keyword()}
			sectionTitle={m.web_titles_matching_phrase()}
			errorMessage={m.web_keyword_fetch_failed()}
			taxonomyQuery={taxonomyQuery}
			metadataQuery={metadataQuery}
			metadata={metadata}
			total={total}
			totalPages={totalPages}
			page={page}
			onPageChange={setPage}
			backTo="/"
			backLabel={m.common_home_page()}
		/>
	);
}
