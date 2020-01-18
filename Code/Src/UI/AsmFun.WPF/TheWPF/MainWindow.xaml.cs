#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.Data;
using AsmFun.Computer.Common.IO;
using AsmFun.Computer.Common.Managers;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using AsmFun.WPF;
using AsmFun.WPF.EnvTools;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
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
        private bool newFrame = false;
        private bool bgHasChanged = false;
        private IntPtr framebuffer;
        private bool isClosed;
        private int ComputerWidth;
        private int ComputerHeight;
        private int StrideSize;
        internal IEmServiceResolverFactory Container { get; set; }
        private IKeyboardAccess keyboardAccess;
        Int32Rect theRect;
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

        public MainWindow()
        {
            InitializeComponent();
            Loaded += MainWindow_Loaded;
            Closing += MainWindow_Closing;
            KeyDown += MainWindow_KeyDown;
            KeyUp += MainWindow_KeyUp;
            Topmost = true;
        }

        private void MainWindow_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            try
            {
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
            var computerManager = Container.Resolve<IComputerManager>();
            displayComposer = Container.Resolve<IDisplayComposer>();
            var computer = computerManager.GetComputer();
            if (computer == null) return;
            computerManager.SetDisplay(this);
            keyboardAccess = computer.GetKeyboard();
            _stopwatchWPF.Start();
            //ResizeInterBG();
            isInitialized = true;
        }

        public void Paint(IntPtr framebuffer, bool bgHasChanged)
        {
            newFrame = true;
            this.bgHasChanged = bgHasChanged;
            this.framebuffer = framebuffer;
        }


        public void ClockTick(ushort programCounter, double mhzRunning)
        {
            this.mhzRunning = mhzRunning;
            this.programCounter = programCounter;
            _frameCounterGameEngine++;
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
        }

        #region Keyboard

        private void MainWindow_KeyDown(object sender, KeyEventArgs e)
        {
            try
            {
                if (keyboardAccess == null) return;
                if (e.Key == Key.V && (e.KeyboardDevice.Modifiers & ModifierKeys.Control) != 0)
                    keyboardAccess.SetClipBoard(Clipboard.GetText().ToLower());
                var keyChar = KeyboardHelper.GetCharFromKey(e.Key);
                keyboardAccess.KeyDown(keyChar, (byte)e.Key);
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
                keyboardAccess.KeyUp(keyChar, (byte)e.Key);
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
            colors[0] = Color.FromArgb(0, 0, 0, 0);
            palette0 = new BitmapPalette(colors);
            colors[0] = Color.FromArgb(0xff, 0, 0, 0);
            palette1 = new BitmapPalette(colors);
            requireRefreshPalette = false;
            return true;
        }
        #endregion


        #region Sprites 
        private ISpriteAccess spriteAccess;
        private IDisplayComposer displayComposer;
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
                if (sprInfo == null || sprInfo.ZDepth == 0) return;
                var sRect = new Int32Rect(0, 0, sprInfo.Width, sprInfo.Height);
                var data = spriteAccess.ReadSpriteColIndexData(sprIndex);
                var w = (int)(sprInfo.Width * displayComposer.HScale);
                var h = (int)(sprInfo.Height * displayComposer.VScale);
                var wbitmap = new WriteableBitmap(sprInfo.Width, sprInfo.Height, 96, 96, PixelFormats.Indexed8, palette1);
                wbitmap.WritePixels(sRect, data, sprInfo.Width, 0);
                var sprite = sprites[sprIndex];
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
        VideoLayerData[] videoLayerDatas;
        public void RequestRedrawLayer(int layerIndex, IntPtr colorIndexes, VideoLayerData videoLayerDatas)
        {
            if (layerIndex == 0)
            {
                requireDrawLayer0 = true;
                newLyerData0 = colorIndexes;
            }
            else
            {
                requireDrawLayer1 = true;
                newLyerData1 = colorIndexes;
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
            if (!videoLayerData.IsEnabled) return;

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
        }
        #endregion
    }


}
