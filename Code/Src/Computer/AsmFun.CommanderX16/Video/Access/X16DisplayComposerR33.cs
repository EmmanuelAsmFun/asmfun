#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.CommanderX16.Video.Painter;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using AsmFun.Computer.Common.Video.Enums;
using System;
using System.Linq;

namespace AsmFun.CommanderX16.Video
{
    /// <summary>
    /// The composer adjusts global video effects, in particular the output video mode, border color, and the size of the display area.
    /// </summary>
    public class X16DisplayComposerR33 : DisplayComposerData 
    {

        private byte[] composerData;
        private readonly X16VideoSettings videoSettings;
        private readonly ComputerSetupSettings computerSetupSettings;
        private IVideoPainter videoPainter;
        private byte b_OutMode;
        /// <summary>
        ///  $0F:$0000 : Output mode and chroma toggle.
        /// </summary>
        private byte b_OutputModeAndChromaToggle;
        ///// <summary>
        ///// $0F:$0001 :Horizontal Scale
        ///// </summary>
        //public byte b_HScale { get; set; }
        ///// <summary>
        ///// $0F:$0002 :Vertical Scale
        ///// </summary>
        //public byte b_VScale { get; set; }
        /// <summary>
        /// $0F:$0003 : Border color palette index
        /// </summary>
        private byte b_BorderColorPaletteIndex;
        /// <summary>
        /// $0F:$0004 : Horizontal start of display area
        /// </summary>
        private byte b_HStartDisplayArea;
        /// <summary>
        /// $0F:$0005 : Horizontal end of display area
        /// </summary>
        private byte b_HEndDisplayArea;
        /// <summary>
        /// $0F:$0006 : Vertical start of display area
        /// </summary>
        private byte b_VStartDisplayArea;
        /// <summary>
        /// $0F:$0007 : Vertical end of display area
        /// </summary>
        private byte b_VEndDisplayArea;
        /// <summary>
        /// $0F:$0008 : Course adjustments to display area
        /// </summary>
        private byte b_CourseAdjustmentsDispayArea;

        public override string Name => "Composer";

        // reg_composer
        // ----------------------------------------------------

        public X16DisplayComposerR33(VideoSettings videoSettings, ComputerSetupSettings computerSetupSettings)
        {
            this.videoSettings = (X16VideoSettings)videoSettings;
            composerData = new byte[32];
            this.computerSetupSettings = computerSetupSettings;
        }

        public override void Init(IVideoPainter videoPainter)
        {
            this.videoPainter = videoPainter;
        }
        public override void Reset()
        {
            SetRegComposer(new byte[32]);
            Write(1, 128); // hscale = 1.0
            Write(2, 128); // vscale = 1.0
        }


        public override byte[] GetRegComposer()
        {
            return new byte[] {b_OutputModeAndChromaToggle, b_HScale, b_VScale, b_BorderColorPaletteIndex,
                b_HStartDisplayArea, b_HEndDisplayArea, b_VStartDisplayArea, b_VEndDisplayArea,
                b_CourseAdjustmentsDispayArea
                };
        }
        public override void SetRegComposer(byte[] data)
        {
            composerData = data;
            b_OutputModeAndChromaToggle = data[0];
            b_HScale = data[1];
            b_VScale = data[2];
            b_BorderColorPaletteIndex = data[3];
            b_HStartDisplayArea = data[4];
            b_HEndDisplayArea = data[5];
            b_VStartDisplayArea = data[6];
            b_VEndDisplayArea = data[7];
            b_CourseAdjustmentsDispayArea = data[8];
        }


        public override void Write(uint pos, byte value)
        {
            WriteToProps(pos, value);
            videoPainter.RequestUpdatePaintProcedure();
        }
        private void WriteToProps(uint pos, byte value)
        { 
            //Console.WriteLine("Comp:" + pos + "=" + value);
            composerData[pos] = value;
            switch (pos)
            {
                case 0:
                    // This field takes bytes in the format %00000CMM.
                    b_OutputModeAndChromaToggle = value;
                    // BIT 0 - 1
                    b_OutMode = (byte)(value & 3);
                    // Setting CHROMA_DISABLE disables output of chroma in NTSC composite mode and will give a better picture on a monochrome display.
                    // BIT 2
                    ChromaDisable = ((value >> 2) & 1) != 0;
                    OutMode = (b_OutMode & 2) != 0 ? VideoOutModes.NTSC : VideoOutModes.VGA;
                    StepXAdvance = (float)((OutMode == VideoOutModes.NTSC ? videoSettings.NTSCPixelFrequency : videoSettings.VgaPixelFrequency) / computerSetupSettings.Mhz);
                    FrontPorch = (ushort)(OutMode == VideoOutModes.NTSC ? videoSettings.NTSCFrontPorchY : videoSettings.VgaFrontPorchY);
                    break;

                // HSCALE and VSCALE will set the fractional scaling factor of the display. Setting this value to 128
                //will output 1 output pixel for every input pixel. Setting this to 64 will output 2 output pixels for every input pixel.
                case 1:
                    // HScale
                    b_HScale = value;
                    HScale = (float)(128.0 / value);
                    break;
                case 2:
                    // VScale
                    b_VScale = value;
                    VScale = (float)(128.0 / value);
                    break;
                case 3: // DC_BORDER_COLOR
                    // BORDER_COLOR determines the palette index which is used for the non-active area of the screen.
                    // This value contains the index into palette memory for the display border. If the Output mode is set to 0, this is ignored.
                    b_BorderColorPaletteIndex = value;
                    BorderColor = value;
                    break;
                // HSTART/HSTOP and VSTART/VSTOP determines the active part of the screen. The values here are specified 
                // in the native 640x480 display space. HSTART=0, HSTOP=640, VSTART=0, VSTOP=480 will set the active area to the full resolution.
                case 4: // DC_HSTART_L
                    b_HStartDisplayArea = value;
                    HStart = (ushort)(b_HStartDisplayArea | (b_CourseAdjustmentsDispayArea & 3) << 8);
                    break;
                case 5: // DC_HSTOP_L
                    b_HEndDisplayArea = value;
                    HStop = (ushort)(b_HEndDisplayArea | ((b_CourseAdjustmentsDispayArea >> 2) & 3) << 8);
                    break;
                case 6: // DC_VSTART_L
                    b_VStartDisplayArea = value;
                    VStart = (ushort)(b_VStartDisplayArea | ((b_CourseAdjustmentsDispayArea >> 4) & 1) << 8);
                    break;
                case 7: // DC_VSTOP_L
                    b_VEndDisplayArea = value;
                    VStop = (ushort)(b_VEndDisplayArea | ((b_CourseAdjustmentsDispayArea >> 5) & 1) << 8);
                    
                    break;
                case 8: // DC_STARTSTOP_H
                    b_CourseAdjustmentsDispayArea = value;
                    HStart = (ushort)(b_HStartDisplayArea | (b_CourseAdjustmentsDispayArea & 3) << 8);
                    HStop = (ushort)(b_HEndDisplayArea | ((b_CourseAdjustmentsDispayArea >> 2) & 3) << 8);
                    VStart = (ushort)(b_VStartDisplayArea | ((b_CourseAdjustmentsDispayArea >> 4) & 1) << 8);
                    VStop = (ushort)(b_VEndDisplayArea | ((b_CourseAdjustmentsDispayArea >> 5) & 1) << 8);
                   
                    // $0F:$0008, in particular, is special. It contains the highest 2 bits of the horizontal start and end
                    // of the display area, and the highest bit of the vertical start and end of the display area, 
                    // in the format: %00vVhhHH.
                    // When appended at the top of the appropriate byte values in addresses $0F:$0004 to $0F:$0007, 
                    // this makes the Horizontal start and stop 10 bits wide, and the Vertical start and stop 9 bits wide.
                    break;
                // IRQ_LINE specifies at which line the LINE interrupt will be generated. 
                // For interlaced modes the interrupt will be generated each field and the LSB of IRQ_LINE is ignored.
                case 9: // DC_IRQ_LINE_L
                case 10: // DC_IRQ_LINE_H
                    IrqLine = (ushort)(composerData[9] | (composerData[10] & 1) << 8);
                    break;
                default:
                    break;
            }
            
            
        }
        public override byte Read(uint pos)
        {
            switch (pos)
            {
                case 0: return b_OutputModeAndChromaToggle;
                case 1: return b_HScale;
                case 2: return b_VScale;
                case 3: return b_BorderColorPaletteIndex;
                case 4: return b_HStartDisplayArea;
                case 5: return b_HEndDisplayArea;
                case 6: return b_VStartDisplayArea;
                case 7: return b_VEndDisplayArea;
                default:
                    return composerData[pos];
            }
        }

        public override byte[] ReadBlock(uint address, int length)
        {
            var buf = new byte[length];
            Array.Copy(composerData, address, buf, 0, length);
            return buf;
        }
        public override void WriteBlock(byte[] bytes, int sourceIndex, int targetIndex, int length)
        {
            if (length > composerData.Length) length = composerData.Length;
            for (uint i = 0; i < length; i++)
                WriteToProps(i, bytes[i]);
            videoPainter.RequestUpdatePaintProcedure();
        }

        public override void SetIrqLine(byte value)
        {
            IrqLine = (byte)((IrqLine & 0xFF) | ((value >> 7) << 8));
        }

        public override HScales GetHScale()
        {
            switch (b_HScale)
            {
                case 128: return HScales.HorizontalScale_1_1;
                case 64: return HScales.HorizontalScale_2_1;
                case 32: return HScales.HorizontalScale_4_1;
                case 16: return HScales.HorizontalScale_8_1;
                case 8: return HScales.HorizontalScale_16_1;
                case 4: return HScales.HorizontalScale_32_1;
                case 2: return HScales.HorizontalScale_64_1;
                default: return HScales.HorizontalScale_64_1;
            }
        }
        public override VScales GetVScale()
        {
            switch (b_VScale)
            {
                case 128: return VScales.VerticalScale_1_1;
                case 64: return VScales.VerticalScale_2_1;
                case 32: return VScales.VerticalScale_4_1;
                case 16: return VScales.VerticalScale_8_1;
                case 8: return VScales.VerticalScale_16_1;
                default: return VScales.VerticalScale_1_1;
            }
        }

        public override void MemoryDump(byte[] data, int startInsertAddress)
        {
            Array.Copy(composerData, 0, data, startInsertAddress, composerData.Length);
        }

        public override byte[] MemoryDump(int startAddress)
        {
            return composerData.ToArray();
        }

       
    }
}
