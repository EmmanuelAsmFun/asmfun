#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.Data;
using AsmFun.Computer.Common.IO;
using AsmFun.Computer.Common.Managers;
using AsmFun.WPF.EnvTools;
using System;
using System.Diagnostics;
using System.Windows;
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
        }

        private void InitComputer()
        {
            if (isInitialized) return;
            var computerManager = Container.Resolve<IComputerManager>();
            var computer = computerManager.GetComputer();
            if (computer == null) return;
            computerManager.SetDisplay(this);
            keyboardAccess = computer.GetKeyboard();
            _stopwatchWPF.Start();
            isInitialized = true;
        }

        public void Paint(IntPtr framebuffer)
        {
            Dispatcher.Invoke(() =>
            {
                _framePaintCounter++; ;
                _framePaintFpsCounter++; ;
                if (_framePaintFpsCounter == 100)
                {
                    _framePaintFpsCounter = 0;
                    _stopwatchFramePaint.Restart();
                }
                var wbitmap = new WriteableBitmap(ComputerWidth, ComputerHeight, 96, 96, PixelFormats.Bgr32, null);
                wbitmap.WritePixels(theRect, framebuffer, StrideSize, ComputerWidth * 4);
                img.Source = wbitmap;
            });
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
            MymhzRunning.Text = (Math.Floor(mhzRunning/ 1000)/100).ToString();
            myprogramCounterLabel.Text = programCounter.ToString("X4");
            _frameCounterWpf++;
        }

        #region Keyboard

        private void MainWindow_KeyDown(object sender, KeyEventArgs e)
        {
            try
            {
                if (keyboardAccess == null) return;
                if (e.Key == Key.V && (e.KeyboardDevice.Modifiers & ModifierKeys.Control) !=0)
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

        private void MymhzRunning_MouseDown(object sender, MouseButtonEventArgs e)
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
            if (DebugInfo.Visibility == Visibility.Visible)
                DebugInfo.Visibility = Visibility.Collapsed;
            else
                DebugInfo.Visibility = Visibility.Visible;
        }
    }


}
