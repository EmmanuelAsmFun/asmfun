// Heavely inspired from https://github.com/commanderx16/x16-emulator

using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Data;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using AsmFun.Computer.Common.Video.Enums;
using System;
using System.Runtime.InteropServices;
using System.Threading;

namespace AsmFun.CommanderX16.Video.Painter
{
    public class X16VideoPainterR34 : IVideoPainter
    {
        private IComputerDisplay display;
        // Copy vars from settings for performance
        private int width;
        private int height;
        private int scanWidth;
        private int scanHeight;
        private double outsideL;
        private double outsideR;
        private double outsideT;
        private double outsideB;
        private bool lockOnProcessor;
        private bool isDisposed = false;

        private bool isRefreshingPainter = false;
        private float scanX;
        private ushort scanY;
        private int frameCount = 0;
        public byte[][] layer_lineV;
        public bool[] LayerLinesEmpty = new bool[2];
        public bool IsPainting { get; protected set; }
        private bool doBreak;
        public static int EXTENDED_FLAG = 0x100;
        private static readonly ushort LAYER_PIXELS_PER_ITERATION = 8;
        byte[] spr_col_index = new byte[LAYER_PIXELS_PER_ITERATION];
        byte[] l1_col_index = new byte[LAYER_PIXELS_PER_ITERATION];
        byte[] l2_col_index = new byte[LAYER_PIXELS_PER_ITERATION];
        byte[] spr_zindex = new byte[LAYER_PIXELS_PER_ITERATION];
        public IntPtr framebuffer; // = new byte[SCREEN_WIDTH * SCREEN_HEIGHT * 4];
        public IntPtr[] layersbuffer = new IntPtr[2];

        private IVideoAccess videoAccess;
        private ISpriteAttributesAccess spriteAccess;
        private IDisplayComposer composer;
        private IVideoPaletteAccess videoPalette;
        private IVideoLayerAccess LayerAccess;
        private IX16VideoMapTileAccess mapTileAccess;
        private X16IOAccess ioAccess;
        private readonly IComputerDiagnose diagnose;

        public X16VideoPainterR34(VideoSettings videoSettings, IVideoAccess videoAccess, IDisplayComposer composer,
            IVideoPaletteAccess videoPalette, IVideoLayerAccess layerAccess, ISpriteAttributesAccess spriteAccess,
            IX16VideoMapTileAccess mapTileAccess, X16IOAccess ioAccess, IComputerDiagnose diagnose)
        {
            X16VideoSettings videoSettings2 = (X16VideoSettings)videoSettings;
            this.videoPalette = videoPalette;
            this.composer = composer;
            this.videoAccess = videoAccess;
            this.spriteAccess = spriteAccess;
            this.mapTileAccess = mapTileAccess;
            this.ioAccess = ioAccess;
            this.diagnose = diagnose;
            LayerAccess = layerAccess;
            width = videoSettings.Width;
            height = videoSettings.Height;
            scanWidth = videoSettings2.ScanWidth;
            scanHeight = videoSettings2.ScanHeight;
            outsideL = width * videoSettings2.TitleSafeX;
            outsideR = width * (1 - videoSettings2.TitleSafeX);
            outsideT = height * videoSettings2.TitleSafeY;
            outsideB = height * (1 - videoSettings2.TitleSafeY);
            framebuffer = Marshal.AllocHGlobal(width * height * 4);
            layersbuffer[0] = Marshal.AllocHGlobal(width * height * 4);
            layersbuffer[1] = Marshal.AllocHGlobal(width * height * 4);
        }

        public void Reset()
        {
            scanX = 0;
            scanY = 0;
            layer_lineV = new byte[][]
                      {
                            new byte[width],
                            new byte[width]
                      };
        }


        private bool processorHasStepped = false;
        public bool ProcessorStep()
        {
            processorHasStepped = true;
            if (lockOnProcessor)
            {
                scanX += composer.StepXAdvance;
                if (scanX > scanWidth)
                {
                    scanX -= scanWidth;
                    StepPaint();
                }
            }
            return true;
        }
        private int step;
        public bool Step()
        {
            if (!lockOnProcessor)
            {
                // Todo: is this required?
                //if (!processorHasStepped)
                //{
                //    while (!processorHasStepped && !isDisposed)
                //    { }
                //}
                processorHasStepped = false;
                return StepPaint();
            }
            else
            {
                Thread.Sleep(5000);
                return false;
            }
        }

        private byte lastBorderColor = 0;
        public bool StepPaint()
        {
            bool isNewFrame = false;
            //if (isRefreshingPainter)
            //{
            //    while (isRefreshingPainter && !isDisposed)
            //        Thread.Sleep(20);
            //}
            step++;
            IsPainting = true;
            ushort y = (ushort)(scanY - composer.FrontPorch);
            if (y < height)
            {
                RenderLine(y);
            }
            scanY++;
            if (scanY == scanHeight)
            {
                scanY = 0;
                isNewFrame = true;
                var isNewBg = lastBorderColor != composer.BorderColor;
                if (isNewBg)
                {
                    var col = videoPalette.GetFromPalette(composer.BorderColor);
                    // var byts = BitConverter.GetBytes(col);
                    var fillLine = new byte[width * 4];
                    var fillLineInt = new int[width];
                    for (int i = 0; i < width; i++)
                        fillLineInt[i] = col;
                    Buffer.BlockCopy(fillLineInt, 0, fillLine, 0, fillLine.Length);
                    //for (int i = 0; i < fillLineInt.Length; i++)
                    //{
                    //    fillLine[(i * 4)] = byts[0];
                    //    fillLine[(i * 4) + 1] = byts[1];
                    //    fillLine[(i * 4) + 2] = byts[2];
                    //}
                    for (int i = 0; i < height; i++)
                        Marshal.Copy(fillLine, 0, framebuffer + i * width * 4, width * 4);

                    lastBorderColor = composer.BorderColor;
                }
                //display.RequestRedrawLayer(layersbuffer, LayerAccess.GetLayers());
                //ioAccess.FramePainted();
                display.Paint(framebuffer, isNewBg);
                frameCount++;
            }

            if (ioAccess.IsIrqLine())
            {
                y = (ushort)(scanY - composer.FrontPorch);
                if (y < height && y == composer.IrqLine)
                    ioAccess.SetIrqLine();
            }
            IsPainting = false;

            //while (doBreak)
            //    Thread.Sleep(2);

            return isNewFrame;
        }


        private void RenderLine(ushort y)
        {
            ushort eff_y = (ushort)(composer.b_VScale * (y - composer.VStart) / 128);
            RenderLayerLine(0, eff_y, layersbuffer[0]);
            RenderLayerLine(1, eff_y, layersbuffer[1]);


            if (composer.OutMode != 0)
                videoPalette.RefreshIfNeeded(composer.OutMode, composer.ChromaDisable);


            var out_mode = composer.OutMode;
            byte border_color = composer.BorderColor;
            ushort hstart = composer.HStart;
            ushort hstop = composer.HStop;
            ushort vstart = composer.VStart;
            ushort vstop = composer.VStop;
            byte[] col_line = new byte[width];
            // If video output is enabled, calculate color indices for line.
            if (out_mode != 0)
            {
                // Calculate color without border.
                for (ushort x = 0; x < width; x += LAYER_PIXELS_PER_ITERATION)
                {
                    byte[] col_index = new byte[LAYER_PIXELS_PER_ITERATION];

                    if (composer.HScale != 1)
                    {
                        // Scaled
                        int[] eff_x = new int[LAYER_PIXELS_PER_ITERATION];
                        for (int i = 0; i < LAYER_PIXELS_PER_ITERATION; ++i)
                            eff_x[i] = (composer.b_HScale * (x + i - hstart)) / 128;

                        if (!LayerLinesEmpty[0])
                        {
                            for (int i = 0; i < LAYER_PIXELS_PER_ITERATION; ++i)
                                l1_col_index[i] = layer_lineV[0][eff_x[i]];
                        }

                        if (!LayerLinesEmpty[1])
                        {
                            for (int i = 0; i < LAYER_PIXELS_PER_ITERATION; ++i)
                                l2_col_index[i] = layer_lineV[1][eff_x[i]];
                        }
                    }
                    else
                    {
                        // No scale, more performant because we can copy bytes
                        if (!LayerLinesEmpty[0])
                            Array.Copy(layer_lineV[0], x, l1_col_index, 0, LAYER_PIXELS_PER_ITERATION);
                        if (!LayerLinesEmpty[1])
                            Array.Copy(layer_lineV[1], x, l2_col_index, 0, LAYER_PIXELS_PER_ITERATION);
                    }

                    for (int i = 0; i < LAYER_PIXELS_PER_ITERATION; ++i)
                    {
                        col_index[i] = l2_col_index[i] != 0 ? l2_col_index[i] : l1_col_index[i];
                        col_line[x + i] = col_index[i];
                    }
                }

                // Add border after if required.
                if (hstart > 0 || hstop < width || vstart > 0 || vstop < height)
                {
                    for (ushort x = 0; x < width; x++)
                    {
                        if (x < hstart || x > hstop || y < vstart || y > vstop)
                            col_line[x] = border_color;
                    }
                }
            }
            // Look up all color indices.
            var framebuffer4_begin = framebuffer + (y * width * 4);
            {
                var framebuffer4 = framebuffer4_begin;
                for (ushort x = 0; x < width; x++)
                {
                    Marshal.WriteInt32(framebuffer4, videoPalette.GetFromPalette(col_line[x]));
                    framebuffer4 = framebuffer4 + 4;
                }
            }


            // NTSC overscan
            if (out_mode == VideoOutModes.NTSC)
            {
                var framebuffer4 = framebuffer4_begin;
                for (ushort x = 0; x < width; x++)
                {
                    if (x < width * outsideL || x > outsideR || y < outsideT || y > outsideB)
                    {
                        var val = videoPalette.GetFromPalette(col_line[x]);
                        // Divide RGB elements by 4.
                        val &= 0x00fcfcfc;
                        Marshal.WriteInt32(framebuffer4, val);
                        framebuffer4 = framebuffer4 + 3;
                    }
                    framebuffer4 = framebuffer4 + 1;
                }
            }
        }


        private void RenderLayerLine(byte layerIndex, ushort y, IntPtr layerBuffer)
        {
            VideoLayerData layer = LayerAccess.GetLayer(layerIndex);
            if (layer.PaintRequireReload)
            {
                UpdateBitPerPixelMethod(layer);
                layer.PaintRequireReload = false;
            }
            if (!layer.IsEnabled)
            {
                // LayerLinesEmpty[layerIndex] = true;
                return;
            }
            else
            {
                // LayerLinesEmpty[layerIndex] = false;
                // Load in tile bytes if not in bitmap mode.
                byte[] tile_bytes = new byte[512]; // max 256 tiles, 2 bytes each.
                uint map_addr_begin = 0;

                if (!layer.BitmapMode)
                    map_addr_begin = LayerAccess.ReadSpaceReadRange(out tile_bytes, layer, y);
                //diagnose.StepPaint(frameCount,y, tile_bytes);

                int realY = y;
                for (int x = 0; x < width; x++)
                {
                    byte colorIndex = 0;
                    int realX = x;

                    int newX;
                    int newY;
                    uint tileStart = 0;
                    VideoMapTile tile = null;

                    if (!layer.BitmapMode)
                    {
                        realX = LayerAccess.CalcLayerEffX(layer, x);
                        realY = LayerAccess.CalcLayerEffY(layer, y);
                        newX = realX & layer.TileWidthMax;
                        newY = realY & layer.TileHeightMax;
                        uint mapAddress = LayerAccess.CalcLayerMapAddress(layer, realX, realY) - map_addr_begin;
                        // Todo: to enhance performance, do not always do a reload, only when data has changed
                        tile = mapTileAccess.GetTile(mapAddress, layer, true, tile_bytes);

                        // offset within tilemap of the current tile
                        tileStart = tile.TileIndex * layer.TileSize;
                        if (tile.VerticalFlip)
                            newY = newY ^ layer.TileHeight - 1;
                        if (tile.HorizontalFlip)
                            newX = newX ^ layer.TileWidth - 1;
                    }
                    else
                    {
                        newX = realX % layer.TileWidth;
                        newY = realY % layer.TileHeight;
                    }
                    // Additional bytes to reach the correct line of the tile
                    uint y_add = (uint)(newY * layer.TileWidth * layer.BitsPerPixel >> 3);
                    // Additional bytes to reach the correct column of the tile
                    ushort x_add = (ushort)(newX * layer.BitsPerPixel >> 3);
                    // Get the offset address of the tile.
                    uint tile_offset = tileStart + y_add + x_add;
                    byte color = videoAccess.Read(layer.TileBase + tile_offset);
                    // Convert tile byte to indexed color
                    var layy = BitsPerPxlCalculation[layer.LayerIndex];
                    if (layy == null)
                        continue;

                    colorIndex = layy(color, newX, tile);

                    // Apply Palette Offset
                    if (layer.BitmapMode && colorIndex > 0 && colorIndex < 16 && tile != null)
                        colorIndex += (byte)(tile.PaletteOffset << 4);

                    layer_lineV[layerIndex][x] = colorIndex;

                }
                var dataToRead = y * width;
                if (y < 65531)
                    Marshal.Copy(layer_lineV[layerIndex], 0, layerBuffer + dataToRead, width);
            }
        }


        private Func<byte, int, VideoMapTile, byte>[] BitsPerPxlCalculation = new Func<byte, int, VideoMapTile, byte>[2];
        private void UpdateBitPerPixelMethod(VideoLayerData layer)
        {
            // Convert tile byte to indexed color
            switch (layer.BitsPerPixel)
            {
                case 1:
                    BitsPerPxlCalculation[layer.LayerIndex] = (color, newX, tile) =>
                    {
                        bool bit = (color >> 7 - newX & 1) != 0;
                        var colorIndex = bit ? tile.ForegroundColor : tile.BackgroundColor;
                        return colorIndex;
                    };
                    break;
                case 2:
                    BitsPerPxlCalculation[layer.LayerIndex] = (color, newX, tile) => (byte)(color >> 6 - ((newX & 3) << 1) & 3);
                    break;
                case 4:
                    BitsPerPxlCalculation[layer.LayerIndex] = (color, newX, tile) => (byte)(color >> 4 - ((newX & 1) << 2) & 0xf);
                    break;
                case 8:
                    BitsPerPxlCalculation[layer.LayerIndex] = (color, newX, tile) => color;
                    break;
            }
        }

        public void RequestUpdatePaintProcedure()
        {
            videoPalette.PaletteNeedsToReload();
        }

        public void Dispose()
        {
            isDisposed = true;
            Marshal.FreeHGlobal(layersbuffer[0]);
            Marshal.FreeHGlobal(layersbuffer[1]);
            Marshal.FreeHGlobal(framebuffer);
        }

        public void SetDisplay(IComputerDisplay display)
        {
            this.display = display;
            display.Init(width, height);
            spriteAccess.SetDisplay(display);
            videoPalette.SetDisplay(display);
        }

        public void Break(bool doBreak)
        {
            this.doBreak = doBreak;
        }
        public void LockOnProcessor(bool state)
        {
            // lockOnProcessor = state;
        }
        public bool LockOnFps { get; set; }
    }
}
