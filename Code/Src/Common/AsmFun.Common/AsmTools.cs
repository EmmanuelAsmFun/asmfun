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
    }
}
