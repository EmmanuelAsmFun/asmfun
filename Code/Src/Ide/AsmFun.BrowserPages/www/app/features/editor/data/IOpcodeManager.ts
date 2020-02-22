import { IOpcodeData } from "./IOpcodeData.js";
import { InterpreterLine } from "../interpreters/InterpreterLine.js";

export interface IOpcodeManager {
    ParseOpcodeInLine(lineI: InterpreterLine);
    GetValidOpcode(opcodeString: string): IOpcodeData | null;
    Search(searchstr: string): IOpcodeData[];
}