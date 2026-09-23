export interface MetadataFormState {
	title: string;
	sortTitle: string;
	numberingMode: string;
	originalTitle: string;
	overview: string;
	tagline: string;
	status: string;
	releaseDate: string;
	budget: string;
	revenue: string;
	lockedFields: string[];
}

/** Fields edited in BasicInfoSection — intentionally without `overview` and `lockedFields`,
 *  so a keystroke in one does not re-render the other (separate state slices). */
export interface MetadataBasicFields {
	title: string;
	sortTitle: string;
	numberingMode: string;
	originalTitle: string;
	tagline: string;
	status: string;
	releaseDate: string;
	budget: string;
	revenue: string;
}

export const emptyMetadataForm: MetadataFormState = {
	title: "",
	sortTitle: "",
	numberingMode: "",
	originalTitle: "",
	overview: "",
	tagline: "",
	status: "",
	releaseDate: "",
	budget: "",
	revenue: "",
	lockedFields: [],
};
