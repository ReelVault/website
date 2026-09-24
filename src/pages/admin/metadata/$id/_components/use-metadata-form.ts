import { useForm, useSelector } from "@tanstack/react-form";
import type { useAdminMetadataEditor } from "@/client/hooks/use-admin-metadata-editor";
import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import type { MetadataBasicFields, MetadataFormState } from "./types";

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

/**
 * Form seed built straight from the loaded metadata. `useForm` treats this as
 * the baseline: because the same object shape is passed on every render,
 * `formApi.update` sees no diff and never overwrites in-progress edits.
 */
export function seedFromMetadata(metadata: MetadataQueryData): {
	basic: MetadataBasicFields;
	overview: string;
	lockedFields: string[];
} {
	return {
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
	};
}

function toNumberingMode(value: string): "absolute" | "seasonal" | null {
	if (value === "absolute") return "absolute";

	if (value === "seasonal") return "seasonal";

	return null;
}

/**
 * Form state on TanStack Form (T5 pilot). Public API unchanged for the sections.
 * The editor mounts this hook only once the metadata is loaded (the page gates
 * on the query), so the form starts seeded — no async `reset` effect.
 * Slicing: three separate `useSelector` selectors — editing `overview` changes the identity
 * of `overview` only, so the basic/lockedFields sections do not re-render (React Compiler
 * compares props per section).
 */
export function useMetadataForm(metadata: MetadataQueryData, updateMutation: UpdateMutation) {
	const form = useForm({
		defaultValues: seedFromMetadata(metadata),
	});

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
