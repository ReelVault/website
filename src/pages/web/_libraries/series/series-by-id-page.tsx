import { LibraryView } from "../components/library-view";

export default function SeriesByIdPage({ id = "" }: { id?: string }) {
	return <LibraryView id={id} type="tv_show" />;
}
