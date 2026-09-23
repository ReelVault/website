import { Suspense, useState } from "react";
import type { MediaFileWithRelation } from "reelvault-sdk";
import { LazyReassignMediaFileDialog } from "@/components/lazy-dialogs";
import { MediaFileMetadataCard } from "./media-file-metadata-card";
import { MediaFileRelationsSection } from "./media-file-relations-section";
import { MediaFileStreamsSection } from "./media-file-streams-section";
import { MediaFileSubtitlesSection } from "./media-file-subtitles-section";

interface MediaFileSidebarProps {
	file: MediaFileWithRelation;
}

export function MediaFileSidebar({ file }: MediaFileSidebarProps) {
	const isMovie = file.library.type === "movies";
	const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);

	return (
		<div className="flex flex-col gap-6">
			{/* Attached Metadata Card */}
			<MediaFileMetadataCard file={file} onOpenReassign={() => setIsReassignDialogOpen(true)} />

			{/* System Relations */}
			<MediaFileRelationsSection file={file} onOpenReassign={() => setIsReassignDialogOpen(true)} />

			{/* Subtitles Section */}
			<MediaFileSubtitlesSection subtitles={file.subtitles} />

			{/* Video & Audio Streams */}
			<MediaFileStreamsSection videoStreams={file.videoStreams} audioStreams={file.audioStreams} />

			{isReassignDialogOpen && (
				<Suspense fallback={null}>
					<LazyReassignMediaFileDialog
						open={isReassignDialogOpen}
						onOpenChange={setIsReassignDialogOpen}
						mediaFileId={file.id}
						fileName={file.fileName}
						mediaType={isMovie ? "movie" : "tv_show"}
					/>
				</Suspense>
			)}
		</div>
	);
}
