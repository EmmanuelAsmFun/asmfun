#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading;
using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.Data;
using AsmFun.Computer.Common.IO;
using AsmFun.Computer.Common.Managers;
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
            SDL2.SDL.SDL_CreateWindowAndRenderer(640, 480, 0, out window, out renderer);
            //window = SDL2.SDL.SDL_CreateWindow("ASMFun - Commander X16", 0, 0, 640, 480, SDL2.SDL.SDL_WindowFlags.SDL_WINDOW_RESIZABLE );
            //renderer = SDL2.SDL.SDL_CreateRenderer(window, -1, SDL2.SDL.SDL_RendererFlags.SDL_RENDERER_ACCELERATED);
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
                while (SDL2.SDL.SDL_PollEvent(out e) != 0 && !isDisposed)
                {
                    Thread.Sleep(100);
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
                                case SDL2.SDL.SDL_Keycode.SDLK_q:
                                    quit = true;
                                    var computerManager = Container.Resolve<IComputerManager>();
                                    computerManager.StopComputer();
                                    break;
                            }
                            break;
                    }
                }
            }
        }
        public void Stop()
        {
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

    }
}
