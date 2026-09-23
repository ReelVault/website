import { cn } from "cn";
import { Keyboard } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { m } from "@/paraglide/messages";

// Touch gestures — no keyboard shortcuts, but they must be discoverable
// in the same place as the shortcuts.
const TOUCH_GESTURES = [
	{
		get key() {
			return m.player_gesture_double_tap();
		},
	},
	{
		get key() {
			return m.player_gesture_long_press();
		},
	},
	{
		get key() {
			return m.player_gesture_edge_swipe();
		},
	},
];

const SHORTCUTS = [
	{
		get key() {
			return m.player_shortcut_space_k();
		},
		get description() {
			return m.player_play_pause();
		},
	},
	{
		key: "F",
		get description() {
			return m.player_toggle_fullscreen();
		},
	},
	{
		key: "M",
		get description() {
			return m.player_mute_unmute();
		},
	},
	{
		get key() {
			return m.player_shortcut_arrow_jl();
		},
		get description() {
			return m.player_seek_10s();
		},
	},
	{
		key: "↑ / ↓",
		get description() {
			return m.player_volume_step_hint();
		},
	},
	{
		key: "0 – 9",
		get description() {
			return m.player_jump_to_percent();
		},
	},
	{
		key: "Home / End",
		get description() {
			return m.player_start_end();
		},
	},
	{
		key: "C",
		get description() {
			return m.player_toggle_subtitles();
		},
	},
	{
		key: "G / H",
		get description() {
			return m.player_subtitle_offset_100ms();
		},
	},
	{
		key: "N",
		get description() {
			return m.player_go_to_next_episode();
		},
	},
	{
		key: "P",
		get description() {
			return m.player_toggle_pip();
		},
	},
	{
		key: "D / I",
		get description() {
			return m.player_toggle_stream_stats();
		},
	},
	{
		key: "?",
		get description() {
			return m.player_show_shortcut_list();
		},
	},
];

export function PlayerShortcutsDialog({
	open,
	onOpenChange,
	shortcutsDisabled = false,
	onShortcutsDisabledChange,
}: {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	shortcutsDisabled?: boolean;
	onShortcutsDisabledChange?: (disabled: boolean) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md border-border bg-popover shadow-2xl">
				<DialogHeader>
					<div className="flex items-center justify-between gap-4">
						<DialogTitle className="flex items-center gap-2 text-lg">
							<Keyboard className="size-5 text-primary" />
							{m.player_shortcuts()}
						</DialogTitle>
						{onShortcutsDisabledChange && (
							<div className="flex items-center gap-2 pr-6">
								<span className="text-muted-foreground text-xs">
									{shortcutsDisabled ? m.player_shortcuts_disabled() : m.player_shortcuts_enabled()}
								</span>
								<Switch
									aria-label={m.player_toggle_shortcuts()}
									checked={!shortcutsDisabled}
									onCheckedChange={(checked) => onShortcutsDisabledChange(!checked)}
								/>
							</div>
						)}
					</div>
					<DialogDescription>{shortcutsDisabled ? m.player_shortcuts_disabled_notice() : m.player_all_shortcuts_hint()}</DialogDescription>
				</DialogHeader>

				<div className={cn("grid gap-2.5 py-4", shortcutsDisabled && "pointer-events-none opacity-50")}>
					{SHORTCUTS.map(({ key, description }) => (
						<div
							key={key}
							className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm"
						>
							<span className="text-muted-foreground">{description}</span>
							<kbd className="rounded-md border border-border bg-card px-2 py-1 font-mono text-[11px] text-foreground shadow-xs">{key}</kbd>
						</div>
					))}

					{/* Gesty dotykowe (mobile) */}
					<div className="mt-2 border-border/50 border-t pt-3">
						<p className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">{m.player_touch_gestures_heading()}</p>
						<div className="grid gap-2">
							{TOUCH_GESTURES.map(({ key }) => (
								<div key={key} className="flex items-center rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm">
									{key}
								</div>
							))}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
