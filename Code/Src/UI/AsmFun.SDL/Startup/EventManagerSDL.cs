using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.IO;
using AsmFun.Computer.Common.Managers;
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
            }
            return quit;
        }

        public void Dispose()
        {
            isDisposed = true;
        }
    }
}
