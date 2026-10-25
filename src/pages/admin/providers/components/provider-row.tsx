import { useSortable } from "@dnd-kit/react/sortable";
import type { MetadataProviderConfiguration } from "@reelvault/sdk";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { GripVertical } from "lucide-react";
import { CopyIcon } from "@/components/copy-icon";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { useCopyToClipboard } from "@/utils/clipboard-utils";

interface ProviderRowProps {
	provider: MetadataProviderConfiguration;
	index: number;
	disabled: boolean;
	onToggle: (enabled: boolean) => void;
}

export function ProviderRow({ provider, index, disabled, onToggle }: ProviderRowProps) {
	const { ref, handleRef, isDragging } = useSortable({ id: provider.id, index });
	const { hasCopied, copy } = useCopyToClipboard();

	return (
		<li
			ref={ref}
			className={cn(
				"border-border/80 bg-card hover:border-primary/40 flex items-center gap-3 rounded-xl border p-4 shadow-xs transition-[border-color,background-color,color,box-shadow]",
				isDragging && "border-primary/60 opacity-70 shadow-lg",
				!provider.enabled && "opacity-60",
			)}
		>
			<button
				ref={handleRef}
				type="button"
				aria-label={m.admin_providers_move()}
				className="text-muted-foreground hover:text-foreground cursor-grab touch-none transition-colors active:cursor-grabbing"
			>
				<GripVertical className="size-4" />
			</button>
			<span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold">
				{index + 1}
			</span>
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-foreground text-sm font-semibold">{provider.name}</span>
					<Badge tone="muted" variant="outline" font="mono">
						<span>{provider.id}</span>
						<button
							type="button"
							onClick={() => detach(copy(provider.id, m.admin_providers_copy_id()))}
							className="text-muted-foreground hover:text-foreground"
							aria-label={m.admin_providers_copy_id()}
							title={m.admin_providers_copy_id()}
						>
							<CopyIcon copied={hasCopied} className="size-2.5" copiedClassName="text-primary" />
						</button>
					</Badge>
					<Badge variant="secondary" font="mono">
						{m.common_version_badge({ version: provider.version })}
					</Badge>
				</div>
				<p className="text-muted-foreground mt-0.5 flex items-center gap-1 font-mono text-xs">
					<span>{m.plugins_requests_plugin_word()}</span>
					<Link
						to="/admin/plugins/$id"
						params={{ id: provider.pluginId }}
						className="text-primary hover:underline"
						title={m.admin_providers_go_to_plugin()}
					>
						{provider.pluginId}
					</Link>
				</p>
			</div>
			<div className="flex items-center gap-2">
				<span className="text-muted-foreground text-xs">
					{provider.enabled ? m.admin_providers_provider_enabled() : m.admin_providers_provider_disabled()}
				</span>
				<Switch checked={provider.enabled} disabled={disabled} onCheckedChange={onToggle} />
			</div>
		</li>
	);
}
