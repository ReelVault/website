import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Database, Layers } from "lucide-react";
import type { LibraryWithRelations } from "@reelvault/sdk";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AdminSection } from "@/pages/admin/admin-ui";
import { m } from "@/paraglide/messages";
import { formatFileSize } from "@/utils/file-utils";

export function DashboardStorageBreakdown({
	libraries,
	totalMediaFiles,
	totalMediaSize,
}: {
	libraries: LibraryWithRelations[];
	totalMediaFiles: number;
	totalMediaSize: number;
}) {
	return (
		<AdminSection
			title={m.admin_dashboard_library_structure_usage()}
			description={m.admin_dashboard_libraries_summary_desc({ libraries: libraries.length, files: totalMediaFiles })}
			actions={
				<Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/admin/libraries" />}>
					{m.admin_dashboard_manage()}
					<ArrowUpRight className="size-3.5" />
				</Button>
			}
			className="lg:col-span-2"
		>
			{libraries.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-10 text-center">
					<Database className="size-8 text-muted-foreground" />
					<p className="mt-3 font-semibold text-foreground text-sm">{m.admin_dashboard_no_libraries()}</p>
					<p className="mt-1 text-muted-foreground text-xs">{m.admin_dashboard_add_first_library()}</p>
				</div>
			) : (
				<div className="flex flex-col gap-3">
					{libraries.map((lib) => {
						const libCount = lib.totalMediaFiles ?? lib.mediaFileCount ?? 0;
						const libSize = lib.totalSize ?? 0;
						const percentage = totalMediaSize > 0 ? Math.round((libSize / totalMediaSize) * 100) : 0;

						return (
							<div
								key={lib.id}
								className="group flex flex-col gap-3 rounded-xl border border-border/70 bg-card/60 p-4 transition-colors hover:border-primary/40 hover:bg-card"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
											<Layers className="size-4" />
										</div>
										<div>
											<p className="font-bold text-foreground text-sm">{lib.name}</p>
											<p className="text-muted-foreground text-xs">
												{m.admin_libraries_type_summary({
													type: lib.type === "movies" ? m.admin_libraries_type_movies() : m.admin_libraries_type_series(),
													items: m.common_items_count({ count: libCount }),
												})}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-semibold text-foreground text-sm tabular-nums">{formatFileSize(libSize)}</p>
										<p className="text-muted-foreground text-xs">{m.admin_dashboard_percent_of_total({ percentage })}</p>
									</div>
								</div>
								<Progress value={percentage} className="h-1.5" />
							</div>
						);
					})}
				</div>
			)}
		</AdminSection>
	);
}
