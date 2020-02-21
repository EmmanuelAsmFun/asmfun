﻿#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
// Heavely inspired from https://github.com/commanderx16/x16-emulator
#endregion

using AsmFun.Common;

namespace AsmFun.Ide.Core.Features.Compilation
{
    public class BaseMnemonics : IMnemonics
    {
        public static string[] Mnemonics = new string[]{ "brk ", "ora ($%02x,x)", "nop ", "nop ", "tsb $%02x", "ora $%02x", "asl $%02x", "nop ", "php ", "ora #$%02x", "asl a", "nop ", "tsb $%04x",
            "ora $%04x", "asl $%04x", "nop ", "bpl $%02x", "ora ($%02x),y", "ora ($%02x)", "nop ", "trb $%02x", "ora $%02x,x", "asl $%02x,x", "nop ", "clc ", "ora $%04x,y", "inc a", "nop ",
            "trb $%04x", "ora $%04x,x", "asl $%04x,x", "nop ", "jsr $%04x", "and ($%02x,x)", "nop ", "nop ", "bit $%02x", "and $%02x", "rol $%02x", "nop ", "plp ", "and #$%02x", "rol a",
            "nop ", "bit $%04x", "and $%04x", "rol $%04x", "nop ", "bmi $%02x", "and ($%02x),y", "and ($%02x)", "nop ", "bit $%02x,x", "and $%02x,x", "rol $%02x,x", "nop ", "sec ",
            "and $%04x,y", "dec a", "nop ", "bit $%04x,x", "and $%04x,x", "rol $%04x,x", "nop ", "rti ", "eor ($%02x,x)", "nop ", "nop ", "nop ", "eor $%02x", "lsr $%02x", "nop ",
            "pha ", "eor #$%02x", "lsr a", "nop ", "jmp $%04x", "eor $%04x", "lsr $%04x", "nop ", "bvc $%02x", "eor ($%02x),y", "eor ($%02x)", "nop ", "nop ", "eor $%02x,x",
            "lsr $%02x,x", "nop ", "cli ", "eor $%04x,y", "phy ", "nop ", "nop ", "eor $%04x,x", "lsr $%04x,x", "nop ", "rts ", "adc ($%02x,x)", "nop ", "nop ", "stz $%02x",
            "adc $%02x", "ror $%02x", "nop ", "pla ", "adc #$%02x", "ror a", "nop ", "jmp ($%04x)", "adc $%04x", "ror $%04x", "nop ", "bvs $%02x", "adc ($%02x),y", "adc ($%02x)",
            "nop ", "stz $%02x,x", "adc $%02x,x", "ror $%02x,x", "nop ", "sei ", "adc $%04x,y", "ply ", "nop ", "jmp ($%04x,x)", "adc $%04x,x", "ror $%04x,x", "nop ", "bra $%02x",
            "sta ($%02x,x)", "nop ", "nop ", "sty $%02x", "sta $%02x", "stx $%02x", "nop ", "dey ", "bit #$%02x", "txa ", "nop ", "sty $%04x", "sta $%04x", "stx $%04x", "nop ",
            "bcc $%02x", "sta ($%02x),y", "sta ($%02x)", "nop ", "sty $%02x,x", "sta $%02x,x", "stx $%02x,y", "nop ", "tya ", "sta $%04x,y", "txs ", "nop ", "stz $%04x", "sta $%04x,x",
            "stz $%04x,x", "nop ", "ldy #$%02x", "lda ($%02x,x)", "ldx #$%02x", "nop ", "ldy $%02x", "lda $%02x", "ldx $%02x", "nop ", "tay ", "lda #$%02x", "tax ", "nop ", "ldy $%04x",
            "lda $%04x", "ldx $%04x", "nop ", "bcs $%02x", "lda ($%02x),y", "lda ($%02x)", "nop ", "ldy $%02x,x", "lda $%02x,x", "ldx $%02x,y", "nop ", "clv ", "lda $%04x,y", "tsx ", "nop ",
            "ldy $%04x,x", "lda $%04x,x", "ldx $%04x,y", "nop ", "cpy #$%02x", "cmp ($%02x,x)", "nop ", "nop ", "cpy $%02x", "cmp $%02x", "dec $%02x", "nop ", "iny ", "cmp #$%02x", "dex ",
            "nop ", "cpy $%04x", "cmp $%04x", "dec $%04x", "nop ", "bne $%02x", "cmp ($%02x),y", "cmp ($%02x)", "nop ", "nop ", "cmp $%02x,x", "dec $%02x,x", "nop ", "cld ", "cmp $%04x,y",
            "phx ", "nop ", "nop ", "cmp $%04x,x", "dec $%04x,x", "nop ", "cpx #$%02x", "sbc ($%02x,x)", "nop ", "nop ", "cpx $%02x", "sbc $%02x", "inc $%02x", "nop ", "inx ", "sbc #$%02x",
            "nop ", "nop ", "cpx $%04x", "sbc $%04x", "inc $%04x", "nop ", "beq $%02x", "sbc ($%02x),y", "sbc ($%02x)", "nop ", "nop ", "sbc $%02x,x", "inc $%02x,x", "nop ", "sed ",
            "sbc $%04x,y", "plx ", "nop ", "nop ", "sbc $%04x,x", "inc $%04x,x", "dbg " };

        public string GetByOpcode(int opcode)
        {
            return Mnemonics[opcode];
        }
    }
}
