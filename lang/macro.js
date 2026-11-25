import { macros, getMacro } from "./enum.js";
import { pushError as error } from "./error.js";

// req insts
function expandMacro(macro, inst) {
	switch (macro) {
		case macros.clear:
			return ["sys", `${macros.clear}`];
		case macros.print:
			return [["load", `${inst[1] ?? "\"\""}`], ["out_str"], ["flush"]];
		case macros.print_line:
			return [["load", `${inst[1] ?? "\"\""}`], ["out_str"], ["load", "'\\n'"], ["out_char"], ["flush"]];
		default:
			throw new Error(`Invalid or unimplemented macro: ${macro}`);
	}
}

export function expandMacros(insts) {
	const newInsts = [];

	for (const inst of insts) {

		if (inst.length === 0) {
			error("expected opcode");
			return false;
		}

		const rawOpcode = inst[0];

		const macro = getMacro(rawOpcode);

		if (macro === false) {
			newInsts.push(inst);
			continue;
		}

		const macroInsts = expandMacro(macro, inst);

		if (macroInsts === false) {
			error(`failed to expand macro: ${rawOpcode}`);
			return false;
		}

		for (let i = 0; i < macroInsts.length; ++i) {
			newInsts.push(macroInsts[i]);
		}
	}

	console.log(newInsts)
	return newInsts;
}
