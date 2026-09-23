import { Search } from "lucide-react";
import { type SubmitEvent, useState } from "react";
import { useProviderConfigurations } from "@/client/hooks/use-providers";
import { AsyncButton } from "@/components/async-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { m } from "@/paraglide/messages";

interface IdentifySearchFormProps {
	initialTitle: string;
	initialYear?: number;
	isSearching: boolean;
	onSearchByTitle: (title: string, year?: number) => void;
	onSearchById: (providerId: string, externalId: string) => void;
}

export function IdentifySearchForm({ initialTitle, initialYear, isSearching, onSearchByTitle, onSearchById }: IdentifySearchFormProps) {
	const [title, setTitle] = useState(initialTitle);
	const [year, setYear] = useState<string>(initialYear ? String(initialYear) : "");
	const [searchMode, setSearchMode] = useState<"title" | "externalId">("title");
	const [idProviderId, setIdProviderId] = useState<string>("");
	const [externalId, setExternalId] = useState("");

	const { data: providerConfigurations } = useProviderConfigurations();
	const enabledProviders = (providerConfigurations ?? []).filter((provider) => provider.enabled);

	const handleSearch = (e?: SubmitEvent) => {
		e?.preventDefault();
		if (searchMode === "externalId") {
			const value = externalId.trim();
			if (!(idProviderId && value)) return;

			onSearchById(idProviderId, value);

			return;
		}

		if (!title.trim()) return;

		onSearchByTitle(title.trim(), year ? Number(year) : undefined);
	};

	return (
		<form onSubmit={handleSearch} className="space-y-4 pt-2">
			<ToggleGroup
				variant="outline"
				size="sm"
				value={[searchMode]}
				onValueChange={(next) => {
					const mode = next[next.length - 1];
					if (mode === "title" || mode === "externalId") setSearchMode(mode);
				}}
				className="w-fit"
			>
				<ToggleGroupItem value="title" className="px-3">
					{m.admin_analytics_title_column()}
				</ToggleGroupItem>
				<ToggleGroupItem value="externalId" className="px-3">
					{m.common_provider_id()}
				</ToggleGroupItem>
			</ToggleGroup>

			{searchMode === "title" ? (
				<div className="grid gap-3 sm:grid-cols-4">
					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="identify-title">{m.components_reassign_tmdb_title_label()}</Label>
						<Input
							id="identify-title"
							name="identify-title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder={m.identify_placeholder_title()}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="identify-year">{m.common_release_year()}</Label>
						<Input
							id="identify-year"
							name="identify-year"
							type="number"
							value={year}
							onChange={(e) => setYear(e.target.value)}
							placeholder={m.identify_placeholder_year()}
						/>
					</div>
					<div className="flex items-end">
						<AsyncButton type="submit" isPending={isSearching} pendingLabel={m.common_searching()} className="w-full gap-2">
							<Search className="size-4" />
							{m.common_search()}
						</AsyncButton>
					</div>
				</div>
			) : (
				<div className="grid gap-3 sm:grid-cols-5">
					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="identify-id-provider">{m.components_metadata_provider_label()}</Label>
						<Select value={idProviderId} onValueChange={(value) => setIdProviderId(value ?? "")}>
							<SelectTrigger id="identify-id-provider" className="w-full bg-card">
								<SelectValue placeholder={m.common_select_service()} />
							</SelectTrigger>
							<SelectContent>
								{enabledProviders.map((provider) => (
									<SelectItem key={provider.id} value={provider.id}>
										{provider.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1.5 sm:col-span-2">
						<Label htmlFor="identify-external-id">{m.components_identify_title_id_label()}</Label>
						<Input
							id="identify-external-id"
							name="identify-external-id"
							value={externalId}
							onChange={(e) => setExternalId(e.target.value)}
							placeholder={m.components_identify_title_id_label()}
						/>
					</div>
					<div className="flex items-end">
						<AsyncButton type="submit" isPending={isSearching} pendingLabel={m.common_searching()} className="w-full gap-2">
							<Search className="size-4" />
							{m.common_search()}
						</AsyncButton>
					</div>
				</div>
			)}
		</form>
	);
}
