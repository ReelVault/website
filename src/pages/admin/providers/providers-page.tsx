import { move } from "@dnd-kit/helpers";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { ServerCog } from "lucide-react";
import { useEffect, useState } from "react";
import type { MetadataProviderConfiguration } from "@reelvault/sdk";
import { useAdminMetadataProviders, useReorderMetadataProviders, useUpdateMetadataProvider } from "@/client/hooks/use-admin-providers";
import { AppEmptyState, AppErrorState, AppLoadingState } from "@/components/app-states";
import { detach } from "@/lib/detach";
import { AdminPageHeader, AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { ProviderRow } from "./components/provider-row";

export default function AdminProvidersPage() {
	const providersQuery = useAdminMetadataProviders();
	const updateProvider = useUpdateMetadataProvider();
	const reorderProviders = useReorderMetadataProviders();

	const [items, setItems] = useState<MetadataProviderConfiguration[]>([]);
	const providers = providersQuery.data;
	useEffect(() => {
		if (providers) setItems(providers);
	}, [providers]);

	const handleDragEnd = (event: DragEndEvent) => {
		if (event.canceled) return;

		// A second drag before the first reorder settles would send an out-of-order
		// full-order mutation; ignore it (the row controls are already disabled).
		if (reorderProviders.isPending) return;

		const next = move(items, event);
		setItems(next);
		reorderProviders.mutate(next.map((item) => item.id));
	};

	const isSaving = updateProvider.isPending || reorderProviders.isPending;

	return (
		<div className="flex flex-col gap-6">
			<AdminPageHeader
				icon={ServerCog}
				eyebrow={m.admin_nav_metadata()}
				title={m.admin_providers_page_title()}
				count={items.length}
				description={m.admin_providers_order_description()}
			/>

			<AdminSection title={m.admin_providers_order_availability()} description={m.admin_providers_drag_hint()}>
				{providersQuery.isLoading && <AppLoadingState label={m.admin_providers_loading()} className="min-h-40" />}
				{providersQuery.isError && (
					<AppErrorState
						title={m.admin_providers_failed_to_fetch()}
						error={providersQuery.error}
						onRetry={() => detach(providersQuery.refetch())}
					/>
				)}

				{!(providersQuery.isLoading || providersQuery.isError) && items.length === 0 && (
					<AppEmptyState title={m.admin_providers_none()} description={m.admin_providers_install_hint()} />
				)}

				{!(providersQuery.isLoading || providersQuery.isError) && items.length > 0 && (
					<DragDropProvider onDragEnd={handleDragEnd}>
						<ul aria-busy={reorderProviders.isPending} className="flex flex-col gap-2">
							{items.map((provider, index) => (
								<ProviderRow
									key={provider.id}
									provider={provider}
									index={index}
									disabled={isSaving}
									onToggle={(enabled) => updateProvider.mutate({ providerId: provider.id, values: { enabled } })}
								/>
							))}
						</ul>
					</DragDropProvider>
				)}
			</AdminSection>
		</div>
	);
}
