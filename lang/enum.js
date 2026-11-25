export const macros = enumerate([
	"clear",
	"print",
	"print_line"
]);

export const directives = enumerate([
	"var_i8",
	"var_u8",
	"var_i16",
	"var_u16",
	"var_i32",
	"var_u32",
	"var_f16",
	"var_f32",
	"var_f64",
	"arr_i8",
	"arr_u8",
	"arr_i16",
	"arr_u16",
	"arr_i32",
	"arr_u32",
	"arr_f16",
	"arr_f32",
	"arr_f64",
	"ptr",
	"lbl",
	"del"
]);

export const opcodes = enumerate([
	"load",
	"load_i8",
	"load_u8",
	"load_i16",
	"load_u16",
	"load_i32",
	"load_u32",
	"load_f16",
	"load_f32",
	"load_f64",
	"store_i8",
	"store_u8",
	"store_i16",
	"store_u16",
	"store_i32",
	"store_u32",
	"store_f16",
	"store_f32",
	"store_f64",
	"add",
	"sub",
	"mul",
	"div",
	"mod",
	"cmp",
	"ife",
	"ifne",
	"ifl",
	"ifle",
	"ifg",
	"ifge",
	"jmp",
	"flush",
	"out_str",
	"out_char",
	"out_ptr",
	"out_int",
	"out_float",
	"exit"
]);

export const syntaxKinds = enumerate([
	"str",
	"char",
	"var",
	"int",
	"float"
]);

export const dataTypes = enumerate([
	"i8",
	"u8",
	"i16",
	"u16",
	"i32",
	"u32",
	"f16",
	"f32",
	"f64"
]);

function enumerate(arr) {
	return Object.freeze(
		arr.reduce((acc, item, index) => {
			acc[item] = index;
			return acc;
		}, {})
	);
}

export function getMacro(value) {
	const macro = macros[value];

	if (macro === undefined) {
		return false;
	}

	return macro;
}

export function getDirective(value) {
	const directive = directives[value];

	if (directive === undefined) {
		return false;
	}

	return directive;
}

export function getOpcode(value) {
	const opcode = opcodes[value];

	if (opcode === undefined) {
		return false;
	}

	return opcode;
}

export function getType(directive) {
	switch (directive) {
		case directives.var_i8:
		case directives.arr_i8:
			return dataTypes.i8;
		case directives.var_u8:
		case directives.arr_u8:
			return dataTypes.u8;
		case directives.var_i16:
		case directives.arr_i16:
			return dataTypes.i16;
		case directives.var_u16:
		case directives.arr_u16:
			return dataTypes.u16;
		case directives.var_i32:
		case directives.arr_i32:
			return dataTypes.i32;
		case directives.var_u32:
		case directives.arr_u32:
			return dataTypes.u32;
		case directives.var_f16:
		case directives.arr_f16:
			return dataTypes.f16;
		case directives.var_f32:
		case directives.arr_f32:
			return dataTypes.f32;
		case directives.var_f64:
		case directives.arr_f64:
			return dataTypes.f64;
		default:
			throw new Error();
	}
}

export function getWidth(type) {
	switch (type) {
		case dataTypes.i8:
		case dataTypes.u8:
			return 1;
		case dataTypes.i16:
		case dataTypes.u16:
		case dataTypes.f16:
			return 2;
		case dataTypes.i32:
		case dataTypes.u32:
		case dataTypes.f32:
			return 3;
		case dataTypes.f64:
			return 4;
		default:
			throw new Error();
	}
}

export function getSigned(type) {
	switch (type) {
		case dataTypes.i8:
		case dataTypes.i16:
		case dataTypes.i32:
			return true;
		case dataTypes.u8:
		case dataTypes.u16:
		case dataTypes.u32:
			return false;
		default:
			throw new Error();
	}
}
