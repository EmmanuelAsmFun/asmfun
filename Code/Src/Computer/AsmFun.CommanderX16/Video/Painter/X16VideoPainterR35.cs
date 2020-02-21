// Heavely inspired from https://github.com/commanderx16/x16-emulator

using AsmFun.Computer.Common.Computer;
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

        private ushort scanY;
        private int frameCount = 0;
        public bool IsPainting { get; protected set; }
        public static int EXTENDED_FLAG = 0x100;
        public IntPtr framebufferBG; 
        public IntPtr layersbuffer1;
        public IntPtr layersbuffer2;

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

        private TilePainter tilePainter1;
        private TilePainter tilePainter2;
        private BimapPainter bimapPainter1;
        private BimapPainter bimapPainter2;
        private TextPainter textPainter1;
        private TextPainter textPainter2;


        public X16VideoPainterR35(VideoSettings videoSettings, IVideoAccess videoAccess, IDisplayComposer composer,
            IVideoPaletteAccess videoPalette, IVideoLayerAccess layerAccess, ISpriteAttributesAccess spriteAccess,
            IX16VideoMapTileAccess mapTileAccess, X16IOAccess ioAccess, IComputerDiagnose diagnose, IVideoRamAccess videoRamAccess)
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
            fpsRequired = videoSettings2.VgaPixelFrequency * 2;
            totalLayerSize = width * height;
            framebufferBG = Marshal.AllocHGlobal(width * height * 4);
            layersbuffer1 = Marshal.AllocHGlobal(totalLayerSize);
            layersbuffer2 = Marshal.AllocHGlobal(totalLayerSize);

            tilePainter1 = new TilePainter(videoAccess, videoSettings);
            tilePainter2 = new TilePainter(videoAccess, videoSettings);
            bimapPainter1 = new BimapPainter(videoAccess, videoSettings);
            bimapPainter2 = new BimapPainter(videoAccess, videoSettings);
            textPainter1 = new TextPainter(mapTileAccess, layerAccess, videoAccess, videoRamAccess, videoSettings);
            textPainter2 = new TextPainter(mapTileAccess, layerAccess, videoAccess, videoRamAccess, videoSettings);
            

            threadDraw2 = new Thread(DrawThread2);
            threadDraw2.IsBackground = true;
            threadDraw2.Start();
        }

        public void Reset()
        {
            scanY = 0;
            elapsedWatcher.Start();
        }
        

        private void PaintLayers()
        {
            thread2Are.Set();
            var layer1 = LayerAccess.GetLayer(0);
            var layer2 = LayerAccess.GetLayer(1);
            // Layer1
            if (layer1.TileMode)
            {
                tilePainter1.ReadVideo(LayerAccess.GetLayer(0));
                tilePainter1.PaintFrame(layersbuffer1, composer.VStart, composer.b_VScale);
            }
            else if (layer1.BitmapMode)
            {
                bimapPainter1.ReadVideo(LayerAccess.GetLayer(0));
                bimapPainter1.PaintFrame(layersbuffer1, composer.VStart, composer.b_VScale);
            }
            else
            {
                textPainter1.ReadVideo(LayerAccess.GetLayer(0));
                textPainter1.PaintFrame(layersbuffer1, composer.VStart, composer.b_VScale);
            }
            while (!isDisposed && !thread2Finished)
            {
                Thread.Sleep(0);
            }

            if (!layer1.IsEnabled && !layer2.IsEnabled)
            {
                Thread.Sleep(5);
            }
            // Layer2
            //var layer2 = LayerAccess.GetLayer(1);
            //if (layer2.TileMode)
            //{
            //    tilePainter2.ReadVideo(layer2);
            //    tilePainter2.PaintFrame(layersbuffer2, composer.VStart, composer.b_VScale);
            //}
            //else if (layer2.BitmapMode)
            //{
            //    bimapPainter2.ReadVideo(layer2);
            //    bimapPainter2.PaintFrame(layersbuffer2, composer.VStart, composer.b_VScale);
            //}
            //else
            //{
            //    textPainter2.ReadVideo(layer2);
            //    textPainter2.PaintFrame(layersbuffer2, composer.VStart, composer.b_VScale);
            //}

            display.RequestRedrawLayer(0, layersbuffer1, layer1);
            //display.RequestRedrawLayer(1, layersbuffer1, layer2);
        }


        private byte lastBorderColor = 0;
        public bool StepPaint()
        {
            bool isNewFrame = false;
           
            step++;
            IsPainting = true;
            ushort y = (ushort)(scanY - composer.FrontPorch);
            //if (y < height)
            //{
            //    if (composer.OutMode != 0)
            //        videoPalette.RefreshIfNeeded(composer.OutMode, composer.ChromaDisable);
            //}
            videoPalette.RefreshIfNeeded(composer.OutMode, composer.ChromaDisable);
            scanY++;
            if (scanY == scanHeight)
            {
                scanY = 0;
                isNewFrame = true;
                PaintLayers();
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
                //display.RequestRedrawLayers(layersbuffer, LayerAccess.GetLayers());
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
            //while (!processorHasStepped)
            //{
            //    Thread.Sleep(0); 
            //}
            //processorHasStepped = false;
            return StepPaint();
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
                        // Layer2
                        var layer2 = LayerAccess.GetLayer(1);

                        if (layer2.TileMode)
                        {
                            tilePainter2.ReadVideo(layer2);
                            tilePainter2.PaintFrame(layersbuffer2, composer.VStart, composer.b_VScale);
                        }
                        else if (layer2.BitmapMode)
                        {
                            bimapPainter2.ReadVideo(layer2);
                            bimapPainter2.PaintFrame(layersbuffer2, composer.VStart, composer.b_VScale);
                        }
                        else
                        {
                            textPainter2.ReadVideo(layer2);
                            textPainter2.PaintFrame(layersbuffer2, composer.VStart, composer.b_VScale);
                        }
                        display.RequestRedrawLayer(1, layersbuffer2, layer2);
                        thread2Finished = true;
                    }
                }
                catch (Exception e)
                {
                    ConsoleHelper.WriteError<X16VideoPainterR35>(e);
                }
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
            Marshal.FreeHGlobal(layersbuffer1);
            Marshal.FreeHGlobal(layersbuffer2);
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
