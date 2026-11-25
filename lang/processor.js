import {
	directives,
	syntaxKinds,
	dataTypes,
	getType,
	getWidth,
	getSigned
} from "./enum.js";
import {
	varCopy,
	arrCopy,
	alloc
} from "./runtime.js";
import {
	setIdentifier,
	deleteIdentifier
} from "./identifier.js";
import {
	isInfoValidInt,
	isInfoValidPtr
} from "./validator.js";
import { pushError as error } from "./error.js";
import { getLine } from "./compiler.js";

function processVariable(directive, kinds, values) {
	const valid =
		kinds.length >= 1 &&
		kinds.length <= 2 &&
		kinds[0] === syntaxKinds.var;

	if (!valid) {
		error("invalid variable declaration");
		return false;
	}

	const type = getType(directive);
	const width = getWidth(type);
	const ptr = alloc(width);

	if (ptr === false) {
		error(`out of memory while allocating ${width} bytes for variable: ${values[0]}`);
		return false;
	}

	if (kinds.length === 2) {
		const float = type >= dataTypes.f16 && type <= dataTypes.f64;

		if (float) {
			if (kinds[1] !== syntaxKinds.float) {
				error(`invalid floating-point initializer for variable: ${values[0]}`);
				return false;
			}
		} else {
			const signed = getSigned(type);

			if (!isInfoValidInt(kinds[1], values[1], width, signed)) {
				error(`invalid integer initializer for variable: ${values[0]}`);
				return false;
			}
		}

		varCopy(type, ptr, values[1]);
	}

	const success = setIdentifier(values[0], ptr);

	if (!success) {
		error("duplicate identifier in variable declaration");
		return false;
	}

	return true;
}

function processArray(directive, kinds, values) {
	const valid =
		kinds.length >= 2 &&
		kinds[0] === syntaxKinds.var &&
		isInfoValidPtr(kinds[1], values[1]);

	if (!valid) {
		error("invalid array declaration");
		return false;
	}

	const type = getType(directive);
	const width = getWidth(type);
	const ptr = alloc(width);

	if (ptr === false) {
		error(`out of memory while allocating ${width} bytes for array: ${values[0]}`);
		return false;
	}

	if (kinds.length > 2) {
		if (kinds.length - 2 !== values[1]) {
			error("a");
			return false;
		}

		const float = type >= dataTypes.f16 && type <= dataTypes.f64;

		if (float) {
			for (let i = 2; i < kinds.length; ++i) {
				if (kinds[i] !== syntaxKinds.float) {
					error(`invalid floating-point initializer for array: ${values[0]}`);
					return false;
				}
			}

		} else {
			const signed = getSigned(type);

			for (let i = 2; i < kinds.length; ++i) {
				if (!isInfoValidInt(kinds[i], values[i], width, signed)) {
					error(`invalid integer initializer for array: ${values[0]}`);
					return false;
				}
			}
		}

		arrCopy(values[1], width, type, ptr, values, 2)
	}

	const success = setIdentifier(values[0], ptr);

	if (!success) {
		error("duplicate identifier in array declaration");
		return false;
	}

	return true;
}

function processPointer(kinds, values) {
	const valid =
		kinds.length === 2 &&
		kinds[0] === syntaxKinds.var &&
		isInfoValidPtr(kinds[1], values[1]);

	if (!valid) {
		error("invalid format in pointer delcaration");
		return false;
	}

	const success = setIdentifier(values[0], values[1]);

	if (!success) {
		error(`duplicate identifier in pointer declaration: ${values[0]}`);
		return false;
	}

	return true;
}

function processLabel(kinds, values) {
	if (kinds.length !== 1) {
		error("expected one argument in label declaration");
		return false;
	}

	if (kinds[0] !== syntaxKinds.var) {
		error("expected identifier in label declaration");
		return false;
	}

	const success = setIdentifier(values[0], getLine());

	if (!success) {
		error(`duplicate identifier in label declaration: ${values[0]}`);
		return false;
	}

	return true;
}

function processDelete(kinds, values) {
	if (kinds[0] !== syntaxKinds.var) {
		error("invalid delete declaration");
		return false;
	}

	if (!deleteIdentifier(values[0])) {
		error(`undefined identifier in delete declaration: ${values[0]}`);
		return false;
	}


	return true;
}

export function processDirective(directive, kinds, values) {
	if (directive >= directives.var_i8 && directive <= directives.var_f64) {
		return processVariable(directive, kinds, values);
	}

	if (directive >= directives.arr_i8 && directive <= directives.arr_f64) {
		return processArray(directive, kinds, values);
	}

	if (directive === directives.ptr) {
		return processPointer(kinds, values);
	}

	if (directive === directives.lbl) {
		return processLabel(kinds, values);
	}

	if (directive === directives.del) {
		return processDelete(kinds, values);
	}
}
