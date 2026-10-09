import { useProfilePreferences } from "@/client/hooks/use-profiles";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { OPTIONAL_PAGE_IDS, type OptionalPageId, parseHiddenPages } from "@/utils/hidden-pages";

const PAGE_LABELS: Record<OptionalPageId, () => string> = {
	collections: () => m.navbar_collections(),
	discovery: () => m.navbar_discovery(),
	insights: () => m.user_sidebar_insights(),
	devices: () => m.auth_devices(),
	remote: () => m.user_remote_pilot_link(),
};

/** Optional menu pages this profile hides. A hidden page leaves the menus but stays reachable by its address. */
export function HiddenPages({ profileId }: { profileId: string }) {
	const { preferences, updatePreferences, isSaving } = useProfilePreferences(profileId);
	const hidden = parseHiddenPages(preferences?.hiddenPages ?? "");

	const toggle = (pageId: OptionalPageId, checked: boolean) => {
		const next = checked ? [...hidden, pageId] : [...hidden].filter((page) => page !== pageId);
		detach(updatePreferences({ hiddenPages: [...new Set(next)].join(",") }));
	};

	return (
		<fieldset className="flex flex-col gap-2">
			<legend className="font-medium text-sm">{m.settings_hidden_pages()}</legend>
			<p className="text-muted-foreground text-xs">{m.settings_hidden_pages_hint()}</p>
			{OPTIONAL_PAGE_IDS.map((pageId) => (
				<label key={pageId} className="flex cursor-pointer items-center gap-2 text-sm">
					<input
						type="checkbox"
						className="size-4 accent-primary"
						checked={hidden.has(pageId)}
						disabled={isSaving}
						onChange={(event) => toggle(pageId, event.currentTarget.checked)}
					/>
					<span>{PAGE_LABELS[pageId]()}</span>
				</label>
			))}
		</fieldset>
	);
}
