import { usePersonData } from "@/client/hooks/use-person-data";
import { Button } from "@/components/ui/button";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { PersonFilmographyList } from "./components/person-filmography-list";
import { PersonHero } from "./components/person-hero";
import { PersonPageSkeleton } from "./components/person-page-skeleton";
import { PersonSidebar } from "./components/person-sidebar";
import { PersonStats } from "./components/person-stats";

export default function PersonByIdPage({ id = "" }: { id?: string }) {
	const { personData, personMetadataList, isLoading, error, refetch } = usePersonData(id);

	if (isLoading) return <PersonPageSkeleton />;

	if (error || !personData) {
		return (
			<div className="flex min-h-screen items-center justify-center p-6">
				<div role="alert" className="cinema-surface max-w-xl p-6 text-center">
					<p className="font-semibold">{m.web_person_fetch_failed()}</p>
					<p className="mt-1 text-muted-foreground text-sm">{m.web_check_connection()}</p>
					<Button
						type="button"
						variant="outline"
						className="mt-4"
						onClick={() => {
							detach(refetch());
						}}
					>
						{m.common_try_again()}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="cinema-page">
			{/* Background Decoration */}
			<div className="pointer-events-none absolute top-0 left-1/4 h-125 w-125 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_12%,transparent)_0%,transparent_70%)]" />

			<div className="relative flex flex-col gap-16 px-6 py-12 sm:px-12 lg:flex-row lg:px-24">
				<PersonSidebar personData={personData} personMetadataList={personMetadataList} />

				<div className="flex min-w-0 flex-1 flex-col gap-12 sm:gap-16">
					<PersonHero personId={personData.id} name={personData.name} />
					<PersonStats metadata={personMetadataList} />

					<section className="space-y-6">
						<div className="cinema-section-heading">
							<h2>{m.web_person_filmography()}</h2>
							<p>{m.web_person_titles_with_person({ count: personMetadataList.length })}</p>
						</div>
						<PersonFilmographyList metadataList={personMetadataList} />
					</section>
				</div>
			</div>
		</div>
	);
}
