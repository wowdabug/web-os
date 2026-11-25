const instsRegex = /\r\n|\n/;

function splitInsts(value) {
	let insts = value.split(instsRegex);

	if (!insts.at(-1)) {
		insts.pop();
	}

	return insts;
}

function splitInst(value) {
	const parts = [];
	let part = "";
	let quote = "";
	let escape = false;

	for (let i = 0; i < value.length; ++i) {
		const char = value[i];
		if (escape) {
			escape = false;
			part += char;
		} else if (quote && char === "\\") {
			escape = true;
			part += char;
		} else if (char === quote) {
			quote = "";
			part += char;
		} else if (!quote && (char === "\'" || char === "\"")) {
			quote = char;
			part += char;
		} else if (!quote && char === " ") {
			parts.push(part);
			part = "";
		} else {
			part += char;
		}
	}

	if (quote || escape) {
		return false;
	}

	parts.push(part);

	return parts;
}

export function parseInsts(value) {
	const insts = splitInsts(value);

	for (let i = 0; i < insts.length; ++i) {
		const parts = splitInst(insts[i]);

		if (!parts) {
			return false;
		}

		insts[i] = parts;
	}

	return insts;
}

function parseEscape(value) {
	switch (value) {
		case "'":
			return 39;
		case "\"":
			return 34;
		case "\\":
			return 92;
		case "n":
			return 10;
		case "r":
			return 13;
		case "t":
			return 9;
		case "b":
			return 8;
		case "f":
			return 12;
		case "v":
			return 11;
		case "0":
			return 0;
		default:
			throw new Error();
	}
}

export function parseStr(value) {
	let str = "";
	let escape = false;

	for (let i = 1; i < value.length - 1; ++i) {
		if (escape) {
			escape = false;
			const code = parseEscape(value[i]);
			str += String.fromCharCode(code);
		} else if (value[i] === "\\") {
			escape = true;
		} else {
			str += value[i];
		}
	}

	return str + String.fromCharCode(0);
}

export function parseChar(value) {
	if (value.length === 3) {
		return value.charCodeAt(1);
	}

	return parseEscape(value[2]);
}

export function parseNum(value) {
	return +value;
}
