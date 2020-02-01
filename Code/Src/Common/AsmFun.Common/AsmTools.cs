using System;
using System.IO;
using System.Runtime.InteropServices;

namespace AsmFun.Common
{
    public class AsmTools
    
    {

        public static void DumpMemory(IntPtr ptr,int length, string filename = @"c:\temp\memoryDump.bin")
        {
            var data = new byte[length];
            Marshal.Copy(ptr, data, 0, length);
            DumpMemory(data, filename);
        }
        public static void DumpMemory(byte[] data, string filename = @"c:\temp\memoryDump.bin")
        {
            if (string.IsNullOrWhiteSpace(filename))
                filename = "file.bin";
            if (File.Exists(filename))
                File.Delete(filename);
            File.WriteAllBytes(filename, data);
        }

        public static byte[] StringToByteArray(string hex)
        {
            if (hex.Length % 2 == 1)
                throw new Exception("The binary key cannot have an odd number of digits");

            byte[] arr = new byte[hex.Length >> 1];

            for (int i = 0; i < hex.Length >> 1; ++i)
            {
                arr[i] = (byte)((GetHexVal(hex[i << 1]) << 4) + (GetHexVal(hex[(i << 1) + 1])));
            }

            return arr;
        }

        public static int GetHexVal(char hex)
        {
            int val = (int)hex;
            //For uppercase A-F letters:
            return val - (val < 58 ? 48 : 55);
            //For lowercase a-f letters:
            //return val - (val < 58 ? 48 : 87);
            //Or the two combined, but a bit slower:
            //return val - (val < 58 ? 48 : (val < 97 ? 55 : 87));
        }
    }
}
