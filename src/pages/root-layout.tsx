import { lazy, type ReactNode, Suspense, useEffect } from "react";
import { usePluginManifestRealtimeSync } from "@/client/hooks/use-plugin-ui";
import { OfflineBanner } from "@/components/offline-banner";
import { ApiContractProvider } from "@/components/providers/api-contract-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { RealtimeProvider } from "@/components/providers/realtime-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { PluginDialogProvider } from "@/plugin-host/plugin-dialogs";
import { PluginSlotHost } from "@/plugin-host/slot-host";
import { getAppLocale } from "@/utils/locale";
import { isTvDevice } from "@/utils/tv-device";
import "@/styles/globals.css";

// sonner statically imports a @base-ui helper — keeping it lazy is what keeps
// the whole ui-core chunk out of the eager startup graph.
const Toaster = lazy(async () => ({ default: (await import("sonner")).Toaster }));

function TvModeFlag() {
	useEffect(() => {
		if (isTvDevice()) {
			document.documentElement.dataset.tv = "";
		}
	}, []);

	return null;
}

function DocumentLocaleFlag() {
	useEffect(() => {
		document.documentElement.lang = getAppLocale();
	}, []);

	return null;
}

export function RootLayout({ children }: { children: ReactNode }) {
	usePluginManifestRealtimeSync();

	return (
		<QueryProvider>
			<RealtimeProvider>
				<ApiContractProvider>
					<TvModeFlag />
					<DocumentLocaleFlag />
					<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
						<PluginDialogProvider>
							{children}
							<OfflineBanner />
							<PluginSlotHost name="root-floating-overlay" excludePaths={["/player"]} />
							{/* Inside ThemeProvider: sonner's theme="system" reads next-themes from context. */}
							<Suspense fallback={null}>
								<Toaster theme="system" richColors closeButton position="top-right" />
							</Suspense>
						</PluginDialogProvider>
					</ThemeProvider>
				</ApiContractProvider>
			</RealtimeProvider>
		</QueryProvider>
	);
}
