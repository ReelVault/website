import type { ChangeEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { m } from "@/paraglide/messages";

interface CollectionNameCardProps {
	name: string;
	onNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function CollectionNameCard({ name, onNameChange }: CollectionNameCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{m.admin_collections_name_card()}</CardTitle>
				<CardDescription>{m.admin_collections_displayed_on_lists()}</CardDescription>
			</CardHeader>
			<CardContent>
				<Field className="max-w-md flex-col gap-2">
					<Label htmlFor="edit-collection-name">{m.common_name()}</Label>
					<Input
						id="edit-collection-name"
						name="collection-name"
						autoComplete="off"
						required
						value={name}
						onChange={onNameChange}
						placeholder={m.admin_collections_name_placeholder()}
					/>
				</Field>
			</CardContent>
		</Card>
	);
}
