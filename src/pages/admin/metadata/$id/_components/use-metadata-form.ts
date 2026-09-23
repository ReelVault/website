import { useForm, useSelector } from "@tanstack/react-form";
import { useEffect } from "react";
import type { useAdminMetadataEditor } from "@/client/hooks/use-admin-metadata-editor";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { emptyMetadataForm, type MetadataBasicFields, type MetadataFormState } from "./types";

export const ALL_LOCKABLE_FIELDS = [
	"title",
	"sortTitle",
	"originalTitle",
	"overview",
	"tagline",
	"releaseDate",
	"status",
	"budget",
	"revenue",
	"genres",
	"companies",
	"keywords",
	"posters",
	"backdrops",
] as const;

type MetadataQueryData = NonNullable<ReturnType<typeof useAdminMetadataEditor>["metadataQuery"]["data"]>;
type UpdateMutation = ReturnType<typeof useAdminMetadataEditor>["updateMutation"];

function pickBasic(form: typeof emptyMetadataForm): MetadataBasicFields {
	const { title, sortTitle, numberingMode, originalTitle, tagline, status, releaseDate, budget, revenue } = form;

	return { title, sortTitle, numberingMode, originalTitle, tagline, status, releaseDate, budget, revenue };
}

/**
 * Form state on TanStack Form (T5 pilot). Public API unchanged for the sections.
 * Slicing: three separate `useStore` selectors — editing `overview` changes the identity
 * of `overview` only, so the basic/lockedFields sections do not re-render (React Compiler
 * compares props per section).
 */
function toNumberingMode(value: string): "absolute" | "seasonal" | null {
	if (value === "absolute") return "absolute";

	if (value === "seasonal") return "seasonal";

	return null;
}

export function useMetadataForm(metadata: MetadataQueryData | undefined, updateMutation: UpdateMutation) {
	const form = useForm({
		defaultValues: {
			basic: pickBasic(emptyMetadataForm),
			overview: "",
			lockedFields: [] as string[],
		},
	});

	// Metadata arrives async — re-seed the form when it lands or on navigation.
	useEffect(() => {
		if (!metadata) return;

		form.reset({
			basic: {
				title: metadata.title,
				sortTitle: metadata.sortTitle ?? "",
				numberingMode: metadata.numberingMode ?? "",
				originalTitle: metadata.originalTitle ?? "",
				tagline: metadata.tagline ?? "",
				status: metadata.status ?? "",
				releaseDate: metadata.releaseDate.slice(0, 10),
				budget: metadata.budget?.toString() ?? "",
				revenue: metadata.revenue?.toString() ?? "",
			},
			overview: metadata.overview ?? "",
			lockedFields: metadata.lockedFields,
		});
	}, [metadata, form]);

	// Per-slice selectors keep the editing isolation the useState slices provided.
	const basic = useSelector(form.store, (state) => state.values.basic);
	const overview = useSelector(form.store, (state) => state.values.overview);
	const lockedFields = useSelector(form.store, (state) => state.values.lockedFields);

	const setField = (field: keyof MetadataFormState, value: string) => {
		if (field === "overview") {
			form.setFieldValue("overview", value);

			return;
		}

		if (field === "lockedFields") return;

		form.setFieldValue(`basic.${field}`, value);
	};

	const toggleFieldLock = (field: string) => {
		const current = form.state.values.lockedFields;
		const isLocked = current.includes(field);
		form.setFieldValue("lockedFields", isLocked ? current.filter((f) => f !== field) : [...current, field]);
	};

	const handleLockAll = () => {
		form.setFieldValue("lockedFields", [...ALL_LOCKABLE_FIELDS]);
	};

	const handleUnlockAll = () => {
		form.setFieldValue("lockedFields", []);
	};

	const handleSave = async () => {
		if (!(basic.title.trim() && basic.releaseDate)) {
			toast.error(m.admin_metadata_title_date_required());

			return;
		}

		await updateMutation.mutateAsync({
			title: basic.title.trim(),
			// Explicit null clears the override — empty string would sort as "".
			sortTitle: basic.sortTitle.trim() || null,
			// Explicit null clears the override.
			numberingMode: toNumberingMode(basic.numberingMode),
			originalTitle: basic.originalTitle.trim() || undefined,
			overview: overview.trim() || undefined,
			tagline: basic.tagline.trim() || undefined,
			status: basic.status.trim() || undefined,
			releaseDate: basic.releaseDate,
			budget: basic.budget ? Number(basic.budget) : undefined,
			revenue: basic.revenue ? Number(basic.revenue) : undefined,
			lockedFields,
		});
	};

	return {
		basic,
		overview,
		lockedFields,
		setField,
		toggleFieldLock,
		handleLockAll,
		handleUnlockAll,
		handleSave,
	};
}
