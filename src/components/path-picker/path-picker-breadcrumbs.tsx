import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

interface PathPickerBreadcrumbsProps {
	activePath: string;
	onNavigate: (path: string) => void;
}

export function PathPickerBreadcrumbs({ activePath, onNavigate }: PathPickerBreadcrumbsProps) {
	const breadcrumbs = activePath
		.split("/")
		.filter(Boolean)
		.reduce<Array<{ name: string; path: string }>>((acc, curr) => {
			const lastItem = acc[acc.length - 1];
			const prevPath = lastItem ? lastItem.path : "";
			const newPath = `${prevPath}/${curr}`;
			acc.push({ name: curr, path: newPath });

			return acc;
		}, []);

	const handleNavigateClick = (event: MouseEvent<HTMLButtonElement>) => {
		const path = event.currentTarget.dataset.path;
		if (path) {
			onNavigate(path);
		}
	};

	return (
		<div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs">
			<Button variant="ghost" size="xs" onClick={() => onNavigate("/")} selected={activePath === "/"}>
				{m.path_picker_root()}
			</Button>
			{breadcrumbs.map((crumb) => (
				<div key={crumb.path} className="flex items-center gap-1">
					<span className="text-muted-foreground/40">{m.common_breadcrumb_separator()}</span>
					<Button variant="ghost" size="xs" data-path={crumb.path} onClick={handleNavigateClick} selected={activePath === crumb.path}>
						{crumb.name}
					</Button>
				</div>
			))}
		</div>
	);
}
