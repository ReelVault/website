import { Save } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { useAdminSubtitle, useAdminUpdateSubtitle } from "@/client/hooks/use-admin-subtitles";
import { AppLoadingState } from "@/components/app-states";
import { AsyncButton } from "@/components/async-button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";

export function EditSubtitleDialog({
	subtitleId,
	isOpen,
	onOpenChange,
}: {
	subtitleId: string | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { data: subtitle, isLoading } = useAdminSubtitle(subtitleId ?? "", isOpen && subtitleId !== null);
	const updateMutation = useAdminUpdateSubtitle();

	const [label, setLabel] = useState("");
	const [language, setLanguage] = useState("");
	const [isDefault, setIsDefault] = useState(false);
	const [isForced, setIsForced] = useState(false);

	useEffect(() => {
		if (subtitle) {
			setLabel(subtitle.label ?? "");
			setLanguage(subtitle.language);
			setIsDefault(subtitle.isDefault);
			setIsForced(subtitle.isForced);
		}
	}, [subtitle]);

	const handleSave = () => {
		if (!subtitleId) return;

		detach(async () => {
			await updateMutation.mutateAsync({
				id: subtitleId,
				body: { label: label || undefined, language, isDefault, isForced },
			});
			onOpenChange(false);
		});
	};

	let dialogBody: ReactNode = null;
	if (isLoading) {
		dialogBody = <AppLoadingState />;
	} else if (subtitle) {
		dialogBody = (
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<Label htmlFor="subtitle-label">{m.admin_subtitles_label()}</Label>
					<Input
						id="subtitle-label"
						value={label}
						onChange={(e) => setLabel(e.target.value)}
						placeholder={m.admin_subtitles_label_placeholder()}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<Label htmlFor="subtitle-language">{m.admin_subtitles_language()}</Label>
					<Input
						id="subtitle-language"
						value={language}
						onChange={(e) => setLanguage(e.target.value)}
						placeholder={m.admin_subtitles_language_placeholder()}
					/>
				</div>

				<div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
					<Label htmlFor="subtitle-default" className="text-sm">
						{m.admin_subtitles_default()}
					</Label>
					<Switch id="subtitle-default" checked={isDefault} onCheckedChange={setIsDefault} />
				</div>

				<div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
					<Label htmlFor="subtitle-forced" className="text-sm">
						{m.admin_subtitles_forced_force()}
					</Label>
					<Switch id="subtitle-forced" checked={isForced} onCheckedChange={setIsForced} />
				</div>
			</div>
		);
	}

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{m.admin_subtitles_edit_dialog()}</DialogTitle>
					<DialogDescription>{m.admin_subtitles_edit_metadata()}</DialogDescription>
				</DialogHeader>
				{dialogBody}

				<DialogFooter>
					<AsyncButton
						type="button"
						variant="default"
						onClick={handleSave}
						isPending={updateMutation.isPending}
						pendingLabel={m.common_saving_dots()}
						disabled={!subtitle}
						className="gap-2"
					>
						<Save className="size-4" />
						<span>{m.common_save()}</span>
					</AsyncButton>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
