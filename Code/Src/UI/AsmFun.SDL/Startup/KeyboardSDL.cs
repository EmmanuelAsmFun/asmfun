using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.IO;
using AsmFun.Computer.Common.Managers;
using System;

namespace AsmFun.Startup
{
    public class KeyboardSDL
    {
        private readonly IEmServiceResolverFactory container;
        private readonly IKeyboardAccess keyboardAccess;
        private bool quit;

        public KeyboardSDL(IEmServiceResolverFactory container,IKeyboardAccess keyboardAccess)
        {
            this.container = container;
            this.keyboardAccess = keyboardAccess;
        }

       
        public bool DoKeyDown(SDL2.SDL.SDL_Keycode sym)
        {
            return DoKeyAction(keyboardAccess.KeyDown, sym);
        } 
        public bool DoKeyUp(SDL2.SDL.SDL_Keycode sym)
        {
            return DoKeyAction(keyboardAccess.KeyUp, sym);
        }
        private bool DoKeyAction(Action<char, int> keyAction, SDL2.SDL.SDL_Keycode sym)
        {
            quit = false;
            switch (sym)
            {
                case SDL2.SDL.SDL_Keycode.SDLK_WWW:
                    quit = true;
                    var computerManager = container.Resolve<IComputerManager>();
                    computerManager.StopComputer();
                    break;
                case SDL2.SDL.SDL_Keycode.SDLK_SPACE: keyAction(' ', 0); break;
                case SDL2.SDL.SDL_Keycode.SDLK_BACKSPACE: keyAction(' ', 2); break;
                case SDL2.SDL.SDL_Keycode.SDLK_KP_ENTER:
                case SDL2.SDL.SDL_Keycode.SDLK_RETURN2:
                case SDL2.SDL.SDL_Keycode.SDLK_RETURN: keyAction(' ', 6); break;
                case SDL2.SDL.SDL_Keycode.SDLK_UP: keyAction(' ', 24); break;
                case SDL2.SDL.SDL_Keycode.SDLK_DOWN: keyAction(' ', 26); break;
                case SDL2.SDL.SDL_Keycode.SDLK_LEFT: keyAction(' ', 23); break;
                case SDL2.SDL.SDL_Keycode.SDLK_RIGHT: keyAction(' ', 25); break;
                case SDL2.SDL.SDL_Keycode.SDLK_F1: keyAction(' ', 90); break;
                case SDL2.SDL.SDL_Keycode.SDLK_F2: keyAction(' ', 91); break;
                case SDL2.SDL.SDL_Keycode.SDLK_F3: keyAction(' ', 92); break;
                case SDL2.SDL.SDL_Keycode.SDLK_F4: keyAction(' ', 93); break;
                case SDL2.SDL.SDL_Keycode.SDLK_F5: keyAction(' ', 94); break;
                case SDL2.SDL.SDL_Keycode.SDLK_F6: keyAction(' ', 95); break;
                case SDL2.SDL.SDL_Keycode.SDLK_F7: keyAction(' ', 96); break;
                case SDL2.SDL.SDL_Keycode.SDLK_F8: keyAction(' ', 97); break;
                case SDL2.SDL.SDL_Keycode.SDLK_F9: keyAction(' ', 98); break;
                case SDL2.SDL.SDL_Keycode.SDLK_F10: keyAction(' ', 99); break;
                case SDL2.SDL.SDL_Keycode.SDLK_F11: keyAction(' ', 100); break;
                case SDL2.SDL.SDL_Keycode.SDLK_F12: keyAction(' ', 101); break;
                case SDL2.SDL.SDL_Keycode.SDLK_LCTRL: keyAction(' ', 119); break;
                case SDL2.SDL.SDL_Keycode.SDLK_RSHIFT: keyAction(' ', 117); break;
                case SDL2.SDL.SDL_Keycode.SDLK_LSHIFT: keyAction(' ', 116); break;
                case SDL2.SDL.SDL_Keycode.SDLK_RALT: keyAction(' ', 121); break;
                case SDL2.SDL.SDL_Keycode.SDLK_LALT: keyAction(' ', 156); break;
                case SDL2.SDL.SDL_Keycode.SDLK_MINUS:
                case SDL2.SDL.SDL_Keycode.SDLK_KP_MINUS: keyAction('-', 0); break;
                case SDL2.SDL.SDL_Keycode.SDLK_PLUS:
                case SDL2.SDL.SDL_Keycode.SDLK_KP_PLUS: keyAction('+', 0); break;
                case SDL2.SDL.SDL_Keycode.SDLK_KP_MULTIPLY: keyAction('*', 0); break;
                case SDL2.SDL.SDL_Keycode.SDLK_KP_DIVIDE: keyAction('/', 0); break;
                case SDL2.SDL.SDL_Keycode.SDLK_KP_COMMA:
                case SDL2.SDL.SDL_Keycode.SDLK_COMMA: keyAction(',', 0); break;
                case SDL2.SDL.SDL_Keycode.SDLK_SEMICOLON: keyAction(';', 0); break;
                case SDL2.SDL.SDL_Keycode.SDLK_COLON: keyAction(':', 0); break;
                case SDL2.SDL.SDL_Keycode.SDLK_KP_EQUALS:
                case SDL2.SDL.SDL_Keycode.SDLK_EQUALS: keyAction('=', 0); break;
                case SDL2.SDL.SDL_Keycode.SDLK_DOLLAR: keyAction('$', 0); break;
                case SDL2.SDL.SDL_Keycode.SDLK_CARET: keyAction((char)32, 151); break;
                case SDL2.SDL.SDL_Keycode.SDLK_BACKSLASH: keyAction('µ', 0); break;
                default:
                    if ((int)sym == 249)
                    {
                        keyboardAccess.KeyUp('ù', 0);
                        break;
                    }
                    var charr = sym.ToString().Replace("SDLK_", "");
                    if (charr.IndexOf("KP_") > -1)
                    {
                        charr = charr.Replace("KP_", "");
                        if (charr.Length == 1)
                        {
                            keyAction(charr[0], int.Parse(charr) + 74);
                            return quit;
                        }
                    }
                    else if (charr.Length == 1)
                        keyAction(charr[0], 0);
                    //Console.WriteLine(charr);
                    break;
            }
            return quit;
        }
    }
}
