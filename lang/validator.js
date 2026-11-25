import { syntaxKinds } from "./enum.js";

const charRegex = /^'[^\\']'$/;
const varRegex = /^[a-z_][\da-z_]*$/i;
const intRegex = /^-?(0|[1-9]\d*)$/;
const floatRegex = /^-?(0|[1-9]\d*)\.\d*$/;

function isValidEscape(value) {
	switch (value) {
		case "'":
		case "\"":
		case "\\":
		case "n":
		case "r":
		case "t":
		case "b":
		case "f":
		case "v":
		case "0":
			return true;
		default:
			return false;
	}
}

export function isValidStr(value) {
	const validQuotes =
		value.startsWith("\"") &&
		value.endsWith("\"");

	if (!validQuotes) {
		return false;
	}

	let escape = false;

	for (let i = 1; i < value.length - 1; ++i) {
		if (escape) {
			escape = false;
			if (isValidEscape(value[i])) {
				return false;
			}
		} else if (value[i] === "\\") {
			escape = true;
		}
	}

	return !escape;
}

export function isValidChar(value) {
	if (value.length === 3) {
		return charRegex.test(value);
	}

	if (value.length === 4) {
		return (
			value.startsWith("'\\") &&
			isValidEscape(value[2]) &&
			value.endsWith("'")
		);
	}

	return false;
}

export function isValidVar(value) {
	return varRegex.test(value);
}

export function isValidInt(value) {
	return intRegex.test(value);
}

export function isValidFloat(value) {
	return floatRegex.test(value);
}

function isValidRange(int, width, signed) {
	const max =
		signed ? 1 << ((width << 3) - 1) : 1 << (width << 3);

	const min =
		signed ? -max : 0;

	return (
		int >= min &&
		int < max
	);
}

export function isInfoValidInt(operandKind, value, width, signed) {
	return (
		operandKind !== syntaxKinds.var &&
		operandKind !== syntaxKinds.float &&
		isValidRange(value, width, signed)
	);
}

export function isInfoValidPtr(operandKind, value) {
	return (
		operandKind !== syntaxKinds.var &&
		operandKind !== syntaxKinds.float &&
		value > 0 &&
		value < 4294967296
	);
}
