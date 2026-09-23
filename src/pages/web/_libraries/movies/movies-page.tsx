import { usePageTitle } from "@/hooks/use-page-title";
import { m } from "@/paraglide/messages";
import { RedirectToFirstLibrary } from "../components/redirect-to-first-library";

export default function MoviesPage() {
	usePageTitle(m.navbar_movies());

	return <RedirectToFirstLibrary type="movie" />;
}
