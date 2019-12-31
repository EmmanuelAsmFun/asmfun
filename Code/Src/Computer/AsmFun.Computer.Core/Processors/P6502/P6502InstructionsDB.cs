// This file is heavely inspired by Mike Chambers (miker00lz@gmail.com) fake6502.c
// Heavely inspired from https://github.com/commanderx16/x16-emulator
using AsmFun.Computer.Core.Processors;
using AsmFun.Computer.Core.Processors.P65c02;

namespace AsmFun.Computer.Core.Processors.P6502
{
    public class P6502InstructionsDB : InstructionDB<P65c02Instructions, P65c02OpcodeModes>
    {

        public P6502InstructionsDB()
        {
            // 0x00 - 0x0F | row=0 
            A(o => o.Brk(), " brk", i => i.Imp(), "imp", 7); A(o => o.Ora(), "ora", i => i.Indx(), "indx", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Tsb(), "tsb", i => i.Zp(), "zp", 5); A(o => o.Ora(), "ora", i => i.Zp(), "zp", 3); A(o => o.Asl(), "asl", i => i.Zp(), "zp", 5); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Php(), "php", i => i.Imp(), "imp", 3); A(o => o.Ora(), "ora", i => i.Imm(), "imm", 2); A(o => o.Asl(), "asl", i => i.Acc(), "acc", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Tsb(), "tsb", i => i.Abso(), "abso", 6); A(o => o.Ora(), "ora", i => i.Abso(), "abso", 4); A(o => o.Asl(), "asl", i => i.Abso(), "abso", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            // 0x0F - 0x1F | row=1 
            A(o => o.Bpl(), " bpl", i => i.Rel(), "rel", 2); A(o => o.Ora(), "ora", i => i.Indy(), "indy", 5); A(o => o.Ora(), "ora", i => i.Ind0(), "ind0", 5); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Trb(), "trb", i => i.Zp(), "zp", 5); A(o => o.Ora(), "ora", i => i.Zpx(), "zpx", 4); A(o => o.Asl(), "asl", i => i.Zpx(), "zpx", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Clc(), "clc", i => i.Imp(), "imp", 2); A(o => o.Ora(), "ora", i => i.Absy(), "absy", 4); A(o => o.Inc(), "inc", i => i.Acc(), "acc", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Trb(), "trb", i => i.Abso(), "abso", 6); A(o => o.Ora(), "ora", i => i.Absx(), "absx", 4); A(o => o.Asl(), "asl", i => i.Absx(), "absx", 7); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            // 0x1F - 0x2F | row=2 
            A(o => o.Jsr(), " jsr", i => i.Abso(), "abso", 6); A(o => o.And(), "and", i => i.Indx(), "indx", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Bit(), "bit", i => i.Zp(), "zp", 3); A(o => o.And(), "and", i => i.Zp(), "zp", 3); A(o => o.Rol(), "rol", i => i.Zp(), "zp", 5); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Plp(), "plp", i => i.Imp(), "imp", 4); A(o => o.And(), "and", i => i.Imm(), "imm", 2); A(o => o.Rol(), "rol", i => i.Acc(), "acc", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Bit(), "bit", i => i.Abso(), "abso", 4); A(o => o.And(), "and", i => i.Abso(), "abso", 4); A(o => o.Rol(), "rol", i => i.Abso(), "abso", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            // 0x2F - 0x3F | row=3 
            A(o => o.Bmi(), " bmi", i => i.Rel(), "rel", 2); A(o => o.And(), "and", i => i.Indy(), "indy", 5); A(o => o.And(), "and", i => i.Ind0(), "ind0", 5); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Bit(), "bit", i => i.Zpx(), "zpx", 4); A(o => o.And(), "and", i => i.Zpx(), "zpx", 4); A(o => o.Rol(), "rol", i => i.Zpx(), "zpx", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Sec(), "sec", i => i.Imp(), "imp", 2); A(o => o.And(), "and", i => i.Absy(), "absy", 4); A(o => o.Dec(), "dec", i => i.Acc(), "acc", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Bit(), "bit", i => i.Absx(), "absx", 4); A(o => o.And(), "and", i => i.Absx(), "absx", 4); A(o => o.Rol(), "rol", i => i.Absx(), "absx", 7); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            // 0x3F - 0x4F | row=4 
            A(o => o.Rti(), " rti", i => i.Imp(), "imp", 6); A(o => o.Eor(), "eor", i => i.Indx(), "indx", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2); A(o => o.Eor(), "eor", i => i.Zp(), "zp", 3); A(o => o.Lsr(), "lsr", i => i.Zp(), "zp", 5); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Pha(), "pha", i => i.Imp(), "imp", 3); A(o => o.Eor(), "eor", i => i.Imm(), "imm", 2); A(o => o.Lsr(), "lsr", i => i.Acc(), "acc", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Jmp(), "jmp", i => i.Abso(), "abso", 3); A(o => o.Eor(), "eor", i => i.Abso(), "abso", 4); A(o => o.Lsr(), "lsr", i => i.Abso(), "abso", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            // 0x4F - 0x5F | row=5 
            A(o => o.Bvc(), " bvc", i => i.Rel(), "rel", 2); A(o => o.Eor(), "eor", i => i.Indy(), "indy", 5); A(o => o.Eor(), "eor", i => i.Ind0(), "ind0", 5); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2); A(o => o.Eor(), "eor", i => i.Zpx(), "zpx", 4); A(o => o.Lsr(), "lsr", i => i.Zpx(), "zpx", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Cli(), "cli", i => i.Imp(), "imp", 2); A(o => o.Eor(), "eor", i => i.Absy(), "absy", 4); A(o => o.Phy(), "phy", i => i.Imp(), "imp", 3); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2); A(o => o.Eor(), "eor", i => i.Absx(), "absx", 4); A(o => o.Lsr(), "lsr", i => i.Absx(), "absx", 7); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            // 0x5F - 0x6F | row=6 
            A(o => o.Rts(), " rts", i => i.Imp(), "imp", 6); A(o => o.Adc(), "adc", i => i.Indx(), "indx", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Stz(), "stz", i => i.Zp(), "zp", 3); A(o => o.Adc(), "adc", i => i.Zp(), "zp", 3); A(o => o.Ror(), "ror", i => i.Zp(), "zp", 5); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Pla(), "pla", i => i.Imp(), "imp", 4); A(o => o.Adc(), "adc", i => i.Imm(), "imm", 2); A(o => o.Ror(), "ror", i => i.Acc(), "acc", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Jmp(), "jmp", i => i.Ind(), "ind", 5); A(o => o.Adc(), "adc", i => i.Abso(), "abso", 4); A(o => o.Ror(), "ror", i => i.Abso(), "abso", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            // 0x6F - 0x7F | row=7 
            A(o => o.Bvs(), " bvs", i => i.Rel(), "rel", 2); A(o => o.Adc(), "adc", i => i.Indy(), "indy", 5); A(o => o.Adc(), "adc", i => i.Ind0(), "ind0", 5); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Stz(), "stz", i => i.Zpx(), "zpx", 4); A(o => o.Adc(), "adc", i => i.Zpx(), "zpx", 4); A(o => o.Ror(), "ror", i => i.Zpx(), "zpx", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Sei(), "sei", i => i.Imp(), "imp", 2); A(o => o.Adc(), "adc", i => i.Absy(), "absy", 4); A(o => o.Ply(), "ply", i => i.Imp(), "imp", 4); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Jmp(), "jmp", i => i.Ainx(), "ainx", 6); A(o => o.Adc(), "adc", i => i.Absx(), "absx", 4); A(o => o.Ror(), "ror", i => i.Absx(), "absx", 7); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            // 0x7F - 0x8F | row=8 
            A(o => o.Bra(), " bra", i => i.Rel(), "rel", 3); A(o => o.Sta(), "sta", i => i.Indx(), "indx", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Sty(), "sty", i => i.Zp(), "zp", 3); A(o => o.Sta(), "sta", i => i.Zp(), "zp", 3); A(o => o.Stx(), "stx", i => i.Zp(), "zp", 3); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Dey(), "dey", i => i.Imp(), "imp", 2); A(o => o.Bit(), "bit", i => i.Imm(), "imm", 2); A(o => o.Txa(), "txa", i => i.Imp(), "imp", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Sty(), "sty", i => i.Abso(), "abso", 4); A(o => o.Sta(), "sta", i => i.Abso(), "abso", 4); A(o => o.Stx(), "stx", i => i.Abso(), "abso", 4); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            // 0x8F - 0x9F | row=9 
            A(o => o.Bcc(), " bcc", i => i.Rel(), "rel", 2); A(o => o.Sta(), "sta", i => i.Indy(), "indy", 6); A(o => o.Sta(), "sta", i => i.Ind0(), "ind0", 5); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Sty(), "sty", i => i.Zpx(), "zpx", 4); A(o => o.Sta(), "sta", i => i.Zpx(), "zpx", 4); A(o => o.Stx(), "stx", i => i.Zpy(), "zpy", 4); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Tya(), "tya", i => i.Imp(), "imp", 2); A(o => o.Sta(), "sta", i => i.Absy(), "absy", 5); A(o => o.Txs(), "txs", i => i.Imp(), "imp", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Stz(), "stz", i => i.Abso(), "abso", 4); A(o => o.Sta(), "sta", i => i.Absx(), "absx", 5); A(o => o.Stz(), "stz", i => i.Absx(), "absx", 5); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            // 0x9F - 0xAF | row=10 
            A(o => o.Ldy(), " ldy", i => i.Imm(), "imm", 2); A(o => o.Lda(), "lda", i => i.Indx(), "indx", 6); A(o => o.Ldx(), "ldx", i => i.Imm(), "imm", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Ldy(), "ldy", i => i.Zp(), "zp", 3); A(o => o.Lda(), "lda", i => i.Zp(), "zp", 3); A(o => o.Ldx(), "ldx", i => i.Zp(), "zp", 3); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Tay(), "tay", i => i.Imp(), "imp", 2); A(o => o.Lda(), "lda", i => i.Imm(), "imm", 2); A(o => o.Tax(), "tax", i => i.Imp(), "imp", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Ldy(), "ldy", i => i.Abso(), "abso", 4); A(o => o.Lda(), "lda", i => i.Abso(), "abso", 4); A(o => o.Ldx(), "ldx", i => i.Abso(), "abso", 4); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            // 0xAF - 0xBF | row=11 
            A(o => o.Bcs(), " bcs", i => i.Rel(), "rel", 2); A(o => o.Lda(), "lda", i => i.Indy(), "indy", 5); A(o => o.Lda(), "lda", i => i.Ind0(), "ind0", 5); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Ldy(), "ldy", i => i.Zpx(), "zpx", 4); A(o => o.Lda(), "lda", i => i.Zpx(), "zpx", 4); A(o => o.Ldx(), "ldx", i => i.Zpy(), "zpy", 4); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Clv(), "clv", i => i.Imp(), "imp", 2); A(o => o.Lda(), "lda", i => i.Absy(), "absy", 4); A(o => o.Tsx(), "tsx", i => i.Imp(), "imp", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Ldy(), "ldy", i => i.Absx(), "absx", 4); A(o => o.Lda(), "lda", i => i.Absx(), "absx", 4); A(o => o.Ldx(), "ldx", i => i.Absy(), "absy", 4); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            // 0xBF - 0xCF | row=12 
            A(o => o.Cpy(), " cpy", i => i.Imm(), "imm", 2); A(o => o.Cmp(), "cmp", i => i.Indx(), "indx", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Cpy(), "cpy", i => i.Zp(), "zp", 3); A(o => o.Cmp(), "cmp", i => i.Zp(), "zp", 3); A(o => o.Dec(), "dec", i => i.Zp(), "zp", 5); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Iny(), "iny", i => i.Imp(), "imp", 2); A(o => o.Cmp(), "cmp", i => i.Imm(), "imm", 2); A(o => o.Dex(), "dex", i => i.Imp(), "imp", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Cpy(), "cpy", i => i.Abso(), "abso", 4); A(o => o.Cmp(), "cmp", i => i.Abso(), "abso", 4); A(o => o.Dec(), "dec", i => i.Abso(), "abso", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            // 0xCF - 0xDF | row=13 
            A(o => o.Bne(), " bne", i => i.Rel(), "rel", 2); A(o => o.Cmp(), "cmp", i => i.Indy(), "indy", 5); A(o => o.Cmp(), "cmp", i => i.Ind0(), "ind0", 5); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2); A(o => o.Cmp(), "cmp", i => i.Zpx(), "zpx", 4); A(o => o.Dec(), "dec", i => i.Zpx(), "zpx", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Cld(), "cld", i => i.Imp(), "imp", 2); A(o => o.Cmp(), "cmp", i => i.Absy(), "absy", 4); A(o => o.Phx(), "phx", i => i.Imp(), "imp", 3); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2); A(o => o.Cmp(), "cmp", i => i.Absx(), "absx", 4); A(o => o.Dec(), "dec", i => i.Absx(), "absx", 7); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            // 0xDF - 0xEF | row=14 
            A(o => o.Cpx(), " cpx", i => i.Imm(), "imm", 2); A(o => o.Sbc(), "sbc", i => i.Indx(), "indx", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Cpx(), "cpx", i => i.Zp(), "zp", 3); A(o => o.Sbc(), "sbc", i => i.Zp(), "zp", 3); A(o => o.Inc(), "inc", i => i.Zp(), "zp", 5); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Inx(), "inx", i => i.Imp(), "imp", 2); A(o => o.Sbc(), "sbc", i => i.Imm(), "imm", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Cpx(), "cpx", i => i.Abso(), "abso", 4); A(o => o.Sbc(), "sbc", i => i.Abso(), "abso", 4); A(o => o.Inc(), "inc", i => i.Abso(), "abso", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            // 0xEF - 0xFF | row=15 
            A(o => o.Beq(), " beq", i => i.Rel(), "rel", 2); A(o => o.Sbc(), "sbc", i => i.Indy(), "indy", 5); A(o => o.Sbc(), "sbc", i => i.Ind0(), "ind0", 5); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2); A(o => o.Sbc(), "sbc", i => i.Zpx(), "zpx", 4); A(o => o.Inc(), "inc", i => i.Zpx(), "zpx", 6); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Sed(), "sed", i => i.Imp(), "imp", 2); A(o => o.Sbc(), "sbc", i => i.Absy(), "absy", 4); A(o => o.Plx(), "plx", i => i.Imp(), "imp", 4); A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2);
            A(o => o.Nop(), "nop", i => i.Imp(), "imp", 2); A(o => o.Sbc(), "sbc", i => i.Absx(), "absx", 4); A(o => o.Inc(), "inc", i => i.Absx(), "absx", 7); A(o => o.Dbg(), "dbg", i => i.Imp(), "imp", 1);

        }
    }
}
