import { Link } from "@tanstack/react-router";
import { Copy, Download, ImageDown, MoreVertical, Pencil, RefreshCw, RotateCcw, Search, Share2, Shield } from "lucide-react";
import { usePlaybackMutations } from "@/client/hooks/use-me-playback";
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
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { PluginSlotHost } from "@/plugin-host/slot-host.lazy";

interface DetailsHeaderMenuProps {
	metadataId: string;
	playableMediaFileId?: string;
	isAdmin?: boolean;
	/** Ambient values forwarded to plugin contributions in the details-dropdown slot. */
	pluginParams?: Record<string, string>;
	onCopyLink: () => void;
	onDownloadOpen: () => void;
	onRefreshMetadata: () => void;
	onRefreshImages: () => void;
	onIdentifyOpen: () => void;
	onCopyId: () => void;
}

export function DetailsHeaderMenu({
	metadataId,
	playableMediaFileId,
	isAdmin,
	pluginParams,
	onCopyLink,
	onDownloadOpen,
	onRefreshMetadata,
	onRefreshImages,
	onIdentifyOpen,
	onCopyId,
}: DetailsHeaderMenuProps) {
	const { resetProgress } = usePlaybackMutations(metadataId);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger aria-label={m.plugins_bugs_more_options()} render={<Button variant="outline" size="icon-lg" />}>
				<MoreVertical className="size-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-64">
				<DropdownMenuGroup>
					<DropdownMenuItem onClick={onCopyLink} className="cursor-pointer">
						<Share2 className="size-4 text-muted-foreground" />
						<span>{m.web_share()}</span>
					</DropdownMenuItem>
					{playableMediaFileId && (
						<DropdownMenuItem onClick={() => detach(resetProgress(playableMediaFileId, "title"))} className="cursor-pointer">
							<RotateCcw className="size-4 text-muted-foreground" />
							<span>{m.web_reset_title_progress()}</span>
						</DropdownMenuItem>
					)}
					{playableMediaFileId && (
						<DropdownMenuItem onClick={onDownloadOpen} className="cursor-pointer">
							<Download className="size-4 text-primary" />
							<span>{m.player_download_offline_mp4()}</span>
						</DropdownMenuItem>
					)}
				</DropdownMenuGroup>

				{/* PLUGIN SLOT (details-dropdown) — renders nothing when there is no contribution */}
				<PluginSlotHost name="details-dropdown" params={pluginParams} />

				{isAdmin && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuLabel className="flex items-center">
								<Shield className="size-3" />
								{m.common_admin_tools_full()}
							</DropdownMenuLabel>
							<DropdownMenuItem
								nativeButton={false}
								render={<Link to="/admin/metadata/$id" params={{ id: metadataId }} />}
								className="cursor-pointer"
							>
								<Pencil className="size-4 text-primary" />
								<span>{m.common_edit()}</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={onRefreshMetadata} className="cursor-pointer">
								<RefreshCw className="size-4 text-primary" />
								<span>{m.components_metadata_card_refresh_metadata()}</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={onRefreshImages} className="cursor-pointer">
								<ImageDown className="size-4 text-primary" />
								<span>{m.components_metadata_card_force_artwork()}</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={onIdentifyOpen} className="cursor-pointer">
								<Search className="size-4 text-primary" />
								<span>{m.components_metadata_card_change_match()}</span>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={onCopyId} className="cursor-pointer">
								<Copy className="size-4 text-muted-foreground" />
								<span>{m.common_copy_id()}</span>
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
