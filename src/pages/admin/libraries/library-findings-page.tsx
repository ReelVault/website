import type { ScanFindingStatus } from "@reelvault/sdk";
import { Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { useAdminLibraries, useLibraryScanFindings } from "@/client/hooks/use-libraries";
import { AsyncButton } from "@/components/async-button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { usePageTitle } from "@/hooks/use-page-title";
import { detach } from "@/lib/detach";
import { m } from "@/paraglide/messages";
import { ScanFindingsList } from "./components/scan-findings-list";

export default function LibraryFindingsPage() {
	const { id } = useParams({ from: "/admin/libraries/$id/findings" });
	const { status } = useSearch({ from: "/admin/libraries/$id/findings" });
	const navigate = useNavigate();
	const { libraries, scanLibrary, isScanning, mutationVariables } = useAdminLibraries();
	const library = libraries.find((lib) => lib.id === id);
	const { data } = useLibraryScanFindings(id, status, true);

	const heading = data ? m.admin_libraries_needs_attention_count({ count: data.counts.active }) : m.admin_libraries_needs_attention();
	usePageTitle(heading);

	const selectStatus = (next: ScanFindingStatus) => {
		detach(navigate({ to: "/admin/libraries/$id/findings", params: { id }, search: { status: next }, replace: true }));
	};

	return (
		<main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
			<Link
				to="/admin/libraries"
				className="text-muted-foreground hover:text-foreground inline-flex min-h-11 w-fit items-center gap-2 text-sm transition-colors"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				{m.common_back()}
			</Link>

			<header className="flex flex-col gap-3">
				<h1 className="font-heading flex items-center gap-2.5 text-3xl font-extrabold tracking-tight sm:text-4xl">
					<AlertTriangle className="text-muted-foreground size-6 shrink-0" aria-hidden="true" />
					{heading}
				</h1>
				{library && <p className="text-foreground font-semibold">{library.name}</p>}
				<p className="text-muted-foreground text-sm">{m.admin_libraries_needs_attention_desc()}</p>
			</header>

			<ToggleGroup
				variant="outline"
				size="sm"
				value={[status]}
				onValueChange={(next) => {
					const nextStatus = next[next.length - 1];
					if (nextStatus === "active" || nextStatus === "ignored") selectStatus(nextStatus);
				}}
				className="w-fit"
			>
				<ToggleGroupItem value="active">{m.admin_libraries_needs_attention()}</ToggleGroupItem>
				<ToggleGroupItem value="ignored">{m.admin_libraries_findings_tab_ignored({ count: data?.counts.ignored ?? 0 })}</ToggleGroupItem>
			</ToggleGroup>

			<ScanFindingsList libraryId={id} status={status} />

			{status === "active" && (data?.data.length ?? 0) > 0 && (
				<AsyncButton
					variant="outline"
					size="sm"
					className="gap-2 self-start"
					onClick={() => {
						detach(navigate({ to: "/admin/libraries" }));
						detach(scanLibrary(id));
					}}
					isPending={isScanning && mutationVariables.scan === id}
					pendingLabel={m.admin_libraries_scanning()}
				>
					<RefreshCw className="size-3.5" />
					<span>{m.admin_libraries_scan_library()}</span>
				</AsyncButton>
			)}
		</main>
	);
}
