import { FolderOpen, Search } from "lucide-react";
import { type ChangeEvent, type SubmitEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { m } from "@/paraglide/messages";

interface PathPickerSearchFormProps {
	activePath: string;
	onNavigate: (path: string) => void;
}

export function PathPickerSearchForm({ activePath, onNavigate }: PathPickerSearchFormProps) {
	const [inputPath, setInputPath] = useState(activePath);

	const handleInputSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		if (inputPath.trim()) {
			onNavigate(inputPath.trim());
		}
	};

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setInputPath(e.target.value);
	};

	return (
		<form onSubmit={handleInputSubmit} className="flex gap-2">
			<div className="relative flex-1">
				<FolderOpen className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
				<Input
					leadingIcon
					type="text"
					value={inputPath}
					onChange={handleInputChange}
					placeholder="/mnt/media/movies"
					font="mono"
					className=""
				/>
			</div>
			<Button type="submit" variant="secondary" size="sm">
				<Search className="size-4" />
				<span>{m.components_path_picker_go()}</span>
			</Button>
		</form>
	);
}
