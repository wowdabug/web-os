import { outLine } from "../sys/output.js";

const errors = [];

function resetErrors() {
	errors.length = 0;
}

export function logErrors() {
	if (errors.length === 0) {
		outLine("Unspefified error");
	} else {
		if (errors.length === 1) {
			outLine("Error: " + errors[0]);
		} else {
			outLine("Errors:");

			for (let i = errors.length - 1; i >= 0; --i) {
				outLine(`- ${errors[i]}`);
			}
		}

		resetErrors();
	}
}

export function pushError(error) {
	errors.push(error);
}
