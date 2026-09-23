import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_web/details/")({
	beforeLoad: () => {
		redirect({ to: "/dashboard", throw: true });
	},
});
