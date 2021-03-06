﻿#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.CommanderX16.Audio;
using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common;
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.IO;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using AsmFun.Computer.Core.Sound.Yamaha2151;
using AsmFun.Startup;
using AsmFun.WPF;
using AsmFun.WPF.EnvTools;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;


namespace AsmFun.WPF
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window, IComputerDisplay
    {
        private bool isClosing;
        private bool newFrame = false;
        private bool bgHasChanged = false;
        private IntPtr framebuffer;
        private bool isClosed;
        private int ComputerWidth;
        private int ComputerHeight;
        private int StrideSize;
        internal IEmServiceResolverFactory Container { get; set; }
        private IKeyboardAccess keyboardAccess;
        private Int32Rect theRect;
        private int programCounter = 0;
        private Stopwatch _stopwatchWPF = new Stopwatch();
        private Stopwatch _stopwatchFramePaint = new Stopwatch();
        private int _frameCounterWpf = 0;
        private int _framePaintCounter = 0;
        private int _framePaintFpsCounter = 0;
        private int _frameCounterGameEngine = 0;
        private double mhzRunning;

        private bool isInitialized;
        private List<Image> sprites = new List<Image>();
        private SDLSound sound;
        private DirectXSound sound2;
        private int lastMousePositionX;
        private int lastMousePositionY;
        private bool isNewFrameForActions = false;
        private Queue<Action<IComputerManager>> toSendInComputer = new Queue<Action<IComputerManager>>();
        private Queue<Action<IKeyboardAccess>> toSendInKeyboardAccess = new Queue<Action<IKeyboardAccess>>();

        public MainWindow()
        {
            InitializeComponent();
            Loaded += MainWindow_Loaded;
            Closing += MainWindow_Closing;
            KeyDown += MainWindow_KeyDown;
            KeyUp += MainWindow_KeyUp;
            MouseLeftButtonDown += (s,e) => ExcecuteSafeOnComputer(c => c.MouseButtonDown(0));
            MouseLeftButtonUp += (s, e) => ExcecuteSafeOnComputer(c => c.MouseButtonUp(0));
            MouseRightButtonDown += (s, e) => ExcecuteSafeOnComputer(c => c.MouseButtonDown(1));
            MouseRightButtonUp += (s, e) => ExcecuteSafeOnComputer(c => c.MouseButtonUp(1));
            MouseMove += (s, e) =>
            {
                var pos = e.GetPosition(myCont);
                var newX = (int)Math.Floor(pos.X);
                var newY = (int)Math.Floor(pos.Y);
                if ((newX == lastMousePositionX && newY == lastMousePositionY) || newX > 640 || newX <0 || newY <0 || newY > 480) return;
                var newPosX = newX - lastMousePositionX;
                var newPosY = newY - lastMousePositionY;
                //Console.WriteLine($"MouseUI {newX} x {newY} \t\t {newPosX} x {newPosY}");
                ExcecuteSafeOnComputer(c => c.MouseMove(newPosX, newPosY));
                lastMousePositionX = newX;
                lastMousePositionY = newY;
            };
            //sound2 = new DirectXSound();
            //sound2.Init();
            sound = new SDLSound();
            if (SDL2.SDL.SDL_Init(SDL2.SDL.SDL_INIT_AUDIO | SDL2.SDL.SDL_INIT_GAMECONTROLLER) < 0)
                Console.WriteLine("Unable to initialize SDL. Error: {0}", SDL2.SDL.SDL_GetError());
            sound.Init(8);
            Topmost = true;
        }

      
        private void ExcecuteSafeOnComputer(Action<IComputerManager> action)
        {
            try
            {
                lock (toSendInComputer)
                    toSendInComputer.Enqueue(action);
                
            }
            catch (Exception)
            {
            }
        }

        private void MainWindow_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            try
            {
                isClosing = true;
                joystickReader.Dispose();
                sound.Dispose();
                //sound2.Dispose();
                SDL2.SDL.SDL_Quit();
                isClosed = true;
                var computerManager = Container.Resolve<IComputerManager>();
                computerManager.StopComputer();
            }
            catch (Exception)
            {
            }
        }

        private void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
#if DEBUG
            if (WindowsUIFactory.DualScreenXOffset > 0)
            {
                // Move the screen on the second Display, out of my code :)
                Left = WindowsUIFactory.DualScreenXOffset + WindowsUIFactory.ConsoleWidth + 20;
                Top = 10;
            }
#endif
            CompositionTarget.Rendering += CompositionTarget_Rendering;
            InitComputer();
        }

        public void Init(int width, int height)
        {
            ComputerWidth = width;
            ComputerHeight = height;
            StrideSize = ComputerWidth * ComputerHeight * 4;
            _stopwatchFramePaint.Start();
            theRect = new Int32Rect(0, 0, ComputerWidth, ComputerHeight);
            img.Width = ComputerWidth;
            img.Height = ComputerHeight;
            myCont.Width = ComputerWidth;
            myCont.Height = ComputerHeight;
        }

        private void InitComputer()
        {
            if (isInitialized) return;
            Container.Update<IAudioPlayer>(sound);
            var computerManager = Container.Resolve<IComputerManager>();
            displayComposer = Container.Resolve<IDisplayComposer>();
            joystickReader = Container.Resolve<IJoystickReader>();
            var computer = computerManager.GetComputer();
            if (computer == null) return;
            computerManager.SetDisplay(this);
            sound.InitDevices(Container.Resolve<IVeraPsg>(), Container.Resolve<IVeraPCM>(), Container.Resolve<Ym2151>());
            //computer.SetWriteAudioMethod(sound2.WriteAudio);
            keyboardAccess = computer.GetKeyboard();
            // Todo: Find a solution to make a sdl window to be able to use the joystick
            joystickReader.Init();
            _stopwatchWPF.Start();
            //ResizeInterBG();
            isInitialized = true;
        }

        public void Paint(IntPtr framebuffer, bool bgHasChanged)
        {
            newFrame = true;
            this.bgHasChanged = bgHasChanged;
            this.framebuffer = framebuffer;
            isNewFrameForActions = true;
        }


        public void ClockTick(ushort programCounter, double mhzRunning)
        {
            this.mhzRunning = mhzRunning;
            this.programCounter = programCounter;
            _frameCounterGameEngine++;
      
            // Send new actions in processor thread.
            if (!isNewFrameForActions) return;
            isNewFrameForActions = false;
            if (toSendInComputer.Count > 0)
            {
                var computerManager = Container.Resolve<IComputerManager>();
                while (toSendInComputer.Count > 0)
                {
                    Action<IComputerManager> toSendItem;
                    lock (toSendInComputer)
                        toSendItem = toSendInComputer.Dequeue();
                    toSendItem(computerManager);
                }
            }
            if (toSendInKeyboardAccess.Count > 0)
            {
                while (toSendInKeyboardAccess.Count > 0)
                {
                    Action<IKeyboardAccess> toSendItem;
                    lock (toSendInKeyboardAccess)
                        toSendItem = toSendInKeyboardAccess.Dequeue();
                    toSendItem(keyboardAccess);
                }
            }
        }

        private void CompositionTarget_Rendering(object sender, EventArgs e)
        {
            // Determine frame rate in fps (frames per second).
            long frameRateWpf = (long)(_frameCounterWpf / this._stopwatchWPF.Elapsed.TotalSeconds);
            long framePaint = (long)(_framePaintFpsCounter / this._stopwatchFramePaint.Elapsed.TotalSeconds);
            // Update elapsed time, number of frames, and frame rate.
            myFrameCounterGameLabel.Text = _framePaintCounter.ToString("X2");
            myFramePaintLabel.Text = framePaint.ToString();
            //myFrameCounterLabel.Text = _frameCounter.ToString();
            myFrameRateWpfLabel.Text = frameRateWpf.ToString();
            MymhzRunning.Text = (Math.Floor(mhzRunning / 1000) / 100).ToString();
            myprogramCounterLabel.Text = programCounter.ToString("X4");
            _frameCounterWpf++;

            if (newFrame && paletteAccess != null)
            {
                _framePaintCounter++; ;
                _framePaintFpsCounter++; ;
                if (_framePaintFpsCounter == 100)
                {

                    _framePaintFpsCounter = 0;
                    _stopwatchFramePaint.Restart();
                }

                if (requireRefreshPalette)
                    if (!ReloadPalette()) return;
                if (bgHasChanged)
                    StepBackground();
                StepLayers();
                StepSprite();
                newFrame = false;
            }
            joystickReader.UpdateStates();
            if (isClosing) return;
        }

        #region Keyboard

        private void MainWindow_KeyDown(object sender, KeyEventArgs e)
        {
            try
            {
                if (keyboardAccess == null) return;
                if (e.Key == Key.V && (e.KeyboardDevice.Modifiers & ModifierKeys.Control) != 0)
                    keyboardAccess.SetClipBoard(Clipboard.GetText());
                var keyChar = KeyboardHelper.GetCharFromKey(e.Key);
                lock (toSendInKeyboardAccess)
                    toSendInKeyboardAccess.Enqueue(k => k.KeyDown(keyChar, (byte)e.Key));
            }
            catch (Exception)
            {
            }
        }
        private void MainWindow_KeyUp(object sender, KeyEventArgs e)
        {
            try
            {
                if (keyboardAccess == null) return;
                var keyChar = KeyboardHelper.GetCharFromKey(e.Key);
                lock (toSendInKeyboardAccess)
                    toSendInKeyboardAccess.Enqueue(k => k.KeyUp(keyChar, (byte)e.Key));
            }
            catch (Exception)
            {
            }
        }


        #endregion

        public void MymhzRunning_MouseDown(object sender, MouseButtonEventArgs e)
        {
            try
            {
                var computerManager = Container.Resolve<IComputerManager>();
                var computer = computerManager.GetComputer();
                if (computer == null) return;
                computer.LockOnMhz = !computer.LockOnMhz;
            }
            catch (Exception)
            {
            }
        }
        public void MyfpsRunning_MouseDown(object sender, MouseButtonEventArgs e)
        {
            try
            {
                var computerManager = Container.Resolve<IComputerManager>();
                var computer = computerManager.GetComputer();
                if (computer == null) return;
                computer.LockOnFps = !computer.LockOnFps;
            }
            catch (Exception)
            {
            }
        }


        public void CloseDisplay()
        {
            if (isClosed) return;
            Dispatcher.Invoke(() =>
            {
                
                Close();
            });
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            if (DebugInfo == null) return;
            if (DebugInfo.Visibility == Visibility.Visible)
                DebugInfo.Visibility = Visibility.Collapsed;
            else
                DebugInfo.Visibility = Visibility.Visible;
        }
        private void StepBackground()
        {
            var wbitmap = new WriteableBitmap(ComputerWidth, ComputerHeight, 96, 96, PixelFormats.Bgr32, null);
            wbitmap.WritePixels(theRect, framebuffer, StrideSize, ComputerWidth * 4);
            img.Source = wbitmap;
            bgHasChanged = false;
        }
   

        #region Palette
        public void InitPalette(IVideoPaletteAccess paletteAccess)
        {
            this.paletteAccess = paletteAccess;
            requireRefreshPalette = true;
        }
        public void RequireRefreshPalette()
        {
            requireRefreshPalette = true;
        }

        private bool ReloadPalette()
        {
            if (paletteAccess == null) return false;
            var colorss = paletteAccess.GetAllColors();
            if (colorss == null) return false;
            var colors = colorss.Select(x => Color.FromRgb(x[0], x[1], x[2])).ToList();
            colors[0] = Color.FromArgb(0xff, 0, 0, 0);
            palette0 = new BitmapPalette(colors);
            colors[0] = Color.FromArgb(0, 0, 0, 0);
            palette1 = new BitmapPalette(colors);
            requireRefreshPalette = false;
            return true;
        }
        #endregion


        #region Sprites 
        private ISpriteAccess spriteAccess;
        private IDisplayComposer displayComposer;
        private IJoystickReader joystickReader;
        private BitmapPalette palette0;
        private BitmapPalette palette1;
        private IVideoPaletteAccess paletteAccess;
        private bool requireRefreshPalette;
        public void InitSprites(ISpriteAccess spriteAccess)
        {
            this.spriteAccess = spriteAccess;
            sprites = new Image[spriteAccess.NumberOfTotalSprites].ToList();
            requireRefreshPalette = true;
        }

        private void StepSprite()
        {
            for (int sprIndex = 0; sprIndex < sprites.Count; sprIndex++)
            {
                var sprInfo = spriteAccess.GetSpriteInfo(sprIndex);
                var sprite = sprites[sprIndex];
                if (sprInfo == null || sprInfo.ZDepth == 0)
                {
                    if (sprite != null)
                        sprite.Visibility = Visibility.Hidden;
                    continue;
                }
                var sRect = new Int32Rect(0, 0, sprInfo.Width, sprInfo.Height);
                var data = spriteAccess.ReadSpriteColIndexData(sprIndex);
                var w = (int)(sprInfo.Width * displayComposer.HScale);
                var h = (int)(sprInfo.Height * displayComposer.VScale);
                var wbitmap = new WriteableBitmap(sprInfo.Width, sprInfo.Height, 96, 96, PixelFormats.Indexed8, palette1);
                wbitmap.WritePixels(sRect, data, sprInfo.Width, 0);
                if (sprites[sprIndex] == null)
                {
                    sprite = new Image();
                    sprite.HorizontalAlignment = HorizontalAlignment.Left;
                    sprite.VerticalAlignment = VerticalAlignment.Top;
                    sprite.Stretch = Stretch.Fill;
                    sprites[sprIndex] = sprite;
                    myCont.Children.Add(sprite);
                }
                Canvas.SetZIndex(sprite, sprInfo.ZDepth * 500);
                sprite.Source = wbitmap;
                sprite.Width = w;
                sprite.Height = h;
                sprite.Margin = new Thickness(sprInfo.X * displayComposer.HScale, sprInfo.Y * displayComposer.VScale, 0, 0);
                if (sprInfo.X * displayComposer.HScale > displayComposer.HStop ||
                    sprInfo.Y * displayComposer.VScale > displayComposer.VStop)
                    sprite.Visibility = Visibility.Hidden;
                else
                    sprite.Visibility = Visibility.Visible;
            }
        }




        #endregion


        #region Layers
        private bool requireDrawLayer0 = false;
        private bool requireDrawLayer1 = false;
        private IntPtr newLyerData0;
        private IntPtr newLyerData1;
        VideoLayerData[] videoLayerDatas = new[] { new VideoLayerData(0), new VideoLayerData(1) };
        

        public void RequestRedrawLayer(int layerIndex, IntPtr colorIndexes, VideoLayerData videoLayerData)
        {
            if (layerIndex == 0)
            {
                requireDrawLayer0 = true;
                newLyerData0 = colorIndexes;
                videoLayerDatas[0] = videoLayerData;
            }
            else
            {
                requireDrawLayer1 = true;
                newLyerData1 = colorIndexes;
                videoLayerDatas[1] = videoLayerData;
            }
        }
        public void RequestRedrawLayers(IntPtr[] layer_lineV, VideoLayerData[] videoLayerDatas)
        {
            this.videoLayerDatas = videoLayerDatas;
            newLyerData0 = layer_lineV[0];
            newLyerData1 = layer_lineV[1];
            requireDrawLayer0 = true;
            requireDrawLayer1 = true;
        }
        private void StepLayers()
        {
            if (requireDrawLayer0)
                RenderLayer(newLyerData0, layer0, videoLayerDatas[0], palette0);
            if (requireDrawLayer1)
                RenderLayer(newLyerData1, layer1, videoLayerDatas[1], palette1);
            requireDrawLayer0 = false;
            requireDrawLayer1 = false;
        }

        private void RenderLayer(IntPtr layerData, Image layerImg, VideoLayerData videoLayerData, BitmapPalette palette)
        {
            if (!videoLayerData.IsEnabled)
            {
                layerImg.Visibility = Visibility.Hidden;
                return;
            }

            var w = displayComposer.HStop - displayComposer.HStart;
            var h = displayComposer.VStop - displayComposer.VStart;
            var sRect = new Int32Rect(0, 0, (int)(w / displayComposer.HScale), (int)(h / displayComposer.VScale));
            var wbitmap = new WriteableBitmap(ComputerWidth, ComputerHeight, 96, 96, PixelFormats.Indexed8, palette);
            wbitmap.WritePixels(sRect, layerData, StrideSize, ComputerWidth);
            var cropped = new CroppedBitmap(wbitmap,
                new Int32Rect(displayComposer.HStart, 0, w, h));
            layerImg.Source = cropped;
            layerImg.Width = w * displayComposer.HScale;
            layerImg.Height = h * displayComposer.VScale;
            layerImg.Visibility = Visibility.Visible;
        }
        #endregion
    }


}
