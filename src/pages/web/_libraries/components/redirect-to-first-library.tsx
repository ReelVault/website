import type { MetadataType } from "@reelvault/sdk";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useLibrariesQuery } from "@/client/hooks/use-libraries";
import { AppEmptyState, AppErrorState, AppLoadingState } from "@/components/app-states";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

export function RedirectToFirstLibrary({ type }: { type: MetadataType }) {
	const navigate = useNavigate();
	const libraryType = type === "movie" ? "movies" : "tv_shows";

	const { data, isLoading, isError, error, refetch } = useLibrariesQuery(libraryType);

	useEffect(() => {
		const firstLibraryId = data?.data[0]?.id;
		if (firstLibraryId) {
			if (type === "movie") {
				detach(navigate({ to: "/movies/$id", params: { id: firstLibraryId }, replace: true }));
			} else {
				detach(navigate({ to: "/series/$id", params: { id: firstLibraryId }, replace: true }));
			}
		}
	}, [data, navigate, type]);

	if (isLoading) {
		return <AppLoadingState label={m.web_loading_library()} className="min-h-screen" />;
	}

	if (isError || (data?.data && data.data.length === 0)) {
		return (
			<div className="cinema-shell flex min-h-screen items-center justify-center py-16">
				{isError ? (
					<AppErrorState
						title={m.web_libraries_fetch_failed()}
						description={m.web_check_connection()}
						error={error}
						onRetry={() => {
							detach(refetch());
						}}
					/>
				) : (
					<AppEmptyState title={m.web_no_libraries()} description={m.web_add_library_first()} />
				)}
			</div>
		);
	}

	return <AppLoadingState label={m.web_opening_library()} className="min-h-screen" />;
}
