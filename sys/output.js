const output = document.getElementById("output");

let buffer = "";

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
	if (value === undefined) {
		return;
	}

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

export function flushBuffer() {
	output.textContent += buffer;
	buffer = "";
}

export function outLine(text) {
	output.textContent += text + "\n";
}
