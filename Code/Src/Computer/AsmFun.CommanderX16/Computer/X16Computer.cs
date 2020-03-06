#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.CommanderX16.IO;
using AsmFun.CommanderX16.Video.Access;
using AsmFun.Common.Processors;
using AsmFun.Common.ServiceLoc;
using AsmFun.Core.Tools;
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Debugger;
using AsmFun.Computer.Common.Processors;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Core.Video;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading;
using AsmFun.Computer.Core.Computer;
using AsmFun.Computer.Common.IO;
using AsmFun.Computer.Common.IO.Data;
using AsmFun.Computer.Common.Memory;

namespace AsmFun.CommanderX16.Computer
{

    public class X16Computer : IComputer
    {
        Stopwatch elapsedWatcher = new Stopwatch();
        public bool IsRunning { get; set; }
        public bool IsStarting { get; set; }

        public static IX16PS2Access S_PS2;
        public event EventHandler OnLoaded;
        public event EventHandler OnReady;
        private Action StepAddonAction = () => { };

        private int slower = 10;
        private bool isDisposed;
        private bool pcIsLoaded;
        private int stepCounter;
        private int mhzCounter;
        private double mhzRequired;
        private bool lockOnMhz;
        private bool lockOnFps;
        private double mhzRunning;
        private List<Type> _usedServices = new List<Type>();

        private readonly IEmServiceResolverFactory container;
        private X16VeraSpi veraSpi;
        private IVideoAccess videoAccess;
        private IX16PS2Access ps2;
        private IProcessor processor;
        private X16JoystickData joystick;
        private IComputerDiagnose diagnose;
        private readonly IKeyboardAccess keyboardAccess;
        private IComputerAccess computerAccess;
        private ProcessorData processorData;
        private ComputerSetupSettings computerSetupSettings;
        private IDebuggerInternal debugger;
        private IComputerDisplay display;
        private VideoProcessor videoProcessor;
        private IProgramAccess programAccess;
        private IUart uart;

        public bool SoundEnabled { get; set; }

        public X16Computer(X16JoystickData joystickData, IVideoAccess videoAccess, IComputerAccess computerAccess,
            IX16PS2Access ps2Data, X16VeraSpi veraSpi, IEmServiceResolverFactory container, IDebugger debugger,
            ComputerSetupSettings computerSettings, IProcessor processor, ProcessorData processorData, IComputerDiagnose diagnose, 
            IKeyboardAccess keyboardAccess, IUart uart, IProgramAccess programAccess
            )
        {
            IsStarting = true;
            display = new DummyComputerDisplay();
            this.veraSpi = veraSpi;
            this.uart = uart;
            this.processor = processor;
            this.videoAccess = videoAccess;
            this.computerAccess = computerAccess;
            this.container = container;
            this.programAccess = programAccess;
            this.debugger = (IDebuggerInternal)debugger;
            this.processorData = processorData;
            joystick = joystickData;
            computerSetupSettings = computerSettings;
            ps2 = ps2Data;
            S_PS2 = ps2Data;
            this.diagnose = diagnose;
            this.keyboardAccess = keyboardAccess;
            mhzRequired = computerSettings.Mhz * 100000;
            lockOnMhz = computerSettings.LockOnMhz;
            videoAccess.SetDisplay(display);
            videoProcessor = new VideoProcessor(videoAccess);
        }

        internal void ParseUsedServiceTypes(List<Type> list)
        {
            _usedServices = list;
        }


        public void StartComputer()
        {
            try
            {
                computerAccess.LoadROM();
                Reset();
                PrepareReadyEvent();
                stepCounter = 0;
                OnReady?.Invoke(this, null);
                elapsedWatcher.Start();
                IsStarting = false;
                IsRunning = true;
                MainLoop();
                Dispose();
            }
            catch (Exception e)
            {
                Console.WriteLine();
                ConsoleHelper.WriteError<X16Computer>(e, "StartComputer");
                Console.WriteLine();
            }
        }




        private void MainLoop()
        {
            videoProcessor.Start();
            while (!isDisposed)
            {
                try
                {
                    while (!isDisposed)
                    {
                        diagnose?.Step(processorData);
                        if (debugger.DoBreak(processorData.ProgramCounter))
                        {
                            Thread.Sleep(5);
                            continue;
                        }

                        uint old_clockticks6502 = processorData.ClockTicks;
                        programAccess.Step();
                        processor.Step();
                        byte clocks = (byte)(processorData.ClockTicks - old_clockticks6502);

                        //Console.Write(stepCounter+":pc=" + this.fake6502.pc.ToString("X4") + ":" + clocks+"|");
                        for (byte i = 0; i < clocks; i++)
                        {

                            ps2.Step();
                            joystick.Step();
                            veraSpi.Step();
                            uart.Step();
                            videoAccess.ProcessorStep();
                            display.ClockTick(processorData.ProgramCounter, mhzRunning);
                            CheckFps();
                        }

                        stepCounter++;

                        StepAddonAction();

                        if (videoAccess.GetIrqOut())
                        {
                            if ((processorData.Status & 4) == 0)
                                processor.TriggerVideoIrq();
                        }
                        keyboardAccess.Step();
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine();
                    ConsoleHelper.WriteError<X16Computer>(e, "MainLoop");
                    Console.WriteLine();
                }
            }
        }


        private void CheckFps()
        {
            mhzCounter++;
            mhzRunning = mhzCounter / elapsedWatcher.Elapsed.TotalSeconds;
            if (mhzCounter == 1000000)
            {
                mhzCounter = 0;
                elapsedWatcher.Restart();
            }

            // During startup, go full speed.
            if (!pcIsLoaded || !lockOnMhz) return;
            var offset = mhzRunning - mhzRequired;
            if (offset > 0)
            {
                var sleepp = Convert.ToInt32(offset / 10000);
                slower = sleepp;
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

        private void PrepareReadyEvent()
        {
            StepAddonAction = () =>
            {
                if (!processor.IsOnReadyAddress()) return;
                pcIsLoaded = true;
                Console.WriteLine("Computer Loaded");
                OnLoaded?.Invoke(this, null);
                StepAddonAction = () => { };
            };
        }


        public void Reset()
        {
            if (isDisposed) throw new ObjectDisposedException(GetType().Name);
            veraSpi.Reset();
            computerAccess.Reset();
            videoAccess.Reset();
            processor.Reset();
        }

        public bool LockOnMhz
        {
            get { return lockOnMhz; }
            set
            {
                lockOnMhz = value;
                var required = Math.Floor((decimal)(mhzRequired / 100000));
                videoAccess.LockOnMhz(value);
                Console.WriteLine($"Set LockOnMhz {required}Mhz :" + value);
            }
        } 
        public bool LockOnFps
        {
            get { return lockOnFps; }
            set
            {
                lockOnFps = value;
                videoAccess.LockOnFps(value);
            }
        }


        public void KeyDown(KeyboardKey keyboardKey)
        {
            var charr = !string.IsNullOrEmpty(keyboardKey.Key) ? keyboardKey.Key[0] : (char)0;
            keyboardAccess.KeyDown(charr, keyboardKey.Which);
        }

        public void KeyUp(KeyboardKey keyboardKey)
        {
            var charr = !string.IsNullOrEmpty(keyboardKey.Key) ? keyboardKey.Key[0] : (char)0;
            keyboardAccess.KeyDown(charr, keyboardKey.Which);
        }
        public void KeyRawDown(int[] data)
        {
            if (data == null || data.Length == 0) return;
            foreach (var item in data)
                keyboardAccess.DoScanCodeDown(item);
        }

        public void KeyRawUp(int[] data, bool withBreak)
        {
            if (data == null || data.Length == 0) return;
            foreach (var item in data)
                keyboardAccess.DoScanCodeUp(item, withBreak);
        }

        public void RunProgram()
        {
            keyboardAccess.PressText("run\r\n");
        }
        public ComputerSetupSettings GetSetupSettings()
        {
            return computerSetupSettings;
        }
        public IComputerMemoryAccess GetMemory()
        {
            return computerAccess.Memory;
        }
        public ProcessorDataModel GetProcessorData()
        {
            return processorData.ToModel();
        }
        public ProcessorStackModel GetStack()
        {
            return computerAccess.Memory.ReadStack(0xff);
        }
        public IDebugger GetDebugger()
        {
            return debugger;
        }
        public void LoadProgram(byte[] data)
        {
            computerAccess.LoadProgramInPc(data);
        }
        public void SetStartFolder(string folderName)
        {
            programAccess.SetStartFolder(folderName);
        }
        public MemoryBlock GetMemoryBlock(int startAddress, int count)
        {
            var data = computerAccess.Memory.ReadBlock(startAddress, count);
            return new MemoryBlock
            {
                StartAddress = startAddress,
                Count = count,
                Data = data
            };
        }
        public IKeyboardAccess GetKeyboard()
        {
            return keyboardAccess;
        }
        public void SetDisplay(IComputerDisplay display)
        {
            this.display = display;
            videoAccess.SetDisplay(display);
        }
        public MemoryDumpData[] VideoMemoryDump()
        {
            return videoAccess.MemoryDump();
        }
        public void WriteVideoMemoryBlock(int startAddress, byte[] data, int count)
        {
            videoAccess.WriteBlock(startAddress,data,count);
        }
        public void WriteMemoryBlock(int startAddress, byte[] data, int count)
        {
            computerAccess.Memory.WriteBlock(startAddress,data,count);
        }
        public void SetWriteAudioMethod(Action<int, int> writeAudio)
        {
            if (!SoundEnabled) return;
            computerAccess.Memory.SetWriteAudioMethod(writeAudio);
        }
        public List<MemoryDumpData> GetLoadedMemoryBlocks()
        {
            return programAccess.GetLoadedMemoryBlocks();
        }

        public void MouseButtonDown(int index) { ps2.MouseButtonDown(index); }
        public void MouseButtonUp(int index) { ps2.MouseButtonUp(index); }
        public void MouseMove(int x, int y) { ps2.MouseMove(x, y);}

        public void Dispose()
        {
            if (isDisposed) return;
            isDisposed = true;
            videoProcessor?.Dispose();
            display?.CloseDisplay();

            foreach (var usedService in _usedServices)
                container.Delete(usedService);
        }

       
    }
}