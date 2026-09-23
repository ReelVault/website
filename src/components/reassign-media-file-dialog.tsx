import { FolderSearch, Globe, Layers } from "lucide-react";
import { useState } from "react";
import { ReassignLocalTab } from "@/components/media-files/reassign-local-tab";
import { ReassignTmdbTab } from "@/components/media-files/reassign-tmdb-tab";
import { parseFileNameInitial } from "@/components/media-files/reassign-utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { m } from "@/paraglide/messages";

interface ReassignMediaFileDialogProps {
	mediaFileId: string;
	fileName: string;
	mediaType: "movie" | "tv_show";
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function ReassignMediaFileDialog({ mediaFileId, fileName, mediaType, open, onOpenChange, onSuccess }: ReassignMediaFileDialogProps) {
	const initial = parseFileNameInitial(fileName);
	const [activeTab, setActiveTab] = useState<"provider" | "library">("provider");

	const handleTabChange = (value: string) => {
		if (value === "provider" || value === "library") setActiveTab(value);
	};

	const handleSuccess = () => {
		onOpenChange(false);
		onSuccess?.();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-xl">
						<Layers className="size-5 text-primary" />
						{m.components_reassign_dialog_title()}
					</DialogTitle>
					<DialogDescription>
						{m.components_reassign_dialog_desc_1()}
						<span className="font-mono text-foreground">{fileName}</span> {m.components_reassign_dialog_desc_2()}
					</DialogDescription>
				</DialogHeader>

				<Tabs value={activeTab} onValueChange={handleTabChange} className="mt-2 w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="provider" className="gap-2">
							<Globe className="size-4" />
							{m.components_reassign_tmdb_heading()}
						</TabsTrigger>
						<TabsTrigger value="library" className="gap-2">
							<FolderSearch className="size-4" />
							{m.components_reassign_library_heading()}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="provider">
						<ReassignTmdbTab
							mediaFileId={mediaFileId}
							mediaType={mediaType}
							initialTitle={initial.title}
							initialYear={initial.year}
							onSuccess={handleSuccess}
						/>
					</TabsContent>

					<TabsContent value="library">
						<ReassignLocalTab mediaFileId={mediaFileId} mediaType={mediaType} onSuccess={handleSuccess} />
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
