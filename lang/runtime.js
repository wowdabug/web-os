import {
	bufferStr,
	bufferChar,
	bufferPtr,
	bufferInt,
	bufferFloat,
	flushBuffer
} from "../sys/output.js";
import {
	opcodes,
	dataTypes
} from "./enum.js";

const memSize = 1024 * 1024;
const stackSize = 1024;
const memOffset = 4;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const memBuffer = new ArrayBuffer(memSize);
const memI8 = new Int8Array(memBuffer);
const memU8 = new Uint8Array(memBuffer);
const memView = new DataView(memBuffer);
const stack = new Float64Array(stackSize);

let memPtr = memOffset;
let tempMemPtr = memPtr;
let stackPtr = 0;

export function saveRuntime() {
	tempMemPtr = memPtr;
}

export function restoreRuntime() {
	memPtr = tempMemPtr;
}

export function resetRuntime() {
	memU8.fill(0);
	memPtr = memOffset;
}

export function strCopy(ptr, str) {
	encoder.encodeInto(str, memU8.subarray(ptr));
}

export function varCopy(type, ptr, value) {
	console.log(`setting address ${ptr} to ${value}`);
	switch (type) {
		case dataTypes.i8:
			memI8[ptr] = value; break;
		case dataTypes.u8:
			memU8[ptr] = value; break;
		case dataTypes.i16:
			memView.setInt16(ptr, value); break;
		case dataTypes.u16:
			memView.setUint16(ptr, value); break;
		case dataTypes.i32:
			memView.setInt32(ptr, value); break;
		case dataTypes.u32:
			memView.setUint32(ptr, value); break;
		case dataTypes.f16:
			memView.setFloat16(ptr, value); break;
		case dataTypes.f32:
			memView.setFloat32(ptr, value); break;
		case dataTypes.f64:
			memView.setFloat64(ptr, value); break;
		default:
			throw new Error("Invalid or unimplemented type");
	}
}

export function alloc(width) {
	const ptr = memPtr;

	memPtr += width;
	if (memPtr > memSize) {
		return false;
	}

	return ptr;
}

function outStr(ptr) {
	let end = ptr;
	while (memU8[end] !== 0) {
		++end;
	}

	bufferStr(decoder.decode(memU8.subarray(ptr, end)));
}

export async function execute(program) {
	for (let i = 0; i < program.length; i += 2) {

		const opcode = program[i];
		const operand = program[i + 1];

		switch (opcode) {
			case opcodes.load:
				stack[stackPtr++] = operand; break;
			case opcodes.load_i8:
				stack[stackPtr++] = memI8[operand]; break;
			case opcodes.load_u8:
				stack[stackPtr++] = memU8[operand]; break;
			case opcodes.load_i16:
				stack[stackPtr++] = memView.getInt16(operand, true); break;
			case opcodes.load_u16:
				stack[stackPtr++] = memView.getUint16(operand, true); break;
			case opcodes.load_i32:
				stack[stackPtr++] = memView.getInt32(operand, true); break;
			case opcodes.load_u32:
				stack[stackPtr++] = memView.getUint32(operand, true); break;
			case opcodes.load_f16:
				stack[stackPtr++] = memView.getFloat16(operand, true); break;
			case opcodes.load_f32:
				stack[stackPtr++] = memView.getFloat32(operand, true); break;
			case opcodes.load_f64:
				stack[stackPtr++] = memView.getFloat64(operand, true); break;
			case opcodes.store_i8:
				memI8[stack[stackPtr - 2]] = stack[stackPtr - 1]; stackPtr -= 2; break;
			case opcodes.store_u8:
				memU8[stack[stackPtr - 2]] = stack[stackPtr - 1]; stackPtr -= 2; break;
			case opcodes.store_i16:
				memView.setInt16(stack[stackPtr - 2], stack[stackPtr - 1], true); stackPtr -= 2; break;
			case opcodes.store_u16:
				memView.setUint16(stack[stackPtr - 2], stack[stackPtr - 1], true); stackPtr -= 2; break;
			case opcodes.store_i32:
				memView.setInt32(stack[stackPtr - 2], stack[stackPtr - 1], true); stackPtr -= 2; break;
			case opcodes.store_u32:
				memView.setUint32(stack[stackPtr - 2], stack[stackPtr - 1], true); stackPtr -= 2; break;
			case opcodes.store_f16:
				memView.setFloat16(stack[stackPtr - 2], stack[stackPtr - 1], true); stackPtr -= 2; break;
			case opcodes.store_f32:
				memView.setFloat32(stack[stackPtr - 2], stack[stackPtr - 1], true); stackPtr -= 2; break;
			case opcodes.store_f64:
				memView.setFloat64(stack[stackPtr - 2], stack[stackPtr - 1], true); stackPtr -= 2; break;
			case opcodes.add:
				stack[stackPtr - 2] = stack[stackPtr - 2] + stack[stackPtr - 1]; --stackPtr; break;
			case opcodes.sub:
				stack[stackPtr - 2] = stack[stackPtr - 2] - stack[stackPtr - 1]; --stackPtr; break;
			case opcodes.mul:
				stack[stackPtr - 2] = stack[stackPtr - 2] * stack[stackPtr - 1]; --stackPtr; break;
			case opcodes.div:
				stack[stackPtr - 2] = stack[stackPtr - 2] / stack[stackPtr - 1]; --stackPtr; break;
			case opcodes.mod:
				stack[stackPtr - 2] = stack[stackPtr - 2] % stack[stackPtr - 1]; --stackPtr; break;
			case opcodes.ife:
				if (stack[--stackPtr] !== stack[--stackPtr]) i += 2; break;
			case opcodes.ifne:
				if (stack[--stackPtr] === stack[--stackPtr]) i += 2; break;
			case opcodes.ifl:
				if (stack[--stackPtr] <= stack[--stackPtr]) i += 2; break;
			case opcodes.ifle:
				if (stack[--stackPtr] < stack[--stackPtr]) i += 2; break;
			case opcodes.ifg:
				if (stack[--stackPtr] >= stack[--stackPtr]) i += 2; break;
			case opcodes.ifge:
				if (stack[--stackPtr] > stack[--stackPtr]) i += 2; break;
			case opcodes.jmp:
				i = operand; break;
			case opcodes.out_str:
				outStr(stack[--stackPtr]); break;
			case opcodes.out_char:
				bufferChar(stack[--stackPtr]); break;
			case opcodes.out_ptr:
				bufferPtr(stack[--stackPtr]); break;
			case opcodes.out_int:
				bufferInt(stack[--stackPtr]); break;
			case opcodes.out_float:
				bufferFloat(stack[--stackPtr]); break;
			case opcodes.flush:
				flushBuffer(); break;
			case opcodes.sleep:
				await new Promise((resolve) => setTimeout(resolve, stack[--stackPtr])); break;
			case opcodes.exit:
				return operand;
			case opcodes.test:
				console.log("test"); break;
			default:
				throw new Error(`Invalid or unimplemented opcode: ${opcode}`);
		}
	}

	return 0;
}
