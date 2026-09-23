import type { MetadataType } from "@reelvault/sdk";
import { useLibraryData } from "@/client/hooks/use-libraries";
import { AppEmptyState, AppErrorState } from "@/components/app-states";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTitle } from "@/hooks/use-page-title";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { LibraryLayout } from "./library-layout";

function LibraryViewSkeleton() {
	return (
		<div className="min-h-screen bg-background" role="status" aria-busy="true" aria-label={m.web_loading_libraries()}>
			<header className="relative flex min-h-[45vh] flex-col items-center justify-center overflow-hidden border-border border-b px-6 pt-12">
				<div className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent" />
				<div className="flex flex-col items-center gap-4 text-center">
					<Skeleton className="h-4 w-32 rounded-full" />
					<Skeleton className="h-16 w-72 rounded-2xl sm:h-20 sm:w-96" />
					<Skeleton className="h-4 w-20 rounded-full" />
				</div>
			</header>
			<div className="cinema-shell border-border/70 border-b py-4">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<Skeleton className="h-10 w-48 rounded-xl" />
					<Skeleton className="h-10 w-28 rounded-xl" />
				</div>
			</div>
			<div className="cinema-shell py-10">
				<div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"].map((placeholder) => (
						<div key={placeholder} className="flex flex-col gap-3">
							<Skeleton className="aspect-2/3 w-full rounded-xl" />
							<Skeleton className="h-4 w-3/4 rounded-full" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export function LibraryView({ id, type }: { id: string; type: MetadataType }) {
	const { library, allLibraries, isLoading, error, refetch } = useLibraryData(id, type);

	let title = "...";
	if (library) title = library.name;

	usePageTitle(title);

	if (isLoading) return <LibraryViewSkeleton />;

	if (error || !library) {
		return (
			<div className="cinema-shell flex min-h-screen items-center justify-center py-16">
				{error ? (
					<AppErrorState
						title={m.web_library_fetch_failed()}
						description={m.web_check_connection()}
						error={error}
						onRetry={() => {
							detach(refetch());
						}}
					/>
				) : (
					<AppEmptyState title={m.web_library_not_found()} description={m.web_select_other_library()} />
				)}
			</div>
		);
	}

	return <LibraryLayout currentLibrary={library} allLibraries={allLibraries} />;
}
