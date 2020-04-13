import { IVideoSettings, IVideoManagerData, IVideoDisplayComposer, VScales, HScales, VideoOutModes } from "./data/VideoData.js";
import { IMemoryDump } from "../computer/data/ComputerData.js";
import { AsmTools } from "../../Tools.js";
import { VideoPaletteManager } from "./VideoPaletteManager.js";
import { NewEmptyColor } from "../palette/data/PaletteData.js";
import { DebuggerService } from "../processor/services/DebuggerService.js";
import { ServiceName } from "../../framework/serviceLoc/ServiceName.js";
import { VideoLayerManager } from "./VideoLayerManager.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

export class VideoComposerManager {

    private isRelease37Plus: boolean = false;

    private videoSettings?: IVideoSettings;
    private videoManagerData?: IVideoManagerData;
    private debuggerService?: DebuggerService;
    private videoLayerManager: VideoLayerManager | null = null;
    private composer: IVideoDisplayComposer | null = null;
    private videoPaletteManager: VideoPaletteManager | null = null;
    private memDump: IMemoryDump | null = null;

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
    b_CurrentFieldState: boolean = false;


    public Init(videoManagerData: IVideoManagerData, debuggerService: DebuggerService, videoLayerManager: VideoLayerManager) {
        this.videoSettings = videoManagerData.settings;
        this.videoManagerData = videoManagerData;
        this.debuggerService = debuggerService;
        this.videoLayerManager = videoLayerManager;
    }


    public Parse(memDump: IMemoryDump, data: Uint8Array, videoPaletteManager: VideoPaletteManager,isRelease37Plus: boolean) {
        if (this.videoSettings == null) return;
        if (this.videoManagerData == null) return;
        this.isRelease37Plus = isRelease37Plus;
        this.videoPaletteManager = videoPaletteManager;
        this.memDump = memDump;
        var composer = this.videoManagerData.composer;
        this.composer = this.videoManagerData.composer;
        composer.startAddress = AsmTools.numToHex5(memDump.startAddress);
        composer.endAddress = AsmTools.numToHex5(memDump.endAddressForUI);
        this.SetBaseData(data);
        
        if (this.isRelease37Plus) {
            for (var i = 0; i < data.length; i++)  this.ParseByte(composer, i, data[i]);
        } else {
            for (var i = 0; i < data.length; i++)  this.ParseByteR33(composer, i, data[i]);
        }
        composer.RawDataString = AsmTools.ArrayToHexString(data.subarray(0, 9));
        composer.valueChanged = v => { this.SendDataChanges(memDump); };
        composer.CopyToClipBoard = () => AsmTools.CopyToClipBoard(composer.RawDataString);
        
        composer.OutModes = AsmTools.EnumToArray(VideoOutModes)
        composer.HScales = AsmTools.EnumToArray(HScales).map(x => x.replace("HorizontalScale_", "").replace("_", ":"));
        composer.VScales = AsmTools.EnumToArray(VScales).map(x => x.replace("VerticalScale_", "").replace("_", ":"));
        
    }

    public SendIsEnableChanges() {
        if (this.memDump == null) return;
        this.SendDataChanges(this.memDump);
    }
    private SendDataChanges(memDump: IMemoryDump) {
        if (this.composer == null || this.videoPaletteManager == null) return;
        if (this.isRelease37Plus) {
            let data1 = this.RecalculateArray(this.composer, this.videoPaletteManager);
            if (this.debuggerService != null)
                this.debuggerService.WriteVideoMemoryBlock(memDump.startAddress, data1, data1.length, () => { });
        } else {
            let data = this.RecalculateArrayR33(this.composer, this.videoPaletteManager);
            if (this.debuggerService != null)
                this.debuggerService.WriteVideoMemoryBlock(memDump.startAddress, data, data.length, () => { });
        }
    }

    private SetBaseData(data: Uint8Array) {
        this.b_OutputModeAndChromaToggle = data[0];
        this.b_BorderColorPaletteIndex = data[3];
        this.b_HStartDisplayArea = data[4];
        this.b_HEndDisplayArea = data[5];
        this.b_VStartDisplayArea = data[6];
        this.b_VEndDisplayArea = data[7];
        if (data.length > 8)
            this.b_CourseAdjustmentsDispayArea = data[8];
    }
    private RecalculateArray(composer: IVideoDisplayComposer, videoPaletteManager: VideoPaletteManager): Uint8Array {
        var data: Uint8Array = new Uint8Array(8);
        if (this.videoManagerData == null || this.videoLayerManager == null) return data;
        // Set enum strings back to numeric
        composer.OutMode = VideoOutModes[composer.OutModeString];
        composer.b_HScale = HScales["HorizontalScale_" + composer.HScaleString.replace(":", "_")];
        composer.b_VScale = VScales["VerticalScale_" + composer.VScaleString.replace(":", "_")];
        
        data[0] =
            (this.b_CurrentFieldState ? 1 : 0) << 7 |
            (this.videoManagerData.spriteDatas.IsEnabled ? 1 : 0) << 6 |
            (this.videoLayerManager.GetEnabledState(1) ? 1 : 0) << 5 |
            (this.videoLayerManager.GetEnabledState(0) ? 1 : 0) << 4  |
            (composer.ChromaDisable ? 1 : 0) << 2 |
            composer.OutMode;
        // HScale
        data[1] = composer.b_HScale;
        // VScale
        data[2] = composer.b_VScale;
        // Border color
        data[3] = composer.BorderColor;
        // HSTART/HSTOP and VSTART/VSTOP
        data[4] = composer.HStart >> 2;
        data[5] = composer.HStop >> 2;
        data[6] = composer.VStart >> 1;
        data[7] = composer.VStop >> 1;;
        this.SetBaseData(data);
        for (var i = 0; i < data.length; i++)  this.ParseByte(composer, i, data[i]);

        composer.RawDataString = AsmTools.ArrayToHexString(data);

        if (composer.BorderColor != null && composer.BorderColor !== undefined && composer.BorderColor >= 0 && composer.BorderColor < 256)
            composer.BorderColorData = videoPaletteManager.GetColor(composer.BorderColor);
        return data;
    }
  

    private ParseByte(composer: IVideoDisplayComposer, pos: number, value: number) {
        switch (pos) {
            case 0:
                // This field takes bytes in the format %00000CMM.
                this.b_OutputModeAndChromaToggle = value;
                // BIT 0 - 1
                var b_OutMode = (value & 3);
                // Setting CHROMA_DISABLE disables output of chroma in NTSC composite mode and will give a better picture on a monochrome display.
                // BIT 2
                composer.ChromaDisable = ((value >> 2) & 1) != 0;
                composer.OutMode = (b_OutMode & 2) != 0 ? VideoOutModes.NTSC : VideoOutModes.VGA;
                composer.OutModeString = VideoOutModes[composer.OutMode];
                //composer.StepXAdvance = ((composer.OutMode == VideoOutModes.NTSC ? videoSettings.NTSCPixelFrequency : videoSettings.VgaPixelFrequency) / computerSetupSettings.Mhz);
                //composer.FrontPorch = (composer.OutMode == VideoOutModes.NTSC ? videoSettings.NTSCFrontPorchY : videoSettings.VgaFrontPorchY);

                if (this.videoLayerManager != null) {
                    // BIT 4 : Layer0 Enable
                    this.videoLayerManager.SetEnabledState(0, ((value >> 4) & 1) != 0);
                    // BIT 5 : Layer1 Enable
                    this.videoLayerManager.SetEnabledState(1, ((value >> 5) & 1) != 0);
                }
                if (this.videoManagerData != null)
                // BIT 6 : Sprites Enable
                    this.videoManagerData.spriteDatas.IsEnabled = ((value >> 6) & 1) != 0;
                // BIT 7 : Current field
                this.b_CurrentFieldState = ((value >> 7) & 1) != 0;
                break;

            // HSCALE and VSCALE will set the fractional scaling factor of the display. Setting this value to 128
            //will output 1 output pixel for every input pixel. Setting this to 64 will output 2 output pixels for every input pixel.
            case 1:
                // HScale
                composer.HScale = (128.0 / value);
                composer.b_HScale = value;
                composer.HScaleString = HScales[this.GetHScale(composer.b_HScale)].replace("HorizontalScale_", "").replace("_", ":");
                break;
            case 2:
                // VScale
                composer.VScale = (128.0 / value);
                composer.b_VScale = value;
                composer.VScaleString = VScales[this.GetVScale(composer.b_VScale)].replace("VerticalScale_", "").replace("_", ":");
                break;
            case 3: // DC_BORDER_COLOR
                // BORDER_COLOR determines the palette index which is used for the non-active area of the screen.
                // This value contains the index into palette memory for the display border. If the Output mode is set to 0, this is ignored.
                this.b_BorderColorPaletteIndex = value;
                composer.BorderColor = value;
                break;
            // HSTART/HSTOP and VSTART/VSTOP determines the active part of the screen. The values here are specified 
            // in the native 640x480 display space. HSTART=0, HSTOP=640, VSTART=0, VSTOP=480 will set the active area to the full resolution.
            case 4: // DC_HSTART_L
                this.b_HStartDisplayArea = value;
                composer.HStart = (value << 2);
                break;
            case 5: // DC_HSTOP_L
                this.b_HEndDisplayArea = value;
                composer.HStop = (value << 2);
                break;
            case 6: // DC_VSTART_L
                this.b_VStartDisplayArea = value;
                composer.VStart = (value << 1);
                break;
            case 7: // DC_VSTOP_L
                this.b_VEndDisplayArea = value;
                composer.VStop = (value << 1);

                break;
        }
    }


    private RecalculateArrayR33(composer: IVideoDisplayComposer, videoPaletteManager: VideoPaletteManager): Uint8Array {
        // Set enum strings back to numeric
        composer.OutMode = VideoOutModes[composer.OutModeString];
        composer.b_HScale = HScales["HorizontalScale_" + composer.HScaleString.replace(":", "_")];
        composer.b_VScale = VScales["VerticalScale_" + composer.VScaleString.replace(":", "_")];

        var data: Uint8Array = new Uint8Array(9);
        data[0] = (composer.ChromaDisable ? 1 : 0) << 2 | composer.OutMode;
        // HScale
        data[1] = composer.b_HScale;
        // VScale
        data[2] = composer.b_VScale;
        // Border color
        data[3] = composer.BorderColor;
        // HSTART/HSTOP and VSTART/VSTOP
        data[4] = composer.HStart & 0xFF;
        data[5] = composer.HStop & 0xFF;
        data[6] = composer.VStart & 0xFF;
        data[7] = composer.VStop & 0xFF;
        data[8] = (composer.HStart >> 8) |
            (composer.HStop >> 8) << 2 |
            (composer.VStart >> 8) << 4 |
            (composer.VStop >> 8) << 5
            ;
        this.SetBaseData(data);
        for (var i = 0; i < 9; i++)  this.ParseByteR33(composer, i, data[i]);

        composer.RawDataString = AsmTools.ArrayToHexString(data);

        if (composer.BorderColor != null && composer.BorderColor !== undefined && composer.BorderColor >= 0 && composer.BorderColor < 256)
            composer.BorderColorData = videoPaletteManager.GetColor(composer.BorderColor);
        return data;
    }
    private ParseByteR33(composer: IVideoDisplayComposer, pos: number, value: number) {

        switch (pos) {
            case 0:
                // This field takes bytes in the format %00000CMM.
                // BIT 0 - 1
                var b_OutMode = (value & 3);
                // Setting CHROMA_DISABLE disables output of chroma in NTSC composite mode and will give a better picture on a monochrome display.
                // BIT 2
                composer.ChromaDisable = ((value >> 2) & 1) != 0;
                composer.OutMode = b_OutMode == 0 ? VideoOutModes.DisabledVideo:(b_OutMode & 2) != 0 ? VideoOutModes.NTSC : VideoOutModes.VGA;
                composer.OutModeString = VideoOutModes[composer.OutMode];
                break;

            // HSCALE and VSCALE will set the fractional scaling factor of the display. Setting this value to 128
            //will output 1 output pixel for every input pixel. Setting this to 64 will output 2 output pixels for every input pixel.
            case 1:
                //b_HScale: HScale;
                composer.HScale = (128.0 / value);
                composer.b_HScale = value;
                composer.HScaleString = HScales[this.GetHScale(composer.b_HScale)].replace("HorizontalScale_","").replace("_",":");
                break;
            case 2:
                //b_VScale: VScale;
                composer.VScale = (128.0 / value);
                composer.b_VScale = value;
                composer.VScaleString = VScales[this.GetVScale(composer.b_VScale)].replace("VerticalScale_", "").replace("_", ":");
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
            BorderColorData: NewEmptyColor(),
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
            RawDataString: "",

            OutModes: [],
            HScales: [],
            VScales: [],
            valueChanged: () => { },
            CopyToClipBoard: () => { },
        }
    }

    public static ServiceName: ServiceName = { Name: "VideoComposerManager" };
}