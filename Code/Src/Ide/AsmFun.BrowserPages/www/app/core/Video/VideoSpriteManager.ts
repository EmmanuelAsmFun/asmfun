import { IVideoLayerData, IVideoSettings, IVideoManagerData, IVideoColor, IVideoSpriteProperties, X16SpriteModes, ISpritesData } from "../../data/VideoData.js";
import { ServiceName } from "../../serviceLoc/ServiceName.js";
import { IMemoryDump } from "../../data/ComputerData.js";
import { AsmTools } from "../../Tools.js";
import { VideoPaletteManager } from "./VideoPaletteManager.js";
import { DebuggerService } from "../../services/DebuggerService.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

export class VideoSpriteManager {

    private numberOfHorizontalSprites = 16;
    private usedSprites = 0;
    private videoSettings?: IVideoSettings;
    private videoManagerData?: IVideoManagerData;
    private debuggerService?: DebuggerService;
    private requestReloadMemory?: () => void;
    private htmlDragables: DragableSprite[] = new Array(512);

    public Init(videoManagerData: IVideoManagerData, debuggerService: DebuggerService, requestReloadMemory: () => void) {
        this.videoSettings = videoManagerData.settings;
        this.videoManagerData = videoManagerData;
        this.debuggerService = debuggerService;
        this.requestReloadMemory = requestReloadMemory;
    }

    public Reset() {
        if (this.videoManagerData == null) return;
        this.videoManagerData.spriteDatas.selectedSprite = null;
        this.videoManagerData.spriteDatas.selectedSpriteIndex = 0;
    }

    public Parse(memDump: IMemoryDump, data: Uint8Array) {
        if (this.videoSettings == null) return;
        if (this.videoManagerData == null) return;
        var thiss = this;
        var spData = this.videoManagerData.spriteDatas;
        spData.startAddress = AsmTools.numToHex5(memDump.startAddress);
        spData.endAddress = AsmTools.numToHex5(memDump.endAddressForUI);
       
        var sprites: IVideoSpriteProperties[] = [];
        for (var i = 0; i < this.videoSettings.NumberOfSprites; i++) {
            const dataAr = data.subarray(i * 8, i * 8 + 8);
            var spriteData = this.RefreshSpriteAttributes(i, dataAr);
            if (spriteData.SpriteAddress == 0) {
                this.usedSprites = i -1;
                break;
            }
            spriteData.Modes = AsmTools.EnumToArray(X16SpriteModes);
            spriteData.valueChanged = v => {
                if (this.videoManagerData != null && this.videoManagerData.spriteDatas.selectedSprite != null) {
                    const spr = this.videoManagerData.spriteDatas.selectedSprite;
                    let data2 = this.RecalculateArray(spr);
                    spr.RawDataString = AsmTools.ArrayToHexString(data2);
                    if (this.debuggerService != null)
                        this.debuggerService.WriteVideoMemoryBlock(memDump.startAddress + spr.SpriteIndex * 8, data2, data2.length, () => { });
                    this.ParseData(spr, data2);
                    if (this.requestReloadMemory != null)
                        this.requestReloadMemory();
                }
            };
            spriteData.CopyToClipBoard = () => {
                if (this.videoManagerData == null || this.videoManagerData.spriteDatas.selectedSprite == null) return;
                AsmTools.CopyToClipBoard(this.videoManagerData.spriteDatas.selectedSprite.RawDataString);
            }
            sprites.push(spriteData);
        }
        spData.sprites = sprites;
        spData.changeSprite = delta => {
            var newWantedSprited = spData.selectedSpriteIndex + delta;
            if (newWantedSprited < 0) newWantedSprited = 0;
            if (newWantedSprited >= spData.sprites.length)return;
            spData.selectedSpriteIndex = newWantedSprited;
            spData.selectedSprite = spData.sprites[newWantedSprited];
        };
        var spriteWidth = 0;
        var spriteHeight = 0;
        if (spData.sprites.length > 0) {
            spriteWidth = spData.sprites[0].Width;
            spriteHeight = spData.sprites[0].Height;
        }
        spData.selectByImage = evt => {
            var index = Math.floor(evt.offsetX / spriteWidth) + Math.floor(evt.offsetY / spriteHeight) * thiss.numberOfHorizontalSprites;
            // console.log(evt.offsetX, evt.offsetY, index);
            if (index < 0) return
            if (index >= spData.sprites.length) return;
            thiss.SelectSprite(spData.sprites[index]);
        }
        this.SelectSprite(sprites[spData.selectedSpriteIndex]);
    }
    private SelectSprite(sprite: IVideoSpriteProperties) {
        if (this.videoManagerData == null) return;
        this.videoManagerData.spriteDatas.selectedSprite = sprite;
        this.videoManagerData.spriteDatas.selectedSpriteIndex = this.videoManagerData.spriteDatas.sprites.indexOf(sprite);
    }

    private RecalculateArray(sprite: IVideoSpriteProperties) {
        sprite.Mode = X16SpriteModes[sprite.ModeString];
        var address = parseInt(sprite.SpriteAddressHex,16);
        var data: Uint8Array = new Uint8Array(8);
        data[0] = (address >>5) & 0xff;
        data[1] = ((address >> 13) & 0xf) | (sprite.Mode == X16SpriteModes.Bpp8 ? 1 : 0) << 7;
        data[2] = (sprite.X & 0xff);
        data[3] = ((sprite.X >> 8) & 0xff);
        data[4] = (sprite.Y & 0xff);
        data[5] = ((sprite.Y >> 8) & 0xff);
        data[6] = (sprite.HFlip ? 1 : 0) | ((sprite.VFlip ? 1 : 0) << 1) | ((sprite.ZDepth & 3) << 2) | ((sprite.CollisionMask & 0x0f) << 4);
        data[7] = ((Math.log2(sprite.Width) - 3) << 4) | ((Math.log2(sprite.Height) - 3) << 6) | ((sprite.PaletteOffset >> 4) & 0x0f);
        return data;
    }

    private RefreshSpriteAttributes(spriteIndex: number, newData: Uint8Array): IVideoSpriteProperties {
        var thiss = this;
        var props = VideoSpriteManager.NewSpriteData();
        props.SpriteIndex = spriteIndex;
        this.ParseData(props, newData);
        return props;
    }
    private ParseData(props: IVideoSpriteProperties, newData: Uint8Array): IVideoSpriteProperties {
        
        props.RawDataString = AsmTools.ArrayToHexString(newData);
        props.name = "Sprite_" + (props.SpriteIndex+1);
        props.select = (s) => { this.SelectSprite(s); };
        // Offset 0 : BIT 1 - 8 | Offset 1 : BIT 0- 3
        props.SpriteAddress = (newData[0] << 5 | (newData[1] & 0xf) << 13);
        props.SpriteAddressHex = AsmTools.numToHex5(props.SpriteAddress);
        // Offset 1 : BIT 7
        props.Mode = ((newData[1] >> 7) & 1) == 1 ? X16SpriteModes.Bpp8 : X16SpriteModes.Bpp4;
        props.ModeString = X16SpriteModes[props.Mode];
        props.Bpp = props.Mode == X16SpriteModes.Bpp8 ? 8 : 4;
        // Offset 2: BIT 0  - 7 | Offset 3 : BIT 1 2
        props.X = (newData[2] | (newData[3] & 3) << 8);
        // Offset 4: BIT 0  - 7 | Offset 5 : BIT 1 2
        props.Y = (newData[4] | (newData[5] & 3) << 8);
        // Offset 6 : BIT 0
        props.HFlip = (newData[6] & 1) == 1;
        // Offset 6 : BIT 1
        props.VFlip = ((newData[6] >> 1) & 1) == 1;
        // Offset 6: BIT 3,2
        props.ZDepth = ((newData[6] >> 2) & 3);
        // Offset 6 : BIT 4-7
        props.CollisionMask = ((newData[6] & 0x0f) >> 4);
        // Offset 7 : BIT 0-3
        props.PaletteOffset = (newData[7] & 0x0f) << 4;
        // Offset 7 : BIT 4,5
        props.Width = (1 << (((newData[7] >> 4) & 3) + 3));
        // Offset 7 : BIT 6,7
        props.Height = (1 << ((newData[7] >> 6) + 3));


        // Fix up negative coordinates
        if (props.X >= 0x400 - props.Width)
            props.X |= (0xff00 - 0x200);
        if (props.Y >= 0x200 - props.Height)
            props.Y |= (0xff00 - 0x100);
        return props;
    }

    public DrawSprites(ramData: Uint8Array, palette: VideoPaletteManager) {
        
        var thiss = this;
        setTimeout(() => {
            if (thiss.videoManagerData == null) return;
            if (thiss.videoSettings == null) return;
            if (thiss.videoManagerData.spriteDatas.sprites.length === 0) return;
            var spriteHolder = document.getElementById("spriteHolder");

            var canvas = <any>document.getElementById("spriteCanvas");
            if (canvas == null) return;
            var firstSprite = thiss.videoManagerData.spriteDatas.sprites[0];
            thiss.numberOfHorizontalSprites = Math.floor(canvas.width / firstSprite.Width);
            var height = Math.ceil(thiss.videoManagerData.spriteDatas.sprites.length / this.numberOfHorizontalSprites) * firstSprite.Height;
            var length = ramData.length;
            var context = canvas.getContext("2d");
            canvas.height = height;
            var vIndex = 0;
            var hIndex = 0;
            for (var spriteIndex = 0; spriteIndex < thiss.videoManagerData.spriteDatas.sprites.length; spriteIndex++) {
                const sprite: IVideoSpriteProperties = thiss.videoManagerData.spriteDatas.sprites[spriteIndex];
                if (sprite.SpriteAddress == 0) break;
                let spriteHtml = spriteHolder?.children[spriteIndex] as HTMLCanvasElement;
                if (spriteHtml == null && spriteHolder != null) {
                    spriteHtml = document.createElement("canvas") as HTMLCanvasElement;
                    spriteHtml.style.position = "absolute";
                    this.htmlDragables[spriteIndex] = new DragableSprite(spriteHtml, sprite,s => thiss.SelectSprite(s));
                    spriteHolder.appendChild(spriteHtml);
                }
                this.htmlDragables[spriteIndex].UpdateSprite(sprite);
                if (sprite.X > thiss.videoSettings.Width || sprite.Y > thiss.videoSettings.Height)
                    spriteHtml.style.display = "none";
                else
                    spriteHtml.style.display = "block";
                spriteHtml.style.left = sprite.X + "px";
                spriteHtml.style.top = sprite.Y + "px";
                spriteHtml.width = sprite.Width;
                spriteHtml.height = sprite.Height;
                spriteHtml.style.height = sprite.Height + "px";
                spriteHtml.style.height = sprite.Height + "px";
                var contextSprite2D = spriteHtml.getContext("2d");
                var imagedata = context.createImageData(sprite.Width, sprite.Height);
                var imageData2D = contextSprite2D?.createImageData(sprite.Width, sprite.Height);
                if (imageData2D == null) continue;
                if (sprite.SpriteAddress < length) {
                    var data = ramData.subarray(sprite.SpriteAddress, sprite.SpriteAddress + (sprite.Width * sprite.Height));
                   
                    var i = -1;
                    for (var y = 0; y < sprite.Height; y++) {
                        for (var x = 0; x < sprite.Width; x++) {
                            i++;
                            var color = palette.GetColor(data[i] + sprite.PaletteOffset);
                            if (color == null) continue;
                            var pixelindex = (y * sprite.Width + x) * 4;
                            // Preview Image
                            imagedata.data[pixelindex] = color.r;     // Red
                            imagedata.data[pixelindex + 1] = color.g; // Green
                            imagedata.data[pixelindex + 2] = color.b;  // Blue
                            imagedata.data[pixelindex + 3] = data[i] > 0 ? 255 : 0;   // Alpha 

                            imageData2D.data[pixelindex] = color.r;     // Red
                            imageData2D.data[pixelindex + 1] = color.g; // Green
                            imageData2D.data[pixelindex + 2] = color.b;  // Blue
                            imageData2D.data[pixelindex + 3] = data[i] > 0 ? 255 : 0;   // Alpha
                        }
                    }
                }
                
                context.putImageData(imagedata, sprite.Width * hIndex, sprite.Height * vIndex);
                if (contextSprite2D != null && imageData2D != null)
                    contextSprite2D.putImageData(imageData2D, 0,0);
                
                hIndex++;
                if (hIndex == thiss.numberOfHorizontalSprites) {
                    hIndex = 0;
                    vIndex++;
                }
            }
        }, 10);
    }
  

    public static NewData(): ISpritesData {
        return {
            startAddress: "",
            endAddress: "",
            sprites: [],
            selectedSprite: null,
            selectedSpriteIndex:0,
            changeSprite: (delta) => { },
            selectByImage: () => { },
        }
    }
    public static NewSpriteData(): IVideoSpriteProperties {
        return {
            RawDataString: "",
            CollisionMask: 0,
            Height: 0,
            HFlip: false,
            VFlip: false,
            Mode: X16SpriteModes.Bpp4,
            ModeString: "Bpp4",
            Bpp:4,
            PaletteOffset:0,
            SpriteIndex: 0,
            SpriteAddress: 0,
            SpriteAddressHex:"",
            Width: 0,
            X: 0,
            Y: 0,
            ZDepth: 0,
            select: () => { },
            
            name: "",
            valueChanged: () => { },
            CopyToClipBoard: () => { },
            Modes: [],

        };
    }
    public static ServiceName: ServiceName = { Name: "VideoSpriteManager" };
}

class DragableSprite {
   

    private dragging = false;
    private mouseDownPositionX = 0;
    private mouseDownPositionY = 0;
    private elementOriginalLeft = 0;
    private elementOriginalTop = 0;
    private element: HTMLElement;
    private sprite: IVideoSpriteProperties;
    private selectSpriteM: (s: IVideoSpriteProperties) => void;

    constructor(element, sprite: IVideoSpriteProperties, selectSpriteM: (s: IVideoSpriteProperties) => void) {
        this.dragging = false;
        this.mouseDownPositionX = 0;
        this.mouseDownPositionY = 0;
        this.elementOriginalLeft = 0;
        this.elementOriginalTop = 0;
        this.element = element;
        this.sprite = sprite;
        this.selectSpriteM = selectSpriteM;
        this.element.onmousedown = e => this.startDrag(e);
        this.element.onmouseup = e => this.stopDrag(e);
        window.addEventListener('onmousedown', d => this.unsetMouseMove());
    }

    private startDrag(e) {
        e.preventDefault();
        this.dragging = true;
        this.mouseDownPositionX = e.clientX;
        this.mouseDownPositionY = e.clientY;
        this.elementOriginalLeft = parseInt(this.element.style.left);
        this.elementOriginalTop = parseInt(this.element.style.top);
        // set mousemove event
        window.addEventListener('mousemove', d => this.dragElement(d));
        this.selectSpriteM(this.sprite);
    }

    private unsetMouseMove() {
        // unset mousemove event
        window.removeEventListener('mousemove', d => this.dragElement(d));
    }
    private stopDrag(e) {
        e.preventDefault();
        this.dragging = false;
        this.unsetMouseMove();
    }
    private dragElement(e) {
        if (!this.dragging)
            return;
        e.preventDefault();
        // move element
        this.sprite.X = this.elementOriginalLeft + (e.clientX - this.mouseDownPositionX);
        this.sprite.Y = this.elementOriginalTop + (e.clientY - this.mouseDownPositionY);
        this.element.style.left = this.sprite.X + 'px';
        this.element.style.top = this.sprite.Y + 'px';
    }
    public UpdateSprite(sprite: IVideoSpriteProperties) {
        this.sprite = sprite;
    }
}

