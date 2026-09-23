import { ExternalLink } from "lucide-react";
import type { useAdminSubtitleProviders } from "@/client/hooks/use-admin-subtitles";
import { Badge } from "@/components/ui/badge";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";

interface SubtitleProvidersSectionProps {
	providers: NonNullable<ReturnType<typeof useAdminSubtitleProviders>["data"]>;
}

export function SubtitleProvidersSection({ providers }: SubtitleProvidersSectionProps) {
	if (providers.length === 0) return null;

	return (
		<AdminSection title={m.admin_subtitles_providers()} description={m.admin_subtitles_provider_plugins()}>
			<div className="flex flex-wrap gap-2.5">
				{providers.map((provider) => (
					<div key={provider.id} className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2.5">
						<ExternalLink className="size-3.5 text-primary" />
						<span className="font-semibold text-foreground text-sm">{provider.name}</span>
						<Badge variant="outline" size="sm" className="text-[10px]">
							{m.common_version_badge({ version: provider.version })}
						</Badge>
					</div>
				))}
			</div>
		</AdminSection>
	);
}
