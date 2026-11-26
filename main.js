import { enableInput } from "./sys/input.js";
import { outLine } from "./sys/output.js";

export const version =
	generateVersion("0.2.5");

function generateVersion(rawVersion) {
	const match = rawVersion.match(
		/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
	);

	if (match === null) {
		throw new Error("Invalid version");
	}

	return {
		raw: match[0],
		major: match[1],
		minor: match[2],
		patch: match[3],
		preRelease: match[4] ?? "",
		buildMetadata: match[5] ?? "",
	};
}

function main() {
	outLine(`Welcome to Web-OS ${version.raw}`);

	enableInput();
}

main();
