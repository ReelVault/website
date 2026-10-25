import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useAdminLibraries } from "@/client/hooks/use-libraries";
import { AppEmptyState, AppLoadingState } from "@/components/app-states";
import { usePageTitle } from "@/hooks/use-page-title";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { EditLibraryForm } from "./components/edit-library-form";

export default function LibraryEditPage() {
	const { id } = useParams({ from: "/admin/libraries/$id/" });
	const navigate = useNavigate();
	const { libraries, isLoading } = useAdminLibraries();
	const library = libraries.find((lib) => lib.id === id);

	usePageTitle(library?.name ?? m.admin_libraries_edit_library());

	const goToLibraries = () => detach(navigate({ to: "/admin/libraries" }));

	if (isLoading) return <AppLoadingState label={m.admin_libraries_edit_library()} className="min-h-screen" />;

	return (
		<main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
			<Link
				to="/admin/libraries"
				className="text-muted-foreground hover:text-foreground inline-flex min-h-11 w-fit items-center gap-2 text-sm transition-colors"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				{m.common_back()}
			</Link>

			{library ? (
				<>
					<header className="flex flex-col gap-3">
						<h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">{m.admin_libraries_edit_library()}</h1>
						<p className="text-muted-foreground text-sm">{m.admin_libraries_edit_desc()}</p>
					</header>
					<EditLibraryForm key={library.id} library={library} onClose={goToLibraries} />
				</>
			) : (
				<AppEmptyState title={m.web_library_not_found()} />
			)}
		</main>
	);
}
