import {
	isValidStr,
	isValidChar,
	isValidVar,
	isValidInt,
	isValidFloat,
	isValidMacro,
} from "./validator.js";
import {
	parseInsts,
	parseStr,
	parseChar,
	parseNum,
	parseMacro
} from "./parser.js";
import {
	syntaxKinds,
	directives,
	opcodes,
} from "./enum.js";
import {
	strCopy,
	alloc
} from "./runtime.js";
import { processDirective } from "./processor.js";
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

		if (isValidMacro(value)) {
			const info = parseMacro(value);

			if (info === false) {
				error(`invalid macro: ${value}`);
				return false;
			}

			const { kind, macro } = info;
			kinds.push(kind);
			values.push(macro);

		} else if (isValidStr(value)) {
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

	if (insts.length === 0) {
		return new Float64Array();
	}

	const rawProgram = [];

	line = 0;

	for (const inst of insts) {
		const info = getInstInfo(inst);

		if (info === false) {
			error("failed to retrieve instruction info");
			return false;
		}

		const { kinds, values } = info;

		const rawOpcode = inst[0];
		const opcode = opcodes[rawOpcode];

		if (opcode === undefined) {
			const directive = directives[rawOpcode];

			if (directive === undefined) {
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

		if (opcode === opcodes.jmp) {
			operand = (operand - 1) << 1
		}

		rawProgram.push(opcode, operand);

		++line;
	}

	const program = new Float64Array(rawProgram);

	return program;
}
