import { run } from "../lang/main.js";

const input = document.getElementById("input");
let beforeCursor = document.createElement("span");
let afterCursor = document.createElement("span");

let inputEnabled = false;

export function enableInput() {
	inputEnabled = true;
}

export function disableInput() {
	inputEnabled = false;
}

function backspace() {
	beforeCursor.textContent = beforeCursor.textContent.slice(0, -1);
}

function getInput() {
	return input.textContent;
}

function resetInput() {
	beforeCursor.textContent = "";
	afterCursor.textContent = "";
}

function appendText(text) {
	beforeCursor.textContent += text;
}

function appendLine() {
	beforeCursor.textContent += "\n";
}

function shiftLeft() {
	if (beforeCursor.textContent === "") {
		return;
	}

	const text = beforeCursor.textContent.at(-1);
	beforeCursor.textContent = beforeCursor.textContent.slice(0, -1);
	afterCursor.textContent = text + afterCursor.textContent;
}

function shiftRight() {
	if (afterCursor.textContent === "") {
		return;
	}

	const text = afterCursor.textContent[0];
	afterCursor.textContent = afterCursor.textContent.slice(1);
	beforeCursor.textContent = beforeCursor.textContent + text;
}

async function parseInput(value) {
	await run(value);
	enableInput();
}

function handleKeydown(event) {
	// if (event.ctrlKey) {
	// 	if (event.key === "v") {
	// 		appendText(navigator.clipboard.readText());
	// 	}
	// }

	if (!inputEnabled) {
		return;
	}

	if (event.altKey || event.ctrlKey || event.metaKey) {
		return;
	}

	if (event.key === "Enter") {
		event.preventDefault();

		if (event.shiftKey) {
			appendLine();
		} else {
			disableInput();

			const text = getInput();

			resetInput();
			parseInput(text);
		}
	}

	if (event.key === "Backspace") {
		event.preventDefault();
		backspace();
	}

	if (event.key === "ArrowLeft") {
		event.preventDefault();
		shiftLeft();
	}

	if (event.key === "ArrowRight") {
		event.preventDefault();
		shiftRight();
	}

	if (event.key.length === 1) {
		appendText(event.key);
	}
}

function main() {
	const cursor = document.createElement("span");

	cursor.className = "cursor";

	input.appendChild(beforeCursor);
	input.appendChild(cursor);
	input.appendChild(afterCursor);

	document.addEventListener("keydown", handleKeydown);
}

main();
