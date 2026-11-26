import {
	isValidStr,
	isValidChar,
	isValidVar,
	isValidInt,
	isValidFloat,
} from "./validator.js";
import {
	parseInsts,
	parseStr,
	parseChar,
	parseNum
} from "./parser.js";
import {
	syntaxKinds,
	getDirective,
	getOpcode,
} from "./enum.js";
import {
	strCopy,
	alloc
} from "./runtime.js";
import { processDirective } from "./processor.js";
import { expandMacros } from "./macro.js";
import { getIdentifier } from "./identifier.js";
import { pushError as error } from "./error.js";

let line = 0;

export function getLine() {
	return line;
}

function getInstInfo(inst) {
	const kinds = [];
	const values = [];

	for (let i = 1; i < inst.length; ++i) {
		const value = inst[i];

		if (isValidStr(value)) {
			kinds.push(syntaxKinds.str);

			const str = parseStr(value);
			const ptr = alloc(str.length);

			if (ptr === false) {
				error(`out of memory while allocating ${str.length} bytes for string: ${value}`);
				return false;
			}

			strCopy(ptr, str);
			values.push(ptr);

		} else if (isValidChar(value)) {
			kinds.push(syntaxKinds.char);
			values.push(parseChar(value));

		} else if (isValidVar(value)) {
			kinds.push(syntaxKinds.var);
			values.push(value);

		} else if (isValidInt(value)) {
			kinds.push(syntaxKinds.int);
			values.push(parseNum(value));

		} else if (isValidFloat(value)) {
			kinds.push(syntaxKinds.float);
			values.push(parseNum(value));

		} else {
			error(`invalid operand: ${value}`);
			return false;
		}
	}

	return { kinds, values };
}

export async function compile(rawInsts) {
	const insts = parseInsts(rawInsts);

	if (insts === false) {
		error("unterminated string, character, or escape sequence");
		return false;
	}

	const newInsts = expandMacros(insts);

	if (newInsts === false) {
		error("failed to expand macros");
		return false;
	}

	if (newInsts.length === 0) {
		return new Float64Array();
	}

	const rawProgram = [];

	line = 0;

	for (const inst of newInsts) {
		const info = getInstInfo(inst);

		if (info === false) {
			error("failed to retrieve instruction info");
			return false;
		}

		const { kinds, values } = info;

		const rawOpcode = inst[0];
		const opcode = getOpcode(rawOpcode);

		if (opcode === false) {
			const directive = getDirective(rawOpcode);

			if (directive === false) {
				error(`invalid directive or opcode: ${rawOpcode}`);
				return false;
			}

			const success = processDirective(directive, kinds, values);

			if (success) {
				continue;
			} else {
				error(`failed to process directive: ${rawOpcode}`);
				return false;
			}
		}

		const firstKind = kinds[0];
		const firstValue = values[0];

		// todo: opcode checks

		let operand = firstValue ?? 0;

		if (firstKind === syntaxKinds.var) {
			const ptr = getIdentifier(firstValue);

			if (ptr === false) {
				error(`undeclared variable: ${firstValue}`);
				return false;
			}

			operand = ptr;
		}

		rawProgram.push(opcode, operand);

		++line;
	}

	const program = new Float64Array(rawProgram);

	return program;
}
