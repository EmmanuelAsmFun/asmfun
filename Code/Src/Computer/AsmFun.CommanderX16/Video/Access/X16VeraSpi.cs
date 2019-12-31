#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Core.Tools;
using AsmFun.Computer.Common.Video;
using System;
using System.Threading;

namespace AsmFun.CommanderX16.Video.Access
{
    public class X16VeraSpi : IMemoryAccessable
    {
        

        private bool ss;
        private bool isBusy;
        private byte sendByte;
        private byte receivedByte;
        private int outCounter;

        public string Name => "VeraSPI";

        public X16VeraSpi()
        {
            //InitThread();
        }

        public void Init()
        {

        }
        public void Reset()
        {
            ss = false;
            isBusy = false;
            receivedByte = 0xff;
        }

        //Thread thread;
        //AutoResetEvent are = new AutoResetEvent(false);
        //private bool isRunning;
        //private void InitThread()
        //{
        //    thread = new Thread(Run);
        //    thread.IsBackground = true;
        //}

//        private void Run()
//        {
//            while(isRunning)
//            {
//                Step2();
//                Thread.Sleep(5);
//                //are.WaitOne();
//            }
//        }
//        public void Step()
//        {
//            if (!isRunning)
//            {
//                isRunning = true;
//                thread.Start();
//            }
////            are.Set();
//        }


        public void Step()
        {
            if (!isBusy)  return;
            outCounter++;
            if (outCounter != 8)  return;
            isBusy = false;
            //if (sdCard.file != null)
            //    receivedByte = sdCard.Handle(sendByte);
            //else
                receivedByte = 0xff;
        }

        public byte Read(uint reg)
        {
            switch (reg)
            {
                case 0:
                    return receivedByte;
                case 1:
                    var num = (byte)(isBusy ? 1 << 7 : 0);
                    var ssNum = ss ? 1 : 0;
                    return Convert.ToByte(num | ssNum);
                    //return busy << 7 | ss;
            }
            return 0;
        }

        public void Write(uint adddress, byte value)
        {
            switch (adddress)
            {
                case 0:
                    if (ss && !isBusy)
                    {
                        sendByte = value;
                        isBusy = true;
                        outCounter = 0;
                    }
                    break;
                case 1:
                    var test2 = AsmByteTools.IsBitSet((byte)(value & 1), 0);
                    if (ss != test2 && (value & 1) != 0)
                    {
                        ss = (value & 1) != 0;
                        //if (ss)
                            //sdCard.Select();
                    }
                    break;
            }
        }

        public byte[] ReadBlock(uint address, int length)
        {
            var byte1 = Read((byte)(address & 1));
            var retData = new byte[length];
            retData[0] = byte1;
            return retData;
        }

        public void WriteBlock(byte[] bytes, int sourceIndex, int targetIndex, int length)
        {
            throw new NotImplementedException();
        }

        public void MemoryDump(byte[] data, int startInsertAddress)
        {
            
        }

        public byte[] MemoryDump(int startAddress)
        {
            return new byte[2] { receivedByte, Read(1)};
        }
    }
}
