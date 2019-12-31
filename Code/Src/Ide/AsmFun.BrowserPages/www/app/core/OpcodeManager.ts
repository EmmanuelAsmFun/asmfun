// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IOpcodeData } from '../data/IOpcodeData.js'
import { IEditorLine } from '../data/EditorData.js';
import { ServiceName } from '../serviceLoc/ServiceName.js';

export class OpcodeManager {
    
    // Make HTML 
    private asmFunCodeStack = "<span class=\"fa fa-sort-amount-asc\"></span>";
    private asmFunCodebranch = "<span class=\"fa fa-level-down\"></span>";
    private asmFunCodeJump = "<span class=\"fa fa-level-up\"></span>";
    private asmFunCodeBreakR = "<span class=\"fa fa-hand-peace-o\"></span>";
    private asmFunCodeBreak = "<span class=\"fa fa-hand-stop-o\"></span>";
    private opcodes: IOpcodeData[] = [];

    constructor() {
        this.initOpcodes();
        for (var i = 0; i < this.opcodes.length; i++) {
            var opcode = this.opcodes[i];
            opcode.isStack = opcode.asmFunCode.indexOf("[SStack]") > -1;
            opcode.isJump = opcode.asmFunCode.indexOf("[Return]") > -1 || opcode.asmFunCode.indexOf("BBranch") > -1;
            var code = opcode.asmFunCode.trim();
            code = code
                .replace(/\[SStack\]/g, 'stack')
                .replace(/\[BBranch\]/g, 'goto')
                .replace(/\[Return\]/g, 'return')
                .replace(/\[BBreakR\]/g, 'return_i')
                .replace(/\[BBreak\]/g, 'break')
                .trim()
                ;
            var codeN = code.replace(/\[dataSp\]/g, '');
            opcode.hasRegisterA = codeN.indexOf("a") > -1;
            opcode.hasRegisterX = codeN.indexOf("x") > -1;
            opcode.hasRegisterY = codeN.indexOf("y") > -1;
            opcode.hasCarry = codeN.indexOf("c") > -1;
            opcode.hasDecimal = codeN.indexOf("d") > -1;
            opcode.searchCode = codeN.split(' ').join(''); // Remove all spaces
            opcode.html = this.ToHtml(codeN);
        }
    }

    public InterpretOpcode(line: IEditorLine) {
        if (line.isAddressSetter || line.isSetRawData || line.isVariable) return;
        // Get the asmFunCode
        var asmFunCode = this.getAsmFunCodeString(line);
        if (asmFunCode === "") return;
        asmFunCode = this.ToHtml(asmFunCode);
        line.asmFunCode = "<span class=\"asmFunCode\" >" + asmFunCode + "</span>";
    }

    public ToHtml(asmFunCode:string):string {
        asmFunCode = asmFunCode
            .replace(/=/g, "&equals;")
            .replace(/-/g, "&minus;")
            .replace(" & ", "<span class=\"op\"> & </span>")
            .replace(" | ", "<span class=\"op\"> | </span>")
            .replace(" ^ ", "<span class=\"op\"> ^ </span>")
            .replace(/if /g, "<span class=\"instr\">if </span>")
            .replace("&equals;&equals;", "<span class=\"op\">&equals;&equals;</span>")
            .replace("&equals;", "<span class=\"op\">&equals;</span>")
            .replace("++c", "<span class=\"op\">++c</span>")
            .replace("++", "<span class=\"op\">++</span>")
            .replace("+", "<span class=\"op\">+</span>")
            .replace("<<r", "<span class=\"op\">&lt;&lt;r</span>")
            .replace("<<", "<span class=\"op\">&lt;&lt;</span>")
            .replace(">>r", "<span class=\"op\">&gt;&gt;r</span>")
            .replace(/>>/g, "<span class=\"op\">&gt;&gt;</span>")
            .replace(/is /g, "<span class=\"instr\">is </span>")
            .replace("&minus;&minus;", "<span class=\"op\">&minus;&minus;</span>")
            .replace("&minus;&minus;c", "<span class=\"op\">&minus;&minus;c</span>")
            .replace("&minus;", "<span class=\"op\">&minus;</span>")
            .replace(' and ', "<span class=\"instr\"> and </span>")
            .replace(/\[SStack\]/g, "<span class=\"instr\">stack</span>")
            .replace(/\[Memory\]/g, "<span class=\"instr\">mem</span>")
            .replace(/\[BBranch\]/g, "<span class=\"instr\">goto</span>")
            .replace(/\[Return\]/g, "<span class=\"instr\">return</span>")
            .replace(/\[BBreakR\]/g, "<span class=\"instr\">return_i</span>")
            .replace(/\[BBreak\]/g, this.asmFunCodeBreak)
            // Restore equals
            .replace(/&equals;/g, "=")
            ;
        return asmFunCode;
    }

    public getValidOpcode(opcodeString: string) {
        var opcode = this.opcodes.find(x => x.code == opcodeString);
        return opcode;
    }

    private getAsmFunCodeString(line: IEditorLine) {
        var asmFunCode = "";
        var dataSp = "";
        if (line.opcode == null) return "";
        if (line.data != null && line.dataCode.length > 0)
            dataSp = line.dataCode.replace("#", "");
        var opcode = this.opcodes.find(x => x.code == (<any>line.opcode).code);
        if (opcode != null) {
            asmFunCode = opcode.asmFunCode.replace("[dataSp]", dataSp);
        }
        return asmFunCode;
    }

    public tryGetOpcode(wordWithoutSpace: string) {
        var search = wordWithoutSpace.split(' ').join(''); // Remove all spaces
        var opcode = this.opcodes.find(x => x.searchCode === search);
        if (opcode != null) return opcode;
        return null;
    }

    public Search(searchstr: string): IOpcodeData[] {
        var search = searchstr.split(' ').join('').trim(); // Remove all spaces
        if (search === "") return this.opcodes;
        var opcodes = this.opcodes.filter(x =>
            x.searchCode != null &&
            x.searchCode.search(new RegExp(search, "i")) > -1 ||
            x.code.indexOf(search) > -1);
        return opcodes;
    }

    private initOpcodes() {
        this.opcodes.push({ code: "lda", asmFunCode: 'a = [dataSp]' });         // Load Accumulator from RAM or IO
        this.opcodes.push({ code: "ldx", asmFunCode: 'x = [dataSp]' });         // Load X from RAM or IO   
        this.opcodes.push({ code: "ldy", asmFunCode: 'y = [dataSp]' });         // Load Y from RAM or IO
        this.opcodes.push({ code: "sta", asmFunCode: '[Memory] [dataSp] = a' });         // Store Accumulator to RAM or IO
        this.opcodes.push({ code: "stx", asmFunCode: '[Memory] [dataSp] = x' });         // Store X to RAM or IO
        this.opcodes.push({ code: "sty", asmFunCode: '[Memory] [dataSp] = y' });         // Store Y to RAM or IO


        this.opcodes.push({ code: "cmp", asmFunCode: 'if a and [dataSp]' });      // Compare and set the carry flag + negative flag
        this.opcodes.push({ code: "cpy", asmFunCode: 'if y and [dataSp]' });      // Compare Y
        this.opcodes.push({ code: "cpx", asmFunCode: 'if x and [dataSp]' });      // Compare X
        this.opcodes.push({ code: "bit", asmFunCode: 'flag & [dataSp]' });        // BIT sets the Z flag as though the value in the address tested
                                                                                  // were ANDed with the accumulator.


        this.opcodes.push({ code: "beq", asmFunCode: 'is == [BBranch] [dataSp]' });      //  Branch if Equals
        this.opcodes.push({ code: "bne", asmFunCode: 'is != [BBranch] [dataSp]' });      //  Branch not Equals
        this.opcodes.push({ code: "bpl", asmFunCode: 'is > [BBranch] [dataSp]' });       //  Branch if Plus
        this.opcodes.push({ code: "bmi", asmFunCode: 'is < [BBranch] [dataSp]' });       //  Branch if Minus
        this.opcodes.push({ code: "bcs", asmFunCode: 'is c == 1 [BBranch] [dataSp]' });  //  Branch if Carry is Set    
        this.opcodes.push({ code: "bcc", asmFunCode: 'is c == 0 [BBranch] [dataSp]' });  //  Branch if Carry is Clear    
        this.opcodes.push({ code: "bvs", asmFunCode: 'is f == 1 [BBranch] [dataSp]' });  //  Branch if Overflow Set    
        this.opcodes.push({ code: "bvc", asmFunCode: 'is f == 0 [BBranch] [dataSp]' });  //  Branch if Overflow Clear   

        // Flags
        this.opcodes.push({ code: "sec", asmFunCode: 'c = 1' });                //  Set Carry Flag
        this.opcodes.push({ code: "clc", asmFunCode: 'c = 0' });                //  Clear Carry Flag
        this.opcodes.push({ code: "sed", asmFunCode: 'd = 1' });                //  Set Decimal Flag
        this.opcodes.push({ code: "cld", asmFunCode: 'd = 0' });                //  Clear Decimal Flag
        this.opcodes.push({ code: "sei", asmFunCode: 'i = 1' });                //  Set Interrupt
        this.opcodes.push({ code: "cli", asmFunCode: 'i = 0' });                //  Clear Interrupt
        this.opcodes.push({ code: "clv", asmFunCode: 'f = 0' });                //  Clear Overflow

        // Math
        this.opcodes.push({ code: "inx", asmFunCode: 'x ++ [dataSp]' });                  //  Increase X
        this.opcodes.push({ code: "dex", asmFunCode: 'x -- [dataSp]' });                  //  Decrease X
        this.opcodes.push({ code: "iny", asmFunCode: 'y ++ [dataSp]' });                  //  Increase Y
        this.opcodes.push({ code: "dey", asmFunCode: 'y -- [dataSp]' });                  //  Decrease Y
        this.opcodes.push({ code: "inc", asmFunCode: 'a ++ [dataSp]' });                  //  Increase
        this.opcodes.push({ code: "dec", asmFunCode: 'a -- [dataSp]' });                  //  Decrease
        this.opcodes.push({ code: "adc", asmFunCode: 'a ++c [dataSp]' });                 //  Add with carry
        this.opcodes.push({ code: "sbc", asmFunCode: 'a --c [dataSp]' });                 //  Subtract with carry

        this.opcodes.push({ code: "asl", asmFunCode: 'a << ' });                 //  Arithmetic Shift Left
        this.opcodes.push({ code: "lsr", asmFunCode: 'a >> ' });                 //  Logic Shift Right
        this.opcodes.push({ code: "rol", asmFunCode: 'a <<r ' });                //  Roll Left  : last bit is put back at the beginning
        this.opcodes.push({ code: "ror", asmFunCode: 'a >>r ' });                //  Roll Right : first bit is put back at the end

        // Logic ops
        this.opcodes.push({ code: "and", asmFunCode: 'a & [dataSp]' });         //  AND                 on the Accumulator
        this.opcodes.push({ code: "ora", asmFunCode: 'a | [dataSp]' });         //  OR                  on the Accumulator
        this.opcodes.push({ code: "eor", asmFunCode: 'a ^ [dataSp]' });         //  Exclusive OR(XOR)   on the Accumulator    

        // Transfers
        this.opcodes.push({ code: "tax", asmFunCode: 'x = a' });                //  Transfer Accumulator to x
        this.opcodes.push({ code: "tay", asmFunCode: 'y = a' });                //  Transfer Accumulator to y
        this.opcodes.push({ code: "txa", asmFunCode: 'a = x' });                //  Transfer x to Accumulator
        this.opcodes.push({ code: "tya", asmFunCode: 'a = y' });                //  Transfer y to Accumulator
        this.opcodes.push({ code: "tsx", asmFunCode: 'x = [SStack]' });         //  Transfer Stackpointer to x       
        this.opcodes.push({ code: "txs", asmFunCode: '[SStack] = x' });         //  Transfer x to Stackpointer
        
        this.opcodes.push({ code: "stz", asmFunCode: '[dataSp] = 0' });         //  Store zero       

        // Stack
        this.opcodes.push({ code: "pha", asmFunCode: '[SStack] += a' });         //  push Accumulator : on the stack       sp--
        this.opcodes.push({ code: "pla", asmFunCode: 'a = [SStack]-' });         //  pull Accumulator : from the stack   ++sp
        this.opcodes.push({ code: "php", asmFunCode: '[SStack]+ = flags' });     //  push processor flags : on the stack   sp--
        this.opcodes.push({ code: "plp", asmFunCode: 'flags = [SStack]-' });     //  pull processor flags : on the stack ++sp
        this.opcodes.push({ code: "phx", asmFunCode: '[SStack]+ = x' });         //  push X : on the stack       sp--
        this.opcodes.push({ code: "plx", asmFunCode: 'x = [SStack]-' });         //  pull X : from the stack   ++sp
        this.opcodes.push({ code: "phy", asmFunCode: '[SStack]+ = y' });         //  push Y : on the stack   sp--
        this.opcodes.push({ code: "ply", asmFunCode: 'y = [SStack]-' });         //  pull Y : on the stack ++sp

        // Jump
        this.opcodes.push({ code: "jmp", asmFunCode: '[BBranch] [dataSp]' });              //  Jump 
        this.opcodes.push({ code: "jsr", asmFunCode: '[BBranch] [dataSp] & [Return]' });  //  Jump to subroutine

        // Return
        this.opcodes.push({ code: "rts", asmFunCode: '[Return]  ' });             // Return from subroutine (take address from the stack)
        this.opcodes.push({ code: "rti", asmFunCode: '[BBreakR]  ' });            // Return from interupt (first status flag, then pc counter)
        
        this.opcodes.push({ code: "brk", asmFunCode: '[BBreak]  ' });             // Breakpoint + interupts flag 
        this.opcodes.push({ code: "nop", asmFunCode: '  ' });              

    } 


    public static ServiceName: ServiceName = { Name: "OpcodeManager" };
}

