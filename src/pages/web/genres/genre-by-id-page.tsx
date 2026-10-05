import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { Clapperboard } from "lucide-react";
import { useTaxonomyDetails } from "@/client/hooks/use-taxonomy-details";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { TaxonomyPage } from "../taxonomy-page";

export default function GenreByIdPage() {
	const { id } = useParams({ from: "/_web/genres/$id" });
	const { page } = useSearch({ from: "/_web/genres/$id" });
	const navigate = useNavigate({ from: "/_web/genres/$id" });
	const setPage = (next: number) => {
		detach(navigate({ search: { page: next > 1 ? next : undefined }, replace: true }));
	};
	const { taxonomyQuery, metadataQuery, metadata, totalPages, total } = useTaxonomyDetails("genre", id, page, 24);

	return (
		<TaxonomyPage
			icon={Clapperboard}
			taxonomyLabel={m.common_genre_word()}
			sectionTitle={m.web_titles_in_genre()}
			errorMessage={m.web_genre_fetch_failed()}
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
