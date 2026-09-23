export function extractDirectors(crew?: Array<{ job?: string | null; data?: { id?: string; name?: string } | null }> | null) {
	const directors: Array<{ id: string; name: string }> = [];
	if (!crew) return directors;

	const seen = new Set<string>();
	for (const member of crew) {
		const data = member.data;
		if (member.job === "Director" && data?.id && data.name) {
			const id = data.id;
			if (!seen.has(id)) {
				seen.add(id);
				directors.push({ id, name: data.name });
			}
		}
	}

	return directors;
}

export function extractStudios(companies?: Array<{ id?: string; name?: string }> | null) {
	const studios: Array<{ id: string; name: string }> = [];
	if (!companies) return studios;

	const seen = new Set<string>();
	for (const company of companies) {
		const id = company.id;
		const name = company.name;
		if (id && name && !seen.has(id)) {
			seen.add(id);
			studios.push({ id, name });
		}
	}

	return studios;
}
