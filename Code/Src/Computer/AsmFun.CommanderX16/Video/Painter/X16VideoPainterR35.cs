// Heavely inspired from https://github.com/commanderx16/x16-emulator

using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Data;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using AsmFun.Core.Tools;
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading;

namespace AsmFun.CommanderX16.Video.Painter
{
    public class X16VideoPainterR35 : IVideoPainter
    {
        private IComputerDisplay display;
        // Copy vars from settings for performance
        private int width;
        private int height;
        private int scanHeight;
        private double fpsRequired;
        private int totalLayerSize;
        private bool doBreak = false;
        private bool isDisposed = false;

        private bool isRefreshingPainter = false;
        private ushort scanY;
        private int frameCount = 0;
        public bool IsPainting { get; protected set; }
        public static int EXTENDED_FLAG = 0x100;
        public IntPtr framebufferBG; 
        public IntPtr[] layersbuffer = new IntPtr[2];
        public IntPtr[] layersbufferReady = new IntPtr[2];
        public IntPtr layersbuffer0;
        public IntPtr layersbuffer1;

        // Speed checker
        Stopwatch elapsedWatcher = new Stopwatch();
        private bool lockOnFps = false;
        private int fpsCounter;
        private bool lockOnMhz;
        private double fpsRunning;
        private int slower = 10;

        // Thread 2
        private bool thread2Finished;
        private AutoResetEvent thread2Are = new AutoResetEvent(false);
        private Thread threadDraw2;

        private IVideoAccess videoAccess;
        private ISpriteAttributesAccess spriteAccess;
        private IDisplayComposer composer;
        private IVideoPaletteAccess videoPalette;
        private IVideoLayerAccess LayerAccess;
        private IX16VideoMapTileAccess mapTileAccess;
        private X16IOAccess ioAccess;
        private readonly IComputerDiagnose diagnose;
        

        public X16VideoPainterR35(VideoSettings videoSettings, IVideoAccess videoAccess, IDisplayComposer composer,
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
            scanHeight = videoSettings2.ScanHeight;
            fpsRequired = videoSettings2.VgaPixelFrequency;
            totalLayerSize = width * height;
            framebufferBG = Marshal.AllocHGlobal(width * height * 4);
            layersbuffer[0] = Marshal.AllocHGlobal(totalLayerSize);
            layersbuffer[1] = Marshal.AllocHGlobal(totalLayerSize);
            layersbufferReady[0] = Marshal.AllocHGlobal(totalLayerSize);
            layersbufferReady[1] = Marshal.AllocHGlobal(totalLayerSize);
            layersbuffer0 = Marshal.AllocHGlobal(totalLayerSize);
            layersbuffer1 = Marshal.AllocHGlobal(totalLayerSize);

            threadDraw2 = new Thread(DrawThread2);
            threadDraw2.IsBackground = true;
            threadDraw2.Start();
        }

        public void Reset()
        {
            scanY = 0;
            elapsedWatcher.Start();
        }


        private bool processorHasStepped = false;
        public bool ProcessorStep()
        {
            processorHasStepped = true;
            return true;
        }
        private int step;
        public bool Step()
        {
            if (doBreak) return false;
            return StepPaint();
        }

        private byte lastBorderColor = 0;
        public unsafe bool StepPaint2()
        {
            int y = 0;
            thread2Are.Set();
            var layer1 = LayerAccess.GetLayer(1);
            for (y = 0; y < height; y++)
            {
                ushort eff_y = (ushort)(composer.b_VScale * (y - composer.VStart) / 128);
                RenderLayerLine(layer1, 1, eff_y, layersbuffer1);
                if (composer.OutMode != 0)
                    videoPalette.RefreshIfNeeded(composer.OutMode, composer.ChromaDisable);
                display.RequestRedrawLayer(1, layersbuffer1, layer1);
            }
            while (!thread2Finished && !isDisposed)
            {

            }

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
                for (int i = 0; i < height; i++)
                    Marshal.Copy(fillLine, 0, framebufferBG + i * width * 4, width * 4);

                lastBorderColor = composer.BorderColor;
            }
            Buffer.MemoryCopy(layersbuffer[0].ToPointer(), layersbufferReady[0].ToPointer(), totalLayerSize, totalLayerSize);
            Buffer.MemoryCopy(layersbuffer[1].ToPointer(), layersbufferReady[1].ToPointer(), totalLayerSize, totalLayerSize);
            display.RequestRedrawLayers(layersbufferReady, LayerAccess.GetLayers());
            ioAccess.FramePainted();
            display.Paint(framebufferBG, isNewBg);
            if (lockOnFps)
                CheckSpeed();
            frameCount++;
            scanY = 480;
            if (ioAccess.IsIrqLine())
            {
                y = (ushort)(scanY - composer.FrontPorch);
                if (y < height && y == composer.IrqLine)
                    ioAccess.SetIrqLine();
            }
            return true;
        }
        private void DrawThread2()
        {
            while (!isDisposed)
            {
                try
                {
                    while (!isDisposed)
                    {
                        thread2Are.WaitOne();
                        thread2Finished = false;
                        if (isDisposed) return;
                        var layer0 = LayerAccess.GetLayer(0);
                        for (ushort y = 0; y < height; y++)
                        {
                            ushort eff_y = (ushort)(composer.b_VScale * (y - composer.VStart) / 128);
                            RenderLayerLine(layer0,0, eff_y, layersbuffer0);
                        }
                        display.RequestRedrawLayer(0, layersbuffer0, layer0);
                        thread2Finished = true;
                    }
                }
                catch (Exception e)
                {
                    ConsoleHelper.WriteError<X16VideoPainterR35>(e);
                }
            }
        }


        public bool StepPaint()
        {
            bool isNewFrame = false;
            step++;
            IsPainting = true;
            ushort y = (ushort)(scanY - composer.FrontPorch);
            if (y < height)
            {
                var layer0 = LayerAccess.GetLayer(0);
                var layer1 = LayerAccess.GetLayer(1);
                ushort eff_y = (ushort)(composer.b_VScale * (y - composer.VStart) / 128);
                RenderLayerLine(layer0, 0, eff_y, layersbuffer[0]);
                RenderLayerLine(layer1, 1, eff_y, layersbuffer[1]);
                if (composer.OutMode != 0)
                    videoPalette.RefreshIfNeeded(composer.OutMode, composer.ChromaDisable);
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
                    for (int i = 0; i < height; i++)
                        Marshal.Copy(fillLine, 0, framebufferBG + i * width * 4, width * 4);

                    lastBorderColor = composer.BorderColor;
                }
                display.RequestRedrawLayers(layersbuffer, LayerAccess.GetLayers());
                ioAccess.FramePainted();
                display.Paint(framebufferBG, isNewBg);
                if (lockOnFps)
                    CheckSpeed();
                frameCount++;
            }

            if (ioAccess.IsIrqLine())
            {
                y = (ushort)(scanY - composer.FrontPorch);
                if (y < height && y == composer.IrqLine)
                    ioAccess.SetIrqLine();
            }
            IsPainting = false;
              
            return isNewFrame;
        }

      

        private VideoLayerData RenderLayerLine(VideoLayerData layer, byte layerIndex, ushort y,IntPtr layerBuffer)
        {
            
            if (layer.PaintRequireReload)
            {
                UpdateBitPerPixelMethod(layer);
                layer.PaintRequireReload = false;
            }
            if (!layer.IsEnabled) return layer;
            // Load in tile bytes if not in bitmap mode.
            byte[] tile_bytes = new byte[512]; // max 256 tiles, 2 bytes each.
            uint map_addr_begin = 0;
                
            if (!layer.BitmapMode)
                map_addr_begin = LayerAccess.ReadSpaceReadRange(out tile_bytes,layer, y);
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
                var paletteOffset = 0;
                if (!layer.BitmapMode)
                {
                    realX = LayerAccess.CalcLayerEffX(layer, x);
                    realY = LayerAccess.CalcLayerEffY(layer, y);
                    newX = realX & layer.TileWidthMax;
                    newY = realY & layer.TileHeightMax;
                    uint mapAddress = LayerAccess.CalcLayerMapAddress(layer, realX, realY) - map_addr_begin;
                    // Todo: to enhance performance, do not always do a reload, only when data has changed
                    tile = mapTileAccess.GetTile(mapAddress, layer,true, tile_bytes);

                    paletteOffset = (byte)(tile.PaletteOffset << 4);
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
                    paletteOffset = (byte)(layer.PaletteOffset << 4);
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
                if (paletteOffset >0)
                    colorIndex += (byte)paletteOffset;
                var place = x + y * width;
                if (place < 41861120)
                    Marshal.WriteByte(layerBuffer+ place, colorIndex);
            }
            return layer;
        }


        private static Func<byte, int, VideoMapTile, byte>[] BitsPerPxlCalculation = new Func<byte, int, VideoMapTile, byte>[2];
       

        private static void UpdateBitPerPixelMethod(VideoLayerData layer)
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
            thread2Finished = true;
            Marshal.FreeHGlobal(layersbuffer[0]);
            Marshal.FreeHGlobal(layersbuffer[1]);
            Marshal.FreeHGlobal(layersbufferReady[0]);
            Marshal.FreeHGlobal(layersbufferReady[1]);
            Marshal.FreeHGlobal(layersbuffer0);
            Marshal.FreeHGlobal(layersbuffer1);
            Marshal.FreeHGlobal(framebufferBG);
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

        private void CheckSpeed()
        {
            fpsCounter++;
            var totalFramesReq = elapsedWatcher.Elapsed.TotalSeconds * fpsRequired;
            var offset = fpsCounter - totalFramesReq; 
            var offf = totalFramesReq / fpsCounter;
            if (fpsCounter >= 100)
            {
                // Console.WriteLine(Math.Round(offset) + " " + fpsCounter +" "+ elapsedWatcher.Elapsed.TotalSeconds+" "+ offf+" "+ totalFramesReq);
                fpsCounter = 0;
                elapsedWatcher.Restart();
            }

            
            if (offset > 1)
            {
                var sleepp = offset;
                slower = Convert.ToInt32(sleepp*10);
                if (slower > 500)
                    slower = 500;
                Thread.Sleep(slower);
            }
            else
            {
                slower = Convert.ToInt32(offset / 1000);
                if (slower < 5)
                    slower = 5;
            }
        }
        public bool LockOnFps
        {
            get { return lockOnFps; }
            set
            {
                lockOnFps = value;
                Console.WriteLine($"Set Video LockOnFps {fpsRequired}fps :" + value);
            }
        }

    }
}
