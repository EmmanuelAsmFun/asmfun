using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using AsmFun.Computer.Common.Video.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace AsmFun.CommanderX16.Video.Access
{
    /// <summary>
    /// The composer adjusts global video effects, in particular the output video mode, border color, and the size of the display area.
    /// </summary>
    public class X16DisplayComposerR37 : DisplayComposerData
    {

        private byte[] composerData;
        private readonly X16VideoSettings videoSettings;
        private readonly ComputerSetupSettings computerSetupSettings;
        private readonly IVideoLayerAccess videoLayerAccess;
        private IVideoPainter videoPainter;
        private byte b_OutMode;

        // TODO : Fix addresses !!!!

        /// <summary>
        ///  Output mode and chroma toggle.
        /// </summary>
        private byte b_OutputModeAndChromaToggle;
        ///// <summary>
        ///// Horizontal Scale
        ///// </summary>
        //public byte b_HScale { get; set; }
        ///// <summary>
        ///// Vertical Scale
        ///// </summary>
        //public byte b_VScale { get; set; }
        /// <summary>
        ///Border color palette index
        /// </summary>
        private byte b_BorderColorPaletteIndex;
        /// <summary>
        ///Horizontal start of display area
        /// </summary>
        private byte b_HStartDisplayArea;
        /// <summary>
        /// Horizontal end of display area
        /// </summary>
        private byte b_HEndDisplayArea;
        /// <summary>
        /// Vertical start of display area
        /// </summary>
        private byte b_VStartDisplayArea;
        /// <summary>
        /// Vertical end of display area
        /// </summary>
        private byte b_VEndDisplayArea;
        /// <summary>
        /// Course adjustments to display area
        /// </summary>
        private byte b_CourseAdjustmentsDispayArea;

        public override string Name => "Composer";


        public X16DisplayComposerR37(VideoSettings videoSettings, ComputerSetupSettings computerSetupSettings, IVideoLayerAccess videoLayerAccess)
        {
            this.videoSettings = (X16VideoSettings)videoSettings;
            composerData = new byte[8];
            this.computerSetupSettings = computerSetupSettings;
            this.videoLayerAccess = videoLayerAccess;
        }

        public override void Init(IVideoPainter videoPainter)
        {
            this.videoPainter = videoPainter;
        }
        public override void Reset()
        {
            SetRegComposer(new byte[8]);
            Write(1, 128); // hscale = 1.0
            Write(2, 128); // vscale = 1.0
            Write(5, 640 >> 2);
            Write(6, 480 >> 1);
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
        }


        public override void Write(uint pos, byte value)
        {
            WriteToProps(pos, value);
            if (pos ==0)
                videoPainter.RequestUpdatePaintProcedure();
        }
        private void WriteToProps(uint pos, byte value)
        {
            // Address : 0x9F29
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

                    // BIT 4 : Layer0 Enable
                    videoLayerAccess.SetLayerEnable(0,((value >> 4) & 1) != 0);
                    // BIT 5 : Layer1 Enable
                    videoLayerAccess.SetLayerEnable(1, ((value >> 5) & 1) != 0);
                    // BIT 6 : Sprites Enable
                    SpritesEnable = ((value >> 6) & 1) != 0;
                    // BIT 7 : Current field
                    var currentFieldState = ((value >> 7) & 1) != 0;
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
                    HStart = (ushort)(value << 2);
                    break;
                case 5: // DC_HSTOP_L
                    b_HEndDisplayArea = value;
                    HStop = (ushort)(value << 2);
                    break;
                case 6: // DC_VSTART_L
                    b_VStartDisplayArea = value;
                    VStart = (ushort)(value << 1);
                    break;
                case 7: // DC_VSTOP_L
                    b_VEndDisplayArea = value;
                    VStop = (ushort)(value << 1);

                    break;
            }
        }
        public override byte Read(uint pos)
        {
            return composerData[pos];
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
            // IRQ_LINE specifies at which line the LINE interrupt will be generated. 
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
