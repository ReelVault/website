import { useMutation } from "@tanstack/react-query";
import { reelvault } from "../client";

export function useCreateAdmin() {
	// react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- initial setup step redirects to login
	return useMutation({
		mutationFn: ({ name, email, password, setupToken }: { name: string; email: string; password: string; setupToken: string }) =>
			reelvault.setup.createAdmin({ name, email, password }, setupToken),
	});
}
