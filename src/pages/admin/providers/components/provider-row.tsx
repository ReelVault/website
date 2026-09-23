import { useSortable } from "@dnd-kit/react/sortable";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { Check, Copy, GripVertical } from "lucide-react";
import type { MetadataProviderConfiguration } from "@reelvault/sdk";
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
				"flex items-center gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-xs transition-[border-color,background-color,color,box-shadow] hover:border-primary/40",
				isDragging && "border-primary/60 opacity-70 shadow-lg",
				!provider.enabled && "opacity-60",
			)}
		>
			<button
				ref={handleRef}
				type="button"
				aria-label={m.admin_providers_move()}
				className="cursor-grab touch-none text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing"
			>
				<GripVertical className="size-4" />
			</button>
			<span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 font-bold text-primary text-xs">
				{index + 1}
			</span>
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<span className="font-semibold text-foreground text-sm">{provider.name}</span>
					<Badge variant="outline" className="gap-1 font-mono text-[10px] text-muted-foreground">
						<span>{provider.id}</span>
						<button
							type="button"
							onClick={() => detach(copy(provider.id, m.admin_providers_copy_id()))}
							className="text-muted-foreground hover:text-foreground"
							aria-label={m.admin_providers_copy_id()}
							title={m.admin_providers_copy_id()}
						>
							{hasCopied ? <Check className="size-2.5 text-primary" /> : <Copy className="size-2.5" />}
						</button>
					</Badge>
					<Badge variant="secondary" className="font-mono text-[10px]">
						{m.common_version_badge({ version: provider.version })}
					</Badge>
				</div>
				<p className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
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
