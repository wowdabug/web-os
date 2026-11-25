import { outLine } from "../main.js";

const errors = [];

function resetErrors() {
	errors.length = 0;
}

export function logErrors(fallback, prefix) {
	if (errors.length === 0) {
		outLine(fallback);
	}

	if (errors.length === 1) {
		outLine("Compiler error: " + errors[0]);
	} else {
		outLine("Compiler errors:");

		for (let i = errors.length - 1; i >= 0; --i) {
			outLine(`- ${errors[i]}`);
		}
	}

	resetErrors();
}

export function pushError(error) {
	errors.push(error);
}
