import { IVideoLayerData, IVideoSettings, IVideoManagerData, IVideoColor, IVideoSpriteProperties, X16SpriteMode, ISpritesData } from "../../data/VideoData.js";
import { ServiceName } from "../../serviceLoc/ServiceName.js";
import { IMemoryDump } from "../../data/ComputerData.js";
import { AsmTools } from "../../Tools.js";
import { VideoPaletteManager } from "./VideoPaletteManager.js";

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

    public Init(videoManagerData: IVideoManagerData) {
        this.videoSettings = videoManagerData.settings;
        this.videoManagerData = videoManagerData;
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
            var spriteData = this.RefreshSpriteAttributes(i, data.subarray(i * 8, i * 8 + 8));
            if (spriteData.SpriteAddress == 0) {
                this.usedSprites = i -1;
                break;
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

    private RefreshSpriteAttributes(spriteIndex:number, newData: Uint8Array): IVideoSpriteProperties {
        var thiss = this;
        var props = VideoSpriteManager.NewSpriteData();
        props.RawDataString = AsmTools.ArrayToHexString(newData);
        props.name = "Sprite_" + (spriteIndex+1);
        props.select = (s) => { thiss.SelectSprite(s); };
        // Offset 0 : BIT 1 - 8 | Offset 1 : BIT 0- 3
        props.SpriteAddress = (newData[0] << 5 | (newData[1] & 0xf) << 13);
        props.SpriteAddressHex = AsmTools.numToHex5(props.SpriteAddress);
        // Offset 1 : BIT 7
        props.Mode = ((newData[1] >> 7) & 1) == 1 ? X16SpriteMode.Bpp8 : X16SpriteMode.Bpp4;
        props.ModeString = X16SpriteMode[props.Mode];
        props.Bpp = props.Mode == X16SpriteMode.Bpp8 ? 8 : 4;
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
        props.palette_offset = ((newData[7] & 0x0f) << 4);
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

    public DrawSprites(ramData: Uint8Array, palette:VideoPaletteManager) {
        var thiss = this;
        setTimeout(() => {
            if (thiss.videoManagerData == null) return;
            if (thiss.videoSettings == null) return;
            if (thiss.videoManagerData.spriteDatas.sprites.length === 0) return;
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
                var sprite: IVideoSpriteProperties = thiss.videoManagerData.spriteDatas.sprites[spriteIndex];
                if (sprite.SpriteAddress == 0) break;
                var imagedata = context.createImageData(sprite.Width, sprite.Height);
                if (sprite.SpriteAddress < length) {
                    var data = ramData.subarray(sprite.SpriteAddress, sprite.SpriteAddress + (sprite.Width + sprite.Height) * (sprite.Bpp+3));
                    var color = palette.GetColor(sprite.palette_offset);
                    var i = -1;
                    for (var y = 0; y < sprite.Height; y++) {
                        for (var x = 0; x < sprite.Width; x++) {
                            i++;
                            if (data[i] == 0) continue;
                            var pixelindex = (y * sprite.Width + x) * 4;
                            imagedata.data[pixelindex] = color.r;     // Red
                            imagedata.data[pixelindex + 1] = color.g; // Green
                            imagedata.data[pixelindex + 2] = color.b;  // Blue
                            imagedata.data[pixelindex + 3] = 255;   // Alpha
                        }
                    }
                }
                context.putImageData(imagedata, sprite.Width * hIndex, sprite.Height * vIndex);
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
            Mode: X16SpriteMode.Bpp4,
            ModeString: "Bpp4",
            Bpp:4,
            palette_offset: 0,
            SpriteAddress: 0,
            SpriteAddressHex:"",
            Width: 0,
            X: 0,
            Y: 0,
            ZDepth: 0,
            select: () => { },
            
            name:"",
        };
    }
    public static ServiceName: ServiceName = { Name: "VideoSpriteManager" };
}