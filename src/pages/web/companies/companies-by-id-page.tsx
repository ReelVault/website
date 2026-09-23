import { useParams } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { useState } from "react";
import { useCompanyDetails } from "@/client/hooks/use-companies";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { TaxonomyPage } from "../taxonomy-page";

export default function CompanyByIdPage() {
	const { id } = useParams({ from: "/_web/companies/$id" });
	const [page, setPage] = useState(1);
	const { companyQuery, metadataQuery, metadata, totalPages, total } = useCompanyDetails(id, page, 24);
	const company = companyQuery.data;

	return (
		<TaxonomyPage
			icon={Building2}
			taxonomyLabel="Firma produkcyjna"
			sectionTitle={m.web_studio_titles()}
			errorMessage={m.web_company_fetch_failed()}
			taxonomyQuery={companyQuery}
			metadataQuery={metadataQuery}
			metadata={metadata}
			total={total}
			totalPages={totalPages}
			page={page}
			onPageChange={setPage}
			backTo="/companies"
			backLabel={m.web_all_studios()}
			logoImageId={company?.imageId}
			logoUpdatedAt={company?.updatedAt}
			headerSubtitle={company?.originalName ?? undefined}
			onTaxonomyRetry={() => detach(companyQuery.refetch())}
			onMetadataRetry={() => detach(metadataQuery.refetch())}
			metadataErrorMessage={m.web_studio_titles_fetch_failed()}
		/>
	);
}
