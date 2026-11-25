import { pushError } from "./error.js";

let ids = new Map();
let tempIds = ids;

export function saveIdentifiers() {
	tempIds = ids;
}

export function restoreIdentifiers() {
	ids = tempIds;
}

export function setIdentifier(key, value) {
	if (ids.has(key)) {
		pushError(`identifier has been set: ${key}`);
		return false;
	}

	ids.set(key, value);
	return true;
}

export function getIdentifier(key) {
	if (!ids.has(key)) {
		pushError(`identifier has not been set: ${key}`);
		return false;
	}

	return ids.get(key);
}

export function deleteIdentifier(key) {
	return ids.delete(key);
}

export function resetIdentifiers() {
	ids.clear();
}
