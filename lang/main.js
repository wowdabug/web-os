import {
	saveRuntime,
	restoreRuntime,
	resetRuntime,
	execute
} from "./runtime.js";
import {
	saveIdentifiers,
	restoreIdentifiers,
	resetIdentifiers
} from "./identifier.js";
import {
	logErrors,
	pushError
} from "./error.js";
import { compile } from "./compiler.js";
import { outLine } from "../sys/output.js";

let prevTime;

function startBench() {
	prevTime = performance.now();
}

function endBench(prefix, suffix) {
	const currentTime = performance.now();
	const deltaTime = currentTime - prevTime;
	console.log(`${prefix}${deltaTime}${suffix}`);
}

function saveState() {
	saveRuntime();
	saveIdentifiers();
}

function restoreState() {
	restoreRuntime();
	restoreIdentifiers();
}

export function reset() {
	resetIdentifiers();
	resetRuntime();
}

export async function run(value) {
	saveState();

	startBench();
	const program = await compile(value);
	endBench("Compiled in ", "ms");

	if (program === false) {
		logErrors();
		restoreState();

		return false;
	}

	// console.log(program);

	if (program.length === 0) {
		return true;
	}

	startBench();
	const exitStatus = await execute(program);
	endBench("Executed in ", "ms");

	if (exitStatus !== 0) {
		pushError(`exit status: ${exitStatus}`)
		logErrors();
		return false;
	}

	return true;
}
