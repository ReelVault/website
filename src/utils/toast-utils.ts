import { m } from "@/paraglide/messages";
import { toast } from "@/utils/toast-facade";
import { translateError } from "./translate-error";

export function toastError(message: string, err?: unknown, fallback: string = m.common_network_error()) {
	toast.error(message, {
		description: translateError(err, fallback),
	});
}

export function toastSuccess(message: string) {
	toast.success(message);
}
