// Heavely inspired from https://github.com/commanderx16/x16-emulator

using AsmFun.Computer.Common.Data;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using AsmFun.Computer.Common.Video.Enums;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Threading;

namespace AsmFun.CommanderX16.Video.Painter
{
    public class X16VideoPainterR33 : IVideoPainter
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

        private bool isDisposed = false;
        private Thread threadDraw2;
        private bool thread2Finished = false;
        private int thread2Y;
        private AutoResetEvent thread2Are = new AutoResetEvent(false);

        private bool isRefreshingPainter = false;
        private float scanX;
        private ushort scanY;
        private int frameCount = 0;
        public byte[][] layer_lineV;
        public bool[] LayerLinesEmpty = new bool[2];
        public bool IsPainting { get; protected set; }
        public bool LockOnFps { get; set; }

        private bool doBreak;
        public static int EXTENDED_FLAG = 0x100;

        public IntPtr framebuffer; // = new byte[SCREEN_WIDTH * SCREEN_HEIGHT * 4];

        private IVideoAccess videoAccess;
        private ISpriteAttributesAccess spriteAccess;
        private IDisplayComposer composer;
        private IVideoPaletteAccess videoPalette;
        private IVideoLayerAccess LayerAccess;
        private IX16VideoMapTileAccess mapTileAccess;
        private X16IOAccess ioAccess;


        private List<Action<int, int, byte[]>> paintProcedure = new List<Action<int, int, byte[]>>();



        public X16VideoPainterR33(VideoSettings videoSettings, IVideoAccess videoAccess, IDisplayComposer composer,
            IVideoPaletteAccess videoPalette, IVideoLayerAccess layerAccess, ISpriteAttributesAccess spriteAccess,
            IX16VideoMapTileAccess mapTileAccess, X16IOAccess ioAccess)
        {
            X16VideoSettings videoSettings2 = (X16VideoSettings)videoSettings;
            this.videoPalette = videoPalette;
            this.composer = composer;
            this.videoAccess = videoAccess;
            this.spriteAccess = spriteAccess;
            this.mapTileAccess = mapTileAccess;
            this.ioAccess = ioAccess;
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
            threadDraw2 = new Thread(DrawThread2);
            threadDraw2.IsBackground = true;
            threadDraw2.Start();
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

        public bool ProcessorStep()
        {
            return true;
        }
        public bool Step()
        {
            bool isNewFrame = false;
            if (isRefreshingPainter)
            {
                while (isRefreshingPainter && !isDisposed)
                    Thread.Sleep(20);
            }
            scanX += composer.StepXAdvance;
            if (scanX > scanWidth)
            {
                IsPainting = true;
                scanX -= scanWidth;
                ushort y = (ushort)(scanY - composer.FrontPorch);
                if (y < height)
                    RenderLine(y);
                scanY++;
                if (scanY == scanHeight)
                {
                    scanY = 0;
                    isNewFrame = true;
                    ioAccess.FramePainted();
                }

                if (ioAccess.IsIrqLine())
                {
                    y = (ushort)(scanY - composer.FrontPorch);
                    if (y < height && y == composer.IrqLine)
                        ioAccess.SetIrqLine();
                }
                IsPainting = false;
            }
            while (doBreak && !isDisposed)
            {
                Thread.Sleep(2);
            }

            if (isNewFrame)
            {
                display.Paint(framebuffer, true);
                frameCount++;
            }
            return isNewFrame;
        }

        private void RenderLine(ushort y)
        {

            int eff_y = (int)(1.0 / composer.VScale * (y - composer.VStart));
            eff_y = spriteAccess.RenderLine((ushort)eff_y);
            RenderLayerLine(0, (ushort)eff_y);
            RenderLayerLine(1, (ushort)eff_y);
            //for (ushort x = 0; x < width; x++)
            //    PaintPixel(x, y);
            thread2Y = y;
            thread2Are.Set();
            for (ushort x = 0; x < width; x += 2)
                PaintPixel(x, y);

            //var task1 = Task.Run(() =>
            //{
            //    for (ushort x = 0; x < width; x += 2)
            //        PaintPixel(x, y);
            //});
            //var task2 = Task.Run(() =>
            //{
            //    for (ushort x = 1; x < width; x += 2 )
            //        PaintPixel(x, y);
            //});
            //Task.WaitAll(task1, task2);
        }

        private void RenderLayerLine(byte layerIndex, ushort y)
        {
            var layer = LayerAccess.GetLayer(layerIndex);

            if (!layer.IsEnabled)
            {
                //videoData.Layers[layer].IsEnabled = false;
                LayerLinesEmpty[layerIndex] = true;
            }
            else
            {
                //videoData.Layers[layer].IsEnabled = true;
                LayerLinesEmpty[layerIndex] = false;
                for (int x = 0; x < width; x++)
                {
                    byte colorIndex = 0;
                    int realX = x;
                    int realY = y;
                    int newX;
                    int newY;
                    byte foregroundColor = 0;
                    byte backgroundColor = 0;
                    uint tileStart = 0;
                    VideoMapTile tile = null;

                    if (!layer.BitmapMode)
                    {
                        realX = x + layer.HorizontalScroll & layer.LayerWidthMax;
                        realY = y + layer.VerticalScroll & layer.LayerHeightMax;
                        newX = realX & layer.TileWidthMax;
                        newY = realY & layer.TileHeightMax;
                        //if (layer.TileWidth ==0 || layer.TileHeight == 0 || layer.MapWidth == 0)
                        //    Thread.Sleep(1);
                        uint mapAddress = (uint)(layer.MapBase + (realY / layer.TileHeight * layer.MapWidth + realX / layer.TileWidth) * 2);
                        tile = mapTileAccess.GetTile(mapAddress, layer);
                        // offset within tilemap of the current tile
                        tileStart = tile.TileIndex * layer.TileSize;
                        foregroundColor = tile.ForegroundColor;
                        backgroundColor = tile.BackgroundColor;
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
                    // colorIndex = calculateColorIndex(color, newX, foregroundColor, backgroundColor);
                    // Convert tile byte to indexed color
                    switch (layer.BitsPerPixel)
                    {
                        case 1:
                            {
                                bool bit = (color >> 7 - newX & 1) != 0;
                                colorIndex = bit ? foregroundColor : backgroundColor;
                                break;
                            }
                        case 2:
                            colorIndex = (byte)(color >> 6 - ((newX & 3) << 1) & 3);
                            break;
                        case 4:
                            colorIndex = (byte)(color >> 4 - ((newX & 1) << 2) & 0xf);
                            break;
                        case 8:
                            colorIndex = color;
                            break;
                    }

                    // Apply Palette Offset
                    if (layer.BitmapMode && colorIndex > 0 && colorIndex < 16 && tile != null)
                        colorIndex += (byte)(tile.PaletteOffset << 4);

                    //videoData.Layers[layer].LayerLines[x].ColorIndex = col_index;
                    layer_lineV[layerIndex][x] = colorIndex;
                }
            }

        }

        private Func<byte, int, byte, byte, byte> calculateColorIndex1 = (color, newX, fg, bg) => color;
        private Func<byte, int, byte, byte, byte> calculateColorIndex2 = (color, newX, fg, bg) => color;


        public void RequestUpdatePaintProcedure()
        {

            while (IsPainting && !isDisposed)
            {
                Thread.Sleep(1);
            }
            UpdatePaintProcedure();

        }
        private void UpdatePaintProcedure()
        {

            List<Action<int, int, byte[]>> tmpAr = new List<Action<int, int, byte[]>>();
            if (composer.OutMode == 0)
                tmpAr.Add((x, y, rgb) =>
                {
                    // Video off, show blue screen
                    rgb[0] = 0;
                    rgb[1] = 0;
                    rgb[2] = 255;
                });
            else
                tmpAr.Add((x, y, rgb) =>
                {
                    byte col_index = 0;
                    // Check if we paint outside the work area
                    if (composer.IsInsideWorkArea(x, y))
                        col_index = composer.BorderColor;
                    else
                    {
                        int eff_x = (int)(1.0 / composer.HScale * (x - composer.HStart));
                        col_index = spriteAccess.CalculateColIndex(layer_lineV, LayerLinesEmpty, eff_x);
                    }
                    // Get palette color
                    var newRgb = videoPalette.Get(col_index);
                    Array.Copy(newRgb, rgb, 3);
                });
            if (composer.ChromaDisable)
                tmpAr.Add((x, y, rgb) =>
                {
                    rgb[0] = rgb[1] = rgb[2] = (byte)((rgb[0] + rgb[1] + rgb[2]) / 3);
                });
            if (composer.OutMode == VideoOutModes.NTSC)
                tmpAr.Add((x, y, rgb) =>
                {
                    if (x < outsideL || x > outsideR || y < outsideT || y > outsideB)
                    {
                        rgb[0] ^= 128;
                        rgb[1] ^= 128;
                        rgb[2] ^= 128;
                    }
                });
            isRefreshingPainter = true;
            paintProcedure = tmpAr;
            isRefreshingPainter = false;
        }


        private void PaintPixel(int x, int y)
        {
            var rgb = new byte[3];
            paintProcedure.ForEach(a => a(x, y, rgb));
            int fbi = (y * width + x) * 4;
            Marshal.Copy(new byte[] { rgb[2], rgb[1], rgb[0] }, 0, framebuffer + fbi, 3);
        }

        private void DrawThread2()
        {
            while (!isDisposed)
            {
                thread2Are.WaitOne();
                thread2Finished = false;
                if (isDisposed) return;
                for (ushort x = 0; x < width; x += 2)
                    PaintPixel(x + 1, thread2Y);
                thread2Finished = true;
            }
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

        }

        public void Dispose()
        {
            isDisposed = true;
            thread2Are.Set();
            threadDraw2.Join(500);
            Marshal.FreeHGlobal(framebuffer);
        }

       
    }
}
