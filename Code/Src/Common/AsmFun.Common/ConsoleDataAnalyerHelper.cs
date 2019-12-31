#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using System.Runtime.InteropServices;
using System.Text;

namespace AsmFun.Core.Tools
{
    public class ConsoleDataAnalyerHelper
    {
        public static void Dump(IntPtr data, int start, int length)
        {
            //for (int i = 0; i < 256; i++)
            //{
            //    Console.Write(" " + i + "=" + ((char)(i)));
            //    if ((i + 1) % 8 == 0)
            //        Console.WriteLine(" ");
            //}
            var buff = new byte[length + start];
            var lineBuff = new byte[16];
            var lineBuffPos = 0;
            Marshal.Copy(data, buff, 0, length + start);
            Console.WriteLine();
            Console.WriteLine();
            WriteLineGreen("Dump:" + start.ToString("X4") + $"({start}) length={length}");
            WriteGreen((start).ToString("X4") + $"({start}) ");
            for (int i = 0; i < buff.Length - start; i++)
            {
                byte byteItem = buff[i + start];

                Console.Write(byteItem.ToString("X2") + " ");
                if ((i + 1) % 8 == 0)
                    Console.Write(" ");
                if ((i + 1) % 16 == 0)
                {
                    Console.WriteLine(" " + BytesToString(lineBuff) + " ");
                    if ((i + 1) % 128 == 0)
                        WriteLineGreen("         --- " + (i + 1) + " ---");
                    WriteGreen((i + start).ToString("X4") + $"({ i + start}) ");
                    lineBuff = new byte[16];
                    lineBuffPos = 0;
                }
                else
                    lineBuff[lineBuffPos] = byteItem;

                lineBuffPos++;
            }
        }
        private static void WriteLineGreen(string data)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine(data);
            Console.ForegroundColor = ConsoleColor.Gray;
        }
        private static void WriteGreen(string data)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.Write(data);
            Console.ForegroundColor = ConsoleColor.Gray;
        }

        private static string BytesToString(byte[] datas)
        {
            var sb = new StringBuilder();
            for (int i = 0; i < datas.Length; i++)
            {
                byte item = datas[i];
                if (item < 32 )
                    sb.Append(".");
                else
                    sb.Append((char)item);
            }
            return sb.ToString();
        }
       

    }
}
