import { describe, expect, it } from "bun:test";
import { renderToString } from "react-dom/server";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../src/components/ui/select";

describe("Select component label resolution", () => {
	it("renders selected item label instead of value ID in SelectValue", () => {
		const html = renderToString(
			<Select value="general">
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="playback">Video playback</SelectItem>
					<SelectItem value="general">General app behavior</SelectItem>
					<SelectItem value="other">Other issue</SelectItem>
				</SelectContent>
			</Select>,
		);

		expect(html).toContain("General app behavior");
		expect(html).not.toContain(">general<");
	});

	it("renders selected item label when nested inside SelectGroup", () => {
		const html = renderToString(
			<Select value="admin">
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectItem value="user">User</SelectItem>
						<SelectItem value="admin">Administrator</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>,
		);

		expect(html).toContain("Administrator");
		expect(html).not.toContain(">admin<");
	});

	it("supports custom label prop when children contains rich markup", () => {
		const html = renderToString(
			<Select value="default">
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="default" label="Default server mode">
						<div>
							<span>Default server mode</span>
							<span>Use global configuration</span>
						</div>
					</SelectItem>
				</SelectContent>
			</Select>,
		);

		expect(html).toContain("Default server mode");
	});
});
