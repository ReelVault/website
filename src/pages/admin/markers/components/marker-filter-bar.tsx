import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminSearch } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

interface MarkerFilterBarProps {
	search: string;
	onSearchChange: (value: string) => void;
	typeFilter: string;
	onTypeFilterChange: (value: string) => void;
	sourceFilter: string;
	onSourceFilterChange: (value: string) => void;
	onOpenCreateDialog: () => void;
}

export function MarkerFilterBar({
	search,
	onSearchChange,
	typeFilter,
	onTypeFilterChange,
	sourceFilter,
	onSourceFilterChange,
	onOpenCreateDialog,
}: MarkerFilterBarProps) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			<AdminSearch value={search} onChange={onSearchChange} placeholder={m.admin_markers_search_placeholder()} />
			<Select value={typeFilter} onValueChange={(val) => onTypeFilterChange(val ?? "all")}>
				<SelectTrigger className="w-full min-w-0 bg-card text-xs sm:w-40 sm:flex-none">
					<SelectValue placeholder={m.admin_markers_filter_type()} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">{m.plugins_all_types()}</SelectItem>
					<SelectItem value="intro">{m.plugins_markers_intro()}</SelectItem>
					<SelectItem value="credits">{m.plugins_markers_credits_word()}</SelectItem>
					<SelectItem value="recap">{m.plugins_community_markers_shortcut_recap()}</SelectItem>
					<SelectItem value="chapter">{m.plugins_markers_chapter()}</SelectItem>
					<SelectItem value="highlight">{m.plugins_markers_highlight_word()}</SelectItem>
				</SelectContent>
			</Select>
			<Select value={sourceFilter} onValueChange={(val) => onSourceFilterChange(val ?? "all")}>
				<SelectTrigger className="w-full min-w-0 bg-card text-xs sm:w-36 sm:flex-none">
					<SelectValue placeholder={m.admin_markers_source()} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">{m.admin_markers_all_sources()}</SelectItem>
					<SelectItem value="manual">{m.admin_markers_manual()}</SelectItem>
					<SelectItem value="plugin">{m.admin_plugins_no_config_desc_1()}</SelectItem>
					<SelectItem value="automatic">{m.admin_markers_automatic()}</SelectItem>
				</SelectContent>
			</Select>
			<Button size="sm" onClick={onOpenCreateDialog} className="gap-1.5 text-xs">
				<Plus className="size-3.5" />
				{m.admin_markers_add()}
			</Button>
		</div>
	);
}
