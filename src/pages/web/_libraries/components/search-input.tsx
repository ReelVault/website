import { Search, X } from "lucide-react";
import type React from "react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { m } from "@/paraglide/messages";

export function SearchInput({
	value,
	onChange,
	placeholder = m.web_search_titles(),
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}) {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value);
	};

	return (
		<InputGroup className="h-11 rounded-xl bg-background">
			<InputGroupAddon>
				<Search className="size-4 text-primary" aria-hidden="true" />
			</InputGroupAddon>
			<InputGroupInput
				name="library-search"
				autoComplete="off"
				aria-label={m.web_search_library_aria()}
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={handleChange}
				className="h-10 px-2"
			/>
			{value && (
				<InputGroupAddon align="inline-end">
					<InputGroupButton size="icon-sm" aria-label={m.components_search_clear()} onClick={() => onChange("")}>
						<X aria-hidden="true" />
					</InputGroupButton>
				</InputGroupAddon>
			)}
		</InputGroup>
	);
}
