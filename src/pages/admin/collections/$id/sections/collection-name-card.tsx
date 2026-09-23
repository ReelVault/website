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
		<Card className="border-border/80 bg-card">
			<CardHeader>
				<CardTitle className="font-semibold text-base">{m.admin_collections_name_card()}</CardTitle>
				<CardDescription>{m.admin_collections_displayed_on_lists()}</CardDescription>
			</CardHeader>
			<CardContent>
				<Field className="max-w-md flex-col gap-2">
					<Label htmlFor="edit-collection-name" className="font-medium text-foreground text-sm">
						{m.common_name()}
					</Label>
					<Input
						id="edit-collection-name"
						name="collection-name"
						autoComplete="off"
						required
						value={name}
						onChange={onNameChange}
						placeholder={m.admin_collections_name_placeholder()}
						className="h-10 bg-background px-3.5 text-sm"
					/>
				</Field>
			</CardContent>
		</Card>
	);
}
