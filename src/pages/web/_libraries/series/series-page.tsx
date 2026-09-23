import { usePageTitle } from "@/hooks/use-page-title";
import { m } from "@/paraglide/messages";
import { RedirectToFirstLibrary } from "../components/redirect-to-first-library";

export default function SeriesPage() {
	usePageTitle(m.navbar_series());

	return <RedirectToFirstLibrary type="tv_show" />;
}
