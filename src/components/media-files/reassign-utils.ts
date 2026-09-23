const FILE_EXTENSION_REGEX = /\.[a-z0-9]+$/i;
const FILE_NAME_TITLE_YEAR_REGEX = /^(.*?)(?:[.\s_]+)(\d{4})(?:[.\s_]|$)/;
const FILE_NAME_SEPARATOR_REGEX = /[._]/g;

export function parseFileNameInitial(fileName: string): { title: string; year?: number } {
	const cleanName = fileName.replace(FILE_EXTENSION_REGEX, "");
	const match = cleanName.match(FILE_NAME_TITLE_YEAR_REGEX);
	if (match?.[1] && match[2]) {
		const rawTitle = match[1].replace(FILE_NAME_SEPARATOR_REGEX, " ").trim();
		const year = Number(match[2]);

		return { title: rawTitle, year };
	}

	return { title: cleanName.replace(FILE_NAME_SEPARATOR_REGEX, " ").trim(), year: undefined };
}
