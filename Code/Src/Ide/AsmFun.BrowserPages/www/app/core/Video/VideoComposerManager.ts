import { IVideoSettings, IVideoManagerData, IVideoDisplayComposer, VScales, HScales, VideoOutModes } from "../../data/VideoData.js";
import { ServiceName } from "../../serviceLoc/ServiceName.js";
import { IMemoryDump } from "../../data/ComputerData.js";
import { AsmTools } from "../../Tools.js";
import { VideoPaletteManager } from "./VideoPaletteManager.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

export class VideoComposerManager {


    private videoSettings?: IVideoSettings;
    private videoManagerData?: IVideoManagerData;
    /**$0F:$0000 : Output mode and chroma toggle. */
    b_OutputModeAndChromaToggle: number = 0;
    // $0F:$0001 :Horizontal Scale
    //b_HScale: number;
    // $0F:$0002 :Vertical Scale
    //b_VScale: number;
    /**$0F:$0003 : Border color palette index */
    b_BorderColorPaletteIndex: number = 0;
    /**$0F:$0004 : Horizontal start of display area */
    b_HStartDisplayArea: number = 0;
    /**$0F:$0005 : Horizontal end of display area */
    b_HEndDisplayArea: number = 0;
    /**$0F:$0006 : Vertical start of display area */
    b_VStartDisplayArea: number = 0;
    /**$0F:$0007 : Vertical end of display area */
    b_VEndDisplayArea: number = 0;
    /**$0F:$0008 : Course adjustments to display area */
    b_CourseAdjustmentsDispayArea: number = 0;


    public Init(videoManagerData: IVideoManagerData) {
        this.videoSettings = videoManagerData.settings;
        this.videoManagerData = videoManagerData;
    }


    public Parse(memDump: IMemoryDump, data: Uint8Array) {
        if (this.videoSettings == null) return;

        if (this.videoManagerData == null) return;
        var composer = this.videoManagerData.composer;
        composer.startAddress = AsmTools.numToHex5(memDump.startAddress);
        composer.endAddress = AsmTools.numToHex5(memDump.endAddressForUI);
        this.SetBaseData(data);
        for (var i = 0; i < 9; i++) {
            this.ParseByte(composer, i, data[i]);
        }
        composer.RawDataString = AsmTools.ArrayToHexString(data.subarray(0,9));
    }

    private SetBaseData(data: Uint8Array) {
        this.b_OutputModeAndChromaToggle = data[0];
        this.b_BorderColorPaletteIndex = data[3];
        this.b_HStartDisplayArea = data[4];
        this.b_HEndDisplayArea = data[5];
        this.b_VStartDisplayArea = data[6];
        this.b_VEndDisplayArea = data[7];
        this.b_CourseAdjustmentsDispayArea = data[8];
    }

    private ParseByte(composer: IVideoDisplayComposer, pos: number, value: number) {

        switch (pos) {
            case 0:
                // This field takes bytes in the format %00000CMM.
                // BIT 0 - 1
                var b_OutMode = (value & 3);
                // Setting CHROMA_DISABLE disables output of chroma in NTSC composite mode and will give a better picture on a monochrome display.
                // BIT 2
                composer.ChromaDisable = ((value >> 2) & 1) != 0;
                composer.OutMode = (b_OutMode & 2) != 0 ? VideoOutModes.NTSC : VideoOutModes.VGA;
                composer.OutModeString = VideoOutModes[composer.OutMode];
                break;

            // HSCALE and VSCALE will set the fractional scaling factor of the display. Setting this value to 128
            //will output 1 output pixel for every input pixel. Setting this to 64 will output 2 output pixels for every input pixel.
            case 1:
                //b_HScale: HScale;
                composer.HScale = (128.0 / value);
                composer.b_HScale = value;
                composer.HScaleString = HScales[this.GetHScale(composer.b_HScale)].replace("HorizontalScale_","");
                break;
            case 2:
                //b_VScale: VScale;
                composer.VScale = (128.0 / value);
                composer.b_VScale = value;
                composer.VScaleString = VScales[this.GetVScale(composer.b_VScale)].replace("VerticalScale_", "");
                break;
            case 3: // DC_BORDER_COLOR
                // BORDER_COLOR determines the palette index which is used for the non-active area of the screen.
                // This value contains the index into palette memory for the display border. If the Output mode is set to 0, this is ignored.
                this.b_BorderColorPaletteIndex = value;
                composer.BorderColor = value;
                break;
            // HSTART/HSTOP and VSTART/VSTOP determines the active part of the screen. The values here are specified 
            // in the native 640x480 display space. HSTART=0, HSTOP=640, VSTART=0, VSTOP=480 will set the active area to the full resolution.
            case 4: //b_HStartDisplayArea: DC_HSTART_L;
                composer.HStart = (this.b_HStartDisplayArea | (this.b_CourseAdjustmentsDispayArea & 3) << 8);
                break;
            case 5: //b_HEndDisplayArea: DC_HSTOP_L;
                composer.HStop = (this.b_HEndDisplayArea | ((this.b_CourseAdjustmentsDispayArea >> 2) & 3) << 8);
                break;
            case 6: //b_VStartDisplayArea: DC_VSTART_L;
                composer.VStart = (this.b_VStartDisplayArea | ((this.b_CourseAdjustmentsDispayArea >> 4) & 1) << 8);
                break;
            case 7: //b_VEndDisplayArea: DC_VSTOP_L;
                composer.VStop = (this.b_VEndDisplayArea | ((this.b_CourseAdjustmentsDispayArea >> 5) & 1) << 8);

                break;
            case 8: //b_CourseAdjustmentsDispayArea: DC_STARTSTOP_H;
                this.b_CourseAdjustmentsDispayArea = value;
                composer.HStart = (this.b_HStartDisplayArea | (this.b_CourseAdjustmentsDispayArea & 3) << 8);
                composer.HStop = (this.b_HEndDisplayArea | ((this.b_CourseAdjustmentsDispayArea >> 2) & 3) << 8);
                composer.VStart = (this.b_VStartDisplayArea | ((this.b_CourseAdjustmentsDispayArea >> 4) & 1) << 8);
                composer.VStop = (this.b_VEndDisplayArea | ((this.b_CourseAdjustmentsDispayArea >> 5) & 1) << 8);

                // $0F:$0008, in particular, is special. It contains the highest 2 bits of the horizontal start and end
                // of the display area, and the highest bit of the vertical start and end of the display area, 
                // in the format: %00vVhhHH.
                // When appended at the top of the appropriate byte values in addresses $0F:$0004 to $0F:$0007, 
                // this makes the Horizontal start and stop 10 bits wide, and the Vertical start and stop 9 bits wide.
                break;
            // IRQ_LINE specifies at which line the LINE interrupt will be generated. 
            // For interlaced modes the interrupt will be generated each field and the LSB of IRQ_LINE is ignored.
            case 9: // DC_IRQ_LINE_L
            case 10: //IrqLine: DC_IRQ_LINE_H;
                break;
            default:
                break;
        }



    }
    private GetHScale(b_HScale: number): HScales {
        switch (b_HScale) {
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
    private GetVScale(b_VScale: number): VScales {
        switch (b_VScale) {
            case 128: return VScales.VerticalScale_1_1;
            case 64: return VScales.VerticalScale_2_1;
            case 32: return VScales.VerticalScale_4_1;
            case 16: return VScales.VerticalScale_8_1;
            case 8: return VScales.VerticalScale_16_1;
            default: return VScales.VerticalScale_1_1;
        }
    }



    public static NewData(): IVideoDisplayComposer {
        return {
            startAddress: "",
            endAddress: "",
            BorderColor: 0,
            BorderColorData: VideoPaletteManager.NewEmptyColor(),
            b_HScale: 1,
            b_VScale: 1,
            ChromaDisable: false,
            FrontPorch: 0,
            HScale: 1,
            HScaleString: "",
            HStart: 0,
            HStop: 0,
            IrqLine: 0,
            OutMode: 0,
            OutModeString: "",
            OutModeVG: 0,
            StepXAdvance: 0,
            VScale: 1,
            VScaleString: "",
            VStart: 0,
            VStop: 0,
            RawDataString:"",
        }
    }

    public static ServiceName: ServiceName = { Name: "VideoComposerManager" };
}