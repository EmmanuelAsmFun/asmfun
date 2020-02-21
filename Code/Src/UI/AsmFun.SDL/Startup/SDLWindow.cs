#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading;
using AsmFun.Common;
using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.IO;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using AsmFun.Core.Tools;

namespace AsmFun.Startup
{
    public class SDLWindow : IDisposable, IComputerDisplay
    {
        private bool isInitialized;
        private bool isDisposed;
        private int ComputerWidth;
        private int ComputerHeight;
        private int ComputerSize;
        private int StrideSize;
        public IEmServiceResolverFactory Container { get; set; }
        private int programCounter = 0;
        private Stopwatch _stopwatchSDL = new Stopwatch();
        private Stopwatch _stopwatchFramePaint = new Stopwatch();
        private int _frameCounterSDL = 0;
        private int _framePaintCounter = 0;
        private int _framePaintFpsCounter = 0;
        private int _frameCounterGameEngine = 0;
        private double mhzRunning;

        private IntPtr window;
        private IntPtr renderer;
        private IntPtr bgTexture;
        private IntPtr layer0;
        private IntPtr layer1;
        private IntPtr layerData0;
        private IntPtr layerData1;
        private IntPtr font;
        private SDL2.SDL.SDL_Color textColor;
        private SDL2.SDL.SDL_Rect Message_rect = new SDL2.SDL.SDL_Rect();
        private IntPtr surfaceMessage;
        private IntPtr messageSurf;
        
        private EventManagerSDL eventManagerSDL;
        private SDLSound sound;


        public SDLWindow()
        {
            layerData0 = Marshal.AllocHGlobal(640 * 480*4);
            layerData1 = Marshal.AllocHGlobal(640 * 480*4);
            sound = new SDLSound();
        }

       

        public void Init()
        {
            if (isInitialized) return;
            var computerManager = Container.Resolve<IComputerManager>();
            displayComposer = Container.Resolve<IDisplayComposer>();
            var computer = computerManager.GetComputer();
            if (computer == null) return;
            computerManager.SetDisplay(this);
            computer.SetWriteAudioMethod(sound.WriteAudio);
            eventManagerSDL = new EventManagerSDL(Container, computer.GetKeyboard());
            _stopwatchFramePaint.Start();
            _stopwatchSDL.Start();
            isInitialized = true;
        }

        public void Init(int width, int height)
        {
            ComputerWidth = width;
            ComputerHeight = height;
            StrideSize = ComputerWidth * 4;
            ComputerSize = ComputerWidth * ComputerHeight;
        }


        public void Start()
        {
            InitWindow();
            InitBGLayer();
            InitLayers();
            InitFpsCounter();
            sound.Init();
            eventManagerSDL.RunPollEvent();
        }


        private void InitWindow()
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                SDL2.SDL.SDL_SetHint(SDL2.SDL.SDL_HINT_WINDOWS_DISABLE_THREAD_NAMING, "1");
            if (SDL2.SDL.SDL_Init(SDL2.SDL.SDL_INIT_VIDEO | SDL2.SDL.SDL_INIT_EVENTS | SDL2.SDL.SDL_INIT_GAMECONTROLLER | SDL2.SDL.SDL_INIT_AUDIO) < 0)
                Console.WriteLine("Unable to initialize SDL. Error: {0}", SDL2.SDL.SDL_GetError());
            SDL2.SDL.SDL_CreateWindowAndRenderer(640, 480, SDL2.SDL.SDL_WindowFlags.SDL_WINDOW_RESIZABLE
                | SDL2.SDL.SDL_WindowFlags.SDL_WINDOW_SHOWN | SDL2.SDL.SDL_WindowFlags.SDL_WINDOW_OPENGL, out window, out renderer);
            //window = SDL2.SDL.SDL_CreateWindow("ASMFun - Commander X16", 0, 0, 640, 480, SDL2.SDL.SDL_WindowFlags.SDL_WINDOW_RESIZABLE
            //    | SDL2.SDL.SDL_WindowFlags.SDL_WINDOW_SHOWN | SDL2.SDL.SDL_WindowFlags.SDL_WINDOW_OPENGL );
            //renderer = SDL2.SDL.SDL_CreateRenderer(window, -1, SDL2.SDL.SDL_RendererFlags.SDL_RENDERER_TARGETTEXTURE | SDL2.SDL.SDL_RendererFlags.SDL_RENDERER_ACCELERATED);

            if (window == IntPtr.Zero)
            {
                Console.WriteLine("Unable to create a window. SDL. Error: {0}", SDL2.SDL.SDL_GetError());
                return;
            }
            SDL2.SDL.SDL_SetWindowResizable(window, SDL2.SDL.SDL_bool.SDL_TRUE);
            
            SDL2.SDL.SDL_SetWindowTitle(window, "ASMFun - Commander X16");
        }


        public void Stop()
        {
            // first stop the events
            eventManagerSDL?.Dispose();
            sound.CloseAudio();
            SDL2.SDL.SDL_DestroyWindow(window);
            DisposeFpsCounter();
            DisposeLayers();
            DisposeBgLayer();
            SDL2.SDL.SDL_Quit();
            sound.Dispose();
            DisposeSprites();
           
        }

        public void Paint(IntPtr framebuffer, bool requireRedrawBg)
        {
            
            if (isDisposed) return;
            _framePaintCounter++;
            _framePaintFpsCounter++; ;
            if (_framePaintFpsCounter == 100)
            {
                _framePaintFpsCounter = 0;
                _stopwatchFramePaint.Restart();
            }
            
            SDL2.SDL.SDL_RenderClear(renderer);
           
            if (paletteAccess != null)
            {
                if (requireRefreshPalette)
                    reloadPalette();
                if (requireRedrawBg)
                    StepBGLayer(framebuffer);
                StepLayers();
                StepSprite();
            }
            CalculateFps();
            SDL2.SDL.SDL_RenderPresent(renderer);
        }

        public void ClockTick(ushort programCounter, double mhzRunning)
        {
            if (isDisposed) return;
            this.mhzRunning = mhzRunning;
            this.programCounter = programCounter;
            _frameCounterGameEngine++;
        }

        public void CloseDisplay()
        {
            Dispose();
        }

        public void Dispose()
        {
            if (isDisposed) return;
            isDisposed = true;
            Stop();
            
        }


        #region BGLayer
        private void InitBGLayer()
        {
            bgTexture = SDL2.SDL.SDL_CreateTexture(renderer, SDL2.SDL.SDL_PIXELFORMAT_ARGB8888, 1, ComputerWidth, ComputerHeight);
        }
        private void StepBGLayer(IntPtr framebuffer)
        {
            IntPtr rect1 = new IntPtr(0);
            IntPtr rect2 = new IntPtr(0);
            //var w = displayComposer.HStop - displayComposer.HStart;
            //var h = displayComposer.VStop - displayComposer.VStart;
            //var srcRect = new SDL2.SDL.SDL_Rect { x = 0, y = 0, w = (int)(w / displayComposer.HScale), h = (int)(h / displayComposer.VScale) };
            //var destRect = new SDL2.SDL.SDL_Rect { x = displayComposer.HStart, y = displayComposer.VStart, w = w, h = h };
            SDL2.SDL.SDL_UpdateTexture(bgTexture, IntPtr.Zero, framebuffer, StrideSize);
            SDL2.SDL.SDL_RenderCopy(renderer, bgTexture, rect1, rect2);
        }
        private void DisposeBgLayer()
        {

        } 
        #endregion


        #region Fps Counter
        private void InitFpsCounter()
        {

#if WINDOWS
#if DEBUG
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                try
                {
                    if (SDL2.SDL_ttf.TTF_Init() >= 0)
                    {
                        font = SDL2.SDL_ttf.TTF_OpenFont(@"arial.ttf", 10);

                        textColor = new SDL2.SDL.SDL_Color();
                        textColor.r = 255;
                        textColor.g = 255;
                        textColor.a = 255;

                        surfaceMessage = SDL2.SDL_ttf.TTF_RenderText_Blended_Wrapped(font, "put your text here", textColor, 50);

                        messageSurf = SDL2.SDL.SDL_CreateTextureFromSurface(renderer, surfaceMessage);

                        Message_rect.x = 400;
                        Message_rect.y = 50;
                        Message_rect.w = 200;
                        Message_rect.h = 20;
                    }
                }
                catch (Exception e2)
                {
                    ConsoleHelper.WriteError(this, e2);
                }
            }
#endif
#endif
        }

        private void CalculateFps()
        {
            if (messageSurf == null) return;
#if WINDOWS
#if DEBUG
            //if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            //{
            //    // Determine frame rate in fps (frames per second).
            //    long frameRateSDL = (long)(_frameCounterSDL / _stopwatchSDL.Elapsed.TotalSeconds);
            //    long framePaint = (long)(_framePaintFpsCounter / _stopwatchFramePaint.Elapsed.TotalSeconds);
            //    // Update elapsed time, number of frames, and frame rate.
            //    var txt = "fps " + (Math.Floor(mhzRunning / 1000) / 100).ToString() + " / " + frameRateSDL;
            //    surfaceMessage = SDL2.SDL_ttf.TTF_RenderText_Solid(font, txt, textColor);
            //    messageSurf = SDL2.SDL.SDL_CreateTextureFromSurface(renderer, surfaceMessage);
            //    var emptyRect = new SDL2.SDL.SDL_Rect() { x = 0, y = 00, w = 100, h = 100 };
            //    SDL2.SDL.SDL_RenderCopy(renderer, messageSurf, ref emptyRect, ref Message_rect);

            //    //myFrameCounterGameLabel.Text = _framePaintCounter.ToString("X2");
            //    //myFramePaintLabel.Text = framePaint.ToString();
            //    //myFrameRateWpfLabel.Text = frameRateWpf.ToString();
            //    //MymhzRunning.Text = (Math.Floor(mhzRunning / 1000) / 100).ToString();
            //    //myprogramCounterLabel.Text = programCounter.ToString("X4");
            //    _frameCounterSDL++;
            //}
#endif
#endif
        } 
        private void DisposeFpsCounter()
        {
#if WINDOWS
#if DEBUG
            try
            {
                if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                    SDL2.SDL_ttf.TTF_Quit();
            }
            catch (Exception)
            {
            }
#endif
#endif
        }
        #endregion


        #region Palette
        public void RequireRefreshPalette()
        {
            requireRefreshPalette = true;
        }
        public void InitPalette(IVideoPaletteAccess paletteAccess)
        {
            this.paletteAccess = paletteAccess;
            requireRefreshPalette = true;
        }
        private bool reloadPalette()
        {
            if (paletteAccess == null) return false;
            var colorss = paletteAccess.GetAllColors();
            if (colorss == null) return false;
            // Add alpha channel
            colorss = colorss.Select(x => new byte[] { 0xff, x[0], x[1], x[2] }).ToArray();
            colorss[0] = new byte[] { 0, 0, 0, 0 };
            palette = colorss;
            requireRefreshPalette = false;
            //var flatten = colorss.SelectMany(x => x).ToArray();
            //AsmFun.Common.AsmTools.DumpMemory(flatten);
            return true;
        } 
        #endregion


        #region Sprites 
        private ISpriteAccess spriteAccess;
        private IDisplayComposer displayComposer;
        private byte[][] palette;
        private IVideoPaletteAccess paletteAccess;
        private List<IntPtr> sprites;
        private List<IntPtr> drawPtrs;
        private bool requireRefreshPalette;
        public void InitSprites(ISpriteAccess spriteAccess)
        {
            this.spriteAccess = spriteAccess;
            sprites = new IntPtr[spriteAccess.NumberOfTotalSprites].ToList();
            drawPtrs = new IntPtr[spriteAccess.NumberOfTotalSprites].ToList();
            requireRefreshPalette = true;
        }
       
 
        private void StepSprite()
        {
            if (isDisposed) return;
            
            for (int sprIndex = 0; sprIndex < sprites.Count; sprIndex++)
            {
                if (isDisposed) return;
                var sprInfo = spriteAccess.GetSpriteInfo(sprIndex);
                if (sprInfo == null || sprInfo.ZDepth == 0)
                {
                    continue;
                }
                var w = (int)(sprInfo.Width * displayComposer.HScale);
                var h = (int)(sprInfo.Height * displayComposer.VScale);
                var x = (int)(sprInfo.X * displayComposer.HScale) + displayComposer.HStart;
                var y = (int)(sprInfo.Y * displayComposer.VScale) + displayComposer.VStart;
                // Check if it's in range
                if (x > displayComposer.HStop || y > displayComposer.VStop || x < displayComposer.HStart-w || y < displayComposer.VStart-h)
                    continue;

                if (sprites[sprIndex] == IntPtr.Zero)
                {
                    var spr = SDL2.SDL.SDL_CreateTexture(renderer, SDL2.SDL.SDL_PIXELFORMAT_BGRA8888, 1, w, h);
                    SDL2.SDL.SDL_SetTextureBlendMode(spr, SDL2.SDL.SDL_BlendMode.SDL_BLENDMODE_BLEND);
                    sprites[sprIndex] = spr;
                    drawPtrs[sprIndex] = Marshal.AllocHGlobal(w*h * 4);
                }
                var drawPtr = drawPtrs[sprIndex];
                var sprite = sprites[sprIndex];
                var data = spriteAccess.ReadSpriteColIndexData(sprIndex);
               
                for (int i = 0; i < data.Length; i++)
                {
                    var col = palette[data[i]];
                    Marshal.Copy(col, 0, drawPtr + (i * 4), 4);
                }
                SDL2.SDL.SDL_UpdateTexture(sprite, IntPtr.Zero, drawPtr, sprInfo.Width * 4);
                var srcRect = new SDL2.SDL.SDL_Rect { x = 0, y = 0, w = sprInfo.Width, h = sprInfo.Height };
                var destRect = new SDL2.SDL.SDL_Rect { x = x, y = y, w = w, h = h };
                SDL2.SDL.SDL_RenderCopy(renderer, sprite, ref srcRect, ref destRect);

            }
        }

        private void DisposeSprites()
        {
            foreach (var spr in sprites) { try { Marshal.FreeHGlobal(spr); } catch { } }
            foreach (var spr2 in drawPtrs) { try { Marshal.FreeHGlobal(spr2); } catch { } }
        }

        #endregion


        #region Layers
        private bool requireDrawLayer0 = false;
        private bool requireDrawLayer1 = false;
        private IntPtr newLyerData0;
        private IntPtr newLyerData1;
        VideoLayerData videoLayerDatas0;
        VideoLayerData videoLayerDatas1;

        private void InitLayers()
        {
            layer0 = SDL2.SDL.SDL_CreateTexture(renderer, SDL2.SDL.SDL_PIXELFORMAT_BGRA8888, 1, ComputerWidth, ComputerHeight);
            layer1 = SDL2.SDL.SDL_CreateTexture(renderer, SDL2.SDL.SDL_PIXELFORMAT_BGRA8888, 1, ComputerWidth, ComputerHeight);
            SDL2.SDL.SDL_SetTextureBlendMode(layer0, SDL2.SDL.SDL_BlendMode.SDL_BLENDMODE_BLEND);
            SDL2.SDL.SDL_SetTextureBlendMode(layer1, SDL2.SDL.SDL_BlendMode.SDL_BLENDMODE_BLEND);
        }

        public void RequestRedrawLayers(IntPtr[] layer_lineV, VideoLayerData[] videoLayerDatas)
        {
            this.videoLayerDatas0 = videoLayerDatas[0];
            this.videoLayerDatas1 = videoLayerDatas[1];
            newLyerData0 = layer_lineV[0];
            newLyerData1 = layer_lineV[1];
            requireDrawLayer0 = true;
            requireDrawLayer1 = true;
        }
        public void RequestRedrawLayer(int layerIndex, IntPtr colorIndexes, VideoLayerData videoLayerData)
        {
            if (layerIndex == 0)
            {
                videoLayerDatas0 = videoLayerData;
                newLyerData0 = colorIndexes;
                requireDrawLayer0 = true;
            }
            else
            {
                videoLayerDatas1 = videoLayerData;
                newLyerData1 = colorIndexes;
                requireDrawLayer1 = true;
            }
        }
        private void StepLayers()
        {
            if (requireDrawLayer0)
            {
                RenderLayer(newLyerData0, layerData0, layer0, videoLayerDatas0);
                requireDrawLayer0 = false;
            }
            if (requireDrawLayer1)
            {
                RenderLayer(newLyerData1, layerData0, layer1, videoLayerDatas1);
                requireDrawLayer1 = false;
            }
        }
        public void RenderLayer(IntPtr layerColIndexes, IntPtr layerData, IntPtr layerTexture, VideoLayerData videoLayerData)
        {
            if (!videoLayerData.IsEnabled) return;
            var w = displayComposer.HStop - displayComposer.HStart;
            var h = displayComposer.VStop - displayComposer.VStart;
            for (int i = 0; i < ComputerWidth*ComputerHeight; i++)
            {
                var vall = Marshal.ReadByte(layerColIndexes + i);
                var col = palette[vall];
                Marshal.Copy(col, 0, layerData + (i * 4) , 4);
            }

            SDL2.SDL.SDL_UpdateTexture(layerTexture, IntPtr.Zero, layerData, StrideSize);
            var srcRect = new SDL2.SDL.SDL_Rect { x = 0, y = 0, w = (int)(w / displayComposer.HScale), h = (int)(h / displayComposer.VScale) };
            var destRect = new SDL2.SDL.SDL_Rect { x = displayComposer.HStart, y = displayComposer.VStart, w = w, h = h };
            SDL2.SDL.SDL_RenderCopy(renderer, layerTexture, ref srcRect, ref destRect);
        }

        private void DisposeLayers()
        {
            //try{ Marshal.FreeHGlobal(layer0); } catch (Exception) {  throw; }
            //try{ Marshal.FreeHGlobal(layer1); } catch (Exception) {  throw; }
            try{ Marshal.FreeHGlobal(layerData0); } catch (Exception) {  throw; }
            try{ Marshal.FreeHGlobal(layerData1); } catch (Exception) {  throw; }
        }

       
        #endregion

    }
}
