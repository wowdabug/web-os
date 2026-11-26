import { run } from "../lang/main.js";

const input = document.getElementById("input");

let currentInput = input.lastElementChild;
let inputEnabled = false;

document.addEventListener("keydown", (event) => {
	if (inputEnabled) {
		handleKeydown(event);
	}
});

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

export function enableInput() {
	inputEnabled = true;
}

export function disableInput() {
	inputEnabled = false;
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

	if (event.altKey || event.ctrlKey || event.metaKey) {
		return;
	}

	if (event.key === "Enter") {
		event.preventDefault();

		if (event.shiftKey) {
			appendLine();
		} else {
			disableInput();
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
