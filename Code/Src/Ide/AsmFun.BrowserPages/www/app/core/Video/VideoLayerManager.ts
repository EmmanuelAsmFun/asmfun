import { IVideoLayerData, IVideoSettings, IVideoManagerData, IVideoRenderLineContext, IVideoMapTile, IVideoDisplayComposer, LayerModes, NewTile, NewContext, NewVideoLayer, IVideoLayerManagerData, NewVideoLayerManagerData } from "../../data/VideoData.js";
import { ServiceName } from "../../serviceLoc/ServiceName.js";
import { IMemoryDump } from "../../data/ComputerData.js";
import { AsmTools, ASMStorage } from "../../Tools.js";
import { VideoPaletteManager } from "./VideoPaletteManager.js";
import { DebuggerService } from "../../services/DebuggerService.js";
import { ProjectManager } from "../ProjectManager.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

export class VideoLayerManager {
    private static StorageLayerData = "StorageLayerData";
    private firstLoad:boolean = true;
    private videoHeight: number = 0;
    private videoWidth: number = 0 ;
    private videoSettings?: IVideoSettings;
    private videoManagerData?: IVideoManagerData;
    private debuggerService?: DebuggerService;
    private layerDatas: IVideoLayerManagerData = NewVideoLayerManagerData();
    private projectManager?: ProjectManager;
    private layers: IVideoLayerData[] = [NewVideoLayer(0), NewVideoLayer(1)];

    public Init(videoManagerData: IVideoManagerData, debuggerService: DebuggerService, projectManager: ProjectManager) {
        this.videoSettings = videoManagerData.settings;
        this.videoHeight = videoManagerData.settings.Height;
        this.videoWidth = videoManagerData.settings.Width;
        this.videoManagerData = videoManagerData;
        this.debuggerService = debuggerService;
        this.projectManager = projectManager;
    }


    public Parse(layerIndex:number, memDump: IMemoryDump, data: Uint8Array) {
        if (this.videoManagerData == null) return;
        var thiss = this;
        if (this.firstLoad) {
            this.StoreLoad();
            this.firstLoad = false;
        }
        // store previous layerInfo
        this.StorePreviousLayerInfo();
        const vidLayer = this.Reload(layerIndex,data);
        this.layers[vidLayer.LayerIndex] = vidLayer;
       
        vidLayer.name = memDump.name;
        vidLayer.startAddress = AsmTools.numToHex5(memDump.startAddress);
        vidLayer.endAddress = AsmTools.numToHex5(memDump.endAddressForUI);
        vidLayer.RawDataString = AsmTools.ArrayToHexString(data.subarray(0, 9));
        vidLayer.valueChanged = v => {
            //alert("oo");
            let data = this.RecalculateArray(vidLayer);
            vidLayer.RawDataString = AsmTools.ArrayToHexString(data.subarray(0, 9));
            if (this.debuggerService != null)
                this.debuggerService.WriteVideoMemoryBlock(memDump.startAddress, data, data.length, () => { });
            this.ParseData(vidLayer, data);
        };
        vidLayer.CopyToClipBoard = () => AsmTools.CopyToClipBoard(vidLayer.RawDataString);
        this.videoManagerData.layers.push(vidLayer);
        vidLayer.Modes = AsmTools.EnumToArray(LayerModes).map(x => x.replace(/_/g, " ") + " bpp");

       

        this.StoreNewLayerInfo(vidLayer);
        return vidLayer;
    }

 

    private RecalculateArray(vidLayer: IVideoLayerData) {
        // Set enum strings back to numeric
        vidLayer.Mode = LayerModes[vidLayer.ModeString.replace(/ /g, "_").replace("_bpp","")];

        var data: Uint8Array = new Uint8Array(10);
        data[0] = (vidLayer.IsEnabled ? 1 : 0) | (vidLayer.Mode << 5);
        if (!vidLayer.BitmapMode)
            data[1] = (Math.log2(vidLayer.MapWidth) - 5) | ((Math.log2(vidLayer.MapHeight) - 5) << 2) | ((Math.log2(vidLayer.TileWidth) - 3) << 4) | ((Math.log2(vidLayer.TileHeight) - 3) << 5)
        else
            data[1] = vidLayer.TileWidth == 640 ? 1 : 0
        
        if (vidLayer.MapBaseHex != null && vidLayer.MapBaseHex.length > 0) {
            var num = parseInt(vidLayer.MapBaseHex, 16);
            data[2] = (num >> 2) & 0xff;
            data[3] = (num >> 10) & 0xff;
        }
        if (vidLayer.TileBaseHex != null && vidLayer.TileBaseHex.length > 0) {
            var num = parseInt(vidLayer.TileBaseHex, 16);
            data[4] = (num >> 2) & 0xff;
            data[5] = (num >> 10) & 0xff;
        }
        data[6] = (vidLayer.HorizontalScroll) & 0xff;
        if (vidLayer.BitmapMode)
            data[7] = vidLayer.PaletteOffset & 0xff;
        else
            data[7] = ((vidLayer.HorizontalScroll >> 8) & 0xf) ;
        data[8] = (vidLayer.VerticalScroll) & 0xff;
        data[9] = (vidLayer.VerticalScroll >> 8) & 0xf;
        return data;
    }

    public Reload(layerIndex: number,layerData: Uint8Array): IVideoLayerData {

        var props: IVideoLayerData = NewVideoLayer(layerIndex);
        
        return this.ParseData(props, layerData);
    }

    private ParseData(props: IVideoLayerData, layerData: Uint8Array) {
        if (this.videoSettings == null) return props;
        // X can be 2 or 3, representing Layer 0 or Layer 1, respectively, 
        // the following memory-mapped addresses control display layer behavior:

        // $0F:$X000 - Layer modes and enable flag
        // The least significant bit of $04:$00X0 is an enable bit. If set (1), the layer is drawn. 
        // If reset (0), the layer is not drawn.
        // BIT 0
        props.IsEnabled = (layerData[0] & 1) != 0;

        // The 3 most significant bits of $04:$00X0 represent the layer’s “mode” setting.
        // BIT 5,6,7
        props.Mode = Number(layerData[0] >> 5);
        

        // MAP_BASE specifies the base address where tile map data is fetched from. 
        // (Note that the registers don’t specify the lower 2 bits, so the address is always aligned to a multiple of 4 bytes.)
        props.MapBase = (layerData[2] << 2 | layerData[3] << 10);
        props.MapBaseHex = AsmTools.numToHex5(props.MapBase);

        // TILE_BASE specifies the base address where tile data is fetched from. (Note that the registers don’t specify the 
        // lower 2 bits, so the address is always aligned to a multiple of 4 bytes.)
        props.TileBase = (layerData[4] << 2 | layerData[5] << 10);
        props.TileBaseHex = AsmTools.numToHex5(props.TileBase);

        // Text and Tile mode settings
        // $0F:$X001 - Text and Tile format
        props.TextMode = (props.Mode == 0) || (props.Mode == 1);
        props.TileMode = (props.Mode == 2) || (props.Mode == 3) || (props.Mode == 4);
        props.BitmapMode = (props.Mode == 5) || (props.Mode == 6) || (props.Mode == 7);
        props.ModeString = LayerModes[props.Mode].replace(/_/g, " ") + " bpp";

        if (!props.BitmapMode) {
            // HSCROLL specifies the horizontal scroll offset. A value between 0 and 4095 can be used. 
            // Increasing the value will cause the picture to move left, decreasing will cause the picture to move right.
            props.HorizontalScroll = (layerData[6] | (layerData[7] & 0xf) << 8);
            // YSCROLL specifies the vertical scroll offset. A value between 0 and 4095 can be used. 
            // Increasing the value will cause the picture to move up, decreasing will cause the picture to move down.
            props.VerticalScroll = (layerData[8] | (layerData[9] & 0xf) << 8);
        }
        // MAPW, MAPH specify the map width and map height respectively:
        // 0 = 32 tiles, 1 = 64 tiles, 2 = 128 tiles, 3 = 256 tiles
        props.MapWidth = 0;
        props.MapHeight = 0;
        // TILEW, TILEH specify the tile width and tile height respectively:
        // 0 = 8px, 1 = 16px
        props.TileWidth = 0;
        props.TileHeight = 0;

        // $0F:$X001 contains the tilemap settings for layer X, in the format %00ABCCDD:
        if (props.TileMode || props.TextMode) {
            // DD : 2 bits to adjust tilemap width.
            props.MapWidth = (1 << ((layerData[1] & 3) + 5));
            // CC: 2 bits to adjust tilemap height.
            props.MapHeight = (1 << (((layerData[1] >> 2) & 3) + 5));
            // Scale the tiles or text characters arccording to TILEW and TILEH.
            // B: 1 bit to enable 16-pixel tile width. Ignored in text modes.
            props.TileWidth = (1 << (((layerData[1] >> 4) & 1) + 3));
            // A: 1 bit to enable 16-pixel tile height. Ignored in text modes.
            props.TileHeight = (1 << (((layerData[1] >> 5) & 1) + 3));
            // 0 : Unused.
        }
        else if (props.BitmapMode) {
            // Bitmap mode is tiled mode with a single tile
            props.TileWidth = (((layerData[1] >> 4) & 1) != 0 ? 640 : 320);
            props.TileHeight = this.videoHeight;
        }

        // We know mapw, maph, tilew, and tileh are powers of two, and any products of that set will be powers of two,
        // so there's no need to modulo against them if we have bitmasks we can bitwise-and against.

        props.MapWidthMax = (props.MapWidth - 1);
        props.MapHeightMax = (props.MapHeight - 1);
        props.TileWidthMax = (props.TileWidth - 1);
        props.TileHeightMax = (props.TileHeight - 1);

        props.LayerWidth = (props.MapWidth * props.TileWidth);
        props.LayerHeight = (props.MapHeight * props.TileHeight);

        props.LayerWidthMax = (props.LayerWidth - 1);
        props.LayerHeightMax = (props.LayerHeight - 1);

        props.BitsPerPixel = 0;
        switch (props.Mode) {
            case 0:
            case 1:
                props.BitsPerPixel = 1;
                break;
            case 2:
            case 5:
                props.BitsPerPixel = 2;
                break;
            case 3:
            case 6:
                props.BitsPerPixel = 4;
                break;
            case 4:
            case 7:
                props.BitsPerPixel = 8;
                break;
        }
        // Find min/max eff_x for bulk reading in tile data during draw.
        var min_eff_x = Number.MAX_VALUE;
        var max_eff_x = Number.MIN_VALUE;
        for (var x = 0; x < this.videoSettings.Width; ++x) {
            var eff_x = this.CalcLayerEffX(props, x);
            if (eff_x < min_eff_x) {
                min_eff_x = eff_x;
            }
            if (eff_x > max_eff_x) {
                max_eff_x = eff_x;
            }
        }
        props.min_eff_x = Math.round(min_eff_x);
        props.max_eff_x = Math.round( max_eff_x);
        
        props.TileSize = ((props.TileWidth * props.BitsPerPixel * props.TileHeight) >> 3);
        if (props.BitmapMode)
            props.PaletteOffset = (layerData[7] & 0xf); 
        return props;
    }



   

    public RenderLayer(ram: Uint8Array, layer: IVideoLayerData, palette: VideoPaletteManager) {
        var thiss = this;
        // we need to set a timeout to be able to retrieve the canvas
        setTimeout(() => {
            if (this.videoSettings == null) return;
            if (this.videoManagerData == null) return;
            if (!layer.IsEnabled) return;
            var w = this.videoSettings.Width;
            var h = this.videoSettings.Height;
            var canvas = <HTMLCanvasElement>document.getElementById(layer.name + "Canvas");
            var canvasFS = <HTMLCanvasElement>document.getElementById(layer.name + "CanvasFS");
            
            if (canvas == null || canvasFS == null) return;
            var context = canvas.getContext("2d");
            var contextFS = canvasFS.getContext("2d");
            if (context == null || contextFS == null) return;
            context.fillStyle = "#333";
            context.fillRect(0, 0, canvas.width, canvas.height);
            var colIndexs = new Int8Array(w*h);
            var imagedata = context.createImageData(w, h);
            var renderContext: IVideoRenderLineContext = NewContext(ram, layer, w);
            for (var y = 0; y < h; y++) {
                renderContext.y = y;
                this.RenderLayerLine(renderContext, imagedata, palette, this.videoManagerData.composer, colIndexs);
            }
            // AsmTools.SaveDataToFile(colIndexs, "layer" + layer.name+".bin");
            context.putImageData(imagedata, 0,0);
            contextFS.putImageData(imagedata, 0, 0);
            var maxHTiles = this.RenderTiles(ram, layer, palette);
            if (maxHTiles > 0) {
                layer.SelectTileByImage = evt => {
                    var index = Math.floor(evt.offsetX / layer.TileWidth) + Math.floor(evt.offsetY / layer.TileHeight) * maxHTiles;
                    // console.log(evt.offsetX, evt.offsetY, index);
                    if (index < 0) return
                    if (index >= 512) return;
                    layer.selectedTileIndex = index;
                };
            }
        }, 50);
    }

    private RenderTiles(ram: Uint8Array, layer: IVideoLayerData, palette: VideoPaletteManager):number {
        if (layer.BitmapMode || !layer.IsEnabled) return 0;
       

        var canvas = <HTMLCanvasElement>document.getElementById(layer.name + "Tiles");
        var context = canvas.getContext("2d");
        if (context == null) return 0;
        var w = layer.TileWidth;
        var h = layer.TileHeight;
        var numTiles = 1024 * 32 / (w * h);
        var maxHTiles = Math.floor(canvas.width / w);
        console.log("NumTiles:" + numTiles, layer.name);
        var strideX = maxHTiles * w;
        var tileXIndex = 0;
        var tileYIndex = 0;
        var colorIndexes = new Uint8Array(w * h * numTiles);
        var imagedata = context.createImageData(w * maxHTiles, h * 5);
        var index = 0;
        for (let tileIndex = 0; tileIndex < numTiles; tileIndex++) {
            var tileSize = tileIndex * h * w;
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    var color = 0;
                    var indexOff = Math.floor(index / (8 / layer.BitsPerPixel));
                    //if (layer.TextMode) {
                    //    var indexOff = Math.floor(index / (8 / layer.BitsPerPixel));
                    //    color = ram[layer.TileBase + indexOff]
                    //}
                    //else if (layer.TileMode) {
                    //    color = ram[layer.TileBase + indexOff];
                    //}
                    color = ram[layer.TileBase + indexOff];
                    var colorIndex = this.BitsPerPxlCalculation(layer.BitsPerPixel, 1, 0, color, x);
                    colorIndexes[index] = colorIndex;
                    //console.log(index,colorIndex);
                    var colorp = palette.GetColor(colorIndex);
                    if (colorp == null)
                        colorp = palette.GetColor(0);
                    
                    var pixelindex = (x + y * strideX + tileXIndex*w+ (tileYIndex * h * strideX)) * 4;
                    imagedata.data[pixelindex + 0] = colorp.r;     // Red
                    imagedata.data[pixelindex + 1] = colorp.g; // Green
                    imagedata.data[pixelindex + 2] = colorp.b;  // Blue
                    imagedata.data[pixelindex + 3] = 0xff;   // Alpha
                    index++;
                }
            }
            
            tileXIndex++;
            if (tileXIndex == maxHTiles) {
                tileXIndex = 0;
                tileYIndex ++;
            }
        }
        context.putImageData(imagedata, 0, 0);
       //  ASMStorage.SaveDataToFile(colorIndexes,"Tile.bin");
        return maxHTiles;
    }

    private RenderLayerLine(context: IVideoRenderLineContext, imagedata: any, palette: VideoPaletteManager, composer: IVideoDisplayComposer, colIndexes: Int8Array) {
        var layer = context.layer;
        // todo : add composer data
        //var y = (composer.b_VScale *Math.floor( (context.y - composer.VStart) / 128));
        var y = context.y;
        this.ReadSpaceReadRange(context);
        //console.log(context.y, context.map_addr_begin);
        for (var x = 0; x < context.width; x++)
        {
            var colorIndex = 0;
            var realX = x;
            var realY = y;
            var newX = 0;
            var newY = 0;
            var tileStart = 0;
            var tile: IVideoMapTile | null= null;

            if (!layer.BitmapMode) {
                realX = this.CalcLayerEffX(layer, x);
                realY = this.CalcLayerEffY(layer, y);
                newX = realX & layer.TileWidthMax;
                newY = realY & layer.TileHeightMax;
                context.mapAddress = this.CalcLayerMapAddress(layer, realX, realY) - context.map_addr_begin;

                tile = this.GetTile(context.mapAddress, context.layer, context.tile_bytes);

                // offset within tilemap of the current tile
                tileStart = tile.TileIndex * layer.TileSize;
                if (tile.VerticalFlip)
                    newY = newY ^ layer.TileHeight - 1;
                if (tile.HorizontalFlip)
                    newX = newX ^ layer.TileWidth - 1;
            }
            else {
                newX = realX % layer.TileWidth;
                newY = realY % layer.TileHeight;
            }
            // Additional bytes to reach the correct line of the tile
            var y_add = (newY * layer.TileWidth * layer.BitsPerPixel >> 3);
            // Additional bytes to reach the correct column of the tile
            var x_add = (newX * layer.BitsPerPixel >> 3);
            // Get the offset address of the tile.
            var tile_offset = tileStart + y_add + x_add;
            var color = context.ram[layer.TileBase + tile_offset];
            // Convert tile byte to indexed color
            var colorIndex = 0;
            if (tile != null)
                colorIndex = this.BitsPerPxlCalculation(context.layer.BitsPerPixel, tile.ForegroundColor, tile.BackgroundColor, color, newX);
            else
                colorIndex = this.BitsPerPxlCalculation(context.layer.BitsPerPixel, 0, 0, color, newX);

            // Apply Palette Offset
            if (layer.BitmapMode && colorIndex > 0 && colorIndex < 16 && tile != null)
                colorIndex += (tile.PaletteOffset << 4);
            colIndexes[x + y * context.width] = colorIndex;
            var colorp = palette.GetColor(colorIndex);
            if (colorp == null)
                colorp = palette.GetColor(0);
            var pixelindex = (y * context.width + x) * 4;
            imagedata.data[pixelindex + 0] = colorp.r;     // Red
            imagedata.data[pixelindex + 1] = colorp.g; // Green
            imagedata.data[pixelindex + 2] = colorp.b;  // Blue
            imagedata.data[pixelindex + 3] = 0xff;   // Alpha
        }
    }
    public CalcLayerEffX(props: IVideoLayerData, x: number): number {
        return (x + props.HorizontalScroll) & (props.LayerWidthMax);
    }

    public CalcLayerEffY(layer: IVideoLayerData, y: number): number {
        return (y + layer.VerticalScroll) & (layer.LayerHeightMax);
    }

    public CalcLayerMapAddress(props: IVideoLayerData, eff_x: number, eff_y: number): number {
        if (props.TileWidth == 0 || props.TileHeight == 0) return 0;
        return ((props.MapBase + (Math.floor(eff_y / props.TileHeight) * props.MapWidth + Math.floor(eff_x / props.TileWidth)))  * 2);
    }

    public ReadSpaceReadRange(context: IVideoRenderLineContext) {
        var eff_y = this.CalcLayerEffY(context.layer, context.y);
        context.map_addr_begin = this.CalcLayerMapAddress(context.layer, context.layer.min_eff_x, eff_y);
        context.map_addr_end = this.CalcLayerMapAddress(context.layer, context.layer.max_eff_x, eff_y);
        context.size = ((context.map_addr_end - context.map_addr_begin) + 2);
        context.tile_bytes = context.ram.subarray(context.map_addr_begin, context.map_addr_begin + context.size);
         //console.log(context.map_addr_begin, context.map_addr_end, context.size);
    }
    private BitsPerPxlCalculation(bitsPerPixel:number, foregroundColor: number, backgroundColor:number, color: number, newX: number):number {
        switch (bitsPerPixel) {
            case 1:
                    var bit = (color >> 7 - newX & 1) != 0;
                    var colorIndex = bit ? foregroundColor : backgroundColor;
                    return colorIndex;
            case 2:
                return (color >> 6 - ((newX & 3) << 1) & 3);
            case 4:
                return (color >> 4 - ((newX & 1) << 2) & 0xf);
            case 8:
               return color;
        }
        return 0;
    }

    public GetTile(mapAddress: number, layer: IVideoLayerData, tile_bytes: Uint8Array): IVideoMapTile {
        var tile: IVideoMapTile = NewTile();
        // Get Map info.
        if (layer.BitmapMode) {
            tile.TileIndex = 0;
            tile.PaletteOffset = layer.PaletteOffset;
        }
        else {
            var byte0 = tile_bytes[mapAddress];
            var byte1 = tile_bytes[mapAddress + 1];
            if (layer.TextMode) {
                tile.TileIndex = byte0;

                if (layer.Mode == 0) {
                    tile.ForegroundColor = (byte1 & 15);
                    tile.BackgroundColor = (byte1 >> 4);
                }
                else {
                    tile.ForegroundColor = byte1;
                    tile.BackgroundColor = 0;
                }
                tile.PaletteOffset = 0;
            }
            else if (layer.TileMode) {
                tile.ForegroundColor = 0;
                tile.BackgroundColor = 0;
                tile.TileIndex = (byte0 | ((byte1 & 3) << 8));

                // Tile Flipping
                tile.VerticalFlip = ((byte1 >> 3) & 1) != 0;
                tile.HorizontalFlip = ((byte1 >> 2) & 1) != 0;
                tile.PaletteOffset = (byte1 >> 4);
            }
        }
        return tile;
    }


    private StoreLoad() {
        if (this.projectManager == null) return;
        var dataa = this.projectManager.ProjectGetProp<IVideoLayerManagerData>(VideoLayerManager.StorageLayerData);
        if (dataa == null) return;
        this.layerDatas = dataa;
        this.StoreNewLayerInfo(this.layers[0]);
        this.StoreNewLayerInfo(this.layers[1]);
    }
    public StorePreviousLayerInfo() {
        if (this.projectManager == null) return;
        var changed = false;
        for (var i = 0; i < 2; i++) {
            if (this.layers[i] != null) {
                var vidLayer = this.layers[i];
                if (vidLayer == null) continue;
                var lay = this.layerDatas.Layers[i];
                if (lay.Show !== vidLayer.Show) { lay.Show = vidLayer.Show; changed = true; }
                if (lay.ShowFull !== vidLayer.ShowFull) { lay.ShowFull = vidLayer.ShowFull; changed = true; }
                if (lay.ShowPreview !== vidLayer.ShowPreview) { lay.ShowPreview = vidLayer.ShowPreview; changed = true; }
            }
        }
        if (changed)
            this.projectManager.ProjectSetProp(VideoLayerManager.StorageLayerData, this.layerDatas);
    }
    private StoreNewLayerInfo(vidLayer: IVideoLayerData) {
        var lay = this.layerDatas.Layers[vidLayer.LayerIndex];
        vidLayer.Show = lay.Show;
        vidLayer.ShowFull = lay.ShowFull;
        vidLayer.ShowPreview = lay.ShowPreview;
    }
  
    public static ServiceName: ServiceName = { Name: "VideoLayerManager" };
}
