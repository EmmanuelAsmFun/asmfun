using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.IO;
using AsmFun.Core.Tools;
using System;
using System.Threading;

namespace AsmFun.Startup
{


    public class EventManagerSDL: IDisposable
    {
        public bool isDisposed;
        private KeyboardSDL keyboardSDL;
        private readonly IEmServiceResolverFactory container;

        public EventManagerSDL(IEmServiceResolverFactory container, IKeyboardAccess keyboardAccess)
        {
            this.container = container;
            keyboardSDL = new KeyboardSDL(container, keyboardAccess);
        }

        

        public void RunPollEvent()
        {
            SDL2.SDL.SDL_Event e;
            bool quit = false;
            while (!quit && !isDisposed)
            {
                try
                {
                    while (SDL2.SDL.SDL_PollEvent(out e) != 0 && !isDisposed)
                    {
                        Thread.Sleep(10);
                        quit = InterpretEvent(e);
                    }
                }
                catch (Exception ex)
                {
                    ConsoleHelper.WriteError<SDLWindow>(ex);
                }

            }
        }
        public bool InterpretEvent(SDL2.SDL.SDL_Event e)
        {
            var quit = false;
            switch (e.type)
            {
                case SDL2.SDL.SDL_EventType.SDL_QUIT:
                    {
                        quit = true;
                        var computerManager = container.Resolve<IComputerManager>();
                        computerManager.StopComputer();
                        break;
                    }
                case SDL2.SDL.SDL_EventType.SDL_KEYDOWN:
                    quit = keyboardSDL.DoKeyDown(e.key.keysym.sym); break;
                case SDL2.SDL.SDL_EventType.SDL_KEYUP:
                    quit = keyboardSDL.DoKeyUp(e.key.keysym.sym); break;
                case SDL2.SDL.SDL_EventType.SDL_MOUSEBUTTONDOWN: container.Resolve<IComputerManager>().MouseButtonDown(e.button.button == SDL2.SDL.SDL_BUTTON_LEFT ? 0 : 1); break;
                case SDL2.SDL.SDL_EventType.SDL_MOUSEBUTTONUP: container.Resolve<IComputerManager>().MouseButtonUp(e.button.button == SDL2.SDL.SDL_BUTTON_LEFT ? 0 : 1); break;
                case SDL2.SDL.SDL_EventType.SDL_MOUSEMOTION:
                    if (lastMouseX == e.motion.x && lastMouseY == e.motion.y) break; 
                    container.Resolve<IComputerManager>().MouseMove(e.motion.x - lastMouseX, e.motion.y - lastMouseY);
                    lastMouseX = e.motion.x;
                    lastMouseY = e.motion.y;
                    break;
            }
            return quit;
        }
        private int lastMouseX;
        private int lastMouseY;

        public void Dispose()
        {
            isDisposed = true;
            Thread.Sleep(12);
        }
    }
}
