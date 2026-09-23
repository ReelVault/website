import { LibraryView } from "../components/library-view";

export default function MoviesByIdPage({ id = "" }: { id?: string }) {
	return <LibraryView id={id} type="movie" />;
}
