/** Safely reads a string `message` property off an unknown error value. */
export function extractErrorMessage(err: unknown): string | undefined {
	if (typeof err === "object" && err !== null && "message" in err) {
		const { message } = err;
		if (typeof message === "string") return message;
	}

	return undefined;
}

/** Safely reads a string `stack` property off an unknown error value. */
export function extractErrorStack(err: unknown): string | undefined {
	if (typeof err === "object" && err !== null && "stack" in err) {
		const { stack } = err;
		if (typeof stack === "string") return stack;
	}

	return undefined;
}

/** Renders an unknown log detail as a string without "[object Object]" surprises. */
export function stringifyLogDetail(value: unknown): string | undefined {
	if (value === undefined) return undefined;

	if (typeof value === "string") return value;

	return JSON.stringify(value);
}
