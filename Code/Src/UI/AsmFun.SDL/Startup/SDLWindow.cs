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
using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.Data;
using AsmFun.Computer.Common.IO;
using AsmFun.Computer.Common.Managers;
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
        private int StrideSize;
        public IEmServiceResolverFactory Container { get; set; }
        private IKeyboardAccess keyboardAccess;
        private int programCounter = 0;
        private Stopwatch _stopwatchWPF = new Stopwatch();
        private Stopwatch _stopwatchFramePaint = new Stopwatch();
        private int _frameCounterWpf = 0;
        private int _framePaintCounter = 0;
        private int _framePaintFpsCounter = 0;
        private int _frameCounterGameEngine = 0;
        private double mhzRunning;

        private IntPtr window;
        private IntPtr renderer;
        private IntPtr sdlTexture;
        private IntPtr font;
        SDL2.SDL.SDL_Color textColor;
        SDL2.SDL.SDL_Rect Message_rect = new SDL2.SDL.SDL_Rect();
        IntPtr surfaceMessage;
        IntPtr messageSurf;


        public SDLWindow()
        {
        }

       

        public void Init()
        {
            if (isInitialized) return;
            var computerManager = Container.Resolve<IComputerManager>();
            displayComposer = Container.Resolve<IDisplayComposer>();
            var computer = computerManager.GetComputer();
            if (computer == null) return;
            computerManager.SetDisplay(this);
            keyboardAccess = computer.GetKeyboard();
            _stopwatchFramePaint.Start();
            _stopwatchWPF.Start();
            isInitialized = true;
        }

        public void Init(int width, int height)
        {
            ComputerWidth = width;
            ComputerHeight = height;
            StrideSize = ComputerWidth * ComputerHeight * 4;
        }


        public void Start()
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                SDL2.SDL.SDL_SetHint(SDL2.SDL.SDL_HINT_WINDOWS_DISABLE_THREAD_NAMING, "1");
            if (SDL2.SDL.SDL_Init(SDL2.SDL.SDL_INIT_VIDEO) < 0)
            {
                Console.WriteLine("Unable to initialize SDL. Error: {0}", SDL2.SDL.SDL_GetError());
            }
            SDL2.SDL.SDL_CreateWindowAndRenderer(640, 480, SDL2.SDL.SDL_WindowFlags.SDL_WINDOW_RESIZABLE
                | SDL2.SDL.SDL_WindowFlags.SDL_WINDOW_SHOWN | SDL2.SDL.SDL_WindowFlags.SDL_WINDOW_OPENGL , out window, out renderer);
            //window = SDL2.SDL.SDL_CreateWindow("ASMFun - Commander X16", 0, 0, 640, 480, SDL2.SDL.SDL_WindowFlags.SDL_WINDOW_RESIZABLE
            //    | SDL2.SDL.SDL_WindowFlags.SDL_WINDOW_SHOWN | SDL2.SDL.SDL_WindowFlags.SDL_WINDOW_OPENGL );
            //renderer = SDL2.SDL.SDL_CreateRenderer(window, -1, SDL2.SDL.SDL_RendererFlags.SDL_RENDERER_TARGETTEXTURE | SDL2.SDL.SDL_RendererFlags.SDL_RENDERER_ACCELERATED);
            SDL2.SDL.SDL_SetWindowResizable(window, SDL2.SDL.SDL_bool.SDL_TRUE);
            sdlTexture = SDL2.SDL.SDL_CreateTexture(renderer, SDL2.SDL.SDL_PIXELFORMAT_RGB888, 1, 640, 460);
            SDL2.SDL.SDL_SetWindowTitle(window, "ASMFun - Commander X16");

            if (window == IntPtr.Zero)
            {
                Console.WriteLine("Unable to create a window. SDL. Error: {0}", SDL2.SDL.SDL_GetError());
                return;
            }
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

            SDL2.SDL.SDL_Event e;
            bool quit = false;
            while (!quit && !isDisposed)
            {
                try
                {
                    while (SDL2.SDL.SDL_PollEvent(out e) != 0 && !isDisposed)
                    {
                        Thread.Sleep(10);
                        switch (e.type)
                        {
                            case SDL2.SDL.SDL_EventType.SDL_QUIT:
                                {
                                    quit = true;
                                    var computerManager = Container.Resolve<IComputerManager>();
                                    computerManager.StopComputer();
                                    break;
                                }
                            case SDL2.SDL.SDL_EventType.SDL_KEYDOWN:
                                switch (e.key.keysym.sym)
                                {
                                    case SDL2.SDL.SDL_Keycode.SDLK_WWW:
                                        quit = true;
                                        var computerManager = Container.Resolve<IComputerManager>();
                                        computerManager.StopComputer();
                                        break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_SPACE: keyboardAccess.KeyDown(' ', 0); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_BACKSPACE: keyboardAccess.KeyDown(' ', 2); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_KP_ENTER:
                                    case SDL2.SDL.SDL_Keycode.SDLK_RETURN2:
                                    case SDL2.SDL.SDL_Keycode.SDLK_RETURN: keyboardAccess.KeyDown(' ', 6); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_UP: keyboardAccess.KeyDown(' ', 24); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_DOWN: keyboardAccess.KeyDown(' ', 26); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_LEFT: keyboardAccess.KeyDown(' ', 23); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_RIGHT: keyboardAccess.KeyDown(' ', 25); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_F1: keyboardAccess.KeyDown(' ', 90); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_F2: keyboardAccess.KeyDown(' ', 91); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_F3: keyboardAccess.KeyDown(' ', 92); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_F4: keyboardAccess.KeyDown(' ', 93); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_F5: keyboardAccess.KeyDown(' ', 94); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_F6: keyboardAccess.KeyDown(' ', 95); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_F7: keyboardAccess.KeyDown(' ', 96); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_F8: keyboardAccess.KeyDown(' ', 97); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_F9: keyboardAccess.KeyDown(' ', 98); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_F10: keyboardAccess.KeyDown(' ', 99); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_F11: keyboardAccess.KeyDown(' ', 100); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_F12: keyboardAccess.KeyDown(' ', 101); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_LCTRL: keyboardAccess.KeyDown(' ', 119); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_RSHIFT: keyboardAccess.KeyDown(' ', 117); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_LSHIFT: keyboardAccess.KeyDown(' ', 116); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_RALT: keyboardAccess.KeyDown(' ', 121); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_LALT: keyboardAccess.KeyDown(' ', 156); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_MINUS:
                                    case SDL2.SDL.SDL_Keycode.SDLK_KP_MINUS: keyboardAccess.KeyDown('-', 0); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_PLUS:
                                    case SDL2.SDL.SDL_Keycode.SDLK_KP_PLUS: keyboardAccess.KeyDown('+', 0); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_KP_MULTIPLY: keyboardAccess.KeyDown('*', 0); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_KP_DIVIDE: keyboardAccess.KeyDown('/', 0); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_KP_COMMA:
                                    case SDL2.SDL.SDL_Keycode.SDLK_COMMA: keyboardAccess.KeyDown(',', 0); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_SEMICOLON: keyboardAccess.KeyDown(';', 0); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_COLON: keyboardAccess.KeyDown(':', 0); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_KP_EQUALS:
                                    case SDL2.SDL.SDL_Keycode.SDLK_EQUALS: keyboardAccess.KeyDown('=', 0); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_DOLLAR: keyboardAccess.KeyDown('$', 0); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_CARET: keyboardAccess.KeyDown((char)32, 151); break;
                                    case SDL2.SDL.SDL_Keycode.SDLK_BACKSLASH: keyboardAccess.KeyDown('µ', 0); break;
                                    default:
                                        if ((int)e.key.keysym.sym == 249)
                                        {
                                            keyboardAccess.KeyUp('ù', 0);
                                            break;
                                        }
                                        var charr = e.key.keysym.sym.ToString().Replace("SDLK_", "");
                                        if (charr.IndexOf("KP_") > -1)
                                        {
                                            charr = charr.Replace("KP_", "");
                                            if (charr.Length == 1)
                                            {
                                                keyboardAccess.KeyDown(charr[0], int.Parse(charr) + 74);
                                                continue;
                                            }
                                        }
                                        else if (charr.Length == 1)
                                            keyboardAccess.KeyDown(charr[0], 0);
                                        //Console.WriteLine(charr);
                                        break;
                                }
                                break;
                            case SDL2.SDL.SDL_EventType.SDL_KEYUP:
                                {
                                    switch (e.key.keysym.sym)
                                    {
                                        case SDL2.SDL.SDL_Keycode.SDLK_SPACE: keyboardAccess.KeyUp(' ', 0); break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_BACKSPACE:keyboardAccess.KeyUp(' ', 2);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_KP_ENTER:
                                        case SDL2.SDL.SDL_Keycode.SDLK_RETURN2:
                                        case SDL2.SDL.SDL_Keycode.SDLK_RETURN:keyboardAccess.KeyUp(' ', 6);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_UP:keyboardAccess.KeyUp(' ', 24);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_DOWN:keyboardAccess.KeyUp(' ', 26);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_LEFT:keyboardAccess.KeyUp(' ', 23);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_RIGHT:keyboardAccess.KeyUp(' ', 25);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_F1:keyboardAccess.KeyUp(' ', 90);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_F2:keyboardAccess.KeyUp(' ', 91);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_F3:keyboardAccess.KeyUp(' ', 92);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_F4:keyboardAccess.KeyUp(' ', 93);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_F5:keyboardAccess.KeyUp(' ', 94);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_F6:keyboardAccess.KeyUp(' ', 95);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_F7:keyboardAccess.KeyUp(' ', 96);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_F8:keyboardAccess.KeyUp(' ', 97);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_F9:keyboardAccess.KeyUp(' ', 98);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_F10:keyboardAccess.KeyUp(' ', 99);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_F11:keyboardAccess.KeyUp(' ', 100);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_F12:keyboardAccess.KeyUp(' ', 101);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_LCTRL:keyboardAccess.KeyUp(' ', 119);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_RSHIFT:keyboardAccess.KeyUp(' ', 117);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_LSHIFT:keyboardAccess.KeyUp(' ', 116);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_RALT:keyboardAccess.KeyUp(' ', 121);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_LALT:keyboardAccess.KeyUp(' ', 156);break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_MINUS:
                                        case SDL2.SDL.SDL_Keycode.SDLK_KP_MINUS: keyboardAccess.KeyUp('-', 0); break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_PLUS:
                                        case SDL2.SDL.SDL_Keycode.SDLK_KP_PLUS: keyboardAccess.KeyUp('+', 0); break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_KP_MULTIPLY: keyboardAccess.KeyUp('*', 0); break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_KP_DIVIDE: keyboardAccess.KeyUp('/', 0); break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_KP_COMMA:
                                        case SDL2.SDL.SDL_Keycode.SDLK_COMMA: keyboardAccess.KeyUp(',', 0); break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_SEMICOLON: keyboardAccess.KeyUp(';', 0); break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_COLON: keyboardAccess.KeyUp(':', 0); break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_KP_EQUALS:
                                        case SDL2.SDL.SDL_Keycode.SDLK_EQUALS: keyboardAccess.KeyUp('=', 0); break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_DOLLAR: keyboardAccess.KeyUp('$', 0); break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_CARET: keyboardAccess.KeyUp((char)32, 151); break;
                                        case SDL2.SDL.SDL_Keycode.SDLK_BACKSLASH: keyboardAccess.KeyUp('µ', 0); break;
                                        default:
                                            if ((int)e.key.keysym.sym == 249)
                                            {
                                                keyboardAccess.KeyUp('ù', 0);
                                                break;
                                            }
                                            var charr = e.key.keysym.sym.ToString().Replace("SDLK_", "");
                                            if (charr.IndexOf("KP_") > -1)
                                            {
                                                charr = charr.Replace("KP_", "");
                                                if (charr.Length == 1)
                                                {
                                                    keyboardAccess.KeyUp(charr[0], int.Parse(charr) + 74);
                                                    continue;
                                                }
                                            }
                                            else if (charr.Length == 1)
                                                keyboardAccess.KeyUp(charr[0], 0);
                                            break;
                                    }
                                    break;
                                }
                        }
                    }
                }
                catch (Exception ex)
                {
                    ConsoleHelper.WriteError<SDLWindow>(ex);
                }
               
            }
        }
        public void Stop()
        {

            foreach (var spr in sprites) { try { Marshal.FreeHGlobal(spr); } catch { } }

            foreach (var spr2 in drawPtrs) { try { Marshal.FreeHGlobal(spr2); } catch { } }

            SDL2.SDL.SDL_DestroyWindow(window);
#if WINDOWS
#if DEBUG
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                SDL2.SDL_ttf.TTF_Quit();
#endif
#endif
            SDL2.SDL.SDL_Quit();
        }

        public void Paint(IntPtr framebuffer)
        {
            
            if (isDisposed) return;
            _framePaintCounter++;
            _framePaintFpsCounter++; ;
            if (_framePaintFpsCounter == 100)
            {
                _framePaintFpsCounter = 0;
                _stopwatchFramePaint.Restart();
            }
            IntPtr rect1 = new IntPtr(0);
            IntPtr rect2 = new IntPtr(0);
            IntPtr rect3 = new IntPtr(0);
            IntPtr rect4 = new IntPtr(0);

            SDL2.SDL.SDL_UpdateTexture(sdlTexture, IntPtr.Zero, framebuffer, 640 * 4);
            
            SDL2.SDL.SDL_RenderClear(renderer);
            
            SDL2.SDL.SDL_RenderCopy(renderer, sdlTexture, rect1, rect2);
            StepSprite();
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

        private void CalculateFps()
        {
            if (messageSurf == null) return;
#if WINDOWS
#if DEBUG
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                // Determine frame rate in fps (frames per second).
                long frameRateWpf = (long)(_frameCounterWpf / _stopwatchWPF.Elapsed.TotalSeconds);
                long framePaint = (long)(_framePaintFpsCounter / _stopwatchFramePaint.Elapsed.TotalSeconds);
                // Update elapsed time, number of frames, and frame rate.
                var txt = "fps " + (Math.Floor(mhzRunning / 1000) / 100).ToString() + " / " + frameRateWpf;
                surfaceMessage = SDL2.SDL_ttf.TTF_RenderText_Solid(font, txt, textColor);
                messageSurf = SDL2.SDL.SDL_CreateTextureFromSurface(renderer, surfaceMessage);
                var emptyRect = new SDL2.SDL.SDL_Rect() { x = 0, y = 00, w = 100, h = 100 };
                SDL2.SDL.SDL_RenderCopy(renderer, messageSurf, ref emptyRect, ref Message_rect);

                //myFrameCounterGameLabel.Text = _framePaintCounter.ToString("X2");
                //myFramePaintLabel.Text = framePaint.ToString();
                //myFrameRateWpfLabel.Text = frameRateWpf.ToString();
                //MymhzRunning.Text = (Math.Floor(mhzRunning / 1000) / 100).ToString();
                //myprogramCounterLabel.Text = programCounter.ToString("X4");
                _frameCounterWpf++;
            }
#endif
#endif
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
            var colors = paletteAccess.GetAllColors();
            palette = colorss;
            requireRefreshPalette = false;
            return true;
        }
        private void StepSprite()
        {
            if (isDisposed) return;
            if (requireRefreshPalette)
                if (!reloadPalette()) return;
            var transparent = new byte[] { 0, 0, 0, 0 };
            for (int sprIndex = 0; sprIndex < sprites.Count; sprIndex++)
            {
                if (isDisposed) return;
                var sprInfo = spriteAccess.GetSpriteInfo(sprIndex);
                if (sprInfo == null || sprInfo.ZDepth == 0) return;
                var w = (int)(sprInfo.Width * displayComposer.HScale);
                var h = (int)(sprInfo.Height * displayComposer.VScale);
                var x = (int)(sprInfo.X * displayComposer.HScale);
                var y = (int)(sprInfo.Y * displayComposer.VScale);
                // Check if it's in range
                if (x > displayComposer.HStop || y > displayComposer.VStop)
                    continue;

                if (sprites[sprIndex] == IntPtr.Zero)
                {
                    //var spr = SDL2.SDL.SDL_CreateTextureFromSurface(renderer, surfaceMessage);

                    var spr = SDL2.SDL.SDL_CreateTexture(renderer, SDL2.SDL.SDL_PIXELFORMAT_RGBA8888, 1, w, h);
                    SDL2.SDL.SDL_SetTextureBlendMode(spr, SDL2.SDL.SDL_BlendMode.SDL_BLENDMODE_BLEND);
                    sprites[sprIndex] = spr;
                    drawPtrs[sprIndex] = Marshal.AllocHGlobal(w*h * 4);
                }
                var drawPtr = drawPtrs[sprIndex];
                var sprite = sprites[sprIndex];
                SDL2.SDL.SDL_SetTextureBlendMode(sprite, SDL2.SDL.SDL_BlendMode.SDL_BLENDMODE_BLEND);
                var data = spriteAccess.ReadSpriteColIndexData(sprIndex);
               
                for (int i = 0; i < data.Length; i++)
                {
                    if (data[i] == 0)
                        Marshal.Copy(transparent,0, drawPtr + (i * 4), 4);
                    else
                    {
                        var col = palette[data[i]];
                        Marshal.Copy(col, 0, drawPtr + (i * 4)+1, 3);
                        Marshal.WriteByte(drawPtr + (i * 4) , 0xFF);
                    }
                }
                SDL2.SDL.SDL_UpdateTexture(sprite, IntPtr.Zero, drawPtr, w * 4);
                var srcRect = new SDL2.SDL.SDL_Rect { x = 0, y = 0, w = w, h = h };
                var destRect = new SDL2.SDL.SDL_Rect { x = x, y = y, w = w, h = h };
                SDL2.SDL.SDL_RenderCopy(renderer, sprite, ref srcRect, ref destRect);

            }
        }


        #endregion
    }
}
