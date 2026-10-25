import { Link } from "@tanstack/react-router";
import { ChevronDown, Info, Layers, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { m } from "@/paraglide/messages";
import { type EpisodeVersionFile, getVersionSubtitle, getVersionTitle } from "./details-episode-utils";

function EpisodeVersionMenuItem({ file, index }: { file: EpisodeVersionFile; index: number }) {
	const title = getVersionTitle(file, index);
	const subtitle = getVersionSubtitle(file);

	return (
		<DropdownMenuItem render={<Link to="/player/$id" params={{ id: file.id }} />} className="cursor-pointer">
			<div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
				<Play className="size-3.5 fill-current pl-0.5" />
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<div className="text-foreground flex items-center gap-1.5 truncate text-sm font-medium">
					<span className="truncate">{title}</span>
					{file.isDefault && (
						<Badge variant="secondary" size="sm">
							{m.common_default_word()}
						</Badge>
					)}
				</div>
				{subtitle && <span className="text-muted-foreground truncate text-xs">{subtitle}</span>}
			</div>
		</DropdownMenuItem>
	);
}

interface DetailsEpisodePlayActionProps {
	files: EpisodeVersionFile[];
	defaultFile?: EpisodeVersionFile;
	mediaFileId?: string;
	episodeNumber: number;
	episodeTitle?: string | null;
	onSelectForFiles: (ep: { id: string; number: number; title?: string | null }) => void;
	episodeId: string;
}

export function DetailsEpisodePlayAction({
	files,
	defaultFile,
	mediaFileId,
	episodeNumber,
	episodeTitle,
	onSelectForFiles,
	episodeId,
}: DetailsEpisodePlayActionProps) {
	const hasMultipleVersions = files.length > 1;

	const renderPlayAction = () => {
		if (hasMultipleVersions && defaultFile) {
			return (
				<div className="flex w-full items-center shadow-xs sm:w-auto">
					<Link
						to="/player/$id"
						params={{ id: defaultFile.id }}
						className="flex-1 sm:flex-initial"
						title={m.web_play_version_named({ version: getVersionTitle(defaultFile) })}
					>
						<Button className="w-full sm:w-auto" size="lg" variant="outline">
							<Play className="size-4 fill-current pl-0.5" aria-hidden="true" />
							{m.components_metadata_card_play()}
						</Button>
					</Link>
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button
									tone="muted"
									variant="outline"
									size="lg"
									title={m.web_select_episode_version()}
									aria-label={m.web_select_episode_version()}
								/>
							}
						>
							<ChevronDown className="size-4" />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" side="bottom" className="w-72 sm:w-80">
							<DropdownMenuGroup>
								<DropdownMenuLabel className="flex items-center">
									<Layers className="text-primary size-3.5" />
									<span>{m.web_video_versions_count_label({ count: files.length })}</span>
								</DropdownMenuLabel>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								{files.map((file, idx) => (
									<EpisodeVersionMenuItem key={file.id} file={file} index={idx} />
								))}
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		}

		if (mediaFileId) {
			return (
				<Link to="/player/$id" params={{ id: mediaFileId }} className="block w-full sm:w-auto">
					<Button className="w-full sm:w-auto" size="lg" variant="outline">
						<Play className="size-4 fill-current pl-0.5" aria-hidden="true" />
						{m.components_metadata_card_play()}
					</Button>
				</Link>
			);
		}

		return (
			<Button className="w-full sm:w-auto" size="lg" variant="outline" disabled>
				<Play className="size-4" aria-hidden="true" />
				{m.admin_metadata_no_file_chip()}
			</Button>
		);
	};

	return (
		<div className="flex items-center gap-2">
			{renderPlayAction()}

			<Button
				variant="outline"
				size="icon-lg"
				title={m.web_video_file_info()}
				aria-label={m.web_video_file_info_for({ episode: episodeTitle ?? m.web_offline_episode_hint({ number: episodeNumber }) })}
				onClick={() =>
					onSelectForFiles({
						id: episodeId,
						number: episodeNumber,
						title: episodeTitle,
					})
				}
			>
				<Info className="text-muted-foreground size-4" />
			</Button>
		</div>
	);
}
