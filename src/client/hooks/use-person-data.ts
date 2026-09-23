import { queryOptions, useQuery } from "@tanstack/react-query";
import { m } from "@/paraglide/messages";
import { reelvault } from "../client";
import { personDetailsFields } from "../utils/fields";
import { metadataKeys, personKeys } from "../utils/query-keys";
import { useEntityRefreshMutation } from "./use-entity-refresh";
import { metadataPersonQueryOptions, useMetadataPerson } from "./use-metadata-queries";

export const personQueryOptions = (personId: string) =>
	queryOptions({
		queryKey: personKeys.detail(personId),
		queryFn: () => reelvault.people.getById(personId, { fields: personDetailsFields }),
		staleTime: 1000 * 60 * 120,
	});

export const personMetadataQueryOptions = metadataPersonQueryOptions;

export function usePersonData(personId: string) {
	const personQuery = useQuery(personQueryOptions(personId));

	const personMetadataQuery = useMetadataPerson(personId);

	return {
		personData: personQuery.data,
		personMetadataList: personMetadataQuery.data?.data ?? [],
		isLoading: personQuery.isLoading || personMetadataQuery.isLoading,
		error: personQuery.error ?? personMetadataQuery.error,
		refetch: async () => {
			await Promise.all([personQuery.refetch(), personMetadataQuery.refetch()]);
		},
	};
}

export function useRefreshPerson() {
	return useEntityRefreshMutation({
		mutationFn: (personId: string) => reelvault.people.refresh(personId),
		invalidationKeys: [personKeys.all, metadataKeys.all],
		successMessage: m.toast_person_refreshed(),
		errorMessage: m.toast_person_refresh_failed(),
	});
}

export function useRefreshPersonImage() {
	return useEntityRefreshMutation({
		mutationFn: (personId: string) => reelvault.people.refreshImage(personId),
		invalidationKeys: [personKeys.all, metadataKeys.all],
		successMessage: m.toast_person_photo_forced(),
		errorMessage: m.toast_person_photo_failed(),
	});
}
