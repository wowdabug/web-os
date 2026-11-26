import { run } from "./lang/main.js";

const output = document.getElementById("output");
const input = document.getElementById("input");

const semanticRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/gm;
const version = "0.1.1";

let currentInput = input.lastElementChild;
let inputEnabled = true;
let buffer = "";

export function flushBuffer() {
	output.textContent += buffer;
	buffer = "";
}

export function bufferStr(value) {
	buffer += value;
}

export function bufferChar(value) {
	if (
		!Number.isFinite(value) ||
		value < 0 ||
		value >= 256
	) {
		return;
	}

	buffer += String.fromCharCode(Math.trunc(value));
}

export function bufferPtr(value) {
	if (
		!Number.isFinite(value) ||
		value < 0 ||
		value >= 4294967296
	) {
		return;
	}

	buffer += "0x" + Math.trunc(value).toString(16);
}

export function bufferInt(value) {
	if (!Number.isFinite(value)) {
		return;
	}

	buffer += Math.trunc(value);
}

export function bufferFloat(value) {
	if (Number.isNaN(value)) {
		buffer += "nan";
		return;
	}

	if (value === -Infinity) {
		buffer += "-inf";
		return;
	}

	if (value === Infinity) {
		buffer += "inf";
		return;
	}

	if (Object.is(value, -0)) {
		buffer += "-0.000000";
		return;
	}

	buffer += value.toFixed(6);
}

export function outLine(text) {
	output.textContent += text + "\n";
}

function backspace() {
	currentInput.textContent = currentInput.textContent.slice(0, -1);
}

function removeLine() {
	if (input.children.length > 1) {
		currentInput.remove();
		currentInput = input.lastElementChild;

		backspace();
	}
}

function appendLine() {
	const span = document.createElement("span");

	currentInput.textContent += "\n";
	input.appendChild(span);
	currentInput = span;
}

function resetInput() {
	const text = input.textContent;
	const span = document.createElement("span");

	input.replaceChildren(span);
	currentInput = span;

	return text;
}

function appendText(text) {
	currentInput.textContent += text;
}

async function parseInput(value) {
	await run(value);
	inputEnabled = true;
}

function handleKeydown(event) {
	if (event.ctrlKey) {
		if (event.key === "v") {
			appendText(navigator.clipboard.readText());
		}
	}

	if (event.altKey || event.ctrlKey || event.metaKey) {
		return;
	}

	if (event.key === "Enter") {
		event.preventDefault();

		if (event.shiftKey) {
			appendLine();
		} else {
			inputEnabled = false;
			const text = resetInput();
			parseInput(text);
		}
	}

	if (event.key === "Backspace") {
		event.preventDefault();

		if (currentInput.textContent === "") {
			removeLine();
		} else {
			backspace();
		}
	}

	if (event.key.length === 1) {
		appendText(event.key);
	}
}

function testVersion() {
	if (!semanticRegex.test(version)) {
		throw new Error("Invalid semantic version");
	}
}

function main() {
	testVersion();

	outLine(`Welcome to Web-OS ${version}`);

	document.addEventListener("keydown", (event) => {
		if (inputEnabled) {
			handleKeydown(event);
		}
	});
}

main();
